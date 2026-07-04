// ======================================================
// Hydrological Risk Trend – Simplified Demo
// Google Earth Engine + CHIRPS
// ======================================================
//
// This demo calculates:
// - Annual precipitation
// - Simple climatic water deficit
// - Mean deficit
// - Basic hydrological risk class
//
// Deficit = Potential ET - Precipitation
// ======================================================


// 1. Study area
var region = ee.FeatureCollection(
  'projects/ee-xdanvieira2/assets/bacia-paramirim2'
);

Map.centerObject(region, 8);


// 2. Parameters
var startYear = 2010;
var endYear = 2024;
var potentialET = ee.Image.constant(1500);
var years = ee.List.sequence(startYear, endYear);


// 3. Annual deficit collection
var annualDeficit = ee.ImageCollection(
  years.map(function(year) {

    var start = ee.Date.fromYMD(year, 1, 1);
    var end = start.advance(1, 'year');

    var precipitation = ee.ImageCollection('UCSB-CHG/CHIRPS/DAILY')
      .filterBounds(region)
      .filterDate(start, end)
      .sum();

    var deficit = potentialET
      .subtract(precipitation)
      .rename('Deficit')
      .set('year', year)
      .set('system:time_start', start.millis());

    return deficit.clip(region);
  })
);


// 4. Mean climatic deficit
var meanDeficit = annualDeficit
  .mean()
  .rename('Mean_Deficit');


// 5. Simple risk classification
var risk = meanDeficit.expression(
  "(d <= 300) ? 1" +
  ": (d <= 600) ? 2" +
  ": (d <= 900) ? 3" +
  ": 4", {
    'd': meanDeficit
  }).rename('Hydrological_Risk');


// 6. Visualization
Map.addLayer(region, {color: 'black'}, 'Study Area');

Map.addLayer(meanDeficit, {
  min: 0,
  max: 1000,
  palette: ['#f7fcf0', '#ccebc5', '#7bccc4', '#2b8cbe', '#084081']
}, 'Mean Climatic Deficit');

Map.addLayer(risk, {
  min: 1,
  max: 4,
  palette: ['green', 'yellow', 'orange', 'red']
}, 'Hydrological Risk');


// 7. Time series chart
var chart = ui.Chart.image.series({
  imageCollection: annualDeficit,
  region: region,
  reducer: ee.Reducer.mean(),
  scale: 5000
}).setOptions({
  title: 'Annual Climatic Water Deficit',
  vAxis: {title: 'mm'},
  lineWidth: 2,
  pointSize: 4
});

print(chart);


// 8. Basic statistics
var stats = meanDeficit.reduceRegion({
  reducer: ee.Reducer.mean(),
  geometry: region.geometry(),
  scale: 5000,
  maxPixels: 1e13
});

print('Mean climatic deficit:', stats);
