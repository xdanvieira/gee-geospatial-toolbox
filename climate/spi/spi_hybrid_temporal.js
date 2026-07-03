// =====================================================================
// SPI HÍBRIDO TEMPORAL REAL — BAHIA
// CHIRPS observado recente + CFSv2 tendência futura
// Paleta vermelho → azul
// =====================================================================


// =====================================================
// PARÂMETROS
// =====================================================

var PARAM = {
  startForecast: ee.Date(Date.now()).update({
    day: 1,
    hour: 0,
    minute: 0,
    second: 0
  }),

  climStart: '1991-01-01',
  climEnd: '2020-12-31',

  windows: [1, 3, 6, 9],

  scale: 5000,
  minSamples: 15,
  eps: 0.01,

  // peso da tendência CFSv2 sobre a climatologia CHIRPS
  // 0.30 = conservador | 0.45 = equilibrado | 0.60 = mais agressivo
  forecastWeight: 0.45,

  // suavização apenas visual para reduzir blocos do CFSv2
  smoothRadius: 10000
};


// =====================================================
// REGIÃO — BAHIA
// =====================================================

var municipios = ee.FeatureCollection('FAO/GAUL/2015/level2')
  .filter(ee.Filter.eq('ADM0_NAME', 'Brazil'))
  .filter(ee.Filter.eq('ADM1_NAME', 'Bahia'));

var bahia = municipios.geometry();


// =====================================================
// BASES
// =====================================================

var CHIRPS = ee.ImageCollection('UCSB-CHG/CHIRPS/DAILY')
  .select('precipitation')
  .filterBounds(bahia);

var CFS = ee.ImageCollection('NOAA/CFSV2/FOR6H')
  .select('Precipitation_rate_surface_6_Hour_Average')
  .filterBounds(bahia);


// =====================================================
// FUNÇÕES AUXILIARES
// =====================================================

function monthRange(start, n) {
  start = ee.Date(start);
  n = ee.Number(n);

  return ee.List.sequence(0, n.subtract(1)).map(function(i) {
    return start.advance(ee.Number(i), 'month');
  });
}


function chirpsMonthly(start, endExclusive) {
  start = ee.Date(start).update({day: 1});
  endExclusive = ee.Date(endExclusive).update({day: 1});

  var nMonths = endExclusive.difference(start, 'month').int();
  var months = monthRange(start, nMonths);

  var imgs = months.map(function(d) {
    d = ee.Date(d);
    var next = d.advance(1, 'month');

    return CHIRPS
      .filterDate(d, next)
      .sum()
      .rename('precipitation')
      .set('system:time_start', d.millis())
      .set('month', d.get('month'))
      .set('year', d.get('year'));
  });

  return ee.ImageCollection(imgs);
}


function rollingSum(icMonthly, k) {
  icMonthly = icMonthly.sort('system:time_start');
  k = ee.Number(k);

  var list = icMonthly.toList(icMonthly.size());
  var size = list.size();

  var out = ee.List.sequence(k.subtract(1), size.subtract(1)).map(function(i) {
    i = ee.Number(i);

    var subset = list.slice(
      i.add(1).subtract(k),
      i.add(1)
    );

    var ref = ee.Image(list.get(i));
    var refDate = ee.Date(ref.get('system:time_start'));

    return ee.ImageCollection(subset)
      .sum()
      .rename('accum')
      .set('system:time_start', ref.get('system:time_start'))
      .set('month', refDate.get('month'))
      .set('year', refDate.get('year'));
  });

  return ee.ImageCollection(out);
}


function selectMonthBand(img, prefix, month) {
  var mm = ee.Number(month).format('%02d');
  var bandName = ee.String(prefix).cat(mm);
  return img.select([bandName]);
}


// =====================================================
// CHIRPS HISTÓRICO MENSAL
// =====================================================

var histMonthly = chirpsMonthly(
  PARAM.climStart,
  ee.Date(PARAM.climEnd).advance(1, 'month')
);


// =====================================================
// CLIMATOLOGIA MENSAL CHIRPS
// =====================================================

var climMeanBands = [];

for (var m = 1; m <= 12; m++) {
  var mm = ('0' + m).slice(-2);

  var meanMonth = histMonthly
    .filter(ee.Filter.calendarRange(m, m, 'month'))
    .mean()
    .rename('mean_m' + mm);

  climMeanBands.push(meanMonth);
}

var climMean12 = ee.Image.cat(climMeanBands).toFloat();


// =====================================================
// CFSv2 — 1 MÊS FUTURO COM AJUSTE CONSERVADOR
// =====================================================

function cfsOneMonthAdjusted(dateMonth) {
  dateMonth = ee.Date(dateMonth).update({day: 1});
  var next = dateMonth.advance(1, 'month');

  var month = dateMonth.get('month');

  var clim = selectMonthBand(
    climMean12,
    'mean_m',
    month
  ).rename('precipitation');

  var sel = CFS.filterDate(dateMonth, next);
  var count = sel.size();

  var rawCollection = ee.ImageCollection(
    ee.Algorithms.If(
      count.gt(0),
      sel.map(function(img) {
        return img
          .multiply(21600)
          .rename('precipitation');
      }),
      ee.ImageCollection([clim])
    )
  );

  var raw = rawCollection
    .sum()
    .rename('precipitation');

  // tendência relativa do CFSv2 em relação à climatologia CHIRPS
  var anomalyRatio = raw
    .subtract(clim)
    .divide(clim.max(1))
    .clamp(-0.8, 0.8);

  // aplica apenas parte da tendência para evitar mapa todo vermelho
  var factor = ee.Image(1).add(
    anomalyRatio.multiply(PARAM.forecastWeight)
  );

  var adjusted = ee.Image(
    ee.Algorithms.If(
      count.gt(0),
      clim.multiply(factor),
      clim
    )
  )
  .rename('precipitation')
  .set('system:time_start', dateMonth.millis())
  .set('month', month)
  .set('year', dateMonth.get('year'))
  .set('count_cfs', count);

  return adjusted;
}

var forecast1Month = cfsOneMonthAdjusted(PARAM.startForecast);


// =====================================================
// ESTATÍSTICAS HISTÓRICAS DO SPI
// =====================================================

function historicalStats(k) {
  var accum = rollingSum(histMonthly, k);

  var meanBands = [];
  var sdBands = [];

  for (var m = 1; m <= 12; m++) {
    var mm = ('0' + m).slice(-2);

    var mon = accum.filter(
      ee.Filter.calendarRange(m, m, 'month')
    );

    var count = mon.count();
    var valid = count.gte(PARAM.minSamples);

    var mean = mon.mean()
      .rename('mean_m' + mm)
      .updateMask(valid);

    var sd = mon.reduce(ee.Reducer.stdDev())
      .rename('sd_m' + mm)
      .max(PARAM.eps)
      .updateMask(valid);

    meanBands.push(mean);
    sdBands.push(sd);
  }

  return {
    mean12: ee.Image.cat(meanBands).toFloat(),
    sd12: ee.Image.cat(sdBands).toFloat()
  };
}


// =====================================================
// ACUMULADO HÍBRIDO REAL
// =====================================================

function hybridAccum(k) {
  if (k === 1) {
    return forecast1Month.rename('accum');
  }

  var obsStart = PARAM.startForecast.advance(-(k - 1), 'month');
  var obsEnd = PARAM.startForecast;

  var observedRecent = chirpsMonthly(obsStart, obsEnd)
    .sum()
    .rename('precipitation');

  var total = observedRecent
    .add(forecast1Month)
    .rename('accum');

  return total;
}


// =====================================================
// SPI HÍBRIDO TEMPORAL
// =====================================================

function forecastSPI(k) {
  var stats = historicalStats(k);

  var accum = hybridAccum(k);

  var endMonth = PARAM.startForecast.get('month');

  var mean = selectMonthBand(
    stats.mean12,
    'mean_m',
    endMonth
  );

  var sd = selectMonthBand(
    stats.sd12,
    'sd_m',
    endMonth
  );

  return accum
    .subtract(mean)
    .divide(sd)
    .rename('SPI_' + k)
    .updateMask(mean.mask().and(sd.mask()));
}


// =====================================================
// SPI FINAL
// =====================================================

var spi1 = forecastSPI(1);
var spi3 = forecastSPI(3);
var spi6 = forecastSPI(6);
var spi9 = forecastSPI(9);

var SPI = ee.Image.cat([
  spi1,
  spi3,
  spi6,
  spi9
]).clip(bahia);


// versão suavizada apenas para visualização
var SPI_VIS = SPI.focal_mean({
  radius: PARAM.smoothRadius,
  units: 'meters'
}).clip(bahia);


// =====================================================
// AGREGAÇÃO POR MUNICÍPIO
// =====================================================

var resultadoMunicipios = SPI.reduceRegions({
  collection: municipios,
  reducer: ee.Reducer.mean(),
  scale: PARAM.scale,
  tileScale: 4,
  maxPixelsPerRegion: 1e9
});


// =====================================================
// EXPORTAÇÃO CSV
// =====================================================

var nomeExport = 'SPI_HIBRIDO_TEMPORAL_REAL_BAHIA_' +
  PARAM.startForecast.format('YYYYMM').getInfo();

Export.table.toDrive({
  collection: resultadoMunicipios,
  description: nomeExport,
  fileNamePrefix: nomeExport,
  fileFormat: 'CSV'
});


// =====================================================
// VISUALIZAÇÃO
// =====================================================

Map.centerObject(bahia, 6);

Map.addLayer(
  municipios.style({
    color: '000000',
    width: 1,
    fillColor: '00000000'
  }),
  {},
  'Municípios da Bahia'
);

var visSPI = {
  min: -2.5,
  max: 2.5,
  palette: [
    '#7f0000',
    '#b30000',
    '#d7301f',
    '#fcbba1',
    '#fef0d9',
    '#e0f3f8',
    '#91bfdb',
    '#4575b4',
    '#313695'
  ]
};

// =====================================================
// CONTROLE SEGURO DA CAMADA SPI
// =====================================================

var indiceCamadaSPI = Map.layers().length();

function mostrarSPI(h) {
  if (!h) {
    return;
  }

  var novaCamada = ui.Map.Layer(
    SPI_VIS.select('SPI_' + h),
    visSPI,
    'SPI-' + h + ' híbrido temporal',
    true
  );

  Map.layers().set(indiceCamadaSPI, novaCamada);
}

mostrarSPI('3');


// =====================================================
// TOP MUNICÍPIOS SECOS E ÚMIDOS
// =====================================================

function printTop(h) {
  var prop = 'SPI_' + h;

  var validos = resultadoMunicipios
    .filter(ee.Filter.notNull([prop]));

  print(
    'Top 10 municípios mais secos — SPI-' + h,
    validos.sort(prop, true).limit(10).select(['ADM2_NAME', prop])
  );

  print(
    'Top 10 municípios mais úmidos — SPI-' + h,
    validos.sort(prop, false).limit(10).select(['ADM2_NAME', prop])
  );
}

PARAM.windows.forEach(printTop);


// =====================================================
// PAINEL
// =====================================================

var painel = ui.Panel({
  style: {
    width: '390px',
    padding: '10px',
    backgroundColor: 'white'
  }
});

painel.add(ui.Label('SPI Híbrido Temporal Real — Bahia', {
  fontWeight: 'bold',
  fontSize: '18px',
  color: '#1a237e'
}));

painel.add(ui.Label(
  'CHIRPS observado recente + CFSv2 como tendência futura',
  {
    fontSize: '12px',
    color: '#555'
  }
));

painel.add(ui.Label(
  'SPI-3 = 2 meses CHIRPS + 1 mês CFSv2 | SPI-6 = 5 meses CHIRPS + 1 mês CFSv2',
  {
    fontSize: '11px',
    color: '#555'
  }
));

painel.add(ui.Label(' '));

var seletorHorizonte = ui.Select({
  items: ['1', '3', '6', '9'],
  value: '3',
  style: {
    stretch: 'horizontal'
  }
});

seletorHorizonte.onChange(function(valor) {
  mostrarSPI(valor);
});

painel.add(ui.Label('Horizonte SPI no mapa:', {
  fontWeight: 'bold'
}));

painel.add(seletorHorizonte);
painel.add(ui.Label(' '));


// =====================================================
// MUNICÍPIO + GRÁFICO
// =====================================================

var nomesMunicipios = municipios
  .aggregate_array('ADM2_NAME')
  .distinct()
  .sort();

var seletorMunicipio = ui.Select({
  items: nomesMunicipios.getInfo(),
  placeholder: 'Escolha um município',
  style: {
    stretch: 'horizontal'
  }
});

var painelGrafico = ui.Panel();

var botaoGrafico = ui.Button({
  label: 'Gerar gráfico do município',
  style: {
    stretch: 'horizontal',
    backgroundColor: '#1a73e8',
    color: 'white'
  },
  onClick: gerarGraficoMunicipio
});

painel.add(ui.Label('Município:', {
  fontWeight: 'bold'
}));

painel.add(seletorMunicipio);
painel.add(botaoGrafico);
painel.add(painelGrafico);


function gerarGraficoMunicipio() {
  var nome = seletorMunicipio.getValue();

  if (!nome) {
    painelGrafico.clear();
    painelGrafico.add(ui.Label('Selecione um município.'));
    return;
  }

  var feat = ee.Feature(
    municipios.filter(ee.Filter.eq('ADM2_NAME', nome)).first()
  );

  var geom = feat.geometry();

  function mediaBanda(banda) {
    return SPI.select(banda).reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: geom,
      scale: PARAM.scale,
      maxPixels: 1e13,
      tileScale: 4
    }).get(banda);
  }

  var valores = ee.Array([
    mediaBanda('SPI_1'),
    mediaBanda('SPI_3'),
    mediaBanda('SPI_6'),
    mediaBanda('SPI_9')
  ]);

  var chart = ui.Chart.array.values(
    valores,
    0,
    ['1', '3', '6', '9']
  )
  .setChartType('ColumnChart')
  .setOptions({
    title: 'SPI por horizonte — ' + nome,
    hAxis: {
      title: 'Horizonte em meses'
    },
    vAxis: {
      title: 'SPI',
      viewWindow: {
        min: -3,
        max: 3
      }
    },
    legend: {
      position: 'none'
    },
    colors: ['#1a73e8']
  });

  painelGrafico.clear();
  painelGrafico.add(chart);

  Map.centerObject(feat, 9);

  Map.addLayer(
    feat.style({
      color: 'yellow',
      width: 3,
      fillColor: '00000000'
    }),
    {},
    'Município selecionado — ' + nome,
    true
  );
}


// =====================================================
// LEGENDA
// =====================================================

painel.add(ui.Label(' '));

painel.add(ui.Label('Legenda SPI', {
  fontWeight: 'bold',
  fontSize: '14px'
}));

var legenda = [
  ['#7f0000', 'Seca extrema ≤ -2.0'],
  ['#b30000', 'Seca severa -2.0 a -1.5'],
  ['#d7301f', 'Seca moderada -1.5 a -1.0'],
  ['#fcbba1', 'Seca leve -1.0 a -0.5'],
  ['#fef0d9', 'Normal -0.5 a 0.5'],
  ['#e0f3f8', 'Úmido leve 0.5 a 1.0'],
  ['#91bfdb', 'Úmido moderado 1.0 a 1.5'],
  ['#4575b4', 'Úmido severo 1.5 a 2.0'],
  ['#313695', 'Úmido extremo ≥ 2.0']
];

legenda.forEach(function(item) {
  var linha = ui.Panel({
    layout: ui.Panel.Layout.flow('horizontal'),
    style: {
      margin: '0 0 4px 0'
    }
  });

  linha.add(ui.Label('', {
    backgroundColor: item[0],
    padding: '8px',
    margin: '0 8px 0 0'
  }));

  linha.add(ui.Label(item[1]));

  painel.add(linha);
});

ui.root.insert(0, painel);


// =====================================================
// CONSOLE
// =====================================================

print('SPI híbrido temporal real carregado.');
print('Mês de previsão:', PARAM.startForecast.format('YYYY-MM'));
print('Forecast CFSv2 ajustado 1 mês:', forecast1Month);
print('SPI bruto:', SPI);
print('SPI suavizado para visualização:', SPI_VIS);
print('Resultado por município:', resultadoMunicipios);
