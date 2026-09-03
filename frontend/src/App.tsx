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

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[Darukaa.Earth ErrorBoundary]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-carbon-950 text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-900/40 border border-red-500/50 flex items-center justify-center text-red-400 text-2xl font-bold">
            !
          </div>
          <h1 className="text-xl font-bold text-white">Platform Initialization Notice</h1>
          <p className="text-xs text-slate-400 max-w-md">
            {this.state.error?.message || 'An unexpected rendering error occurred.'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition-colors"
          >
            Reload Dashboard
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

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
          <ErrorBoundary>
            <MapboxViewer />
          </ErrorBoundary>
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

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};

export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ProjectProvider>
          <DashboardContent />
        </ProjectProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
