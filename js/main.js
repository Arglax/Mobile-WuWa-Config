// Global framework components for WuWa Portal Layout Templates
function toggleMobileNav() {
    const nav = document.getElementById('mainNav');
    if (nav) {
        nav.classList.toggle('open');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const headerNav = document.querySelector('.header-nav');

    if (mobileMenuBtn && headerNav) {
        // Remove inline onclick to avoid double-firing, then handle via listener
        mobileMenuBtn.removeAttribute('onclick');

        // Toggle open when hamburger is clicked
        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            headerNav.classList.toggle('open');
        });

        // Close menu when any nav link is tapped
        const navLinks = headerNav.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                headerNav.classList.remove('open');
            });
        });

        // Close menu when tapping anywhere outside
        document.addEventListener('click', (e) => {
            if (!headerNav.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                headerNav.classList.remove('open');
            }
        });
    }
});
// ── Mobile Config Selector Engine ──

// Fallback lookup table database based on your chipset dataset mapping
const fallbackConfigSelectorData = [
    { phone: "Galaxy S24 Ultra", chip: "Snapdragon 8 Gen 3 / Adreno 750", config: "Stable Config – A / (High Visuals)" },
    { phone: "Xiaomi 14", chip: "Snapdragon 8 Gen 3 / Adreno 750", config: "Stable Config – A / (High Visuals)" },
    { phone: "OnePlus 12", chip: "Snapdragon 8 Gen 3 / Adreno 750", config: "Stable Config – A / (High Visuals)" },
    { phone: "Vivo X100", chip: "Dimensity 9300 / Mali-G720", config: "Stable Config – A / (High Visuals)" },
    { phone: "Galaxy S23 / S23+", chip: "Snapdragon 8 Gen 2 / Adreno 740", config: "Stable Config – B" },
    { phone: "Galaxy S24 (Exynos)", chip: "Exynos 2400 / Mali-G715", config: "Stable Config – B" },
    { phone: "Poco X6 Pro", chip: "Dimensity 8300 / Mali-G615", config: "Stable Config – B" },
    { phone: "Galaxy A54", chip: "Exynos 1380 / Mali-G68", config: "Stable Config – C" },
    { phone: "Galaxy A34", chip: "Dimensity 1080 / Mali-G68", config: "Stable Config – C" },
    { phone: "Redmi Note 12 Pro", chip: "Dimensity 1080 / Mali-G68", config: "Stable Config – C" },
    { phone: "Poco X5 Pro", chip: "Snapdragon 778G / Adreno 642L", config: "Stable Config – C" },
    { phone: "Infinix Zero 30", chip: "Dimensity 8020 / Mali-G77", config: "Stable Config – C" },
    { phone: "Tecno Camon 20 Pro", chip: "Dimensity 8050 / Mali-G77", config: "Stable Config – C" },
    { phone: "Redmi 13C", chip: "Helio G85 / Mali-G52", config: "Potato Config" },
    { phone: "Galaxy A05", chip: "Helio G85 / Mali-G52", config: "Potato Config" },
    { phone: "Realme C55", chip: "Helio G88 / Mali-G52", config: "Potato Config" },
    { phone: "Infinix Smart 8", chip: "Unisoc T606 / Mali-G57 MC1", config: "Potato Config" },
    { phone: "Tecno Spark Go", chip: "Unisoc T606 / Mali-G57 MC1", config: "Potato Config" }
];

// Reference URL definitions
const configLinks = {
    "Stable Config – A": "https://github.com/Arglax/Mobile-WuWa-Config/tree/main/%5BV3.x%5D%20Working%20Configs/Stable%20Configs/A%20High-End",
    "Stable Config – B": "https://github.com/Arglax/Mobile-WuWa-Config/tree/main/%5BV3.x%5D%20Working%20Configs/Stable%20Configs/B%20Mid-End",
    "Stable Config – C": "https://github.com/Arglax/Mobile-WuWa-Config/tree/main/%5BV3.x%5D%20Working%20Configs/Stable%20Configs/C%20Low-End",
    "High Visuals": "https://github.com/Arglax/Mobile-WuWa-Config/tree/main/%5BV3.x%5D%20Working%20Configs/High-Visual%20Config",
    "Potato Config": "https://github.com/Arglax/Mobile-WuWa-Config/tree/main/%5BV3.x%5D%20Working%20Configs/Performance%20Configs/Potato%20Config"
};

let activeSelectorData = [...fallbackConfigSelectorData];

// Logic to check and fetch configselector files (.txt / .csv) asynchronously if present
// Logic to check and fetch configselector files (.txt / .csv) asynchronously if present
async function loadExternalConfigSelector() {
    try {
        // Adding the 'tools/' path explicitly so the engine can resolve its position
        let response = await fetch('tools/configselector.txt');
        if (!response.ok) response = await fetch('tools/configselector.csv');

        if (response.ok) {
            const text = await response.text();
            parseConfigSelectorText(text);
        }
    } catch (e) {
        console.log("Using built-in configselector map array matrix configuration baseline.");
    }
}

function parseConfigSelectorText(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length < 2) return;

    const parsed = [];
    // Basic delimiter parsing validation logic loop
    lines.forEach((line, index) => {
        if (index === 0 && (line.toLowerCase().includes('phone') || line.toLowerCase().includes('cpu'))) return;
        let parts = line.split('\t'); // tab check
        if (parts.length < 3) parts = line.split(','); // csv comma fallback

        if (parts.length >= 3) {
            parsed.push({
                phone: parts[0].replace(/"/g, '').trim(),
                chip: parts[1].replace(/"/g, '').trim(),
                config: parts[2].replace(/"/g, '').trim()
            });
        }
    });
    if (parsed.length > 0) activeSelectorData = parsed;
}

function openConfigSelector() {
    document.getElementById('configModalOverlay').classList.add('active');
    document.getElementById('selectorSearch').value = '';
    filterDevices();
    loadExternalConfigSelector(); // Hot reload external map if modified
}

function closeConfigSelector(event, force = false) {
    if (force || event.target === document.getElementById('configModalOverlay')) {
        document.getElementById('configModalOverlay').classList.remove('active');
    }
}

function filterDevices() {
    const query = document.getElementById('selectorSearch').value.toLowerCase().trim();
    const listContainer = document.getElementById('deviceResultsList');
    listContainer.innerHTML = '';

    const filtered = activeSelectorData.filter(item =>
        item.phone.toLowerCase().includes(query) ||
        item.chip.toLowerCase().includes(query) ||
        item.config.toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
        listContainer.innerHTML = `<div style="padding: 14px; text-align: center; color: var(--text-muted); font-size:12px;">No matching setup profiles flagged. Adjust constraints.</div>`;
        return;
    }

    filtered.forEach(item => {
        const row = document.createElement('div');
        row.className = 'device-row';
        row.innerHTML = `
      <div class="device-row-title">${item.phone}</div>
      <div class="device-row-sub">${item.chip}</div>
    `;
        row.onclick = () => selectDeviceProfile(item);
        listContainer.appendChild(row);
    });
}

function selectDeviceProfile(item) {
    const container = document.getElementById('selectorResultContainer');
    const linksBox = document.getElementById('selectorResultLinks');
    linksBox.innerHTML = '';

    container.style.display = 'block';

    // Find matching links from target array configurations
    Object.keys(configLinks).forEach(key => {
        if (item.config.toLowerCase().includes(key.toLowerCase())) {
            const linkElement = document.createElement('a');
            linkElement.className = 'config-out-btn';
            linkElement.href = configLinks[key];
            linkElement.target = '_blank';
            linkElement.rel = 'noopener';
            linkElement.innerHTML = `<span>Get ${key}</span><span>→</span>`;
            linksBox.appendChild(linkElement);
        }
    });
}