import { PortfolioOverview, Project, Site, SiteAnalyticsResponse } from '../types';

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    user_id: 'user-admin',
    name: 'Sundarbans Mangrove Blue Carbon Initiative',
    description:
      'High-impact tidal mangrove restoration sequestering carbon in biomass and deep saline sediment pools in the Ganges delta.',
    project_type: 'Blue Carbon (Mangroves)',
    target_carbon_tco2e: 35000,
    status: 'Active',
    country: 'India',
    created_at: '2023-01-15T00:00:00Z',
    site_count: 1,
    total_area_hectares: 245.5,
    current_carbon_stock_tco2e: 51555,
  },
  {
    id: 'proj-2',
    user_id: 'user-admin',
    name: 'Western Ghats Biodiversity & Agroforestry Corridor',
    description:
      'Multi-strata shade-grown agroforestry corridor revitalizing endemic bird habitats and native canopy cover in Wayanad.',
    project_type: 'Agroforestry',
    target_carbon_tco2e: 18000,
    status: 'Active',
    country: 'India',
    created_at: '2023-03-20T00:00:00Z',
    site_count: 1,
    total_area_hectares: 180.2,
    current_carbon_stock_tco2e: 17119,
  },
  {
    id: 'proj-3',
    user_id: 'user-admin',
    name: 'Aravalli Native Scrubland Eco-Restoration',
    description:
      'Combating desertification in the National Capital Region by restoring native Dhau (Anogeissus pendula) scrub forests.',
    project_type: 'Reforestation',
    target_carbon_tco2e: 12000,
    status: 'Active',
    country: 'India',
    created_at: '2023-05-10T00:00:00Z',
    site_count: 1,
    total_area_hectares: 95.0,
    current_carbon_stock_tco2e: 4275,
  },
  {
    id: 'proj-4',
    user_id: 'user-admin',
    name: 'Corbett Landscape Buffer Zone Restoration',
    description:
      'Riparian buffer afforestation connecting elephant corridors and recovering native Sal forest biomass in Uttarakhand foothills.',
    project_type: 'Reforestation',
    target_carbon_tco2e: 25000,
    status: 'Active',
    country: 'India',
    created_at: '2022-11-01T00:00:00Z',
    site_count: 1,
    total_area_hectares: 310.0,
    current_carbon_stock_tco2e: 51150,
  },
];

export const INITIAL_SITES: Site[] = [
  {
    id: 'site-1',
    project_id: 'proj-1',
    project_name: 'Sundarbans Mangrove Blue Carbon Initiative',
    name: 'Gosaba Deltaic Mangrove Reserve',
    description: 'Tidal mangrove forest with Rhizophora and Avicennia species.',
    habitat_type: 'Mangrove / Blue Carbon',
    area_hectares: 245.5,
    centroid_lat: 22.164,
    centroid_lng: 88.771,
    established_year: 2021,
    current_carbon_tco2e: 51555,
    latest_ndvi: 0.81,
    biodiversity_score: 3.1,
    created_at: '2023-01-15T00:00:00Z',
    geojson: {
      type: 'Polygon',
      coordinates: [
        [
          [88.7521, 22.1843],
          [88.7915, 22.1843],
          [88.8021, 22.1482],
          [88.7612, 22.1391],
          [88.739, 22.161],
          [88.7521, 22.1843],
        ],
      ],
    },
  },
  {
    id: 'site-2',
    project_id: 'proj-2',
    project_name: 'Western Ghats Biodiversity & Agroforestry Corridor',
    name: 'Wayanad Highland Canopy Zone',
    description: 'High-elevation shade coffee agroforestry with native rainforest trees.',
    habitat_type: 'Agroforestry',
    area_hectares: 180.2,
    centroid_lat: 11.67,
    centroid_lng: 76.108,
    established_year: 2022,
    current_carbon_tco2e: 17119,
    latest_ndvi: 0.74,
    biodiversity_score: 3.6,
    created_at: '2023-03-20T00:00:00Z',
    geojson: {
      type: 'Polygon',
      coordinates: [
        [
          [76.0832, 11.6841],
          [76.1215, 11.6982],
          [76.142, 11.6671],
          [76.1011, 11.642],
          [76.071, 11.661],
          [76.0832, 11.6841],
        ],
      ],
    },
  },
  {
    id: 'site-3',
    project_id: 'proj-3',
    project_name: 'Aravalli Native Scrubland Eco-Restoration',
    name: 'Damdama Ridge Afforestation Plot',
    description: 'Restoration plot reclaiming degraded mining ravines with native Dhau.',
    habitat_type: 'Semi-Arid Scrubland',
    area_hectares: 95.0,
    centroid_lat: 28.318,
    centroid_lng: 77.102,
    established_year: 2022,
    current_carbon_tco2e: 4275,
    latest_ndvi: 0.52,
    biodiversity_score: 2.4,
    created_at: '2023-05-10T00:00:00Z',
    geojson: {
      type: 'Polygon',
      coordinates: [
        [
          [77.0812, 28.3241],
          [77.1142, 28.338],
          [77.129, 28.311],
          [77.092, 28.298],
          [77.072, 28.312],
          [77.0812, 28.3241],
        ],
      ],
    },
  },
  {
    id: 'site-4',
    project_id: 'proj-4',
    project_name: 'Corbett Landscape Buffer Zone Restoration',
    name: 'Koshi Riverbank Wildlife Corridor',
    description: 'Riparian buffer reconnecting elephant and tiger dispersal routes.',
    habitat_type: 'Tropical Moist Deciduous',
    area_hectares: 310.0,
    centroid_lat: 29.453,
    centroid_lng: 79.103,
    established_year: 2020,
    current_carbon_tco2e: 51150,
    latest_ndvi: 0.77,
    biodiversity_score: 3.4,
    created_at: '2022-11-01T00:00:00Z',
    geojson: {
      type: 'Polygon',
      coordinates: [
        [
          [79.0821, 29.4621],
          [79.119, 29.478],
          [79.138, 29.445],
          [79.098, 29.429],
          [79.068, 29.441],
          [79.0821, 29.4621],
        ],
      ],
    },
  },
];

export function generateClientSideAnalytics(site: Site): SiteAnalyticsResponse {
  const months = 36;
  const now = new Date();
  const carbonSeries: [number, number][] = [];
  const seqSeries: [number, number][] = [];
  const ndviSeries: [number, number][] = [];
  const canopySeries: [number, number][] = [];
  const bioSeries: [number, number][] = [];
  const history = [];

  const basePerHa = site.current_carbon_tco2e
    ? site.current_carbon_tco2e / site.area_hectares
    : 150;
  const growthRate = 8.5;

  for (let i = 0; i < months; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - (months - 1) + i, 1);
    const ts = d.getTime();
    const elapsed = i / 12.0;

    const density = basePerHa * 0.8 + growthRate * elapsed;
    const carbon = Math.round(density * site.area_hectares);
    const seq = Number(
      (growthRate * site.area_hectares * (1 + 0.1 * Math.sin(i * 0.5))).toFixed(1)
    );
    const ndvi = Number(
      Math.min(
        0.92,
        Math.max(
          0.35,
          0.65 + 0.12 * Math.cos(((d.getMonth() - 8) * 2 * Math.PI) / 12) + 0.01 * elapsed
        )
      ).toFixed(2)
    );
    const canopy = Math.round(Math.min(92, 60 + elapsed * 3 + ndvi * 10));
    const bio = Number(Math.min(4.0, 2.7 + 0.1 * elapsed).toFixed(2));
    const species = Math.round(60 + elapsed * 8);
    const soil = Number((28 + elapsed * 0.9).toFixed(1));

    carbonSeries.push([ts, carbon]);
    seqSeries.push([ts, seq]);
    ndviSeries.push([ts, ndvi]);
    canopySeries.push([ts, canopy]);
    bioSeries.push([ts, bio]);

    history.push({
      record_date: d.toISOString().split('T')[0],
      carbon_stock_tco2e: carbon,
      sequestration_rate_tco2e_yr: seq,
      ndvi_index: ndvi,
      canopy_cover_pct: canopy,
      biodiversity_shannon_index: bio,
      species_richness_count: species,
      soil_organic_carbon_g_kg: soil,
    });
  }

  const latest = history[history.length - 1];

  return {
    site_id: site.id,
    site_name: site.name,
    project_name: site.project_name || 'Conservation Project',
    habitat_type: site.habitat_type,
    area_hectares: site.area_hectares,
    established_year: site.established_year,
    kpis: {
      total_carbon_stock_tco2e: latest.carbon_stock_tco2e,
      annual_sequestration_rate_tco2e: latest.sequestration_rate_tco2e_yr,
      mean_ndvi: site.latest_ndvi || 0.72,
      canopy_cover_percentage: latest.canopy_cover_pct,
      shannon_diversity_index: site.biodiversity_score || 3.2,
      species_richness_count: latest.species_richness_count,
      soil_organic_carbon_g_kg: latest.soil_organic_carbon_g_kg,
      carbon_density_tco2e_ha: Number((latest.carbon_stock_tco2e / site.area_hectares).toFixed(1)),
    },
    history,
    highcharts_series: {
      carbon_stock: carbonSeries,
      sequestration_rate: seqSeries,
      ndvi: ndviSeries,
      canopy_cover: canopySeries,
      biodiversity: bioSeries,
    },
    methodology: {
      carbon_mrv:
        'IPCC Tier 2 allometrics calibrated against NASA GEDI LiDAR canopy height and above-ground biomass coefficients.',
      vegetation_index:
        'Copernicus Sentinel-2 Level-2A surface reflectance BOA (B8 - B4) / (B8 + B4).',
      biodiversity_index:
        "Shannon-Wiener diversity index H' = -sum(pi * ln(pi)) aligned with GBIF observations.",
      spatial_engine:
        'PostgreSQL PostGIS 3.4 ST_Area(geom::geography) geodesic calculation on EPSG:4326.',
    },
  };
}
