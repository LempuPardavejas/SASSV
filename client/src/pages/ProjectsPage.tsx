import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, FolderOpen, Eye } from 'lucide-react';
import { Project } from '../types';
import apiClient from '../utils/api';

const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  useEffect(() => {
    loadProjects();
  }, [searchQuery, selectedStatus]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getProjects({
        status: selectedStatus || undefined,
        limit: 100
      });
      setProjects(response.data || []);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Ar tikrai norite ištrinti šį projektą?')) return;
    
    try {
      await apiClient.deleteProject(id);
      loadProjects();
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projektai</h1>
          <p className="text-gray-600">Valdykite projektus ir sąrašus</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Sukurti projektą</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ieškoti projektų..."
                className="input pl-10"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="input"
            >
              <option value="">Visi statusai</option>
              <option value="AKTYVUS">Aktyvus</option>
              <option value="UZBAIGTAS">Užbaigtas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex items-center justify-center h-32">
            <div className="spinner"></div>
          </div>
        ) : (
          projects.map((project) => (
            <div key={project.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FolderOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{project.name}</h3>
                    <p className="text-sm text-gray-500">{project.company_name}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  project.status === 'AKTYVUS' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {project.status}
                </span>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Transakcijos:</span>
                  <span className="font-medium">{project.transaction_count || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Vertė:</span>
                  <span className="font-medium">{(project.total_value || 0).toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Sukurta:</span>
                  <span className="font-medium">
                    {new Date(project.created_at).toLocaleDateString('lt-LT')}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-gray-200">
                <button className="text-blue-600 hover:text-blue-800">
                  <Eye className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => setEditingProject(project)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => handleDelete(project.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
        
        {projects.length === 0 && !loading && (
          <div className="col-span-full text-center py-8 text-gray-500">
            <FolderOpen className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Projektų nerasta</p>
          </div>
        )}
      </div>

      {/* Add/Edit Project Form Modal */}
      {(showAddForm || editingProject) && (
        <ProjectForm
          project={editingProject}
          onClose={() => {
            setShowAddForm(false);
            setEditingProject(null);
          }}
          onSuccess={() => {
            setShowAddForm(false);
            setEditingProject(null);
            loadProjects();
          }}
        />
      )}
    </div>
  );
};

// Project Form Component
interface ProjectFormProps {
  project?: Project | null;
  onClose: () => void;
  onSuccess: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ project, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    company_id: '',
    name: '',
    status: 'AKTYVUS' as 'AKTYVUS' | 'UZBAIGTAS'
  });
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCompanies();
    if (project) {
      setFormData({
        company_id: project.company_id,
        name: project.name,
        status: project.status
      });
    }
  }, [project]);

  const loadCompanies = async () => {
    try {
      const response = await apiClient.getCompanies({ limit: 100 });
      setCompanies(response.data || []);
    } catch (error) {
      console.error('Failed to load companies:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (project) {
        await apiClient.updateProject(project.id, formData);
      } else {
        await apiClient.createProject(formData);
      }
      onSuccess();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Klaida išsaugant projektą');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {project ? 'Redaguoti projektą' : 'Sukurti projektą'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Įmonė *
            </label>
            <select
              value={formData.company_id}
              onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
              className="input"
              required
            >
              <option value="">Pasirinkite įmonę</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pavadinimas *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statusas
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="input"
            >
              <option value="AKTYVUS">Aktyvus</option>
              <option value="UZBAIGTAS">Užbaigtas</option>
            </select>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1"
              disabled={loading}
            >
              Atšaukti
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={loading}
            >
              {loading ? 'Išsaugoma...' : 'Išsaugoti'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectsPage;