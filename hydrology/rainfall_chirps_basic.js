// ============================================================
// Rainfall YTD Anomaly - Basic Demo
// Google Earth Engine + CHIRPS
// ============================================================

// Study area: Bahia
var region = ee.FeatureCollection('FAO/GAUL/2015/level1')
  .filter(ee.Filter.eq('ADM0_NAME', 'Brazil'))
  .filter(ee.Filter.eq('ADM1_NAME', 'Bahia'));

Map.centerObject(region, 6);
Map.addLayer(region, {color: 'black'}, 'Study Area');


// Dates
var startDate = ee.Date('2025-01-01');
var endDate   = ee.Date('2025-08-17');


// CHIRPS Daily
var chirps = ee.ImageCollection('UCSB-CHG/CHIRPS/DAILY')
  .select('precipitation');


// Rainfall accumulated in 2025
var rainfall2025 = chirps
  .filterDate(startDate, endDate.advance(1, 'day'))
  .sum()
  .rename('Rainfall_2025')
  .clip(region);


// Simple climatology: same period from 1981 to 2010
var years = ee.List.sequence(1981, 2010);

var climatology = ee.ImageCollection(
  years.map(function(year) {
    var start = startDate.update({year: year});
    var end = endDate.update({year: year});

    return chirps
      .filterDate(start, end.advance(1, 'day'))
      .sum()
      .rename('Rainfall');
  })
).mean()
.rename('Climatology')
.clip(region);


// Rainfall anomaly
var anomaly = rainfall2025
  .subtract(climatology)
  .rename('Rainfall_Anomaly');


// Visualization
Map.addLayer(rainfall2025, {
  min: 0,
  max: 1500,
  palette: ['white', 'lightblue', 'blue', 'darkblue']
}, 'Rainfall 2025');

Map.addLayer(anomaly, {
  min: -400,
  max: 400,
  palette: ['red', 'white', 'blue']
}, 'Rainfall Anomaly');


// Basic chart by municipality
var municipalities = ee.FeatureCollection('FAO/GAUL/2015/level2')
  .filter(ee.Filter.eq('ADM0_NAME', 'Brazil'))
  .filter(ee.Filter.eq('ADM1_NAME', 'Bahia'));

var table = anomaly.reduceRegions({
  collection: municipalities,
  reducer: ee.Reducer.mean(),
  scale: 5000
});

var chart = ui.Chart.feature.byFeature(
  table,
  'ADM2_NAME',
  'mean'
).setOptions({
  title: 'Rainfall Anomaly by Municipality',
  hAxis: {title: 'Municipality', slantedText: true},
  vAxis: {title: 'Anomaly (mm)'},
  legend: {position: 'none'}
});

print(chart);


// Output
print('Rainfall 2025:', rainfall2025);
print('Climatology:', climatology);
print('Rainfall anomaly:', anomaly);
