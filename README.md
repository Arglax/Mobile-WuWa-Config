# 🌐 WuWa Portal — v2.2.1

A browser-based utility hub for **Wuthering Waves** on Android — no installs, no Python, just open and use.

**[→ Open WuWa Portal](https://arglax.github.io/Mobile-WuWa-Config/index.html)**

>[!NOTE]
>This is an open source project, as well as my configs. You may freely share or submit pull requests for contributions. Credits to me is optional but would be appreciated.

---

## 📋 Changelog

### v2.2.1
- **Engine.ini Generator** — Launched WIP site. Open for ideas, just tag me on discord.  
- Updated csv files for mobile selector configs and deviceprofiles.ini builder  

### v2.2.0
- **Log Decryptor** — Added CVar Quick-View: one-tap buttons to surface the last logged values of Resolution, Forbidden, and Common CVars directly from the decrypted log.
- **Log Decryptor** — Vulkan renderer detection now reports the active RHI confirmation line and Vulkan API version.
- **Log Decryptor** — Improved retail device name resolution: branded names (e.g. *Poco X6 Pro 5G*) are now sourced directly from log fields (`DeviceName`, `ro.product.model`, etc.) before falling back to SKU lookup or profile inference. Expanded model map to ~25 devices.
- **Log Decryptor** — Added tooltip system for CVar buttons: hover on desktop, tap on mobile — no UI breakage.

---

## 🛠️ Performance & Engine Tools

| Utility Tool | Stability Status | Capabilities & Features |
| :--- | :---: | :--- |
| **[Client.log Decryptor](https://arglax.github.io/Mobile-WuWa-Config/tools/log-decryptor.html)** | `🟩 LIVE` | • Instantly decrypts Kuro's obfuscated logs locally in-browser.<br>• Extracts retail phone models (e.g., *Poco X6 Pro 5G*) + Kuro's assigned hardware profile name.<br>• Automated diagnostic scans for critical runtime errors and framework crashes.<br>• Quick-view CVar scanner — surfaces last logged values for Resolution, Forbidden, and Common CVars, including Vulkan renderer and API version detection. |
| **[DeviceProfiles.ini Generator](https://arglax.github.io/Mobile-WuWa-Config/tools/devprof-generator.html)** | `🟨 WIP / LIVE` | • Generates specialized, fully functional configuration tweaks tailored directly to your mobile chipset target. |
| **Engine.ini Generator** | `🟦 UPCOMING` | • Custom rendering configurations focused on scaling engine resolution parameters and fixing native frame stutters. |
| **Crash Log Analyzer** | `🟦 UPCOMING` | • Deep stacktrace analyzer targeting specific GPU overflows and memory runtime violations. |

---

## 👥 DeviceProfiles Contributors

- nagasemana5608
- jeannerou
- Cynide
- lawdb727
- chovll_
- Sworit
- Bamboo-hatted Kim
- Stockholm
- Asphyxth3
- Phantom
- Yuniketsu
- Aelius_Nyx
- Chael0ng
- Seany
- Jansil
- _sushime.
- meshi_1202
- dava
- Yasue
- z3tr
- mugichwan
- siesta_1295
- arty_6029
- Lord_Fuqwad
- KRG6187
- yuri_o2r_22566
- yuureii
---

> Auxiliary part of the [Mobile-WuWa-Config](https://github.com/Arglax/Mobile-WuWa-Config) project.
