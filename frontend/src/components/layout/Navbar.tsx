import React from 'react';
import { Globe2, Leaf, LogOut, PlusCircle, Sparkles, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProjects } from '../../context/ProjectContext';

interface NavbarProps {
  onOpenNewProject: () => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenNewProject, onOpenAuth }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { portfolio, isDrawingMode, setIsDrawingMode } = useProjects();

  return (
    <header className="h-16 bg-carbon-900/90 backdrop-blur-md border-b border-emerald-900/30 px-6 flex items-center justify-between z-30 relative select-none">
      {/* Brand */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-950/50">
          <Leaf className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-white bg-clip-text text-transparent">
              Darukaa.Earth
            </span>
            <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60">
              MRV Geospatial
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            Carbon & Biodiversity Earth Observation Platform
          </p>
        </div>
      </div>

      {/* Center Portfolio Stats Pill (if available) */}
      {portfolio && (
        <div className="hidden lg:flex items-center space-x-6 px-4 py-1.5 rounded-full bg-carbon-850/80 border border-slate-800 text-xs text-slate-300">
          <div className="flex items-center space-x-2">
            <Globe2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Monitored:</span>
            <strong className="text-emerald-400 font-mono">
              {portfolio.total_monitored_hectares.toLocaleString()} ha
            </strong>
          </div>
          <span className="text-slate-700">•</span>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>Carbon Stock:</span>
            <strong className="text-teal-300 font-mono">
              {portfolio.total_carbon_stock_tco2e.toLocaleString()} tCO₂e
            </strong>
          </div>
        </div>
      )}

      {/* Action Controls */}
      <div className="flex items-center space-x-3">
        {isAuthenticated ? (
          <>
            {/* Draw Polygon Toggle Button */}
            <button
              onClick={() => setIsDrawingMode(!isDrawingMode)}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm ${
                isDrawingMode
                  ? 'bg-amber-500 hover:bg-amber-600 text-carbon-950 font-bold ring-2 ring-amber-400 animate-pulse'
                  : 'bg-carbon-800 hover:bg-carbon-700 text-emerald-400 border border-emerald-900/50'
              }`}
            >
              <Leaf className="w-3.5 h-3.5" />
              <span>{isDrawingMode ? 'Drawing Active (Click Map)' : '+ Draw New Site'}</span>
            </button>

            {/* Create Project Button */}
            <button
              onClick={onOpenNewProject}
              className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-md shadow-emerald-900/40"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Project</span>
            </button>

            {/* User Profile / Logout */}
            <div className="flex items-center space-x-2 pl-3 border-l border-slate-800">
              <div className="text-right hidden md:block">
                <p className="text-xs font-medium text-slate-200">{user?.full_name}</p>
                <p className="text-[10px] text-emerald-400 uppercase tracking-wider">{user?.role}</p>
              </div>
              <button
                onClick={logout}
                title="Sign Out"
                className="p-2 rounded-lg bg-carbon-800 hover:bg-rose-950/40 hover:text-rose-400 text-slate-400 border border-slate-800 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-900/40"
          >
            <UserCheck className="w-4 h-4" />
            <span>Sign In / Demo</span>
          </button>
        )}
      </div>
    </header>
  );
};
