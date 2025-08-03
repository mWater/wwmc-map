export interface Context {
  apiUrl: string;
  tileUrl: string;
  gridUrl: string;
}

export interface Site {
  _id: string;
  location: {
    coordinates: [number, number];
  };
  photo?: {
    id: string;
  };
  [key: string]: any;
}

export interface Filters {
  yearFilter?: string;
  action_type?: string;
}

export type MapType = 'wwmc_main' | 'wwmc_water_actions';
export type DisplayType = 'ph' | 'visited' | 'turbidity' | 'dissolved_oxygen';

// Extend Leaflet types for custom controls
declare global {
  namespace L {
    namespace esri {
      namespace Controls {
        class Geosearch extends L.Control {
          constructor(options?: any);
        }
      }
    }
  }
}