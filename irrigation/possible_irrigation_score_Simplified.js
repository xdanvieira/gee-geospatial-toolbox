// ============================================================
// Possible Irrigation Signal - Simplified Demo
// Google Earth Engine + Sentinel-2
// ============================================================

// Study area
var region = ee.FeatureCollection(
  'projects/ee-xdanvieira2/assets/bacia-paramirim2'
);

Map.centerObject(region, 9);

// Cloud mask using SCL
function maskS2(image) {
  var scl = image.select('SCL');

  var mask = scl.neq(3)
    .and(scl.neq(8))
    .and(scl.neq(9))
    .and(scl.neq(10))
    .and(scl.neq(11));

  return image.updateMask(mask).divide(10000);
}

// Dry season image
var dry = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterBounds(region)
  .filterDate('2024-04-01', '2024-10-31')
  .map(maskS2)
  .median()
  .clip(region);

// Vegetation and moisture indices
var ndvi = dry.normalizedDifference(['B8', 'B4']).rename('NDVI');
var ndmi = dry.normalizedDifference(['B8', 'B11']).rename('NDMI');

// Simple irrigation signal
var irrigationSignal = ndvi.gt(0.45)
  .and(ndmi.gt(0.10))
  .rename('Possible_Irrigation');

// Visualization
Map.addLayer(ndvi, {
  min: 0,
  max: 0.8,
  palette: ['brown', 'yellow', 'green']
}, 'NDVI - Dry Season');

Map.addLayer(ndmi, {
  min: -0.3,
  max: 0.4,
  palette: ['brown', 'white', 'blue']
}, 'NDMI - Dry Season');

Map.addLayer(irrigationSignal.selfMask(), {
  palette: ['red']
}, 'Possible Irrigation Signal');

// Area estimate
var areaHa = irrigationSignal.selfMask()
  .multiply(ee.Image.pixelArea())
  .divide(10000)
  .reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: region,
    scale: 30,
    maxPixels: 1e13
  });

print('Estimated area with possible irrigation signal (ha):', areaHa);
