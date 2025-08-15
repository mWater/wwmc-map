import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import * as L from 'leaflet';
import * as geocoder from 'esri-leaflet-geocoder';
import LeafletMaplibreGL from '../LeafletMapLibreGL';
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
  const vectorLayerRef = useRef<any>(null);

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

    // Add search control using legacy ArcGIS REST suggest/findAddressCandidates (no token)
    const arcgisWorldUrl = 'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer';

    const customProvider: any = {
      options: {
        label: 'Places and Addresses',
        maxResults: 5
      },
      // no-op event parent methods expected by the control
      addEventParent: () => {},
      removeEventParent: () => {},
      suggestions: (text: string, _bounds: any, callback: Function) => {
        const url = `${arcgisWorldUrl}/suggest?f=json&text=${encodeURIComponent(text)}&maxSuggestions=${customProvider.options.maxResults}`;
        const controller = new AbortController();
        fetch(url, { signal: controller.signal })
          .then((r) => r.json())
          .then((json) => {
            const suggestions = (json.suggestions || [])
              .filter((s: any) => !s.isCollection)
              .slice(0, customProvider.options.maxResults)
              .map((s: any) => ({
                text: s.text,
                unformattedText: s.text,
                magicKey: s.magicKey
              }));
            callback(null, suggestions);
          })
          .catch((err) => callback(err, []));

        // Return an abortable object to satisfy control expectations
        return { abort: () => controller.abort() };
      },
      results: (text: string, magicKey: string | undefined, _bounds: any, callback: Function) => {
        const params = new URLSearchParams({
          f: 'json',
          singleLine: text,
          outSr: '4326',
          outFields: '*',
          maxLocations: String(customProvider.options.maxResults)
        });
        if (magicKey) params.set('magicKey', magicKey as string);
        const url = `${arcgisWorldUrl}/findAddressCandidates?${params.toString()}`;

        fetch(url)
          .then((r) => r.json())
          .then((json) => {
            const results = (json.candidates || []).map((c: any) => {
              const latlng = L.latLng(c.location.y, c.location.x);
              let bounds: L.LatLngBounds | undefined;
              if (c.extent) {
                const { xmin, ymin, xmax, ymax } = c.extent;
                bounds = L.latLngBounds([ymin, xmin], [ymax, xmax]);
              }
              return {
                text: c.address,
                bounds,
                score: c.score,
                latlng,
                properties: c.attributes
              };
            });
            callback(null, results);
          })
          .catch((err) => callback(err, []));
      }
    };

    const searchControl = new geocoder.Geosearch({ position: 'topright', providers: [customProvider] });
    searchControl.addTo(map);

    // Render geosearch results and zoom to them
    const searchResultsLayer = L.layerGroup().addTo(map);
    (searchControl as any).on('results', (data: any) => {
      searchResultsLayer.clearLayers();
      if (data && data.results && data.results.length) {
        for (let i = 0; i < data.results.length; i++) {
          searchResultsLayer.addLayer(L.marker(data.results[i].latlng));
        }
        const latlngs = data.results.map((r: any) => r.latlng);
        const bounds = L.latLngBounds(latlngs);
        map.fitBounds(bounds, { maxZoom: 12 });
      }
    });

    // Add zoom control
    L.control.zoom({ position: "bottomleft" }).addTo(map);

    // Initial setup
    fetchMap(map, mapType, currentDisplayType, { yearFilter: currentYearFilter });

    return () => {
      map.remove();
    };
  }, []);

  const createDataLayer = (map: L.Map, mapType: MapType, displayType: DisplayType, filters: Filters) => {
    // Remove existing vector layer
    if (vectorLayerRef.current) {
      map.removeLayer(vectorLayerRef.current);
      vectorLayerRef.current = null;
    }

    // Build vector tiles URL
    const params: Record<string, string> = { display: displayType };
    if (filters.yearFilter) {
      params.year = String(filters.yearFilter);
    }
    if (mapType === 'wwmc_water_actions') {
      const actionType = filters.action_type || 'all';
      params.action_type = actionType;
      // For backward compatibility
      if (actionType === 'all') {
        params.water_action_type = 'plogging';
      } else if (actionType === 'flushing') {
        params.water_action_type = 'flushing';
      }
    }

    const query = new URLSearchParams(params).toString();
    const typeSegment = mapType; // 'wwmc_main' | 'wwmc_water_actions'
    const tilesUrl = `${ctx.apiUrl}custom_vector_tiles/${typeSegment}/{z}/{x}/{y}?${query}`;

    // Build MapLibre style matching provided CartoCSS-like styles
    const circleRadius = 4; // marker-width: 8 => radius 4
    const defaultStrokeColor = '#ffffff';
    const defaultStrokeWidth = 1;
    const defaultOpacity = 0.8;

    const colorExpression = (() => {
      if (mapType === 'wwmc_water_actions') {
        return '#0088FF';
      }
      switch (displayType) {
        case 'visited':
          return [
            'case',
            ['==', ['get', 'visited'], true], '#0088FF',
            '#888888'
          ] as any;
        case 'ph':
          return [
            'case',
            ['!=', ['get', 'ph'], null], [
              'step', ['to-number', ['get', 'ph']],
              '#D90259', // <5
              5, '#E3625B', // [5,6)
              6, '#DF9A3F', // [6,7)
              7, '#C0AE40', // [7,8)
              8, '#9D9F56', // [8,9)
              9, '#717287', // [9,10)
              10, '#8B036A' // >=10
            ],
            '#888888' // null values
          ] as any;
        case 'dissolved_oxygen':
          return [
            'case',
            ['!=', ['get', 'dissolved_oxygen'], null], [
              'step', ['to-number', ['get', 'dissolved_oxygen']],
              '#AA0000', // <2
              2, '#AAAA00', // [2,5)
              5, '#00AA00' // >=5
            ],
            '#888888' // null values
          ] as any;
        case 'turbidity':
          return [
            'case',
            ['!=', ['get', 'turbidity'], null], [
              'step', ['to-number', ['get', 'turbidity']],
              '#beb597', // <40
              40, '#a9c197', // [40,100)
              100, '#342c1d' // >=100
            ],
            '#888888' // null values
          ] as any;
        default:
          return '#888888';
      }
    })();

    const pointsFilter = mapType === 'wwmc_water_actions'
      ? ['all', ['==', ['geometry-type'], 'Point'], ['has', 'action_type']] as any
      : ['==', ['geometry-type'], 'Point'] as any;

    const style = {
      version: 8 as const,
      sources: {
        points: {
          type: 'vector' as const,
          tiles: [tilesUrl],
          minzoom: 0,
          maxzoom: 22
        }
      },
      layers: [
        {
          id: 'points',
          type: 'circle' as const,
          source: 'points',
          'source-layer': 'main',
          paint: {
            'circle-radius': circleRadius,
            'circle-color': colorExpression,
            'circle-stroke-width': defaultStrokeWidth,
            'circle-stroke-color': defaultStrokeColor,
            'circle-opacity': defaultOpacity,
            'circle-stroke-opacity': defaultOpacity
          },
          filter: pointsFilter
        }
      ]
    };

    const maplibreLayer: any = new (LeafletMaplibreGL as any)({
      style,
      interactive: true,
      // Disable MapLibre GL's own interaction handlers to avoid fighting with Leaflet
      dragPan: false,
      scrollZoom: false,
      boxZoom: false,
      doubleClickZoom: false,
      keyboard: false,
      touchZoomRotate: false
    });

    // Reset cursor to inherit on add
    maplibreLayer.on('add', () => {
      const canvas = maplibreLayer.getCanvas?.();
      if (canvas) {
        canvas.style.cursor = 'inherit';
      }
    });

    map.addLayer(maplibreLayer);
    vectorLayerRef.current = maplibreLayer;

    // Handle clicks on points
    const glMap = maplibreLayer.getMaplibreMap?.();
    if (glMap) {
      const clickHandler = (e: any) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          const id = feature?.properties?.id || feature?.properties?._id;
          if (id) {
            handleMarkerClick(map, id);
          }
        }
      };
      glMap.on('click', 'points', clickHandler);

      // Change cursor on hover
      const enterHandler = () => { glMap.getCanvas().style.cursor = 'pointer'; };
      const leaveHandler = () => { glMap.getCanvas().style.cursor = 'inherit'; };
      glMap.on('mousemove', 'points', enterHandler);
      glMap.on('mouseleave', 'points', leaveHandler);

      // Ensure handlers are cleaned up when layer is removed
      maplibreLayer.on('remove', () => {
        try {
          glMap.off('click', 'points', clickHandler);
          glMap.off('mousemove', 'points', enterHandler);
          glMap.off('mouseleave', 'points', leaveHandler);
        } catch {}
      });
    }
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