import React, { createContext, useContext, useEffect, useState } from 'react';
import { PortfolioOverview, Project, Site } from '../types';
import { analyticsApi, projectsApi, sitesApi } from '../services/api';
import { useAuth } from './AuthContext';

interface ProjectContextType {
  projects: Project[];
  sites: Site[];
  selectedProjectId: string | null;
  selectedSiteId: string | null;
  isDrawingMode: boolean;
  drawnPolygon: any | null;
  flyToLocation: { lng: number; lat: number; zoom?: number } | null;
  portfolio: PortfolioOverview | null;
  loading: boolean;
  setSelectedProjectId: (id: string | null) => void;
  setSelectedSiteId: (id: string | null) => void;
  setIsDrawingMode: (active: boolean) => void;
  setDrawnPolygon: (poly: any | null) => void;
  triggerFlyTo: (lng: number, lat: number, zoom?: number) => void;
  refreshData: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [isDrawingMode, setIsDrawingMode] = useState<boolean>(false);
  const [drawnPolygon, setDrawnPolygon] = useState<any | null>(null);
  const [flyToLocation, setFlyToLocation] = useState<{ lng: number; lat: number; zoom?: number } | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const refreshData = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const [projList, siteList, overview] = await Promise.all([
        projectsApi.list(),
        sitesApi.list(selectedProjectId || undefined),
        analyticsApi.getPortfolioOverview(),
      ]);
      setProjects(projList);
      setSites(siteList);
      setPortfolio(overview);
    } catch (err) {
      console.error('Failed to load project data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    } else {
      setProjects([]);
      setSites([]);
      setPortfolio(null);
    }
  }, [isAuthenticated, selectedProjectId]);

  const triggerFlyTo = (lng: number, lat: number, zoom = 12) => {
    setFlyToLocation({ lng, lat, zoom });
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        sites,
        selectedProjectId,
        selectedSiteId,
        isDrawingMode,
        drawnPolygon,
        flyToLocation,
        portfolio,
        loading,
        setSelectedProjectId,
        setSelectedSiteId,
        setIsDrawingMode,
        setDrawnPolygon,
        triggerFlyTo,
        refreshData,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};
