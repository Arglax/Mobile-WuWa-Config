# WuWa Config Patcher

An average, light-weight android application to improve streamlining of the quality of life in applying mobile configuration for Wuthering Waves.  

[![Download WuWa Config Patcher](https://img.shields.io/badge/Download-WuWa%20Config%20Patcher%20v1.1-brightgreen?style=plastic&logo=android)](https://github.com/Arglax/Mobile-WuWa-Config/releases/tag/patcher_v1.1)
---

## 🚀 Key Features
- **[New] Get configs from any download URL(must be .zip)**
- **[New] Get configs from any local repository(folder or zip)**
- **[New] Advanced patching and reverting options**
- **Repository Sync** — Instantly fetch the latest configs from this GitHub.
- **1-Click Patching** — Uses the Shizuku service to write game configurations directly to the protected game data folder. You no longer need to waste time going into the config folder.
- **Safe Revert** — Accidentally break your graphics settings? Use **Revert to Vanilla** to instantly restore default game files.
- **External Utilities** — Quick Link access to the **Mobile Config Selector** and **Client Log Decryptor**  
- **Shareable Patches** — Export your generated patches as `.zip` files to share with friends.
>[!NOTE]
> An auto-update on startup feature will be added in v1.2.0  
---

## 🛠 Prerequisites

This app requires **[Shizuku](https://shizuku.rikka.app/) / [Shizuku_GitHub](https://github.com/RikkaApps/Shizuku/releases/tag/v13.6.0)** to function. Shizuku bypasses Android's scoped storage restrictions and grants the app permission to modify your game files.

1. Install Shizuku from the Google Play Store or the official website.
2. Enable Shizuku via **Wireless Debugging** or **PC-Terminal** (non-rooted devices) or **Root access**.
3. Ensure the Shizuku daemon is active before opening the Patcher.

---

## 📖 How to Use

### For Users with Shizuku Already Set Up
1. Open WuWa Config Patcher.
2. Tap **Sync Files & Refresh** to download the latest configs.
3. Select your preferred graphics preset from the dropdown menu.
4. Tap **1-Click Patch** to apply the settings immediately.

### For New Users
1. Open the app and trigger the **Setup Wizard** from the main screen.
2. Follow the instructions to install and authorize Shizuku.
3. Once the Shizuku icon shows as **"Running"** and permissions are granted, the **1-Click Patch** button will become enabled.

## 📲 Quick Start Guide

### 1️⃣ Install the App
Since this app isn't from the Play Store, Android will flag it as unrecognized. This is expected — just tap **Install anyway**.

<img src="assets/img_appblock.jpg" width="300">

Once scanned, Play Protect will confirm the app is clean and safe to use.

<img src="assets/img_security_passed.jpg" width="300">

---

### 2️⃣ Allow Shizuku Access
On first launch, the Setup Wizard will prompt you to grant Shizuku permissions. Tap **Allow all the time**.

<img src="assets/img_allowshizuku.jpg" width="300">

---

### 3️⃣ Apply a Config Patch
Pick your preset from **Engine Presets** and tap **1-Click Patch**. You'll see a confirmation once it's applied.

<img src="assets/img_configpatch_success.jpg" width="300">

---

### 4️⃣ Revert to Vanilla
Want to undo your changes? Tap **Revert back to Default Config**, confirm the prompt, and you're back to stock settings.

<img src="assets/img_reverttoVanilla.jpg" width="300">
<img src="assets/img_configDeleted.jpg" width="300">

---

## 📋 Help & Troubleshooting

| Feature | Description |
|---|---|
| **Sync Files** | Downloads the latest config release. |
| **Config Selector** | Opens a web browser to a tool for checking recommended config preset. |
| **Log Decryptor** | Decrypts your uploaded Client.Log + some QoL features. |
| **Revert to Vanilla** | Deletes modified files. The game will automatically recreate default files on your next launch. |

---

## 🛡 Disclaimer

This tool is for optimization purposes only. By using this app, you acknowledge that modifying game files is done at your own discretion. Always ensure you have a backup if you are unsure about the changes you are applying, especially if you have your own **customized** config or else it will be lost. The application does not tamper with your data except to patch the config file and all tools included runs locally on your device. No data is being transmitted to an external, online server.

---

## 💻 Technical Stack

- **Language:** Kotlin
- **UI Framework:** Jetpack Compose (Material 3)
- **Permissions:** Shizuku API
- **Architecture:** Repository-pattern driven, Coroutine-based concurrency
