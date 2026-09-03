export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  project_type: string;
  target_carbon_tco2e: number;
  status: string;
  country: string;
  created_at: string;
  site_count: number;
  total_area_hectares: number;
  current_carbon_stock_tco2e: number;
}

export interface ProjectCreateInput {
  name: string;
  description?: string;
  project_type: string;
  target_carbon_tco2e: number;
  status?: string;
  country?: string;
}

export interface Site {
  id: string;
  project_id: string;
  project_name?: string;
  name: string;
  description?: string;
  habitat_type: string;
  area_hectares: number;
  centroid_lat: number;
  centroid_lng: number;
  established_year: number;
  geojson: any;
  created_at: string;
  current_carbon_tco2e?: number;
  latest_ndvi?: number;
  biodiversity_score?: number;
}

export interface SiteCreateInput {
  project_id: string;
  name: string;
  description?: string;
  habitat_type: string;
  established_year: number;
  geojson: any;
}

export interface GeoJSONFeature {
  type: 'Feature';
  id: string;
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
  properties: {
    id: string;
    name: string;
    project_id: string;
    project_name: string;
    habitat_type: string;
    area_hectares: number;
    centroid_lat: number;
    centroid_lng: number;
    established_year: number;
    current_carbon_tco2e: number;
    latest_ndvi: number;
    biodiversity_score: number;
  };
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

export interface MetricRecord {
  record_date: string;
  carbon_stock_tco2e: number;
  sequestration_rate_tco2e_yr: number;
  ndvi_index: number;
  canopy_cover_pct: number;
  biodiversity_shannon_index: number;
  species_richness_count: number;
  soil_organic_carbon_g_kg: number;
}

export interface KPISummary {
  total_carbon_stock_tco2e: number;
  annual_sequestration_rate_tco2e: number;
  mean_ndvi: number;
  canopy_cover_percentage: number;
  shannon_diversity_index: number;
  species_richness_count: number;
  soil_organic_carbon_g_kg: number;
  carbon_density_tco2e_ha: number;
}

export interface SiteAnalyticsResponse {
  site_id: string;
  site_name: string;
  project_name: string;
  habitat_type: string;
  area_hectares: number;
  established_year: number;
  kpis: KPISummary;
  history: MetricRecord[];
  highcharts_series: {
    carbon_stock: [number, number][];
    sequestration_rate: [number, number][];
    ndvi: [number, number][];
    canopy_cover: [number, number][];
    biodiversity: [number, number][];
  };
  methodology: Record<string, string>;
}

export interface PortfolioOverview {
  total_projects: number;
  total_sites: number;
  total_monitored_hectares: number;
  total_carbon_stock_tco2e: number;
  average_ecosystem_health_ndvi: number;
  average_biodiversity_index: number;
  monitored_species_richness: number;
}
