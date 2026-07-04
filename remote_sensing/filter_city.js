var itubera = municipios.filterMetadata('codigo', 'equals', '2917300');

var landsat8col = ee.ImageCollection("LANDSAT/LC08/C02/T2_L2").filterBounds(itubera).filterDate('2013-05-01','2023-12-31'); 


Map.addLayer(landsat8col.median().clip(itubera));
