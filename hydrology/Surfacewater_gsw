// importar coleção GSW

var gsw = ee.Image("JRC/GSW1_4/GlobalSurfaceWater")

// Selecionar a banda de ocorrência

var occurrence = gsw.select('occurrence')

// Parâmetros de visualização 

var occurrenceVis = {
  min: 0,
  max: 100,
    palette:['ffffff', 'ffbbbb', '0000ff']
};




Map.setCenter (0,0,2)

// Adicionar camada de ocorrência ao map

Map.addLayer(occurrence, occurrenceVis, 'Occurrence')
