// ============================================================
// Hydrological Pressure Index - Basic Demo
// Google Earth Engine + Sentinel-2
// ============================================================

// Study area
var region = ee.FeatureCollection(
  'projects/ee-xdanvieira2/assets/bacia-paramirim2'
);

Map.centerObject(region, 9);
Map.addLayer(region, {color: 'black'}, 'Study Area');


// Sentinel-2 dry season image
var image = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterBounds(region)
  .filterDate('2024-04-01', '2024-10-31')
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 30))
  .median()
  .divide(10000)
  .clip(region);


// NDVI and NDMI
var ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI');
var ndmi = image.normalizedDifference(['B8', 'B11']).rename('NDMI');


// Simple pressure index
var pressureIndex = ndvi.unitScale(0.2, 0.8).clamp(0, 1).multiply(60)
  .add(ndmi.unitScale(-0.1, 0.4).clamp(0, 1).multiply(40))
  .rename('Pressure_Index');


// Visualization
Map.addLayer(ndvi, {
  min: 0,
  max: 0.8,
  palette: ['brown', 'yellow', 'green']
}, 'NDVI');

Map.addLayer(ndmi, {
  min: -0.3,
  max: 0.4,
  palette: ['brown', 'white', 'blue']
}, 'NDMI');

Map.addLayer(pressureIndex, {
  min: 0,
  max: 100,
  palette: ['green', 'yellow', 'red']
}, 'Hydrological Pressure Index');


// Basic result
print('Hydrological Pressure Index:', pressureIndex);
