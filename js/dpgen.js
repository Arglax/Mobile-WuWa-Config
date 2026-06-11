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

// ── Config Generator Logic ────────────────────────────────
function generateConfig() {
    const out = document.getElementById("configOutput");
    if (!out) return;

    if (!currentProfile) {
        out.innerHTML = `<span style="color: #5dcaa5;">; WuWa DeviceProfiles.ini — Select a device option above to begin generation.</span>`;
        updateMeta(0, 1);
        return;
    }

    const rawLines = [];
    const htmlLines = [];

    function addLine(txt) {
        rawLines.push(txt);
        // Map any syntax components for cleaner live-preview visuals
        if (txt.startsWith(";")) {
            htmlLines.push(`<span style="color:#4a8a73;">${txt}</span>`);
        } else if (txt.startsWith("[")) {
            htmlLines.push(`<span style="color:#ffd700; font-weight:bold;">${txt}</span>`);
        } else if (txt.includes("=")) {
            const parts = txt.split("=");
            htmlLines.push(`<span style="color:#5dcaa5;">${parts[0]}</span>=<span style="color:#ffffff;">${parts.slice(1).join("=")}</span>`);
        } else {
            htmlLines.push(txt);
        }
    }

    // Header Data Setup
    addLine("; ───────────────────────────────────────────────────────────");
    addLine("; WuWa Portal — Customizable Device Profiles Configuration");
    addLine(`; Hardware profile resolved: [${currentProfile}]`);
    addLine("; ───────────────────────────────────────────────────────────");
    addLine("");
    addLine(`[${currentProfile} DeviceProfile]`);

    let cvarCount = 0;

    // Benchmark Score Emulation
    if (document.getElementById("scoreEnable")?.checked) {
        addLine("; -- Device Score Profile --");
        addLine(`DeviceScore=${document.getElementById("scoreInput").value}`);
        cvarCount++;
    }

    // Rendering Subsystem Mode
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
        addLine("; No custom CVars selected. Adjust parameters on the left to inject rules.");
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
    if (!currentRawOutputText || currentRawOutputText.startsWith("; WuWa DeviceProfiles.ini")) {
        showToast("No config to copy — select a device first.", "error");
        return;
    }
    navigator.clipboard.writeText(currentRawOutputText)
        .then(() => showToast("✓ Config copied to clipboard!", "success"))
        .catch(() => showToast("Copy failed — try selecting and copying manually.", "error"));
}

function downloadConfig() {
    if (!currentRawOutputText || currentRawOutputText.startsWith("; WuWa DeviceProfiles.ini")) {
        showToast("No config to download — select a device first.", "error");
        return;
    }
    const blob = new Blob([currentRawOutputText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "DeviceProfiles.ini";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("↓ File download started.", "success");
}

function resetAll() {
    document.getElementById("deviceSelect").value = "";
    const cbs = ["scoreEnable", "vulkan", "scalabilityEnable", "kurofi"];
    cbs.forEach(id => {
        const cb = document.getElementById(id);
        if (cb) {
            cb.checked = false;
            const item = cb.closest(".toggle-item");
            if (item) item.classList.remove("selected-active");
        }
    });

    const sliders = document.getElementById("scalabilitySliders");
    if (sliders) {
        sliders.style.opacity = "0.4";
        sliders.style.pointerEvents = "none";
    }
    const controls = document.getElementById("scoreControls");
    if (controls) {
        controls.style.opacity = "0.4";
        controls.style.pointerEvents = "none";
    }

    currentProfile = "";
    currentDeviceName = "";
    document.getElementById("profileResolved").style.display = "none";
    generateConfig();
    showToast("↺ All settings reset.", "info");
}

// ── Preview Modal Controllers ─────────────────────────────
function showPreview() {
    generateConfig(); // Refresh system values
    document.getElementById("preview-content").value = currentRawOutputText;
    document.getElementById("preview-modal").classList.add("show");
}

function closePreview() {
    document.getElementById("preview-modal").classList.remove("show");
}

// ── Toast System ──────────────────────────────────────────
function showToast(message, type = "success") {
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 10);

    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ── Initialization ────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    loadDeviceCSV();
    generateConfig();
});

document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const headerNav = document.querySelector('.header-nav');

    if (mobileMenuBtn && headerNav) {
        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            headerNav.classList.toggle('open');
        });

        const navLinks = headerNav.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                headerNav.classList.remove('open');
            });
        });

        document.addEventListener('click', (e) => {
            if (!headerNav.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                headerNav.classList.remove('open');
            }
        });
    }
});

// ── Device Submission ────────────────────────────────────
async function submitDevice(event) {
    // 1. Prevent the page from reloading/breaking your SPA flow
    if (event) event.preventDefault();

    const deviceInput = document.getElementById("submitDevice");
    const profileInput = document.getElementById("submitProfile");
    const contributorInput = document.getElementById("submitContributor"); // Target your new textbox
    const submitBtn = document.getElementById("submitBtn");
    const accessKeyInput = document.getElementById("web3AccessKey");

    const deviceVal = deviceInput.value.trim();
    const profileVal = profileInput.value.trim();
    const contributorVal = contributorInput ? contributorInput.value.trim() : ""; // Safely extract value

    // Validation (Keep contributor optional)
    let valid = true;
    if (!deviceVal) { deviceInput.classList.add("error"); valid = false; } else { deviceInput.classList.remove("error"); }
    if (!profileVal) { profileInput.classList.add("error"); valid = false; } else { profileInput.classList.remove("error"); }
    if (!valid) { showToast("Please fill in both fields before submitting.", "error"); return; }

    // Visual button state during transit
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "⏳ Submitting...";
    }

    try {
        // 2. Create a FormData object
        const formData = new FormData();
        formData.append("access_key", accessKeyInput ? accessKeyInput.value : "20fc44a6-f1c5-4b31-9cc0-3d046f099ec5");

        // Dynamically update subject based on anonymity
        if (contributorVal) {
            formData.append("subject", `[WuWa Portal] New Device Submission by ${contributorVal}`);
        } else {
            formData.append("subject", `[WuWa Portal] New Anonymous Device: ${deviceVal}`);
        }

        formData.append("from_name", "WuWa Portal System");

        // These will show up beautifully in your email inbox notifications
        formData.append("Exact Device Name", deviceVal);
        formData.append("Device Profile Name", profileVal);
        formData.append("Contributor Credit Name", contributorVal ? contributorVal : "Anonymously Contributed");

        // 3. Send via Fetch using FormData instead of application/json
        const response = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            showToast("✓ Device submitted successfully!", "success");
            // Clear inputs on success
            deviceInput.value = "";
            profileInput.value = "";
            if (contributorInput) contributorInput.value = "";
        } else {
            throw new Error(result.message || "API rejection");
        }
    } catch (error) {
        console.error("Submission error:", error);
        showToast("Submission failed. Please check your network or try again.", "error");
    } finally {
        // Restore button state perfectly
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "📨 Submit Device";
        }
    }
}