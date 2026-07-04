// 1. Região da Bahia
var states = ee.FeatureCollection('FAO/GAUL/2015/level1')
               .filter(ee.Filter.eq('ADM0_NAME', 'Brazil'));
var bahia = states.filter(ee.Filter.eq('ADM1_NAME', 'Bahia'));
Map.setCenter(-41.5, -12.5, 6);

// 2. Hansen GFC v1.12 (2000–2024)
var gfc      = ee.Image('UMD/hansen/global_forest_change_2024_v1_12');
var lossyear = gfc.select('lossyear');  // 1=2001 … 24=2024

// 3. Máscara acumulada desde 2008 (inclui todo 2008)
var cumulativeMask = lossyear.gte(8).selfMask();  // '8' → ano 2008

// 4. Exibir mapa acumulado
Map.addLayer(
  bahia.style({color:'black', fillColor:'00000000'}),
  {}, 'Limite Bahia'
);
Map.addLayer(
  cumulativeMask.clip(bahia),
  {palette:['white','red'], min:0, max:1, opacity:0.7},
  'Desmatamento acumulado desde 2008'
);

// 5. Preparar série temporal cumulativa
var years = ee.List.sequence(2008, 2024);
var cumFeatures = years.map(function(y) {
  // máscara de 2008 até o ano y
  var mask = lossyear.gte(8).and(lossyear.lte(y - 2000));
  var area = mask
    .multiply(ee.Image.pixelArea())
    .reduceRegion({
      reducer: ee.Reducer.sum(),
      geometry: bahia.geometry(),
      scale: 30,
      maxPixels: 1e13
    })
    .get('lossyear');
  return ee.Feature(null, {
    'year': y,
    'cumulative_km2': ee.Number(area).divide(1e6)
  });
});
var cumFC = ee.FeatureCollection(cumFeatures);

// 6. Gráfico de evolução cumulativa
var chart = ui.Chart.feature
  .byFeature(cumFC, 'year', ['cumulative_km2'])
  .setOptions({
    title: 'Desmatamento acumulado na Bahia (desde 23/07/2008)',
    hAxis: {title: 'Ano'},
    vAxis: {title: 'Área cumulativa (km²)'},
    lineWidth: 2,
    pointSize: 4
  });
print(chart);
