MapView = require './MapView'

ctx = { 
  apiUrl: "https://api.mwater.co/v3/" 
  tileUrl: "http://{s}-api.mwater.co/v3/maps/tiles/{z}/{x}/{y}.png"
  gridUrl: "http://{s}-api.mwater.co/v3/maps/tiles/{z}/{x}/{y}.grid.json"
}

mapView = new MapView(ctx: ctx, el: "map")
