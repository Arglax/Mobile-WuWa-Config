# Arglax Config Pack — README

This config set is for **Android** (and hopefully **iOS**) for **WuWa Game Version 2.8**.

---

## 📁 Config Overview

| Config | Description | Best For |
|-------|-------------|----------|
| **Config_1** | Highest quality; great visuals | High-end devices |
| **Config_2** | Stronger optimization of Config_1  | Balanced Performance |
| **Config_3** | Best Performance Optimization | Users who want best performance |

**When unsure, choose `Config_3`.**

---

## 📱 Device Tier Recommendations

### 🔥 High-End Flagships
| Chipsets | Recommended Config | Notes |
|---------|--------------------|-------|
| **Dimensity 9000 / 9200 / 9300 series**<br>**Snapdragon 8 Gen 1 / Gen 2 / Gen 3 / Gen 4** | **Config_1 @ Ultra Quality** | Smooth performance, top visuals |

### ⚡ Upper Mid-Range Devices
| Chipsets | Recommended Config | Notes |
|----------|--------------------|-------|
| **Dimensity 8000 / 8200 / 8300 series**<br>**Snapdragon 7+ Gen 2 / 7 Gen 3 / 8 Gen 1 Lite tiers** | **Config_1 @ High Quality** | Ultra works but may stutter in crowded areas |

### 🎯 High-Performance Preference
| Use Case | Recommended Config |
|----------|--------------------|
| Users who prefer best performance | **Config_3** |

---

## ⚠️ Known Issues & Notes

| Issue | Cause | Fix |
|-------|--------|-----|
| **Heating during long play** | Battery + mobile data + charging combo | Normal; no overheating (>40°C) reported |
| **Black screen flicker during loading** | Scalability groups | Same fix as Issue #1 |

---

## 🧩 Before Troubleshooting
Please read **`Standard Testing Protocols.md`** first.

---

## 🔧 Troubleshooting Steps

| Step | Action | File |
|------|--------|------|
| 1 | Disable Vulkan forcing | `Engine.ini` / `DeviceProfiles.ini` |
| 2 | Test with Engine.ini only | Delete `DeviceProfiles.ini` | |
| 3 | Try community or older configs | Check relevant folders | |
| 4 | Ask for help | Discord → **issues/config-help** | |
| 5 | If all fails | Stop using config files | |

---

