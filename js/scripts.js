/***************************************************************************
   * Full integrated scripts:
   * - texture slider generation (saves to localStorage.textureConfig)
   * - shadow slider generation (saves to localStorage.shadowConfig)
   * - reset all sliders
   * - generate button writes localStorage.generatedConfig and navigates
   ***************************************************************************/

// === TEXTURE SYSTEM ===
(function () {
    const slider = document.getElementById("slider");
    const output = document.getElementById("output");
    const decBtn = document.getElementById("dec");
    const incBtn = document.getElementById("inc");
    const resetBtn = document.getElementById("reset");

    function smoothScale(level, min, max, exponent = 1.3) {
        const t = Math.pow(level / 11, exponent);
        return min + (max - min) * t;
    }

    function generateCommands(level) {
        const streamingBoost = smoothScale(level, 0, 5.5).toFixed(2);
        const groupBoost = smoothScale(level, 1, 10, 1.3).toFixed(2);
        const mipBiasArray = [6, 4, 3, 2, 1, 0, -2, -4, -6, -8, -10, -12];
        const mipLODBias = mipBiasArray[level];

        return `
r.Streaming.GroupBoost.HugeBuildingTextureFactor=${groupBoost}
r.Streaming.GroupBoost.LargeBuildingTextureFactor=${groupBoost}
r.Streaming.GroupBoost.MediumBuildingTextureFactor=${groupBoost}
r.Streaming.GroupBoost.HugeFoliageTextureFactor=${groupBoost}
r.Streaming.GroupBoost.LargeFoliageTextureFactor=${groupBoost}
r.Streaming.GroupBoost.MediumFoliageTextureFactor=${groupBoost}
r.Streaming.GroupBoost.HugeNpcTextureFactor=${groupBoost}
r.Streaming.GroupBoost.LargeNpcTextureFactor=${groupBoost}
r.Streaming.GroupBoost.MediumNpcTextureFactor=${groupBoost}
r.Streaming.GroupBoost.CommonHLODTextureFactor=${groupBoost}
r.Streaming.GroupBoost.LandscapeHLODTextureFactor=${groupBoost}
r.Streaming.GroupBoost.LargeRocTextureFactor=${groupBoost}
r.Streaming.Boost=${streamingBoost}
r.Streaming.MinBoost=${streamingBoost}
r.Streaming.FullyLoadUsedTextures=1
r.MipMapLODBias=${mipLODBias}
r.Streaming.MipBias=-2
`.trim();
    }

    function updateOutput() {
        const level = +slider.value;
        const txt = generateCommands(level);
        output.textContent = txt;
        try { localStorage.setItem("textureConfig", txt); } catch (e) { /* ignore storage errors */ }
    }

    slider.addEventListener("input", updateOutput);
    decBtn.addEventListener("click", () => { slider.value = Math.max(0, +slider.value - 1); updateOutput(); });
    incBtn.addEventListener("click", () => { slider.value = Math.min(11, +slider.value + 1); updateOutput(); });
    resetBtn.addEventListener("click", () => { slider.value = 5; updateOutput(); });

    // initialize from storage or default
    try {
        const stored = localStorage.getItem("textureConfig");
        if (stored) {
            output.textContent = stored;
        } else {
            updateOutput();
        }
    } catch (e) { updateOutput(); }
})();

// === SHADOW SYSTEM ===
(function () {
    let shadowMode = "basic";
    const shadowOutput = document.getElementById("shadowOutput");
    const shadowSlider = document.getElementById("shadowSlider");

    // Decrement / Increment / Reset buttons
    document.getElementById("shadowDec").onclick = () => {
        shadowSlider.value = Math.max(0, +shadowSlider.value - 1);
        updateShadowQuality();
    };
    document.getElementById("shadowInc").onclick = () => {
        shadowSlider.value = Math.min(11, +shadowSlider.value + 1);
        updateShadowQuality();
    };
    document.getElementById("shadowReset").onclick = () => {
        shadowSlider.value = 5;
        updateShadowQuality();
    };

    // Switch between Basic / Advanced mode
    window.setShadowMode = function (mode) {
        shadowMode = mode;
        document.getElementById("shadowMode").innerText =
            "Current Mode: " + mode.charAt(0).toUpperCase() + mode.slice(1);
        updateShadowQuality();
    };

    // Core scaling logic
    window.updateShadowQuality = function () {
        const level = +shadowSlider.value;
        let result = "\n";

        // === Level 0: disable shadows entirely ===
        if (level === 0) {
            result += `r.ShadowQuality=0
r.Shadow.MaxResolution=0
r.Shadow.MinResolution=0
r.Shadow.FarShadow=0
r.DistanceFieldShadowing=0`;
            shadowOutput.textContent = result;
            try { localStorage.setItem("shadowConfig", result); } catch (e) { }
            return;
        }

        // === Shared Power-of-Two Resolution Scaling ===
        let baseRes = 256 * Math.pow(2, (level - 1) / 2.5); // smooth exponential
        baseRes = Math.round(baseRes / 256) * 256; // snap to nearest 256
        if (baseRes > 8192) baseRes = 8192;

        const shadowQuality = Math.min(5, Math.round(1 + level / 2.5));
        const cascades = Math.min(4, Math.ceil(level / 3));
        const distance = Math.round(20000 * Math.pow(level, 2)); // exponential distance
        const pcfSamples = Math.min(64, Math.round(4 + level * 5.4)); // smoother PCF
        const radius = (0.003 - (level / 11) * 0.002).toFixed(4);
        const radiusFar = (0.006 - (level / 11) * 0.003).toFixed(4);

        // === ADVANCED MODE ===
        if (shadowMode === "advanced") {
            result += `
r.ShadowQuality=${shadowQuality}
r.Shadow.CSM.MaxCascades=${cascades}
r.Shadow.CSM.MaxDistance=${distance}
r.Shadow.FarShadowDistanceOverride=${distance}
r.Shadow.CSM0Distance=${Math.round(distance * 0.0025)}
r.Shadow.CSM1Distance=${Math.round(distance * 0.0075)}
r.Shadow.CSM2Distance=${Math.round(distance * 0.05)}
r.Shadow.CSM3Distance=${distance}
r.Shadow.CSM.DistributionExponent=1.15
r.Shadow.TransitionScale=2.0
r.Shadow.FadeExponent=0.25
r.Shadow.DitheredTransitionScale=0.5
r.Shadow.MinResolution=${baseRes / 2}
r.Shadow.MaxResolution=${baseRes}
r.Shadow.MaxCSMResolution=${baseRes}
r.Shadow.PerObjectShadowMapResolution=${baseRes}
r.Shadow.PerObjectResolutionMax=${baseRes}
r.Shadow.PerObjectResolutionMin=${baseRes / 2}
r.Shadow.CSM0ShadowPCFQuality=${Math.min(3, Math.round(level / 4) + 1)}
r.Shadow.CSM1ShadowPCFQuality=${Math.min(3, Math.round(level / 4) + 1)}
r.Shadow.CSM2ShadowPCFQuality=${Math.min(3, Math.round(level / 4) + 1)}
r.Shadow.CSM3ShadowPCFQuality=${Math.min(3, Math.round(level / 4) + 1)}
r.Shadow.FilterMethod=1
r.Shadow.TexelsPerPixel=${(4 + level / 2).toFixed(1)}
r.Shadow.PCFMaxSamples=${pcfSamples}
r.Shadow.TemporalFiltering=${level > 4 ? 1 : 0}
r.Shadow.FadeResolution=1
r.Shadow.CacheWholeSceneShadows=1
r.Shadow.FarShadow=1
r.Shadow.CachedShadowsCastFromMovablePrimitives=1
r.Shadow.EnableParallaxCorrection=1
r.Shadow.EnableParallaxCorrectionCrossFade=1
r.Shadow.RadiusThresholdOverrideEnable=1
r.Shadow.RadiusThreshold=${radius}
r.Shadow.RadiusThresholdFar=${radiusFar}
r.Shadow.RadiusThresholdCSM0=${(radius / 2).toFixed(4)}
r.Shadow.RadiusThresholdCSM1=${(radius / 1.5).toFixed(4)}
r.Shadow.RadiusThresholdCSM2=${(radius * 0.75).toFixed(4)}
r.Shadow.RadiusThresholdCSM3=${radiusFar}
r.ContactShadows=${level >= 3 ? 1 : 0}
r.ContactShadowsStep=${Math.round(16 + level * 4)}
r.ContactShadowsLength=${(10 + level).toFixed(1)}
r.ContactShadowsMinScreenPercent=0.01
r.CapsuleShadows=${level >= 5 ? 1 : 0}
r.CapsuleMaxDirectOcclusionDistance=400
r.CapsuleMinSkySpecularOcclusionDistance=30
r.CapsuleMaxSkySpecularOcclusionDistance=100
r.DistanceFieldShadowing=${level >= 7 ? 1 : 0}
r.DistanceFieldShadowDistance=${level >= 7 ? 2000000 + level * 50000 : 0}
r.DistanceFieldShadowAccuracy=1
r.DistanceFieldShadowBias=0.05
r.DistanceFieldShadowPenumbraScale=0.8
r.DistanceFieldShadowNonDirectionalOffset=0.005
r.DistanceFieldShadowMinDistance=100.0
`.trim();

            // === BASIC MODE ===
        } else {
            result += `
r.ShadowQuality=${shadowQuality}
r.Shadow.MinResolution=${baseRes / 2}
r.Shadow.MaxResolution=${baseRes}
r.Shadow.RadiusThreshold=${radius}
r.Shadow.RadiusThresholdFar=${radiusFar}
r.Shadow.FarShadow=1
r.Shadow.CSM.MaxCascades=${cascades}
r.Shadow.PCFMaxSamples=${pcfSamples}
r.Shadow.TexelsPerPixel=${(4 + level / 2).toFixed(1)}
r.ContactShadows=${level >= 3 ? 1 : 0}
r.DistanceFieldShadowing=${level >= 7 ? 1 : 0}
r.DistanceFieldShadowDistance=${level >= 7 ? 1000000 + level * 40000 : 0}
`.trim();
        }

        // Output + LocalStorage
        shadowOutput.textContent = result;
        try { localStorage.setItem("shadowConfig", result); } catch (e) { }
    };

    // === Initialization ===
    try {
        const stored = localStorage.getItem("shadowConfig");
        if (stored) {
            shadowOutput.textContent = stored;
        } else {
            shadowMode = "basic"; // default mode
            document.getElementById("shadowMode").innerText = "Current Mode: Basic";
            updateShadowQuality();
        }
    } catch (e) {
        shadowMode = "basic";
        updateShadowQuality();
    }
})();


 // === Collapse / Expand helpers ===
function collapseAll() { document.querySelectorAll("details").forEach(d => d.open = false); }
function expandAll() { document.querySelectorAll("details").forEach(d => d.open = true); }

// === Reset All & Generate ===
(function () {
    const resetAllBtn = document.getElementById("resetBtn");
    const generateBtn = document.getElementById("generateBtn");

    resetAllBtn.addEventListener("click", () => {
    // Reset sliders
    const sliders = document.querySelectorAll("input[type='range']");
    sliders.forEach(s => {
        s.value = s.defaultValue;
        s.dispatchEvent(new Event('input'));
    });

    // Clear stored generated values
    try {
        localStorage.removeItem("textureConfig");
        localStorage.removeItem("shadowConfig");
        localStorage.removeItem("generatedConfig");
        localStorage.removeItem("specialTogglesConfig"); // Clear special toggles from localStorage
    } catch (e) { /* ignore storage errors */ }

    // Reset special in-game toggles
    specialToggles = ""; // Clear the specialToggles variable
    const specialTogglesOutput = document.getElementById("specialTogglesOutput");
    if (specialTogglesOutput) {
        specialTogglesOutput.textContent = ""; // Clear the output
    }

    alert("All configs reset to default values.");
});

    generateBtn.addEventListener("click", () => {
    // Combine stored outputs; fallback to live values if not found
    let textureConfig = "";
    let shadowConfig = "";
    let gcConfig = "";

    try {
        if (document.getElementById("includeTextureScaling").checked) {
            textureConfig = localStorage.getItem("textureConfig") || document.getElementById("output").textContent || "";
        }
        if (document.getElementById("includeShadows").checked) {
            shadowConfig = localStorage.getItem("shadowConfig") || document.getElementById("shadowOutput").textContent || "";
        }
        if (document.getElementById("includeGarbageCollection").checked) {
            gcConfig = localStorage.getItem("gcConfig") || document.getElementById("gcOutput").textContent || "";
        }
    } catch (e) { /* ignore */ }

    // === PREDEFINED TEMPLATE HEADER ===
    const engineTemplate = `[Core.System]
Paths=../../../Engine/Content
Paths=%GAMEDIR%Content
Paths=../../../Engine/Plugins/ThirdParty/ImpostorBaker/Content
Paths=../../../Engine/Plugins/json2struct/Content
Paths=../../../Engine/Plugins/Experimental/FieldSystemPlugin/Content
Paths=../../../Client/Plugins/LGUI/LGUI/Content
Paths=../../../Engine/Plugins/PrefabSystem/Content
Paths=../../../Engine/Plugins/FX/Niagara/Content
Paths=../../../Client/Plugins/Kuro/KuroGameplay/Content
Paths=../../../Client/Plugins/Puerts/Puerts/Content
Paths=../../../Client/Plugins/Wwise/Content
Paths=../../../Engine/Plugins/Editor/GeometryMode/Content
Paths=../../../Engine/Plugins/MovieScene/SequencerScripting/Content
Paths=../../../Engine/Plugins/Experimental/PythonScriptPlugin/Content
Paths=../../../Client/Plugins/CrashSight/Content
Paths=../../../Engine/Plugins/ThirdParty/QuickEditor/Content
Paths=../../../Client/Plugins/Kuro/TASdkPlugin/Content
Paths=../../../Engine/Plugins/rdLODtools/Content
Paths=../../../Client/Plugins/AudioMaterialPlugin/Content
Paths=../../../Engine/Plugins/Runtime/Nvidia/DLSS/Content
Paths=../../../Engine/Plugins/Runtime/HoudiniEngine/Content
Paths=../../../Client/Plugins/Kuro/KuroHotPatch/Content
Paths=../../../Client/Plugins/Kuro/KuroImposter/Content
Paths=../../../Client/Plugins/Kuro/KuroAutomationTool/Content
Paths=../../../Engine/Plugins/FX/HoudiniNiagara/Content
Paths=../../../Client/Plugins/LogicDriverLite/Content
Paths=../../../Engine/Plugins/Runtime/AudioSynesthesia/Content
Paths=../../../Engine/Plugins/Experimental/ControlRig/Content
Paths=../../../Engine/Plugins/Media/MediaCompositing/Content
Paths=../../../Engine/Plugins/Runtime/Synthesis/Content
Paths=../../../Engine/Plugins/SequenceDialogue/Content
Paths=../../../Client/Plugins/Puerts/ReactUMG/Content
Paths=../../../Client/Plugins/genesis-ue-plugin/RenderExporter/Content
Paths=../../../Engine/Plugins/KuroiOSDelegate/Content
Paths=../../../Client/Plugins/Kuro/KuroCloudGame/Content
Paths=../../../Engine/Plugins/Developer/PixelDebug/Content
Paths=../../../Engine/Plugins/PWPlugin/Content
Paths=../../../Engine/Plugins/BlueprintFileUtils/Content
Paths=../../../Client/Plugins/BlockoutToolsPlugin/Content
Paths=../../../Client/Plugins/ComfyTextures/Content
Paths=../../../Client/Plugins/KuroComputeShader/Content
Paths=../../../Client/Plugins/KuroTDM/Content
Paths=../../../Client/Plugins/Kuro/KuroGachaTools/Content
Paths=../../../Client/Plugins/Kuro/KuroPSOTools/Content
Paths=../../../Client/Plugins/Kuro/KuroPushSdk/Content
Paths=../../../Client/Plugins/MagtModule/Content
Paths=../../../Client/Plugins/SpinePlugin/Content
Paths=../../../Client/Plugins/TpSafe/Content
Paths=../../../Engine/Plugins/AFME/Content
Paths=../../../Engine/Plugins/Animation/ACLPlugin/Content
Paths=../../../Engine/Plugins/AssetChecker/Content
Paths=../../../Engine/Plugins/DawnSDK/DawnSDK/Content
Paths=../../../Engine/Plugins/Dawn/Content
Paths=../../../Engine/Plugins/Editor/SpeedTreeImporter/Content
Paths=../../../Engine/Plugins/Experimental/ChaosClothEditor/Content
Paths=../../../Engine/Plugins/Experimental/ChaosNiagara/Content
Paths=../../../Engine/Plugins/Experimental/ChaosSolverPlugin/Content
Paths=../../../Engine/Plugins/GSR/Content
Paths=../../../Engine/Plugins/Runtime/Intel/XeSS/Content
Paths=../../../Engine/Plugins/Runtime/Nvidia/NRD/Content

[/Script/Engine.RendererOverrideSettings]

; Below are auto-generated settings from WuWa Config Generator
`;

    // === FINAL CONFIG COMBINATION ===
    const finalConfig = `${engineTemplate}\n\n${textureConfig}\n\n${shadowConfig}\n\n${gcConfig}\n\n; End of Auto-Generated Config`;

    try {
        localStorage.setItem("generatedConfig", finalConfig);
    } catch (e) {
        /* ignore */
    }

    // Go to generated page (make sure 'generated.html' exists)
    window.location.href = "generated-engine-ini.html";
});
})();

// === NAVBAR LOADER ===
fetch("components/navbar.html")
    .then(response => response.text())
    .then(data => {
        document.getElementById("navbar").innerHTML = data;
    })
    .catch(error => console.error("Navbar failed to load:", error));

const bgVideo = document.getElementById("bg-video");
document.addEventListener("visibilitychange", () => {
    if (document.hidden) bgVideo.pause();
    else bgVideo.play();
});

// === GARBAGE COLLECTION SYSTEM ===
(function () {
    const gcOutput = document.getElementById("gcOutput");
    const gcSettings = {
        aggressiveness: 5,
        generateCommands() {
            return `
[/Script/Engine.GarbageCollectionSettings]
gc.TimeBetweenPurgingPendingKillObjects=${60 - this.aggressiveness * 5}
gc.NumRetriesBeforeForcingGC=${5 + this.aggressiveness}
gc.MinDesiredObjectsPerSubTask=${20 + this.aggressiveness * 2}
gc.BlueprintClusteringEnabled=True
gc.FlushStreamingOnGC=True
gc.ValidateGCHeap=False
gc.StallCollectionWhileWaiting=False
gc.RandomFrequency=0
gc.MaxObjectsNotConsideredByGC=0
gc.AllowInitialGarbageCollection=True
gc.CollectGarbageEveryFrame=False
gc.ForceGCAtRegularInterval=False
gc.MinGCClusterSize=4
gc.MaxGCClusterSize=64
gc.VerifyUObjectsAreNotFGCObjects=False
gc.DisableAutomaticGC=False
`.trim();
        },
        updateOutput() {
            gcOutput.textContent = this.generateCommands();
            try { localStorage.setItem("gcConfig", this.generateCommands()); } catch (e) { /* ignore */ }
        }
    };

    document.getElementById("gcDec").addEventListener("click", () => {
        gcSettings.aggressiveness = Math.max(0, gcSettings.aggressiveness - 1);
        gcSettings.updateOutput();
    });
    document.getElementById("gcInc").addEventListener("click", () => {
        gcSettings.aggressiveness = Math.min(10, gcSettings.aggressiveness + 1);
        gcSettings.updateOutput();
    });
    document.getElementById("gcReset").addEventListener("click", () => {
        gcSettings.aggressiveness = 5;
        gcSettings.updateOutput();
    });

    // Initialize
    gcSettings.updateOutput();
})();

function navigateToSection(sectionId) {
    document.querySelectorAll("details").forEach(d => d.open = false);
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: "smooth" });
        section.open = true;
    }
}

// === SPECIAL IN-GAME TOGGLES ===
(function () {
    const output = document.getElementById("specialTogglesOutput");
    let specialToggles = "";

    function updateOutput() {
        const specialTogglesOutput = document.getElementById("specialTogglesOutput");
        if (specialTogglesOutput) {
            specialTogglesOutput.textContent = specialToggles.trim();
        }
        try {
            localStorage.setItem("specialTogglesConfig", specialToggles.trim());
        } catch (e) {
            /* Ignore storage errors */
        }
    }

    document.getElementById("enableVulkanBtn").addEventListener("click", () => {
        specialToggles = `
r.Mobile.DeviceEvaluation=3
r.Android.DisableVulkanSM5Support=0
r.Android.DisableVulkanSupport=0
`.trim();
        updateOutput();
    });

    document.getElementById("forceVulkanBtn").addEventListener("click", () => {
        specialToggles = `
r.Mobile.DeviceEvaluation=3
r.Android.DisableOpenGLES31Support=1
r.Android.DisableVulkanSM5Support=0
r.Android.DisableVulkanSupport=0
`.trim();
        updateOutput();
    });

    document.getElementById("enableFrameGenBtn").addEventListener("click", () => {
        if (!specialToggles.includes("r.Kuro.AFME.Enabled=1")) {
            specialToggles += "\n" + "r.Kuro.AFME.Enabled=1";
        }
        updateOutput();
    });

    document.getElementById("unlockUltraQualityBtn").addEventListener("click", () => {
        specialToggles = `
r.PostProcessAAQuality=4
r.imp.SSMbScaleLod0=0.00
r.imp.SSMbScaleLod1=0.00
r.MaterialQualityLevel=2
r.KuroMaterialQualityLevel=2
r.Mobile.HighQualityMaterial=1
`.trim();
        updateOutput();
    });

    document.getElementById("resetSpecialTogglesBtn").addEventListener("click", () => {
        specialToggles = "";
        updateOutput();
    });

    // Initialize from localStorage
    try {
        const stored = localStorage.getItem("specialTogglesConfig");
        if (stored) {
            specialToggles = stored;
            updateOutput();
        }
    } catch (e) {
        // Log the error to the console for debugging
        console.error("An error occurred:", e);

        // Display an alert to the user
        alert("An error occurred while processing your request. Please try again or check the console for more details.");
    }
})();

document.getElementById("addAllSpecialTogglesBtn").addEventListener("click", () => {
    // Replace the displayed toggles with the specified values
    specialToggles = `
r.Mobile.DeviceEvaluation=3
r.Android.DisableVulkanSM5Support=0
r.Android.DisableVulkanSupport=0
r.Android.DisableOpenGLES31Support=1
r.Kuro.AFME.Enabled=1
r.PostProcessAAQuality=4
r.imp.SSMbScaleLod0=0.00
r.imp.SSMbScaleLod1=0.00
r.MaterialQualityLevel=2
r.KuroMaterialQualityLevel=2
r.Mobile.HighQualityMaterial=1
`.trim();

    // Update the output
    updateOutput();
});

// Select All functionality for Engine.ini Contents
document.getElementById("selectAllBtn").addEventListener("click", () => {
    document.querySelectorAll("#engineIniContents input[type='checkbox']").forEach(checkbox => {
        checkbox.checked = true; // Check all checkboxes
    });
});

// Reset functionality for Engine.ini Contents
document.getElementById("resetChecklistBtn").addEventListener("click", () => {
    document.querySelectorAll("#engineIniContents input[type='checkbox']").forEach(checkbox => {
        checkbox.checked = false; // Uncheck all checkboxes
    });
});

(function () {
    const engineIniContents = document.getElementById("engineIniContents");
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    // Start dragging
    engineIniContents.addEventListener("mousedown", (e) => {
        isDragging = true;
        offsetX = e.clientX - engineIniContents.getBoundingClientRect().left;
        offsetY = e.clientY - engineIniContents.getBoundingClientRect().top;
        engineIniContents.style.transition = "none"; // Disable transition during drag
    });

    // Dragging logic
    document.addEventListener("mousemove", (e) => {
        if (isDragging) {
            const x = e.clientX - offsetX;
            const y = e.clientY - offsetY;
            engineIniContents.style.left = `${x}px`;
            engineIniContents.style.top = `${y}px`;
        }
    });

    // Stop dragging
    document.addEventListener("mouseup", () => {
        isDragging = false;
        engineIniContents.style.transition = "transform 0.3s ease-in-out"; // Re-enable transition
    });

    // For touch devices
    engineIniContents.addEventListener("touchstart", (e) => {
        isDragging = true;
        const touch = e.touches[0];
        offsetX = touch.clientX - engineIniContents.getBoundingClientRect().left;
        offsetY = touch.clientY - engineIniContents.getBoundingClientRect().top;
        engineIniContents.style.transition = "none";
    });

    document.addEventListener("touchmove", (e) => {
        if (isDragging) {
            const touch = e.touches[0];
            const x = touch.clientX - offsetX;
            const y = touch.clientY - offsetY;
            engineIniContents.style.left = `${x}px`;
            engineIniContents.style.top = `${y}px`;
        }
    });

    document.addEventListener("touchend", () => {
        isDragging = false;
        engineIniContents.style.transition = "transform 0.3s ease-in-out";
    });
})();

function makeDraggable(elementId) {
    const element = document.getElementById(elementId);
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    // Start dragging
    element.addEventListener("mousedown", (e) => {
        isDragging = true;
        offsetX = e.clientX - element.getBoundingClientRect().left;
        offsetY = e.clientY - element.getBoundingClientRect().top;
        element.style.transition = "none"; // Disable transition during drag
    });

    // Dragging logic
    document.addEventListener("mousemove", (e) => {
        if (isDragging) {
            const x = e.clientX - offsetX;
            const y = e.clientY - offsetY;
            element.style.left = `${x}px`;
            element.style.top = `${y}px`;
        }
    });

    // Stop dragging
    document.addEventListener("mouseup", () => {
        isDragging = false;
        element.style.transition = "transform 0.3s ease-in-out"; // Re-enable transition
    });

    // For touch devices
    element.addEventListener("touchstart", (e) => {
        isDragging = true;
        const touch = e.touches[0];
        offsetX = touch.clientX - element.getBoundingClientRect().left;
        offsetY = touch.clientY - element.getBoundingClientRect().top;
        element.style.transition = "none";
    });

    document.addEventListener("touchmove", (e) => {
        if (isDragging) {
            const touch = e.touches[0];
            const x = touch.clientX - offsetX;
            const y = touch.clientY - offsetY;
            element.style.left = `${x}px`;
            element.style.top = `${y}px`;
        }
    });

    document.addEventListener("touchend", () => {
        isDragging = false;
        element.style.transition = "transform 0.3s ease-in-out";
    });
}

// Make both panels draggable
makeDraggable("engineIniContents");