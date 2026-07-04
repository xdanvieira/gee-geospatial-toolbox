// ============================================================================
// Forest Loss Report - Basic Demo
// Google Earth Engine + Hansen Global Forest Change
// ============================================================================

// Study area
var region = ee.FeatureCollection('FAO/GAUL/2015/level1')
  .filter(ee.Filter.eq('ADM0_NAME', 'Brazil'))
  .filter(ee.Filter.eq('ADM1_NAME', 'Bahia'))
  .geometry();

Map.centerObject(region, 6);
Map.addLayer(region, {color: 'black'}, 'Study Area');


// Hansen Global Forest Change
var gfc = ee.Image('UMD/hansen/global_forest_change_2020_v1_8');
var lossYear = gfc.select('lossyear');


// Forest loss from 2008 onward
var lossPost2008 = lossYear.gte(8).selfMask();

Map.addLayer(lossPost2008.clip(region), {
  palette: ['red']
}, 'Forest Loss After 2008');


// Total loss area
var areaHa = lossPost2008
  .multiply(ee.Image.pixelArea())
  .divide(10000)
  .reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: region,
    scale: 30,
    maxPixels: 1e13
  });

print('Total forest loss after 2008 (ha):', areaHa);


// Annual forest loss chart
var years = ee.List.sequence(2008, 2020);

var annualLoss = ee.FeatureCollection(
  years.map(function(year) {

    var gfcYear = ee.Number(year).subtract(2000);

    var loss = lossYear.eq(gfcYear)
      .multiply(ee.Image.pixelArea())
      .divide(10000)
      .reduceRegion({
        reducer: ee.Reducer.sum(),
        geometry: region,
        scale: 30,
        maxPixels: 1e13
      });

    return ee.Feature(null, {
      year: year,
      loss_ha: loss.get('lossyear')
    });
  })
);

var chart = ui.Chart.feature.byFeature(
  annualLoss,
  'year',
  'loss_ha'
).setOptions({
  title: 'Annual Forest Loss',
  hAxis: {title: 'Year'},
  vAxis: {title: 'Area (ha)'},
  legend: {position: 'none'}
});

print(chart);
