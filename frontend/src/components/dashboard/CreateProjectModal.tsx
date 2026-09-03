import React, { useState } from 'react';
import { X, PlusCircle, Trees } from 'lucide-react';
import { projectsApi } from '../../services/api';
import { useProjects } from '../../context/ProjectContext';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose }) => {
  const { refreshData } = useProjects();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [projectType, setProjectType] = useState('Reforestation');
  const [targetCarbon, setTargetCarbon] = useState<number>(15000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await projectsApi.create({
        name,
        description,
        project_type: projectType,
        target_carbon_tco2e: targetCarbon,
        status: 'Active',
        country: 'India',
      });
      await refreshData();
      setName('');
      setDescription('');
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create project');
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
          <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
            <Trees className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">Create Carbon Project</h2>
            <p className="text-xs text-slate-400">Add an environmental conservation initiative</p>
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
              Project Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Satpura Tiger Corridor Afforestation"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-carbon-850 border border-slate-700/60 rounded-lg px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Project Type
            </label>
            <select
              value={projectType}
              onChange={(e) => setProjectType(e.target.value)}
              className="w-full bg-carbon-850 border border-slate-700/60 rounded-lg px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              <option value="Reforestation">Reforestation & Afforestation</option>
              <option value="Blue Carbon (Mangroves)">Blue Carbon (Mangrove & Coastal)</option>
              <option value="Agroforestry">Agroforestry & Canopy Shade</option>
              <option value="Peatland / Wetland">Peatland Rewetting & Wetland</option>
              <option value="Grassland Conservation">Grassland & Savanna</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Target Sequestration (tCO₂e)
            </label>
            <input
              type="number"
              min="100"
              step="500"
              value={targetCarbon}
              onChange={(e) => setTargetCarbon(Number(e.target.value))}
              className="w-full bg-carbon-850 border border-slate-700/60 rounded-lg px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Ecological Objective / Description
            </label>
            <textarea
              rows={3}
              placeholder="Describe biodiversity recovery goals, community impact, or carbon baseline..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-carbon-850 border border-slate-700/60 rounded-lg px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
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
              disabled={loading}
              className="px-5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg shadow-emerald-950/60 flex items-center space-x-1.5 disabled:opacity-50"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{loading ? 'Creating...' : 'Create Project'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
