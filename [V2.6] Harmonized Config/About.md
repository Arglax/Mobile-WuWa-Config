# 📱 Harmonized DeviceProfiles Config

**Harmonized Config** is a finely tuned `DeviceProfiles.ini` setup for Android that unifies **Ray Tracing (RT)** and **Screen Space Reflections (SSR)** into a flexible level-based system.  
It allows you to easily swap between **Vulkan** and **OpenGLES**, and select graphical intensity levels (`Level0 → Level4`) depending on device capability.

---

## ✨ Key Features

- 🔄 **Unified Level System**  
  Choose from **SSR_Level0–4** or **RT_Level0–4**, covering all performance vs. quality tradeoffs.

- ⚡ **Default Baseline**  
  - **RT_Default = Level3 (High RT)** → Matches your current `engine.ini` settings.  
  - **SSR_Default = Level3 (High SSR)** → Baseline when Ray Tracing is disabled.

- 🌈 **Multi-Backend Support**  
  Works seamlessly across **Vulkan** and **OpenGLES** RHIs.

- 📱 **GPU-Agnostic Redirects**  
  All major Adreno, Mali, MediaTek, and Snapdragon devices are routed to the **Android_VeryHigh** profile.
  
- 🔄 **One-Line Switch**  
  Change between **Vulkan/OpenGLES** and **SSR/RT** by editing only **one line** in `DeviceProfiles.ini`.

- ⚡ **Performance-Oriented Defaults**  
  Ships with SSR enabled for maximum compatibility and speed.

- 🌌 **Ray Tracing Ready**  
  Enables PC-like reflections and shadows on supported devices.

- 📱 **Universal Profiles**  
  All Android GPU/SoC profiles inherit from `Android_VeryHigh`, ensuring consistent behavior.

---

---

## 🎚️ Level Definitions

Each rendering method (SSR or RT) has **5 levels (0–4)** plus a **Default profile**.  
You can assign them per-RHI (Vulkan or OpenGLES).  

---

### 🔳 SSR Levels

| Level      | Quality Settings                               | Notes |
|------------|------------------------------------------------|-------|
| SSR_Level0 | Minimal SSR (bare reflections, fastest)        | For very weak devices |
| SSR_Level1 | Low SSR, temporal disabled                     | Entry-level stability |
| SSR_Level2 | Medium SSR, temporal smoothing on              | Balanced |
| SSR_Level3 | **High SSR (Default)**, temporal on, Quality=4 | Matches `engine.ini` baseline |
| SSR_Level4 | Ultra SSR, all refinements maxed               | Flex mode |

---

### 🌌 RT Levels

| Level      | Quality Settings                                                                 | Notes |
|------------|----------------------------------------------------------------------------------|-------|
| RT_Level0  | RT enabled, extremely cut down (shadows only)                                    | Proof-of-concept |
| RT_Level1  | RT minimal effects, 1 sample per pixel                                           | Low-end RT |
| RT_Level2  | RT medium, GI/Fog on, samples=1                                                  | Balanced |
| RT_Level3  | **High RT (Default)** → Quality=3, most RT features on, samples=1                | Matches `engine.ini` baseline |
| RT_Level4  | Ultra RT, samples per pixel ↑ (2–4), max quality on all features                 | Ultra / Flex mode |

---

