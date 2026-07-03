// Área de interesse: Bahia (ou outro estado)
var area = ee.FeatureCollection("FAO/GAUL/2015/level1")
              .filter(ee.Filter.eq('ADM1_NAME', 'Bahia'));

// Coleção CHIRPS diária
var chirps = ee.ImageCollection("UCSB-CHG/CHIRPS/DAILY")
               .select('precipitation');

// Lista de anos
var anos = ee.List.sequence(2020, 2024);

// Parâmetros de visualização
var visParams = {
  min: 0,
  max: 2000,  // Ajuste conforme necessário
  palette: ['white', 'lightblue', 'blue', 'green', 'yellow', 'red']
};

// Função para calcular a precipitação total anual, visualizar e exportar como GeoTIFF
anos.evaluate(function(listaAnos) {
  listaAnos.forEach(function(ano) {
    var inicio = ee.Date.fromYMD(ano, 1, 1);
    var fim = ee.Date.fromYMD(ano, 12, 31);
    
    // Calcular a precipitação anual
    var precipAnual = chirps
      .filterDate(inicio, fim)
      .filterBounds(area)
      .sum()
      .clip(area)
      .set({'ano': ano});
    
    // Visualizar a precipitação no mapa
    Map.addLayer(precipAnual, visParams, 'Precipitação Anual ' + ano);
    
    // Exportar como GeoTIFF
    Export.image.toDrive({
      image: precipAnual,
      description: 'precipitacao_CHIRPS_' + ano,
      folder: 'GEE_CHIRPS_TIF',  // Pasta no seu Google Drive
      fileNamePrefix: 'precip_chirps_' + ano,
      region: area.geometry(),
      scale: 5000,
      maxPixels: 1e13,
      crs: 'EPSG:4326'
    });
  });
});

// Ajustar o centro do mapa para a área de interesse
Map.centerObject(area, 6);
