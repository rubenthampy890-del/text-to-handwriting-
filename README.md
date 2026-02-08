# Text to Handwriting

Convert typed text into realistic handwritten page images with custom handwriting upload support.

## Features

- ✨ **Text-to-Handwriting Conversion**: Transform typed text into handwritten pages
- 📝 **Custom Handwriting Upload**: Use your own handwriting style
- 🎨 **Dark Mode UI**: Modern, premium design
- 📄 **A4 Ruled Paper**: Fixed ruled paper background with blue lines
- 🖊️ **Blue Ink**: Realistic blue ink color
- ⬇️ **PNG Download**: Download generated images
- 🚀 **Fast Generation**: Instant client-side rendering
- 💾 **No Data Storage**: Everything processed in-memory

## Installation

### Prerequisites

- Node.js v16 or higher
- npm or yarn

### Setup

1. **Clone or navigate to the project directory**:
   ```bash
   cd /Users/text-handwriting 
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the server**:
   ```bash
   npm start
   ```

4. **Open in browser**:
   Navigate to `http://localhost:3000`

## Usage

### Basic Text Conversion

1. Open the application in your browser
2. Type or paste text in the input area
3. Click "Generate Image"
4. Download the generated handwritten image as PNG

### Custom Handwriting Upload

1. Click "Upload Your Own" to expand the upload section
2. Follow the instructions to prepare your handwriting sample:
   - Write the alphabet (A-Z, a-z), numbers (0-9), and punctuation on lined paper
   - Take a clear, well-lit photo or scan
3. Drag & drop or browse to upload your image (max 10MB)
4. Select your uploaded handwriting from the dropdown
5. Generate text with your custom handwriting style

### Keyboard Shortcuts

- `Cmd/Ctrl + Enter`: Generate image from text input

## API Endpoints

### POST `/api/upload-handwriting`

Upload a handwriting image.

**Request**: Multipart form data with `handwriting` file field

**Response**:
```json
{
  "success": true,
  "message": "Handwriting uploaded successfully",
  "data": {
    "id": "handwriting-12345-67890",
    "originalPath": "/uploads/handwriting-12345-67890.jpg",
    "processedPath": "/uploads/processed-handwriting-12345-67890.jpg",
    "filename": "handwriting-12345-67890.jpg",
    "uploadedAt": "2026-01-09T13:00:00.000Z",
    "size": 1234567,
    "width": 2480,
    "height": 3508
  }
}
```

### GET `/api/handwritings`

Get all uploaded handwriting samples.

**Response**:
```json
{
  "success": true,
  "data": [...]
}
```

### DELETE `/api/handwriting/:id`

Delete a handwriting sample.

**Response**:
```json
{
  "success": true,
  "message": "Handwriting deleted successfully"
}
```

### GET `/api/health`

Health check endpoint.

**Response**:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-01-09T13:00:00.000Z"
}
```

## Project Structure

```
text-handwriting/
├── index.html          # Frontend HTML
├── styles.css          # CSS styles
├── script.js           # Frontend JavaScript
├── server.js           # Node.js Express server
├── package.json        # Node.js dependencies
├── uploads/            # Uploaded handwriting images (auto-created)
└── README.md           # This file
```

## Technical Details

### Frontend

- **Pure HTML/CSS/JavaScript**: No frameworks
- **Canvas API**: For rendering text and images
- **Responsive Design**: Works on mobile and desktop
- **File Upload**: Drag-and-drop and browse support

### Backend

- **Express**: Web server
- **Multer**: File upload handling
- **Sharp**: Image processing and optimization
- **CORS**: Cross-origin resource sharing

### Canvas Rendering

- **A4 Dimensions**: 1240px × 1754px (150 DPI)
- **Ruled Lines**: 35px spacing
- **Margins**: 100px left/right, 80px top/bottom
- **Font**: Kalam (Google Fonts) or custom handwriting texture

## Configuration

### Server Port

Default port is `3000`. To change:

```bash
PORT=8080 npm start
```

### Upload Limits

Max file size: 10MB (configurable in `server.js`)

Allowed formats: JPEG, PNG, GIF, WebP

## Troubleshooting

### Server won't start

- Check if port 3000 is already in use
- Ensure Node.js v16+ is installed
- Run `npm install` again

### Upload fails

- Check file size (max 10MB)
- Ensure file is a valid image format
- Check browser console for errors

### Custom handwriting doesn't render

- Verify handwriting was uploaded successfully
- Check that handwriting is selected in the dropdown
- Refresh the page and try again

## Development

### Running in Development Mode

```bash
npm run dev
```

### Project Dependencies

- `express`: ^4.18.2
- `multer`: ^1.4.5-lts.1
- `sharp`: ^0.33.0
- `cors`: ^2.8.5

## License

MIT

## Support

For issues or questions, please create an issue in the project repository.
