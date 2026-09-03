import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProjectProvider, useProjects } from './context/ProjectContext';
import { Navbar } from './components/layout/Navbar';
import { KPICards } from './components/dashboard/KPICards';
import { ProjectSidebar } from './components/dashboard/ProjectSidebar';
import { MapboxViewer } from './components/map/MapboxViewer';
import { SiteAnalyticsDrawer } from './components/analytics/SiteAnalyticsDrawer';
import { CreateProjectModal } from './components/dashboard/CreateProjectModal';
import { CreateSiteModal } from './components/dashboard/CreateSiteModal';
import { AuthModal } from './components/auth/AuthModal';

const DashboardContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { drawnPolygon, setDrawnPolygon } = useProjects();

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-carbon-950">
      {/* Top Navbar */}
      <Navbar
        onOpenNewProject={() => {
          if (!isAuthenticated) setIsAuthModalOpen(true);
          else setIsProjectModalOpen(true);
        }}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* KPI Stats Bar */}
      <KPICards />

      {/* Center Interactive Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Project & Site Selection Sidebar */}
        <ProjectSidebar />

        {/* Center Interactive Mapbox Canvas */}
        <main className="flex-1 h-full relative overflow-hidden">
          <MapboxViewer />
        </main>

        {/* Sliding Analytics Drawer (Highcharts) */}
        <SiteAnalyticsDrawer />
      </div>

      {/* Modals */}
      <CreateProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
      />

      <CreateSiteModal
        isOpen={!!drawnPolygon}
        geojson={drawnPolygon}
        onClose={() => setDrawnPolygon(null)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <DashboardContent />
      </ProjectProvider>
    </AuthProvider>
  );
}

export default App;
