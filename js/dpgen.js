/* ============================================================
   WuWa Portal — tools/devprof-generator.html Script
   Handles device parsing, CVar configuration, and INI generation
   ============================================================ */

let deviceDatabase = [];
let currentProfile = "";
let currentDeviceName = "";
let currentRawOutputText = "";

const SG_LABELS = {
    "-1": "OFF",
    "0": "Low",
    "1": "Medium",
    "2": "High",
    "3": "Ultra",
    "4": "Cinematic"
};

// ── Load Device Database ──────────────────────────────────
async function loadDeviceCSV() {
    try {
        const resp = await fetch("../data/devices.csv");
        if (!resp.ok) throw new Error("fetch failed");
        const text = await resp.text();
        parseCSV(text);
    } catch {
        // Fallback internal database if fetch fails
        const fallback = `device_name,profile_name,chipset_family,notes
Generic Android,Android_Default,Generic,Fallback profile
Poco X6 Pro 5G,Android_Mali_G61x,MediaTek,Dimensity 8300U · Mali G615 MC6
Poco F6 Pro,Android_Adreno_8xx,Qualcomm,SD 8 Gen 2 · Adreno 740
Samsung Galaxy S24 Ultra,Android_Adreno_8xx,Qualcomm,SD 8 Gen 3 · Adreno 750
Xiaomi 14 Ultra,Android_Adreno_8xx,Qualcomm,SD 8 Gen 3 · Adreno 750
OnePlus 12,Android_Adreno_8xx,Qualcomm,SD 8 Gen 3 · Adreno 750
ASUS ROG Phone 8 Pro,Android_Adreno_8xx,Qualcomm,SD 8 Gen 3 · Adreno 750
Vivo X100 Pro,Android_Mali_Immortalis,MediaTek,Dimensity 9300 · Immortalis G720`;
        parseCSV(fallback);
    }
}

function parseCSV(text) {
    const lines = text.trim().split("\n");
    deviceDatabase = lines.slice(1).map(line => {
        const cols = line.split(",");
        return {
            device_name: cols[0]?.trim() || "",
            profile_name: cols[1]?.trim() || "",
            chipset_family: cols[2]?.trim() || "",
            notes: cols.slice(3).join(",").trim() || ""
        };
    }).filter(d => d.device_name && d.profile_name);
    buildDeviceDropdown();
    document.getElementById("deviceLoadStatus").textContent = `${deviceDatabase.length} devices loaded`;
}

function buildDeviceDropdown() {
    const sel = document.getElementById("deviceSelect");
    while (sel.options.length > 1) sel.remove(1);
    
    const families = {};
    deviceDatabase.forEach(d => {
        if (!families[d.chipset_family]) families[d.chipset_family] = [];
        families[d.chipset_family].push(d);
    });
    
    const familyOrder = ["Qualcomm", "MediaTek", "Samsung Exynos", "Google Tensor", "Apple", "Generic"];
    const sortedFamilies = [...Object.keys(families)].sort((a, b) => {
        const ia = familyOrder.indexOf(a), ib = familyOrder.indexOf(b);
        if (ia === -1 && ib === -1) return a.localeCompare(b);
        if (ia === -1) return 1;
        if (ib === -1) return -1;
        return ia - ib;
    });
    
    sortedFamilies.forEach(family => {
        const group = document.createElement("optgroup");
        group.label = `── ${family} ──`;
        families[family].sort((a, b) => a.device_name.localeCompare(b.device_name)).forEach(d => {
            const opt = document.createElement("option");
            opt.value = d.device_name;
            opt.textContent = d.device_name;
            group.appendChild(opt);
        });
        sel.appendChild(group);
    });
}

// ── UI Handlers ───────────────────────────────────────────
function onDeviceChange() {
    const sel = document.getElementById("deviceSelect");
    const val = sel.value;
    if (!val) {
        currentProfile = "";
        currentDeviceName = "";
        document.getElementById("profileResolved").style.display = "none";
        generateConfig();
        return;
    }
    const dev = deviceDatabase.find(d => d.device_name === val);
    if (dev) {
        currentProfile = dev.profile_name;
        currentDeviceName = dev.device_name;
        document.getElementById("resolvedProfileName").textContent = dev.profile_name;
        document.getElementById("profileResolved").style.display = "flex";
        document.getElementById("deviceLabel").textContent = dev.device_name;
    }
    generateConfig();
}

function toggleAccordion(btn) {
    const item = btn.closest(".accordion-item");
    item.classList.toggle("open");
}

function toggleOption(id) {
    const cb = document.getElementById(id);
    if (!cb) return;
    cb.checked = !cb.checked;
    
    const item = cb.closest(".toggle-item");
    if (item) {
        if (cb.checked) {
            item.classList.add("selected-active");
        } else {
            item.classList.remove("selected-active");
        }
    }
    
    if (id === "scalabilityEnable") {
        const sliders = document.getElementById("scalabilitySliders");
        if (sliders) {
            sliders.style.opacity = cb.checked ? "1" : "0.4";
            sliders.style.pointerEvents = cb.checked ? "auto" : "none";
        }
    }
    if (id === "scoreEnable") {
        const controls = document.getElementById("scoreControls");
        if (controls) {
            controls.style.opacity = cb.checked ? "1" : "0.4";
            controls.style.pointerEvents = cb.checked ? "auto" : "none";
        }
    }
    generateConfig();
}

// ── Sliders Sync ──────────────────────────────────────────
function syncSlider(key) {
    const el = document.getElementById(`sg-${key}`);
    const val = parseInt(el.value);
    document.getElementById(`${key}-val`).textContent = val === -1 ? "OFF" : val;
    const hintEl = document.getElementById(`${key}-hint`);
    if (key === "ef") {
        hintEl.textContent = val <= 1 ? `⚠ Capped at 2 — currently ${SG_LABELS[val]}` : "⚠ Capped at 2 — values above 2 cause game crash";
    } else {
        hintEl.textContent = SG_LABELS[val];
    }
    generateConfig();
}

function syncScore(source) {
    const slider = document.getElementById("scoreSlider");
    const input = document.getElementById("scoreInput");
    if (source === 'slider') {
        input.value = slider.value;
    } else {
        slider.value = input.value;
    }
    generateConfig();
}

function setScore(val) {
    document.getElementById("scoreSlider").value = val;
    document.getElementById("scoreInput").value = val;
    generateConfig();
}

// ── Config Generator Logic ────────────────────────────────
function generateConfig() {
    const out = document.getElementById("configOutput");
    if (!out) return;
    
    if (!currentProfile) {
        out.innerHTML = '<span style="color: lightgreen;">; WuWa DeviceProfiles.ini — select a device above to begin…</span>';
        currentRawOutputText = "; WuWa DeviceProfiles.ini — select a device above to begin…";
        updateMeta(0, 0);
        return;
    }
    
    let rawLines = [];
    let htmlLines = [];
    
    function addLine(text) {
        rawLines.push(text);
        if (text.startsWith(";")) {
            htmlLines.push(`<span style="color: lightgreen;">${text}</span>`);
        } else if (text.startsWith("CVars=") || text.startsWith("DeviceScore=")) {
            htmlLines.push(`<span style="color: orange;">${text}</span>`);
        } else {
            htmlLines.push(`<span style="color: var(--jade-bright);">${text}</span>`);
        }
    }
    
    addLine("; ──────────");
    addLine(`; WuWa DeviceProfiles.ini — Generated by WuWa Portal`);
    addLine(`; Device    : ${currentDeviceName}`);
    addLine(`; Profile   : [${currentProfile} DeviceProfile]`);
    addLine(`; Tool Link · https://arglax.github.io/Mobile-WuWa-Config/tools/devprof-generator.html`);
    addLine("; ─────────");
    addLine("");
    addLine(`[${currentProfile} DeviceProfile]`);
    
    let cvarCount = 0;
    
    // Device Score Spoofing
    if (document.getElementById("scoreEnable")?.checked) {
        addLine("; -- Device Score Spoofing --");
        addLine(`DeviceScore=${document.getElementById("scoreInput").value}`);
        cvarCount++;
    }
    
    // Vulkan Mode
    if (document.getElementById("vulkan")?.checked) {
        addLine("; -- Graphics API --");
        addLine("CVars=r.Android.DisableVulkanSupport=0");
        cvarCount++;
    }
    
    // Scalability Settings
    if (document.getElementById("scalabilityEnable")?.checked) {
        addLine("; -- Scalability Quality Overrides --");
        const keys = ["vd", "aa", "sh", "pp", "tx", "ef", "fo", "sd"];
        const cvarNames = {
            vd: "sg.ViewDistanceQuality",
            aa: "sg.AntiAliasingQuality",
            sh: "sg.ShadowQuality",
            pp: "sg.PostProcessQuality",
            tx: "sg.TextureQuality",
            ef: "sg.EffectsQuality",
            fo: "sg.FoliageQuality",
            sd: "sg.ShadingQuality"
        };
        keys.forEach(k => {
            const val = document.getElementById(`sg-${k}`).value;
            if (val !== "-1") {
                addLine(`CVars=${cvarNames[k]}=${val}`);
                cvarCount++;
            }
        });
    }
    
    // KuroFI Frame Generation
    if (document.getElementById("kurofi")?.checked) {
        addLine("; -- Frame Generation (KuroFI) --");
        addLine("CVars=r.KuroFI.Enable=1");
        cvarCount++;
    }
    
    if (cvarCount === 0) {
        addLine("; No CVars selected — check options on the left to add overrides.");
    }
    
    currentRawOutputText = rawLines.join("\n");
    out.innerHTML = htmlLines.join("\n");
    updateMeta(cvarCount, rawLines.length);
}

function updateMeta(cvars, lineCount) {
    document.getElementById("cvarCount").textContent = cvars;
    document.getElementById("lineCount").textContent = lineCount;
}

// ── Action Buttons ────────────────────────────────────────
function copyConfig() {
    if (!currentRawOutputText || currentRawOutputText.startsWith("; WuWa DeviceProfiles.ini — select")) {
        showToast("No config to copy — select a device first.", "error");
        return;
    }
    navigator.clipboard.writeText(currentRawOutputText)
        .then(() => showToast("✓ Config copied to clipboard!", "success"))
        .catch(() => showToast("Copy failed — try selecting manually.", "error"));
}

function downloadConfig() {
    if (!currentRawOutputText || currentRawOutputText.startsWith("; WuWa DeviceProfiles.ini — select")) {
        showToast("No config to download — select a device first.", "error");
        return;
    }
    const blob = new Blob([currentRawOutputText], { type: "text/plain; charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "DeviceProfiles.ini";
    a.click();
    URL.revokeObjectURL(url);
    showToast("↓ DeviceProfiles.ini downloaded!", "success");
}

function resetAll() {
    document.querySelectorAll(".toggle-checkbox").forEach(cb => {
        cb.checked = false;
        const wrap = cb.closest(".toggle-item");
        if (wrap) wrap.classList.remove("selected-active");
    });
    
    const defaults = { vd: 3, aa: 3, sh: 2, pp: 3, tx: 4, ef: 2, fo: 2, sd: 3 };
    Object.keys(defaults).forEach(k => {
        const el = document.getElementById(`sg-${k}`);
        if (el) {
            el.value = defaults[k];
            syncSlider(k);
        }
    });
    
    const scoreSlider = document.getElementById("scoreSlider");
    if (scoreSlider) scoreSlider.value = 2000;
    const scoreInput = document.getElementById("scoreInput");
    if (scoreInput) scoreInput.value = 2000;
    
    if (document.getElementById("scalabilitySliders")) {
        document.getElementById("scalabilitySliders").style.opacity = "0.4";
        document.getElementById("scalabilitySliders").style.pointerEvents = "none";
    }
    if (document.getElementById("scoreControls")) {
        document.getElementById("scoreControls").style.opacity = "0.4";
        document.getElementById("scoreControls").style.pointerEvents = "none";
    }
    
    generateConfig();
    showToast("↺ All options reset to default", "info");
}

function submitDevice() {
    const name = document.getElementById("submitDeviceName")?.value || "";
    const profile = document.getElementById("submitProfileName")?.value || "";
    if (!name || !profile) {
        showToast("Please fill in both fields.", "error");
        return;
    }
    const subject = encodeURIComponent("WuWa Portal — Device Profile Submission");
    const body = encodeURIComponent(`Device Name: ${name}\nProfile Name: ${profile}`);
    const mailtoLink = `mailto:arglaxgaming.official@gmail.com?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;
    showToast("📨 Opening email client…", "info");
}

// ── Preview Modal Controllers ─────────────────────────────
function showPreview() {
    generateConfig(); // Refresh system values
    
    // Assign clean text output directly from variable
    document.getElementById("preview-content").value = currentRawOutputText;
    
    // Reveal Modal window
    document.getElementById("preview-modal").classList.add("show");
}

function closePreview() {
    document.getElementById("preview-modal").classList.remove("show");
}

// ── Toast System ──────────────────────────────────────────
function showToast(message, type = "success") {
    let container = document.getElementById("toastContainer");
    if (!container) {
        container = document.createElement("div");
        container.id = "toastContainer";
        container.className = "toast-container";
        document.body.appendChild(container);
    }
    const toast = document.createElement("div");
    toast.className = `toast-ping ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    
    requestAnimationFrame(() => {
        toast.classList.add("show");
    });
    
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 350);
    }, 3000);
}

// ── Initialization ────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    loadDeviceCSV();
    generateConfig();
});