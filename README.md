<div align="center">
  <img src="https://img.shields.io/badge/Updated-AUG_22-blue?style=plastic&logo=github&logoColor=white" />
  <img src="https://img.shields.io/badge/🎯_Target_Version-3.6-green?style=plastic" />
  <img src="https://img.shields.io/badge/Support-Vulkan_&_OpenGL-orange?style=plastic&logo=cog&logoColor=white" />
</div>

<h1 align="center">Mobile WuWa-Config: Mobile Configuration for Wuthering Waves</h1>

<div align="center">

[![Stars](https://img.shields.io/github/stars/Arglax/WuWa-Config?style=social)](https://github.com/Arglax/WuWa-Config/stargazers) &nbsp;&nbsp;&nbsp;<a href="https://github.com/Arglax/WuWa-Config/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-CustomizedMIT-lightgrey?style=plastic" height="30"></a>&nbsp;&nbsp;&nbsp;<a href="https://discord.gg/renjxYBEZM"><img src="https://img.shields.io/badge/Discord-7289DA?logo=discord&logoColor=white&style=plastic" height="30"></a>

</div>

**Mobile WuWa Config** is a set of configs to help you improve your game's visual graphics, stability, or performance. There are numerous guides below to help you get started. For further help, join the <a href="https://discord.gg/renjxYBEZM"><img src="https://img.shields.io/badge/Discord-7289DA?logo=discord&logoColor=white&style=plastic" height="40"></a>

---

## 📢 Announcements — August 22, 2026
🆕 **Update:** Configs will be worked on until next week and will be optimized throughout the patch. We're currently testing C# environment.

**From July 29, 2026:** 
- All patchers, web tools, and companion applications are now organized in the unified **[Tools & Utilities](#-tools--utilities)** section below!

> [!NOTE]
> ***If KuroGames requests to take down this tool, it will be taken down.***
> 🔔 Keep an eye on the [forbidden CVars list](#forbidden-cvars-list) at the bottom of this file

✅ All configs are updated for **Version 3.5** and may be further optimized throughout the version.
---

## 📖 Table of Contents

- [What's Inside](#-whats-inside)
- [Tools & Utilities](#-tools--utilities)
- [Device Compatibility](#-device-compatibility)
- [How to Install](#️-how-to-install-beginner-friendly)
- [File Location](#-file-location)
- [Frequently Asked Questions (FAQ)](#-frequently-asked-questions-faq)
- [Need Help?](#-need-help)
- [Video Tutorials](#-video-tutorials)
- [AI-Assisted Config Notes](#-ai-assisted-config-creation)
- [Credits](#-credits)
- [Forbidden CVars List](#forbidden-cvars-list)
- [Disclaimer](#disclaimer)

---

## 📁 What's Inside

| File | Purpose |
|---|---|
| `Engine.ini` | General fine-tuning for default or preset scalability groups. |
| `DeviceProfiles.ini` | Device-specific overrides — targets GPU-level settings per hardware profile |

> In WuWa, `sg.*` are set in the DeviceProfiles.ini, which are then fine tuned by the cvars in Engine.ini.
**However**, cvars placed under a specific DeviceProfile name will take authority and will be the final value.  

---

## 🧰 Tools & Utilities

<details open>
<summary><b>Click to expand/collapse official suite & tools</b></summary>
<br>

All companion applications, patching tools, and web services are grouped here for easier navigation and utilization:

| Tool | Type | Description | Link |
|---|---|---|---|
| **WuWa Config Patcher** | Android App | Automated config patcher tool with built-in log decryption. | [Download Release](https://github.com/Arglax/Mobile-WuWa-Config/releases/tag/patcher_v1.4) \| [Patcher Docs](Mobile%20Config%20Patcher/README.md) |
| **WuWaLab** | Open Source | Open-source companion app for Wuthering Waves. | [Get Latest Release](https://github.com/Arglax/WuWaLab/releases) |
| **WuWa Custom Metadata Editor** | Auxiliary Utility | Android metadata editor for config distributors. Works solely for WuWa Config Patcher. | [Get Latest Release](https://github.com/Arglax/Custom-Metadata-Builder/releases) |
| **WuWa Portal Web Suite** | Web Application | Includes the Config Selector Engine, Online Log Decryptor, and DeviceProfiles.ini Generator. | [Launch WuWa Portal](https://arglax.github.io/Mobile-WuWa-Config/index.html) \| [Online Log Decryptor](https://arglax.github.io/Mobile-WuWa-Config/tools/log-decryptor.html) |

</details>

---

## 📱 Device Compatibility

These configs are optimized for **mid-end to flagship Android devices with Vulkan support**.

Tested on devices including the **Poco X6 Pro 5G (Mali G615)** and similar Dimensity/Adreno/Mali hardware. Results may vary by device.

If a config doesn't work well for your device, many other creators and communities now develop WuWa mobile configs — feel free to experiment, or create and tune your own. 😄

---

## 🛠️ How to Install (Beginner Friendly)
-> In case you're not using the [Config Patcher](https://github.com/Arglax/Mobile-WuWa-Config/releases/tag/patcher_v1.4), this is the manual mode.

<details>
<summary>Click to expand step-by-step instructions</summary>

You can also follow along with the video tutorial: https://youtu.be/bB6C8hp_dFQ

### ✅ Requirements

- A **Windows PC or laptop**
- A **USB / Lightning / Type-C cable**
- Your **Android device**

### 🔧 Step-by-Step

1. **Connect** your Android device to your PC via USB.
2. On your phone, select **"File Transfer" (MTP)** mode.
3. Open **File Explorer** on your PC.
4. Navigate to the config folder on your device (see path below).
5. Paste the provided `Engine.ini` and `DeviceProfiles.ini` into that folder.
6. **Overwrite existing files** if prompted.
7. **Launch Wuthering Waves** and enjoy! 🚀

</details>

---

## 📂 File Location

Navigate to this folder on your Android device:

```text
Internal Storage/
└── Android/
    └── data/
        └── com.kurogame.wutheringwaves.global/
            └── files/
                └── UE4Game/
                    └── Client/
                        └── Client/
                            └── Saved/
                                └── Config/
                                    └── Android/
```

The full path will look something like this (example using Poco X6 Pro 5G):

`This PC\POCO X6 Pro 5G\Internal shared storage\Android\data\com.kurogame.wutheringwaves.global\files\UE4Game\Client\Client\Saved\Config\Android`

---

## ❓ Frequently Asked Questions (FAQ)

<details>
<summary><b>Q: I am having issues with my <code>Client.log</code> or need to analyze crash logs?</b></summary>
<br>

If you encounter log errors or need to inspect game logs, you can easily decrypt them using either option:
* **Web:** Use the online [WuWa Portal Log Decryptor](https://arglax.github.io/Mobile-WuWa-Config/tools/log-decryptor.html) — upload your log and download the decrypted file directly.
* **App:** Use the **Mobile Config Patcher**, which features a built-in internal log decryptor.

</details>

<details>
<summary><b>Q: How do I fix black screen flickering?</b></summary>
<br>

Black screen flickering is usually caused by conflicting or incompatible hardware profiles. You can resolve this by:
1. Generating a fresh profile using the **`DeviceProfiles.ini` Generator** available on the [WuWa Portal](https://arglax.github.io/Mobile-WuWa-Config/index.html).
2. Or simply **deleting your current `DeviceProfiles.ini` file** in your game config folder and letting the game regenerate the default file.

</details>

---

## 📬 Need Help?

Join the **Discord** community for support, updates, and discussions:  
👉 https://discord.gg/renjxYBEZM

---

## 🎬 Video Tutorials

<details>
<summary>Click to expand tutorial links</summary>

**Configuration & Setup**
1. [Config Tutorial Playlist](https://youtube.com/playlist?list=PLn_0LF2KcH65tQ-RoqrgS25wqxV8ZTbfG)
2. [Applying Configs via PC](https://youtu.be/bB6C8hp_dFQ)
3. [Force Recompiling Shaders](https://youtu.be/uxio8GI85PY)

**DeviceProfile & GPU Configuration**
1. [Updating or Creating a DeviceProfile](https://youtu.be/gtmyFKGyl1M)
2. [Creating a Custom DeviceProfile](https://youtu.be/RnHye7emks8)
3. [Sample: Applying a Custom DeviceProfile](https://youtube.com/shorts/49OGYJ3ERWs)
4. [Finding Your DeviceProfile / GPU Family Name](https://youtube.com/shorts/ygf6GUBkx18)
> 💡 Tutorials **#1 and #4** above will help you update the DeviceProfile on your own, without waiting for a config creator to push an update.

**Mobile Config Patcher**
1. [Mobile Config Patcher v1.3 Showcase](https://youtu.be/NCYLjgMLzq0)

</details>

---

## 🤖 AI-Assisted Config Creation
If you use AI to help create or modify configs, Claude generally performs well for this task.

> 🛑 **Always verify that your CVars are real, registered, and supported by the game version you're using.** Check your `Client.log` files regularly. AI hallucinations are real.

**Useful references for tweaking your own configs:**
- [Epic Games Unreal Engine Console Variables Reference](https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-engine-console-variables-reference)
- [FRAMED UE4 Configuration Commands Guide](https://framedsc.com/GeneralGuides/ue4_commands.htm)

---

## 📝 Credits

Maintained by **Arglax**

Big thanks to everyone who contributed through testing, feedback, and sharing knowledge — directly and indirectly:

1. Kuya Thirdy
2. Brandy/yuukinyan (AlteriaX)
3. em00se
4. Eggsee
5. RGCloud
6. Will.Of.D
7. toldyou_idk
8. KRG6187
9. SuiX
10. k4irzw67
11. RabbyDevs
---

## Forbidden CVars List

> V3.6 Latest Forbidden CVars credits to Brandy's Server  
> https://github.com/Arglax/Mobile-WuWa-Config/blob/main/.github/forbidden_cvars.txt
---

## Disclaimer

> These configurations are provided "as is", without warranty of any kind. While config users have been around for a long time, still:
> *Use at your own risk.*
>
> Support may be offered for the original deployed configs. Any assistance provided is advisory only.
> Any remodification, tuning, or alteration voids author responsibility. I am not liable for crashes, performance issues, data loss, or any other consequences resulting from modified configurations.
>
> Donations are voluntary and do not constitute a purchase, service, or entitlement to support.

---

<a href="https://www.buymeacoffee.com/arglaxaqwv" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/arial-violet.png" alt="Optional Support Me" style="height: 60px !important; width: 217px !important;"></a>

> Support is voluntary and does not affect config availability or updates. I will always do what I can to keep up with Kuro's patches.

---

<details>
<summary>🔎 Tags (for search/SEO purposes)</summary>

`Wuthering Waves config` `WuWa graphics optimization` `Android ini mod`
`Vulkan shader cache` `increase WuWa FPS` `WuWa Engine.ini tweak`
`DeviceProfiles.ini tutorial` `WuWa config Poco X6 Pro` `WuWa lag fix Android`
`Mobile gaming performance` `Arglax WuWa` `wuwa config android` `wuwa config`
`arglax` `wuwa` `config` `tweak wuwa` `wuwa configs` `mobile wuwa config`
`mobile configs wuwa` `wuthering waves optimization` `fps boost wuwa`
`unreal engine 4.27 config` `android fps boost` `dimensity 8300 optimization`
`arglax tweaks` `wuwa optimization guide` `vulkan optimization` `low-end optimization wuwa` `client log decryptor` `log decryption`

</details>
