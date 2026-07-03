/**** Início das importações. Se editado, não poderá ser convertido automaticamente no playground. ****/
var s2 = ee.ImageCollection("COPERNICUS/S2_HARMONIZED"),
    admin2 = ee.FeatureCollection("FAO/GAUL_SIMPLIFIED_500m/2015/level2");
/***** Fim das importações. Se editado, não poderá ser convertido automaticamente no playground. *****/
var filteredAdmin2 = admin2
  .filter(ee.Filter.eq('ADM1_NAME', 'Bahia'))
  .filter(ee.Filter.eq('ADM2_NAME', 'Salvador'));

var geometry = filteredAdmin2.geometry();

var filteredS2 = s2.filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 30))
  .filter(ee.Filter.date('2019-01-01', '2020-01-01'))
  .filter(ee.Filter.bounds(geometry));

var image = filteredS2.median(); 

var clipped = image.clip(geometry);

var rgbVis = {
  min: 0.0,
  max: 3000,
  bands: ['B4', 'B3', 'B2'], 
};
Map.centerObject(geometry)
Map.addLayer(clipped, rgbVis, 'Clipped Composite');

var exportImage = clipped.select(['B4', 'B3', 'B2']);

Export.image.toDrive({
    image: exportImage,
    description: 'S2_Composite_Raw',
    folder: 'earthengine',
    fileNamePrefix: 's2_composite_raw',
    region: geometry,
    scale: 10,
    maxPixels: 1e9
});

// Em vez de exportar bandas brutas, podemos aplicar uma imagem renderizada
// a função visualize() permite que você aplique os mesmos parâmetros 
// que são usados ​​no Earth Engine que exporta uma imagem RGB de 3 bandas
print(clipped);
var visualized = clipped.visualize(rgbVis);
print(visualized);
// Agora a imagem 'visualizada' é uma imagem RGB, não há necessidade de fornecer visParams
Map.addLayer(visualized, {}, 'Visualized Image');

Export.image.toDrive({
    image: visualized,
    description: 'S2_Composite_Visualized',
    folder: 'earthengine',
    fileNamePrefix: 'bs2_composite_visualized',
    region: geometry,
    scale: 10,
    maxPixels: 1e9
});
