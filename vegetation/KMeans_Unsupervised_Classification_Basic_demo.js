// =============================================
// K-Means Unsupervised Classification - Basic Demo
// Google Earth Engine + Landsat 8
// =============================================

// Study area
var region = ee.FeatureCollection('FAO/GAUL/2015/level2')
  .filter(ee.Filter.eq('ADM0_NAME', 'Brazil'))
  .filter(ee.Filter.eq('ADM1_NAME', 'Bahia'))
  .filter(ee.Filter.eq('ADM2_NAME', 'Paramirim'));

Map.centerObject(region, 10);
Map.addLayer(region, {color: 'black'}, 'Study Area');


// Parameters
var startDate = '2025-01-01';
var endDate = '2025-12-31';
var numberOfClasses = 5;


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
  .filterDate(startDate, endDate)
  .filter(ee.Filter.lt('CLOUD_COVER', 30))
  .map(maskClouds)
  .median()
  .clip(region);


// Select spectral bands
var bands = ['SR_B2', 'SR_B3', 'SR_B4', 'SR_B5', 'SR_B6', 'SR_B7'];

var input = image.select(bands).multiply(0.0001);


// Training samples
var training = input.sample({
  region: region,
  scale: 30,
  numPixels: 3000,
  seed: 42
});


// K-Means classifier
var clusterer = ee.Clusterer.wekaKMeans(numberOfClasses)
  .train(training);


// Apply classification
var classified = input.cluster(clusterer);


// Visualization
Map.addLayer(input, {
  bands: ['SR_B4', 'SR_B3', 'SR_B2'],
  min: 0,
  max: 0.3
}, 'Landsat RGB');

Map.addLayer(classified.randomVisualizer(), {}, 'K-Means Classification');


// Output
print('Training samples:', training);
print('K-Means classification:', classified);
