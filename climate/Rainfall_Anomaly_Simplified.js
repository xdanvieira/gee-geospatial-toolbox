/ ======================================================
// SPI / Anomalia de Chuva - Demo Simplificada
// Google Earth Engine
// ======================================================

// Área de estudo: Bahia
var bahia = ee.FeatureCollection('FAO/GAUL/2015/level1')
  .filter(ee.Filter.eq('ADM1_NAME', 'Bahia'));

var geomBahia = bahia.geometry();

Map.centerObject(geomBahia, 6);

// CHIRPS diário
var chirps = ee.ImageCollection('UCSB-CHG/CHIRPS/DAILY')
  .select('precipitation')
  .filterBounds(geomBahia);

// Chuva acumulada em 2025
var chuva2025 = chirps
  .filterDate('2025-01-01', '2026-01-01')
  .sum()
  .rename('chuva_2025');

// Média anual histórica 1991–2020
var anos = ee.List.sequence(1991, 2020);

var chuvaAnualHistorica = ee.ImageCollection(
  anos.map(function(ano) {
    ano = ee.Number(ano);

    var inicio = ee.Date.fromYMD(ano, 1, 1);
    var fim = inicio.advance(1, 'year');

    return chirps
      .filterDate(inicio, fim)
      .sum()
      .rename('chuva_anual')
      .set('year', ano);
  })
);

var mediaHistorica = chuvaAnualHistorica
  .mean()
  .rename('media_1991_2020');

// Anomalia simples: chuva observada - média histórica
var anomalia = chuva2025
  .subtract(mediaHistorica)
  .rename('anomalia_chuva')
  .clip(geomBahia);

// Visualização
var vis = {
  min: -600,
  max: 600,
  palette: [
    '#8B0000',
    '#F4A582',
    '#FFFFBF',
    '#92C5DE',
    '#2166AC'
  ]
};

Map.addLayer(anomalia, vis, 'Anomalia de chuva 2025');

// Limite da Bahia
Map.addLayer(
  bahia.style({
    color: '000000',
    width: 1,
    fillColor: '00000000'
  }),
  {},
  'Limite Bahia'
);

// Console
print('Chuva acumulada 2025:', chuva2025);
print('Média anual histórica 1991-2020:', mediaHistorica);
print('Anomalia de chuva 2025:', anomalia);
