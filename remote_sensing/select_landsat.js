
// Buscar a coleção Landsat 8
var colecao = ee.ImageCollection('LANDSAT/LC08/C02/T1_TOA')
  .filterBounds(geometry)
  .filterDate('2023-01-01', '2023-12-31') // Ajuste o período desejado
  .filterMetadata('CLOUD_COVER', 'less_than', 20) // Menos de 20% de nuvens
  .sort('CLOUD_COVER');

// Pegar as 5 melhores
var melhores = colecao.limit(5);

// Mostrar informações no console
print('🛰️ Top 5 melhores imagens Landsat 8:', melhores);
