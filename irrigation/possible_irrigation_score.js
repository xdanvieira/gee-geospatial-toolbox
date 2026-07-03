// ============================================================
// MODELO ULTRA CONSERVADOR – IRRIGAÇÃO POSSÍVEL
// PARAMIRIM – BA – 2024
// ============================================================

// -----------------------------
// 1. ÁREA
// -----------------------------
var territorio = ee.FeatureCollection(
  "projects/ee-xdanvieira2/assets/bacia-paramirim2"
);

Map.centerObject(territorio, 9);

// -----------------------------
// 2. FUNÇÃO MÁSCARA SCL RÍGIDA
// -----------------------------
function maskS2(image){
  var scl = image.select('SCL');
  
  var mask = scl.neq(3)   // sombra
    .and(scl.neq(8))      // nuvem média
    .and(scl.neq(9))      // nuvem alta
    .and(scl.neq(10))     // cirrus
    .and(scl.neq(11));    // neve
  
  return image.updateMask(mask)
              .divide(10000)
              .copyProperties(image, image.propertyNames());
}

// -----------------------------
// 3. PERÍODOS
// -----------------------------
var seco = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
  .filterBounds(territorio)
  .filterDate('2024-04-01','2024-10-31')
  .map(maskS2);

var chuva = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
  .filterBounds(territorio)
  .filterDate('2024-01-01','2024-03-31')
  .map(maskS2);

// -----------------------------
// 4. CONTAGEM DE OBSERVAÇÕES VÁLIDAS
// -----------------------------
var countSeco = seco.select('B4').count();

var mascaraConfiavel = countSeco.gte(3); // mínimo 3 imagens válidas

// -----------------------------
// 5. IMAGENS MEDIANAS
// -----------------------------
var imgSeco = seco.median().clip(territorio);
var imgChuva = chuva.median().clip(territorio);

// -----------------------------
// 6. ÍNDICES
// -----------------------------
var ndviSeco = imgSeco.normalizedDifference(['B8','B4']);
var ndviChuva = imgChuva.normalizedDifference(['B8','B4']);
var ndmiSeco = imgSeco.normalizedDifference(['B8','B11']);
var ndwiSeco = imgSeco.normalizedDifference(['B3','B8']);

var anomalia = ndviSeco.subtract(ndviChuva);

// -----------------------------
// 7. SCORE ULTRA RÍGIDO
// -----------------------------
var score = ndviSeco.unitScale(0.4,0.9).clamp(0,1).multiply(25)
  .add(ndmiSeco.unitScale(0.1,0.4).clamp(0,1).multiply(25))
  .add(anomalia.unitScale(0.05,0.3).clamp(0,1).multiply(25))
  .add(ndwiSeco.unitScale(0.15,0.4).clamp(0,1).multiply(25))
  .updateMask(mascaraConfiavel)
  .rename('Score')
  .clip(territorio);

// -----------------------------
// 8. PERCENTIL 95 (ULTRA CONSERVADOR)
// -----------------------------
var amostraPercentil = score.sample({
  region: territorio,
  scale: 60,
  numPixels: 3000,
  geometries: false,
  tileScale: 4
});

var p95 = ee.Number(
  amostraPercentil.reduceColumns({
    reducer: ee.Reducer.percentile([95]),
    selectors: ['Score']
  }).get('p95')
);

print('Percentil 95:', p95);

var alto = score.gt(p95);

// -----------------------------
// 9. VISUALIZAÇÃO
// -----------------------------
Map.addLayer(score.selfMask(),
  {min:0,max:100,palette:['green','yellow','red']},
  'Score Ultra Conservador');

Map.addLayer(alto.selfMask(),
  {palette:'red'},
  'Alta Confiança (P95)');

// -----------------------------
// 10. TOP 30 PRIORIDADE (MAIS RÍGIDO)
// -----------------------------
var amostrasRanking = score.sample({
  region: territorio,
  scale: 30,
  numPixels: 2000,
  geometries: true,
  tileScale: 4
});

var ranking = amostrasRanking.sort('Score', false).limit(30);

Map.addLayer(ranking, {color:'black'}, 'Top 30 Alta Confiança');

// -----------------------------
// 11. EXPORTAÇÕES
// -----------------------------
Export.image.toDrive({
  image: score,
  description: 'Score_Captacao_ULTRA_Conservador_2024',
  region: territorio,
  scale: 30,
  maxPixels: 1e13
});

Export.image.toDrive({
  image: alto,
  description: 'Captacao_P95_ULTRA_Conservador_2024',
  region: territorio,
  scale: 30,
  maxPixels: 1e13
});

Export.table.toDrive({
  collection: ranking,
  description: 'Top30_Captacao_ULTRA_Conservador_2024',
  fileFormat: 'SHP'
});
