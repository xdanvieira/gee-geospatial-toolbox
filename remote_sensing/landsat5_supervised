// IMAGEM LANDSAT 5 DE UM LUGAR COM COORDENADAS CONHECIDAS FILTRO DE DATA E NUVEM

var roi = ee.Geometry.Point(-122.3942, 37.7295);

var landsat5 = ee.Image(ee.ImageCollection('LANDSAT/LT05/C02/T2_TOA')
    .filterDate('2008-07-22', '2012-12-31')
    .filterBounds(roi)
    .sort('CLOUD_COVER')
    .first());
    
// computando o cloud score com mascara de entrada e pixels onde qualquer banda é mascarada

var cloudScore = ee.Algorithms.Landsat.simpleCloudScore(landsat5).select('cloud');

var input = landsat5.updateMask(landsat5.mask().reduce('min').and(cloudScore.lte(50)));


// USE O TERRAMODIS

var modis = ee.Image('MODIS/051/MCD12Q1/2011_01_01')
   .select('Land_Cover_Type_1');
    
// AMOSTRAS DE IMAGENS DE ENTRADA PARA OBTER UMA FeatureCollection

var training = input.addBands(modis).sample({
  numPixels: 5000,
  seed: 0
});

//TREINAR UM CLASSIFICADOR RANDOM FOREST

var classifier = ee.Classifier.smileRandomForest(10)
    .train({
      features: training,
      classProperty: 'Land_Cover_Type_1',
      inputProperties: ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7']
      
    });


//  CLASSIFICAÇÃO DA MATRIZ DE CONFUSÃO (INPUT IMAGERY)

var classified = input.classify(classifier);


var trainAccuracy = classifier.confusionMatrix();

print('Resubstitution error matrix: ', trainAccuracy);
print('Training overall accuracy: ', trainAccuracy.accuracy());

// VALIDAÇÃO ALEATÓRIA COM UMA BANDA

var validation = input.addBands(modis).sample({
  numPixels: 5000,
  seed: 1
  
}).filter(ee.Filter.neq('B1', null));


// VALIDANDO CLASSIFICAÇÃO

var validated = validation.classify(classifier);


// OBTER UMA MATRIZ DE CONFUSÃO QUE REPRESENTA A PRECISÃO ESPERADA

var testAccuracy = validated.errorMatrix('Land_Cover_Type_1', 'classification');

print('Validation error matrix : ', testAccuracy);
print('Vlidation overall accuracy: ', testAccuracy.accuracy());

//DEFINIR PALLETA IBGP

var igbpPalette = [
  'aec3d4', // water
  '152106', '225129', '369b47', '30eb5b', '387242', // forest
  '6a2325', 'c3aa69', 'b76031', 'd9903d', '91af40',  // shrub, grass
  '111149', // wetlands
  'cdb33b', // croplands
  'cc0013', // urban
  '33280d', // crop mosaic
  'd7cdcc', // snow and ice
  'f7e084', // barren
  '6f6f6f'  // tundra
];
  

// CARREGAR O LANDSAT E CLASSIFICAÇÃO

Map.centerObject(roi, 10);
Map.addLayer(input, {bands: ['B3', 'B2', 'B1'], max: 0.4}, 'landsat5');
Map.addLayer(classified, {palette: igbpPalette, min: 0, max: 17}, 'classifield', true);



