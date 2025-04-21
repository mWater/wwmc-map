import L from 'leaflet';
import * as esri from 'esri-leaflet';
import 'leaflet-utfgrid';
import 'leaflet-bing-layer';
import PopupView from './popup/PopupView';
import FlushingPopup from './popup/FlushingPopup';
import BaseLayerControlTemplate from './BaseLayerControl.hbs';
import FilterControlTemplate from './FilterControl.hbs';
import LegendControlTemplate from './LegendControl.hbs';
import SwitcherTemplate from './Switcher.hbs';
import WaterActionFilterControlTemplate from './WaterActionFilterControl.hbs';
import 'leaflet-control-geocoder';
import 'leaflet-control-layers';
import 'leaflet-control-zoom';
import 'leaflet-control-scale';
import 'leaflet-control-attribution';
import 'leaflet-control-layers-minimap';
import 'leaflet-control-layers-minimap/dist/Control.Layers.Minimap.css';
import 'leaflet-control-layers-minimap/dist/L.Control.Layers.Minimap.js';
import 'leaflet-control-layers-minimap/dist/L.Control.Layers.Minimap.css';
import 'leaflet-control-layers-minimap/dist/L.Control.Layers.Minimap.js.map';
import 'leaflet-control-layers-minimap/dist/L.Control.Layers.Minimap.d.ts';
import 'leaflet-control-layers-minimap/dist/L.Control.Layers.Minimap.d.ts.map';

// Declare esri-leaflet module
declare module 'esri-leaflet' {
    export interface EsriLeaflet {
        Geosearch: new (options?: any) => L.Control;
        featureLayer(options: any): L.Layer;
    }
    const esri: EsriLeaflet;
    export default esri;
}

// Extend Leaflet types
declare module 'leaflet' {
    namespace Control {
        interface Geocoder extends Control {
            nominatim(): Geocoder;
        }
    }

    interface Map {
        utfGrid: any;
    }

    interface Layers {
        Minimap: new (baseLayer: L.TileLayer, options?: any) => Control;
    }

    interface UtfGridStatic {
        new (url: string, options?: any): any;
    }

    interface BingLayerStatic {
        new (key: string, options?: any): L.TileLayer;
    }
}

declare global {
    interface Window {
        L: typeof L & {
            esri: import('esri-leaflet').EsriLeaflet;
            UtfGrid: L.UtfGridStatic;
            BingLayer: L.BingLayerStatic;
        };
    }
}

interface Context {
  apiUrl: string;
  tileUrl: string;
  gridUrl: string;
}

interface MapViewOptions {
  ctx: Context;
  el: string;
}

interface Filters {
  yearFilter?: string;
  water_action_type?: string;
}

export default class MapView {
  private options: MapViewOptions;
  private ctx: Context;
  private currentDisplayType: string | null;
  private currentYearFilter: string | null;
  private currentWaterActionFilter: string | null;
  private map: L.Map;
  private mapType: string;
  private baseLayer: L.TileLayer;
  private searchControl: any;
  private dataLayer!: L.TileLayer | null;
  private gridLayer: any;
  private legend!: L.Control | null;
  private legendDiv!: JQuery | null;
  private filter!: L.Control | null;
  private filterDiv!: JQuery | null;
  private mapTypeSwitcher!: L.Control | null;
  private mapTypeSwitcherDiv!: JQuery | null;
  private baseLayerControl!: L.Control | null;
  private baseLayerDiv!: JQuery | null;
  private wwmcLayer: L.Layer;
  private wwmcPloggingLayer: L.Layer | null = null;
  private wwmcGrid: L.Layer;
  private wwmcPloggingGrid: L.Layer | null = null;
  private waterActionFilterControl: L.Control;
  private baseLayers: { [key: string]: L.TileLayer } = {};
  private overlays: { [key: string]: L.Layer } = {};
  private minimap: any | null = null;
  private bingLayer: L.Layer | null = null;
  private utfgridLayer: any | null = null;
  private geocoder: any | null = null;
  private layersControl: L.Control.Layers | null = null;
  private zoomControl: L.Control.Zoom | null = null;
  private scaleControl: L.Control.Scale | null = null;
  private attributionControl: L.Control.Attribution | null = null;
  private filterControl: L.Control | null = null;
  private switcher: L.Control | null = null;

  constructor(options: MapViewOptions) {
    this.options = options;
    this.ctx = options.ctx;
    this.currentDisplayType = null;
    this.currentYearFilter = null;
    this.currentWaterActionFilter = null;

    this.map = L.map(options.el, { zoomControl: false });
    this.map.setView([37, -8], 3);

    this.mapType = 'wwmc_main';

    // Add base layer
    this.baseLayer = L.tileLayer.bingLayer("Ao26dWY2IC8PjorsJKFaoR85EPXCnCohrJdisCWXIULAXFo0JAXquGauppTMQbyU", {
      imagerySet: "Road",
      maxZoom: 19
    });
    this.map.addLayer(this.baseLayer);

    this.searchControl = new window.L.esri.Geosearch({ position: 'topright' }).addTo(this.map);

    // Add zoom control
    L.control.zoom({ position: "bottomleft" }).addTo(this.map);

    this.addLegendControl();
    this.addFilterControl(this.mapType);
    this.fetchMap(this.mapType);

    // Add WWMC layer
    this.wwmcLayer = L.esri.featureLayer({
      url: "https://services.arcgis.com/8lRhdTsQmJpOZdYc/arcgis/rest/services/WWMC/FeatureServer/0",
      style: function (feature: any) {
        return {
          color: "#ffa500",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.7
        };
      }
    });

    // Add UTFGrid layer
    this.wwmcGrid = new L.UtfGrid("https://tiles.arcgis.com/tiles/8lRhdTsQmJpOZdYc/arcgis/rest/services/WWMC/MapServer/tile/{z}/{y}/{x}", {
      resolution: 4,
      useJsonP: false
    });

    // Add controls
    this.baseLayerControl = L.control.control({
      position: 'topright'
    });
    this.filterControl = L.control.control({
      position: 'topleft'
    });
    this.waterActionFilterControl = L.control.control({
      position: 'topleft'
    });
    this.switcher = L.control.control({
      position: 'topright'
    });

    // Add controls to map
    this.map.addControl(this.baseLayerControl);
    this.map.addControl(this.filterControl);
    this.map.addControl(this.waterActionFilterControl);
    this.map.addControl(this.switcher);

    this.initializeControls();
    this.initializeLayers();
  }

  private initializeControls(): void {
    this.geocoder = (L.Control as any).Geocoder.nominatim();
    this.layersControl = L.control.layers(this.baseLayers, this.overlays);
    this.zoomControl = L.control.zoom();
    this.scaleControl = L.control.scale();
    this.attributionControl = L.control.attribution();

    if (this.geocoder) this.geocoder.addTo(this.map);
    if (this.layersControl) this.layersControl.addTo(this.map);
    if (this.zoomControl) this.zoomControl.addTo(this.map);
    if (this.scaleControl) this.scaleControl.addTo(this.map);
    if (this.attributionControl) this.attributionControl.addTo(this.map);
  }

  private initializeLayers(): void {
    // Initialize base layers
    this.baseLayers['OpenStreetMap'] = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    });

    this.baseLayers['Bing Maps'] = new window.L.BingLayer('YOUR_BING_KEY', {
      type: 'Aerial'
    });

    // Initialize overlays
    this.utfgridLayer = new window.L.UtfGrid('https://{s}.tiles.mapbox.com/v3/your-utfgrid/{z}/{x}/{y}.grid.json', {
      resolution: 4
    });

    this.overlays['UTFGrid'] = this.utfgridLayer;

    // Add default base layer
    this.baseLayers['OpenStreetMap'].addTo(this.map);
  }

  private createDataLayer(mapType: string, displayType: string, filters: Filters): void {
    if (mapType === "wwmc_main") {
      if (this.currentDisplayType === displayType && 
          this.currentYearFilter === filters.yearFilter && 
          this.mapType === mapType) {
        return;
      }
      this.currentDisplayType = displayType;
      this.currentYearFilter = filters.yearFilter || null;
    } else {
      if (this.currentDisplayType === displayType && 
          this.currentWaterActionFilter === filters.water_action_type && 
          this.mapType === mapType) {
        return;
      }
      this.currentDisplayType = displayType;
      this.currentWaterActionFilter = filters.water_action_type || null;
    }

    this.mapType = mapType;

    if (this.dataLayer) {
      this.map.removeLayer(this.dataLayer);
    }
    if (this.gridLayer) {
      this.map.removeLayer(this.gridLayer);
    }

    // Add data layer
    let url = this.ctx.tileUrl + "?type=" + this.mapType + "&display=" + displayType;
    if (filters.yearFilter) {
      url += "&year=" + filters.yearFilter;
    }
    if (filters.water_action_type) {
      url += "&water_action_type=" + filters.water_action_type;
    }

    this.dataLayer = L.tileLayer(url);
    this.dataLayer.setOpacity(0.8);

    // TODO hack for non-zoom animated tile layers
    (this.map as any)._zoomAnimated = false;
    this.map.addLayer(this.dataLayer);
    (this.map as any)._zoomAnimated = true;

    const container = this.dataLayer.getContainer();
    if (container) {
      $(container).addClass('leaflet-zoom-hide');
    }

    // Add grid layer
    url = this.ctx.gridUrl + "?type=" + this.mapType + "&display=" + displayType;
    if (filters.yearFilter) {
      url += "&year=" + filters.yearFilter;
    }
    if (filters.water_action_type) {
      url += "&water_action_type=" + filters.water_action_type;
    }
    this.gridLayer = new window.L.UtfGrid(url, { useJsonP: false });
    this.map.addLayer(this.gridLayer);

    // Handle clicks
    this.gridLayer.on('click', (ev: any) => {
      if (ev.data && ev.data.id) {
        this.handleMarkerClick(ev.data.id);
      }
    });
  }

  private handleMarkerClick(id: string): void {
    const filter = this.filterDiv?.find("#selector").val();
    if (this.mapType === 'wwmc_water_actions' && filter === 'flushing') {
      $.getJSON(this.ctx.apiUrl + "responses/" + id, (response: any) => {
        const popupView = new FlushingPopup({ ctx: this.ctx, response }).render();
        const popup = L.popup({ minWidth: 500 })
          .setLatLng(L.latLng(
            response.data['de5c721a4e0b445c8bf8cccd46cbfcc5'].value.latitude,
            response.data['de5c721a4e0b445c8bf8cccd46cbfcc5'].value.longitude
          ))
          .setContent(popupView.el);

        this.map.openPopup(popup);
      });
    } else {
      $.getJSON(this.ctx.apiUrl + "entities/surface_water/" + id, (site: any) => {
        const popupView = new PopupView({ ctx: this.ctx, site }).render();
        const popup = L.popup({ minWidth: 500 })
          .setLatLng(L.latLng(site.location.coordinates[1], site.location.coordinates[0]))
          .setContent(popupView.el);

        this.map.openPopup(popup);
      });
    }
  }

  private addBaseLayerControl(): void {
    if (this.baseLayerControl) {
      this.map.removeControl(this.baseLayerControl);
    }

    const control = L.control.control({
      position: 'topleft'
    });
    this.baseLayerControl = control;

    control.onAdd = () => {
      this.baseLayerDiv = $(BaseLayerControlTemplate({}));
      this.baseLayerDiv.find(".radio").on("click", () => {
        // Implementation if needed
      });
      return this.baseLayerDiv.get(0) as HTMLElement;
    };

    control.addTo(this.map);
  }

  private addLegendControl(): void {
    if (this.legend) {
      this.map.removeControl(this.legend);
    }

    const control = L.control.control({
      position: 'bottomright'
    });
    this.legend = control;

    control.onAdd = () => {
      this.legendDiv = $(LegendControlTemplate({}));
      this.changeLegendControl(this.mapType, "ph");

      this.legendDiv.find("#selector").on('change', (e: JQuery.Event) => {
        e.stopPropagation();
        this.fetchMap(this.mapType);
      });

      return this.legendDiv.get(0) as HTMLElement;
    };

    control.addTo(this.map);
  }

  private addMapTypeSwitcher(): void {
    if (this.mapTypeSwitcher) {
      this.map.removeControl(this.mapTypeSwitcher);
    }

    const control = L.control.control({
      position: 'topright'
    });
    this.mapTypeSwitcher = control;

    control.onAdd = () => {
      this.mapTypeSwitcherDiv = $(SwitcherTemplate({ isWaterAction: this.mapType === "wwmc_water_actions" }));

      this.mapTypeSwitcherDiv.find('#type_wwmc_main').on('click', () => {
        this.fetchMap('wwmc_main');
      });

      this.mapTypeSwitcherDiv.find('#type_wwmc_water_action').on('click', () => {
        this.fetchMap('wwmc_water_actions');
      });

      return this.mapTypeSwitcherDiv.get(0) as HTMLElement;
    };

    control.addTo(this.map);
  }

  private changeLegendControl(mapType: string, type: string): void {
    if (this.legendDiv) {
      if (mapType === "wwmc_water_actions") {
        this.legendDiv.hide();
      } else {
        const query = "type=" + mapType + "&display=" + type;
        const fullPath = this.ctx.apiUrl + "maps/legend?" + query;
        this.legendDiv.find("#legend_contents").load(fullPath);
        this.legendDiv.show();
        this.legendDiv.find(".panel-heading").show();
        this.filterDiv?.show();
      }
    }
  }

  private addFilterControl(mapType: string): void {
    const date = new Date();
    const years = Array.from({ length: date.getFullYear() - 2007 + 1 }, (_, i) => date.getFullYear() - i);

    if (this.filter) {
      this.map.removeControl(this.filter);
    }

    const control = L.control.control({
      position: 'topleft'
    });
    this.filter = control;

    let filterDiv: JQuery;
    if (mapType === "wwmc_main") {
      filterDiv = $(FilterControlTemplate({ years }));
    } else {
      filterDiv = $(WaterActionFilterControlTemplate({}));
    }

    control.onAdd = () => {
      this.filterDiv = filterDiv;

      this.filterDiv.find("#selector").on('change', (e: JQuery.Event) => {
        e.stopPropagation();
        this.fetchMap(mapType);
      });

      return this.filterDiv.get(0) as HTMLElement;
    };

    control.addTo(this.map);
  }

  private fetchMap(mapType: string): void {
    const displayType = this.legendDiv?.find("#selector").val() as string;
    const filters: Filters = {};
    const filter = this.filterDiv?.find("#selector").val() as string;

    if (mapType === 'wwmc_main') {
      filters.yearFilter = filter;
    } else if (mapType === 'wwmc_water_actions') {
      filters.water_action_type = filter || 'plogging';
    }

    if (mapType !== this.mapType) {
      this.addFilterControl(mapType);
    }

    if (displayType !== this.currentDisplayType || mapType !== this.mapType) {
      this.changeLegendControl(mapType, displayType);
    }

    this.createDataLayer(mapType, displayType, filters);
    this.addMapTypeSwitcher();
  }
} 