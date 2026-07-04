// ================================================================
// Monitoramento de Precipitação Mensal – Últimos 12 Meses por Município
// + Mapa e Gráficos no Code Editor
// ================================================================

// 1. Limite dos municípios da Bahia (FAO/GAUL nível 2)
var municipios = ee.FeatureCollection("FAO/GAUL/2015/level2")
  .filter(ee.Filter.eq('ADM0_NAME', 'Brazil'))
  .filter(ee.Filter.eq('ADM1_NAME', 'Bahia'));

// 2. Carregar IMERG Monthly V07 (precipitação em mm/hr)
var imergSrc = ee.ImageCollection("NASA/GPM_L3/IMERG_MONTHLY_V07")
  .select('precipitation');

// 3. Determinar período: últimos 12 meses disponíveis
var dr        = imergSrc.reduceColumns(ee.Reducer.minMax(), ['system:time_start']);
var lastDate  = ee.Date(dr.get('max'));
var firstDate = lastDate.advance(-12, 'month');
print('Período analisado:', firstDate.format('YYYY-MM'), 'até', lastDate.format('YYYY-MM'));

// 4. Converter cada imagem mensal de mm/hr → total mensal (mm)
var imergTotal12 = imergSrc
  .filterDate(firstDate, lastDate.advance(1, 'month'))
  .map(function(img) {
    var start = ee.Date(img.get('system:time_start'));
    var hours = ee.Number(
      start.advance(1, 'month').difference(start, 'hour')
    );
    return img.multiply(hours)
              .rename('precip_mm')
              .set('system:time_start', start.millis())
              .set('date', start.format('YYYY-MM'));
  });

// 5. Reduzir por município e achatar
var monthlyByMuni = imergTotal12.map(function(img) {
  var date = img.get('date');
  var stats = img.reduceRegions({
    collection: municipios,
    reducer: ee.Reducer.mean(),
    scale: 11132,
    tileScale: 4
  });
  return stats.map(function(f) {
    return ee.Feature(f.geometry(), {
      muni_code:  f.get('ADM2_CODE'),
      municipio:  f.get('ADM2_NAME'),
      date:        date,
      precip_mm:  f.get('mean')
    });
  });
}).flatten();

// 6. Calcular máximo para vis
var maxImage = imergTotal12.max();
var maxDict  = maxImage.reduceRegion({
  reducer: ee.Reducer.max(),
  geometry: municipios.geometry(),
  scale: 11132,
  maxPixels: 1e13
});
var maxPrecip = ee.Number(maxDict.get('precip_mm')).getInfo();

// 7. Mapa: precipitação média por município no mês mais recente
var latestMuni = monthlyByMuni.filter(
  ee.Filter.eq('date', lastDate.format('YYYY-MM'))
);
var precipByMuniImg = latestMuni
  .reduceToImage(['precip_mm'], ee.Reducer.first())
  .clip(municipios);
Map.centerObject(municipios, 7);
Map.addLayer(
  precipByMuniImg,
  {min: 0, max: maxPrecip, palette: ['lightyellow','green','blue']},
  'Precip ' + lastDate.format('YYYY-MM').getInfo() + ' (mm)'
);

// 8. Gráfico 1: Série temporal média da Bahia (últimos 12 meses)
var bahiaFeature = ee.FeatureCollection([
  ee.Feature(municipios.union().geometry(), {label: 'Bahia'})
]);
var chartBahia = ui.Chart.image.series({
  imageCollection: imergTotal12.map(function(img){ return img.clip(bahiaFeature); }),
  region: bahiaFeature,
  reducer: ee.Reducer.mean(),
  scale: 11132,
  xProperty: 'system:time_start'
})
.setChartType('LineChart')
.setOptions({
  title: 'Precipitação Média Mensal – Bahia (Últimos 12 meses)',
  hAxis: {title: 'Mês', format: 'YYYY-MM'},
  vAxis: {title: 'Precipitação (mm)', viewWindow: {min: 0, max: maxPrecip}},
  lineWidth: 2,
  pointSize: 4
});
print(chartBahia);

// 9. Gráfico 2: Barra de precipitação por município no mês mais recente
var chartByMuni = ui.Chart.feature.byFeature({
  features: latestMuni,
  xProperty: 'municipio',
  yProperties: ['precip_mm']
})
.setChartType('ColumnChart')
.setOptions({
  title: 'Precipitação por Município – ' + lastDate.format('YYYY-MM').getInfo(),
  hAxis: {title: 'Município', slantedText: true, slantedTextAngle: 45},
  vAxis: {title: 'Precipitação (mm)', viewWindow: {min: 0, max: maxPrecip}},
  legend: {position: 'none'}
});
print(chartByMuni);
