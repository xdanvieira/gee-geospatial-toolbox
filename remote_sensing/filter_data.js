var start = ee.Date('2014-01-01').millis().divide(1000);
var end = ee.Date(2014-12-31).millis().divide(1000);

//carregar FORMA

var forma = ee.Image("WRI/GFW/FORMA/thresholds");
var forma2014 = forma.gte(star).and(forma.lte(end));

Map.setCenter(15.85, -0.391, 7);a
Map.addLayer(
  forma2014.mask(forma20014),{
    pallete:['FF0000']
    
  }, 'forma alerta 20214');
  
