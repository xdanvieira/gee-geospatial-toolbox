// ======================================================
// Landsat NDVI Comparison – Simplified Demo
// Google Earth Engine
// ======================================================
//
// This demo compares vegetation condition using:
// - Landsat 5 historical image
// - Landsat 8 recent image
// - NDVI calculation
//
// Educational public version.
// ======================================================


// 1. Study area
var region = ee.FeatureCollection('FAO/GAUL/2015/level2')
  .filter(ee.Filter.eq('ADM0_NAME', 'Brazil'))
  .filter(ee.Filter.eq('ADM1_NAME', 'Bahia'))
  .filter(ee.Filter.eq('ADM2_NAME', 'Paramirim'));

Map.centerObject(region, 10);


// 2. Cloud mask for Landsat Collection 2
function maskLandsat(image) {
  var qa = image.select('QA_PIXEL');

  var cloud = 1 << 3;
  var shadow = 1 << 4;

  var mask = qa.bitwiseAnd(cloud).eq(0)
    .and(qa.bitwiseAnd(shadow).eq(0));

  return image.updateMask(mask);
}


// 3. Function to calculate NDVI
function getNDVI(collection, startDate, endDate, nirBand, redBand) {
  var image = ee.ImageCollection(collection)
    .filterBounds(region)
    .filterDate(startDate, endDate)
    .filter(ee.Filter.lt('CLOUD_COVER', 30))
    .map(maskLandsat)
    .median()
    .clip(region);

  var ndvi = image.normalizedDifference([nirBand, redBand])
    .rename('NDVI');

  return ndvi;
}


// 4. Landsat 5 NDVI - historical period
var ndviL5 = getNDVI(
  'LANDSAT/LT05/C02/T1_L2',
  '2008-01-01',
  '2008-07-22',
  'SR_B4',
  'SR_B3'
);


// 5. Landsat 8 NDVI - recent period
var ndviL8 = getNDVI(
  'LANDSAT/LC08/C02/T1_L2',
  '2025-01-01',
  '2025-12-31',
  'SR_B5',
  'SR_B4'
);


// 6. Visualization
var ndviVis = {
  min: 0,
  max: 0.8,
  palette: ['brown', 'yellow', 'green']
};

Map.addLayer(region, {color: 'black'}, 'Study Area');
Map.addLayer(ndviL5, ndviVis, 'NDVI Landsat 5 - 2008');
Map.addLayer(ndviL8, ndviVis, 'NDVI Landsat 8 - 2025');


// 7. NDVI difference
var ndviDifference = ndviL8.subtract(ndviL5)
  .rename('NDVI_Difference');

Map.addLayer(ndviDifference, {
  min: -0.4,
  max: 0.4,
  palette: ['red', 'white', 'green']
}, 'NDVI Difference');


// 8. Basic statistics
var stats = ndviDifference.reduceRegion({
  reducer: ee.Reducer.mean(),
  geometry: region.geometry(),
  scale: 30,
  maxPixels: 1e13
});

print('Mean NDVI difference:', stats);
