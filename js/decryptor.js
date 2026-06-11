/**
 * WuWa Log Decryptor - Logic & Cipher Implementation
 * Upgraded with robust validation, smooth mobile scrolling, dynamic labels, and notification pings.
 */

// --- Constants & LUTs ---
const HEADER_A = [0x00, 0x54, 0x50]; // TP
const HEADER_B = [0x00, 0x4C, 0x4F]; // LO
const BOM = [0xEF, 0xBB, 0xBF];

// Scheme A uses an alternating XOR key based on parity
const LUT_A = Uint8Array.from({ length: 256 }, (_, i) => (i & 1) ? (i ^ 0xA5) : (i ^ 0xEF));
// Scheme B uses a standard 0x55 XOR
const LUT_B = Uint8Array.from({ length: 256 }, (_, i) => i ^ 0x55);

// Crash Signatures to scan for
const CRASH_SIGNATURES = [
    { id: 'fsr3', pattern: /KuroFI_ShaderArchive_Failed/i, name: 'KuroFI Shader Archive' },
    { id: 'mfrc', pattern: /MFRC_INIT_FAILED/i, name: 'MFRC Init Failure' },
    { id: 'vulkan', pattern: /vkCreateSwapchainKHR/i, name: 'Vulkan Swapchain Mismatch' },
    { id: 'niagara', pattern: /NiagaraGPUInstanceCountManager/i, name: 'Niagara GPU Overflow' },
    { id: 'puerts', pattern: /Puerts/i, name: 'Puerts Race Condition' },
    { id: 'lgui', pattern: /LGUIRenderer/i, name: 'LGUI Null Dereference' }
];

let selectedFile = null;
let fullDecryptedText = "";
let cachedLogLines = []; // Fast search cache
let searchDebounceTimeout = null;

// --- UI Interaction Functions ---

function triggerFileInput(e) {
    if (e) e.stopPropagation();
    const input = document.getElementById('fileInput');
    if (input) input.click();
}

function handleDragOver(e) {
    e.preventDefault();
    const zone = document.getElementById('dropZone');
    if (zone) zone.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    const zone = document.getElementById('dropZone');
    if (zone) zone.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    const zone = document.getElementById('dropZone');
    if (zone) zone.classList.remove('drag-over');
    if (e.dataTransfer && e.dataTransfer.files.length > 0) {
        processFileSelection(e.dataTransfer.files[0]);
    }
}

function handleFileSelect(e) {
    if (e.target && e.target.files.length > 0) {
        processFileSelection(e.target.files[0]);
    }
}

function processFileSelection(file) {
    selectedFile = file;
    const infoBar = document.getElementById('fileInfoBar');
    const dropZone = document.getElementById('dropZone');

    document.getElementById('fileInfoName').textContent = file.name;
    document.getElementById('fileInfoSize').textContent = (file.size / 1024).toFixed(2) + " KB";

    if (infoBar) infoBar.classList.add('visible');
    if (dropZone) dropZone.classList.add('has-file');
    document.getElementById('decryptBtn').disabled = false;

    // Reset download button label back to its initial state when a new file is uploaded
    document.getElementById('dlDecBtn').textContent = "↓ Save Log File";

    resetDetectionUI();
}

function resetDetectionUI() {
    const detector = document.getElementById('schemeDetector');
    if (detector) detector.classList.remove('visible');
    document.getElementById('dotA').classList.remove('active');
    document.getElementById('dotB').classList.remove('active');
    document.getElementById('dotPlain').classList.remove('active');
    document.getElementById('detectedScheme').textContent = "—";
}

// --- Dynamic Notification Toast Ping ---
function showToastPing(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-ping ${type}`;
    toast.innerHTML = type === 'success' ? `✨ ${message}` : `⚠️ ${message}`;

    container.appendChild(toast);

    // Trigger frame animation entry
    setTimeout(() => toast.classList.add('show'), 50);

    // Fade out and remove after exactly 2 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// --- Enhanced Error Logging Handler ---

function handleDecryptionFailure(reason, details = "") {
    const output = document.getElementById('decryptedOutput');
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // Construct readable error report
    const errorReport =
        `======================================================================
[ERROR] DECRYPTION PIPELINE FAILED
======================================================================
Timestamp : ${timestamp}
File Name : ${selectedFile ? selectedFile.name : "No file found"}
File Size : ${selectedFile ? selectedFile.size.toLocaleString() + " bytes" : "0 bytes"}
Failure   : ${reason}
----------------------------------------------------------------------
DIAGNOSTIC DETAILS:
${details}
----------------------------------------------------------------------
SUGGESTED ACTIONS:
1. Ensure this file is a genuine 'Client.log' generated by Wuthering Waves.
2. Confirm the file size is greater than 0 KB and isn't locked/corrupted.
3. If this file is completely plain, human-readable text already, 
   decryption operations are unnecessary.
======================================================================`;

    if (output) output.value = errorReport;
    cachedLogLines = errorReport.split('\n');

    // Trigger failure notification ping
    showToastPing("Decryption Failed!", "error");

    // Clear display stats
    document.getElementById('statLines').textContent = "ERR";
    document.getElementById('statErrors').textContent = "1";
    document.getElementById('statWarnings').textContent = "0";

    // Disable searching/filtering since output is just an error report
    document.getElementById('searchInput').disabled = true;
    document.getElementById('filterErrors').disabled = true;

    // Enable copy/save buttons so users can share the diagnostic report if needed
    document.getElementById('copyDecBtn').disabled = false;
    document.getElementById('dlDecBtn').disabled = false;

    // Quality of Life: Adjust button title to indicate error saving routine
    document.getElementById('dlDecBtn').textContent = "↓ Save Error Log";

    // Reset crash signature cards to default clean/pending state
    const cards = document.querySelectorAll('.sig-card');
    cards.forEach(card => {
        card.className = 'sig-card';
        const badge = card.querySelector('.sig-badge');
        if (badge) {
            badge.className = 'sig-badge pending';
            badge.textContent = '—';
        }
    });

    // Reset detection UI state cleanly
    resetDetectionUI();
    const detector = document.getElementById('schemeDetector');
    if (detector) detector.classList.add('visible');
    document.getElementById('detectedScheme').textContent = "FAILED";

    // Clean up interface loader
    document.getElementById('decryptBtn').disabled = false;
    document.getElementById('progressWrap').classList.remove('visible');

    // Smoothly scroll down to output panel on mobile screens
    if (window.innerWidth <= 900 && output) {
        output.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// --- Decryption Implementation ---

async function decryptFile() {
    if (!selectedFile) {
        handleDecryptionFailure("Missing File", "No file object found in runtime context.");
        return;
    }

    // 1. Initial Validation: Check if empty
    if (selectedFile.size === 0) {
        handleDecryptionFailure("Empty File Target", "The selected file contains 0 bytes of data and cannot be parsed.");
        return;
    }

    const btn = document.getElementById('decryptBtn');
    const progressWrap = document.getElementById('progressWrap');
    const progressBar = document.getElementById('progressBar');

    if (btn) btn.disabled = true;
    if (progressWrap) progressWrap.classList.add('visible');
    if (progressBar) progressBar.style.width = "20%";

    const reader = new FileReader();

    reader.onerror = function (e) {
        handleDecryptionFailure("Browser Core File System Error", `FileReader Event triggered an abort or error rule: ${reader.error?.message || "Unknown FS break."}`);
    };

    reader.onload = function (e) {
        try {
            const buffer = new Uint8Array(e.target.result);
            if (progressBar) progressBar.style.width = "50%";

            // 2. Structural Check: Check if file has at least enough space for headers
            if (buffer.length < 3) {
                handleDecryptionFailure(
                    "Truncated Header Signature",
                    `The log file context is only ${buffer.length} bytes long. It is physically too small to hold valid Kuro Games magic decryption tags.`
                );
                return;
            }

            let scheme = null;
            let decryptedData;

            // Header Matching
            if (buffer[0] === HEADER_A[0] && buffer[1] === HEADER_A[1] && buffer[2] === HEADER_A[2]) {
                scheme = 'A';
            } else if (buffer[0] === HEADER_B[0] && buffer[1] === HEADER_B[1] && buffer[2] === HEADER_B[2]) {
                scheme = 'B';
            }

            const detector = document.getElementById('schemeDetector');
            if (detector) detector.classList.add('visible');

            // 3. File content evaluation criteria
            if (scheme) {
                const lut = (scheme === 'A') ? LUT_A : LUT_B;
                const body = buffer.slice(3);

                if (body.length === 0) {
                    handleDecryptionFailure("Zero Body Payloads", `The encryption signatures sequence match Scheme ${scheme}, but there are zero remaining bytes to decode inside the file stream layout.`);
                    return;
                }

                decryptedData = new Uint8Array(body.length);
                for (let i = 0; i < body.length; i++) {
                    decryptedData[i] = lut[body[i]];
                }

                document.getElementById(scheme === 'A' ? 'dotA' : 'dotB').classList.add('active');
                document.getElementById('detectedScheme').textContent = `Scheme ${scheme}`;
            } else {
                let unprintableCount = 0;
                const sampleLength = Math.min(buffer.length, 32);

                for (let i = 0; i < sampleLength; i++) {
                    const ch = buffer[i];
                    if (ch < 32 && ch !== 9 && ch !== 10 && ch !== 13) {
                        unprintableCount++;
                    }
                }

                if (unprintableCount > 3) {
                    handleDecryptionFailure(
                        "Unknown Encryption Signature or Binary Asset",
                        `Hex Headers: [${Array.from(buffer.slice(0, 5)).map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(' ')}]\n` +
                        `This target contains illegal binary sequences. It is neither a Scheme A/B log, nor is it raw, unencrypted log plain text.`
                    );
                    return;
                }

                decryptedData = buffer;
                document.getElementById('dotPlain').classList.add('active');
                document.getElementById('detectedScheme').textContent = "Plaintext";
            }

            if (progressBar) progressBar.style.width = "80%";

            // 4. Decode validation
            const decoder = new TextDecoder("utf-8", { fatal: true });
            try {
                fullDecryptedText = decoder.decode(decryptedData);
            } catch (utf8Error) {
                handleDecryptionFailure(
                    "String Decoding Constraint Violation (UTF-8 Error)",
                    "Decryption mechanics ran successfully, but the resulting array contained malformed characters or non-UTF8 binary text definitions, breaking structural parsing logic."
                );
                return;
            }

            showToastPing("Decrypted Successfully!");
            finalizeUI(fullDecryptedText);

        } catch (globalCatch) {
            handleDecryptionFailure("Unhandled Native Exception", globalCatch.stack || globalCatch.message || globalCatch);
        }
    };

    reader.readAsArrayBuffer(selectedFile);
}

function finalizeUI(text) {
    const output = document.getElementById('decryptedOutput');
    if (output) output.value = text;

    cachedLogLines = text.split('\n');
    document.getElementById('statLines').textContent = cachedLogLines.length.toLocaleString();

    const errorCount = (text.match(/\[Error\]|error:|failed/gi) || []).length;
    const warnCount = (text.match(/\[Warning\]|warning:/gi) || []).length;

    document.getElementById('statErrors').textContent = errorCount;
    document.getElementById('statWarnings').textContent = warnCount;

    document.getElementById('searchInput').disabled = false;
    document.getElementById('filterErrors').disabled = false;
    document.getElementById('copyDecBtn').disabled = false;
    document.getElementById('dlDecBtn').disabled = false;
    document.getElementById('devprofBtn').disabled = false;

    document.getElementById('dlDecBtn').textContent = "↓ Save Log File";

    scanSignatures(text);

    const bar = document.getElementById('progressBar');
    if (bar) bar.style.width = "100%";
    setTimeout(() => {
        const wrap = document.getElementById('progressWrap');
        if (wrap) wrap.classList.remove('visible');
        const dBtn = document.getElementById('decryptBtn');
        if (dBtn) dBtn.disabled = false;
    }, 500);

    if (window.innerWidth <= 900 && output) {
        output.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function scanSignatures(text) {
    const cards = document.querySelectorAll('.sig-card');

    CRASH_SIGNATURES.forEach((sig, index) => {
        const found = sig.pattern.test(text);
        const card = cards[index];
        if (!card) return;
        const badge = card.querySelector('.sig-badge');

        card.classList.remove('found', 'clean');
        if (found) {
            card.classList.add('found');
            if (badge) {
                badge.className = 'sig-badge found';
                badge.textContent = 'FOUND';
            }
        } else {
            card.classList.add('clean');
            if (badge) {
                badge.className = 'sig-badge clean';
                badge.textContent = 'CLEAN';
            }
        }
    });
}

function debouncedSearchLog(query) {
    clearTimeout(searchDebounceTimeout);
    searchDebounceTimeout = setTimeout(() => {
        searchLog(query);
    }, 150);
}

function searchLog(query) {
    const output = document.getElementById('decryptedOutput');
    if (!output) return;
    if (!query) {
        output.value = fullDecryptedText;
        return;
    }

    const normalizedQuery = query.toLowerCase();
    const len = cachedLogLines.length;
    const matches = [];

    for (let i = 0; i < len; i++) {
        if (cachedLogLines[i].toLowerCase().includes(normalizedQuery)) {
            matches.push(cachedLogLines[i]);
        }
    }

    output.value = matches.join('\n');
}

function toggleErrorFilter() {
    const btn = document.getElementById('filterErrors');
    if (!btn) return;
    const isActive = btn.classList.toggle('active');
    const output = document.getElementById('decryptedOutput');

    if (isActive) {
        btn.style.background = "var(--jade-mid)";
        const filtered = cachedLogLines.filter(line => /error|failed|fatal/gi.test(line));
        if (output) output.value = filtered.join('\n');
    } else {
        btn.style.background = "";
        if (output) output.value = fullDecryptedText;
    }
}

function copyDecrypted() {
    const output = document.getElementById('decryptedOutput');
    if (!output) return;
    output.select();
    document.execCommand('copy');
    showToastPing("Copied to clipboard!");
}

function downloadDecrypted() {
    const output = document.getElementById('decryptedOutput');
    if (!output) return;
    const blob = new Blob([output.value], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    const isError = document.getElementById('dlDecBtn').textContent.includes("Error");
    const prefix = isError ? "error_diagnostic_" : "decrypted_";

    a.download = selectedFile ? `${prefix}${selectedFile.name.replace('.log', '')}.txt` : 'Client_Decrypted.txt';
    a.click();
    URL.revokeObjectURL(url);
}

function clearDecryptor() {
    selectedFile = null;
    fullDecryptedText = "";
    cachedLogLines = [];
    document.getElementById('fileInput').value = "";
    const output = document.getElementById('decryptedOutput');
    if (output) output.value = "";
    document.getElementById('fileInfoBar').classList.remove('visible');
    document.getElementById('dropZone').classList.remove('has-file');
    document.getElementById('decryptBtn').disabled = true;
    document.getElementById('devprofBtn').disabled = true;
    document.getElementById('devprofResult').style.display = 'none';
    document.getElementById('devprofName').textContent = '';
    document.getElementById('retailDeviceName').textContent = '';

    document.getElementById('statLines').textContent = "—";
    document.getElementById('statErrors').textContent = "—";
    document.getElementById('statWarnings').textContent = "—";

    document.getElementById('dlDecBtn').textContent = "↓ Save Log File";

    resetDetectionUI();
}

function obtainDeviceProfile() {
    const output = document.getElementById('decryptedOutput');
    const source = fullDecryptedText || (output ? output.value : "");

    if (!source) {
        showToastPing("No log content to scan.", "error");
        return;
    }

    const profileMatch = source.match(/selected\s+device\s+profile\s*[:\-]?\s*(\S+)/i);
    const modelMatch = source.match(/(?:android\s+device\s+model|hardware|device_model)\s*[:=]\s*([^\r\n,;]+)/i);

    const resultDiv = document.getElementById('devprofResult');
    const nameSpan = document.getElementById('devprofName');
    const deviceSpan = document.getElementById('retailDeviceName');

    let rawProfile = profileMatch ? profileMatch[1].trim() : "DefaultDeviceProfile";
    let rawModel = modelMatch ? modelMatch[1].trim() : "";

    if (rawModel) {
        rawModel = rawModel.replace(/[\[\]"']/g, '').trim();

        const modelMap = {
            "2311DRK48G": "Poco X6 Pro 5G",
            "23113RKC6C": "Xiaomi Redmi K70E",
            "23127PN0CC": "Xiaomi 14 Pro",
            "23116PN5BC": "Xiaomi 14 Ultra",
            "CPH2581": "OnePlus 12 R",
            "PJD110": "OnePlus 12",
            "SM-S928": "Samsung Galaxy S24 Ultra",
            "SM-S926": "Samsung Galaxy S24+",
            "SM-S921": "Samsung Galaxy S24",
            "SM-F946": "Samsung Galaxy Z Fold 5"
        };

        for (const [key, val] of Object.entries(modelMap)) {
            if (rawModel.toUpperCase().includes(key)) {
                rawModel = val;
                break;
            }
        }
    } else {
        if (rawProfile.toLowerCase().includes("pocox6pro")) {
            rawModel = "Poco X6 Pro 5G";
        } else if (rawProfile.toLowerCase().includes("s24ultra")) {
            rawModel = "Samsung Galaxy S24 Ultra";
        } else {
            rawModel = "Generic Android Mobile Device";
        }
    }

    if (nameSpan) nameSpan.textContent = rawProfile;
    if (deviceSpan) deviceSpan.textContent = rawModel;

    if (resultDiv) resultDiv.style.display = 'block';
    showToastPing("Profile metrics resolved!");
}

function copyDeviceProfile() {
    const nameSpan = document.getElementById('devprofName');
    const name = nameSpan ? nameSpan.textContent : "";
    if (!name) return;
    navigator.clipboard.writeText(name).then(() => {
        showToastPing("DeviceProfile name copied!");
    }).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = name;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToastPing("DeviceProfile name copied!");
    });
}

// Global Explicit Scope Exposing to map inline HTML element triggers safely across routing path updates
window.triggerFileInput = triggerFileInput;
window.handleDragOver = handleDragOver;
window.handleDragLeave = handleDragLeave;
window.handleDrop = handleDrop;
window.handleFileSelect = handleFileSelect;
window.decryptFile = decryptFile;
window.clearDecryptor = clearDecryptor;
window.debouncedSearchLog = debouncedSearchLog;
window.toggleErrorFilter = toggleErrorFilter;
window.copyDecrypted = copyDecrypted;
window.downloadDecrypted = downloadDecrypted;
window.obtainDeviceProfile = obtainDeviceProfile;
window.copyDeviceProfile = copyDeviceProfile;