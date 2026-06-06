# This config folder will be moved to Old Configs after the latest one is confirmed stable  
> I will still provide support for this repos until the end of Version 3.0  
> We'll fully transition to [V3.x] Working Configs by Version 3.1  
> Thank you for your support :)

# ⚙️ Device Performance Guide  
# Mobile Config Selector Guide

This guide helps you choose the **correct config preset** based on your phone's **CPU/GPU tier**.
Using the right preset avoids crashes, overheating, and severe frame drops.

---

## Config Presets Explained

- **Config_Arglax Config_1**
  - For flagship and near-flagship devices
  - Maximizes visuals and effects

- **Config Clean / Config_Arglax Config_2**
  - For mid-range and upper low-end devices
  - Balanced visuals and performance

- **Config_LowEnd**
  - For low-end devices
  - Prioritizes compatibility and FPS over visuals

---

## Device Compatibility Table

| Phone (Examples) | CPU / GPU | Config to Use |
|------------------|-----------|---------------|
| Galaxy S24 Ultra | Snapdragon 8 Gen 3 / Adreno 750 | Config_Arglax Config_1 |
| Galaxy S23 / S23+ | Snapdragon 8 Gen 2 / Adreno 740 | Config_Arglax Config_1 |
| Galaxy S24 (Exynos) | Exynos 2400 / Mali-G715 | Config_Arglax Config_1 |
| Xiaomi 14 | Snapdragon 8 Gen 3 / Adreno 750 | Config_Arglax Config_1 |
| OnePlus 12 | Snapdragon 8 Gen 3 / Adreno 750 | Config_Arglax Config_1 |
| Vivo X100 | Dimensity 9300 / Mali-G720 | Config_Arglax Config_1 |
| Poco X6 Pro | Dimensity 8300 / Mali-G615 | Config_Arglax Config_1 |
| Galaxy A54 | Exynos 1380 / Mali-G68 | Config Clean / Config_Arglax Config_2 |
| Galaxy A34 | Dimensity 1080 / Mali-G68 | Config Clean / Config_Arglax Config_2 |
| Redmi Note 12 Pro | Dimensity 1080 / Mali-G68 | Config Clean / Config_Arglax Config_2 |
| Poco X5 Pro | Snapdragon 778G / Adreno 642L | Config Clean / Config_Arglax Config_2 |
| Infinix Zero 30 | Dimensity 8020 / Mali-G77 | Config Clean / Config_Arglax Config_2 |
| Tecno Camon 20 Pro | Dimensity 8050 / Mali-G77 | Config Clean / Config_Arglax Config_2 |
| Redmi 13C | Helio G85 / Mali-G52 | Config_LowEnd |
| Galaxy A05 | Helio G85 / Mali-G52 | Config_LowEnd |
| Realme C55 | Helio G88 / Mali-G52 | Config_LowEnd |
| Infinix Smart 8 | Unisoc T606 / Mali-G57 MC1 | Config_LowEnd |
| Tecno Spark Go | Unisoc T606 / Mali-G57 MC1 | Config_LowEnd |

---

## Quick Rule of Thumb

- **Adreno 7xx / Mali G7xx** → Config_Arglax Config_1
- **Adreno 6xx / Mali G68–G77** → Config Clean / Config_Arglax Config_2
- **Adreno 5xx / Mali G52–G57 / Mali G31** → Config_LowEnd

---

## Notes

- If you experience overheating or instability, downgrade one tier.
- Shader recompilation after switching configs is recommended.

---

*Configs are continuously refined. Always use the latest version.*





## Possible Bug Notice
For those who use mobile data in gaming, there are some instances where the game auto-crashes on start when applied with config.  
Crashing happens when the login value gets stuck at either 5, 7 or 11.
To get around this, you may explore these options:  
1. Option 1: Connect to a Wi-Fi  
   -> Connect to any Wi-Fi available  
   -> In the login screen, tap the screen to login and look at the number at the BOTTOM-RIGHT  
   -> If it did increase from 0, you can turn on the Wi-Fi and continue playing on your mobile data  
2. Option 2: Restart Connection  
   -> Turn on airplane mode and wait 30 seconds (or 5 minutes)  
   -> Turn off airplane mode and turn on mobile data  
   -> Retry the game  
