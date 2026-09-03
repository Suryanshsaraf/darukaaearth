import React, { useState } from 'react';
import {
  ChevronRight,
  Filter,
  MapPin,
  Search,
  SlidersHorizontal,
  Trash2,
  TreePine,
  Sparkles,
} from 'lucide-react';
import { useProjects } from '../../context/ProjectContext';
import { projectsApi, sitesApi } from '../../services/api';

export const ProjectSidebar: React.FC = () => {
  const {
    projects,
    sites,
    selectedProjectId,
    setSelectedProjectId,
    selectedSiteId,
    setSelectedSiteId,
    triggerFlyTo,
    refreshData,
  } = useProjects();

  const [searchTerm, setSearchTerm] = useState('');

  const filteredSites = sites.filter((site) => {
    const matchesProject = !selectedProjectId || site.project_id === selectedProjectId;
    const matchesSearch =
      site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      site.habitat_type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesProject && matchesSearch;
  });

  const handleDeleteProject = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this project and all its sites?')) {
      await projectsApi.delete(id);
      if (selectedProjectId === id) setSelectedProjectId(null);
      await refreshData();
    }
  };

  const handleDeleteSite = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Delete this conservation site and all historical metrics?')) {
      await sitesApi.delete(id);
      if (selectedSiteId === id) setSelectedSiteId(null);
      await refreshData();
    }
  };

  return (
    <aside className="w-80 md:w-96 h-full bg-carbon-900 border-r border-emerald-950/60 flex flex-col z-20 select-none">
      {/* Header & Filter */}
      <div className="p-4 border-b border-emerald-950/60 space-y-3 bg-carbon-850/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TreePine className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
              Conservation Portfolio
            </h2>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-800/40">
            {filteredSites.length} Sites
          </span>
        </div>

        {/* Project Selector Dropdown */}
        <div className="relative">
          <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <select
            value={selectedProjectId || ''}
            onChange={(e) => setSelectedProjectId(e.target.value || null)}
            className="w-full bg-carbon-900 text-xs text-slate-200 border border-slate-700/60 rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:border-emerald-500 transition-colors"
          >
            <option value="">All Projects ({projects.length})</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.site_count} sites)
              </option>
            ))}
          </select>
        </div>

        {/* Search Box */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search sites or habitats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-carbon-900 text-xs text-slate-200 border border-slate-700/60 rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:border-emerald-500 placeholder-slate-500"
          />
        </div>
      </div>

      {/* Selected Project Card Summary (if one is chosen) */}
      {selectedProjectId && (
        <div className="p-3 bg-carbon-800/60 border-b border-emerald-950/50">
          {(() => {
            const currentProj = projects.find((p) => p.id === selectedProjectId);
            if (!currentProj) return null;
            const pct = Math.min(
              100,
              Math.round((currentProj.current_carbon_stock_tco2e / (currentProj.target_carbon_tco2e || 1)) * 100)
            );
            return (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-emerald-300">
                    {currentProj.name}
                  </span>
                  <button
                    onClick={(e) => handleDeleteProject(e, currentProj.id)}
                    title="Delete Project"
                    className="text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2">
                  {currentProj.description}
                </p>
                <div>
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>Target: {currentProj.target_carbon_tco2e.toLocaleString()} tCO₂e</span>
                    <span className="text-emerald-400 font-mono font-bold">{pct}% Achieved</span>
                  </div>
                  <div className="w-full h-1.5 bg-carbon-950 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Sites List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50">
        {filteredSites.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            <TreePine className="w-8 h-8 mx-auto mb-2 opacity-30 text-emerald-400" />
            <p>No conservation sites found.</p>
            <p className="text-[11px] text-slate-600 mt-1">
              Click "+ Draw New Site" on the top bar to add one by drawing a polygon.
            </p>
          </div>
        ) : (
          filteredSites.map((site) => {
            const isSelected = selectedSiteId === site.id;
            return (
              <div
                key={site.id}
                onClick={() => {
                  setSelectedSiteId(site.id);
                  triggerFlyTo(site.centroid_lng, site.centroid_lat, 13);
                }}
                className={`p-3.5 cursor-pointer transition-all hover:bg-carbon-850/80 ${
                  isSelected
                    ? 'bg-emerald-950/40 border-l-4 border-emerald-400'
                    : 'bg-transparent'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xs font-semibold text-slate-100 flex items-center space-x-1.5">
                      <span>{site.name}</span>
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-carbon-800 text-emerald-400 border border-emerald-900/50">
                        {site.habitat_type}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Est. {site.established_year}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-teal-300">
                      {site.area_hectares.toFixed(1)} ha
                    </span>
                    <button
                      onClick={(e) => handleDeleteSite(e, site.id)}
                      title="Delete site"
                      className="block ml-auto text-slate-500 hover:text-rose-400 mt-1 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Metrics Pill Row */}
                <div className="grid grid-cols-3 gap-1.5 mt-2.5 pt-2 border-t border-slate-800/60 text-[10px]">
                  <div className="bg-carbon-950/60 rounded px-1.5 py-1 text-center">
                    <span className="text-slate-500 block">Carbon</span>
                    <span className="font-mono font-semibold text-emerald-400">
                      {site.current_carbon_tco2e ? `${Math.round(site.current_carbon_tco2e)}t` : '—'}
                    </span>
                  </div>
                  <div className="bg-carbon-950/60 rounded px-1.5 py-1 text-center">
                    <span className="text-slate-500 block">NDVI</span>
                    <span className="font-mono font-semibold text-lime-400">
                      {site.latest_ndvi ? site.latest_ndvi.toFixed(2) : '—'}
                    </span>
                  </div>
                  <div className="bg-carbon-950/60 rounded px-1.5 py-1 text-center">
                    <span className="text-slate-500 block">H' Bio</span>
                    <span className="font-mono font-semibold text-cyan-400">
                      {site.biodiversity_score ? site.biodiversity_score.toFixed(1) : '—'}
                    </span>
                  </div>
                </div>

                {/* Action trigger footer */}
                <div className="flex items-center justify-between mt-2 pt-1 text-[10px] text-slate-400">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerFlyTo(site.centroid_lng, site.centroid_lat, 13);
                    }}
                    className="hover:text-emerald-400 flex items-center space-x-1"
                  >
                    <MapPin className="w-3 h-3" />
                    <span>Fly to Map</span>
                  </button>

                  <span className="text-emerald-400 flex items-center space-x-0.5 hover:underline">
                    <span>Inspect Analytics</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
