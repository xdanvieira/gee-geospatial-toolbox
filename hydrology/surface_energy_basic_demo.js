// ======================================================
// Surface Energy Basics - Basic Demo
// Google Earth Engine + Landsat 8
// ======================================================

// Study area
var region = geometry;

Map.centerObject(region, 10);

// Landsat 8 TOA image
var image = ee.Image('LANDSAT/LC08/C02/T1/LC08_216066_20161123');

var toa = ee.Algorithms.Landsat.TOA(image).clip(region);

// NDVI
var ndvi = toa.normalizedDifference(['B5', 'B4']).rename('NDVI');

// Surface albedo - simplified
var albedo = toa.expression(
  '0.300*B2 + 0.277*B3 + 0.233*B4 + 0.143*B5 + 0.036*B6 + 0.012*B7', {
    B2: toa.select('B2'),
    B3: toa.select('B3'),
    B4: toa.select('B4'),
    B5: toa.select('B5'),
    B6: toa.select('B6'),
    B7: toa.select('B7')
  }).rename('Albedo');

// Land Surface Temperature - simplified
var lst = toa.select('B10')
  .subtract(273.15)
  .rename('LST_Celsius');

// Visualization
Map.addLayer(ndvi, {
  min: 0,
  max: 0.8,
  palette: ['brown', 'yellow', 'green']
}, 'NDVI');

Map.addLayer(albedo, {
  min: 0,
  max: 0.35,
  palette: ['black', 'white']
}, 'Surface Albedo');

Map.addLayer(lst, {
  min: 20,
  max: 45,
  palette: ['blue', 'white', 'red']
}, 'Land Surface Temperature');

// Basic statistics
print('NDVI:', ndvi);
print('Surface Albedo:', albedo);
print('Land Surface Temperature:', lst);
