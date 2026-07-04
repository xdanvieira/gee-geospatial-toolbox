var trmm = ee.ImageCollection("TRMM/3B42")

// definir periodo de interesse

var inicio = '2010-01-01';
var fim = '2010-12-31';

// definir área de interesse
var areaInteresse = geometry;

// filtra os dados pela data e área
var trmmFiltrado = trmm.filterDate(inicio, fim).filterBounds(areaInteresse);

// selecionar banda da precipitação
var trmmPrecipitacao = trmmFiltrado.select('precipitation');

// converter a taxa de precipitação (mm/h) em precipitação acumulada por intervalo (mm)
// multiplicar cada imagem pelo intervalo de tempo
var trmmPrecipitacao_mm = trmmPrecipitacao.map(function(image){
  var precipitacao_mm = image.multiply(3).set('system:time_start', image.get('system:time_start'));
  return precipitacao_mm;
  
})

// calcular precipitacao acumulada

var precipitacaoAcumulada = trmmPrecipitacao_mm.sum().clip(areaInteresse);

//visualizar mapa
Map.addLayer(precipitacaoAcumulada ,{min:0, max: 2000, palette:['blue', 'green', 'yellow', 'red']});
 'Precipitacao Acumulada Anual (mm)';
 

// Export the image to Google Drive
Export.image.toDrive({
  image: precipitacaoAcumulada,
  description: 'TRMM_Precipitacao_Acumulada_2010',
  folder: 'GEE_Exports', // Optional folder in your Drive
  region: areaInteresse,
  scale: 5000, // TRMM native resolution is ~25km, but you can adjust
  maxPixels: 1e13,
  crs: 'EPSG:4326' // WGS84 projection
});

// Print the export task information to know it's running
print('Export task created for TRMM accumulated precipitation 2010');
