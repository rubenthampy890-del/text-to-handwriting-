const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const sharp = require('sharp');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve static files (HTML, CSS, JS)

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'handwriting-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Accept images only
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WebP)'));
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max file size
    }
});

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// ============================================
// API Routes
// ============================================

/**
 * Upload handwriting image
 */
app.post('/api/upload-handwriting', upload.single('handwriting'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }

        const filePath = req.file.path;
        const processedPath = path.join(uploadsDir, 'processed-' + req.file.filename);

        // Process the image: resize, enhance, normalize
        await sharp(filePath)
            .resize(2480, 3508, { // A4 at 300 DPI
                fit: 'inside',
                withoutEnlargement: true
            })
            .normalize() // Enhance contrast
            .toFile(processedPath);

        // Extract metadata
        const metadata = await sharp(processedPath).metadata();

        // Create handwriting data object
        const handwritingData = {
            id: req.file.filename.replace(path.extname(req.file.filename), ''),
            originalPath: `/uploads/${req.file.filename}`,
            processedPath: `/uploads/processed-${req.file.filename}`,
            filename: req.file.filename,
            uploadedAt: new Date().toISOString(),
            size: req.file.size,
            width: metadata.width,
            height: metadata.height
        };

        // Save metadata to a JSON file
        const metadataPath = path.join(uploadsDir, handwritingData.id + '.json');
        fs.writeFileSync(metadataPath, JSON.stringify(handwritingData, null, 2));

        res.json({
            success: true,
            message: 'Handwriting uploaded successfully',
            data: handwritingData
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to process handwriting image'
        });
    }
});

/**
 * Get all uploaded handwriting samples
 */
app.get('/api/handwritings', (req, res) => {
    try {
        const files = fs.readdirSync(uploadsDir);
        const handwritings = [];

        files.forEach(file => {
            if (file.endsWith('.json')) {
                const filePath = path.join(uploadsDir, file);
                const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                handwritings.push(data);
            }
        });

        // Sort by upload date (newest first)
        handwritings.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

        res.json({
            success: true,
            data: handwritings
        });

    } catch (error) {
        console.error('Error fetching handwritings:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch handwritings'
        });
    }
});

/**
 * Delete a handwriting sample
 */
app.delete('/api/handwriting/:id', (req, res) => {
    try {
        const { id } = req.params;
        const metadataPath = path.join(uploadsDir, id + '.json');

        if (!fs.existsSync(metadataPath)) {
            return res.status(404).json({
                success: false,
                error: 'Handwriting not found'
            });
        }

        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));

        // Delete original file
        const originalPath = path.join(uploadsDir, metadata.filename);
        if (fs.existsSync(originalPath)) {
            fs.unlinkSync(originalPath);
        }

        // Delete processed file
        const processedFilename = 'processed-' + metadata.filename;
        const processedPath = path.join(uploadsDir, processedFilename);
        if (fs.existsSync(processedPath)) {
            fs.unlinkSync(processedPath);
        }

        // Delete metadata file
        fs.unlinkSync(metadataPath);

        res.json({
            success: true,
            message: 'Handwriting deleted successfully'
        });

    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete handwriting'
        });
    }
});

/**
 * Health check
 */
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

/**
 * Extract text from document (PDF, DOCX, TXT)
 */
const documentUpload = multer({
    dest: path.join(__dirname, 'temp'),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max
    }
});

app.post('/api/extract-text', documentUpload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }

        const filePath = req.file.path;
        const ext = path.extname(req.file.originalname).toLowerCase();
        let extractedText = '';

        try {
            if (ext === '.pdf') {
                // Extract text from PDF
                const dataBuffer = fs.readFileSync(filePath);
                const pdfData = await pdfParse(dataBuffer);
                extractedText = pdfData.text;

            } else if (ext === '.docx' || ext === '.doc') {
                // Extract text from DOCX
                const result = await mammoth.extractRawText({ path: filePath });
                extractedText = result.value;

            } else if (ext === '.txt') {
                // Read plain text file
                extractedText = fs.readFileSync(filePath, 'utf-8');

            } else {
                throw new Error('Unsupported file type. Please upload PDF, DOCX, or TXT.');
            }

            // Clean up extracted text
            extractedText = extractedText
                .replace(/\r\n/g, '\n') // Normalize line endings
                .replace(/\n{3,}/g, '\n\n') // Remove excessive line breaks
                .trim();

            // Delete temporary file
            fs.unlinkSync(filePath);

            res.json({
                success: true,
                text: extractedText,
                filename: req.file.originalname
            });

        } catch (parseError) {
            // Delete temporary file on error
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            throw parseError;
        }

    } catch (error) {
        console.error('Text extraction error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to extract text from document'
        });
    }
});

// ============================================
// Error Handling
// ============================================

// Handle multer errors
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: 'File size too large. Maximum size is 10MB.'
            });
        }
    }

    res.status(500).json({
        success: false,
        error: error.message || 'Internal server error'
    });
});

// ============================================
// Start Server
// ============================================

app.listen(PORT, () => {
    console.log('================================================');
    console.log('  Text to Handwriting Server');
    console.log('================================================');
    console.log(`  Server running on: http://localhost:${PORT}`);
    console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('================================================');
    console.log('');
    console.log('  API Endpoints:');
    console.log(`    POST   /api/upload-handwriting`);
    console.log(`    GET    /api/handwritings`);
    console.log(`    DELETE /api/handwriting/:id`);
    console.log(`    POST   /api/extract-text`);
    console.log(`    GET    /api/health`);
    console.log('');
    console.log('  Open http://localhost:' + PORT + ' in your browser');
    console.log('================================================');
});
