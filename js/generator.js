/**
 * WuWa Portal — Engine.ini Configuration Matrix
 * Strongly mapped to Arglax's Working V3.x Stable Profiles
 */
const ARGLAX_PRESETS = {
    high: { // Stable Config A (High-End Master File)
        systemSettings: [
            "; --- Arglax Stable Config A (High End) ---",
            "r.StaticMeshLODDistanceScale=0.95",
            "wp.Runtime.KuroRuntimeStreamingRangeOverallScale=2.0",
            "r.TemporalAAQuality=2",
            "r.BasePassOutputsVelocity=1",
            "r.ShadowQuality=3",
            "r.Shadow.MaxResolution=1024",
            "r.AmbientOcclusionLevels=2",
            "r.Kuro.Foliage.EnableFoliageCulling=0",
            "r.Streaming.QualityExtraLODBiasSetting=0",
            "r.VolumetricFog=1",
            "r.LightShafts=1"
        ],
        deviceProfiles: "r.KuroFI.Enable=1\nr.Streaming.PoolSize=3000"
    },
    balanced: { // Stable Config B (Mid-Range Optimal Setup)
        systemSettings: [
            "; --- Arglax Stable Config B (Balanced Mid End) ---",
            "r.StaticMeshLODDistanceScale=0.75",
            "wp.Runtime.KuroRuntimeStreamingRangeOverallScale=1.2",
            "r.TemporalAAQuality=1",
            "r.ShadowQuality=1",
            "r.Shadow.MaxResolution=512",
            "r.AmbientOcclusionLevels=1",
            "r.ContactShadows=0",
            "r.Kuro.Foliage.EnableFoliageCulling=1",
            "r.Streaming.QualityExtraLODBiasSetting=450",
            "r.VolumetricFog=0",
            "r.LightShafts=1"
        ],
        deviceProfiles: "r.KuroFI.Enable=1\nr.Streaming.PoolSize=2000"
    },
    low: { // Stable Config C (Low End / Battery Saver Potato Profile)
        systemSettings: [
            "; --- Arglax Stable Config C (Low End / Max Performance) ---",
            "r.StaticMeshLODDistanceScale=0.50",
            "wp.Runtime.KuroRuntimeStreamingRangeOverallScale=0.8",
            "r.TemporalAAQuality=0",
            "r.ShadowQuality=0",
            "r.Shadow.MaxResolution=128",
            "r.AmbientOcclusionLevels=0",
            "r.ContactShadows=0",
            "r.Kuro.Foliage.EnableFoliageCulling=1",
            "r.LandscapeLOD0ScreenSizeScale=0.2",
            "r.Streaming.QualityExtraLODBiasSetting=975",
            "r.VolumetricFog=0",
            "r.LightShafts=0",
            "r.SSR.MaxRoughness=0"
        ],
        deviceProfiles: "r.KuroFI.Enable=0\nr.Streaming.PoolSize=1200"
    }
};

let activeTabContext = 'engine'; // Automatically default view context
let basePresetKey = 'balanced';

document.addEventListener("DOMContentLoaded", () => {
    // Initialize standard configuration build sequence on load
    applyPreset('balanced');

    // Bind change hooks to drop-down selection elements to trigger real-time updates
    const dropDownA = document.getElementById('deviceProfile');
    const dropDownB = document.getElementById('targetQuality');
    const customSnippetBox = document.getElementById('customSnippet');

    if (dropDownA) dropDownA.addEventListener('change', generateConfig);
    if (dropDownB) dropDownB.addEventListener('change', () => {
        // Sync target selection directly to preset profiles
        const val = dropDownB.value;
        if (val === 'high') applyPreset('high');
        else if (val === 'balanced') applyPreset('balanced');
        else if (val === 'performance' || val === 'ultraperf') applyPreset('low');
    });

    if (customSnippetBox) {
        customSnippetBox.addEventListener('input', generateConfig);
    }
});

// Snappy Toggle Container Element Pipeline 
function toggleOptionWrapper(checkboxId) {
    const targetBox = document.getElementById(checkboxId);
    if (targetBox) {
        targetBox.checked = !targetBox.checked;

        // Toggle active visual states on wrapper container blocks
        const itemWrapper = targetBox.closest('.toggle-item');
        if (itemWrapper) {
            if (targetBox.checked) itemWrapper.classList.add('selected-active');
            else itemWrapper.classList.remove('selected-active');
        }

        // Instantly generate and update output box in real time
        generateConfig();
    }
}

function applyPreset(presetType) {
    // Map alternative presets seamlessly down into Arglax profiles
    if (presetType === 'stock') basePresetKey = 'balanced';
    else if (presetType === 'eyecandy') basePresetKey = 'high';
    else if (presetType === 'smooth' || presetType === 'competitive') basePresetKey = 'balanced';
    else basePresetKey = presetType;

    // Adjust drop-down selection interface states
    const qualitySelector = document.getElementById('targetQuality');
    if (qualitySelector) qualitySelector.value = basePresetKey === 'low' ? 'performance' : basePresetKey;

    // Sync button highlight states across your HTML file preset row
    document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));

    // Auto sync configuration checks based on preset strict rules
    const fsrBox = document.getElementById('fsr3');
    const gsrBox = document.getElementById('sgsr2');

    if (basePresetKey === 'high') {
        if (fsrBox) fsrBox.checked = true;
        if (gsrBox) gsrBox.checked = true;
    } else if (basePresetKey === 'low') {
        if (fsrBox) fsrBox.checked = false;
        if (gsrBox) gsrBox.checked = false;
    }

    // Sync all check state elements visuals
    document.querySelectorAll('.toggle-checkbox').forEach(box => {
        const wrap = box.closest('.toggle-item');
        if (wrap) {
            if (box.checked) wrap.classList.add('selected-active');
            else wrap.classList.remove('selected-active');
        }
    });

    generateConfig();
}

function generateConfig() {
    const outputArea = document.getElementById('configOutput');
    if (!outputArea) return;

    const chosenProfile = ARGLAX_PRESETS[basePresetKey] || ARGLAX_PRESETS['balanced'];
    const selectedSoC = document.getElementById('deviceProfile')?.value || 'generic';

    let configBuilder = "";

    // ── Engine.ini Assembly Blueprint ──
    configBuilder += "[Core.System]\n";
    configBuilder += "Paths=../../../Engine/Content\n\n";
    configBuilder += "[SystemSettings]\n";
    configBuilder += "; SoC Hardware Target Context: " + selectedSoC.toUpperCase() + "\n";

    // Inject Stable CVar Lines
    chosenProfile.systemSettings.forEach(cvarLine => {
        configBuilder += cvarLine + "\n";
    });

    // Read interactive toggle states dynamically in real-time
    if (document.getElementById('fsr3')?.checked) {
        configBuilder += "r.FidelityFX.FSR3.Enable=1\nr.FidelityFX.FSR3.FrameInterpolation=1\n";
    }
    if (document.getElementById('sgsr2')?.checked) {
        configBuilder += "kuro.SGSR2.Enable=1\nr.GSR.UpscaleMethod=1\n";
    }
    if (document.getElementById('taa')?.checked) {
        configBuilder += "r.AntiAliasingMethod=2\nr.TemporalAA.Upsampling=1\n";
    }

    // Capture User-Pasted Custom Snippets instantly
    const customSnippet = document.getElementById('customSnippet')?.value || "";
    if (customSnippet.trim() !== "") {
        configBuilder += "\n; ─── Added Custom User Overrides ───\n";
        configBuilder += customSnippet.trim() + "\n";
    }

    // Output generated configuration data directly to the user display box
    outputArea.textContent = configBuilder;
}

// Simple fallback logic to clear configuration fields cleanly
function clearAll() {
    document.querySelectorAll('.toggle-checkbox').forEach(box => box.checked = false);
    document.querySelectorAll('.toggle-item').forEach(w => w.classList.remove('selected-active'));
    const snippet = document.getElementById('customSnippet');
    if (snippet) snippet.value = "";
    generateConfig();
}