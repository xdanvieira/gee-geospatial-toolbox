var areaInteresse = ee.FeatureCollection("WWF/HydroATLAS/v1/Basins/level05")
                     .filter(ee.Filter.eq('HYBAS_ID', 6050450410));

//Map.addLayer(areaInteresse)



// carregar a coleção Global Surface Water (GSM) e GPM

var gswMonthly = ee.ImageCollection("JRC/GSW1_4/MonthlyHistory");
var gpm = ee.ImageCollection("NASA/GPM_L3/IMERG_V07");

// calcular ocorrência media de agua por ano especifico (GSW)

function getAnnualWaterOccurrence(year) {
  var startDate = ee.Date.fromYMD(year, 1, 1);
  var endDate = startDate.advance(1, 'year');
  
  var monthlyWater = gswMonthly
      .filterDate(startDate, endDate)
      .select('water')
      .map(function(image) {
        // reclassificar valores de agua 2 (agua), 1 (não agua) e 0 (sem dados)
        var waterMask = image.eq(2).selfMask();
        return waterMask;

});

// contar numero de meses em que o pixel foi classificado como agua
  var waterOccurrence = monthlyWater.sum()
    .divide(12) // numero de meses para obter a fração
    .multiply(100)   // dividir pelo numero de meses para obter a fração de ocorrencia
    .clip(areaInteresse)
    .set('year', year);
  
  return waterOccurrence
}

// calcular precipitação total anual para o ano especifico (GPM)

function getAnnualPrecipitation(year){
  var startDate = ee.Date.fromYMD(year, 1, 1);
  var endDate = startDate.advance(1, 'year');
  
  var precipitation = gpm
      .filterDate(startDate, endDate)
      .filterBounds(areaInteresse)
      .select('precipitation')
      .sum()
      .clip(areaInteresse)
      .set('year', year)
      
      return precipitation;
      
      
}


// ocorrencia media de agua total de precipitação 2014 ate 2020
var waterOccurrence2014 = getAnnualWaterOccurrence(2014);
var precipitation2014 = getAnnualPrecipitation(2014);

var waterOccurrence2020 = getAnnualWaterOccurrence(2020);
var precipitation2020 = getAnnualPrecipitation(2020);


// mascara GSW ao GPM para limitar analise as áreas com dados válidos do GSW
var maskedPrecipitation2014 = precipitation2014.updateMask(waterOccurrence2014.mask());
var maskedPrecipitation2020 = precipitation2020.updateMask(waterOccurrence2020.mask());

// combinar imagens em pares (2014 e 2020)

var combined2014 = waterOccurrence2014.addBands(maskedPrecipitation2014);
var combined2020 = waterOccurrence2020.addBands(maskedPrecipitation2020);

// calcular correção entre as duas bandas

function calculateCorrelation(image) {
  // reduzir a região para obter a correção entre as duas bandas (ocorrencia e precipitação)
  var correlation = image.reduceRegion({
    reducer: ee.Reducer.pearsonsCorrelation(),
    geometry: areaInteresse.geometry(),
    scale: 1000,
    maxPixels: 1e9,
    bestEffort: true // permite ajustar a escala automaticamente
  
  });
  
  return correlation;
}


// correção entre 2014 e 2020
var correlation2014 = calculateCorrelation(combined2014);
var correlation2020 = calculateCorrelation(combined2020);


// camadas ao mapa de visualização (opcional)

var visParamsWater = {min: 0, max: 100, palette: ['white', 'blue']};
var visParamPrecip = {min: 0.0, max: 1000.0, palette: ['lightblue', 'blue', 'purple', 'red', 'orange', 'yellow']};



Map.addLayer(waterOccurrence2014, visParamsWater, 'Ocorrência Média de água em 2014');
Map.addLayer(precipitation2014, visParamsWater, 'Precipitação total em 2014');
Map.addLayer(waterOccurrence2020, visParamsWater, 'Ocorrência Média de água em 2020');
Map.addLayer(precipitation2020, visParamsWater, 'Precipitação total em 2020');

Map.centerObject(areaInteresse);
Map.addLayer(areaInteresse, {color: 'black'}, 'Bacia');

print('Correlação 2014:', correlation2014);
print('Correlação 2020:', correlation2020);

