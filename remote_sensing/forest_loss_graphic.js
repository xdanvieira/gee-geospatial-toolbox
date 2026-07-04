var bahia = ee.FeatureCollection("projects/ee-xdanvieira2/assets/bahia");


//obtem a imagem de perda

var hansen = ee.Image("UMD/hansen/global_forest_change_2023_v1_11");
var lossImage = hansen.select(['loss']);
var areaImage = lossImage.multiply(ee.Image.pixelArea());

var lossYear = hansen.select(['lossyear']);
var lossByYear = lossYear.addBands(lossYear).reduceRegion({
  reducer:ee.Reducer.sum().group({
    groupField:1
  }),
  geometry: bahia,
  scale: 30,
  maxPixels: 2e9
})

print(lossByYear);

//formatação datas/ano
var statsFormatted = ee.List(lossByYear.get('groups'))
  .map(function(el) {
    var d = ee.Dictionary(el);
    return [ee.Number(d.get('group')).format("20%02d"), d.get('sum')];
  });
var statsDictionary = ee.Dictionary(statsFormatted.flatten());
print(statsDictionary);

//contruindo grafico

var chart = ui.Chart.array.values({
  array: statsDictionary.values(),
  axis: 0,
  xLabels: statsDictionary.keys()
  }).setChartType('ColumnChart')
    .setOptions({
      title: 'Forest Loss',
      haxis: {title:'Year', formt:'####'},
      vAxis: {title:'Area (square meters)'},
      legend: {positon: "none"},
      linewidth: 1,
      pointSize: 3
    });
    
    print (chart);

