// ============================================
// Utility Functions
// ============================================

/**
 * Debounce function to limit how often a function can run
 */
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

    // Advanced
    handwritingSelect: document.getElementById('handwritingSelect'),
    resolutionSelect: document.getElementById('resolutionSelect'),
    uploadHandwritingBtn: document.getElementById('uploadHandwritingBtn'),
    fileInput: document.getElementById('fileInput'),
    uploadDocumentBtn: document.getElementById('uploadDocumentBtn'),
    documentInput: document.getElementById('documentInput'),
    uploadPaperBtn: document.getElementById('uploadPaperBtn'),
    paperBackgroundInput: document.getElementById('paperBackgroundInput'),
    resetPaperBtn: document.getElementById('resetPaperBtn'),
    resetSettingsBtn: document.getElementById('resetSettingsBtn')
};

// ============================================
// State
// ============================================
const state = {
    uploadedHandwritings: [],
    selectedHandwriting: null,
    customPaperBackground: null,
    settings: {
        fontFamily: 'Kalam',
        fontSize: 28,
        inkColor: '#2563eb',
        pageSize: 'a4',
        resolution: 150,
        shadowEffect: false,
        randomnessEffect: false,
        verticalPosition: 0,
        wordSpacing: 0,
        letterSpacing: 0,
        marginTop: 80,
        marginRight: 100,
        marginBottom: 80,
        marginLeft: 100,
        showLines: true,
        lineSpacing: 35,
        lineColor: '#94c5e8'
    }
};

// ============================================
// Canvas Setup
// ============================================
const ctx = elements.canvas.getContext('2d');
elements.canvas.width = CONFIG.canvas.width;
elements.canvas.height = CONFIG.canvas.height;

// ============================================
// Helper Functions
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

function saveSettings() {
    localStorage.setItem('handwritingSettings', JSON.stringify(state.settings));
}

function loadSettings() {
    const saved = localStorage.getItem('handwritingSettings');
    if (saved) {
        try {
            Object.assign(state.settings, JSON.parse(saved));
            applySettingsToUI();
        } catch (e) {
            console.error('Failed to load settings:', e);
        }
    }
}

function applySettingsToUI() {
    elements.fontSelect.value = state.settings.fontFamily;
    elements.fontSizeSlider.value = state.settings.fontSize;
    elements.fontSizeValue.textContent = state.settings.fontSize;
    elements.inkColorSelect.value = state.settings.inkColor;
    elements.pageSizeSelect.value = state.settings.pageSize;
    elements.resolutionSelect.value = state.settings.resolution;
    elements.shadowEffect.checked = state.settings.shadowEffect;
    elements.randomnessEffect.checked = state.settings.randomnessEffect;
    elements.verticalPosSlider.value = state.settings.verticalPosition;
    elements.verticalPosValue.textContent = state.settings.verticalPosition;
    elements.wordSpacingSlider.value = state.settings.wordSpacing;
    elements.wordSpacingValue.textContent = state.settings.wordSpacing;
    elements.letterSpacingSlider.value = state.settings.letterSpacing;
    elements.letterSpacingValue.textContent = state.settings.letterSpacing;
    elements.marginTop.value = state.settings.marginTop;
    elements.marginRight.value = state.settings.marginRight;
    elements.marginBottom.value = state.settings.marginBottom;
    elements.marginLeft.value = state.settings.marginLeft;
    elements.paperLinesToggle.checked = state.settings.showLines;
    elements.lineSpacingSlider.value = state.settings.lineSpacing;
    elements.lineSpacingValue.textContent = state.settings.lineSpacing;
    elements.lineColorInput.value = state.settings.lineColor;
}

// ============================================
// Drawing Functions
// ============================================

function drawRuledPaper() {
    if (state.customPaperBackground) {
        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, 0, 0, CONFIG.canvas.width, CONFIG.canvas.height);
            drawRuledLines();
        };
        img.src = state.customPaperBackground;
        return;
    }

    ctx.fillStyle = CONFIG.paper.backgroundColor;
    ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);
    drawRuledLines();
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

function wrapText(text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    ctx.font = `${CONFIG.text.fontSize}px ${CONFIG.text.fontFamily}`;

    for (let word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const metrics = ctx.measureText(testLine);

        if (metrics.width > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    }

    if (currentLine) lines.push(currentLine);
    return lines;
}

function drawHandwrittenText(text) {
    if (!text.trim()) return;

    const paragraphs = text.split('\n');
    let allLines = [];

    for (const paragraph of paragraphs) {
        if (paragraph.trim()) {
            allLines = allLines.concat(wrapText(paragraph, CONFIG.text.maxWidth));
        } else {
            allLines.push('');
        }
    }

    ctx.font = `${CONFIG.text.fontSize}px ${CONFIG.text.fontFamily}`;
    ctx.fillStyle = CONFIG.text.color;
    ctx.textBaseline = 'alphabetic';

    if (state.settings.shadowEffect) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 2;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
    }

    let x = CONFIG.paper.marginLeft;
    let y = CONFIG.paper.marginTop + state.settings.verticalPosition;

    for (let line of allLines) {
        if (y > CONFIG.canvas.height - CONFIG.paper.marginBottom) break;

        if (line) {
            if (state.settings.wordSpacing !== 0) {
                const words = line.split(' ');
                let currentX = x;
                words.forEach(word => {
                    ctx.fillText(word, currentX, y);
                    currentX += ctx.measureText(word).width + ctx.measureText(' ').width + state.settings.wordSpacing;
                });
            } else {
                if (state.settings.letterSpacing !== 0) {
                    ctx.letterSpacing = state.settings.letterSpacing + 'px';
                }
                if (state.settings.randomnessEffect) {
                    const variation = (Math.random() - 0.5) * 2;
                    ctx.fillText(line, x, y + variation);
                } else {
                    ctx.fillText(line, x, y);
                }
                ctx.letterSpacing = '0px';
            }
        }

        y += CONFIG.text.lineHeight;
    }

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
}

function generateImage() {
    const text = elements.textInput.value;

    ctx.clearRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);
    drawRuledPaper();

    if (text.trim()) {
        drawHandwrittenText(text);
    }
}

// ============================================
// Real-Time Preview (Debounced)
// ============================================

const debouncedGenerate = debounce(generateImage, 300);
const debouncedTextGenerate = debounce(generateImage, 500);

// ============================================
// Event Listeners
// ============================================

// Text input - auto-generate on typing
elements.textInput.addEventListener('input', debouncedTextGenerate);

// Font controls
elements.fontSelect.addEventListener('change', (e) => {
    state.settings.fontFamily = e.target.value;
    updateConfig();
    saveSettings();
    debouncedGenerate();
});

elements.fontSizeSlider.addEventListener('input', (e) => {
    state.settings.fontSize = parseInt(e.target.value);
    elements.fontSizeValue.textContent = e.target.value;
    updateConfig();
    saveSettings();
    debouncedGenerate();
});

elements.inkColorSelect.addEventListener('change', (e) => {
    if (e.target.value === 'custom') {
        elements.customInkColor.style.display = 'block';
        state.settings.inkColor = elements.customInkColor.value;
    } else {
        elements.customInkColor.style.display = 'none';
        state.settings.inkColor = e.target.value;
    }
    updateConfig();
    saveSettings();
    debouncedGenerate();
});

elements.customInkColor.addEventListener('input', (e) => {
    state.settings.inkColor = e.target.value;
    updateConfig();
    saveSettings();
    debouncedGenerate();
});

elements.shadowEffect.addEventListener('change', (e) => {
    state.settings.shadowEffect = e.target.checked;
    saveSettings();
    debouncedGenerate();
});

elements.randomnessEffect.addEventListener('change', (e) => {
    state.settings.randomnessEffect = e.target.checked;
    saveSettings();
    debouncedGenerate();
});

// Spacing controls
elements.verticalPosSlider.addEventListener('input', (e) => {
    state.settings.verticalPosition = parseInt(e.target.value);
    elements.verticalPosValue.textContent = e.target.value;
    saveSettings();
    debouncedGenerate();
});

elements.wordSpacingSlider.addEventListener('input', (e) => {
    state.settings.wordSpacing = parseInt(e.target.value);
    elements.wordSpacingValue.textContent = e.target.value;
    saveSettings();
    debouncedGenerate();
});

elements.letterSpacingSlider.addEventListener('input', (e) => {
    state.settings.letterSpacing = parseFloat(e.target.value);
    elements.letterSpacingValue.textContent = e.target.value;
    saveSettings();
    debouncedGenerate();
});

elements.lineSpacingSlider.addEventListener('input', (e) => {
    state.settings.lineSpacing = parseInt(e.target.value);
    elements.lineSpacingValue.textContent = e.target.value;
    updateConfig();
    saveSettings();
    debouncedGenerate();
});

// Page & Margins
elements.pageSizeSelect.addEventListener('change', (e) => {
    state.settings.pageSize = e.target.value;
    updateConfig();
    saveSettings();
    debouncedGenerate();
});

[elements.marginTop, elements.marginRight, elements.marginBottom, elements.marginLeft].forEach(input => {
    input.addEventListener('change', (e) => {
        const field = e.target.id.replace('margin', '').toLowerCase();
        state.settings[`margin${field.charAt(0).toUpperCase() + field.slice(1)}`] = parseInt(e.target.value);
        updateConfig();
        saveSettings();
        debouncedGenerate();
    });
});

elements.paperLinesToggle.addEventListener('change', (e) => {
    state.settings.showLines = e.target.checked;
    saveSettings();
    debouncedGenerate();
});

elements.lineColorInput.addEventListener('input', (e) => {
    state.settings.lineColor = e.target.value;
    updateConfig();
    saveSettings();
    debouncedGenerate();
});

elements.resolutionSelect.addEventListener('change', (e) => {
    state.settings.resolution = parseInt(e.target.value);
    updateConfig();
    saveSettings();
    debouncedGenerate();
});

// Advanced buttons
elements.uploadHandwritingBtn?.addEventListener('click', () => elements.fileInput.click());
elements.uploadDocumentBtn?.addEventListener('click', () => elements.documentInput.click());
elements.uploadPaperBtn?.addEventListener('click', () => elements.paperBackgroundInput.click());

elements.paperBackgroundInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            state.customPaperBackground = e.target.result;
            elements.resetPaperBtn.style.display = 'inline-block';
            debouncedGenerate();
        };
        reader.readAsDataURL(file);
    }
});

elements.resetPaperBtn?.addEventListener('click', () => {
    state.customPaperBackground = null;
    elements.resetPaperBtn.style.display = 'none';
    elements.paperBackgroundInput.value = '';
    debouncedGenerate();
});

elements.resetSettingsBtn?.addEventListener('click', () => {
    if (confirm('Reset all settings to defaults?')) {
        state.settings = {
            fontFamily: 'Kalam',
            fontSize: 28,
            inkColor: '#2563eb',
            pageSize: 'a4',
            resolution: 150,
            shadowEffect: false,
            randomnessEffect: false,
            verticalPosition: 0,
            wordSpacing: 0,
            letterSpacing: 0,
            marginTop: 80,
            marginRight: 100,
            marginBottom: 80,
            marginLeft: 100,
            showLines: true,
            lineSpacing: 35,
            lineColor: '#94c5e8'
        };
        applySettingsToUI();
        updateConfig();
        saveSettings();
        debouncedGenerate();
    }
});

// Download
elements.downloadBtn.addEventListener('click', () => {
    elements.canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `handwritten-${Date.now()}.png`;
        link.href = url;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 100);
    }, 'image/png');
});

// ============================================
// Initialize
// ============================================

loadSettings();
updateConfig();
generateImage(); // Initial generation

console.log('Text to Handwriting app initialized (Real-time preview enabled)');
