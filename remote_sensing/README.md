# Remote Sensing

Reusable Google Earth Engine workflows for satellite image preprocessing, visualization and environmental analysis.

This module provides reusable workflows for processing optical satellite imagery, generating spectral indices and exporting analysis-ready products for environmental applications.

---

## Overview

The **Remote Sensing** module contains generic workflows that simplify the use of satellite imagery within Google Earth Engine.

The workflows are designed to be sensor-independent whenever possible and can be adapted to different study areas with minimal modifications.

Current support focuses on **Sentinel-2**, with future expansion to **Landsat**, **MODIS** and radar datasets.

---

# Directory Structure

```text
remote_sensing/

├── README.md
│
├── sentinel2/
│   ├── export_rgb_composite.js
│   ├── cloud_mask.js
│   ├── ndvi.js
│   ├── ndwi.js
│   ├── evi.js
│   └── mosaics.js
│
├── landsat/
│   ├── surface_reflectance.js
│   ├── land_surface_temperature.js
│   ├── albedo.js
│   └── tasseled_cap.js
│
├── modis/
│   ├── mod16_et.js
│   ├── mcd12_landcover.js
│   └── vegetation_products.js
│
└── shared/
    ├── visualization.js
    ├── export.js
    └── cloud_masks.js
```

---

# Available Workflows

## Sentinel-2

| Workflow | Description | Status |
|----------|-------------|:------:|
| RGB Composite | Cloud-free RGB composites | ✅ |
| Cloud Mask | SCL cloud masking | 🚧 |
| NDVI | Vegetation Index | 🚧 |
| NDWI | Water Index | 🚧 |
| EVI | Enhanced Vegetation Index | 🚧 |
| Mosaic Builder | Multi-scene mosaics | 🚧 |

---

## Landsat

| Workflow | Description | Status |
|----------|-------------|:------:|
| Surface Reflectance | Collection 2 preprocessing | 🚧 |
| Land Surface Temperature | Thermal analysis | 🚧 |
| Albedo | Surface albedo estimation | 🚧 |
| Tasseled Cap | Brightness, Greenness and Wetness | 🚧 |

---

## MODIS

| Workflow | Description | Status |
|----------|-------------|:------:|
| MOD16 ET | Evapotranspiration | 🚧 |
| Land Cover | MCD12Q1 products | 🚧 |
| Vegetation Products | MODIS vegetation datasets | 🚧 |

---

# Supported Datasets

| Dataset | Provider | Resolution |
|----------|----------|-----------:|
| Sentinel-2 MSI | ESA | 10–60 m |
| Landsat Collection 2 | USGS | 30 m |
| MODIS MOD16A2GF | NASA | 500 m |
| MODIS MCD12Q1 | NASA | 500 m |
| SRTM | NASA | 30 m |

---

# Processing Workflow

```text
Satellite Images
        │
        ▼
Image Filtering
        │
        ▼
Cloud Mask
        │
        ▼
Radiometric Processing
        │
        ▼
Spectral Indices
        │
        ▼
Visualization
        │
        ▼
GeoTIFF • CSV • Maps
```

---

# Outputs

Depending on the selected workflow, the module can generate:

- RGB composites
- GeoTIFF
- Cloud-free mosaics
- NDVI
- NDWI
- EVI
- Surface Reflectance
- Land Surface Temperature
- Albedo
- Vegetation products

---

# Applications

The workflows can be applied to:

- Environmental monitoring
- Watershed management
- Land cover mapping
- Water resources
- Agricultural monitoring
- Vegetation monitoring
- Deforestation analysis
- Urban expansion
- Change detection

---

# Example Results

## Sentinel-2 RGB Composite

<p align="center">
<img src="../assets/remote_sensing/rgb_composite.png" width="85%">
</p>

Cloud-free Sentinel-2 RGB composite.

---

## NDVI

<p align="center">
<img src="../assets/remote_sensing/ndvi.png" width="85%">
</p>

Normalized Difference Vegetation Index.

---

## NDWI

<p align="center">
<img src="../assets/remote_sensing/ndwi.png" width="85%">
</p>

Normalized Difference Water Index.

---

## Exported GeoTIFF

<p align="center">
<img src="../assets/remote_sensing/export_geotiff.png" width="85%">
</p>

GeoTIFF generated directly from Google Earth Engine.

---

# Future Development

- [ ] Sentinel-1 SAR
- [ ] Planet NICFI
- [ ] Harmonized Landsat Sentinel (HLS)
- [ ] PCA
- [ ] Spectral unmixing
- [ ] Object-Based Image Analysis (OBIA)
- [ ] Time-series analysis
- [ ] Image segmentation
- [ ] Automatic cloud masking
- [ ] AI-based preprocessing

---

# Related Modules

- `hydrology/`
- `climate/`
- `irrigation/`
- `vegetation/`

---

# Documentation

Additional documentation for each workflow will be added as the toolkit evolves.

---

# License

Distributed under the MIT License.
