import MapView from './MapView';

interface Context {
  apiUrl: string;
  tileUrl: string;
  gridUrl: string;
}

const ctx: Context = {
  apiUrl: "https://api.mwater.co/v3/",
  tileUrl: "https://{s}-api.mwater.co/v3/maps/tiles/{z}/{x}/{y}.png",
  gridUrl: "https://{s}-api.mwater.co/v3/maps/tiles/{z}/{x}/{y}.grid.json"
};

const mapView = new MapView({ ctx, el: "map" }); 