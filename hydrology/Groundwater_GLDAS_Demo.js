// ======================================================
// Groundwater Storage Anomaly - Basic Demo
// Google Earth Engine + GLDAS
// ======================================================

// Study area: Bahia, Brazil
var region = ee.FeatureCollection('FAO/GAUL/2015/level1')
  .filter(ee.Filter.eq('ADM0_NAME', 'Brazil'))
  .filter(ee.Filter.eq('ADM1_NAME', 'Bahia'));

Map.centerObject(region, 6);
Map.addLayer(region, {color: 'blue'}, 'Study Area');


// Time period
var startDate = ee.Date('2003-01-01');
var endDate   = ee.Date('2024-01-01');


// GLDAS groundwater storage
var gldas = ee.ImageCollection('NASA/GLDAS/V022/CLSM/G025/DA1D')
  .select('GWS_tavg')
  .filterDate(startDate, endDate);


// Monthly mean collection
var months = ee.List.sequence(0, endDate.difference(startDate, 'month').subtract(1));

var monthly = ee.ImageCollection(
  months.map(function(m) {
    var start = startDate.advance(m, 'month');
    var end = start.advance(1, 'month');

    return gldas
      .filterDate(start, end)
      .mean()
      .rename('Groundwater')
      .set('system:time_start', start.millis());
  })
);


// Long-term mean
var longTermMean = monthly.mean();


// Groundwater anomaly
var anomaly = monthly.map(function(image) {
  return image
    .subtract(longTermMean)
    .rename('Groundwater_Anomaly')
    .set('system:time_start', image.get('system:time_start'));
});


// Map example
Map.addLayer(anomaly.first().clip(region), {
  min: -20,
  max: 20,
  palette: ['red', 'white', 'blue']
}, 'Groundwater Anomaly');


// Time series chart
var chart = ui.Chart.image.series({
  imageCollection: anomaly,
  region: region.geometry(),
  reducer: ee.Reducer.mean(),
  scale: 27000,
  xProperty: 'system:time_start'
}).setOptions({
  title: 'Groundwater Storage Anomaly',
  vAxis: {title: 'Anomaly'},
  hAxis: {title: 'Date'},
  lineWidth: 2,
  pointSize: 2
});

print(chart);


// Basic output
print('Monthly groundwater collection:', monthly);
print('Groundwater anomaly collection:', anomaly);
