# Device & Configuration Notes

### Configuration Overview
- **Base Config:** Arglax Stable Config (Mid-End) with a few custom tweaks.
- **Device Profile Override:** Set to **MTK 6896 (Dimensity 9300/9300+)** to enable frame generation functionality.

---

### Current Hardware Specifications
- **Device:** Poco X8 Pro
- **SoC:** Dimensity 8500 Ultra
- **RAM:** 8 GB

---

### Recommended Graphics Settings (Visuals Focus)
- **Texture Quality:** HD *(SD can be used, but visual quality drops significantly)*
- **Resolution:** High
- **Special Effect Quality:** Medium
- **FSR:** On
- **Shadow Quality:** Medium
- **LOD Bias:** Ultra High *(Lower this for better performance; set high for high-def character models)*
- **Capsule AO:** On
- **Anti-Aliasing:** On
- **Bloom:** On
- **Crowd Density:** Medium
- **Enemy Hit Flash:** On
- **Auto FPS:** Off
- **Damage Number:** On
- **Physics-Based Animation:** On
- **Cutscene Mode:** Fullscreen
- **Co-op Teammate VFX:** Off
- **Wounded Effect:** Off
- **Foliage Density:** Low *(Can be increased if performance allows)*
- **Anisotropic Filtering:** 16x
- **Vulkan:** On
- **Frame Generation:** On

---

### Additional Notes
- **Frame Generation (Snapdragon Users):** Change `dp.Override=MTK_6989` to `Adreno 825` *(or equivalent for Snapdragon devices)*. 
  > *Note: Experience may vary depending on device and SoC. Reportedly working on Snapdragon 8+ Gen 1 and newer.*