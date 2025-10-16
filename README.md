## ⚙️ [SystemSettings] – Advanced Unreal Engine Variables

# THIS PAGE IS UNDER CONSTRUCTION

This section defines rendering, streaming, and performance tuning commands used in **Unreal Engine 4.27 / Kuro Engine fork (WuWa)**.

Each variable can be dynamically generated through the **slider system**, but you may also use them manually for finer control.

---

### 🌄 **Texture Streaming & Mipmaps**

| Variable | Default | Description |
|-----------|----------|-------------|
| `r.Streaming.Boost` | 1.0 | Controls global streaming boost multiplier. Higher = better distant textures. |
| `r.Streaming.MinBoost` | 1.0 | Minimum streaming boost for LOD safety margin. |
| `r.Streaming.FullyLoadUsedTextures` | 1 | Forces full load of visible textures into memory. |
| `r.MipMapLODBias` | 0 | Shifts mipmap detail. Negative = sharper textures, positive = blurrier. |
| `r.Streaming.MipBias` | 0 | Secondary bias for streaming mip levels. |
| `r.Streaming.UseAllMips` | 1 | Ensures full mipchain loading when available. |
| `r.Streaming.PoolSize` | 6144 | Texture memory pool (in MB). Increase for higher quality. |
| `r.Streaming.UseNewMetrics` | 1 | Enables modern streaming heuristics. |

---

### ☀️ **Lighting & Shadows**

| Variable | Default | Description |
|-----------|----------|-------------|
| `r.LightFunctionQuality` | 1 | Enables light functions (projected textures on lights). |
| `r.ShadowQuality` | 5 | Global shadow resolution and filtering quality. |
| `r.Shadow.MaxResolution` | 2048 | Maximum texture resolution for shadow maps. |
| `r.Shadow.RadiusThreshold` | 0.03 | Controls when shadows fade for small objects. |
| `r.DistanceFieldShadowing` | 1 | Enables distance field-based dynamic shadows. |
| `r.Shadow.CSM.MaxCascades` | 4 | Sets max cascades for directional light shadows. |
| `r.Shadow.DistanceScale` | 1.0 | Multiplies shadow rendering distance. |
| `r.AmbientOcclusionLevels` | 2 | Number of AO levels for ambient shading. |
| `r.AmbientOcclusionRadiusScale` | 1.0 | Controls radius of ambient occlusion effect. |

---

### 🌿 **Foliage, Grass, and Environment**

| Variable | Default | Description |
|-----------|----------|-------------|
| `foliage.DensityScale` | 1.0 | Adjusts density of foliage meshes. |
| `grass.DensityScale` | 1.0 | Adjusts density of grass meshes. |
| `foliage.EnablePhysics` | 1 | Enables simple wind/physics simulation. |
| `r.HLOD.DistanceScale` | 1.0 | Controls when hierarchical LODs appear. |
| `r.StaticMeshLODDistanceScale` | 1.0 | Multiplies LOD transition distance for static meshes. |
| `r.LandscapeLODDistributionScale` | 1.0 | Controls terrain LOD scaling (performance vs quality). |

---

### 🌫️ **Post-Processing and Tonemapping**

| Variable | Default | Description |
|-----------|----------|-------------|
| `r.TonemapperGamma` | 2.2 | Adjusts global brightness curve. |
| `r.Tonemapper.Sharpen` | 1.0 | Post-process image sharpening. |
| `r.Tonemapper.GrainQuantization` | 0 | Disables film grain. |
| `r.Tonemapper.Quality` | 5 | Enables full HDR tone mapping. |
| `r.TonemapperFilm` | 1 | Enables filmic tone mapping curve. |
| `r.SceneColorFringeQuality` | 0 | Chromatic aberration (fringe) quality. |
| `r.BloomQuality` | 5 | Bloom glow intensity. |
| `r.LensFlareQuality` | 3 | Lens flare simulation quality. |
| `r.EyeAdaptationQuality` | 2 | Controls auto-exposure adaptation speed. |
| `r.Color.Mid` | 0.5 | Midtone intensity for tone curve adjustment. |

---

### 🌊 **Reflections & Transparency**

| Variable | Default | Description |
|-----------|----------|-------------|
| `r.ReflectionEnvironment` | 1 | Enables reflection captures. |
| `r.ReflectionEnvironmentLightmapMixing` | 1 | Mixes reflections with lightmaps. |
| `r.SSR.Quality` | 3 | Screen Space Reflection quality. |
| `r.SSR.Temporal` | 1 | Temporal accumulation for SSR stability. |
| `r.SSR.MaxRoughness` | 0.8 | Controls maximum surface roughness that reflects. |
| `r.TranslucencyLightingVolumeDim` | 64 | Grid resolution for translucent lighting. |
| `r.SeparateTranslucency` | 1 | Renders translucent objects in separate pass for clarity. |

---

### ⚡ **Rendering Pipeline & Performance**

| Variable | Default | Description |
|-----------|----------|-------------|
| `r.RenderTargetPoolMin` | 400 | Minimum pool size for render targets (MB). |
| `r.GPUCrashDebugging` | 0 | Disables GPU crash debugging for release builds. |
| `r.UseAsyncShaderPrecompilation` | 1 | Enables asynchronous shader compile. |
| `r.RHICmdBypass` | 0 | Uses full RHI threading path. |
| `r.OneFrameThreadLag` | 1 | Enables one-frame input lag for smoother performance. |
| `r.AsyncCompute` | 1 | Allows async compute queue usage (Vulkan/DirectX 12). |
| `r.FinishCurrentFrame` | 0 | Prevents frame stalls when off. |

---

### 🧩 **Anti-Aliasing & Upscaling**

| Variable | Default | Description |
|-----------|----------|-------------|
| `r.AntiAliasingMethod` | 2 | 0=None, 1=FXAA, 2=TAA (default). |
| `r.TemporalAA.Quality` | 4 | Temporal AA quality setting. |
| `r.TemporalAA.Upsampling` | 1 | Enables TAA upsampling. |
| `r.TemporalAA.Algorithm` | 1 | Chooses algorithm variant (1 = default UE4). |
| `r.FidelityFX.FSR2.Enabled` | 1 | Enables AMD FSR2 upscaling. |
| `r.FidelityFX.FSR2.QualityMode` | 2 | 0=Performance, 1=Balanced, 2=Quality, 3=Ultra Quality. |
| `r.FidelityFX.FSR2.Sharpness` | 1.0 | Post-sharpening amount. |
| `r.FidelityFX.FSR3.FrameGeneration` | 0 | Enables FSR3 frame interpolation. |

---

### 🔬 **Miscellaneous Enhancements**

| Variable | Default | Description |
|-----------|----------|-------------|
| `r.VolumetricFog` | 1 | Enables volumetric fog rendering. |
| `r.VolumetricCloud` | 1 | Enables volumetric clouds. |
| `r.Water.EnableUnderwaterPostProcess` | 1 | Underwater visual effects. |
| `r.Bloom.HalfRes` | 1 | Half-resolution bloom optimization. |
| `r.MotionBlurQuality` | 0 | Disables motion blur. |
| `r.DepthOfFieldQuality` | 3 | DOF strength; 0 = off. |
| `r.LensDistortionQuality` | 1 | Simulates camera lens warping. |

---

### ⚙️ **Recommended Preset Ranges**

| Preset | Slider Value | Description |
|---------|---------------|-------------|
| **Low** | 0–3 | Strips most post-processing and uses low LODs. |
| **Medium** | 4–7 | Balanced performance and detail. |
| **High** | 8–9 | Sharp visuals, full shadows, medium FSR. |
| **Ultra** | 10–11 | Max quality, full fidelity, FSR3 optional. |

---

## 🧾 Notes

- Some parameters only work in **UE 4.26+ Vulkan or DX12**.
- Always restart the game after changing `.ini` values.
- Increasing texture pool or group boost may raise VRAM usage significantly.
- For mobile, avoid `r.FidelityFX.FSR3.FrameGeneration=1`.

---

### 🧠 Example Optimized Output (Ultra Preset)

```ini
[SystemSettings]
r.Streaming.Boost=5.5
r.Streaming.MinBoost=5.5
r.MipMapLODBias=-6
r.ShadowQuality=11
r.BloomQuality=5
r.Tonemapper.Sharpen=1.2
r.FidelityFX.FSR2.Enabled=1
r.FidelityFX.FSR2.QualityMode=3
r.FidelityFX.FSR2.Sharpness=1.2
r.VolumetricFog=1
r.AmbientOcclusionLevels=2
r.MotionBlurQuality=0
r.RenderTargetPoolMin=400

