/**
 * WuWa Log Decryptor - Enhanced Logic & Cipher Implementation
 * Improvements:
 * - Robust plaintext detection via keyword scanning
 * - Scheme A/B with fallback plaintext detection
 * - CVar "CVars Only" filter (GameThread + LogConsoleManager lines)
 * - Finds LAST logged CVar values instead of first
 * - Better error handling and diagnostics
 */

// --- Constants & LUTs ---
const FINGERPRINT_A_1 = 0x54; // T
const FINGERPRINT_A_2 = 0x50; // P
const HEADER_B = [0x00, 0x4C, 0x4F]; // LO
const BOM = [0xEF, 0xBB, 0xBF];

// Scheme A uses an alternating XOR key based on parity
const LUT_A = Uint8Array.from({ length: 256 }, (_, i) => (i & 1) ? (i ^ 0xA5) : (i ^ 0xEF));
// Scheme B uses a standard 0x55 XOR
const LUT_B = Uint8Array.from({ length: 256 }, (_, i) => i ^ 0x55);

// Keywords to detect plaintext logs (common WuWa log markers)
const PLAINTEXT_KEYWORDS = [
    'Log file opened',
    'Device profile',
    'initialized device',
    'LogConsoleManager',
    '[GameThread]',
    'Vulkan',
    'RHI',
    'shader',
    'Wuthering Waves',
    'WuWa',
    'Kuro Games'
];

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
    setTimeout(() => toast.classList.add('show'), 50);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// --- Enhanced Error Logging Handler ---

function handleDecryptionFailure(reason, details = "") {
    const output = document.getElementById('decryptedOutput');
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

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
    showToastPing("Decryption Failed!", "error");

    document.getElementById('statLines').textContent = "ERR";
    document.getElementById('statErrors').textContent = "1";
    document.getElementById('statWarnings').textContent = "0";

    document.getElementById('searchInput').disabled = true;
    document.getElementById('filterErrors').disabled = true;
    document.getElementById('filterErrors').classList.remove('active');
    document.getElementById('filterErrors').style.background = "";
    const filterCVarsBtnFail = document.getElementById('filterCVars');
    if (filterCVarsBtnFail) {
        filterCVarsBtnFail.disabled = true;
        filterCVarsBtnFail.classList.remove('active');
        filterCVarsBtnFail.style.background = "";
    }

    document.getElementById('copyDecBtn').disabled = false;
    document.getElementById('dlDecBtn').disabled = false;
    document.getElementById('dlDecBtn').textContent = "↓ Save Error Log";

    const cards = document.querySelectorAll('.sig-card');
    cards.forEach(card => {
        card.className = 'sig-card';
        const badge = card.querySelector('.sig-badge');
        if (badge) {
            badge.className = 'sig-badge pending';
            badge.textContent = '—';
        }
    });
    const puertsSubtext = document.getElementById('puertsSubtext');
    if (puertsSubtext) puertsSubtext.style.display = 'none';

    resetDetectionUI();
    const detector = document.getElementById('schemeDetector');
    if (detector) detector.classList.add('visible');
    document.getElementById('detectedScheme').textContent = "FAILED";

    document.getElementById('decryptBtn').disabled = false;
    document.getElementById('progressWrap').classList.remove('visible');

    if (window.innerWidth <= 900 && output) {
        output.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// --- Helper: Count how many known plaintext markers appear in a sample ---
function countKeywordMatches(sample) {
    if (!sample) return 0;
    const upperSample = sample.toUpperCase();
    let keywordMatches = 0;
    for (const keyword of PLAINTEXT_KEYWORDS) {
        if (upperSample.includes(keyword.toUpperCase())) {
            keywordMatches++;
        }
    }
    return keywordMatches;
}

// --- Helper: Detect plaintext via keyword scanning ---
function detectPlaintextViaKeywords(buffer) {
    const decoder = new TextDecoder("utf-8", { fatal: false });
    const sample = decoder.decode(buffer.slice(0, Math.min(8192, buffer.length)));

    if (!sample || sample.includes('\ufffd')) return false; // Bad UTF-8

    // If we find 2+ keywords, it's likely plaintext
    return countKeywordMatches(sample) >= 2;
}

/**
 * --- Helper: Fallback scheme detection by content verification ---
 * Some Client.log variants carry a valid Scheme A/B encrypted body but the
 * leading "magic" header bytes don't land exactly on the expected
 * fingerprint (e.g. doesn't start with the "TP" marker). Rather than giving
 * up, this tries decrypting a sample of the file with BOTH known LUTs, at
 * both the standard 3-byte header offset and a zero offset, and checks the
 * result for strong plaintext markers like "Log file opened". Whichever
 * combination produces the most keyword hits (>= 2) wins, and the file is
 * decrypted in full using that scheme/offset. Returns null if nothing
 * decrypts into recognizable log text, so normal error handling can proceed.
 */
function tryFallbackDecryption(buffer) {
    if (buffer.length === 0) return null;

    const decoder = new TextDecoder('utf-8', { fatal: false });
    const offsetsToTry = buffer.length > 3 ? [3, 0] : [0];
    const schemesToTry = [{ name: 'A', lut: LUT_A }, { name: 'B', lut: LUT_B }];

    let bestMatch = null;
    let bestScore = 0;

    for (const offset of offsetsToTry) {
        const body = buffer.slice(offset);
        if (body.length === 0) continue;

        for (const { name, lut } of schemesToTry) {
            const sampleLen = Math.min(8192, body.length);
            const decryptedSample = new Uint8Array(sampleLen);
            for (let i = 0; i < sampleLen; i++) {
                decryptedSample[i] = lut[body[i]];
            }

            const sample = decoder.decode(decryptedSample);
            if (!sample || sample.includes('\ufffd')) continue; // Garbage decode, not a real text match

            const score = countKeywordMatches(sample);
            if (score >= 2 && score > bestScore) {
                bestScore = score;
                bestMatch = { scheme: name, offset };
            }
        }
    }

    if (!bestMatch) return null;

    // Re-decrypt the FULL body using the winning scheme + offset combo
    const body = buffer.slice(bestMatch.offset);
    const lut = bestMatch.scheme === 'A' ? LUT_A : LUT_B;
    const decrypted = new Uint8Array(body.length);
    for (let i = 0; i < body.length; i++) {
        decrypted[i] = lut[body[i]];
    }

    return { scheme: bestMatch.scheme, data: decrypted, offset: bestMatch.offset, score: bestScore };
}

// --- Decryption Implementation ---

async function decryptFile() {
    if (!selectedFile) {
        handleDecryptionFailure("Missing File", "No file object found in runtime context.");
        return;
    }

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

            if (buffer.length < 3) {
                handleDecryptionFailure(
                    "Truncated Header Signature",
                    `The log file context is only ${buffer.length} bytes long. It is physically too small to hold valid Kuro Games magic decryption tags.`
                );
                return;
            }

            let scheme = null;
            let decryptedData;

            // Try Scheme A header
            if (buffer[1] === FINGERPRINT_A_1 && buffer[2] === FINGERPRINT_A_2) {
                scheme = 'A';
            }
            // Try Scheme B header
            else if (buffer[0] === HEADER_B[0] && buffer[1] === HEADER_B[1] && buffer[2] === HEADER_B[2]) {
                scheme = 'B';
            }

            const detector = document.getElementById('schemeDetector');
            if (detector) detector.classList.add('visible');

            if (scheme) {
                // Decrypt using detected scheme
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
                // No clear encryption header found
                // Check if it's plaintext via keyword scanning
                if (detectPlaintextViaKeywords(buffer)) {
                    // Treat as plaintext
                    decryptedData = buffer;
                    document.getElementById('dotPlain').classList.add('active');
                    document.getElementById('detectedScheme').textContent = "Plaintext";
                } else {
                    // Header magic didn't match either scheme, and it isn't raw plaintext.
                    // It may still be a Scheme A/B log whose file just doesn't start with
                    // the usual "TP"/"LO" marker bytes (truncated header, different build,
                    // partial capture, etc). Try decrypting against both LUTs and look for
                    // a recognizable marker like "Log file opened" before giving up.
                    const fallback = tryFallbackDecryption(buffer);

                    if (fallback) {
                        scheme = fallback.scheme;
                        decryptedData = fallback.data;

                        document.getElementById(scheme === 'A' ? 'dotA' : 'dotB').classList.add('active');
                        document.getElementById('detectedScheme').textContent =
                            `Scheme ${scheme} (fallback match, no header)`;
                    } else {
                        // Check for excessive binary data
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
                                `This target contains illegal binary sequences. It is neither a Scheme A/B log (even with fallback content scanning), nor is it raw, unencrypted log plain text.\n` +
                                `Try searching for plaintext keywords like "Log file opened", "Device profile", or "[GameThread]" in a hex editor.`
                            );
                            return;
                        }

                        // Assume plaintext
                        decryptedData = buffer;
                        document.getElementById('dotPlain').classList.add('active');
                        document.getElementById('detectedScheme').textContent = "Plaintext";
                    }
                }
            }

            if (progressBar) progressBar.style.width = "80%";

            // Decode to UTF-8
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
    const filterCVarsBtn = document.getElementById('filterCVars');
    if (filterCVarsBtn) filterCVarsBtn.disabled = false;
    document.getElementById('copyDecBtn').disabled = false;
    document.getElementById('dlDecBtn').disabled = false;
    document.getElementById('devprofBtn').disabled = false;
    document.getElementById('deviceBtn').disabled = false;

    // Enable CVar filter buttons including CVars Only
    ['cvarResBtn', 'cvarForbBtn', 'cvarCommBtn', 'cvarOnlyBtn'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.disabled = false;
    });

    const cvarOut = document.getElementById('cvarOutput');
    if (cvarOut) { cvarOut.innerHTML = ''; }

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

        // Puerts race condition is a known engine-side scheduling issue on
        // Kuro's end (async JS/C++ boundary), not something caused by the
        // player's device, drivers, or settings — surface that context here.
        if (sig.id === 'puerts') {
            const subtext = document.getElementById('puertsSubtext');
            if (subtext) subtext.style.display = found ? 'block' : 'none';
        }
    });
}

function debouncedSearchLog(query) {
    clearTimeout(searchDebounceTimeout);
    searchDebounceTimeout = setTimeout(() => {
        searchLog(query);
    }, 250);
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
    const output = document.getElementById('decryptedOutput');

    const willActivate = !btn.classList.contains('active');

    // Mutual exclusivity: turn off the CVars Only filter before switching to Errors Only
    if (willActivate) {
        const cvarBtn = document.getElementById('filterCVars');
        if (cvarBtn && cvarBtn.classList.contains('active')) {
            cvarBtn.classList.remove('active');
            cvarBtn.style.background = "";
        }
    }

    const isActive = btn.classList.toggle('active');

    if (isActive) {
        btn.style.background = "var(--jade-mid)";
        const filtered = cachedLogLines.filter(line => /error|failed|fatal/gi.test(line));
        if (output) output.value = filtered.join('\n');
    } else {
        btn.style.background = "";
        if (output) output.value = fullDecryptedText;
    }
}

/**
 * "CVars Only" toggle — shows just the [GameThread] CVar assignment lines
 * and LogConsoleManager output (overrides that were accepted vs ignored),
 * filtered directly into the main output textarea. Mutually exclusive with
 * the Errors Only filter so the textarea always reflects a single, clear view.
 */
function toggleCVarFilter() {
    const btn = document.getElementById('filterCVars');
    if (!btn) return;
    const output = document.getElementById('decryptedOutput');

    const willActivate = !btn.classList.contains('active');

    // Mutual exclusivity: turn off the Errors Only filter before switching to CVars Only
    if (willActivate) {
        const errBtn = document.getElementById('filterErrors');
        if (errBtn && errBtn.classList.contains('active')) {
            errBtn.classList.remove('active');
            errBtn.style.background = "";
        }
    }

    const isActive = btn.classList.toggle('active');

    if (isActive) {
        btn.style.background = "var(--gold-mid)";
        const filtered = extractCVarOnlyLines(cachedLogLines);
        if (output) {
            output.value = filtered.length
                ? filtered.join('\n')
                : "; No [GameThread] or LogConsoleManager CVar lines found in this log.";
        }
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

    const searchInputEl = document.getElementById('searchInput');
    if (searchInputEl) { searchInputEl.disabled = true; searchInputEl.value = ''; }

    const filterErrorsBtn = document.getElementById('filterErrors');
    if (filterErrorsBtn) {
        filterErrorsBtn.disabled = true;
        filterErrorsBtn.classList.remove('active');
        filterErrorsBtn.style.background = "";
    }

    const filterCVarsBtnClear = document.getElementById('filterCVars');
    if (filterCVarsBtnClear) {
        filterCVarsBtnClear.disabled = true;
        filterCVarsBtnClear.classList.remove('active');
        filterCVarsBtnClear.style.background = "";
    }

    ['cvarResBtn', 'cvarForbBtn', 'cvarCommBtn', 'cvarOnlyBtn'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.disabled = true;
    });
    const cvarOut = document.getElementById('cvarOutput');
    if (cvarOut) { cvarOut.innerHTML = ''; }
    const cvarWrapper = document.getElementById('cvarOutputWrapper');
    if (cvarWrapper) cvarWrapper.style.display = 'none';
    if (cvarOut) cvarOut.classList.remove('visible');
    const puertsSubtextClear = document.getElementById('puertsSubtext');
    if (puertsSubtextClear) puertsSubtextClear.style.display = 'none';

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
    forbidden: '🚫 Forbidden CVars — Last Logged Values',
    common: '⚙️  Common CVars — Last Logged Values',
    cvars_only: '📝 All CVars from [GameThread] & LogConsoleManager'
};

/**
 * Find the LAST occurrence of a CVar in the log.
 * Iterates through all lines and keeps updating the match, so final value is the last occurrence.
 * Matches patterns like:
 *   r.ScreenPercentage = 100
 *   r.ScreenPercentage=100
 *   [r.ScreenPercentage:1.0]
 *   [LogConsoleResponse] r.ScreenPercentage = 100 LastSetBy=...
 *   CVar r.ScreenPercentage set to "100"
 * Returns the value string or null.
 */
function findLastCVarValue(lines, cvarName) {
    const escaped = cvarName.replace(/\./g, '\\.').replace(/\*/g, '\\*');

    const bracketPattern = new RegExp(
        '\\[' + escaped + ':\\s*([^\\]]+)\\]',
        'i'
    );

    const standardPattern = new RegExp(
        '\\b' + escaped + '\\s*[=\\s]\\s*"?([\\d.\\-+eE]+)"?',
        'i'
    );

    // Handles LogConsoleManager set/ignore messages, e.g.:
    //   Setting the console variable 'r.X' with 'SetByConsole' to '100'
    //   Setting the console variable 'r.X' with 'SetByScalability' was ignored
    //     as it is lower priority than the previous 'SetByConsole'. Value remains '100'
    // Both message forms report the CVar's true effective value at that point in
    // the log — including the "ignored" case, where a lower-priority system tried
    // to override the value but was rejected, and the value held instead. Without
    // this, a rejected/ignored attempt's value could get silently overridden by an
    // earlier (now-superseded) match, masking what's actually in effect.
    const consoleManagerPattern = new RegExp(
        "console variable\\s+['\"]" + escaped + "['\"][\\s\\S]*?\\b(?:to|remains)\\b\\s*(?:at\\s+)?['\"]([^'\"]+)['\"]",
        'i'
    );

    let last = null;
    for (let i = 0; i < lines.length; i++) {
        let m = lines[i].match(bracketPattern);
        if (m) {
            last = m[1].trim();
            continue;
        }
        m = lines[i].match(consoleManagerPattern);
        if (m) {
            last = m[1].trim();
            continue;
        }
        m = lines[i].match(standardPattern);
        if (m) {
            last = m[1];
        }
    }
    return last;
}

/**
 * Detect Vulkan usage and version from the decrypted log.
 */
function detectVulkanInfo(lines) {
    let vulkanLine = null;
    let version = null;

    const rhi = /(?:using|selected|initializing|created|RHI)\s+vulkan|vulkan\s+(?:RHI|renderer|backend|device)/i;
    const ver = /vulkan\s*(?:api\s*)?(?:version|ver|v)[\s:=]*(\d+\.\d+[\d.]*)/i;
    const ver2 = /(?:api\s*version|VkPhysicalDeviceProperties)[\s\S]{0,60}?(\d+\.\d+\.\d+)/i;
    const ver3 = /\bVK_API_VERSION[\s=:]*(\d+[\._]\d+[\._]\d+)/i;

    for (let i = 0; i < lines.length; i++) {
        const l = lines[i];
        if (rhi.test(l) && !vulkanLine) vulkanLine = l.trim();
        const mv = l.match(ver) || l.match(ver2) || l.match(ver3);
        if (mv) version = mv[1].replace(/_/g, '.');
    }
    return { vulkanLine, version };
}

/**
 * Extract CVar lines from [GameThread] and LogConsoleManager sections.
 * Shows all CVar assignments and command output from these sources.
 */
function extractCVarOnlyLines(lines) {
    const cvarLines = [];

    for (const line of lines) {
        // Match GameThread CVar assignments: [GameThread] ... CVar ... or SetByXXX or assignment patterns
        if (line.includes('[GameThread]')) {
            if (/\br\.[a-zA-Z].*[=\s]/i.test(line) || /\bCVar\b/i.test(line) || /\bset\s+(to|by)/i.test(line)) {
                cvarLines.push(line.trim());
            }
        }
        // Match LogConsoleManager output - typically shows cvar overrides/responses
        else if (line.includes('LogConsoleManager') || line.includes('[LogConsoleResponse]')) {
            if (/\br\.[a-zA-Z]/i.test(line) || /override|set|value|response/i.test(line)) {
                cvarLines.push(line.trim());
            }
        }
    }

    return cvarLines;
}

function showCVarValues(type) {
    const out = document.getElementById('cvarOutput');
    const wrapper = document.getElementById('cvarOutputWrapper');
    if (!out) return;
    if (!fullDecryptedText) {
        if (wrapper) wrapper.style.display = 'none';
        return;
    }

    const lines = cachedLogLines.length ? cachedLogLines : fullDecryptedText.split('\n');
    const label = GROUP_LABELS[type];
    const rows = [];

    rows.push(`<span class="cvar-line-head">${label}</span>\n`);

    if (type === 'cvars_only') {
        // Show all CVar lines from GameThread and LogConsoleManager
        const cvarLines = extractCVarOnlyLines(lines);
        if (cvarLines.length === 0) {
            rows.push(`<span class="cvar-line-miss">No CVar lines found in [GameThread] or LogConsoleManager</span>\n`);
        } else {
            for (const line of cvarLines) {
                rows.push(`<span class="cvar-line-vulk">${line}</span>\n`);
            }
        }
    } else {
        // Show specific CVar groups with last logged values
        const cvars = CVAR_GROUPS[type];

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
    }

    out.innerHTML = rows.join('');
    out.classList.add('visible');
    if (wrapper) wrapper.style.display = 'block';
}

// --- Close Panel Functions ---

function closeDevicePanel() {
    const resultDiv = document.getElementById('deviceResult');
    if (resultDiv) resultDiv.style.display = 'none';
}

function closeDeviceProfilePanel() {
    const resultDiv = document.getElementById('devprofResult');
    if (resultDiv) resultDiv.style.display = 'none';
}

function closeCVarPanel() {
    const wrapper = document.getElementById('cvarOutputWrapper');
    if (wrapper) wrapper.style.display = 'none';
    const out = document.getElementById('cvarOutput');
    if (out) out.classList.remove('visible');
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
    let rawModel = "";

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

    // Priority 2: SKU/model-code to branded name lookup (partial match)
    const modelMap = {
        "2311DRK48G": "Poco X6 Pro 5G",
        "23113RKC6C": "Xiaomi Redmi K70E",
        "23127PN0CC": "Xiaomi 14 Pro",
        "23116PN5BC": "Xiaomi 14 Ultra",
        "CPH2581": "OnePlus 12R",
        "PJD110": "OnePlus 12",
        "SM-S928": "Samsung Galaxy S24 Ultra",
        "SM-S926": "Samsung Galaxy S24+",
        "SM-S921": "Samsung Galaxy S24",
        "SM-F946": "Samsung Galaxy Z Fold 5",
        "SM-A546": "Samsung Galaxy A54 5G",
        "SM-A546": "Samsung Galaxy A54 5G",
        "22081212UG": "Xiaomi 12T Pro",
        "2210132G": "Xiaomi 12",
        "NE2215": "OnePlus 10 Pro",
        "CPH2413": "OnePlus 10T",
        "PGKM10": "OnePlus 10T",
        "PGT110": "OnePlus 11",
        "RMX3310": "Realme GT Neo 3",
        "RMX3741": "Realme GT 5",
        "RMX3831": "Realme GT5 Pro",
        "V2309A": "vivo X100",
        "V2324A": "vivo X100 Pro",
        "SM-G998": "Samsung Galaxy S21 Ultra",
        "SM-G996": "Samsung Galaxy S21+",
        "SM-G991": "Samsung Galaxy S21",
        "SM-S911": "Samsung Galaxy S23",
        "SM-S916": "Samsung Galaxy S23+",
        "SM-S918": "Samsung Galaxy S23 Ultra",
        "XT2301": "Motorola Edge 40 Pro",
        "XT2341": "Motorola Edge 50 Ultra",
        "23049PCD8G": "Redmi Note 12 Turbo",
        "2304FPN6DC": "Poco F5",
        "23013PC75G": "Poco X5 Pro 5G"
    };

    const looksLikeBranded = rawModel && /\s/.test(rawModel) && rawModel.length > 4;

    if (!looksLikeBranded) {
        const searchStr = (rawModel + ' ' + rawProfile).toUpperCase();
        let mapped = false;
        for (const [key, val] of Object.entries(modelMap)) {
            if (searchStr.includes(key.toUpperCase())) {
                rawModel = val;
                mapped = true;
                break;
            }
        }
        if (!mapped) {
            const p = rawProfile.toLowerCase();
            if (p.includes('pocox6pro')) rawModel = "Poco X6 Pro 5G";
            else if (p.includes('pocox5pro')) rawModel = "Poco X5 Pro 5G";
            else if (p.includes('pocof5')) rawModel = "Poco F5";
            else if (p.includes('s24ultra')) rawModel = "Samsung Galaxy S24 Ultra";
            else if (p.includes('s24')) rawModel = "Samsung Galaxy S24";
            else if (p.includes('s23ultra')) rawModel = "Samsung Galaxy S23 Ultra";
            else if (p.includes('s23')) rawModel = "Samsung Galaxy S23";
            else if (p.includes('onep12')) rawModel = "OnePlus 12";
            else if (p.includes('mi14ultra')) rawModel = "Xiaomi 14 Ultra";
            else if (p.includes('mi14pro')) rawModel = "Xiaomi 14 Pro";
            else if (p.includes('mi14')) rawModel = "Xiaomi 14";
            else rawModel = rawProfile.replace(/([A-Z])/g, ' $1').trim() || "Generic Android Device";
        }
    }

    const resultDiv = document.getElementById('devprofResult');
    const nameSpan = document.getElementById('devprofName');
    const deviceSpan = document.getElementById('retailDeviceName');

    if (nameSpan) nameSpan.textContent = rawProfile;
    if (deviceSpan) deviceSpan.textContent = rawModel;
    if (resultDiv) resultDiv.style.display = 'block';
    showToastPing("Profile metrics resolved!");
}

// --- Device Initialization Info Extraction ---

function extractDeviceInfo() {
    const output = document.getElementById('decryptedOutput');
    const source = fullDecryptedText || (output ? output.value : "");

    if (!source) {
        showToastPing("No log content to scan.", "error");
        return;
    }

    if (!source.includes('初始化当前设备基本信息')) {
        showToastPing("Device initialization info not found in log.", "error");
        return;
    }

    const fieldsToExtract = [
        'VendorName',
        'CPUBrand',
        'DeviceName',
        'BaseProfileName',
        'DriverVersion',
        'PhysicalGBRam',
        'VideoGbRam',
        'DeviceScore',
        'RHIName',
        'HardwareLevel',
        'DeviceType',
        'QualityRange',
        'MobileDeviceModel',
        'LowMemoryDeviceMark'
    ];

    const outputLines = [];
    let foundAny = false;

    for (const fieldName of fieldsToExtract) {
        const searchStr = `[${fieldName}:`;
        const startIdx = source.indexOf(searchStr);

        if (startIdx !== -1) {
            let closingIdx = source.indexOf(']', startIdx);

            if (closingIdx !== -1) {
                const afterColon = startIdx + searchStr.length;
                const value = source.substring(afterColon, closingIdx).trim();
                outputLines.push(`[${fieldName}: ${value}]`);
                foundAny = true;
            }
        }
    }

    if (!foundAny) {
        showToastPing("No device fields found in log.", "error");
        return;
    }

    const resultDiv = document.getElementById('deviceResult');
    const contentDiv = document.getElementById('deviceInfoContent');

    if (contentDiv) {
        contentDiv.innerHTML = outputLines.map(line =>
            `<div>${line}</div>`
        ).join('');
    }

    if (resultDiv) resultDiv.style.display = 'block';
    showToastPing("Device info extracted!");
}

function copyDeviceInfo() {
    const contentDiv = document.getElementById('deviceInfoContent');
    if (!contentDiv) return;

    const text = Array.from(contentDiv.querySelectorAll('div'))
        .map(div => div.textContent)
        .join('\n');

    if (text) {
        navigator.clipboard.writeText(text).then(() => {
            showToastPing("Device info copied to clipboard!");
        });
    }
}

// --- Expose to global scope ---
window.triggerFileInput = triggerFileInput;
window.handleDragOver = handleDragOver;
window.handleDragLeave = handleDragLeave;
window.handleDrop = handleDrop;
window.handleFileSelect = handleFileSelect;
window.decryptFile = decryptFile;
window.clearDecryptor = clearDecryptor;
window.debouncedSearchLog = debouncedSearchLog;
window.toggleErrorFilter = toggleErrorFilter;
window.toggleCVarFilter = toggleCVarFilter;
window.copyDecrypted = copyDecrypted;
window.downloadDecrypted = downloadDecrypted;
window.obtainDeviceProfile = obtainDeviceProfile;
window.copyDeviceProfile = copyDeviceProfile;
window.extractDeviceInfo = extractDeviceInfo;
window.copyDeviceInfo = copyDeviceInfo;
window.showCVarValues = showCVarValues;
window.closeDevicePanel = closeDevicePanel;
window.closeDeviceProfilePanel = closeDeviceProfilePanel;
window.closeCVarPanel = closeCVarPanel;