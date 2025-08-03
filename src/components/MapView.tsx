import React, { useEffect, useRef, useState } from 'react';
import { createRoot, Root } from 'react-dom/client';
import * as L from 'leaflet';
import * as esri from 'esri-leaflet';
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
  const legendControlRef = useRef<L.Control | null>(null);
  const filterControlRef = useRef<L.Control | null>(null);
  const filterRootRef = useRef<Root | null>(null);
  const mapTypeSwitcherRef = useRef<L.Control | null>(null);

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
    addLegendControl(map);
    addFilterControl(map, mapType);
    addMapTypeSwitcher(map);
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

  const addLegendControl = (map: L.Map) => {
    if (legendControlRef.current) {
      legendControlRef.current.removeFrom(map);
    }

    const legend = new L.Control({ position: 'bottomright' });
    legend.onAdd = () => {
      const div = document.createElement('div');
      const root = createRoot(div);
      
      const changeLegendControl = (displayType: DisplayType) => {
        if (mapType !== 'wwmc_water_actions') {
          const query = `type=${mapType}&display=${displayType}`;
          const fullPath = `${ctx.apiUrl}maps/legend?${query}`;
          // Load legend content dynamically
          fetch(fullPath)
            .then(response => response.text())
            .then(html => {
              const legendContent = div.querySelector('#legend_contents');
              if (legendContent) {
                legendContent.innerHTML = html;
              }
            });
        }
      };

      root.render(
        <LegendControl
          displayType={currentDisplayType}
          onDisplayTypeChange={handleDisplayTypeChange}
          apiUrl={ctx.apiUrl}
          mapType={mapType}
        />
      );
      
      // Load initial legend
      setTimeout(() => changeLegendControl(currentDisplayType), 100);
      
      return div;
    };

    legendControlRef.current = legend;
    legend.addTo(map);
  };

  const addFilterControl = (map: L.Map, mapType: MapType) => {
    if (filterControlRef.current) {
      filterControlRef.current.removeFrom(map);
    }

    const filter = new L.Control({ position: 'bottomright' });
    filter.onAdd = () => {
      const div = document.createElement('div');
      const root = createRoot(div);
      filterRootRef.current = root;
      
      if (mapType === 'wwmc_main') {
        root.render(
          <FilterControl
            yearFilter={currentYearFilter}
            onYearFilterChange={handleYearFilterChange}
          />
        );
      } else {
        root.render(
          <WaterActionFilterControl
            yearFilter={currentYearFilter}
            actionType={currentActionType}
            onYearFilterChange={handleYearFilterChange}
            onActionTypeChange={(actionType) => setCurrentActionType(actionType)}
          />
        );
      }
      
      return div;
    };

    filterControlRef.current = filter;
    filter.addTo(map);
  };

  const addMapTypeSwitcher = (map: L.Map) => {
    if (mapTypeSwitcherRef.current) {
      mapTypeSwitcherRef.current.removeFrom(map);
    }

    const switcher = new L.Control({ position: 'topleft' });
    switcher.onAdd = () => {
      const div = document.createElement('div');
      const root = createRoot(div);
      
      root.render(
        <Switcher
          mapType={mapType}
          onMapTypeChange={handleMapTypeChange}
        />
      );
      
      return div;
    };

    mapTypeSwitcherRef.current = switcher;
    switcher.addTo(map);
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
      // Update legend control
      addLegendControl(mapInstanceRef.current);
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
      // Update controls for new map type
      addFilterControl(mapInstanceRef.current, newMapType);
      addLegendControl(mapInstanceRef.current);
      addMapTypeSwitcher(mapInstanceRef.current);
      
      const filters: Filters = { yearFilter: currentYearFilter };
      if (newMapType === 'wwmc_water_actions') {
        filters.action_type = currentActionType;
      }
      fetchMap(mapInstanceRef.current, newMapType, currentDisplayType, filters);
    }
  };

  // Update filter control UI when relevant state changes
  useEffect(() => {
    if (!filterRootRef.current) return;

    if (mapType === 'wwmc_main') {
      filterRootRef.current.render(
        <FilterControl
          yearFilter={currentYearFilter}
          onYearFilterChange={handleYearFilterChange}
        />
      );
    } else {
      filterRootRef.current.render(
        <WaterActionFilterControl
          yearFilter={currentYearFilter}
          actionType={currentActionType}
          onYearFilterChange={handleYearFilterChange}
          onActionTypeChange={(actionType) => setCurrentActionType(actionType)}
        />
      );
    }
  }, [currentYearFilter, currentActionType, mapType]);

  return (
    <div ref={mapRef} style={{ height: '100vh', width: '100vw' }} />
  );
};

export default MapView;