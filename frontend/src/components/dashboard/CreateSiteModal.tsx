import React, { useState } from 'react';
import { X, CheckCircle, MapPin, Sparkles } from 'lucide-react';
import { sitesApi } from '../../services/api';
import { useProjects } from '../../context/ProjectContext';

interface CreateSiteModalProps {
  isOpen: boolean;
  geojson: any;
  onClose: () => void;
}

export const CreateSiteModal: React.FC<CreateSiteModalProps> = ({ isOpen, geojson, onClose }) => {
  const { projects, refreshData, setSelectedSiteId } = useProjects();
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [habitatType, setHabitatType] = useState('Tropical Moist Deciduous');
  const [establishedYear, setEstablishedYear] = useState<number>(2022);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !geojson) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Site name is required');
      return;
    }
    if (!projectId) {
      setError('Please assign this site to a project');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const createdSite = await sitesApi.createFromPolygon({
        project_id: projectId,
        name,
        description,
        habitat_type: habitatType,
        established_year: establishedYear,
        geojson,
      });

      await refreshData();
      setSelectedSiteId(createdSite.id);
      setName('');
      setDescription('');
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save site polygon');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-carbon-900 border border-emerald-900/60 rounded-2xl shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-teal-950 border border-teal-800/60 flex items-center justify-center text-teal-400">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">Save Geospatial Site</h2>
            <p className="text-xs text-emerald-400 font-mono flex items-center mt-0.5">
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Polygon Captured via Mapbox GL Draw
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Assign to Project *
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full bg-carbon-850 border border-slate-700/60 rounded-lg px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              {projects.length === 0 ? (
                <option value="">No projects available (Create a project first)</option>
              ) : (
                projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Site Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., East Ridge Canopy Plot"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-carbon-850 border border-slate-700/60 rounded-lg px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Habitat Type
              </label>
              <select
                value={habitatType}
                onChange={(e) => setHabitatType(e.target.value)}
                className="w-full bg-carbon-850 border border-slate-700/60 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="Tropical Moist Deciduous">Tropical Moist Deciduous</option>
                <option value="Mangrove / Blue Carbon">Mangrove / Blue Carbon</option>
                <option value="Agroforestry">Agroforestry</option>
                <option value="Peatland / Wetland">Peatland / Wetland</option>
                <option value="Semi-Arid Scrubland">Semi-Arid Scrubland</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Baseline Year
              </label>
              <input
                type="number"
                min="2000"
                max="2030"
                value={establishedYear}
                onChange={(e) => setEstablishedYear(Number(e.target.value))}
                className="w-full bg-carbon-850 border border-slate-700/60 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Notes & Topography
            </label>
            <textarea
              rows={2}
              placeholder="Elevation, dominant species (e.g. Shorea robusta), soil condition..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-carbon-850 border border-slate-700/60 rounded-lg px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="p-3 rounded-lg bg-carbon-950/70 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <p className="font-semibold text-emerald-400">PostGIS Integration & Synthesis:</p>
            <p>
              Submitting will trigger server-side PostGIS geodesic surface area calculation and
              synthesize 36-month baseline satellite remote sensing metrics.
            </p>
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || projects.length === 0}
              className="px-5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg shadow-emerald-950/60 flex items-center space-x-1.5 disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{loading ? 'Processing PostGIS...' : 'Save Site'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
