# GEE Geospatial Toolkit

Reusable Google Earth Engine workflows for hydrology, remote sensing and geospatial analysis.

<p align="center">
  <img src="assets/banner.png" width="100%">
</p>

---

## Overview

GEE Geospatial Toolkit is an open-source collection of reusable Google Earth Engine workflows designed for hydrological analysis, environmental monitoring, remote sensing and geospatial applications.

The toolkit is organized into independent modules that can be used individually or combined to build complete geospatial workflows.

---

## Modules

| Module | Description |
|----------|-------------|
| `hydrology/` | Hydrological analysis, water balance, evapotranspiration and runoff workflows. |
| `satellite/` | Satellite image preprocessing and visualization workflows. |
| `irrigation/` | Irrigation detection and water use monitoring. |
| `docs/` | Documentation and references. |
| `examples/` | Example applications. |
| `utilities/` | Shared helper functions *(coming soon).* |

---

## Repository Structure

```text
gee-geospatial-toolkit/

├── README.md
├── LICENSE
│
├── assets/
│   └── banner.png
│
├── hydrology/
│   ├── README.md
│   ├── precipitation_chirps.js
│   ├── hydrological_deficit.js
│   ├── climatic_deficit.js
│   ├── evapotranspiration_modis.js
│   ├── evapotranspiration_sebal.js
│   └── cwsi_modis.js
│
├── satellite/
│   ├── README.md
│   └── sentinel2/
│       └── export_rgb_composite.js
│
├── irrigation/
│   ├── README.md
│   └── possible_irrigation_score.js
│
├── docs/
│
├── examples/
│
└── utilities/
```

---

## Hydrology

Available workflows:

- CHIRPS precipitation
- Hydrological deficit (P − ET)
- Climatic deficit (ETp − P)
- MODIS evapotranspiration
- SEBAL evapotranspiration
- Crop Water Stress Index (CWSI)

---

## Satellite

Current workflows:

### Sentinel-2

- RGB composite generation
- Cloud masking
- GeoTIFF export

---

## Irrigation

Current workflow:

- Possible Irrigation Score using Sentinel-2
- NDVI
- NDMI
- NDWI
- Seasonal anomaly
- Percentile (P95) ranking

---

## Supported Datasets

| Dataset | Provider |
|----------|----------|
| CHIRPS Daily | UCSB Climate Hazards Center |
| GLDAS NOAH | NASA |
| MOD16A2GF | MODIS |
| Sentinel-2 MSI | ESA |
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
        ├── Hydrology
        ├── Irrigation
        └── Remote Sensing
        │
        ▼
Maps
Time Series
GeoTIFF
CSV
```

---

## Example Applications

The workflows can be used for:

- Watershed monitoring
- Environmental monitoring
- Water resources management
- Irrigation assessment
- Climate analysis
- Geospatial intelligence

---

## Requirements

- Google Earth Engine
- JavaScript

---

## Roadmap

- [x] CHIRPS precipitation
- [x] Hydrological deficit
- [x] Climatic deficit
- [x] MODIS evapotranspiration
- [x] SEBAL evapotranspiration
- [x] Sentinel-2 RGB export
- [x] Possible irrigation score
- [ ] GLDAS runoff workflow
- [ ] SPI
- [ ] SPEI
- [ ] ERA5-Land
- [ ] Vegetation module
- [ ] Machine Learning module
- [ ] Streamlit examples

---

## Documentation

Additional documentation is available in the `docs/` directory.

---

## Contributing

Contributions are welcome.

If you would like to improve the toolkit, feel free to open an issue or submit a pull request.

---

## License

Distributed under the MIT License.

---

## Author

**Danilo Vieira**

Environmental Engineer

Geospatial Intelligence

Data Science

Google Earth Engine
