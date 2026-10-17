# Community Config Contribution

## 🧩 Config Info & Test Report

| Field | Details |
| :--- | :--- |
| **Device Model** | POCO X8 Pro |
| **Chipset** | MediaTek Dimensity 8500 Ultra |
| **RAM** | 8 GB |
| **OS Version** | Android / HyperOS 3.5 (3.307.) |
| **Game Version** | Wuthering Waves (Latest) |
| **Config Type** | `DeviceProfiles.ini` + `Engine.ini` (Stable B - Mid-End Base + Custom Tweaks) |
| **Average FPS** | Around 50-60 FPS (Frame Gen On) |
| **Lowest FPS** | 30 (Need Cooler)  |
| **Temperature Range** | 45+ Celsius (without cooler, recommended to use one to get 38-40 max)  |
| **Testing Duration** | Open-world gameplay, combat, and exploration |
| **Notable Issues** | None. Snapdragon users must swap the profile override string as noted below. |
| **References** | Based on Arglax Stable Config B (Mid-End) with custom tweaks |
| **Date Tested** | 2026-10-17 |

---

## ⚙️ Configuration Overview

This configuration is based on the **Arglax Stable Config (Mid-End)** with custom tweaks applied to force frame generation on unsupported MediaTek Dimensity chipsets.

### Device Profile Override
- **Applied Profile:** `MTK 6896` (Dimensity 9300 / 9300+)
- **Purpose:** Forces hardware/software frame generation compatibility on the Dimensity 8500 Ultra.

> **Note for Snapdragon Users:**  
> Change the override parameter from `dp.Override=MTK_6989` to `Adreno 825` (or equivalent Adreno profile). Confirmed working on Snapdragon 8+ Gen 1 and higher.

---

## 🎨 Recommended In-Game Graphics Settings

For optimal visual clarity and high-definition character models without sacrificing stability:

| Setting | Recommended Value |
| :--- | :--- |
| **Texture Quality** | HD *(SD works but causes noticeable visual degrade)* |
| **Resolution** | High |
| **Special Effect Quality** | Medium |
| **FSR** | On |
| **Shadow Quality** | Medium |
| **LOD Bias** | Ultra High *(Lower to Medium for better performance if needed)* |
| **Capsule AO** | On |
| **Anti-Aliasing** | On |
| **Bloom** | On |
| **Crowd Density** | Medium |
| **Enemy Hit Flash** | On |
| **Auto FPS** | Off |
| **Damage Number** | On |
| **Physics Based Animation** | On |
| **Cutscene Mode** | Fullscreen |
| **Co-op Teammate VFX** | Off |
| **Wounded Effect** | Off |
| **Foliage Density** | Low *(Can be increased if thermal overhead permits)* |
| **Anisotropic Filtering** | 16x |
| **Vulkan** | On |
| **Frame Generation** | On |

