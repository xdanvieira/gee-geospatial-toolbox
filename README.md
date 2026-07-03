# GEE Geospatial Toolkit

Reusable Google Earth Engine workflows for hydrology, remote sensing, climate analysis and geospatial applications.

<p align="center">
  <img src="https://raw.githubusercontent.com/xdanvieira/gee-geospatial-toolkit/main/assets/banner.png" width="100%">
</p>

---

## Overview

GEE Geospatial Toolkit is a collection of reusable Google Earth Engine scripts designed for environmental monitoring, hydrological analysis, remote sensing and geospatial data processing.

The toolkit provides modular workflows that can be used independently or combined into larger environmental monitoring projects.

---

## Modules

```text
gee-geospatial-toolkit

├── hydrology/
├── satellite/
├── vegetation/
├── climate/
├── utilities/
├── examples/
└── docs/
```

---

## Hydrology

```text
hydrology/

├── precipitation_chirps.js
├── hydrological_deficit.js
├── climatic_deficit.js
├── runoff_gldas.js
├── evapotranspiration_modis.js
├── evapotranspiration_sebal.js
├── cwsi_modis.js
├── spi.js
├── spei.js
└── water_balance.js
```

Available workflows

- CHIRPS precipitation
- Hydrological deficit
- Climatic deficit
- Runoff (GLDAS)
- MODIS evapotranspiration
- SEBAL evapotranspiration
- Crop Water Stress Index
- Water balance

---

## Satellite

```text
satellite/

├── sentinel2/
│
├── landsat/
│
└── modis/
```

Sentinel-2

- RGB composites
- Cloud masking
- NDVI
- NDWI

Landsat

- Surface temperature
- Albedo
- Reflectance

MODIS

- Land Cover
- Vegetation Products

---

## Vegetation

```text
vegetation/

├── ndvi.js
├── evi.js
├── savi.js
├── lai.js
└── gpp.js
```

---

## Climate

```text
climate/

├── era5_land.js
├── terra_climate.js
├── worldclim.js
└── chirps.js
```

---

## Utilities

Utilities shared across workflows.

```text
utilities/

├── export_drive.js
├── charts.js
├── palettes.js
├── legends.js
└── statistics.js
```

---

## Examples

Example applications demonstrating how toolkit modules can be combined.

```text
examples/

├── watershed_monitoring/
├── drought_monitoring/
└── landcover_analysis/
```

---

## Datasets

| Dataset | Provider |
|----------|----------|
| CHIRPS | UCSB |
| GLDAS | NASA |
| MOD16A2GF | MODIS |
| MCD12Q1 | MODIS |
| Sentinel-2 | ESA |
| Landsat Collection 2 | USGS |
| HydroSHEDS | WWF |
| SRTM | NASA |

---

## Workflow

```text
Satellite Data
      │
      ▼
Preprocessing
      │
      ▼
Environmental Indicators
      │
      ▼
Maps
Time Series
Statistics
GeoTIFF
CSV
```

---

## Requirements

- Google Earth Engine
- JavaScript

---

## Repository Structure

```text
gee-geospatial-toolkit

README.md
LICENSE

hydrology/
satellite/
vegetation/
climate/
utilities/
examples/
docs/
```

---

## Applications

- Hydrology
- Watershed Monitoring
- Drought Assessment
- Environmental Monitoring
- Remote Sensing
- Climate Analysis
- Water Resources
- Geospatial Intelligence

---

## Roadmap

- [x] CHIRPS
- [x] MODIS
- [x] GLDAS
- [x] SEBAL
- [ ] ERA5-Land
- [ ] Sentinel-1
- [ ] SMAP
- [ ] Random Forest
- [ ] XGBoost
- [ ] Streamlit Apps

---

## Documentation

Additional documentation is available in the `docs/` directory.

---

## Citation

If this repository contributes to your research, please cite it.

```bibtex
@software{xdv2026,
  author = {Danilo Vieira},
  title = {GEE Geospatial Toolkit},
  year = {2026}
}
```

---

## License

MIT License.

---

## Author

Danilo Vieira

Environmental Engineer

Geospatial Intelligence

Data Science

Google Earth Engine
