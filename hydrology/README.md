# Hydrology

Hydrological workflows developed with Google Earth Engine.

This module provides reusable scripts for hydrological analysis, water balance assessment and environmental monitoring using open geospatial datasets.

---

## Available Workflows

| Script | Description |
|---------|-------------|
| `precipitation_chirps.js` | Monthly and annual precipitation using CHIRPS Daily. |
| `hydrological_deficit.js` | Hydrological deficit based on precipitation and evapotranspiration (P − ET). |
| `climatic_deficit.js` | Multi-year climatic deficit (ETp − P). |
| `evapotranspiration_modis.js` | Evapotranspiration (ET), Potential ET (PET) and CWSI using MODIS MOD16A2GF. |
| `evapotranspiration_sebal.js` | Surface Energy Balance Algorithm for Land (SEBAL) using Landsat imagery. |
| `runoff_gldas.js` | Surface runoff estimation using GLDAS. *(coming soon)* |

---

## Datasets

- CHIRPS Daily
- GLDAS NOAH
- MODIS MOD16A2GF
- Landsat Collection 2
- HydroSHEDS
- SRTM

---

## Outputs

The workflows can generate:

- GeoTIFF
- CSV
- Time series
- Hydrological indicators
- Maps
- Charts

---

## Applications

- Watershed monitoring
- Water resources management
- Environmental monitoring
- Drought assessment
- Climate analysis

---

## License

MIT License.
