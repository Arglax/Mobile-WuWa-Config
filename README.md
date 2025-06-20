# 🎮 WuWa-Config: Ultimate Mobile Configuration for Wuthering Waves

Welcome to **WuWa-Config**, a custom-built set of configuration files designed to **boost graphics, stability, and performance** in *Wuthering Waves* on Android devices.

Crafted with love by **Arglax**, this guide will walk you through how to apply these tweaks to unlock your device's full visual and gameplay potential.

---

## 📁 What’s Inside

- `Engine.ini` – Core rendering and graphics tweaks  
- `DeviceProfiles.ini` – Device-specific enhancements
---

## 🛠️ How to Install (Beginner Friendly)

### ✅ Requirements:
- A **Windows PC or laptop**
- A **USB cable** to connect your mobile device
- Your **Android phone or tablet**

### 🔧 Step-by-Step Instructions:

1. **Connect** your mobile device to your PC via USB.
2. On your device, select **"File Transfer" or "Android Auto"** mode (not "Charge only").
3. Open **File Explorer** on your PC.
4. Navigate to the following folder in your Android device:
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

5. Inside the `Android/` folder, **paste** the provided:
- `Engine.ini`
- `DeviceProfiles.ini`

> 🔁 You may **overwrite existing files** if prompted.

6. *(Optional)* Also paste the `VulkanProgramBinaryCache` folder one level above if included.

7. **Launch Wuthering Waves** and enjoy your new visuals!

---

## ❓ Frequently Asked Questions

### ❓ Can I install this without a PC?
**Yes**, but it’s outside the scope of this guide. You may explore alternatives like:
- [AlteriaX’s Repo](https://github.com/AlteriaX/WuWa-Configs/blob/main/README.md)

---

### 💥 My game crashes after applying the config!
Some devices may not support ultra settings.

**Fix:**
- Delete `Engine.ini` and `DeviceProfiles.ini` from the same folder
- Restart WuWa – it will regenerate safe defaults

---

### 🐢 Game is laggy or has low FPS
Try adjusting the config:

- Open `Engine.ini`
- Search for any value labeled:
- `DensityScale`
- `ResolutionScale`
- Change values:
- `DensityScale` → `1`
- `ResolutionScale` → lower it (e.g., `0.85` or `0.75`)

---

## 📬 Need Help?

Chat me on **Discord** for support, updates, and discussion:
👉 [https://discord.gg/4DYe8srs](https://discord.gg/4DYe8srs)

---

## 📝 Credits

Maintained by **Arglax**  
Optimized for **flagship Android devices with Vulkan support**

---
