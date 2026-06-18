/* ============================================================
   WuWa Portal — engine-generator.html Script
   Builds an Engine.ini [SystemSettings] block from tab toggles,
   dropdowns, quick presets, and an optional custom snippet.
   ============================================================ */

let activePresetKey = "balanced"; // stock | smooth | balanced | eyecandy | competitive
let currentRawOutputText = "";    // Holds plain text for clipboard/download

const PRESET_LABELS = {
    stock: "Stock",
    smooth: "Smooth 60",
    balanced: "Balanced",
    eyecandy: "Eye Candy",
    competitive: "Competitive",
    custom: "Custom"
};

// Toggle checkbox IDs this preset forces ON. Any toggle not listed here
// is forced OFF when the preset is applied (clean slate per preset).
const PRESETS = {
    stock: {
        on: ["taa", "bloom", "ao", "distshadow", "gpucrash"],
        selects: { mcsf: "1.0", ssp: "100", smlod: "1.0", sklod: "0", streamrange: "1.2", shadowQuality: "2", csmcascades: "4", poolsize: "2000", vulkanval: "0" }
    },
    smooth: {
        on: ["taa", "earlyz", "hzb", "foliagecull", "particlelod", "distcull", "ao", "distshadow", "gpucrash", "thermal"],
        selects: { mcsf: "1.0", ssp: "85", smlod: "0.8", sklod: "1", streamrange: "1.0", shadowQuality: "1", csmcascades: "2", poolsize: "1800", vulkanval: "0" }
    },
    balanced: {
        on: ["taa", "earlyz", "hzb", "foliagecull", "particlelod", "distcull", "bloom", "ao", "distshadow", "gpucrash"],
        selects: { mcsf: "1.0", ssp: "100", smlod: "0.8", sklod: "0", streamrange: "1.2", shadowQuality: "2", csmcascades: "2", poolsize: "2000", vulkanval: "0" }
    },
    eyecandy: {
        on: ["taa", "earlyz", "hzb", "fsr3", "bloom", "dof", "lensflare", "ao", "motionblur", "volumetricfog", "distshadow", "contactshadow", "gpucrash", "kurofi"],
        selects: { mcsf: "0.0", ssp: "100", smlod: "1.5", sklod: "-1", streamrange: "2.0", shadowQuality: "4", csmcascades: "4", poolsize: "3000", vulkanval: "0" }
    },
    competitive: {
        on: ["earlyz", "hzb", "foliagecull", "particlelod", "distcull", "distshadow", "gpucrash", "thermal"],
        selects: { mcsf: "1.0", ssp: "75", smlod: "0.5", sklod: "1", streamrange: "0.8", shadowQuality: "0", csmcascades: "1", poolsize: "1500", vulkanval: "0" }
    }
};

// All toggle checkbox IDs tracked across every tab (used by clearAll / preset apply)
const ALL_TOGGLE_IDS = [
    "fsr3", "sgsr2", "taa",
    "earlyz", "hzb", "foliagecull", "particlelod", "staticlighting", "distcull",
    "contactshadow", "distshadow",
    "bloom", "dof", "lensflare", "ao", "motionblur", "volumetricfog", "hdr",
    "robustbuffer", "gpucrash", "vkpool", "threadaffinity", "thermal", "kurofi",
    "shaderprecomp", "asynccomp", "mfrc", "configmonitor"
];

// CVar emitters: id -> function returning array of raw INI lines (or null/empty to skip)
const CVAR_EMITTERS = {
    fsr3: () => ["r.FidelityFX.FSR3.Enable=1", "r.FidelityFX.FSR3.FrameInterpolation=1"],
    sgsr2: () => ["kuro.SGSR2.Enable=1", "r.GSR.UpscaleMethod=1"],
    taa: () => ["r.AntiAliasingMethod=2", "r.TemporalAA.Upsampling=1"],

    earlyz: () => ["r.EarlyZPass=3", "r.EarlyZPassMovable=1"],
    hzb: () => ["r.HZBOcclusion=1"],
    foliagecull: () => ["grass.DensityScale=0.5", "foliage.DensityScale=0.6", "r.DetailMode=1"],
    particlelod: () => ["fx.NiagaraMaxGPUParticlesSpawnPerFrame=256", "r.ParticleLODBias=1"],
    staticlighting: () => ["r.AllowStaticLighting=1", "r.SupportAllShaderPermutations=0"],
    distcull: () => ["r.MinScreenRadiusForLights=0.03", "r.MinScreenRadiusForDepthPrepass=0.03"],

    contactshadow: () => ["r.ContactShadows=1"],
    distshadow: () => ["r.DistanceFieldShadowing=1"],

    bloom: () => ["r.BloomQuality=4"],
    dof: () => ["r.DepthOfFieldQuality=2"],
    lensflare: () => ["r.LensFlareQuality=1"],
    ao: () => ["r.AmbientOcclusionLevels=1", "r.AmbientOcclusionRadiusScale=0.8"],
    motionblur: () => ["r.MotionBlurQuality=1"],
    volumetricfog: () => ["r.VolumetricFog=1"],
    hdr: () => ["r.HDR.EnableHDROutput=1", "r.HDR.Display.OutputDevice=6"],

    robustbuffer: () => ["r.Vulkan.RobustBufferAccess=1"],
    gpucrash: () => ["r.GPUCrashDebugging=1", "r.GPUCrashDump=1"],
    vkpool: () => ["r.Vulkan.GarbageCollectEveryFrame=1", "r.Vulkan.PoolSizeScale=1.5"],
    threadaffinity: () => ["r.Android.DisableThreadedRendering=0", "TaskGraph.NumForegroundWorkers=2"],
    thermal: () => ["r.Mobile.EnergySavingFrameInterpolation=0", "r.DontLimitOnBattery=1"],
    kurofi: () => ["r.KuroFI.Enable=1"],

    shaderprecomp: () => ["r.ShaderPipelineCache.Enabled=1", "r.ShaderPipelineCache.BatchSize=128"],
    asynccomp: () => ["r.Vulkan.EnableAsyncCompute=1"],
    mfrc: () => ["kuro.MFRC.Enable=0"]
    // configmonitor is informational-only — handled separately in generateConfig()
};

// CVars commonly observed being stripped by Kuro's ConfigMonitor watchdog on launch.
// Surfaced only when the "configmonitor" info toggle is checked.
const CONFIGMONITOR_WATCH_CVARS = [
    "r.GPUCrashDebugging", "r.Vulkan.RobustBufferAccess", "r.ShaderPipelineCache.Enabled", "kuro.MFRC.Enable"
];

document.addEventListener("DOMContentLoaded", () => {
    applyPreset("balanced");
});

// ── Tab Switching ──────────────────────────────────────────
function switchTab(tabName, btn) {
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
    const panel = document.getElementById(`tab-${tabName}`);
    if (panel) panel.classList.add("active");

    document.querySelectorAll("#catTabs .tab-btn").forEach(b => b.classList.remove("active"));
    if (btn) btn.classList.add("active");
}

// ── Accordion Toggle ───────────────────────────────────────
function toggleAccordion(trigger) {
    const item = trigger.closest(".accordion-item");
    if (item) item.classList.toggle("open");
}

// ── Toggle Option (checkbox + visual state) ─────────────────
function toggleOption(id, event) {
    const cb = document.getElementById(id);
    if (!cb) return;

    if (event && event.target === cb) {
        // Browser already toggled native checkbox state
    } else {
        cb.checked = !cb.checked;
    }

    const wrap = cb.closest(".toggle-item");
    if (wrap) wrap.classList.toggle("selected-active", cb.checked);

    markCustom();
    generateConfig();
}

// Quality target dropdown maps directly onto a preset
function onTargetQualityChange() {
    const val = document.getElementById("targetQuality")?.value;
    if (val === "high") applyPreset("eyecandy");
    else if (val === "balanced") applyPreset("balanced");
    else if (val === "performance") applyPreset("smooth");
    else if (val === "ultraperf") applyPreset("competitive");
}

// Marks the active preset as "Custom" once the user manually edits a toggle/select
// without going through applyPreset(). Keeps the meta pill honest.
let suppressCustomMark = false;
function markCustom() {
    if (suppressCustomMark) return;
    activePresetKey = "custom";
    document.querySelectorAll(".preset-btn").forEach(b => b.classList.remove("active"));
}

// ── Apply Preset ───────────────────────────────────────────
function applyPreset(presetKey) {
    const preset = PRESETS[presetKey];
    if (!preset) return;

    suppressCustomMark = true;
    activePresetKey = presetKey;

    // Reset every tracked toggle to OFF, then turn on what the preset specifies
    ALL_TOGGLE_IDS.forEach(id => {
        const cb = document.getElementById(id);
        if (!cb) return;
        cb.checked = preset.on.includes(id);
        const wrap = cb.closest(".toggle-item");
        if (wrap) wrap.classList.toggle("selected-active", cb.checked);
    });

    // Apply select/dropdown values
    Object.entries(preset.selects).forEach(([id, val]) => {
        const el = document.getElementById(id);
        if (el) el.value = val;
    });

    // Sync quick-preset button highlight states
    document.querySelectorAll(".preset-btn").forEach(btn => btn.classList.remove("active"));
    const btnMap = { stock: 0, smooth: 1, balanced: 2, eyecandy: 3, competitive: 4 };
    const idx = btnMap[presetKey];
    if (idx !== undefined) {
        const btns = document.querySelectorAll(".preset-row .preset-btn");
        if (btns[idx]) btns[idx].classList.add("active");
    }

    // Sync the target quality dropdown to match (best-effort reverse mapping)
    const qualitySelector = document.getElementById("targetQuality");
    if (qualitySelector) {
        const reverseMap = { eyecandy: "high", balanced: "balanced", smooth: "performance", competitive: "ultraperf", stock: "balanced" };
        qualitySelector.value = reverseMap[presetKey] || "balanced";
    }

    suppressCustomMark = false;
    generateConfig();
}

// ── Config Generator ──────────────────────────────────────
function generateConfig() {
    const out = document.getElementById("configOutput");
    if (!out) return;

    let rawLines = [];
    let htmlLines = [];

    function addLine(text) {
        rawLines.push(text);
        if (text.startsWith(";")) {
            htmlLines.push(`<span style="color: lightgreen;">${escapeHtml(text)}</span>`);
        } else {
            htmlLines.push(`<span style="color: var(--jade-bright);">${escapeHtml(text)}</span>`);
        }
    }

    addLine("; ──────────");
    addLine("; WuWa Engine.ini [SystemSettings] — Generated by WuWa Portal");
    addLine(`; Preset  : ${PRESET_LABELS[activePresetKey] || "Custom"}`);
    addLine("; Tool Link · https://arglax.github.io/Mobile-WuWa-Config/engine-generator.html");
    addLine("; ──────────");
    addLine("");
    addLine("[SystemSettings]");

    let cvarCount = 0;
    const seen = new Set();

    function emitIfChecked(id, sectionLabel) {
        const cb = document.getElementById(id);
        if (!cb || !cb.checked) return;
        const fn = CVAR_EMITTERS[id];
        if (!fn) return;
        const lines = fn();
        if (!lines || !lines.length) return;
        if (sectionLabel && !seen.has(sectionLabel)) {
            addLine(`; -- ${sectionLabel} --`);
            seen.add(sectionLabel);
        }
        lines.forEach(l => { addLine(l); cvarCount++; });
    }

    // ── Resolution tab ──
    addLine("; -- Resolution Scaling --");
    addLine(`r.MobileContentScaleFactor=${document.getElementById("mcsf")?.value || "1.0"}`);
    cvarCount++;
    addLine(`r.SecondaryScreenPercentage.GameViewport=${document.getElementById("ssp")?.value || "100"}`);
    cvarCount++;

    emitIfChecked("fsr3", "Upscaling & Anti-Aliasing");
    emitIfChecked("sgsr2", "Upscaling & Anti-Aliasing");
    emitIfChecked("taa", "Upscaling & Anti-Aliasing");

    // ── Rendering tab ──
    emitIfChecked("earlyz", "Core Rendering");
    emitIfChecked("hzb", "Core Rendering");
    emitIfChecked("foliagecull", "Core Rendering");
    emitIfChecked("particlelod", "Core Rendering");
    emitIfChecked("staticlighting", "Core Rendering");

    addLine("; -- LOD & Draw Distance --");
    addLine(`r.StaticMeshLODDistanceScale=${document.getElementById("smlod")?.value || "0.8"}`);
    cvarCount++;
    addLine(`r.SkeletalMeshLODBias=${document.getElementById("sklod")?.value || "0"}`);
    cvarCount++;
    addLine(`wp.Runtime.KuroRuntimeStreamingRangeOverallScale=${document.getElementById("streamrange")?.value || "1.2"}`);
    cvarCount++;
    emitIfChecked("distcull", "LOD & Draw Distance");

    // ── Shadows tab ──
    addLine("; -- Cascade Shadow Maps (CSM) --");
    addLine(`r.ShadowQuality=${document.getElementById("shadowQuality")?.value || "2"}`);
    cvarCount++;
    addLine(`r.Shadow.CSM.MaxCascades=${document.getElementById("csmcascades")?.value || "2"}`);
    cvarCount++;
    emitIfChecked("contactshadow", "Cascade Shadow Maps (CSM)");
    emitIfChecked("distshadow", "Cascade Shadow Maps (CSM)");

    // ── Post FX tab ──
    emitIfChecked("bloom", "Post-Processing Effects");
    emitIfChecked("dof", "Post-Processing Effects");
    emitIfChecked("lensflare", "Post-Processing Effects");
    emitIfChecked("ao", "Post-Processing Effects");
    emitIfChecked("motionblur", "Post-Processing Effects");
    emitIfChecked("volumetricfog", "Post-Processing Effects");
    emitIfChecked("hdr", "Post-Processing Effects");

    // ── GPU / Driver tab ──
    emitIfChecked("robustbuffer", "GPU Driver Tweaks");
    emitIfChecked("gpucrash", "GPU Driver Tweaks");
    emitIfChecked("vkpool", "GPU Driver Tweaks");
    emitIfChecked("threadaffinity", "GPU Driver Tweaks");

    const vulkanval = document.getElementById("vulkanval")?.value || "0";
    if (vulkanval !== "0") {
        if (!seen.has("GPU Driver Tweaks")) { addLine("; -- GPU Driver Tweaks --"); seen.add("GPU Driver Tweaks"); }
        addLine(`r.Vulkan.ValidationLayer=${vulkanval}`);
        cvarCount++;
    }

    addLine("; -- Streaming & Thermal --");
    addLine(`r.Streaming.PoolSize=${document.getElementById("poolsize")?.value || "2000"}`);
    cvarCount++;
    emitIfChecked("thermal", "Streaming & Thermal");
    emitIfChecked("kurofi", "Streaming & Thermal");

    // ── Advanced tab ──
    emitIfChecked("shaderprecomp", "Advanced / Experimental");
    emitIfChecked("asynccomp", "Advanced / Experimental");
    emitIfChecked("mfrc", "Advanced / Experimental");

    if (document.getElementById("configmonitor")?.checked) {
        addLine("; -- ConfigMonitor Watch List --");
        addLine(`; CVars below are commonly stripped by Kuro's ConfigMonitor on launch — recheck after updates:`);
        CONFIGMONITOR_WATCH_CVARS.forEach(c => addLine(`;   ${c}`));
    }

    // ── Custom snippet ──
    const customSnippet = document.getElementById("customSnippet")?.value || "";
    if (customSnippet.trim() !== "") {
        addLine("");
        addLine("; ─── Added Custom User Overrides ───");
        customSnippet.trim().split("\n").forEach(line => addLine(line));
    }

    currentRawOutputText = rawLines.join("\n");
    out.innerHTML = htmlLines.join("\n");

    updateMeta(cvarCount, rawLines.length);
}

function updateMeta(cvars, lineCount) {
    const cvarEl = document.getElementById("cvarCount");
    const lineEl = document.getElementById("lineCount");
    const presetEl = document.getElementById("presetLabel");
    if (cvarEl) cvarEl.textContent = cvars;
    if (lineEl) lineEl.textContent = lineCount;
    if (presetEl) presetEl.textContent = PRESET_LABELS[activePresetKey] || "Custom";
}

function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ── Copy ────────────────────────────────────────────────
function copyConfig() {
    if (!currentRawOutputText) {
        showToast("No config to copy yet.", "error"); return;
    }
    navigator.clipboard.writeText(currentRawOutputText)
        .then(() => showToast("✓ Config copied to clipboard!", "success"))
        .catch(() => showToast("Copy failed — try selecting and copying manually.", "error"));
}

// ── Download ────────────────────────────────────────────
function downloadConfig() {
    if (!currentRawOutputText) {
        showToast("No config to download yet.", "error"); return;
    }
    const blob = new Blob([currentRawOutputText], { type: "text/plain; charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Engine.ini";
    a.click();
    URL.revokeObjectURL(url);
    showToast("↓ Engine.ini downloaded!", "success");
}

// ── Reset All ────────────────────────────────────────────
function clearAll() {
    suppressCustomMark = true;

    ALL_TOGGLE_IDS.forEach(id => {
        const cb = document.getElementById(id);
        if (!cb) return;
        cb.checked = false;
        const wrap = cb.closest(".toggle-item");
        if (wrap) wrap.classList.remove("selected-active");
    });

    const snippet = document.getElementById("customSnippet");
    if (snippet) snippet.value = "";

    suppressCustomMark = false;
    applyPreset("balanced");
    showToast("↺ All settings reset to Balanced.", "info");
}

// ── Toast Notifications ───────────────────────────────────
function showToast(message, type = "success") {
    const container = document.getElementById("toastContainer");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = `toast-ping ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    requestAnimationFrame(() => { toast.classList.add("show"); });
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 350);
    }, 3000);
}

// ── Preview Handlers ─────────────────────────────────────
function showPreview() {
    generateConfig();
    const configOut = document.getElementById("configOutput");
    const previewOut = document.getElementById("preview-content");
    if (configOut && previewOut) {
        previewOut.innerHTML = configOut.innerHTML;
    }
    const modal = document.getElementById("preview-modal");
    if (modal) modal.classList.add("show");
}

function closePreview() {
    const modal = document.getElementById("preview-modal");
    if (modal) modal.classList.remove("show");
}