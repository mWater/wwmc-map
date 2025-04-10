import * as L from 'leaflet';
import 'esri-leaflet';
import 'leaflet-utfgrid';
import PopupView from './popup/PopupView';
import FlushingPopup from './popup/FlushingPopup';
import BaseLayerControlTemplate from './BaseLayerControl.hbs';
import FilterControlTemplate from './FilterControl.hbs';
import LegendControlTemplate from './LegendControl.hbs';
import SwitcherTemplate from './Switcher.hbs';
import WaterActionFilterControlTemplate from './WaterActionFilterControl.hbs';

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
  private baseLayer: L.Layer;
  private searchControl: any;
  private dataLayer: L.TileLayer | null;
  private gridLayer: any;
  private legend: L.Control | null;
  private legendDiv: JQuery | null;
  private filter: L.Control | null;
  private filterDiv: JQuery | null;
  private mapTypeSwitcher: L.Control | null;
  private mapTypeSwitcherDiv: JQuery | null;
  private baseLayerControl: L.Control | null;
  private baseLayerDiv: JQuery | null;

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
    this.baseLayer = L.bingLayer("Ao26dWY2IC8PjorsJKFaoR85EPXCnCohrJdisCWXIULAXFo0JAXquGauppTMQbyU", { type: "Road" });
    this.map.addLayer(this.baseLayer);

    this.searchControl = new L.esri.Controls.Geosearch({ position: 'topright' }).addTo(this.map);

    // Add zoom control
    L.control.zoom({ position: "bottomleft" }).addTo(this.map);

    this.addLegendControl();
    this.addFilterControl(this.mapType);
    this.fetchMap(this.mapType);
  }

  private createDataLayer(mapType: string, displayType: string, filters: Filters): void {
    if (mapType === "wwmc_main") {
      if (this.currentDisplayType === displayType && 
          this.currentYearFilter === filters.yearFilter && 
          this.mapType === mapType) {
        return;
      }
      this.currentDisplayType = displayType;
      this.currentYearFilter = filters.yearFilter;
    } else {
      if (this.currentDisplayType === displayType && 
          this.currentWaterActionFilter === filters.water_action_type && 
          this.mapType === mapType) {
        return;
      }
      this.currentDisplayType = displayType;
      this.currentWaterActionFilter = filters.water_action_type;
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

    $(this.dataLayer.getContainer()).addClass('leaflet-zoom-hide');

    // Add grid layer
    url = this.ctx.gridUrl + "?type=" + this.mapType + "&display=" + displayType;
    if (filters.yearFilter) {
      url += "&year=" + filters.yearFilter;
    }
    if (filters.water_action_type) {
      url += "&water_action_type=" + filters.water_action_type;
    }
    this.gridLayer = new L.UtfGrid(url, { useJsonP: false });
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
    this.baseLayerControl = L.control({ position: 'topright' });

    this.baseLayerControl.onAdd = (map: L.Map) => {
      this.baseLayerDiv = $(BaseLayerControlTemplate());
      this.baseLayerDiv.find(".radio").on("click", () => {
        // Implementation if needed
      });
      return this.baseLayerDiv.get(0);
    };
    this.baseLayerControl.addTo(this.map);
  }

  private addLegendControl(): void {
    if (this.legend) {
      this.legend.removeFrom(this.map);
    }

    this.legend = L.control({ position: 'bottomright' });
    this.legend.onAdd = (map: L.Map) => {
      this.legendDiv = $(LegendControlTemplate());
      this.changeLegendControl(this.mapType, "ph");

      this.legendDiv.find("#selector").on('change', (e: JQuery.Event) => {
        e.stopPropagation();
        this.fetchMap(this.mapType);
      });

      return this.legendDiv.get(0);
    };

    this.legend.addTo(this.map);
  }

  private addMapTypeSwitcher(): void {
    if (this.mapTypeSwitcher) {
      this.mapTypeSwitcher.removeFrom(this.map);
    }

    this.mapTypeSwitcher = L.control({ position: 'topleft' });
    this.mapTypeSwitcher.onAdd = (map: L.Map) => {
      this.mapTypeSwitcherDiv = $(SwitcherTemplate({ isWaterAction: this.mapType === "wwmc_water_actions" }));

      this.mapTypeSwitcherDiv.find('#type_wwmc_main').on('click', () => {
        this.fetchMap('wwmc_main');
      });

      this.mapTypeSwitcherDiv.find('#type_wwmc_water_action').on('click', () => {
        this.fetchMap('wwmc_water_actions');
      });

      return this.mapTypeSwitcherDiv.get(0);
    };

    this.mapTypeSwitcher.addTo(this.map);
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
      this.filter.removeFrom(this.map);
    }

    this.filter = L.control({ position: 'bottomright' });

    let filterDiv: JQuery;
    if (mapType === "wwmc_main") {
      filterDiv = $(FilterControlTemplate({ years }));
    } else {
      filterDiv = $(WaterActionFilterControlTemplate());
    }

    this.filter.onAdd = (map: L.Map) => {
      this.filterDiv = filterDiv;

      this.filterDiv.find("#selector").on('change', (e: JQuery.Event) => {
        e.stopPropagation();
        this.fetchMap(mapType);
      });

      return this.filterDiv.get(0);
    };

    this.filter.addTo(this.map);
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