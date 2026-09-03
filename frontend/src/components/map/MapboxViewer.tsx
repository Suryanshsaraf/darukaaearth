import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { Layers, Sparkles, Key, Check } from 'lucide-react';
import { useProjects } from '../../context/ProjectContext';

// High-Resolution Geospatial Base Maps (100% Free & Open - Zero Token Blocking)
const BASE_STYLES: Record<string, any> = {
  'satellite-streets': {
    version: 8,
    sources: {
      'esri-satellite': {
        type: 'raster',
        tiles: [
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        ],
        tileSize: 256,
        attribution: '&copy; Esri World Imagery & Earth Observation',
      },
      'carto-labels': {
        type: 'raster',
        tiles: [
          'https://a.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}@2x.png',
          'https://b.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}@2x.png',
        ],
        tileSize: 256,
      },
    },
    layers: [
      {
        id: 'esri-sat-layer',
        type: 'raster',
        source: 'esri-satellite',
        minzoom: 0,
        maxzoom: 19,
      },
      {
        id: 'carto-labels-layer',
        type: 'raster',
        source: 'carto-labels',
        minzoom: 0,
        maxzoom: 20,
      },
    ],
  },
  'dark-analytics': {
    version: 8,
    sources: {
      'carto-dark': {
        type: 'raster',
        tiles: [
          'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
          'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
          'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
        ],
        tileSize: 256,
        attribution: '&copy; CARTO Dark Matter',
      },
    },
    layers: [
      {
        id: 'carto-dark-layer',
        type: 'raster',
        source: 'carto-dark',
        minzoom: 0,
        maxzoom: 20,
      },
    ],
  },
  'outdoors-terrain': {
    version: 8,
    sources: {
      'osm-terrain': {
        type: 'raster',
        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution: '&copy; OpenStreetMap contributors',
      },
    },
    layers: [
      {
        id: 'osm-layer',
        type: 'raster',
        source: 'osm-terrain',
        minzoom: 0,
        maxzoom: 19,
      },
    ],
  },
};

const STYLE_MENU_ITEMS = [
  { id: 'satellite-streets', name: 'Satellite Imagery', icon: '🛰️' },
  { id: 'dark-analytics', name: 'Dark Analytics', icon: '🌑' },
  { id: 'outdoors-terrain', name: 'Topographic Terrain', icon: '⛰️' },
];

export const MapboxViewer: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const drawRef = useRef<any | null>(null);

  const {
    sites,
    setSelectedSiteId,
    flyToLocation,
    isDrawingMode,
    setIsDrawingMode,
    setDrawnPolygon,
  } = useProjects();

  const [currentStyleId, setCurrentStyleId] = useState<string>('satellite-streets');
  const [showStyleMenu, setShowStyleMenu] = useState<boolean>(false);
  const [customToken, setCustomToken] = useState<string>(
    localStorage.getItem('darukaa_custom_mapbox_token') || ''
  );
  const [showTokenInput, setShowTokenInput] = useState<boolean>(false);
  const [tokenSaved, setTokenSaved] = useState<boolean>(false);

  // Function to bind site polygon layers onto the active map style
  const syncSiteLayers = () => {
    const map = mapRef.current;
    if (!map) return;

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
          type: 'Feature' as const,
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
      (map.getSource('sites-source') as maplibregl.GeoJSONSource).setData(sourceData);
    } else {
      map.addSource('sites-source', {
        type: 'geojson',
        data: sourceData,
      });

      // Polygon Fill Layer
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
          'fill-opacity': 0.6,
        },
      });

      // Polygon Glowing Outline Layer
      map.addLayer({
        id: 'sites-line',
        type: 'line',
        source: 'sites-source',
        paint: {
          'line-color': '#34d399',
          'line-width': 2.5,
          'line-opacity': 0.95,
        },
      });

      // Click event on polygons
      map.on('click', 'sites-fill', (e: any) => {
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

  // Initialize Map Instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialStyle = BASE_STYLES[currentStyleId] || BASE_STYLES['satellite-streets'];

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: initialStyle,
      center: [78.9629, 20.5937], // Center of India
      zoom: 4.8,
      pitch: 25,
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left');

    // Initialize Mapbox Draw (compatible with MapLibre GL IControl)
    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true,
      },
      defaultMode: 'simple_select',
    });

    map.addControl(draw as unknown as maplibregl.IControl, 'top-right');
    drawRef.current = draw;
    mapRef.current = map;

    (map as any).on('draw.create', (e: any) => {
      const feature = e.features[0];
      if (feature) {
        setDrawnPolygon(feature);
        setIsDrawingMode(false);
      }
    });

    map.on('load', () => {
      map.resize();
      syncSiteLayers();
    });

    map.on('style.load', () => {
      syncSiteLayers();
    });

    // Ensure resize on container layout adjustments
    const resizeTimer = setTimeout(() => {
      map.resize();
    }, 300);

    return () => {
      clearTimeout(resizeTimer);
      map.remove();
    };
  }, []);

  // Update base style
  const handleStyleChange = (styleId: string) => {
    setCurrentStyleId(styleId);
    setShowStyleMenu(false);
    if (mapRef.current && BASE_STYLES[styleId]) {
      mapRef.current.setStyle(BASE_STYLES[styleId]);
    }
  };

  // Save custom Mapbox token if entered
  const handleSaveToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customToken.trim()) return;
    localStorage.setItem('darukaa_custom_mapbox_token', customToken.trim());
    setTokenSaved(true);
    setTimeout(() => {
      setTokenSaved(false);
      setShowTokenInput(false);
      window.location.reload();
    }, 800);
  };

  // Toggle Draw Mode
  useEffect(() => {
    if (!drawRef.current) return;
    if (isDrawingMode) {
      drawRef.current.changeMode('draw_polygon');
    } else {
      drawRef.current.changeMode('simple_select');
    }
  }, [isDrawingMode]);

  // Sync sites whenever list updates
  useEffect(() => {
    if (mapRef.current) {
      syncSiteLayers();
    }
  }, [sites]);

  // Handle FlyTo transitions
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
    <div className="relative w-full h-full bg-carbon-950">
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Layer Style Switcher Widget */}
      <div className="absolute top-4 left-4 z-10 space-y-2">
        <div className="relative">
          <button
            onClick={() => setShowStyleMenu(!showStyleMenu)}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-carbon-900/90 hover:bg-carbon-850 text-xs font-semibold text-slate-200 border border-emerald-900/50 backdrop-blur-md shadow-xl transition-all"
          >
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Map Layers</span>
          </button>

          {showStyleMenu && (
            <div className="absolute top-11 left-0 w-56 bg-carbon-900 border border-emerald-900/60 rounded-xl shadow-2xl p-1.5 space-y-1 backdrop-blur-md z-20">
              {STYLE_MENU_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleStyleChange(item.id)}
                  className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs transition-colors ${
                    currentStyleId === item.id
                      ? 'bg-emerald-950/80 text-emerald-400 font-semibold border border-emerald-800/40'
                      : 'text-slate-300 hover:bg-carbon-800'
                  }`}
                >
                  <span className="text-sm">{item.icon}</span>
                  <span>{item.name}</span>
                </button>
              ))}

              <div className="pt-1 border-t border-slate-800">
                <button
                  onClick={() => {
                    setShowStyleMenu(false);
                    setShowTokenInput(!showTokenInput);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-1.5 rounded-lg text-[11px] text-slate-400 hover:text-emerald-400 hover:bg-carbon-800 transition-colors"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Configure Mapbox Token</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Optional Custom Token Input Panel */}
        {showTokenInput && (
          <div className="w-64 p-3 rounded-xl bg-carbon-900/95 border border-emerald-900/60 backdrop-blur-md shadow-2xl text-xs space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between text-slate-200 font-semibold">
              <span>Mapbox Public Token</span>
              <button
                onClick={() => setShowTokenInput(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Default uses high-res satellite & carto tiles with zero token errors. You can also
              paste your own Mapbox token:
            </p>
            <form onSubmit={handleSaveToken} className="space-y-2">
              <input
                type="text"
                placeholder="pk.eyJ1Ijo..."
                value={customToken}
                onChange={(e) => setCustomToken(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded bg-carbon-850 border border-slate-700 text-slate-100 text-xs font-mono focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="w-full py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center space-x-1"
              >
                {tokenSaved ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1" />
                    <span>Applied!</span>
                  </>
                ) : (
                  <span>Apply Token</span>
                )}
              </button>
            </form>
          </div>
        )}
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
        <span className="text-slate-400">Engine: WebGL Geospatial (EPSG:4326)</span>
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
