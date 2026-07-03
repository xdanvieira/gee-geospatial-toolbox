# Satellite

Satellite image processing workflows developed with Google Earth Engine.

This module provides reusable workflows for preprocessing, visualization and analysis of optical satellite imagery from multiple sensors.

---

## Available Sensors

### Sentinel-2

High-resolution multispectral imagery provided by the European Space Agency (ESA).

Current workflows:

| Script | Description |
|---------|-------------|
| `export_rgb_composite.js` | Generates cloud-filtered RGB composites and exports GeoTIFF images. |
| `ndvi.js` | Normalized Difference Vegetation Index (coming soon). |
| `ndwi.js` | Normalized Difference Water Index (coming soon). |
| `cloud_mask.js` | Cloud masking workflow (coming soon). |

---

### Landsat

Medium-resolution imagery provided by the United States Geological Survey (USGS).

Current workflows:

| Script | Description |
|---------|-------------|
| `surface_temperature.js` | Land Surface Temperature (coming soon). |
| `albedo.js` | Surface albedo estimation (coming soon). |
| `surface_reflectance.js` | Surface reflectance preprocessing (coming soon). |

---

### MODIS

Moderate Resolution Imaging Spectroradiometer products.

Current workflows:

| Script | Description |
|---------|-------------|
| `landcover.js` | Land cover products (coming soon). |
| `vegetation_products.js` | MODIS vegetation products (coming soon). |

---

## Supported Datasets

- Sentinel-2 MSI
- Landsat Collection 2
- MODIS Collection 6
- SRTM
- HydroSHEDS

---

## Outputs

Typical outputs include:

- RGB composites
- GeoTIFF
- Surface reflectance
- Vegetation indices
- Water indices
- Land surface temperature
- Cloud-free mosaics

---

## Applications

- Remote sensing
- Land cover mapping
- Water resources
- Environmental monitoring
- Watershed analysis
- Change detection

---

## License

MIT License.
