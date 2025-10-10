# 🧩 Wuthering Waves Config Testing Protocols
**Author:** Arglax  
**CoAuthor**: ChatGPT    
**Purpose:** Standardized testing procedures for verifying custom `DeviceProfiles.ini` and `Engine.ini` configurations in *Wuthering Waves*.

---

## 🧠 What is a Config?

A **config** is a set of parameters that define how the game behaves, performs, and renders visuals.  
In Unreal Engine games like *Wuthering Waves*, configuration files allow us to **tune performance, graphics quality, and stability** beyond the in-game settings.

---

## ⚙️ Overview of Key Config Files

| File Name | Location | Purpose | Load Order |
|------------|-----------|----------|-------------|
| `Engine.ini` | `.../Wuthering Waves/Config/Android/` | Defines **global engine behaviors** such as rendering, shadows, anti-aliasing, and other engine-level controls. | **Loaded first** during game start-up. |
| `DeviceProfiles.ini` | `.../Wuthering Waves/Config/Android/` | Defines **device-specific profiles**, controlling limits like resolution scale, texture quality, shadows, and effects based on device tier. | **Loaded after `Engine.ini`** — acts as a **fine tuner / limiter** for final applied settings. |

### 🧩 How the Game Loads Configs

When the game starts:
1. **`Engine.ini`** is loaded first — this sets up the main rendering and system parameters.
2. **`DeviceProfiles.ini`** loads second — applying per-device optimizations or restrictions (acts like a performance filter).
3. **User Settings** (from your in-game menu) override or modify certain values after both files are loaded.
4. Shader compilation occurs, caching optimized instructions in:
   - `Files/UE4Game/VulkanProgramBinaryCache`
   - `Files/UE4Game/ProgramBinaryCache`

---

## 🧪 STANDARD TESTING PROTOCOLS

These protocols are designed to **eliminate variable conditions** (shader cache, residual settings, etc.) to ensure accurate testing of config effects.

---

### 🧼 **Protocol A — Clean Test (Full Reset)**
> Use this when testing new configurations or when switching from a heavily modified setup.

**Objective:**  
Ensure no residual files, shader caches, or previous configs affect the test.

#### 🧾 Steps:
1. **Delete the following folders:**
   - `.../Wuthering Waves/Config/Android/`
   - `.../Wuthering Waves/Files/UE4Game/VulkanProgramBinaryCache/`
   - `.../Wuthering Waves/Files/UE4Game/ProgramBinaryCache/`
2. Launch the game — let it recreate all necessary files.
3. Wait for shader compilation to finish (the game may stutter during this).
4. Exit the game properly.
5. Paste your **new custom configs** (`Engine.ini`, `DeviceProfiles.ini`) into the `Config/Android/` folder.
6. Restart the game to recompile shaders and apply changes.

✅ **Use When:**
- Testing a new major config set.
- Moving between RT and non-RT builds.
- Experiencing persistent artifacts or bugs.

---

### ⚖️ **Protocol B — Standard Test (Recommended)**
> Best for verifying consistent performance and visual output across builds.

#### 🧾 Steps:
1. Delete both `DeviceProfiles.ini` and `Engine.ini` in `.../Config/Android/`.
2. Start the game — let it load and compile shaders.
3. Once inside:
   - Open **Settings → Graphics.**
   - Set **Quality Preset** to the **LOWEST**.
   - Gradually increase it until you see the **👍 Recommended** icon appear.
4. Exit the game properly.
5. Paste your **modified configs** into the folder.
6. Restart the game — let shaders recompile.

✅ **Use When:**
- Testing performance or visuals on existing installs.
- Comparing updated tweaks of similar configs.
- Avoiding total data resets while ensuring accurate results.

---

### 🧩 **Protocol C — Patch Test (Quick Check)**
> ⚠️ *Not recommended for major config differences.*

#### 🧾 Steps:
1. Paste or update only the `DeviceProfiles.ini` and `Engine.ini`.
2. Start the game.
3. If the game recompiles shaders, let it finish.
4. Observe the results.

✅ **Use When:**
- Minor edits or quick parameter validation.
- Time-limited testing (e.g., comparing small tweaks).
- You’re sure both configs share a similar structure.

🚫 **Avoid When:**
- Switching between entirely different performance modes (e.g., RT → Non-RT).
- Encountering rendering bugs or shader mismatches.

---

## 🧱 Recommended File & Folder Summary

| Folder / File | Purpose | Safe to Delete? | When to Delete |
|----------------|----------|------------------|----------------|
| `Config/Android/` | Stores `.ini` configs | ✅ | Protocol A/B |
| `ProgramBinaryCache/` | Stores compiled shader data | ✅ | Protocol A |
| `VulkanProgramBinaryCache/` | Stores Vulkan-specific compiled shaders | ✅ | Protocol A |
| `Saved/` | Stores user save data & prefs | ⚠️ | Only if corrupted or debugging persistent crashes |

---

## 🧭 Notes & Best Practices

- Always **exit the game properly** before replacing `.ini` files. Force-closing may cause partial overwrites.
- If performance degrades or visuals glitch, **clear shader caches** and redo **Protocol A**.
- Keep a backup of the **original unmodified configs**.
- Configs are version-dependent — updates to the game engine may invalidate older parameters.
- You may include version tags in your configs (e.g., `# Config v1.2 - Balanced Performance`).

---
  
## 🧾 Example Folder Layout
Wuthering Waves/  
├── Config/  
│ └── Android/  
│ ├── DeviceProfiles.ini  
│ └── Engine.ini  
└── Files/  
└── UE4Game/  
├── VulkanProgramBinaryCache/  
└── ProgramBinaryCache/  
  
---

## 💬 Reporting Test Results

When submitting test feedback, please include:
| Field | Description | Example |
|--------|-------------|----------|
| Device Model | Your exact phone or SoC | POCO X6 Pro 5G (Dimensity 8300) |
| Protocol Used | A / B / C | Protocol B |
| Config Name | Which config was tested | Balanced-RT-v1 |
| Observed Performance | FPS or Smoothness | 55–60 FPS, stable |
| Visual Issues | Any artifacts or bugs | White outline on characters |
| Comments | Optional notes | Stutters during shader compile, then smooth |

---
## 🧾 Final Notes

1. **Maintain Stable Power & Temperature**
   - Ensure your device battery is **above 50%** before testing.
   - Ideal device temperature: **20–30°C**.
   - Avoid testing while charging unless you have **bypass charging** or a **cooling solution** — charging increases thermals, causing **thermal throttling** and **inconsistent FPS** readings.

2. **Close Unnecessary Apps**
   - Close all background apps (social media, browsers, launchers, overlays, etc.) before launching the game.
   - Background tasks can consume CPU, RAM, or GPU cycles — leading to inaccurate performance comparisons.

3. **Keep Conditions Consistent**
   - Try to run tests under **similar ambient temperature**, **battery level**, and **graphics preset** each time.
   - Avoid switching between Wi-Fi / Mobile Data mid-test; network changes can affect frame pacing and thermal load.

4. **Let Shader Compilation Finish**
   - Upon first launch after changing configs, let the game **fully compile shaders** before recording performance results.
   - During this process, expect stutters or lag spikes — this is normal and not part of the performance measurement.

5. **Avoid Replacing Configs Mid-Session**
   - Always **exit the game properly** before copying new `.ini` files.
   - Replacing configs while the game is running can cause **partial overwrites** or **broken parameter loads**.

6. **Document Your Results**
   - After each test, record your:
     - Config version tested
     - Device model and SoC
     - Average FPS and visual impressions
     - Any noticeable artifacts or bugs
   - Consistent documentation helps in **diagnosing issues faster** and improving future configs.

7. **Preserve Backup Copies**
   - Keep an unmodified backup of your default `Engine.ini` and `DeviceProfiles.ini` files.
   - This allows quick recovery if a config causes boot issues or visual corruption.

8. **Test in Controlled Environments**
   - Avoid testing in areas with **overheating risks**, **unstable network**, or **high ambient temperature**.
   - External cooling (like a fan) can help ensure consistent results during long play sessions.

9. **Don’t Rely Solely on FPS**
   - FPS alone isn’t the full story. Observe **frame consistency**, **visual stability**, and **loading times**.
   - A config with slightly lower FPS but smoother frame pacing may actually perform better in practice.

10. **Always Reboot After Heavy Testing**
    - If you’ve done multiple config swaps, shader clears, or long test sessions, **reboot your device** to reset thermal and memory states before retesting.

---

### 📘 End of Document
> Following these protocols ensures reliable, reproducible, and comparable results across devices.  
> This helps **Arglax** fine-tune configs accurately — without guessing your device’s internal state. 🚀  
> If the config still crashes on your mobile, don't use it. Consider creating your own, personal config.  
> All other concerns in Discord please.