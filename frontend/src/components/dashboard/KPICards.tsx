import React from 'react';
import { Activity, Bug, Layers, Sprout, TrendingUp } from 'lucide-react';
import { useProjects } from '../../context/ProjectContext';

export const KPICards: React.FC = () => {
  const { portfolio, projects, sites } = useProjects();

  const totalCarbon = portfolio?.total_carbon_stock_tco2e || 0;
  const totalHectares = portfolio?.total_monitored_hectares || 0;
  const avgNdvi = portfolio?.average_ecosystem_health_ndvi || 0.68;
  const avgShannon = portfolio?.average_biodiversity_index || 2.85;
  const totalSpecies = portfolio?.monitored_species_richness || 335;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-carbon-900/60 border-b border-emerald-950/60">
      {/* Metric 1: Carbon Stock */}
      <div className="p-3.5 rounded-xl bg-carbon-850 border border-emerald-900/30 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Total Carbon Stock
          </p>
          <div className="flex items-baseline space-x-1.5 mt-1">
            <span className="text-xl font-bold font-mono text-emerald-400">
              {totalCarbon.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400">tCO₂e</span>
          </div>
          <p className="text-[10px] text-emerald-500/90 flex items-center mt-0.5">
            <TrendingUp className="w-3 h-3 mr-1 inline" />
            +8.4% annual sequestration
          </p>
        </div>
        <div className="w-9 h-9 rounded-lg bg-emerald-950/80 border border-emerald-800/40 flex items-center justify-center text-emerald-400">
          <Sprout className="w-4 h-4" />
        </div>
      </div>

      {/* Metric 2: Monitored Hectares */}
      <div className="p-3.5 rounded-xl bg-carbon-850 border border-emerald-900/30 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Monitored Area
          </p>
          <div className="flex items-baseline space-x-1.5 mt-1">
            <span className="text-xl font-bold font-mono text-teal-300">
              {totalHectares.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400">hectares</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {projects.length} Projects • {sites.length} Active Sites
          </p>
        </div>
        <div className="w-9 h-9 rounded-lg bg-teal-950/80 border border-teal-800/40 flex items-center justify-center text-teal-300">
          <Layers className="w-4 h-4" />
        </div>
      </div>

      {/* Metric 3: Sentinel-2 NDVI */}
      <div className="p-3.5 rounded-xl bg-carbon-850 border border-emerald-900/30 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Vegetation Index (NDVI)
          </p>
          <div className="flex items-baseline space-x-1.5 mt-1">
            <span className="text-xl font-bold font-mono text-lime-400">
              {avgNdvi.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400">/ 1.00</span>
          </div>
          <p className="text-[10px] text-lime-400/90 flex items-center mt-0.5">
            <Activity className="w-3 h-3 mr-1 inline" />
            Sentinel-2 10m Multispectral
          </p>
        </div>
        <div className="w-9 h-9 rounded-lg bg-lime-950/80 border border-lime-800/40 flex items-center justify-center text-lime-400">
          <Activity className="w-4 h-4" />
        </div>
      </div>

      {/* Metric 4: Biodiversity Shannon-Wiener */}
      <div className="p-3.5 rounded-xl bg-carbon-850 border border-emerald-900/30 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Shannon Diversity (H')
          </p>
          <div className="flex items-baseline space-x-1.5 mt-1">
            <span className="text-xl font-bold font-mono text-cyan-400">
              {avgShannon.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400">index</span>
          </div>
          <p className="text-[10px] text-cyan-400/90 mt-0.5">
            {totalSpecies} Monitored Species (GBIF)
          </p>
        </div>
        <div className="w-9 h-9 rounded-lg bg-cyan-950/80 border border-cyan-800/40 flex items-center justify-center text-cyan-400">
          <Bug className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
