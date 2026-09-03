import React, { useEffect, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import {
  Activity,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Layers,
  Leaf,
  ShieldCheck,
  X,
} from 'lucide-react';
import { analyticsApi } from '../../services/api';
import { SiteAnalyticsResponse } from '../../types';
import { useProjects } from '../../context/ProjectContext';

export const SiteAnalyticsDrawer: React.FC = () => {
  const { selectedSiteId, setSelectedSiteId } = useProjects();
  const [data, setData] = useState<SiteAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<
    'carbon' | 'vegetation' | 'biodiversity' | 'methodology'
  >('carbon');

  useEffect(() => {
    if (!selectedSiteId) {
      setData(null);
      return;
    }

    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const response = await analyticsApi.getSiteAnalytics(selectedSiteId);
        setData(response);
      } catch (err) {
        console.error('Failed to load site analytics', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [selectedSiteId]);

  if (!selectedSiteId) return null;

  // Chart 1: Carbon Stock & Sequestration Velocity (Dual Axis Area + Line)
  const carbonChartOptions: Highcharts.Options = {
    chart: {
      backgroundColor: 'transparent',
      type: 'areaspline',
      style: { fontFamily: 'Plus Jakarta Sans, sans-serif' },
    },
    title: { text: undefined },
    xAxis: {
      type: 'datetime',
      labels: { style: { color: '#94a3b8', fontSize: '11px' } },
      lineColor: '#334155',
      tickColor: '#334155',
    },
    yAxis: [
      {
        title: {
          text: 'Cumulative Carbon Stock (tCO₂e)',
          style: { color: '#10b981', fontSize: '11px' },
        },
        labels: { style: { color: '#94a3b8' } },
        gridLineColor: '#1e293b',
      },
      {
        title: {
          text: 'Sequestration Velocity (tCO₂e/yr)',
          style: { color: '#38bdf8', fontSize: '11px' },
        },
        labels: { style: { color: '#38bdf8' } },
        opposite: true,
        gridLineWidth: 0,
      },
    ],
    tooltip: {
      shared: true,
      backgroundColor: '#0f172a',
      borderColor: '#334155',
      borderRadius: 8,
      style: { color: '#f8fafc', fontSize: '12px' },
    },
    credits: { enabled: false },
    legend: {
      itemStyle: { color: '#cbd5e1', fontSize: '11px' },
      itemHoverStyle: { color: '#10b981' },
    },
    series: [
      {
        type: 'areaspline',
        name: 'Cumulative Carbon Stock',
        data: data?.highcharts_series?.carbon_stock || [],
        color: '#10b981',
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, 'rgba(16, 185, 129, 0.45)'],
            [1, 'rgba(16, 185, 129, 0.0)'],
          ],
        },
        yAxis: 0,
      },
      {
        type: 'spline',
        name: 'Annual Sequestration Rate',
        data: data?.highcharts_series?.sequestration_rate || [],
        color: '#38bdf8',
        dashStyle: 'ShortDash',
        yAxis: 1,
      },
    ],
  };

  // Chart 2: NDVI Seasonal Cycle & Canopy Cover
  const vegetationChartOptions: Highcharts.Options = {
    chart: {
      backgroundColor: 'transparent',
      type: 'spline',
      style: { fontFamily: 'Plus Jakarta Sans, sans-serif' },
    },
    title: { text: undefined },
    xAxis: {
      type: 'datetime',
      labels: { style: { color: '#94a3b8', fontSize: '11px' } },
      lineColor: '#334155',
    },
    yAxis: [
      {
        title: {
          text: 'Sentinel-2 NDVI Index',
          style: { color: '#a3e635', fontSize: '11px' },
        },
        min: 0,
        max: 1.0,
        labels: { style: { color: '#a3e635' } },
        gridLineColor: '#1e293b',
      },
      {
        title: {
          text: 'Canopy Density (%)',
          style: { color: '#2dd4bf', fontSize: '11px' },
        },
        min: 0,
        max: 100,
        labels: { style: { color: '#2dd4bf' } },
        opposite: true,
        gridLineWidth: 0,
      },
    ],
    tooltip: {
      shared: true,
      backgroundColor: '#0f172a',
      borderColor: '#334155',
      borderRadius: 8,
      style: { color: '#f8fafc' },
    },
    credits: { enabled: false },
    legend: {
      itemStyle: { color: '#cbd5e1', fontSize: '11px' },
    },
    series: [
      {
        type: 'spline',
        name: 'NDVI Vegetation Index',
        data: data?.highcharts_series?.ndvi || [],
        color: '#a3e635',
        yAxis: 0,
      },
      {
        type: 'areaspline',
        name: 'Canopy Cover %',
        data: data?.highcharts_series?.canopy_cover || [],
        color: '#2dd4bf',
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, 'rgba(45, 212, 191, 0.3)'],
            [1, 'rgba(45, 212, 191, 0.0)'],
          ],
        },
        yAxis: 1,
      },
    ],
  };

  // Chart 3: Biodiversity Shannon-Wiener Index Over Time
  const biodiversityChartOptions: Highcharts.Options = {
    chart: {
      backgroundColor: 'transparent',
      type: 'spline',
      style: { fontFamily: 'Plus Jakarta Sans, sans-serif' },
    },
    title: { text: undefined },
    xAxis: {
      type: 'datetime',
      labels: { style: { color: '#94a3b8', fontSize: '11px' } },
      lineColor: '#334155',
    },
    yAxis: {
      title: {
        text: "Shannon-Wiener Biodiversity Index (H')",
        style: { color: '#06b6d4', fontSize: '11px' },
      },
      min: 1.0,
      max: 4.5,
      gridLineColor: '#1e293b',
      labels: { style: { color: '#94a3b8' } },
    },
    tooltip: {
      backgroundColor: '#0f172a',
      borderColor: '#334155',
      borderRadius: 8,
      style: { color: '#f8fafc' },
    },
    credits: { enabled: false },
    series: [
      {
        type: 'areaspline',
        name: "Shannon Diversity Index (H')",
        data: data?.highcharts_series?.biodiversity || [],
        color: '#06b6d4',
        fillColor: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0, 'rgba(6, 182, 212, 0.4)'],
            [1, 'rgba(6, 182, 212, 0.0)'],
          ],
        },
      },
    ],
  };

  return (
    <aside className="fixed inset-y-0 right-0 w-full sm:w-[540px] md:w-[620px] bg-carbon-900 border-l border-emerald-900/60 shadow-2xl z-40 flex flex-col backdrop-blur-xl select-none animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-5 border-b border-emerald-950/80 bg-carbon-850/70 flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-800/60">
              {data?.habitat_type || 'Conservation Site'}
            </span>
            <span className="text-xs text-slate-400">• {data?.project_name}</span>
          </div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
            <span>{data?.site_name || 'Site Analytics'}</span>
          </h2>
          <div className="flex items-center space-x-3 text-xs text-slate-400">
            <span className="flex items-center space-x-1">
              <Layers className="w-3.5 h-3.5 text-teal-400" />
              <strong className="font-mono text-teal-300">
                {data?.area_hectares.toFixed(1)} ha
              </strong>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Est. {data?.established_year}</span>
            </span>
          </div>
        </div>

        <button
          onClick={() => setSelectedSiteId(null)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-carbon-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Drawer Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center space-y-3 text-slate-400">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs">Computing MRV metrics & querying PostGIS...</p>
          </div>
        ) : data ? (
          <>
            {/* KPI Metric Summary Grid */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 rounded-xl bg-carbon-850 border border-emerald-950/60">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                  Carbon Stock
                </span>
                <span className="text-base font-bold font-mono text-emerald-400">
                  {Math.round(data.kpis.total_carbon_stock_tco2e).toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 ml-1">tCO₂e</span>
                <p className="text-[10px] text-emerald-500/80 mt-0.5 font-mono">
                  {data.kpis.carbon_density_tco2e_ha} t/ha
                </p>
              </div>

              <div className="p-3 rounded-xl bg-carbon-850 border border-emerald-950/60">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                  Annual Sequestration
                </span>
                <span className="text-base font-bold font-mono text-sky-400">
                  +{data.kpis.annual_sequestration_rate_tco2e.toFixed(1)}
                </span>
                <span className="text-[10px] text-slate-400 ml-1">t/yr</span>
                <p className="text-[10px] text-sky-400/80 mt-0.5">Continuous capture</p>
              </div>

              <div className="p-3 rounded-xl bg-carbon-850 border border-emerald-950/60">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                  Sentinel-2 NDVI
                </span>
                <span className="text-base font-bold font-mono text-lime-400">
                  {data.kpis.mean_ndvi.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-400 ml-1">mean</span>
                <p className="text-[10px] text-lime-400/80 mt-0.5">
                  {data.kpis.canopy_cover_percentage.toFixed(0)}% Canopy
                </p>
              </div>

              <div className="p-3 rounded-xl bg-carbon-850 border border-emerald-950/60">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                  Shannon Diversity
                </span>
                <span className="text-base font-bold font-mono text-cyan-400">
                  {data.kpis.shannon_diversity_index.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-400 ml-1">H'</span>
                <p className="text-[10px] text-cyan-400/80 mt-0.5">
                  {data.kpis.species_richness_count} species
                </p>
              </div>

              <div className="p-3 rounded-xl bg-carbon-850 border border-emerald-950/60">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                  Soil Carbon (SOC)
                </span>
                <span className="text-base font-bold font-mono text-amber-400">
                  {data.kpis.soil_organic_carbon_g_kg.toFixed(1)}
                </span>
                <span className="text-[10px] text-slate-400 ml-1">g/kg</span>
                <p className="text-[10px] text-slate-400 mt-0.5">ISRIC 0-30cm</p>
              </div>

              <div className="p-3 rounded-xl bg-carbon-850 border border-emerald-950/60">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                  MRV Status
                </span>
                <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1 mt-1">
                  <ShieldCheck className="w-3.5 h-3.5 inline text-emerald-400" />
                  <span>Verified Baseline</span>
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5">36 Months Monitored</p>
              </div>
            </div>

            {/* Visualizer Tabs */}
            <div className="flex border-b border-slate-800 space-x-1 text-xs">
              <button
                onClick={() => setActiveTab('carbon')}
                className={`pb-2 px-3 font-semibold transition-colors flex items-center space-x-1.5 border-b-2 ${
                  activeTab === 'carbon'
                    ? 'border-emerald-400 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Leaf className="w-3.5 h-3.5" />
                <span>Carbon Stock</span>
              </button>

              <button
                onClick={() => setActiveTab('vegetation')}
                className={`pb-2 px-3 font-semibold transition-colors flex items-center space-x-1.5 border-b-2 ${
                  activeTab === 'vegetation'
                    ? 'border-lime-400 text-lime-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>NDVI & Canopy</span>
              </button>

              <button
                onClick={() => setActiveTab('biodiversity')}
                className={`pb-2 px-3 font-semibold transition-colors flex items-center space-x-1.5 border-b-2 ${
                  activeTab === 'biodiversity'
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Biodiversity Index</span>
              </button>

              <button
                onClick={() => setActiveTab('methodology')}
                className={`pb-2 px-3 font-semibold transition-colors flex items-center space-x-1.5 border-b-2 ${
                  activeTab === 'methodology'
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Methodology</span>
              </button>
            </div>

            {/* Tab Charts */}
            <div className="p-4 rounded-xl bg-carbon-850/80 border border-emerald-950/60">
              {activeTab === 'carbon' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Carbon Sequestration Trajectory (36 Months)
                    </h4>
                    <span className="text-[10px] text-emerald-400 font-mono">
                      Highcharts Interactive Multi-Axis
                    </span>
                  </div>
                  <HighchartsReact highcharts={Highcharts} options={carbonChartOptions} />
                  <p className="text-[11px] text-slate-400 mt-3 italic">
                    Green area tracks cumulative carbon stock (tCO₂e) sequestered across allometric
                    biomass pools. Dashed blue line indicates annual velocity of capture.
                  </p>
                </div>
              )}

              {activeTab === 'vegetation' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Sentinel-2 NDVI & Canopy Density Seasonality
                    </h4>
                    <span className="text-[10px] text-lime-400 font-mono">
                      10m Surface Reflectance
                    </span>
                  </div>
                  <HighchartsReact highcharts={Highcharts} options={vegetationChartOptions} />
                  <p className="text-[11px] text-slate-400 mt-3 italic">
                    Reflects typical South Asian monsoonal surges (July-October crest) and
                    pre-monsoon dry foliage phases (April-May), coupled with steady canopy cover
                    expansion.
                  </p>
                </div>
              )}

              {activeTab === 'biodiversity' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Shannon-Wiener Ecological Diversity Index (H')
                    </h4>
                    <span className="text-[10px] text-cyan-400 font-mono">GBIF Alignment</span>
                  </div>
                  <HighchartsReact highcharts={Highcharts} options={biodiversityChartOptions} />
                  <p className="text-[11px] text-slate-400 mt-3 italic">
                    Shannon-Wiener index quantifies species evenness and richness. An increase
                    towards 3.5+ signifies recovery of native ecological understory and faunal
                    diversity.
                  </p>
                </div>
              )}

              {activeTab === 'methodology' && (
                <div className="space-y-3 text-xs text-slate-300">
                  <div className="p-3 rounded-lg bg-carbon-900 border border-slate-800">
                    <h5 className="font-semibold text-emerald-400 mb-1 flex items-center space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Carbon MRV Engine</span>
                    </h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {data.methodology.carbon_mrv}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-carbon-900 border border-slate-800">
                    <h5 className="font-semibold text-lime-400 mb-1 flex items-center space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Vegetation & NDVI Calibration</span>
                    </h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {data.methodology.vegetation_index}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-carbon-900 border border-slate-800">
                    <h5 className="font-semibold text-cyan-400 mb-1 flex items-center space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Biodiversity Index (H')</span>
                    </h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {data.methodology.biodiversity_index}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-carbon-900 border border-slate-800">
                    <h5 className="font-semibold text-teal-400 mb-1 flex items-center space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Geospatial PostGIS Engine</span>
                    </h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {data.methodology.spatial_engine}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </aside>
  );
};
