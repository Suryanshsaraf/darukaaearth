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

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT access token from localStorage to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('darukaa_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authApi = {
  register: async (data: { email: string; password: string; full_name?: string; role?: string }): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/register', data);
    return res.data;
  },
  login: async (data: { email: string; password: string }): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/login', data);
    return res.data;
  },
  getMe: async (): Promise<User> => {
    const res = await apiClient.get<User>('/auth/me');
    return res.data;
  },
};

// Projects API
export const projectsApi = {
  list: async (): Promise<Project[]> => {
    const res = await apiClient.get<Project[]>('/projects/');
    return res.data;
  },
  create: async (data: ProjectCreateInput): Promise<Project> => {
    const res = await apiClient.post<Project>('/projects/', data);
    return res.data;
  },
  getById: async (id: string): Promise<Project> => {
    const res = await apiClient.get<Project>(`/projects/${id}`);
    return res.data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/projects/${id}`);
  },
};

// Sites & Geospatial API
export const sitesApi = {
  list: async (projectId?: string): Promise<Site[]> => {
    const params = projectId ? { project_id: projectId } : {};
    const res = await apiClient.get<Site[]>('/sites/', { params });
    return res.data;
  },
  getGeoJSON: async (projectId?: string): Promise<GeoJSONFeatureCollection> => {
    const params = projectId ? { project_id: projectId } : {};
    const res = await apiClient.get<GeoJSONFeatureCollection>('/sites/geojson', { params });
    return res.data;
  },
  createFromPolygon: async (data: SiteCreateInput): Promise<Site> => {
    const res = await apiClient.post<Site>('/sites/', data);
    return res.data;
  },
  getById: async (id: string): Promise<Site> => {
    const res = await apiClient.get<Site>(`/sites/${id}`);
    return res.data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/sites/${id}`);
  },
};

// Analytics API
export const analyticsApi = {
  getSiteAnalytics: async (siteId: string): Promise<SiteAnalyticsResponse> => {
    const res = await apiClient.get<SiteAnalyticsResponse>(`/analytics/${siteId}`);
    return res.data;
  },
  getPortfolioOverview: async (): Promise<PortfolioOverview> => {
    const res = await apiClient.get<PortfolioOverview>('/analytics/portfolio/overview');
    return res.data;
  },
};
