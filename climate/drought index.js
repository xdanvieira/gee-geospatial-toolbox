// Carregar dados TerraClimate
var bancoTerraClimate = ee.ImageCollection("IDAHO_EPSCOR/TERRACLIMATE");

// Região de interesse
var shapeUrucuia = ee.FeatureCollection('projects/ee-xdanvieira2/assets/urucuia');

// Dados climáticos (PDSI) por período
var TerraClimate1958 = bancoTerraClimate.select('pdsi')
  .filterDate('1958-01-01', '1987-12-31').mean().clip(shapeUrucuia);
var TerraClimate1988 = bancoTerraClimate.select('pdsi')
  .filterDate('1988-01-01', '2017-12-31').mean().clip(shapeUrucuia);

// Dados completos para gráfico
var TerraClimate = bancoTerraClimate.select('pdsi')
  .filterBounds(shapeUrucuia)
  .filterDate('1958-01-01', '2017-12-31');

// Criar e configurar legenda
var legend = ui.Panel({
  style: {
    position: 'bottom-left',
    padding: '8px 15px'
  }
});

var legendTitle = ui.Label({
  value: 'PDSI Legenda',
  style: {
    fontWeight: 'bold',
    fontSize: '10px',
    margin: '0 0 4px 0',
    padding: '0'
  }
});
legend.add(legendTitle);

var makeRow = function(color, name) {
  var colorBox = ui.Label({
    style: {
      backgroundColor: '#' + color,
      padding: '8px',
      margin: '0 0 4px 0'
    }
  });

  var description = ui.Label({
    value: name,
    style: { margin: '0 0 4px 6px' }
  });

  return ui.Panel({
    widgets: [colorBox, description],
    layout: ui.Panel.Layout.Flow('horizontal')
  });
};

var palette = ['bc0101', 'e00c0c', 'ff3a00', 'f2ff2f', '0bff34', '59ddf3', '35bde7', '4e74ff', '0f00ff', 'a800ff'];
var names = [
  'Extremamente Seco', 
  'Muito Seco',
  'Ligeiramente Seco',
  'Seca Incipiente',
  'Próximo ao Normal',
  'Úmido Incipiente',
  'Ligeiramente Úmido',
  'Moderadamente Úmido',
  'Muito Úmido',
  'Extremamente Úmido'
];

for (var i = 0; i < 10; i++) {
  legend.add(makeRow(palette[i], names[i]));
}

// Configurar mapas
function display1() {
  var map = new ui.Map();
  map.addLayer(TerraClimate1958, {palette: palette, min: -400, max: 400}, 'PDSI 1958–1987');
  map.add(legend);
  map.add(ui.Label('1958-1987', {position: 'bottom-center',fontSize:'10px'}))
  map.centerObject(shapeUrucuia, 7);
  return map;
}

function display2() {
  var map = new ui.Map();
  map.addLayer(TerraClimate1988, {palette: palette, min: -400, max: 400}, 'PDSI 1988–2017');
  map.add(ui.Label('1988-2017', {position: 'bottom-center',fontSize:'10px'}))
  map.centerObject(shapeUrucuia, 7);
  return map;
}

var maps = [display1(), display2()];
ui.root.widgets().reset(maps);
var linker = ui.Map.Linker(maps);

// Gráfico temporal
print(ui.Chart.image.series(TerraClimate, shapeUrucuia, ee.Reducer.mean(), 180));



