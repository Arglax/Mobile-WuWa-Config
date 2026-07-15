# ❓ WuWa Config – Frequently Asked Questions

**Author:** Arglax  
**Target Version:** 3.3  
**Last Updated:** June 6, 2026  
**Changelog:**
- June 6, 2026 — Added full forbidden CVars reference table; documented scalability group bypass method; updated all sections for v3.3 accuracy.
- Feb 22, 2026 — Initial refactor started.

---

> ⚠️ **Before tweaking anything**, check the current [forbidden CVars list on Discord](https://discord.gg/renjxYBEZM).
> CVars on the forbidden list are enforced by Kuro's ConfigMonitor. If present in your config, they will be **stripped or ignored at runtime**. Check your `Client.log` to confirm a CVar is actually being applied.

---

Welcome to the FAQ guide for customizing your `Engine.ini` and `DeviceProfiles.ini` in *Wuthering Waves*.

Whether you want **ultra-sharp visuals**, **maximum performance**, or a **balanced blend**, this guide gives you the tools to tune the config to your device and taste.

---

## 🚫 Forbidden CVars Reference

These CVars are blacklisted by ConfigMonitor and **will not apply** if set directly in `Engine.ini` or `DeviceProfiles.ini`.

### ❌ No Bypass Available
These cannot be applied through any current method:

| CVar | Notes |
|------|-------|
| `r.MobileContentScaleFactor` | Use Developer Options for resolution overrides instead |
| `r.SecondaryScreenPercentage.GameViewport` | Same as above |
| `r.Streaming.Boost` | — |
| `r.Streaming.MinBoost` | — |
| `r.Streaming.LimitPoolSizeToVRAM` | — |
| `r.Streaming.CPUReadback` | — |
| `r.Streaming.UseAsyncCPUReadback` | — |
| `r.Streaming.MinMipForSplitRequest` | — |
| `r.Streaming.UseFixedPoolSize` | — |
| `r.Streaming.UseAllMips` | — |
| `r.MipMapLODBias` | — |
| `r.TextureGroup.Landscape.TextureLODBias` | — |
| `r.Kuro.TexturePool.ExtraBudgetMB` | — |
| `r.RayTracing.LimitDevice` | — |
| `Kuro.CppEffectSystem.UseLowMemoryPlayerEffectLruCapacity` | — |
| `r.AsyncComputePSO` | — |
| `r.Streamline.DLSSG.RetainResourcesWhenOff` | — |

---

### ⚠️ Forbidden But Bypassable via Scalability Groups
Some forbidden CVars **can still be applied indirectly** by setting them inside a custom scalability group section in `Engine.ini`. The game loads these through its scalability system, which runs on a separate path from direct CVar injection.

The relevant scalability group keys you can define in `Engine.ini` under `[ScalabilityGroups]`:

```ini
[ScalabilityGroups]
sg.ShadowQuality=4
sg.PostProcessQuality=6
sg.TextureQuality=4
sg.EffectsQuality=2
sg.FoliageQuality=4
sg.ShadingQuality=4
sg.ViewDistanceQuality=4
sg.AntiAliasingQuality=4
```

When these scalability groups are applied, the game internally sets the CVars mapped to each group — including some that are otherwise forbidden. The known bypassable CVars and which group carries them:

| Forbidden CVar | Carried By | Notes |
|---|---|---|
| `r.ViewDistanceScale` | `sg.ViewDistanceQuality` | Set to `10.0` at Cine quality |
| `r.MaterialQualityLevel` | `sg.EffectsQuality` | Set to `2` at quality level 2 |
| `r.KuroMaterialQualityLevel` | `sg.EffectsQuality` | Set to `2` at quality level 2 |
| `r.DetailMode` | `sg.EffectsQuality` | Noted as forbidden in-log; still applied via group |
| `r.Streaming.MaxNumTexturesToStreamPerFrame` | `sg.TextureQuality` | Applied at texture quality level 4 |
| `r.Streaming.PoolSize` | `sg.TextureQuality` | Set to `2000` at texture quality level 4 |
| `r.Shadow.MaxCSMResolution` | `sg.ShadowQuality` | Set to `4096` at Cine shadow quality |

> 📝 This bypass works because the game's scalability system applies CVars internally through a separate mechanism. Kuro's ConfigMonitor primarily targets direct CVar entries — not the values the scalability system resolves to. This may change in future patches.

---

## 🎮 I want better graphics. How can I make the game look sharper?

### ✅ Solution:

> 🔥 **Warning:** High values will impact performance on mid-range devices.

- **Improve texture sharpness** via mip bias:
```ini
  r.Streaming.MipBias=-1
  ; -1 = sharper, 0 = default, 1 = blurrier
```

- **Increase foliage and grass density**:
```ini
  foliage.DensityScale=2.0
  grass.DensityScale=2.0
  ; Default = 1.0, can go up to 4.0+
```

- **Push shadow quality and view distance via scalability groups** (bypasses forbidden CVars):
```ini
  [ScalabilityGroups]
  sg.ShadowQuality=4
  sg.ViewDistanceQuality=4
  sg.TextureQuality=4
```

> 📝 `r.MobileContentScaleFactor` is a **forbidden CVar** with no bypass. Use your device's Developer Options for resolution overrides.

---

## 🚀 I want better performance. How can I make the game run smoother?

### ✅ Solution:

- **Reduce foliage and mesh density**:
```ini
  grass.DensityScale=0.5
  foliage.DensityScale=0.5
  ; Or disable completely:
  foliage.cullAll=1
```

- **Disable expensive post-process effects**:
```ini
  r.AmbientOcclusionLevels=0
  r.BloomQuality=0
  r.SSR.Quality=0
```

- **Force lower LODs** (simpler models at closer range):
```ini
  r.SkeletalMeshLODBias=1
```

- **Lower material and effect quality via scalability groups**:
```ini
  [ScalabilityGroups]
  sg.EffectsQuality=1
  sg.ShadowQuality=1
  sg.ViewDistanceQuality=1
```

> 📝 `r.ViewDistanceScale` and `r.MaterialQualityLevel` are forbidden CVars — use `sg.ViewDistanceQuality` and `sg.EffectsQuality` instead.

---

## 🌆 I don't care about shadows. How do I disable them?

### ✅ Solution:

- **Disable dynamic and static shadows directly**:
```ini
  r.ShadowQuality=0
  r.Shadow.CSM.MaxCascades=0
  r.Shadow.RadiusThreshold=0.1
  r.Shadow.MaxResolution=16
  r.Mobile.Shadow.CSMShaderCullingMethod=0
```

- **Or via scalability group** (also bypasses `r.Shadow.MaxCSMResolution`):
```ini
  [ScalabilityGroups]
  sg.ShadowQuality=0
```

> Disabling shadows will noticeably improve performance on lower-end devices.

---

## 🧊 I want a polygonal, low-poly look. Can I do that?

### ✅ Solution:

- **No AA + high LOD bias**:
```ini
  r.TemporalAA.Upsampling=0
  r.SkeletalMeshLODBias=3
```

- **Lower material quality via scalability group**:
```ini
  [ScalabilityGroups]
  sg.EffectsQuality=0
```

- **Disable post-processing**:
```ini
  r.Tonemapper.GrainQuantization=0
  r.SceneColorFringeQuality=0
  r.BloomQuality=0
  r.LensFlareQuality=0
```

> 📝 `r.MaterialQualityLevel` is forbidden — use `sg.EffectsQuality=0` instead.

---

## 🦾 I want MAX settings. Ultra-high. No limits. What do I tweak?

### ✅ Solution:

> ⚠️ **For flagship phones only.** Expect significant heat and battery drain. Use at your own risk.

- **Max scalability groups first** (this handles the forbidden CVars):
```ini
  [ScalabilityGroups]
  sg.ShadowQuality=4
  sg.PostProcessQuality=6
  sg.TextureQuality=4
  sg.EffectsQuality=2
  sg.FoliageQuality=4
  sg.ShadingQuality=4
  sg.ViewDistanceQuality=4
  sg.AntiAliasingQuality=4
```

- **Then push additional quality CVars on top**:
```ini
  r.Mobile.TonemapperFilm=1
  r.TemporalAA.Upsampling=1
  r.SSR.Quality=4
  r.AmbientOcclusionLevels=4
  r.BloomQuality=5
  r.LensFlareQuality=3
  foliage.DensityScale=4.0
  grass.DensityScale=4.0
```

- **Enable Niagara GPU particles** (if your device supports GPU compute):
```ini
  fx.NiagaraAllowGPUParticles=1
```

> 📝 `r.MobileContentScaleFactor` and `r.SecondaryScreenPercentage.GameViewport` are forbidden with no bypass. Resolution overrides must be done through device settings.

---

## 🚩 My game crashes or won't load after changes. What now?

### ✅ Solution:

1. Navigate to:
```
   Android/data/com.kurogame.wutheringwaves.global/files/UE4Game/Client/Client/Saved/Config/Android/
```

2. Delete `Engine.ini` and `DeviceProfiles.ini`.

3. Also delete the shader cache folders:
   - `.../Files/UE4Game/VulkanProgramBinaryCache/`
   - `.../Files/UE4Game/ProgramBinaryCache/`

4. Restart Wuthering Waves — the game will regenerate safe default configs.

> For a full reset procedure, refer to the **Testing Protocols** — specifically **Protocol A**.

---

## 💡 How do I test changes quickly?

### ✅ Tip:

- Edit `Engine.ini` on your PC, save, then push via USB.
- Force-stop the game on your phone and relaunch.
- Let shaders recompile before judging performance.

Useful tools for monitoring results:
- **ADB logcat** — crash logs and CVar confirmation
- **PerfDog** — cross-device FPS and frame time monitoring
- **Xiaomi Performance Monitor** — on-device overlay for MIUI/HyperOS
- **Adreno Profiler** — GPU-level profiling for Snapdragon devices

---

## 🤝 Need More Help?

Join the Discord community to ask questions, share configs, and get real-time support:  
[![Discord](https://img.shields.io/badge/Join-Discord-7289DA?logo=discord&logoColor=white)](https://discord.gg/renjxYBEZM)

---

*Made by Arglax — tweak wisely, game smoothly.*
