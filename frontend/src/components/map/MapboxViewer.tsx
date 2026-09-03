import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { Layers, Sparkles } from 'lucide-react';
import { useProjects } from '../../context/ProjectContext';

// Default Mapbox public token
const MAPBOX_TOKEN =
  import.meta.env.VITE_MAPBOX_TOKEN ||
  'pk.eyJ1Ijoic3VyeWFuc2hzYXJhZiIsImEiOiJjbTdtOGUxdXowMWdsMm5zYWdtOWlhMG5yIn0.rT_k8G8Q8K23q';

mapboxgl.accessToken = MAPBOX_TOKEN;

const MAP_STYLES = [
  { id: 'satellite-streets-v12', name: 'Satellite Imagery', icon: '🛰️' },
  { id: 'dark-v11', name: 'Dark Analytics', icon: '🌑' },
  { id: 'outdoors-v12', name: 'Topographic Terrain', icon: '⛰️' },
];

export const MapboxViewer: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const drawRef = useRef<MapboxDraw | null>(null);

  const {
    sites,
    setSelectedSiteId,
    flyToLocation,
    isDrawingMode,
    setIsDrawingMode,
    setDrawnPolygon,
  } = useProjects();

  const [currentStyle, setCurrentStyle] = useState<string>('satellite-streets-v12');
  const [showStyleMenu, setShowStyleMenu] = useState<boolean>(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: `mapbox://styles/mapbox/${currentStyle}`,
      center: [78.9629, 20.5937], // Center of India
      zoom: 4.8,
      pitch: 30,
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.addControl(new mapboxgl.ScaleControl({ unit: 'metric' }), 'bottom-left');

    // Initialize Mapbox Draw
    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true,
      },
      defaultMode: 'simple_select',
    });

    map.addControl(draw, 'top-right');
    drawRef.current = draw;
    mapRef.current = map;

    map.on('draw.create', (e: any) => {
      const feature = e.features[0];
      if (feature) {
        setDrawnPolygon(feature);
        setIsDrawingMode(false);
      }
    });

    return () => {
      map.remove();
    };
  }, []);

  // Switch Base Style
  const handleStyleChange = (styleId: string) => {
    setCurrentStyle(styleId);
    setShowStyleMenu(false);
    if (mapRef.current) {
      mapRef.current.setStyle(`mapbox://styles/mapbox/${styleId}`);
    }
  };

  // Toggle Mapbox Draw Mode
  useEffect(() => {
    if (!drawRef.current) return;
    if (isDrawingMode) {
      drawRef.current.changeMode('draw_polygon');
    } else {
      drawRef.current.changeMode('simple_select');
    }
  }, [isDrawingMode]);

  // Sync Site Polygons on Map
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const updateLayers = () => {
      // Build GeoJSON features collection from sites
      const features = sites
        .map((site) => {
          let geometry = site.geojson;
          if (typeof geometry === 'string') {
            try {
              geometry = JSON.parse(geometry);
            } catch {
              geometry = null;
            }
          }
          if (geometry?.type === 'Feature') {
            geometry = geometry.geometry;
          }

          return {
            type: 'Feature',
            id: site.id,
            geometry,
            properties: {
              id: site.id,
              name: site.name,
              habitat_type: site.habitat_type,
              area_hectares: site.area_hectares,
              carbon: site.current_carbon_tco2e || 0,
              ndvi: site.latest_ndvi || 0,
            },
          };
        })
        .filter((f) => f.geometry);

      const sourceData: any = {
        type: 'FeatureCollection',
        features,
      };

      if (map.getSource('sites-source')) {
        (map.getSource('sites-source') as mapboxgl.GeoJSONSource).setData(sourceData);
      } else {
        map.addSource('sites-source', {
          type: 'geojson',
          data: sourceData,
        });

        // Fill Layer
        map.addLayer({
          id: 'sites-fill',
          type: 'fill',
          source: 'sites-source',
          paint: {
            'fill-color': [
              'match',
              ['get', 'habitat_type'],
              'Mangrove / Blue Carbon',
              '#06b6d4', // Cyan
              'Tropical Moist Deciduous',
              '#10b981', // Emerald
              'Agroforestry',
              '#84cc16', // Lime
              'Peatland / Wetland',
              '#3b82f6', // Blue
              '#f59e0b', // Amber default
            ],
            'fill-opacity': 0.55,
          },
        });

        // Outline Glow Layer
        map.addLayer({
          id: 'sites-line',
          type: 'line',
          source: 'sites-source',
          paint: {
            'line-color': '#34d399',
            'line-width': 2.5,
            'line-opacity': 0.9,
          },
        });

        // Hover & Click Interactions
        map.on('click', 'sites-fill', (e) => {
          if (e.features && e.features[0]) {
            const siteId = e.features[0].properties?.id;
            if (siteId) {
              setSelectedSiteId(siteId);
            }
          }
        });

        map.on('mouseenter', 'sites-fill', () => {
          map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', 'sites-fill', () => {
          map.getCanvas().style.cursor = '';
        });
      }
    };

    if (map.isStyleLoaded()) {
      updateLayers();
    } else {
      map.on('style.load', updateLayers);
    }
  }, [sites, currentStyle]);

  // Handle FlyTo
  useEffect(() => {
    if (mapRef.current && flyToLocation) {
      mapRef.current.flyTo({
        center: [flyToLocation.lng, flyToLocation.lat],
        zoom: flyToLocation.zoom || 13,
        pitch: 45,
        bearing: 15,
        essential: true,
        duration: 2000,
      });
    }
  }, [flyToLocation]);

  return (
    <div className="relative w-full h-full">
      {/* Mapbox Canvas */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Layer Style Switcher Floating Widget */}
      <div className="absolute top-4 left-4 z-10">
        <div className="relative">
          <button
            onClick={() => setShowStyleMenu(!showStyleMenu)}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-carbon-900/90 hover:bg-carbon-850 text-xs font-semibold text-slate-200 border border-emerald-900/50 backdrop-blur-md shadow-xl transition-all"
          >
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Map Layers</span>
          </button>

          {showStyleMenu && (
            <div className="absolute top-11 left-0 w-52 bg-carbon-900 border border-emerald-900/60 rounded-xl shadow-2xl p-1.5 space-y-1 backdrop-blur-md z-20">
              {MAP_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => handleStyleChange(style.id)}
                  className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs transition-colors ${
                    currentStyle === style.id
                      ? 'bg-emerald-950/80 text-emerald-400 font-semibold border border-emerald-800/40'
                      : 'text-slate-300 hover:bg-carbon-800'
                  }`}
                >
                  <span className="text-sm">{style.icon}</span>
                  <span>{style.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Drawing Instructions Alert Badge */}
      {isDrawingMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-full bg-amber-500 text-carbon-950 text-xs font-bold shadow-2xl flex items-center space-x-2 animate-bounce">
          <Sparkles className="w-4 h-4" />
          <span>Click on the map to draw polygon vertices. Double-click to complete.</span>
        </div>
      )}

      {/* Legend & Projection pill */}
      <div className="absolute bottom-6 right-4 z-10 hidden md:flex items-center space-x-4 px-3 py-1.5 rounded-lg bg-carbon-900/85 backdrop-blur-md border border-slate-800 text-[11px] text-slate-300 shadow-lg">
        <span className="text-slate-400">Projection: EPSG:4326 (WGS84)</span>
        <span className="text-slate-700">|</span>
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4] inline-block" />
            <span>Mangrove</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] inline-block" />
            <span>Deciduous</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#84cc16] inline-block" />
            <span>Agroforestry</span>
          </span>
        </div>
      </div>
    </div>
  );
};
