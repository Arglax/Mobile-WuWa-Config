# WuWa Config Patcher

An average, light-weight android application to improve streamlining of the quality of life in applying mobile configuration for Wuthering Waves.

[![Download WuWa Config Patcher](https://img.shields.io/badge/Download-WuWa%20Config%20Patcher%20v1.2-brightgreen?style=plastic&logo=android)](https://github.com/Arglax/Mobile-WuWa-Config/releases/tag/patcher_v1.2)
---

## 🚀 Key Features
- **[New] Automatic update checker** — Get notified on startup when a newer version is available, with a one-tap link to update.
- **Get configs from any download URL** (must be `.zip`)
- **Get configs from any local repository** (folder or zip)
- **Advanced patching and reverting options**
- **Repository Sync** — Instantly fetch the latest configs from this GitHub.
- **1-Click Patching** — Uses the Shizuku service to write game configurations directly to the protected game data folder. You no longer need to waste time going into the config folder.
- **Safe Revert** — Accidentally break your graphics settings? Use **Revert to Vanilla** to instantly restore default game files.
- **External Utilities** — Quick Link access to the **Mobile Config Selector** and **Client Log Decryptor**
- **Shareable Patches** — Export your generated patches as `.zip` files to share with friends.

---

## 🛠 Prerequisites

This app requires **[Shizuku](https://shizuku.rikka.app/) / [Shizuku_GitHub](https://github.com/RikkaApps/Shizuku/releases/tag/v13.6.0)** to function. Shizuku bypasses Android's scoped storage restrictions and grants the app permission to modify your game files.

1. Install Shizuku from the Google Play Store or the official website.
2. Enable Shizuku via **Wireless Debugging**, **PC-Terminal** (non-rooted devices), or **Root access**.
3. Ensure the Shizuku daemon is active before opening the Patcher.

---

<details>
<summary><strong>📖 Usage Guide</strong> (click to expand)</summary>

<br>

<details>
<summary><strong>Installation</strong></summary>

Since this app isn't from the Play Store, Android will flag it as unrecognized. This is expected.

1. Tap **Install anyway** when prompted.

   <img src="assets/img_appblock.jpg" width="280">

2. Play Protect will scan and confirm the app is clean and safe to use.

   <img src="assets/img_security_passed.jpg" width="280">

3. On first launch, the Setup Wizard will prompt you to grant Shizuku permissions — tap **Allow all the time**.

   <img src="assets/img_allowshizuku.jpg" width="280">

</details>

<details>
<summary><strong>Applying a Patch</strong></summary>

**If Shizuku is already running:**
1. Open WuWa Config Patcher.
2. Tap **Sync Files & Refresh** (or pull down to refresh) to fetch the latest configs.
3. Select your preferred graphics preset from **Engine Presets**.
4. Tap **1-Click Patch** — you'll get a confirmation once it's applied.

   <img src="assets/img_configpatch_success.jpg" width="280">

**If Shizuku isn't set up yet:**
1. Open the app and trigger the **Setup Wizard** from the main screen.
2. Follow the prompts to install and authorize Shizuku.
3. Once Shizuku shows as **Running** and permission is granted, **1-Click Patch** unlocks automatically.

**To undo a patch:**
Tap **Revert back to Default Config**, confirm the prompt, and you're back to stock settings. The game recreates its default files automatically on next launch.

<img src="assets/img_reverttoVanilla.jpg" width="280"> <img src="assets/img_configDeleted.jpg" width="280">

<details>
<summary>Selecting an Online Repository (Custom URL)</summary>

<br>

Switch the repository source to **Custom Online Repository** and paste in a direct **.zip download link**.

> 💡 To get the link: find the config's download button on its host page, then **right-click (or long-press) → Copy Link Address**. Paste that URL into the app and tap **Sync Files & Refresh**.

</details>

<details>
<summary>Selecting a Local Repository</summary>

<br>

Switch the repository source to **Local Repository** and select a folder containing your `.ini` files.

> ⚠️ Android's scoped storage rules mean you must pick a **specific sub-folder** (e.g. a Downloads folder or a dedicated configs folder) — selecting the root of Internal Storage will be rejected by the system picker.

</details>

</details>

</details>

---

## 📋 Help & Troubleshooting

| Feature | Description |
|---|---|
| **Sync Files** | Downloads the latest config release, or pulls files from a custom URL / local repository. |
| **1-Click Patch** | Applies the patch directly to your config folder. Selecting Advanced will apply ALL `.ini` files found. |
| **Config Selector** | Opens a web browser to a tool for checking recommended config preset. |
| **Log Decryptor** | Decrypts your uploaded Client.log + some QoL features. |
| **Revert to Vanilla** | Deletes modified files. The game will automatically recreate default files on your next launch. |
| **(Advanced) Revert to Vanilla** | Deletes `DeviceProfiles.ini`, `Engine.ini`, `Scalability.ini`, and `GameUserSettings.ini`. |

---

## 🛡 Disclaimer

This tool is for optimization purposes only. By using this app, you acknowledge that modifying game files is done at your own discretion. Always ensure you have a backup if you are unsure about the changes you are applying, especially if you have your own **customized** config — otherwise it will be lost. The application does not tamper with your data except to patch the config file, and all included tools run locally on your device. No data is transmitted to an external, online server.

---

## 💻 Technical Stack

- **Language:** Kotlin
- **UI Framework:** Jetpack Compose (Material 3)
- **Permissions:** Shizuku API
- **Architecture:** Repository-pattern driven, Coroutine-based concurrency
