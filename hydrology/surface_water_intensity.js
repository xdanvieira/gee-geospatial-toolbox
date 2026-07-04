// Carregar o conjunto de dados Global Surface Water
var gsw = ee.Image("JRC/GSW1_4/GlobalSurfaceWater");

// Selecionar a banda de mudança absoluta
var change = gsw.select("change_abs");

// Parâmetros de visualização para a mudança na intensidade de água
var VIS_CHANGE = {
  min: -50,
  max: 50,
  palette: ['red', 'black', 'limegreen']
};

// Definir a região de interesse (ROI) - Exemplo com um retângulo

// Adicionar a camada de mudança ao mapa
Map.addLayer({
  eeObject: change,
  visParams: VIS_CHANGE,
  name: 'Occurrence Change Intensity'
});

// Centralizar o mapa na região de interesse
Map.centerObject(roi, 6);

// Criar o histograma para a mudança na superfície de água
var histogram = ui.Chart.image.histogram({
  image: change,
  region: roi,
  scale: 500, // Aumentar a escala para reduzir o número de pixels
  maxPixels: 1e8 // Permitir até 100 milhões de pixels
});

// Configurar as opções do histograma
histogram.setOptions({
  title: 'Histogram of Surface Water Intensity',
  hAxis: { title: 'Change Intensity' },
  vAxis: { title: 'Pixel Count' },
  legend: { position: 'none' }
});

// Imprimir o histograma no console
print(histogram);
