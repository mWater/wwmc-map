import * as L from 'leaflet';

declare module 'leaflet' {
  namespace tileLayer {
    function bingLayer(key: string, options?: BingLayerOptions): BingLayer;
  }

  interface BingLayerOptions {
    imagerySet?: string;
    maxZoom?: number;
  }

  class BingLayer extends L.TileLayer {
    constructor(key: string, options?: BingLayerOptions);
  }

  namespace esri {
    function featureLayer(options: any): L.Layer;
  }

  namespace UtfGrid {
    function ajax(url: string, options?: any): L.Layer;
  }

  namespace control {
    function control(options?: L.ControlOptions): L.Control;
  }
} 