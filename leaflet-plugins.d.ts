import * as L from 'leaflet';

declare module 'leaflet' {
  namespace control {
    function bingLayer(key: string, options?: any): L.Layer;
    function control(options?: L.ControlOptions): L.Control;
    function zoom(options?: L.ZoomOptions): L.Control.Zoom;
  }
  namespace esri {
    namespace Controls {
      class Geosearch extends L.Control {
        constructor(options?: any);
      }
    }
  }
  class UtfGrid extends L.Layer {
    constructor(url: string, options?: any);
    on(event: string, callback: (ev: any) => void, context?: any): this;
  }
} 