// =====================================================
// SatCEFIR – Simplified Demo
// Sentinel-2 Vegetation Monitoring
// Google Earth Engine
// =====================================================
//
// Educational public version.
// This demo shows only basic NDVI visualization.
// =====================================================


// 1. Study area
var roi = geometry; // Draw or import your area in GEE

Map.centerObject(roi, 12);


// 2. Sentinel-2 cloud mask
function maskS2(image) {
  var scl = image.select('SCL');

  var mask = scl.neq(3)
    .and(scl.neq(8))
    .and(scl.neq(9))
    .and(scl.neq(10))
    .and(scl.neq(11));

  return image.updateMask(mask)
    .divide(10000)
    .copyProperties(image, image.propertyNames());
}


// 3. Load Sentinel-2 image
var image = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterBounds(roi)
  .filterDate('2024-01-01', '2024-12-31')
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 30))
  .map(maskS2)
  .median()
  .clip(roi);


// 4. NDVI
var ndvi = image.normalizedDifference(['B8', 'B4'])
  .rename('NDVI');


// 5. Visualization
Map.addLayer(image, {
  bands: ['B4', 'B3', 'B2'],
  min: 0,
  max: 0.3
}, 'Sentinel-2 RGB');

Map.addLayer(ndvi, {
  min: 0,
  max: 0.8,
  palette: ['brown', 'yellow', 'green']
}, 'NDVI');


// 6. Basic statistics
var stats = ndvi.reduceRegion({
  reducer: ee.Reducer.mean(),
  geometry: roi,
  scale: 10,
  maxPixels: 1e13
});

print('Mean NDVI:', stats);
