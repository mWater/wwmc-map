MapView = require './MapView'

ctx = {

  apiUrl: "http://localhost:1234/v3/"
  tileUrl: "http://localhost:1234/v3/maps/tiles/{z}/{x}/{y}.png"
  gridUrl: "http://localhost:1234/v3/maps/tiles/{z}/{x}/{y}.grid.json"

  # apiUrl: "https://api.mwater.co/v3/"
  # tileUrl: "https://{s}-api.mwater.co/v3/maps/tiles/{z}/{x}/{y}.png"
  # gridUrl: "https://{s}-api.mwater.co/v3/maps/tiles/{z}/{x}/{y}.grid.json"
}

mapView = new MapView(ctx: ctx, el: "map")