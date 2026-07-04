// ======================================================
// Vegetation Index Mapping - Basic Demo
// Google Earth Engine + Landsat 8
// ======================================================

// Study area
var region = ee.FeatureCollection('FAO/GAUL/2015/level2')
  .filter(ee.Filter.eq('ADM0_NAME', 'Brazil'))
  .filter(ee.Filter.eq('ADM1_NAME', 'Bahia'))
  .filter(ee.Filter.eq('ADM2_NAME', 'Paramirim'));

Map.centerObject(region, 10);

// Cloud mask
function maskClouds(image) {
  var qa = image.select('QA_PIXEL');

  var cloud = 1 << 3;
  var shadow = 1 << 4;

  var mask = qa.bitwiseAnd(cloud).eq(0)
    .and(qa.bitwiseAnd(shadow).eq(0));

  return image.updateMask(mask);
}

// Landsat 8 composite
var image = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
  .filterBounds(region)
  .filterDate('2025-01-01', '2025-12-31')
  .filter(ee.Filter.lt('CLOUD_COVER', 20))
  .map(maskClouds)
  .median()
  .multiply(0.0001)
  .clip(region);

// NDVI
var ndvi = image.normalizedDifference(['SR_B5', 'SR_B4']);

// Classification
var classes = ndvi.expression(
    "(b < 0.10) ? 1" +
    ": (b < 0.20) ? 2" +
    ": (b < 0.30) ? 3" +
    ": (b < 0.40) ? 4" +
    ": 5", {
      b: ndvi
    });

// RGB
Map.addLayer(image, {
  bands: ['SR_B4', 'SR_B3', 'SR_B2'],
  min: 0.02,
  max: 0.30
}, 'RGB');

Map.addLayer(classes, {
  min: 1,
  max: 5,
  palette: [
    '#d73027',
    '#fc8d59',
    '#fee08b',
    '#d9ef8b',
    '#1a9850'
  ]
}, 'NDVI Classes');

print('NDVI Image', ndvi);
