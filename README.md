<div align="center">
  <img src="https://img.shields.io/badge/Updated-JUNE_8-blue?style=for-the-badge&logo=github&logoColor=white" />
  <img src="https://img.shields.io/badge/🎯_Target_Version-3.4-green?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Support-Vulkan_&_Non--Vulkan-orange?style=for-the-badge&logo=cog&logoColor=white" />
</div>

<h1 align="center">🎮 WuWa-Config: Mobile Configuration for Wuthering Waves</h1>

<div align="center">

[![Stars](https://img.shields.io/github/stars/Arglax/WuWa-Config?style=social)](https://github.com/Arglax/WuWa-Config/stargazers) &nbsp;&nbsp;&nbsp;&nbsp; [![License](https://img.shields.io/badge/License-CustomizedMIT-lightgrey)](https://github.com/Arglax/WuWa-Config/blob/main/LICENSE) &nbsp;&nbsp;&nbsp;&nbsp; [![Discord](https://img.shields.io/badge/Discord-7289DA?logo=discord&logoColor=white)](https://discord.gg/renjxYBEZM)

</div>

**WuWa-Config** is a custom-built set of configuration files designed to **boost graphics, stability, and performance** in *Wuthering Waves* on Android devices.

Hopefully, this guide will help you unlock your device's full visual and gameplay potential.

---

## 📢 Announcements — June 8, 2026
---
> [!IMPORTANT]
> **Client.log is Now Encrypted**
>
> Kuro has encrypted `Client.log` which is our most valuable reference for config development. This is a significant hurdle that may slow down or even halt future config work.

Update as of 8:22AM, I am releasing a [client.log decryptor](https://github.com/Arglax/Mobile-WuWa-Config/tree/main/misc/Client%20Log%20Decryptor). This tool may or may not work for your client.logs. This is not intended for the general audience but for config creators and may require a little bit of reading (like 5 mins). I do not intend to fully work on this tool since I am not knowledgeable enough nor interested in continuing this.  
  
Update as of 7:41 PM. I released a user-friendly log decryptor where you can just upload your log and download the decrypted file.  [View tool here](https://arglax.github.io/Mobile-WuWa-Config/)  

> 🔔 **Keep an eye on the [forbidden CVars list](#forbidden-cvars-list)** at the bottom of this file. It is also available in the [Discord server](https://discord.gg/renjxYBEZM).

- ✅ All configs are updated for **Version 3.4**. They may be further optimized throughout the version.  
---

## 📖 Table of Contents

- [What's Inside](#-whats-inside)
- [Device Compatibility](#-device-compatibility)
- [How to Install](#️-how-to-install-beginner-friendly)
- [File Location](#-file-location)
- [Need Help?](#-need-help)
- [Video Tutorials](#-video-tutorials)
- [AI-Assisted Config Notes](#-ai-assisted-config-creation)
- [Credits](#-credits)
- [Disclaimer](#disclaimer)

---

## 📁 What's Inside

| File | Purpose |
|---|---|
| `Engine.ini` | Core rendering and graphics tweaks — affects visual quality, shadows, post-processing, and draw distances |
| `DeviceProfiles.ini` | Device-specific overrides — targets GPU-level settings per hardware profile |

> In WuWa, Engine.ini takes higher priority than the DeviceProfiles.ini, hence, cvar-specific tweaks are done in the Engine.ini  
---

## 📱 Device Compatibility

These configs are optimized for **mid-end to flagship Android devices with Vulkan support**.

Tested on devices including the **Poco X6 Pro 5G (Mali G615)** and similar Dimensity/Adreno/Mali hardware. Results may vary by device.

If a config doesn't work well for your device, many other creators and communities now develop WuWa mobile configs — feel free to experiment. Or better yet: create and tune your own. 😄

---

## 🛠️ How to Install (Beginner Friendly)

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

---

## 📂 File Location

Navigate to this folder on your Android device:

```
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

```
This PC\POCO X6 Pro 5G\Internal shared storage\Android\data\com.kurogame.wutheringwaves.global\files\UE4Game\Client\Client\Saved\Config\Android
```

---

## 📬 Need Help?

Join the **Discord** community for support, updates, and discussions:
👉 https://discord.gg/renjxYBEZM

---

## 🎬 Video Tutorials

### Configuration & Setup
1. [Config Tutorial Playlist](https://youtube.com/playlist?list=PLn_0LF2KcH65tQ-RoqrgS25wqxV8ZTbfG)
2. [Applying Configs via PC](https://youtu.be/bB6C8hp_dFQ)
3. [Force Recompiling Shaders](https://youtu.be/uxio8GI85PY)

### DeviceProfile & GPU Configuration
1. [Updating or Creating a DeviceProfile](https://youtu.be/gtmyFKGyl1M)
2. [Creating a Custom DeviceProfile](https://youtu.be/RnHye7emks8)
3. [Sample: Applying a Custom DeviceProfile](https://youtube.com/shorts/49OGYJ3ERWs)
4. [Finding Your DeviceProfile / GPU Family Name](https://youtube.com/shorts/ygf6GUBkx18)

> 💡 Tutorials **#1 and #4** above will help you update the DeviceProfile on your own, without waiting for a config creator to push an update.

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
Optimized for **mid-end to flagship Android devices with Vulkan support**

Big thanks to everyone who contributed through testing, feedback, and sharing knowledge — directly and indirectly:

1. Kuya Thirdy
2. Brandy (AlteriaX)
3. em00se
4. Eggsee
5. RGCloud
6. Will.Of.D
7. toldyou_idk
8. KRG6187
9. SuiX
10. yuukinyan (wth Brandy this was u?!)
---

## Forbidden CVars List  
| Console Variable |
| :--- |
| `r.Kuro.SkeletalMesh.LODDistanceScale` |
| `r.Streaming.Boost` |
| `r.Streaming.PoolSize` |
| `r.Streaming.LimitPoolSizeTOVRAM` |
| `r.Shadow.MaxCSMResolution` |
| `r.Streaming.MinBoost` |
| `r.MipMapLODBias` |
| `r.TextureGroup.Landscape.TextureLODBias` |
| `r.Kuro.TexturePool.ExtraBudgetMB` |
| `r.Streaming.CPUReadback` |
| `r.Streaming.UseAsyncCPUReadback` |
| `r.Streaming.MaxNumTexturesTostreamPerFrame` |
| `r.Streaming.MinMipForSplitRequest` |
| `r.Streaming.UseFixedPoolsize` |
| `r.Streaming.UseAllMips` |
| `r.Streaming.MaxTempMemoryAllowed` |
| `r.RayTracing.LimitDevice` |
| `r.DetailMode` |
| `r.MaterialQualityLevel` |
| `r.KuroMaterialQualityLevel` |
| `r.ViewDistancescale` |
| `Kuro.CppEffectsystem.UseLowMemoryPlayerEffectLruCapacity` |
| `r.AsyncComputePSO` |
| `r.Streamline.DLSSG.RetainResourceswhenoff` |
| `r.MobileContentscaleFactor` |
| `r.SecondaryScreenPercentage.GameViewport` |
| `r.ScreenPercentage` |
| `r.AFME.Enable` |
| `r.MFRC.Enable` |
| `r.FEstimation.Option` |
> V3.4 Latest Forbidden CVars credits to yuukinyan

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

> Support is voluntary and does not affect config availability or updates. I will always do what I can to keep improving the experience.

---

## 🔎 Tags

`Wuthering Waves config` `WuWa graphics optimization` `Android ini mod`
`Vulkan shader cache` `increase WuWa FPS` `WuWa Engine.ini tweak`
`DeviceProfiles.ini tutorial` `WuWa config Poco X6 Pro` `WuWa lag fix Android`
`Mobile gaming performance` `Arglax WuWa` `wuwa config android` `wuwa config`
`arglax` `wuwa` `config` `tweak wuwa` `wuwa configs` `mobile wuwa config`
`mobile configs wuwa` `wuthering waves optimization` `fps boost wuwa`
`unreal engine 4.27 config` `android fps boost` `dimensity 8300 optimization`
`arglax tweaks` `wuwa optimization guide` `vulkan optimization` `low-end optimization wuwa`
