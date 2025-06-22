# Wuthering Waves UE4.27 Android Performance Analytics

## Device & Test Environment

- **Device:** Poco X6 Pro 5G
- **CPU:** Mediatek Dimensity 8300 Ultra (8-core)
- **GPU:** Mali-G615 MP6
- **RAM:** 12 GB LPDDR5X @ 4266 MHz
- **ROM:** 512 GB UFS 4.0

## Test Details

- **Test Duration:** 469.53 seconds (~7.8 minutes)
- **Test Area:** Septimont
- **Combat Area:** Nimbus Sanctum – Lorelei Boss Fight

## Thermal & Battery Performance

| Metric                | Value         |
|-----------------------|--------------|
| Start Temp            | 31.9°C       |
| End Temp              | 38.6°C       |
| Temp Difference       | 6.7°C        |
| Heating Rate          | 4.75%        |
| Heating per Second    | 0.01427°C/sec|
| Heating per Minute    | 0.856°C/min  |
| Start Battery         | 87%          |
| End Battery           | 83%          |
| Battery Difference    | 4%           |
| Discharge Rate (/min) | 0.51%        |
| Discharge Rate (/hr)  | 30.67%       |

## CPU & RAM Usage

| Metric           | Value    |
|------------------|----------|
| Ave. CPU Usage   | 65.98%   |
| Min. CPU Usage   | 20.89%   |
| Max. CPU Usage   | 98.11%   |
| Ave. RAM Usage   | 63.09%   |
| Min. RAM Usage   | 37.41%   |
| Max. RAM Usage   | 69.96%   |

## Frame Rate (FPS)

| Metric         | Value   | Notes                        |
|----------------|---------|------------------------------|
| Min. FPS       | 60      |                              |
| Max FPS        | 62.38   | In Combat: First 100 seconds |
| Average FPS    | 61.48   | In Exploration: After 120s   |

## Summary

- **Performance:** The configuration delivers stable, high FPS (60+) throughout both exploration and combat scenarios.
- **Thermals:** Device temperature increased by 6.7°C over the test, with a moderate heating rate.
- **Battery:** Battery drain was 4% over ~8 minutes, projecting to ~30%/hr under similar load.
- **Resource Usage:** CPU and RAM usage remained within safe, efficient ranges, with no thermal throttling or memory pressure observed.

---

> **Disclaimer:**  
> This configuration is optimized for visual quality and performance on Android (Poco X6 Pro 5G, UE4.27).  
> Use at your own risk. The author is not responsible for any issues, including crashes, data loss, or hardware damage.

---
