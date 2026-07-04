// ============================================================
// Deforestation Detection – Simplified Demo
// Google Earth Engine + MapBiomas
// ============================================================

// Study area
var region = ee.Geometry.Point([-42.2, -13.4]).buffer(5000);

Map.centerObject(region, 12);

// MapBiomas Collection 10
var mapbiomas = ee.Image(
  'projects/mapbiomas-public/assets/brazil/lulc/collection10/mapbiomas_brazil_collection10_integration_v2'
);

// Native vegetation classes
var vegetationClasses = [3, 4, 5, 11, 12, 13];

// Years
var yearBefore = 2008;
var yearAfter = 2024;

// Land cover
var before = mapbiomas.select('classification_' + yearBefore);
var after = mapbiomas.select('classification_' + yearAfter);

// Vegetation masks
var vegBefore = before.remap(
  vegetationClasses,
  ee.List.repeat(1, vegetationClasses.length),
  0
);

var vegAfter = after.remap(
  vegetationClasses,
  ee.List.repeat(1, vegetationClasses.length),
  0
);

// Deforestation: vegetation before, non-vegetation after
var deforestation = vegBefore.eq(1).and(vegAfter.eq(0));

// Visualization
Map.addLayer(vegBefore.updateMask(vegBefore).clip(region), {
  palette: ['006400']
}, 'Vegetation ' + yearBefore);

Map.addLayer(deforestation.updateMask(deforestation).clip(region), {
  palette: ['FF0000']
}, 'Deforestation ' + yearBefore + '-' + yearAfter);

Map.addLayer(region, {color: 'yellow'}, 'Study Area');

// Area calculation
var areaHa = deforestation
  .multiply(ee.Image.pixelArea())
  .divide(10000)
  .reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: region,
    scale: 30,
    maxPixels: 1e13
  });

print('Estimated deforested area (ha):', areaHa);
