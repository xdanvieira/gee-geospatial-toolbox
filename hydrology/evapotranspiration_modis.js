// Monitoramento de evapotranspiração e estresse hídrico de bacias usando o conjunto de dados MODIS

// === CONFIGURAÇÃO ===
var coords       = [-41.153788545087544, -12.158550309730568];
var pointOfInterest = ee.Geometry.Point(coords);
var startDate    = '2001-01-01';
var endDate      = '2024-01-01';
var scaleFactor  = 0.1;             // fator para converter unidades de tenths mm → mm
var exportScale  = 500;             // escala padrão para exportação
var basin = ee.FeatureCollection("WWF/HydroSHEDS/v1/Basins/hybas_5")
               .filterBounds(pointOfInterest);

// Centraliza mapa e camada do basin
Map.centerObject(basin, 6);
Map.addLayer(basin, {}, 'Bacia Hidrográfica');

// === CARREGAMENTO E FILTRAGEM ===
var modis = ee.ImageCollection("MODIS/061/MOD16A2GF")
               .filterDate(startDate, endDate)
               .filterBounds(basin)
               .select(['ET', 'PET']);

// Verifica se há imagens
print('Qtd. MODIS:', modis.size());

// === CÁLCULOS PRINCIPAIS ===
// 1) Média ET no período
var meanEt = modis
               .select('ET')
               .mean()
               .multiply(scaleFactor);

// 2) ET de verão (jun, jul, ago)
var summerEt = modis
               .filter(ee.Filter.calendarRange(6, 8, 'month'))
               .select('ET')
               .mean()
               .multiply(scaleFactor);

// 3) Função para CWSI com proteção contra PET=0
var computeCwsi = function(img) {
  var et  = img.select('ET').multiply(scaleFactor);
  var pet = img.select('PET').multiply(scaleFactor)
               .where(img.select('PET').eq(0), 1);
  var cwsi = et.divide(pet)
                .multiply(-1)
                .add(1)
                .rename('CWSI');
  return cwsi.copyProperties(img, ['system:time_start']);
};

var cwsiCol = modis.map(computeCwsi);
var meanCwsi = cwsiCol.mean();

// === MÁSCARA DE CULTIVOS ===
var landCover = ee.ImageCollection("MODIS/061/MCD12Q1")
                   .filterDate(startDate, endDate)
                   .first()
                   .select('LC_Type1');
var cropMask = landCover.eq(12);  // classe 12 = croplands

// === VISUALIZAÇÃO (camadas opcionais) ===
Map.addLayer(meanEt.clip(basin.geometry()),
             {min: 0, max: 100, palette: ['blue','green','yellow','red']},
             'Média ET (2001–2024)');

/// Para exibir ET de verão
// Map.addLayer(summerEt.clip(basin.geometry()),
//              {min: 0, max: 100, palette: ['blue','green','yellow','red']},
//              'ET Verão');

Map.addLayer(meanCwsi.clip(basin.geometry()),
              {min: 0, max: 1, palette: ['green','yellow','red']},
              'Média CWSI');

// Map.addLayer(cropMask.clip(basin.geometry()),
//              {palette: ['green']},
//              'Áreas de Cultivo');

 Map.addLayer(meanCwsi.updateMask(cropMask).clip(basin.geometry()),
              {min: 0, max: 1, palette: ['green','yellow','red']},
              'CWSI em Cultivos');

// === EXPORTAÇÃO (opcional) ===
/// Export.image.toDrive({
//   image: meanEt.clip(basin.geometry()),
//   description: 'Mean_ET_2001_2024',
//   folder: 'evapo_analysis',
//   scale: exportScale,
//   region: basin.geometry(),
//   maxPixels: 1e13
// });

/// Se quiser exportar CWSI:
 Export.image.toDrive({
   image: meanCwsi.clip(basin.geometry()),
   description: 'Mean_CWSI_2001_2024',
   folder: 'evapo_analysis',
   scale: exportScale,
   region: basin.geometry(),
   maxPixels: 1e13
 });
