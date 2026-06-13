/**
 * WuWa Log Decryptor - Logic & Cipher Implementation
 * Upgraded with robust validation, smooth mobile scrolling, dynamic labels, and notification pings.
 * Enhanced: Loosened Scheme A header verification to accept multiple variants (e.g., 00 54 50 / 20 54 50).
 */

// --- Constants & LUTs ---
// Scheme A's real signature is the 'TP' byte pairing at index 1 and 2
const FINGERPRINT_A_1 = 0x54; // T
const FINGERPRINT_A_2 = 0x50; // P

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

            // Loosened Header Matching for Scheme A (matches ?? 54 50, supporting both 00 and 20 leading offsets)
            if (buffer[1] === FINGERPRINT_A_1 && buffer[2] === FINGERPRINT_A_2) {
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

    // Enable CVar filter buttons
    ['cvarResBtn','cvarForbBtn','cvarCommBtn'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.disabled = false;
    });
    // Hide any previous CVar output
    const cvarOut = document.getElementById('cvarOutput');
    if (cvarOut) { cvarOut.classList.remove('visible'); cvarOut.innerHTML = ''; }

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

    ['cvarResBtn','cvarForbBtn','cvarCommBtn'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.disabled = true;
    });
    const cvarOut = document.getElementById('cvarOutput');
    if (cvarOut) { cvarOut.classList.remove('visible'); cvarOut.innerHTML = ''; }

    document.getElementById('statLines').textContent = "—";
    document.getElementById('statErrors').textContent = "—";
    document.getElementById('statWarnings').textContent = "—";

    document.getElementById('dlDecBtn').textContent = "↓ Save Log File";

    resetDetectionUI();
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

// --- CVar Quick-View ---

const CVAR_GROUPS = {
    resolution: [
        'r.ScreenPercentage',
        'r.MobileContentScaleFactor',
        'r.SecondaryScreenPercentage.GameViewport'
    ],
    forbidden: [
        'r.Kuro.SkeletalMesh.LODDistanceScale',
        'r.Streaming.Boost',
        'r.Streaming.PoolSize',
        'r.Streaming.LimitPoolSizeTOVRAM',
        'r.Shadow.MaxCSMResolution',
        'r.Streaming.MinBoost',
        'r.MipMapLODBias',
        'r.TextureGroup.Landscape.TextureLODBias',
        'r.Kuro.TexturePool.ExtraBudgetMB',
        'r.Streaming.CPUReadback',
        'r.Streaming.UseAsyncCPUReadback',
        'r.Streaming.MaxNumTexturesToStreamPerFrame',
        'r.Streaming.MinMipForSplitRequest',
        'r.Streaming.UseFixedPoolSize',
        'r.Streaming.UseAllMips',
        'r.Streaming.MaxTempMemoryAllowed',
        'r.RayTracing.LimitDevice',
        'r.DetailMode',
        'r.MaterialQualityLevel',
        'r.KuroMaterialQualityLevel',
        'r.ViewDistanceScale',
        'Kuro.CppEffectSystem.UseLowMemoryPlayerEffectLruCapacity',
        'r.AsyncComputePSO',
        'r.Streamline.DLSSG.RetainResourcesWhenOff',
        'r.MobileContentScaleFactor',
        'r.SecondaryScreenPercentage.GameViewport',
        'r.ScreenPercentage',
        'r.AFME.Enable',
        'r.MFRC.Enable',
        'r.FEstimation.Option'
    ],
    common: [
        'r.ViewDistanceScale',
        'r.KuroMaterialQualityLevel',
        'r.DetailMode',
        'r.MaterialQualityLevel',
        'r.Streaming.Boost',
        'r.Streaming.PoolSize',
        'r.Streaming.LimitPoolSizeTOVRAM',
        'r.Shadow.MaxCSMResolution',
        'r.MobileContentScaleFactor',
        'r.SecondaryScreenPercentage.GameViewport'
    ]
};

const GROUP_LABELS = {
    resolution: '📐 Resolution CVars — Last Logged Values',
    forbidden:  '🚫 Forbidden CVars — Last Logged Values',
    common:     '⚙️  Common CVars — Last Logged Values'
};

/**
 * Find the LAST occurrence of a CVar in the log.
 * Matches patterns like:
 *   r.ScreenPercentage = 100
 *   r.ScreenPercentage=100
 *   [LogConsoleResponse] r.ScreenPercentage = 100 LastSetBy=...
 *   CVar r.ScreenPercentage set to "100"
 * Returns the value string or null.
 */
function findLastCVarValue(lines, cvarName) {
    // Escape dots/asterisks for regex
    const esc = cvarName.replace(/\./g, '\\.').replace(/\*/g, '\\*');

    // WuWa Client.log CVar formats observed in the wild:
    //   [[r.ViewDistanceScale:2.0]]                    ← GameThread LogConfig / LogConsoleManager
    //   [r.ViewDistanceScale:2.0]                      ← single bracket variant
    //   Setting CVar [[r.ViewDistanceScale:2.0]]
    //   r.ViewDistanceScale = 2.0                      ← plain ini-style echo
    //   r.ViewDistanceScale=2                          ← compact
    //   CVar r.ViewDistanceScale set to "2.0"          ← verbose UE4 log
    //   r.ViewDistanceScale 2.0                        ← space-separated
    const patterns = [
        // [[CVar:value]] or [CVar:value]  (primary WuWa format)
        new RegExp('\\[{1,2}' + esc + ':([\\d.\\-+eE]+)\\]{1,2}', 'i'),
        // CVar = value  or  CVar=value  (ini echo / console)
        new RegExp('(?:^|\\s)' + esc + '\\s*=\\s*"?([\\d.\\-+eE]+)"?', 'i'),
        // set to "value"
        new RegExp(esc + '\\s+set\\s+to\\s+"?([\\d.\\-+eE]+)"?', 'i'),
        // CVar <space> value  (space-separated fallback)
        new RegExp('(?:^|\\s)' + esc + '\\s+([\\d.\\-+eE]+)(?:\\s|$)', 'i'),
    ];

    let last = null;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Quick pre-filter: line must contain the cvar name (case-insensitive)
        if (line.toLowerCase().indexOf(cvarName.toLowerCase()) === -1) continue;
        for (const re of patterns) {
            const m = line.match(re);
            if (m) { last = m[1]; break; }
        }
    }
    return last;
}

/**
 * Detect Vulkan usage and version from the decrypted log.
 * Looks for lines that confirm Vulkan is the active RHI and any version string.
 */
function detectVulkanInfo(lines) {
    let vulkanLine = null;
    let version = null;

    const rhi    = /(?:using|selected|initializing|created|RHI)\s+vulkan|vulkan\s+(?:RHI|renderer|backend|device)/i;
    const ver    = /vulkan\s*(?:api\s*)?(?:version|ver|v)[\s:=]*(\d+\.\d+[\d.]*)/i;
    const ver2   = /(?:api\s*version|VkPhysicalDeviceProperties)[\s\S]{0,60}?(\d+\.\d+\.\d+)/i;
    const ver3   = /\bVK_API_VERSION[\s=:]*(\d+[\._]\d+[\._]\d+)/i;

    for (let i = 0; i < lines.length; i++) {
        const l = lines[i];
        if (rhi.test(l) && !vulkanLine) vulkanLine = l.trim();
        const mv = l.match(ver) || l.match(ver2) || l.match(ver3);
        if (mv) version = mv[1].replace(/_/g, '.');
    }
    return { vulkanLine, version };
}

function showCVarValues(type) {
    const out = document.getElementById('cvarOutput');
    if (!out) return;
    if (!fullDecryptedText) {
        out.classList.remove('visible');
        return;
    }

    const lines = cachedLogLines.length ? cachedLogLines : fullDecryptedText.split('\n');
    const cvars = CVAR_GROUPS[type];
    const label = GROUP_LABELS[type];

    // Build HTML output
    const rows = [];
    rows.push(`<span class="cvar-line-head">${label}</span>\n`);

    for (const name of cvars) {
        const val = findLastCVarValue(lines, name);
        if (val !== null) {
            rows.push(
                `<span class="cvar-line-key">${name.padEnd(52)}</span>` +
                `= <span class="cvar-line-val">${val}</span>\n`
            );
        } else {
            rows.push(
                `<span class="cvar-line-miss">${name.padEnd(52)}  — not found in log</span>\n`
            );
        }
    }

    // For resolution type, also append Vulkan info
    if (type === 'resolution') {
        const { vulkanLine, version } = detectVulkanInfo(lines);
        rows.push('\n<span class="cvar-line-head">🖥️  Vulkan Renderer</span>\n');
        if (vulkanLine) {
            rows.push(`<span class="cvar-line-vulk">${vulkanLine}</span>\n`);
        } else {
            rows.push(`<span class="cvar-line-miss">  — No Vulkan RHI confirmation line found</span>\n`);
        }
        if (version) {
            rows.push(`<span class="cvar-line-key">  Vulkan API Version          </span>` +
                      `= <span class="cvar-line-val">${version}</span>\n`);
        } else {
            rows.push(`<span class="cvar-line-miss">  Vulkan API Version          — not found in log</span>\n`);
        }
    }

    out.innerHTML = rows.join('');
    out.classList.add('visible');
}

// --- Improved Device Profile Detection ---

function obtainDeviceProfile() {
    const output = document.getElementById('decryptedOutput');
    const source = fullDecryptedText || (output ? output.value : "");

    if (!source) {
        showToastPing("No log content to scan.", "error");
        return;
    }

    const lines = cachedLogLines.length ? cachedLogLines : source.split('\n');

    // Find last profile assignment line
    const profileMatch = source.match(/selected\s+device\s+profile\s*[:\-]?\s*(\S+)/gi);
    let rawProfile = "DefaultDeviceProfile";
    if (profileMatch && profileMatch.length > 0) {
        const last = profileMatch[profileMatch.length - 1];
        const m = last.match(/selected\s+device\s+profile\s*[:\-]?\s*(\S+)/i);
        if (m) rawProfile = m[1].trim();
    }

    // --- Branded device name resolution ---

    // Priority 0: Android OS Build FingerPrint line — most reliable source
    // Format: POCO/duchamp_global/duchamp:16/... or xiaomi/marble_global/marble:13/...
    // The codename (e.g. "duchamp", "marble") uniquely identifies the retail model.
    const CODENAME_MAP = {
        // Poco
        "duchamp":      "Poco X6 Pro 5G",
        "moonstone":    "Poco X6 5G",
        "marble":       "Poco F5 / Redmi Note 12 Turbo",
        "garnet":       "Poco X5 Pro 5G / Redmi Note 12 Pro+ 5G",
        "sky":          "Poco X5 5G / Redmi Note 12 5G",
        "fog":          "Poco M5 / Redmi 10C",
        "topaz":        "Poco M5s / Redmi Note 11S",
        "redwood":      "Poco X4 GT / Redmi Note 11T Pro",
        "thor":         "Poco F6 Pro / Redmi K70 Pro",
        "vermeer":      "Poco F6 / Redmi Turbo 3",
        "peridot":      "Poco X6 Pro / Redmi K70E",
        "diting":       "Poco X5 Pro / Redmi Note 12 Pro Speed",
        "mondrian":     "Poco F4 GT / Redmi K50G",
        "sunstone":     "Poco M6 Pro 5G",
        "cannon":       "Poco M3 Pro 5G / Redmi Note 10 5G",
        "socrates":     "Poco F4 / Redmi K40S",
        // Xiaomi / Redmi
        "aurora":       "Xiaomi 15 Ultra",
        "haydn":        "Xiaomi 14 Ultra",
        "houji":        "Xiaomi 14 Pro",
        "huaxing":      "Xiaomi 14",
        "corot":        "Xiaomi 14T Pro",
        "daumier":      "Xiaomi 14T",
        "aristotle":    "Xiaomi 13 Ultra",
        "fuxi":         "Xiaomi 13 Pro",
        "zizhan":       "Xiaomi 13",
        "cupid":        "Xiaomi 12 Pro",
        "zeus":         "Xiaomi 12",
        "ingres":       "Redmi K70 Pro",
        "pearl":        "Redmi K70",
        "gold":         "Redmi K60 Pro / POCO F5 Pro",
        "diting":       "Redmi K60 / Poco X5 Pro",
        "rubens":       "Redmi Note 13 Pro+",
        "sapphire":     "Redmi Note 13 Pro",
        "emerald":      "Redmi Note 13",
        "sword":        "Redmi Note 12 Pro+",
        "rhodium":      "Redmi Note 12 Pro",
        "tapas":        "Redmi Note 12",
        "corot":        "Redmi K60E",
        // Samsung (uses marketing names in fingerprint, but codenames appear in some builds)
        "dm3q":         "Samsung Galaxy S23 Ultra",
        "dm2q":         "Samsung Galaxy S23+",
        "dm1q":         "Samsung Galaxy S23",
        "e3q":          "Samsung Galaxy S24 Ultra",
        "e2q":          "Samsung Galaxy S24+",
        "e1q":          "Samsung Galaxy S24",
        "f3q":          "Samsung Galaxy S25 Ultra",
        "f2q":          "Samsung Galaxy Z Fold 5",
        "q5q":          "Samsung Galaxy Z Fold 4",
        "b0q":          "Samsung Galaxy S22 Ultra",
        // OnePlus
        "dre":          "OnePlus 12",
        "aston":        "OnePlus 12R",
        "oos12":        "OnePlus 10 Pro",
        "salami":       "OnePlus 11",
        "ovaltine":     "OnePlus 10T",
        // ASUS ROG
        "AI2201":       "ASUS ROG Phone 6",
        "AI2301":       "ASUS ROG Phone 7",
        "AI2401":       "ASUS ROG Phone 8 Pro",
        // Realme
        "salaa":        "Realme GT5 Pro",
        "oscar":        "Realme GT5",
        "RE58C2":       "Realme GT Neo 5",
        // vivo / iQOO
        "V2324A":       "vivo X100 Pro",
        "V2309A":       "vivo X100",
        "PD2230":       "iQOO 12",
    };

    let rawModel = "";

    // Parse fingerprint: "BRAND/codename_global/codename:version/..."
    // LogRHI: Display: Android OS Build FingerPrint: POCO/duchamp_global/duchamp:16/...
    const fpMatch = source.match(/(?:FingerPrint|fingerprint)\s*:\s*([^\r\n]+)/i);
    if (fpMatch) {
        // Extract codename — second segment before underscore or colon
        // e.g. "POCO/duchamp_global/duchamp:16/..." → "duchamp"
        const fpParts = fpMatch[1].trim().split('/');
        if (fpParts.length >= 2) {
            // Try segment index 1 (codename_global) and index 2 (codename:version)
            for (const seg of [fpParts[1], fpParts[2]]) {
                if (!seg) continue;
                const codename = seg.split(/[_:]/)[0].toLowerCase();
                if (CODENAME_MAP[codename]) {
                    rawModel = CODENAME_MAP[codename];
                    break;
                }
            }
        }
        // If not in map, use brand + codename as fallback label
        if (!rawModel && fpParts.length >= 2) {
            const brand = fpParts[0].trim();
            const codename = fpParts[1].split('_')[0];
            if (brand && codename) rawModel = `${brand} (${codename})`;
        }
    }

    // Priority 1: explicit branded model name fields in log
    if (!rawModel) {
        const brandedPatterns = [
            /(?:DeviceName|ProductModel|ro\.product\.model|ro\.product\.name|device\s+name|product\s+model)\s*[:=]\s*([^\r\n,;]{3,60})/i,
            /(?:android\s+device\s+model|hardware\s+model)\s*[:=]\s*([^\r\n,;]{3,60})/i,
            /\bModel\s*[:=]\s*([^\r\n,;]{3,60})/i,
            /(?:hardware|device_model)\s*[:=]\s*([^\r\n,;]{3,60})/i
        ];
        for (const re of brandedPatterns) {
            const m = source.match(re);
            if (m) {
                rawModel = m[1].trim().replace(/[[\]"']/g, '').trim();
                break;
            }
        }
    }

    // Priority 2: SKU/model-code to branded name lookup (partial match)
    const modelMap = {
        "2311DRK48G":  "Poco X6 Pro 5G",
        "23113RKC6C":  "Xiaomi Redmi K70E",
        "23127PN0CC":  "Xiaomi 14 Pro",
        "23116PN5BC":  "Xiaomi 14 Ultra",
        "CPH2581":     "OnePlus 12R",
        "PJD110":      "OnePlus 12",
        "SM-S928":     "Samsung Galaxy S24 Ultra",
        "SM-S926":     "Samsung Galaxy S24+",
        "SM-S921":     "Samsung Galaxy S24",
        "SM-F946":     "Samsung Galaxy Z Fold 5",
        "SM-A546":     "Samsung Galaxy A54 5G",
        "SM-A546":     "Samsung Galaxy A54 5G",
        "22081212UG":  "Xiaomi 12T Pro",
        "2210132G":    "Xiaomi 12",
        "NE2215":      "OnePlus 10 Pro",
        "CPH2413":     "OnePlus 10T",
        "PGKM10":      "OnePlus 10T",
        "PGT110":      "OnePlus 11",
        "RMX3310":     "Realme GT Neo 3",
        "RMX3741":     "Realme GT 5",
        "RMX3831":     "Realme GT5 Pro",
        "V2309A":      "vivo X100",
        "V2324A":      "vivo X100 Pro",
        "SM-G998":     "Samsung Galaxy S21 Ultra",
        "SM-G996":     "Samsung Galaxy S21+",
        "SM-G991":     "Samsung Galaxy S21",
        "SM-S911":     "Samsung Galaxy S23",
        "SM-S916":     "Samsung Galaxy S23+",
        "SM-S918":     "Samsung Galaxy S23 Ultra",
        "XT2301":      "Motorola Edge 40 Pro",
        "XT2341":      "Motorola Edge 50 Ultra",
        "23049PCD8G":  "Redmi Note 12 Turbo",
        "2304FPN6DC":  "Poco F5",
        "23013PC75G":  "Poco X5 Pro 5G"
    };

    // If rawModel already looks like a branded name (has spaces, not just alphanumeric code), keep it
    const looksLikeBranded = rawModel && /\s/.test(rawModel) && rawModel.length > 4;

    if (!looksLikeBranded) {
        // Try matching against model map from the raw model string or from the profile name
        const searchStr = (rawModel + ' ' + rawProfile).toUpperCase();
        let mapped = false;
        for (const [key, val] of Object.entries(modelMap)) {
            if (searchStr.includes(key.toUpperCase())) {
                rawModel = val;
                mapped = true;
                break;
            }
        }
        // Priority 3: Infer from profile name keywords
        if (!mapped) {
            const p = rawProfile.toLowerCase();
            if      (p.includes('pocox6pro'))         rawModel = "Poco X6 Pro 5G";
            else if (p.includes('pocox5pro'))         rawModel = "Poco X5 Pro 5G";
            else if (p.includes('pocof5'))            rawModel = "Poco F5";
            else if (p.includes('s24ultra'))          rawModel = "Samsung Galaxy S24 Ultra";
            else if (p.includes('s24'))               rawModel = "Samsung Galaxy S24";
            else if (p.includes('s23ultra'))          rawModel = "Samsung Galaxy S23 Ultra";
            else if (p.includes('s23'))               rawModel = "Samsung Galaxy S23";
            else if (p.includes('onep12'))            rawModel = "OnePlus 12";
            else if (p.includes('mi14ultra'))         rawModel = "Xiaomi 14 Ultra";
            else if (p.includes('mi14pro'))           rawModel = "Xiaomi 14 Pro";
            else if (p.includes('mi14'))              rawModel = "Xiaomi 14";
            else rawModel = rawProfile.replace(/([A-Z])/g, ' $1').trim() || "Generic Android Device";
        }
    }

    const resultDiv   = document.getElementById('devprofResult');
    const nameSpan    = document.getElementById('devprofName');
    const deviceSpan  = document.getElementById('retailDeviceName');

    if (nameSpan)   nameSpan.textContent   = rawProfile;
    if (deviceSpan) deviceSpan.textContent = rawModel;
    if (resultDiv)  resultDiv.style.display = 'block';
    showToastPing("Profile metrics resolved!");
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
window.showCVarValues = showCVarValues;
