// ======================================================
// Monthly Water Deficit - Simplified Demo
// Google Earth Engine
// ======================================================

// Área de estudo
var region = ee.FeatureCollection(
    'projects/ee-xdanvieira2/assets/bacia-paramirim2'
);

Map.centerObject(region, 8);

// Janeiro de 2023
var start = '2023-01-01';
var end   = '2023-02-01';

// Precipitação CHIRPS
var precipitation = ee.ImageCollection('UCSB-CHG/CHIRPS/DAILY')
    .filterDate(start, end)
    .sum()
    .rename('P');

// ET de referência fixa (exemplo)
var et = ee.Image.constant(120).rename('ET');

// Déficit hídrico
var deficit = precipitation.subtract(et);

// Visualização

Map.addLayer(precipitation.clip(region), {
    min:0,
    max:300,
    palette:['white','skyblue','blue']
}, 'Precipitation');

Map.addLayer(deficit.clip(region), {
    min:-150,
    max:150,
    palette:['red','white','blue']
}, 'Water Deficit');

// Média da bacia
var stats = deficit.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: region,
    scale: 5000
});

print('Average Water Deficit (mm)', stats);
