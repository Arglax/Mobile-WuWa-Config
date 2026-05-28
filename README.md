
<h1 align="center">📢 Announcements 📢</h1>  

## May 28, 2026
- I have some free time now, I might update configs before the next WuWa version.
- Stable Config A and C to be updated this week, along with the Potato Config.
- > WuWa released a recent patch that made gameplay smoother. For individuals looking for better performance at the cost of some graphics, set your resolution to Medium or High only. **DO NOT USE LOW** as usually it makes a lot worse (well unless it works for you).
  > Keep an eye on the forbidden cvars list (can be also viewed in Discord)  

## May 10, 2026
- **Stable Config B Updated** 
- Performance Configs and High Visuals will be released after Stable Configs.
---

> ⚠️ **DeviceProfiles.ini may cause unexpected issues.**
> To resolve this, choose one of the following:
> 1. Delete `DeviceProfiles.ini` and rely solely on `Engine.ini`
> 2. Optimize your `DeviceProfiles.ini` as shown in [this video](https://youtu.be/gtmyFKGyl1M?si=JcctXJ_e9t18St0u)

-----------------------------------------------
> If my configs don't work for you, don't worry. There are a lot of other people and groups who create mobile configs for WuWa now. You can try until you find the best one for you. ***Or better yet***, tweak your own custom config :DDD.  

> For those who want to tweak their own configs,  
> this is the main reference: [UE Console Variable List](https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-engine-console-variables-reference)  
> another reference: [UE4.26 CVars List](https://framedsc.com/GeneralGuides/ue4_commands.htm)  

Lastly, for those who use AI in their configs, I would recommend using Claude  
   > Also make sure your configs' cvars are "real" and "registered". Always check your Client.Log files! AI hallucination is real.

    
<div align="center">
  <img src="https://img.shields.io/badge/Updated-APRIL_19-blue?style=for-the-badge&logo=github&logoColor=white" />
  <img src="https://img.shields.io/badge/🎯_Target_Version-3.2-green?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Support-Vulkan_&_Non--Vulkan-orange?style=for-the-badge&logo=cog&logoColor=white" />
</div>
<h1 align="center">🎮 WuWa-Config: Mobile Configuration for Wuthering Waves</h1>

[![Stars](https://img.shields.io/github/stars/Arglax/WuWa-Config?style=social)](https://github.com/Arglax/WuWa-Config/stargazers) &nbsp;&nbsp;&nbsp;&nbsp; [![License](https://img.shields.io/badge/License-CustomizedMIT-lightgrey)](https://github.com/Arglax/WuWa-Config/blob/main/LICENSE) &nbsp;&nbsp;&nbsp;&nbsp; [![Discord](https://img.shields.io/badge/Discord-7289DA?logo=discord&logoColor=white)](https://discord.gg/renjxYBEZM)

**WuWa-Config** is a custom-built set of configuration files designed to **boost graphics, stability, and performance** in *Wuthering Waves* on Android devices.

Hopefully, this guide will help you unlock your device’s full visual and gameplay potential.  

## Disclaimer
>These configurations are provided "as is", without warranty of any kind. While config users have been around for a long time, still :  
> *Use at your own risk.*  
>Support may be offered for the original deployed configs. Any assistance provided is advisory only.
>Any remodification, tuning, or alteration voids author responsibility. I am not liable for crashes, performance issues, data loss, or any other consequences resulting from modified configurations.

>Donations are voluntary and do not constitute a purchase, service, or entitlement to support.

---
<a id="toc"></a>
## 📖 Table of Contents
- [What’s Inside](#-whats-inside)
- [How to Install](#how-to-install)
- [File Location](#file-location)
- [Need Help?](#-need-help)
- [Video Tutorials](#vidtut)
- [Credits](#-credits)
- [Tags](#-tags-for-seo-indexing)

---

## 📁 What’s Inside

- `Engine.ini` – Core rendering and graphics tweaks  
- `DeviceProfiles.ini` – Device-specific enhancements  

---
<a id="how-to-install"></a>
## 🛠️ How to Install (Beginner Friendly)
You can view video tutorial here: https://youtu.be/bB6C8hp_dFQ

### ✅ Requirements:
- A **Windows PC or laptop**
- A **Connecting Cable (USB,Lightning, or Type C)** 
- Your **Android device**

---

### 🔧 Step-by-Step Instructions:

1. **Connect** your Android device to your PC via USB.  
2. Select **"File Transfer" (MTP)** mode on your phone.  
3. Open **File Explorer** on your PC.  
4. Navigate to the following folder:

<details>
<summary>📂 File Location Path</summary>
<a id="file-location"></a>
To access or modify configuration files for *Wuthering Waves*, navigate to the following folder of your Android device:

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

</details>

5. Paste the provided:
   - `Engine.ini`
   - `DeviceProfiles.ini`

The complete path to the correct config folder should look something like this.  
In this case, the device I used is Poco X6 Pro 5G
```
This PC\POCO X6 Pro 5G\Internal shared storage\Android\data\com.kurogame.wutheringwaves.global\files\UE4Game\Client\Client\Saved\Config\Android
```

> ⚠️ Overwrite existing files if prompted.  

7. **Launch Wuthering Waves** and enjoy! 🚀  

---

## 📬 Need Help?

Join the **Discord** community for support, updates, and discussions:  
👉 https://discord.gg/renjxYBEZM

<a id="vidtut"></a>
## Video Tutorials: 
## Configuration & Setup
1. Config Tutorial Playlist
https://youtube.com/playlist?list=PLn_0LF2KcH65tQ-RoqrgS25wqxV8ZTbfG
2. Applying Configs via PC
https://youtu.be/bB6C8hp_dFQ
3. Force Recompiling Shaders
https://youtu.be/uxio8GI85PY

## DeviceProfile & GPU Configuration
1. Updating or Creating a DeviceProfile
https://youtu.be/gtmyFKGyl1M
2. Creating a Custom DeviceProfile
https://youtu.be/RnHye7emks8
3. Sample: Applying a Custom DeviceProfile
https://youtube.com/shorts/49OGYJ3ERWs
4. Finding Your DeviceProfile / GPU Family Name (Client.log on Mobile using SAF + ZArchiver)
https://youtube.com/shorts/ygf6GUBkx18
> #1 and #4 will help you update the DeviceProfile on your own, without waiting for a config creator's update on their DeviceProfile list 

---

## 📝 Credits

Maintained by **Arglax**  
Optimized for **Mid-end/Flagship Android devices with Vulkan support**

Also giving credits to these entities as I have had config creation learnings through them indirectly and some directly. Also including the meticulous testers and feedback givers in Discord: 
1. Kuya Thirdy 
2. Brandy (AlteriaX)  
3. em00se  
4. Eggsee  
5. RGCloud  
6. Will.Of.D  
7. toldyou_idk  
8. KRG6187 
9. SuiX    
---

## 🔎 Tags (for SEO indexing)
`Wuthering Waves config`, `WuWa graphics optimization`, `Android ini mod`,  
`Vulkan shader cache`, `increase WuWa FPS`, `WuWa Engine.ini tweak`,  
`DeviceProfiles.ini tutorial`, `WuWa config Poco X6 Pro`, `WuWa lag fix Android`,  
`Mobile gaming performance`, `Arglax WuWa`, `wuwa config android`, `wuwa config`,  
`arglax`, `wuwa`, `config`, `tweak wuwa`, `wuwa configs`, `mobile wuwa config`,  
`mobile configs wuwa`, `wuthering waves optimization`, `fps boost wuwa`,  
`unreal engine 4.27 config`, `android fps boost`, `dimensity 8300 optimization`,  
`arglax tweaks`, `wuwa optimization guide`, `vulkan optimization`, `low-end optimization wuwa`

---

<a href="https://www.buymeacoffee.com/arglaxaqwv" target="_blank"> <img src="https://cdn.buymeacoffee.com/buttons/v2/arial-violet.png" alt="Optional Support Me" style="height: 60px !important; width: 217px !important;"></a>  

> Again, support is voluntary and does not affect config availability or updates. I will always do what I can to further improve our experiences.
