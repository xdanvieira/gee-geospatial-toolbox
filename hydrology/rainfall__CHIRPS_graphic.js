////////////////////////////////////////////////////////////////////////////////
// PRECIPITAÇÃO MENSAL DO CHIRPS EM UM PONTO – GRÁFICOS MODERNOS À ESQUERDA  //
////////////////////////////////////////////////////////////////////////////////

// ========== CONFIGURAÇÃO ==========
var lat = -8.976;      // Latitude do ponto do pluviômetro (exemplo: Chorrochó)
var lon = -39.097;     // Longitude do ponto do pluviômetro
var ponto = ee.Geometry.Point([lon, lat]);

var ano_inicio = 2000; // Ano inicial da série
var ano_fim    = 2023; // Ano final da série
var scale = 5000;      // Resolução para extração (mm)

// ========== GERA LISTA DE DATAS ==========
var anos = ee.List.sequence(ano_inicio, ano_fim);
var meses = ee.List.sequence(1, 12);

// ========== EXTRAÇÃO DA SÉRIE MENSAL ==========
var dados = anos.map(function(ano) {
  ano = ee.Number(ano);
  return meses.map(function(mes) {
    mes = ee.Number(mes);
    var ini = ee.Date.fromYMD(ano, mes, 1);
    var fim = ini.advance(1, 'month');
    var ch_month = ee.ImageCollection('UCSB-CHG/CHIRPS/DAILY')
      .filterBounds(ponto)
      .filterDate(ini, fim);
    var prec_mes = ch_month.sum();
    var valor = prec_mes.reduceRegion({
      reducer: ee.Reducer.first(),
      geometry: ponto,
      scale: scale,
      maxPixels: 1e13
    }).get('precipitation');
    var data_str = ee.String(ano.format('%04d')).cat('-').cat(mes.format('%02d'));
    return ee.Feature(null, {
      'data': data_str,
      'ano': ano,
      'mes': mes,
      'precip_mm': valor
    });
  });
}).flatten();

dados = ee.FeatureCollection(dados);

// ========== EXPORTAÇÃO PARA CSV ==========
Export.table.toDrive({
  collection: dados,
  description: 'Serie_CHIRPS_Ponto',
  fileFormat: 'CSV',
  folder: 'EarthEngine/CHIRPS_Pontos'
});

// ========== PREPARA GRÁFICO MENSAL ==========
var lista_precip = dados.aggregate_array('precip_mm');
var lista_data   = dados.aggregate_array('data');

var chartData = {
  labels: lista_data.getInfo(),
  values: lista_precip.getInfo()
};

var uiChart = ui.Chart.array.values(chartData.values, 0, chartData.labels)
  .setChartType('LineChart')
  .setOptions({
    title: 'Precipitação Mensal CHIRPS',
    hAxis: {title: 'Ano-Mês', slantedText:true, slantedTextAngle: 70, showTextEvery: 12, textStyle: {fontSize:10}},
    vAxis: {title: 'Precipitação (mm)', titleTextStyle: {color:'#1565C0', fontSize:12}},
    lineWidth: 3,
    pointSize: 4,
    explorer: {axis: 'horizontal'},
    width: 340,
    height: 200,
    legend: {position: 'none'},
    series: {0: {color: '#1976D2'}},
    backgroundColor: '#fafbfc'
  });

// ========== PREPARA GRÁFICO ANUAL ==========
var mediasAno = anos.map(function(ano) {
  ano = ee.Number(ano);
  var filtro = dados.filter(ee.Filter.eq('ano', ano));
  var media = filtro.aggregate_mean('precip_mm');
  return ee.Dictionary({
    'ano': ano,
    'media_anual_mm': media
  });
});

var lista_anos = mediasAno.map(function(d) { return ee.Dictionary(d).get('ano'); }).getInfo();
var lista_medias = mediasAno.map(function(d) { return ee.Dictionary(d).get('media_anual_mm'); }).getInfo();

var chartAnual = ui.Chart.array.values(lista_medias, 0, lista_anos)
  .setChartType('ColumnChart')
  .setOptions({
    title: 'Média Anual CHIRPS',
    hAxis: {title: 'Ano', textStyle: {fontSize:11}},
    vAxis: {title: 'Precipitação Média (mm)', titleTextStyle: {color:'#388E3C', fontSize:12}},
    lineWidth: 2,
    pointSize: 4,
    width: 340,
    height: 200,
    legend: {position: 'none'},
    colors: ['#388E3C'],
    backgroundColor: '#fafbfc'
  });

// ========== MONTA O PAINEL ELEGANTE NA ESQUERDA ==========
var painel = ui.Panel({
  style: {
    width: '375px',
    padding: '10px',
    backgroundColor: '#f3f7fa',
    border: '1px solid #b6c2cf',
    position: 'top-left'
  }
});

var titulo = ui.Label('Análise de Precipitação CHIRPS', {
  fontWeight: 'bold', fontSize: '18px', color: '#195387', margin: '0 0 4px 0'
});
var subtitulo = ui.Label('Ponto: Lat ' + lat + '  Lon ' + lon, {
  fontWeight: 'bold', fontSize: '13px', color: '#1976D2', margin: '0 0 8px 0'
});

var sep1 = ui.Label('', {border: '0.5px solid #ddd', margin:'8px 0 8px 0'});
var sep2 = ui.Label('', {border: '0.5px solid #ddd', margin:'8px 0 8px 0'});

var labelMensal = ui.Label('Série Mensal', {fontWeight:'bold', fontSize:'12px', color:'#1565C0'});
var labelAnual  = ui.Label('Série Média Anual', {fontWeight:'bold', fontSize:'12px', color:'#388E3C'});

painel.add(titulo);
painel.add(subtitulo);
painel.add(sep1);
painel.add(labelMensal);
painel.add(uiChart);
painel.add(sep2);
painel.add(labelAnual);
painel.add(chartAnual);

ui.root.insert(0, painel);

// ========== VISUALIZAÇÃO NO MAPA ==========
Map.centerObject(ponto, 10);
Map.addLayer(ponto, {color:'red'}, 'Ponto do Pluviômetro');

////////////////////////////////////////////////////////////////////////////////
// O painel agora tem visual moderno, com títulos, separadores e cores.       //
////////////////////////////////////////////////////////////////////////////////
