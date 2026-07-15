# 🧩 Wuthering Waves Config Testing Protocols
**Author:** Arglax  
**Purpose:** Standardized testing procedures for verifying custom `DeviceProfiles.ini` and `Engine.ini` configurations in *Wuthering Waves*.

---

## 🧠 What is a Config?

A **config** is a set of parameters that define how the game behaves, performs, and renders visuals.  
In Unreal Engine games like *Wuthering Waves*, configuration files allow us to **tune performance, graphics quality, and stability** beyond the in-game settings.

---

## ⚙️ Overview of Key Config Files

| File Name | Location | Purpose | Load Order |
|------------|-----------|----------|-------------|
| `Engine.ini` | `.../Config/Android/` | Defines **global engine behaviors** — rendering, shadows, anti-aliasing, and other engine-level controls. | **Loaded first** at game start-up. |
| `DeviceProfiles.ini` | `.../Config/Android/` | Defines **device-specific profiles** — controls resolution scale, texture quality, shadows, and effects by device tier. | **Loaded after `Engine.ini`** — acts as a fine tuner / limiter for final applied settings. |

### 🧩 How the Game Loads Configs

When the game starts:
1. **`Engine.ini`** loads first — sets up main rendering and system parameters.
2. **`DeviceProfiles.ini`** loads second — applies per-device optimizations or restrictions.
3. **In-game Settings** (your graphics menu selections) override or modify certain values after both files load.
4. Shader compilation runs, caching optimized instructions in:
   - `Files/UE4Game/VulkanProgramBinaryCache`
   - `Files/UE4Game/ProgramBinaryCache`

---

## 🧪 Standard Testing Protocols

These protocols are designed to **eliminate variable conditions** (shader cache, residual settings, etc.) to ensure accurate testing of config effects.

---

### 🧼 Protocol A — Clean Test (Full Reset)
> Use this when testing new configurations or when switching from a heavily modified setup.

**Objective:** Ensure no residual files, shader caches, or previous configs affect the test.

#### Steps:
1. **Delete the following folders:**
   - `.../Config/Android/`
   - `.../Files/UE4Game/VulkanProgramBinaryCache/`
   - `.../Files/UE4Game/ProgramBinaryCache/`
2. Launch the game — let it recreate all necessary files.
3. Wait for shader compilation to finish (expect stutters during this).
4. Exit the game properly.
5. Paste your new custom configs (`Engine.ini`, `DeviceProfiles.ini`) into the `Config/Android/` folder.
6. Restart the game to recompile shaders and apply changes.

✅ **Use When:**
- Testing a new major config set.
- Moving between RT and non-RT builds.
- Experiencing persistent artifacts or rendering bugs.

---

### ⚖️ Protocol B — Standard Test (Recommended)
> Best for verifying consistent performance and visual output across builds.

#### Steps:
1. Delete `DeviceProfiles.ini` and `Engine.ini` from `.../Config/Android/`.
2. Delete the shader cache folders:
   - `.../Files/UE4Game/VulkanProgramBinaryCache/`
   - `.../Files/UE4Game/ProgramBinaryCache/`
3. Launch the game — let it load and compile shaders.
4. Once inside, open **Settings → Graphics**:
   - Set **Quality Preset** to the **lowest**.
   - Gradually increase until you see the **👍 Recommended** icon.
5. Exit the game properly.
6. Paste your modified configs into the folder.
7. Restart the game — let shaders recompile.

✅ **Use When:**
- Testing performance or visuals on existing installs.
- Comparing updated tweaks of similar configs.
- Avoiding a total data reset while still ensuring accurate results.

---

### 🧩 Protocol C — Patch Test (Quick Check)
> ⚠️ Not recommended for major config differences.

#### Steps:
1. Paste or update only `DeviceProfiles.ini` and `Engine.ini`.
2. Launch the game.
3. If shaders recompile, let them finish.
4. Observe results.

✅ **Use When:**
- Minor edits or quick parameter validation.
- Time-limited testing (e.g., comparing small tweaks).
- Both configs share a similar structure.

🚫 **Avoid When:**
- Switching between entirely different modes (e.g., RT → Non-RT).
- Encountering rendering bugs or shader mismatches.

---

## 🧱 File & Folder Reference

| Folder / File | Purpose | Safe to Delete? | When to Delete |
|----------------|----------|------------------|----------------|
| `Config/Android/` | Stores `.ini` configs | ✅ | Protocol A / B |
| `ProgramBinaryCache/` | Compiled shader data | ✅ | Protocol A / B |
| `VulkanProgramBinaryCache/` | Vulkan-specific compiled shaders | ✅ | Protocol A / B |
| `Saved/` | User save data & preferences | ⚠️ | Only if corrupted or debugging persistent crashes |

---

## 🧾 Folder Layout

```
Wuthering Waves/
├── Config/
│   └── Android/
│       ├── DeviceProfiles.ini
│       └── Engine.ini
└── Files/
    └── UE4Game/
        ├── VulkanProgramBinaryCache/
        └── ProgramBinaryCache/
```

---

## 🧭 Notes & Best Practices

- Always **exit the game properly** before replacing `.ini` files. Force-closing may cause partial overwrites.
- If performance degrades or visuals glitch, clear shader caches and redo **Protocol A**.
- Keep a **backup of your original unmodified configs** for quick recovery.
- Configs are version-dependent — game updates may invalidate older parameters.
- You may include version tags in your configs (e.g., `# Config v1.2 - Balanced Performance`).

---

## 📋 Testing Conditions Checklist

Before running any protocol, make sure:

- [ ] Battery is **above 50%**
- [ ] Device temperature is reasonable — ideally **20–30°C**
- [ ] **Not charging during the test** unless you have bypass charging or active cooling (charging raises thermals and causes throttling)
- [ ] All background apps are closed (browsers, social media, overlays)
- [ ] Network conditions are consistent — switching between Wi-Fi and mobile data mid-test can affect frame pacing
- [ ] Shaders have **fully compiled** before recording any results

---

## 💬 Reporting Test Results

Submit feedback on the [Discord server](https://discord.gg/renjxYBEZM). Include the following:

| Field | Description | Example |
|--------|-------------|---------|
| Device Model | Your phone model and SoC | POCO X6 Pro 5G (Dimensity 8300) |
| Protocol Used | A / B / C | Protocol B |
| Config Name | Which config was tested | Balanced-RT-v1 |
| Observed Performance | FPS or smoothness impression | 55–60 FPS, stable |
| Visual Issues | Any artifacts or bugs | White outline on characters |
| Comments | Optional notes | Stuttered during shader compile, then smooth |

A few extra things worth noting in your report:
- **Frame consistency matters more than peak FPS** — a config with slightly lower FPS but smoother frame pacing may actually feel better in practice.
- If you did multiple config swaps or long test sessions, **reboot your device** before your final measurement to reset thermal and memory state.

---

### 📘 End of Document
> Following these protocols ensures reliable, reproducible, and comparable results across devices.  
> This helps fine-tune configs accurately — without guessing your device's internal state. 🚀  
> If a config crashes on your device, don't force it. Consider building your own personal config.  
> All other concerns — bring them to Discord.
