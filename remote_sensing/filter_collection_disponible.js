// Filtrar a coleção para listar imagens disponíveis
var collection = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
    .filterBounds(ee.Geometry.Point([-45.0, -12.0])) // Substitua pelas coordenadas da sua área
    .filterDate('2017-02-01', '2017-02-10'); // Ajuste o intervalo de datas

print(collection, 'Imagens Disponíveis');
