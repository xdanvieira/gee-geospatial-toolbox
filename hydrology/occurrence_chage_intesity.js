var gsw = ee.Image("JRC/GSW1_4/GlobalSurfaceWater");
var change = gsw.select("change_abs");

var VIS_CHAGE = {
  min: -50,
  max: 50,
  palette:['red', 'black', 'limegreen']
}


Map.addLayer({
  eeObject: change,
  visParams: VIS_CHAGE,
  name:'occurrence chage intesity'
  
});


