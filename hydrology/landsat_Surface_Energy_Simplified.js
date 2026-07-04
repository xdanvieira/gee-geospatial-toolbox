// =====================================================================
// Landsat Surface Energy Basics – Simplified Demo
// Google Earth Engine + Landsat 8
// Public educational version
// =====================================================================
//
// This script calculates:
// - NDVI
// - Surface Albedo
// - Land Surface Temperature
// - Simple Evapotranspiration Proxy
//
// Note: This is not a full SEBAL implementation.
// =====================================================================


// 1. Area of interest
// Draw or import your geometry in Google Earth Engine.

var geometry = ee.FeatureCollection('projects/ee-xdanvieira2/assets/bacia-paramirim2')


Map.centerObject(geometry, 10);


// 2. Load Landsat 8 image

var image = ee.ImageCollection('LANDSAT/LC08/C02/T1_TOA')
  .filterBounds(geometry)
  .filterDate('2017-02-01', '2017-02-28')
  .sort('CLOUD_COVER')
  .first()
  .clip(geometry);

print('Selected image:', image);


// 3. NDVI

var ndvi = image.normalizedDifference(['B5', 'B4'])
  .rename('NDVI');

Map.addLayer(ndvi, {
  min: -0.2,
  max: 0.8,
  palette: ['brown', 'yellow', 'green']
}, 'NDVI');


// 4. Surface Albedo - simplified

var albedo = image.expression(
  '0.300*B2 + 0.277*B3 + 0.233*B4 + 0.143*B5 + 0.036*B6 + 0.012*B7', {
    'B2': image.select('B2'),
    'B3': image.select('B3'),
    'B4': image.select('B4'),
    'B5': image.select('B5'),
    'B6': image.select('B6'),
    'B7': image.select('B7')
  }).rename('Albedo');

Map.addLayer(albedo, {
  min: 0.05,
  max: 0.35,
  palette: ['black', 'white']
}, 'Surface Albedo');


// 5. Land Surface Temperature - simplified

var lst = image.select('B10')
  .subtract(273.15)
  .rename('LST_Celsius');

Map.addLayer(lst, {
  min: 20,
  max: 45,
  palette: ['blue', 'white', 'red']
}, 'Land Surface Temperature');


// 6. Simple Evapotranspiration Proxy

var etProxy = ndvi
  .unitScale(0, 0.8)
  .clamp(0, 1)
  .multiply(lst.multiply(-1).add(45))
  .rename('ET_Proxy');

Map.addLayer(etProxy, {
  min: 0,
  max: 25,
  palette: ['brown', 'yellow', 'green', 'blue']
}, 'ET Proxy');


// 7. Export

Export.image.toDrive({
  image: ee.Image.cat([ndvi, albedo, lst, etProxy]),
  description: 'Landsat_Surface_Energy_Basics_Demo',
  fileNamePrefix: 'Landsat_Surface_Energy_Basics_Demo',
  region: geometry,
  scale: 30,
  maxPixels: 1e13
});


// 8. Console

print('NDVI:', ndvi);
print('Surface Albedo:', albedo);
print('Land Surface Temperature:', lst);
print('ET Proxy:', etProxy);
