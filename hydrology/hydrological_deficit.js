// ======================================================
// PAINEL HIDROLÓGICO INSTITUCIONAL – FISCALIZAÇÃO
// Déficit Hídrico + Vazão + Exportação Automática
// Bacia Paramirim – Bahia
// ======================================================


// ============================
// 1️⃣ CONFIGURAÇÕES
// ============================

var year = 2023;

var territorio = ee.FeatureCollection(
  "projects/ee-xdanvieira2/assets/bacia-paramirim2"
);

Map.centerObject(territorio, 9);
Map.addLayer(territorio, {color: 'black'}, 'Bacia');

var months = ee.List.sequence(1,12);


// ============================
// 2️⃣ COLEÇÃO MENSAL
// ============================

var colecaoMensal = ee.ImageCollection(
  months.map(function(m){

    var start = ee.Date.fromYMD(year, m, 1);
    var end   = start.advance(1,'month');

    // --------------------------
    // PRECIPITAÇÃO (CHIRPS)
    // --------------------------
    var P = ee.ImageCollection("UCSB-CHG/CHIRPS/DAILY")
      .filterDate(start, end)
      .filterBounds(territorio)
      .sum()
      .rename('P');

    // --------------------------
    // ET OPERACIONAL MÉDIA
    // (valor médio regional mensal)
    // --------------------------
    var ET = ee.Image.constant(120).rename('ET');

    // --------------------------
    // DÉFICIT
    // --------------------------
    var deficit = P.subtract(ET).rename('Deficit');

    // --------------------------
    // RUNOFF (GLDAS)
    // --------------------------
    var runoff = ee.ImageCollection("NASA/GLDAS/V021/NOAH/G025/T3H")
      .filterDate(start, end)
      .select('Qs_acc')
      .mean()
      .rename('Runoff');

    return P.addBands(ET)
            .addBands(deficit)
            .addBands(runoff)
            .set('month', m)
            .set('system:time_start', start.millis())
            .clip(territorio);
  })
);


// ============================
// 3️⃣ VISUALIZAÇÃO – MÊS SELECIONADO
// ============================

var mesSelecionado = 1; // altere 1–12

var imagemMes = ee.Image(
  colecaoMensal.filter(ee.Filter.eq('month', mesSelecionado)).first()
);


// --- Precipitação ---
Map.addLayer(imagemMes.select('P'), {
  min:0,
  max:300,
  palette:['white','lightblue','blue','darkblue']
}, 'Precipitação (mm)');


// --- Déficit ---
Map.addLayer(imagemMes.select('Deficit'), {
  min:-200,
  max:200,
  palette:['red','orange','white','lightblue','darkblue']
}, 'Déficit (P - ET)');


// ============================
// 4️⃣ GRÁFICOS MENSAIS
// ============================

var chartP = ui.Chart.image.series({
  imageCollection: colecaoMensal.select('P'),
  region: territorio,
  reducer: ee.Reducer.mean(),
  scale: 5000
}).setOptions({
  title: 'Precipitação Mensal (mm)',
  vAxis: {title: 'mm'},
  lineWidth: 2,
  pointSize: 4,
  colors: ['blue']
});
print(chartP);


var chartDeficit = ui.Chart.image.series({
  imageCollection: colecaoMensal.select('Deficit'),
  region: territorio,
  reducer: ee.Reducer.mean(),
  scale: 5000
}).setOptions({
  title: 'Déficit Hídrico Mensal (P - ET)',
  vAxis: {title: 'mm'},
  lineWidth: 2,
  pointSize: 4,
  colors: ['red']
});
print(chartDeficit);


var chartRunoff = ui.Chart.image.series({
  imageCollection: colecaoMensal.select('Runoff'),
  region: territorio,
  reducer: ee.Reducer.mean(),
  scale: 25000
}).setOptions({
  title: 'Runoff Mensal (GLDAS)',
  vAxis: {title: 'Runoff'},
  lineWidth: 2,
  pointSize: 4,
  colors: ['darkblue']
});
print(chartRunoff);


// ============================
// 5️⃣ EXPORTAÇÃO AUTOMÁTICA
// ============================

// --- Déficit anual médio ---
var deficitAnual = colecaoMensal.select('Deficit').mean();

Export.image.toDrive({
  image: deficitAnual,
  description: 'Deficit_Hidrico_Anual_' + year,
  folder: 'Hidrologia_Paramirim',
  fileNamePrefix: 'Deficit_Anual_' + year,
  region: territorio.geometry(),
  scale: 1000,
  maxPixels: 1e13
});


// --- Exportação mensal ---
months.getInfo().forEach(function(m){

  var img = colecaoMensal
    .filter(ee.Filter.eq('month', m))
    .first()
    .select('Deficit');

  Export.image.toDrive({
    image: img,
    description: 'Deficit_' + year + '_Mes_' + m,
    folder: 'Hidrologia_Paramirim',
    fileNamePrefix: 'Deficit_' + year + '_Mes_' + m,
    region: territorio.geometry(),
    scale: 1000,
    maxPixels: 1e13
  });

});


// --- Tabela CSV mensal ---
var tabelaMensal = colecaoMensal.map(function(img){

  var media = img.select('Deficit')
    .reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: territorio,
      scale: 5000,
      maxPixels: 1e13
    });

  return ee.Feature(null, {
    'Ano': year,
    'Mes': img.get('month'),
    'Deficit_mm': media.get('Deficit')
  });

});

Export.table.toDrive({
  collection: tabelaMensal,
  description: 'Tabela_Deficit_Mensal_' + year,
  folder: 'Hidrologia_Paramirim',
  fileNamePrefix: 'Tabela_Deficit_Mensal_' + year,
  fileFormat: 'CSV'
});
