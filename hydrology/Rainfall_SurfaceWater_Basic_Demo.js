// ======================================================
// Rainfall and Surface Water Relationship - Basic Demo
// Google Earth Engine + CHIRPS + JRC GSW
// ======================================================

// Study area
var region = geometry; // Draw or import your area

Map.centerObject(region, 8);


// Years
var startYear = 2000;
var endYear = 2018;

var years = ee.List.sequence(startYear, endYear);


// CHIRPS precipitation
var chirps = ee.ImageCollection('UCSB-CHG/CHIRPS/DAILY')
  .filterBounds(region);


// Annual precipitation
var annualRainfall = ee.FeatureCollection(
  years.map(function(year) {

    var start = ee.Date.fromYMD(year, 1, 1);
    var end = start.advance(1, 'year');

    var rainfall = chirps
      .filterDate(start, end)
      .sum();

    var meanRainfall = rainfall.reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: region,
      scale: 5000,
      maxPixels: 1e13
    }).get('precipitation');

    return ee.Feature(null, {
      year: year,
      rainfall_mm: meanRainfall
    });
  })
);


// JRC Global Surface Water
var gsw = ee.ImageCollection('JRC/GSW1_4/YearlyHistory')
  .filterBounds(region);


// Annual water area
var annualWater = ee.FeatureCollection(
  years.map(function(year) {

    var start = ee.Date.fromYMD(year, 1, 1);
    var end = start.advance(1, 'year');

    var water = gsw
      .filterDate(start, end)
      .first()
      .select('waterClass')
      .eq(2);

    var area = water
      .multiply(ee.Image.pixelArea())
      .divide(10000)
      .reduceRegion({
        reducer: ee.Reducer.sum(),
        geometry: region,
        scale: 30,
        maxPixels: 1e13
      }).get('waterClass');

    return ee.Feature(null, {
      year: year,
      water_area_ha: area
    });
  })
);


// Join rainfall and water area
var joined = annualRainfall.map(function(feature) {
  var year = feature.get('year');

  var waterFeature = annualWater
    .filter(ee.Filter.eq('year', year))
    .first();

  return feature.set(
    'water_area_ha',
    waterFeature.get('water_area_ha')
  );
});


// Charts
var rainfallChart = ui.Chart.feature.byFeature(
  joined,
  'year',
  'rainfall_mm'
).setOptions({
  title: 'Annual Rainfall',
  hAxis: {title: 'Year'},
  vAxis: {title: 'Rainfall (mm)'},
  lineWidth: 2,
  pointSize: 4
});

print(rainfallChart);


var waterChart = ui.Chart.feature.byFeature(
  joined,
  'year',
  'water_area_ha'
).setOptions({
  title: 'Annual Surface Water Area',
  hAxis: {title: 'Year'},
  vAxis: {title: 'Water Area (ha)'},
  lineWidth: 2,
  pointSize: 4
});

print(waterChart);


var correlationChart = ui.Chart.feature.byFeature(
  joined,
  'rainfall_mm',
  'water_area_ha'
).setChartType('ScatterChart')
.setOptions({
  title: 'Rainfall vs Surface Water Area',
  hAxis: {title: 'Rainfall (mm)'},
  vAxis: {title: 'Water Area (ha)'},
  pointSize: 4,
  trendlines: {
    0: {
      type: 'linear',
      showR2: true,
      color: 'red'
    }
  }
});

print(correlationChart);


// Map example
var water2018 = gsw
  .filterDate('2018-01-01', '2019-01-01')
  .first()
  .select('waterClass')
  .eq(2)
  .selfMask();

Map.addLayer(water2018.clip(region), {
  palette: ['blue']
}, 'Surface Water 2018');

print('Joined rainfall and water data:', joined);
