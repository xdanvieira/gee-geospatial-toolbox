// ======================================================
// Hydrological Water Deficit – Simplified Demo
// Google Earth Engine + CHIRPS
// Public educational version
// ======================================================
//
// This script estimates monthly water deficit using:
// - CHIRPS precipitation
// - A fixed reference evapotranspiration value
//
// Water Deficit = Precipitation - Reference ET
//
// Note:
// This is a simplified educational demo.
// It is not an operational hydrological model.
// ======================================================


// ============================
// 1. PARAMETERS
// ============================

var year = 2023;

// Draw or import your area of interest in Google Earth Engine

var region = ee.FeatureCollection(
  'projects/ee-xdanvieira2/assets/bacia-paramirim2'
);


Map.centerObject(region, 8);
Map.addLayer(region, {color: 'black'}, 'Study Area');

var months = ee.List.sequence(1, 12);

// Fixed monthly reference evapotranspiration value in mm
var referenceET = 120;


// ============================
// 2. MONTHLY WATER DEFICIT COLLECTION
// ============================

var monthlyCollection = ee.ImageCollection(
  months.map(function(month) {

    var start = ee.Date.fromYMD(year, month, 1);
    var end = start.advance(1, 'month');

    var precipitation = ee.ImageCollection('UCSB-CHG/CHIRPS/DAILY')
      .filterDate(start, end)
      .filterBounds(region)
      .sum()
      .rename('Precipitation');

    var et = ee.Image.constant(referenceET)
      .rename('Reference_ET');

    var waterDeficit = precipitation
      .subtract(et)
      .rename('Water_Deficit');

    return precipitation
      .addBands(et)
      .addBands(waterDeficit)
      .set('month', month)
      .set('system:time_start', start.millis())
      .clip(region);
  })
);


// ============================
// 3. MAP VISUALIZATION
// ============================

var selectedMonth = 1; // Change from 1 to 12

var monthlyImage = ee.Image(
  monthlyCollection
    .filter(ee.Filter.eq('month', selectedMonth))
    .first()
);

Map.addLayer(monthlyImage.select('Precipitation'), {
  min: 0,
  max: 300,
  palette: ['white', 'lightblue', 'blue', 'darkblue']
}, 'Monthly Precipitation');

Map.addLayer(monthlyImage.select('Water_Deficit'), {
  min: -200,
  max: 200,
  palette: ['red', 'orange', 'white', 'lightblue', 'darkblue']
}, 'Monthly Water Deficit');


// ============================
// 4. MONTHLY CHARTS
// ============================

var precipitationChart = ui.Chart.image.series({
  imageCollection: monthlyCollection.select('Precipitation'),
  region: region,
  reducer: ee.Reducer.mean(),
  scale: 5000
}).setOptions({
  title: 'Monthly Precipitation',
  vAxis: {title: 'mm'},
  hAxis: {title: 'Month'},
  lineWidth: 2,
  pointSize: 4,
  colors: ['blue']
});

print(precipitationChart);


var deficitChart = ui.Chart.image.series({
  imageCollection: monthlyCollection.select('Water_Deficit'),
  region: region,
  reducer: ee.Reducer.mean(),
  scale: 5000
}).setOptions({
  title: 'Monthly Water Deficit',
  vAxis: {title: 'mm'},
  hAxis: {title: 'Month'},
  lineWidth: 2,
  pointSize: 4,
  colors: ['red']
});

print(deficitChart);


// ============================
// 5. ANNUAL WATER DEFICIT
// ============================

var annualDeficit = monthlyCollection
  .select('Water_Deficit')
  .mean()
  .rename('Annual_Mean_Water_Deficit');

Map.addLayer(annualDeficit, {
  min: -200,
  max: 200,
  palette: ['red', 'orange', 'white', 'lightblue', 'darkblue']
}, 'Annual Mean Water Deficit');


// ============================
// 6. EXPORT IMAGE
// ============================

Export.image.toDrive({
  image: annualDeficit,
  description: 'Annual_Water_Deficit_Demo_' + year,
  fileNamePrefix: 'Annual_Water_Deficit_Demo_' + year,
  region: region,
  scale: 5000,
  maxPixels: 1e13
});


// ============================
// 7. EXPORT MONTHLY TABLE
// ============================

var monthlyTable = monthlyCollection.map(function(image) {

  var stats = image.select(['Precipitation', 'Water_Deficit'])
    .reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: region,
      scale: 5000,
      maxPixels: 1e13
    });

  return ee.Feature(null, {
    'Year': year,
    'Month': image.get('month'),
    'Mean_Precipitation_mm': stats.get('Precipitation'),
    'Mean_Water_Deficit_mm': stats.get('Water_Deficit')
  });

});

Export.table.toDrive({
  collection: monthlyTable,
  description: 'Monthly_Water_Deficit_Table_' + year,
  fileNamePrefix: 'Monthly_Water_Deficit_Table_' + year,
  fileFormat: 'CSV'
});


// ============================
// 8. CONSOLE OUTPUT
// ============================

print('Monthly collection:', monthlyCollection);
print('Annual mean water deficit:', annualDeficit);
print('Monthly summary table:', monthlyTable);
