import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import * as L from 'leaflet';
import * as geocoder from 'esri-leaflet-geocoder';
import { UtfGrid } from '../leaflet-utfgrid';
import { Context, Site, Filters, MapType, DisplayType } from '../types';
import PopupView from './popup/PopupView';
import LegendControl from './controls/LegendControl';
import FilterControl from './controls/FilterControl';
import WaterActionFilterControl from './controls/WaterActionFilterControl';
import Switcher from './controls/Switcher';

interface MapViewProps {
  ctx: Context;
}

const MapView: React.FC<MapViewProps> = ({ ctx }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const dataLayerRef = useRef<L.TileLayer | null>(null);
  const gridLayerRef = useRef<any>(null);

  const [mapType, setMapType] = useState<MapType>('wwmc_main');
  const [currentDisplayType, setCurrentDisplayType] = useState<DisplayType>('ph');
  const [currentYearFilter, setCurrentYearFilter] = useState<string>('');
  const [currentActionType, setCurrentActionType] = useState<string>('all');

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current, { zoomControl: false });
    map.setView([37, -8], 3);
    mapInstanceRef.current = map;

    // Add base layer
    const baseLayer = L.tileLayer("https://api.maptiler.com/maps/openstreetmap/256/{z}/{x}/{y}.jpg?key=QCTs345zI3Dm8x1hv3m3");
    map.addLayer(baseLayer);

    // Add search control
    const searchControl = new geocoder.Geosearch({ position: 'topright' });
    searchControl.addTo(map);

    // Add zoom control
    L.control.zoom({ position: "bottomleft" }).addTo(map);

    // Initial setup
    fetchMap(map, mapType, currentDisplayType, { yearFilter: currentYearFilter });

    return () => {
      map.remove();
    };
  }, []);

  const createDataLayer = (map: L.Map, mapType: MapType, displayType: DisplayType, filters: Filters) => {
    // Remove existing layers
    if (dataLayerRef.current) {
      map.removeLayer(dataLayerRef.current);
    }
    if (gridLayerRef.current) {
      map.removeLayer(gridLayerRef.current);
    }

    // Build URL for tile layer
    let url = ctx.tileUrl + "?type=" + mapType + "&display=" + displayType;
    if (filters.yearFilter) {
      url += "&year=" + filters.yearFilter;
    }
    if (mapType === 'wwmc_water_actions') {
      const actionType = filters.action_type || 'all';
      url += "&action_type=" + actionType;
      // For backward compatibility
      if (actionType === 'all') {
        url += "&water_action_type=plogging";
      } else if (actionType === 'flushing') {
        url += "&water_action_type=flushing";
      }
    }

    // Add data layer
    const dataLayer = L.tileLayer(url);
    dataLayer.setOpacity(0.8);
    dataLayerRef.current = dataLayer;

    // TODO hack for non-zoom animated tile layers
    (map as any)._zoomAnimated = false;
    map.addLayer(dataLayer);
    (map as any)._zoomAnimated = true;

    // Add grid layer
    let gridUrl = ctx.gridUrl + "?type=" + mapType + "&display=" + displayType;
    if (filters.yearFilter) {
      gridUrl += "&year=" + filters.yearFilter;
    }
    if (mapType === 'wwmc_water_actions') {
      const actionType = filters.action_type || 'all';
      gridUrl += "&action_type=" + actionType;
      // For backward compatibility
      if (actionType === 'all') {
        gridUrl += "&water_action_type=plogging";
      } else if (actionType === 'flushing') {
        gridUrl += "&water_action_type=flushing";
      }
    }

    const gridLayer = new (UtfGrid as any)(gridUrl, { useJsonP: false });
    gridLayerRef.current = gridLayer;
    map.addLayer(gridLayer);

    // Handle clicks
    gridLayer.on('click', (ev: any) => {
      if (ev.data && ev.data.id) {
        handleMarkerClick(map, ev.data.id);
      }
    });
  };

  const handleMarkerClick = async (map: L.Map, id: string) => {
    try {
      const response = await fetch(`${ctx.apiUrl}entities/surface_water/${id}`);
      const site: Site = await response.json();

      // Create and show popup
      const popupElement = document.createElement('div');
      const root = createRoot(popupElement);
      
      root.render(<PopupView ctx={ctx} site={site} />);
      
      const popup = L.popup({ minWidth: 500 })
        .setLatLng(L.latLng(site.location.coordinates[1], site.location.coordinates[0]))
        .setContent(popupElement);

      map.openPopup(popup);
    } catch (error) {
      console.error('Error fetching site data:', error);
    }
  };

  const fetchMap = (map: L.Map, mapType: MapType, displayType?: DisplayType, filters?: Filters) => {
    const actualDisplayType = displayType || currentDisplayType;
    const actualFilters = filters || { yearFilter: currentYearFilter };

    if (mapType === 'wwmc_water_actions') {
      actualFilters.action_type = currentActionType;
    }

    createDataLayer(map, mapType, actualDisplayType, actualFilters);
  };

  const handleDisplayTypeChange = (newDisplayType: DisplayType) => {
    setCurrentDisplayType(newDisplayType);
    if (mapInstanceRef.current) {
      fetchMap(mapInstanceRef.current, mapType, newDisplayType);
    }
  };

  const handleYearFilterChange = (yearFilter: string) => {
    setCurrentYearFilter(yearFilter);
    if (mapInstanceRef.current) {
      const filters: Filters = { yearFilter };
      if (mapType === 'wwmc_water_actions') {
        filters.action_type = currentActionType;
      }
      fetchMap(mapInstanceRef.current, mapType, currentDisplayType, filters);
    }
  };

  const handleMapTypeChange = (newMapType: MapType) => {
    setMapType(newMapType);
    if (mapInstanceRef.current) {
      const filters: Filters = { yearFilter: currentYearFilter };
      if (newMapType === 'wwmc_water_actions') {
        filters.action_type = currentActionType;
      }
      fetchMap(mapInstanceRef.current, newMapType, currentDisplayType, filters);
    }
  };



  return (
    <div style={{ position: 'relative', height: '100vh', width: '100vw' }}>
      {/* The map takes full space */}
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
      
      {/* Controls as absolutely positioned React components */}
      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 1000 }}>
        <Switcher
          mapType={mapType}
          onMapTypeChange={handleMapTypeChange}
        />
      </div>
      
      <div style={{ 
        position: 'absolute', 
        bottom: 20, 
        right: 10, 
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {/* Filter control on top */}
        <div>
          {mapType === 'wwmc_main' ? (
            <FilterControl
              yearFilter={currentYearFilter}
              onYearFilterChange={handleYearFilterChange}
            />
          ) : (
            <WaterActionFilterControl
              yearFilter={currentYearFilter}
              actionType={currentActionType}
              onYearFilterChange={handleYearFilterChange}
              onActionTypeChange={setCurrentActionType}
            />
          )}
        </div>
        
        {/* Legend control on bottom */}
        {mapType === 'wwmc_main' && (
        <div>
          <LegendControl
            displayType={currentDisplayType}
            onDisplayTypeChange={handleDisplayTypeChange}
            apiUrl={ctx.apiUrl}
            mapType={mapType}
          />
        </div>
        )}
      </div>
    </div>
  );
};

export default MapView;