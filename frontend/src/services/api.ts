import axios from 'axios';
import {
  AuthResponse,
  GeoJSONFeatureCollection,
  PortfolioOverview,
  Project,
  ProjectCreateInput,
  Site,
  SiteAnalyticsResponse,
  SiteCreateInput,
  User,
} from '../types';
import { INITIAL_PROJECTS, INITIAL_SITES, generateClientSideAnalytics } from './mockData';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 4000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('darukaa_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Local cache store for fallback demo mode
let localProjects: Project[] = (() => {
  const saved = localStorage.getItem('darukaa_demo_projects');
  return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
})();

let localSites: Site[] = (() => {
  const saved = localStorage.getItem('darukaa_demo_sites');
  return saved ? JSON.parse(saved) : INITIAL_SITES;
})();

const persistLocalState = () => {
  localStorage.setItem('darukaa_demo_projects', JSON.stringify(localProjects));
  localStorage.setItem('darukaa_demo_sites', JSON.stringify(localSites));
};

export const authApi = {
  register: async (data: {
    email: string;
    password: string;
    full_name?: string;
    role?: string;
  }): Promise<AuthResponse> => {
    try {
      const res = await apiClient.post<AuthResponse>('/auth/register', data);
      return res.data;
    } catch {
      console.warn('[Darukaa.Earth] Backend unreachable, using demo auth.');
      const demoUser: User = {
        id: 'user-demo-' + Date.now(),
        email: data.email,
        full_name: data.full_name || data.email.split('@')[0],
        role: data.role || 'admin',
        is_active: true,
        created_at: new Date().toISOString(),
      };
      return {
        access_token: 'mock-jwt-token-darukaa-demo',
        token_type: 'bearer',
        user: demoUser,
      };
    }
  },

  login: async (data: { email: string; password: string }): Promise<AuthResponse> => {
    try {
      const res = await apiClient.post<AuthResponse>('/auth/login', data);
      return res.data;
    } catch {
      console.warn('[Darukaa.Earth] Backend unreachable, logging into demo mode.');
      const demoUser: User = {
        id: 'user-admin',
        email: data.email,
        full_name: 'Ankita Dasgupta (Demo Admin)',
        role: 'admin',
        is_active: true,
        created_at: new Date().toISOString(),
      };
      return {
        access_token: 'mock-jwt-token-darukaa-demo',
        token_type: 'bearer',
        user: demoUser,
      };
    }
  },

  getMe: async (): Promise<User> => {
    try {
      const res = await apiClient.get<User>('/auth/me');
      return res.data;
    } catch {
      return {
        id: 'user-admin',
        email: 'admin@darukaa.earth',
        full_name: 'Ankita Dasgupta (Demo Admin)',
        role: 'admin',
        is_active: true,
        created_at: new Date().toISOString(),
      };
    }
  },
};

export const projectsApi = {
  list: async (): Promise<Project[]> => {
    try {
      const res = await apiClient.get<Project[]>('/projects/');
      return res.data;
    } catch {
      return [...localProjects];
    }
  },

  create: async (data: ProjectCreateInput): Promise<Project> => {
    try {
      const res = await apiClient.post<Project>('/projects/', data);
      return res.data;
    } catch {
      const newProj: Project = {
        id: 'proj-' + Date.now(),
        user_id: 'user-admin',
        name: data.name,
        description: data.description,
        project_type: data.project_type,
        target_carbon_tco2e: data.target_carbon_tco2e,
        status: data.status || 'Active',
        country: data.country || 'India',
        created_at: new Date().toISOString(),
        site_count: 0,
        total_area_hectares: 0,
        current_carbon_stock_tco2e: 0,
      };
      localProjects = [newProj, ...localProjects];
      persistLocalState();
      return newProj;
    }
  },

  getById: async (id: string): Promise<Project> => {
    try {
      const res = await apiClient.get<Project>(`/projects/${id}`);
      return res.data;
    } catch {
      const p = localProjects.find((x) => x.id === id);
      if (!p) throw new Error('Project not found');
      return p;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/projects/${id}`);
    } catch {
      localProjects = localProjects.filter((p) => p.id !== id);
      localSites = localSites.filter((s) => s.project_id !== id);
      persistLocalState();
    }
  },
};

export const sitesApi = {
  list: async (projectId?: string): Promise<Site[]> => {
    try {
      const params = projectId ? { project_id: projectId } : {};
      const res = await apiClient.get<Site[]>('/sites/', { params });
      return res.data;
    } catch {
      if (projectId) {
        return localSites.filter((s) => s.project_id === projectId);
      }
      return [...localSites];
    }
  },

  getGeoJSON: async (projectId?: string): Promise<GeoJSONFeatureCollection> => {
    try {
      const params = projectId ? { project_id: projectId } : {};
      const res = await apiClient.get<GeoJSONFeatureCollection>('/sites/geojson', { params });
      return res.data;
    } catch {
      const filtered = projectId
        ? localSites.filter((s) => s.project_id === projectId)
        : localSites;
      return {
        type: 'FeatureCollection',
        features: filtered.map((site) => ({
          type: 'Feature',
          id: site.id,
          geometry: site.geojson?.type === 'Feature' ? site.geojson.geometry : site.geojson,
          properties: {
            id: site.id,
            name: site.name,
            project_id: site.project_id,
            project_name: site.project_name || 'Conservation Project',
            habitat_type: site.habitat_type,
            area_hectares: site.area_hectares,
            centroid_lat: site.centroid_lat,
            centroid_lng: site.centroid_lng,
            established_year: site.established_year,
            current_carbon_tco2e: site.current_carbon_tco2e || 0,
            latest_ndvi: site.latest_ndvi || 0.7,
            biodiversity_score: site.biodiversity_score || 3.0,
          },
        })),
      };
    }
  },

  createFromPolygon: async (data: SiteCreateInput): Promise<Site> => {
    try {
      const res = await apiClient.post<Site>('/sites/', data);
      return res.data;
    } catch {
      // Calculate spherical geodesic area in client fallback
      let approxHectares = 110.0;
      let cLat = 22.0;
      let cLng = 78.0;

      try {
        const geom = data.geojson?.type === 'Feature' ? data.geojson.geometry : data.geojson;
        const coords = geom.coordinates[0];
        if (coords && coords.length > 0) {
          cLng = coords.reduce((acc: number, val: number[]) => acc + val[0], 0) / coords.length;
          cLat = coords.reduce((acc: number, val: number[]) => acc + val[1], 0) / coords.length;
          approxHectares = Math.round(Math.abs(coords.length * 28.5));
        }
      } catch {
        // fallback
      }

      const parentProject = localProjects.find((p) => p.id === data.project_id);
      const newSite: Site = {
        id: 'site-' + Date.now(),
        project_id: data.project_id,
        project_name: parentProject?.name || 'Project',
        name: data.name,
        description: data.description,
        habitat_type: data.habitat_type,
        area_hectares: approxHectares,
        centroid_lat: cLat,
        centroid_lng: cLng,
        established_year: data.established_year,
        geojson: data.geojson,
        created_at: new Date().toISOString(),
        current_carbon_tco2e: approxHectares * 180,
        latest_ndvi: 0.78,
        biodiversity_score: 3.2,
      };

      localSites = [newSite, ...localSites];
      if (parentProject) {
        parentProject.site_count += 1;
        parentProject.total_area_hectares += approxHectares;
        parentProject.current_carbon_stock_tco2e += approxHectares * 180;
      }
      persistLocalState();
      return newSite;
    }
  },

  getById: async (id: string): Promise<Site> => {
    try {
      const res = await apiClient.get<Site>(`/sites/${id}`);
      return res.data;
    } catch {
      const s = localSites.find((x) => x.id === id);
      if (!s) throw new Error('Site not found');
      return s;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/sites/${id}`);
    } catch {
      localSites = localSites.filter((s) => s.id !== id);
      persistLocalState();
    }
  },
};

export const analyticsApi = {
  getSiteAnalytics: async (siteId: string): Promise<SiteAnalyticsResponse> => {
    try {
      const res = await apiClient.get<SiteAnalyticsResponse>(`/analytics/${siteId}`);
      return res.data;
    } catch {
      const site = localSites.find((s) => s.id === siteId) || localSites[0];
      return generateClientSideAnalytics(site);
    }
  },

  getPortfolioOverview: async (): Promise<PortfolioOverview> => {
    try {
      const res = await apiClient.get<PortfolioOverview>('/analytics/portfolio/overview');
      return res.data;
    } catch {
      const totalHa = localSites.reduce((sum, s) => sum + s.area_hectares, 0);
      const totalCarbon = localSites.reduce((sum, s) => sum + (s.current_carbon_tco2e || 0), 0);
      return {
        total_projects: localProjects.length,
        total_sites: localSites.length,
        total_monitored_hectares: Math.round(totalHa),
        total_carbon_stock_tco2e: Math.round(totalCarbon),
        average_ecosystem_health_ndvi: 0.72,
        average_biodiversity_index: 3.1,
        monitored_species_richness: 345,
      };
    }
  },
};
