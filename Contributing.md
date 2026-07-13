# Contributing Guide

Thank you for your interest in contributing!
---

## ⚙️ What You Can Contribute

You can help by sharing your tested configuration tweaks and reports.

| Type | Description |
|------|--------------|
| **DeviceProfiles.ini Tweaks** | Optimizations for specific mobile device models. |
| **Engine.ini Tweaks** | Engine-level configurations for performance, graphics, or stability. |
| **Test Reports** | Performance results and metrics from your tested configuration. |
| **References/Notes** | Any sources or configs you based your tweaks on. |

---

## 🧩 Folder Structure

Please follow this folder organization for your contributions:

/Community Configs
├── Config_YourName  
          ├── DeviceProfiles.ini  
          ├── Engine.ini  
          └── README.md  
---

## 🧪 Testing Guidelines

Each configuration **must include a brief test report** so others can verify and compare results.

Include the following information in your `README.md` (same folder as your `.ini` file):

| Field | Example |
|--------|----------|
| **Device Model** | POCO X6 Pro 5G |
| **Chipset** | MediaTek Dimensity 8300 |
| **RAM** | 12 GB |
| **OS Version** | Android 14 / HyperOS 2.0 |
| **Game Version** | 2.0.205 |
| **Config Type** | Engine.ini – Max Performance |
| **Average FPS** | 58–60 FPS |
| **Lowest FPS** | 45 FPS |
| **Temperature Range** | 35°C – 45°C |
| **Testing Duration** | 20 minutes (combat + open world) |
| **Notable Issues** | Slight frame dips when teleporting |
| **References** | Based on config from @username + modified cvars manually |
| **Date Tested** | YYYY-MM-DD |

---

## 📄 How to Submit a Contribution

1. **Fork this repository**  
   → https://github.com/Arglax/Mobile-WuWa-Config/fork  
2. **Create a new branch** named like:  
   - `device-poco-x6pro`  
   - `engine-balanced`  
3. Add your `.ini` files and `README.md` in the proper folder  
4. **Commit your changes** with a descriptive message:  
Added Engine.ini (Balanced) for POCO X6 Pro – 58 avg FPS  

5. **Submit a Pull Request (PR)** with:
- A clear title and summary  
- Screenshot or FPS graph (optional but preferred)  
- Notes about what was changed and why  
---

## 🧤 Example Contribution

**Description:**  
Max performance config for mid-range phones, disables heavy post-processing and uses dynamic resolution.

**Tested On:**  
POCO X6 Pro 5G – Avg 59 FPS, Temp 43°C

---

## 📢 Credits & References

If your config was inspired by another user or community, please credit them in your `README.md`:

> Based on @someone’s config with additional GPU optimization.

---

## ✅ Checklist Before Submitting

- [ ] `.ini` files validated and tested in-game (no crashes) 
- [ ] FPS, temp, and notes included  
- [ ] References/credits listed  
- [ ] Folders and filenames properly named  
- [ ] No duplicate or conflicting configs/cvars  

---
