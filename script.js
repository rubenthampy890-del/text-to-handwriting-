// ============================================
// Utility Functions
// ============================================

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ============================================
// Configuration
// ============================================
const CONFIG = {
    canvas: {
        width: 1240,
        height: 1754
    },
    paper: {
        backgroundColor: '#ffffff',
        lineColor: '#94c5e8',
        lineWidth: 1,
        lineSpacing: 35,
        marginTop: 80,
        marginBottom: 80,
        marginLeft: 100,
        marginRight: 100
    },
    text: {
        fontFamily: 'Kalam',
        fontSize: 28,
        color: '#2563eb',
        lineHeight: 35,
        maxWidth: 1040
    }
};

// ============================================
// DOM Elements
// ============================================
const elements = {
    // Main elements
    canvas: document.getElementById('canvas'),
    textInput: document.getElementById('textInput'),
    downloadBtn: document.getElementById('downloadBtn'),
    downloadPdfBtn: document.getElementById('downloadPdfBtn'),

    // Pagination
    prevPageBtn: document.getElementById('prevPageBtn'),
    nextPageBtn: document.getElementById('nextPageBtn'),
    pageIndicator: document.getElementById('pageIndicator'),

    // Assignment Tools
    impositionToggle: document.getElementById('impositionToggle'),
    impositionCount: document.getElementById('impositionCount'),
    scannerEffect: document.getElementById('scannerEffect'),

    // Font & Text controls
    fontSelect: document.getElementById('fontSelect'),
    fontSizeSlider: document.getElementById('fontSizeSlider'),
    fontSizeValue: document.getElementById('fontSizeValue'),
    inkColorSelect: document.getElementById('inkColorSelect'),
    customInkColor: document.getElementById('customInkColor'),
    shadowEffect: document.getElementById('shadowEffect'),
    randomnessEffect: document.getElementById('randomnessEffect'),

    // Spacing controls
    verticalPosSlider: document.getElementById('verticalPosSlider'),
    verticalPosValue: document.getElementById('verticalPosValue'),
    wordSpacingSlider: document.getElementById('wordSpacingSlider'),
    wordSpacingValue: document.getElementById('wordSpacingValue'),
    letterSpacingSlider: document.getElementById('letterSpacingSlider'),
    letterSpacingValue: document.getElementById('letterSpacingValue'),
    lineSpacingSlider: document.getElementById('lineSpacingSlider'),
    lineSpacingValue: document.getElementById('lineSpacingValue'),

    // Page & Margins
    pageSizeSelect: document.getElementById('pageSizeSelect'),
    marginTop: document.getElementById('marginTop'),
    marginRight: document.getElementById('marginRight'),
    marginBottom: document.getElementById('marginBottom'),
    marginLeft: document.getElementById('marginLeft'),
    paperLinesToggle: document.getElementById('paperLinesToggle'),
    lineColorInput: document.getElementById('lineColorInput'),

    // Advanced / Legacy
    resetSettingsBtn: document.getElementById('resetSettingsBtn'),
    resolutionSelect: document.getElementById('resolutionSelect'),

    // File Inputs (Hidden but functional via JS)
    fileInput: document.getElementById('fileInput'),
    paperBackgroundInput: document.getElementById('paperBackgroundInput'),
    uploadHandwritingBtn: document.getElementById('uploadHandwritingBtn'),
    uploadPaperBtn: document.getElementById('uploadPaperBtn'),
    resetPaperBtn: document.getElementById('resetPaperBtn')
};

// ============================================
// State
// ============================================
const state = {
    customPaperBackground: null,
    textPages: [], // Array of page content strings
    currentPage: 0,
    settings: {
        fontFamily: 'Kalam',
        fontSize: 28,
        inkColor: '#2563eb',
        pageSize: 'a4',
        resolution: 150,
        shadowEffect: false,
        randomnessEffect: false,
        scannerEffect: false,
        verticalPosition: 0,
        wordSpacing: 0,
        letterSpacing: 0,
        marginTop: 80,
        marginRight: 100,
        marginBottom: 80,
        marginLeft: 100,
        showLines: true,
        lineSpacing: 35,
        lineColor: '#94c5e8',
        impositionEnabled: false,
        impositionCount: 10
    }
};

// ============================================
// Canvas Setup
// ============================================
const ctx = elements.canvas.getContext('2d');
elements.canvas.width = CONFIG.canvas.width;
elements.canvas.height = CONFIG.canvas.height;

// ============================================
// Logic
// ============================================

function updateConfig() {
    const pageSizes = {
        'a4': { width: 210, height: 297 },
        'letter': { width: 215.9, height: 279.4 },
        'legal': { width: 215.9, height: 355.6 }
    };

    const size = pageSizes[state.settings.pageSize];
    const dpi = state.settings.resolution;
    const mmToInch = 0.0393701;

    CONFIG.canvas.width = Math.round(size.width * mmToInch * dpi);
    CONFIG.canvas.height = Math.round(size.height * mmToInch * dpi);
    elements.canvas.width = CONFIG.canvas.width;
    elements.canvas.height = CONFIG.canvas.height;

    CONFIG.paper.marginTop = parseInt(state.settings.marginTop);
    CONFIG.paper.marginBottom = parseInt(state.settings.marginBottom);
    CONFIG.paper.marginLeft = parseInt(state.settings.marginLeft);
    CONFIG.paper.marginRight = parseInt(state.settings.marginRight);
    CONFIG.paper.lineSpacing = parseInt(state.settings.lineSpacing);
    CONFIG.paper.lineColor = state.settings.lineColor;

    CONFIG.text.fontFamily = state.settings.fontFamily;
    CONFIG.text.fontSize = parseInt(state.settings.fontSize);
    CONFIG.text.color = state.settings.inkColor;
    CONFIG.text.lineHeight = parseInt(state.settings.lineSpacing);
    CONFIG.text.maxWidth = CONFIG.canvas.width - CONFIG.paper.marginLeft - CONFIG.paper.marginRight;
}

function processText(text) {
    // Imposition Logic
    if (state.settings.impositionEnabled && text.trim()) {
        const repeatText = text.trim() + '\n';
        return repeatText.repeat(state.settings.impositionCount);
    }
    return text;
}

function calculatePagination(text) {
    if (!text) {
        state.textPages = [''];
        state.currentPage = 0;
        return;
    }

    ctx.font = `${CONFIG.text.fontSize}px ${CONFIG.text.fontFamily}`;

    const lines = [];
    const paragraphs = text.split('\n');

    // Word Wrap Logic
    for (const paragraph of paragraphs) {
        if (!paragraph) lines.push(''); // Empty line

        const words = paragraph.split(' ');
        let currentLine = '';

        for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const metrics = ctx.measureText(testLine);

            if (metrics.width > CONFIG.text.maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }
        if (currentLine) lines.push(currentLine);
    }

    // Pagination Logic
    state.textPages = [];
    let currentPageLines = [];

    // Calculate usable height
    const startY = CONFIG.paper.marginTop + state.settings.verticalPosition;
    const endY = CONFIG.canvas.height - CONFIG.paper.marginBottom;
    const lineHeight = CONFIG.text.lineHeight;
    const maxLinesPerPage = Math.floor((endY - startY) / lineHeight);

    for (let i = 0; i < lines.length; i++) {
        currentPageLines.push(lines[i]);

        // If page is full
        if (currentPageLines.length >= maxLinesPerPage) {
            state.textPages.push(currentPageLines);
            currentPageLines = [];
        }
    }

    if (currentPageLines.length > 0) {
        state.textPages.push(currentPageLines);
    }

    // Update UI controls
    updatePaginationUI();
}

function updatePaginationUI() {
    const total = state.textPages.length;
    const current = state.currentPage + 1;

    elements.pageIndicator.textContent = `Page ${current} of ${total}`;

    elements.prevPageBtn.disabled = state.currentPage === 0;
    elements.nextPageBtn.disabled = state.currentPage === total - 1;
}

function drawRuledPaper() {
    if (state.customPaperBackground) {
        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, 0, 0, CONFIG.canvas.width, CONFIG.canvas.height);
            drawRuledLines();
            renderContent(); // Callback hell avoidance (simple)
        };
        img.src = state.customPaperBackground;
        return true; // async mode
    }

    ctx.fillStyle = CONFIG.paper.backgroundColor;
    ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);
    drawRuledLines();
    return false; // sync mode
}

function drawRuledLines() {
    if (!state.settings.showLines) return;

    ctx.strokeStyle = CONFIG.paper.lineColor;
    ctx.lineWidth = CONFIG.paper.lineWidth;

    const startY = CONFIG.paper.marginTop;
    const endY = CONFIG.canvas.height - CONFIG.paper.marginBottom;
    const startX = CONFIG.paper.marginLeft;
    const endX = CONFIG.canvas.width - CONFIG.paper.marginRight;

    for (let y = startY; y <= endY; y += CONFIG.paper.lineSpacing) {
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
        ctx.stroke();
    }
}

function applyScannerEffect() {
    if (!state.settings.scannerEffect) return;

    // 1. Add subtle noise/grain
    const imageData = ctx.getImageData(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 10; // +/- 5
        data[i] += noise;     // R
        data[i + 1] += noise;   // G
        data[i + 2] += noise;   // B
    }
    ctx.putImageData(imageData, 0, 0);

    // 2. Add subtle shadow gradient overlay (simulating bad lighting/scan)
    const gradient = ctx.createLinearGradient(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);
    gradient.addColorStop(0, "rgba(0,0,0,0.02)");
    gradient.addColorStop(0.5, "rgba(0,0,0,0)");
    gradient.addColorStop(1, "rgba(0,0,0,0.03)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);
}

function renderContent() {
    const lines = state.textPages[state.currentPage] || [];

    ctx.font = `${CONFIG.text.fontSize}px ${CONFIG.text.fontFamily}`;
    ctx.fillStyle = CONFIG.text.color;
    ctx.textBaseline = 'alphabetic';

    if (state.settings.shadowEffect) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)'; // Darker for realism
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 2; // Offset for pen depth
        ctx.shadowOffsetY = 2;
    }

    let x = CONFIG.paper.marginLeft;
    // Align text to ruled lines
    // Normally text sits on baseline. We adjust startY to match the ruled line Y pos.
    // Vertical position slider is an offset.
    let y = CONFIG.paper.marginTop + parseInt(state.settings.lineSpacing) - 5 + state.settings.verticalPosition;

    for (let line of lines) {
        if (line) {
            let currentX = x;

            // Randomize X starting position slightly per line for realism
            if (state.settings.randomnessEffect) {
                currentX += (Math.random() - 0.5) * 4;
            }

            if (state.settings.wordSpacing !== 0) {
                const words = line.split(' ');
                words.forEach(word => {
                    const wordY = y + (state.settings.randomnessEffect ? (Math.random() - 0.5) * 2 : 0);
                    ctx.fillText(word, currentX, wordY);
                    currentX += ctx.measureText(word).width + ctx.measureText(' ').width + state.settings.wordSpacing;
                });
            } else {
                if (state.settings.letterSpacing !== 0) {
                    ctx.letterSpacing = state.settings.letterSpacing + 'px';
                }

                if (state.settings.randomnessEffect) {
                    // Per-letter variation (highly realistic)
                    const letters = line.split('');
                    letters.forEach(char => {
                        const charY = y + (Math.random() - 0.5) * 3; // Baseline jitter
                        const charX = currentX + (Math.random() - 0.5) * 1; // Kerning jitter
                        ctx.fillText(char, charX, charY);
                        currentX += ctx.measureText(char).width + state.settings.letterSpacing;
                    });
                } else {
                    ctx.fillText(line, currentX, y);
                }
                ctx.letterSpacing = '0px';
            }
        }
        y += CONFIG.text.lineHeight;
    }

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    applyScannerEffect();
}

function generateImage(recalculatePages = false) {
    const rawText = elements.textInput.value;
    const processedText = processText(rawText);

    if (recalculatePages) {
        calculatePagination(processedText);
    }

    const isAsync = drawRuledPaper();
    if (!isAsync) {
        renderContent();
    }
}

// ============================================
// PDF Export Logic
// ============================================
async function generatePDF() {
    const { jsPDF } = window.jspdf;

    // Create new PDF (A4/Letter depending on settings)
    const format = state.settings.pageSize === 'legal' ? 'legal' :
        state.settings.pageSize === 'letter' ? 'letter' : 'a4';

    const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: format
    });

    const originalPage = state.currentPage; // Save current page

    // Loop through all pages
    const totalPages = state.textPages.length;
    const btnText = elements.downloadPdfBtn.textContent;
    elements.downloadPdfBtn.textContent = `Generating... (0/${totalPages})`;
    elements.downloadPdfBtn.disabled = true;

    for (let i = 0; i < totalPages; i++) {
        state.currentPage = i;

        // Force synchronous render (or await async)
        // For simplicity we assume synchronous ruled paper rendering unless custom BG
        // If custom BG, we need to wait for image load (but here it's arguably cached)

        ctx.clearRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);

        // Draw logic duplicated to ensure sync execution if possible or simple delay
        drawRuledPaper();

        // Wait small tick for image draw if async (hacky but effective for simple app)
        await new Promise(r => setTimeout(r, 100));
        renderContent();

        const imgData = elements.canvas.toDataURL('image/jpeg', 0.85); // JPEG for smaller PDF size

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

        if (i < totalPages - 1) {
            pdf.addPage();
        }

        elements.downloadPdfBtn.textContent = `Generating... (${i + 1}/${totalPages})`;
    }

    pdf.save('assignment.pdf');

    // Restore
    state.currentPage = originalPage;
    elements.downloadPdfBtn.textContent = btnText;
    elements.downloadPdfBtn.disabled = false;

    generateImage(false); // Redraw interface
}

// ============================================
// Event Listeners
// ============================================

const debouncedGenerate = debounce(() => generateImage(false), 300);
const debouncedTextGenerate = debounce(() => generateImage(true), 500);

// Text & Imposition
elements.textInput.addEventListener('input', debouncedTextGenerate);

elements.impositionToggle.addEventListener('change', (e) => {
    state.settings.impositionEnabled = e.target.checked;
    elements.impositionCount.disabled = !e.target.checked;
    generateImage(true);
});

elements.impositionCount.addEventListener('input', (e) => {
    state.settings.impositionCount = parseInt(e.target.value) || 1;
    generateImage(true);
});

// Effects
elements.scannerEffect.addEventListener('change', (e) => {
    state.settings.scannerEffect = e.target.checked;
    generateImage(false);
});

// Pagination
elements.prevPageBtn.addEventListener('click', () => {
    if (state.currentPage > 0) {
        state.currentPage--;
        updatePaginationUI();
        generateImage(false);
    }
});

elements.nextPageBtn.addEventListener('click', () => {
    if (state.currentPage < state.textPages.length - 1) {
        state.currentPage++;
        updatePaginationUI();
        generateImage(false);
    }
});

elements.downloadPdfBtn.addEventListener('click', generatePDF);

// Common Settings
elements.fontSelect.addEventListener('change', (e) => {
    state.settings.fontFamily = e.target.value;
    updateConfig();
    generateImage(true); // Font size chg requires repagination
});

elements.fontSizeSlider.addEventListener('input', (e) => {
    state.settings.fontSize = parseInt(e.target.value);
    elements.fontSizeValue.textContent = e.target.value;
    updateConfig();
    generateImage(true); // Size chg requires repagination
});

[elements.verticalPosSlider, elements.wordSpacingSlider, elements.letterSpacingSlider].forEach(el => {
    el.addEventListener('input', (e) => {
        // Just redraw, no repagination needed for spacing usually (except word spacing if word wrap changes? Yes)
        // Safest is repaginate
        const id = e.target.id;
        state.settings[id.replace('Slider', '')] = parseFloat(e.target.value);
        document.getElementById(id.replace('Slider', 'Value')).textContent = e.target.value;
        generateImage(id !== 'verticalPosSlider'); // Repaginate if spacing changes width
    });
});

[elements.inkColorSelect, elements.customInkColor, elements.shadowEffect, elements.randomnessEffect].forEach(el => {
    el?.addEventListener(el.type === 'checkbox' ? 'change' : 'input', (e) => {
        state.settings[el.id.replace('Select', '').replace('Input', '')] = el.type === 'checkbox' ? e.target.checked : e.target.value;
        generateImage(false);
    });
});

// Margins
[elements.marginTop, elements.marginRight, elements.marginBottom, elements.marginLeft].forEach(input => {
    input.addEventListener('change', (e) => {
        const field = e.target.id.replace('margin', '').toLowerCase();
        state.settings[`margin${field.charAt(0).toUpperCase() + field.slice(1)}`] = parseInt(e.target.value);
        updateConfig();
        generateImage(true); // Margins change page size
    });
});

// Initialize
updateConfig();
generateImage(true);
console.log('Phase 5 Features Loaded');
