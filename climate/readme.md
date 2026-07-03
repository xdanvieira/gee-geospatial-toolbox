# Climate

Climate analysis workflows developed with Google Earth Engine.

This module provides reusable workflows for drought monitoring, climate indicators, precipitation analysis and forecast integration using open climate datasets.

---

## Available Workflows

| Workflow | Description | Status |
|----------|-------------|:------:|
| `spi/spi_hybrid_temporal.js` | Hybrid Standardized Precipitation Index (SPI) combining CHIRPS observations and CFSv2 forecasts. | ✅ |
| `spi/spi_monthly.js` | Monthly SPI calculation. | 🚧 |
| `spi/spi_forecast.js` | Forecast-based SPI using climate prediction models. | 🚧 |
| `spei/spei.js` | Standardized Precipitation Evapotranspiration Index. | 🚧 |
| `era5/era5_land.js` | ERA5-Land climate variables. | 🚧 |
| `chirps/chirps_monthly.js` | Monthly precipitation processing using CHIRPS. | 🚧 |

---

## Directory Structure

```text
climate/

├── README.md
│
├── spi/
│   ├── README.md
│   └── spi_hybrid_temporal.js
│
├── spei/
│   └── README.md
│
├── era5/
│   └── README.md
│
└── chirps/
    └── README.md
```

---

## Current Capabilities

### Hybrid SPI

The Hybrid SPI workflow combines historical observations from **CHIRPS** with short-term forecasts from **NOAA CFSv2**, providing an operational drought monitoring approach.

Current features include:

- Historical climatology (1991–2020)
- Forecast bias adjustment
- SPI-1
- SPI-3
- SPI-6
- SPI-9
- Municipality statistics
- Interactive dashboard
- CSV export
- Dynamic visualization

---

## Supported Datasets

| Dataset | Provider | Purpose |
|----------|----------|---------|
| CHIRPS Daily | UCSB Climate Hazards Center | Historical precipitation |
| NOAA CFSv2 | NOAA | Seasonal precipitation forecast |
| FAO GAUL | FAO | Administrative boundaries |
| ERA5-Land *(future)* | ECMWF | Climate variables |

---

## Outputs

The workflows can generate:

- SPI maps
- Municipality statistics
- Time series
- Drought indicators
- Interactive dashboards
- CSV tables
- GeoTIFF rasters

---

## Applications

- Drought monitoring
- Climate risk assessment
- Water resources management
- Agricultural monitoring
- Environmental monitoring
- Watershed planning
- Climate services

---

## Example Workflow

```text
CHIRPS Historical Data
          │
          ▼
Historical Climatology
          │
          ▼
Monthly Accumulation
          │
          ├──────────────┐
          ▼              ▼
      CFSv2 Forecast   Historical Statistics
          │              │
          └──────┬───────┘
                 ▼
           Hybrid SPI
                 │
                 ▼
     Maps • Dashboard • CSV
```

---

## Roadmap

- [x] Hybrid SPI (CHIRPS + CFSv2)
- [ ] Standard SPI
- [ ] SPEI
- [ ] ERA5-Land integration
- [ ] Seasonal drought monitoring
- [ ] Climate anomaly maps
- [ ] Climate dashboard
- [ ] Streamlit application

---

## Documentation

Additional documentation for each workflow is available inside its respective directory.

---

## License

MIT License.
