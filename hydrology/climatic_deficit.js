/ ======================================================
// DÉFICIT CLIMÁTICO MULTI-ANO (ETp - P)
// Bacia Paramirim – Bahia
// 2010–2024
// ======================================================


// ============================
// 1️⃣ CONFIGURAÇÃO
// ============================

var anoInicio = 2010;
var anoFim    = 2024;

var territorio = ee.FeatureCollection(
  "projects/ee-xdanvieira2/assets/bacia-paramirim2"
);

Map.centerObject(territorio, 9);
Map.addLayer(territorio, {color: 'black'}, 'Bacia');

var anos = ee.List.sequence(anoInicio, anoFim);


// ============================
// 2️⃣ ET POTENCIAL ANUAL
// Semiárido Bahia ≈ 1500 mm/ano
// ============================

var ETp = ee.Image.constant(1500);


// ============================
// 3️⃣ COLEÇÃO ANUAL
// ============================

var colecaoAnual = ee.ImageCollection(
  anos.map(function(ano){

    var start = ee.Date.fromYMD(ano, 1, 1);
    var end = ee.Date.fromYMD(ano, 1, 1).advance(1, 'year');

    // -----------------------
    // PRECIPITAÇÃO ANUAL (CHIRPS)
    // -----------------------
    var P = ee.ImageCollection("UCSB-CHG/CHIRPS/DAILY")
      .filterDate(start, end)
      .filterBounds(territorio)
      .sum()
      .rename('P');

    // -----------------------
    // DÉFICIT CLIMÁTICO
    // ETp - P
    // -----------------------
    var deficit = ETp.subtract(P)
      .rename('Deficit')
      .set('year', ano)
      .set('system:time_start', start.millis());

    return deficit.clip(territorio);
  })
);


// ============================
// 4️⃣ MAPA MÉDIO HISTÓRICO
// ============================

var mediaHistorica = colecaoAnual.mean();

Map.addLayer(mediaHistorica, {
  min:0,
  max:1000,
  palette:['white','yellow','orange','red','darkred']
}, 'Déficit Climático Médio (2010–2024)');


// ============================
// 5️⃣ GRÁFICO TEMPORAL
// ============================

var grafico = ui.Chart.image.series({
  imageCollection: colecaoAnual,
  region: territorio,
  reducer: ee.Reducer.mean(),
  scale: 5000
}).setOptions({
  title: 'Déficit Climático Anual (ETp - P)',
  vAxis: {title: 'mm'},
  hAxis: {title: 'Ano'},
  lineWidth: 3,
  pointSize: 6,
  colors: ['red']
});

print(grafico);


// ============================
// 6️⃣ EXPORTAÇÃO RASTERS
// ============================

anos.getInfo().forEach(function(ano){

  var img = colecaoAnual
    .filter(ee.Filter.eq('year', ano))
    .first();

  Export.image.toDrive({
    image: img,
    description: 'Deficit_Climatico_' + ano,
    folder: 'Hidrologia_Paramirim_Multiano',
    fileNamePrefix: 'Deficit_Climatico_' + ano,
    region: territorio.geometry(),
    scale: 1000,
    maxPixels: 1e13
  });

});


// ============================
// 7️⃣ EXPORTAÇÃO TABELA CSV
// ============================

var tabela = colecaoAnual.map(function(img){

  var media = img.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: territorio,
    scale: 5000,
    maxPixels: 1e13
  });

  return ee.Feature(null, {
    'Ano': img.get('year'),
    'Deficit_mm': media.get('Deficit')
  });

});

Export.table.toDrive({
  collection: tabela,
  description: 'Tabela_Deficit_Climatico_2010_2024',
  folder: 'Hidrologia_Paramirim_Multiano',
  fileNamePrefix: 'Tabela_Deficit_Climatico_2010_2024',
  fileFormat: 'CSV'
});
