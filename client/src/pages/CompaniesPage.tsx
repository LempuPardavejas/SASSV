import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Building2, Users } from 'lucide-react';
import { Company } from '../types';
import apiClient from '../utils/api';

const CompaniesPage: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  useEffect(() => {
    loadCompanies();
  }, [searchQuery]);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getCompanies({
        search: searchQuery || undefined,
        limit: 100
      });
      setCompanies(response.data || []);
    } catch (error) {
      console.error('Failed to load companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Ar tikrai norite ištrinti šią įmonę?')) return;
    
    try {
      await apiClient.deleteCompany(id);
      loadCompanies();
    } catch (error) {
      console.error('Failed to delete company:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Įmonės</h1>
          <p className="text-gray-600">Valdykite įmonių sąrašą</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Pridėti įmonę</span>
        </button>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ieškoti įmonių..."
            className="input pl-10"
          />
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex items-center justify-center h-32">
            <div className="spinner"></div>
          </div>
        ) : (
          companies.map((company) => (
            <div key={company.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{company.name}</h3>
                    <p className="text-sm text-gray-500">{company.code}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                {company.email && (
                  <div className="text-sm text-gray-600">
                    <strong>El. paštas:</strong> {company.email}
                  </div>
                )}
                {company.phone && (
                  <div className="text-sm text-gray-600">
                    <strong>Telefonas:</strong> {company.phone}
                  </div>
                )}
                {company.address && (
                  <div className="text-sm text-gray-600">
                    <strong>Adresas:</strong> {company.address}
                  </div>
                )}
                {company.credit_limit && (
                  <div className="text-sm text-gray-600">
                    <strong>Kredito limitas:</strong> {company.credit_limit.toFixed(2)}€
                  </div>
                )}
                <div className="text-sm text-gray-500">
                  Sukurta: {new Date(company.created_at).toLocaleDateString('lt-LT')}
                </div>
              </div>
              
              <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-gray-200">
                <button 
                  onClick={() => setEditingCompany(company)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => handleDelete(company.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
        
        {companies.length === 0 && !loading && (
          <div className="col-span-full text-center py-8 text-gray-500">
            <Building2 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Įmonių nerasta</p>
          </div>
        )}
      </div>

      {/* Add/Edit Company Form Modal */}
      {(showAddForm || editingCompany) && (
        <CompanyForm
          company={editingCompany}
          onClose={() => {
            setShowAddForm(false);
            setEditingCompany(null);
          }}
          onSuccess={() => {
            setShowAddForm(false);
            setEditingCompany(null);
            loadCompanies();
          }}
        />
      )}
    </div>
  );
};

// Company Form Component
interface CompanyFormProps {
  company?: Company | null;
  onClose: () => void;
  onSuccess: () => void;
}

const CompanyForm: React.FC<CompanyFormProps> = ({ company, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    credit_limit: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (company) {
      setFormData({
        code: company.code,
        name: company.name,
        email: company.email || '',
        phone: company.phone || '',
        address: company.address || '',
        credit_limit: company.credit_limit || 0
      });
    }
  }, [company]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (company) {
        await apiClient.updateCompany(company.id, formData);
      } else {
        await apiClient.createCompany(formData);
      }
      onSuccess();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Klaida išsaugant įmonę');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {company ? 'Redaguoti įmonę' : 'Pridėti įmonę'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kodas *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="input"
                required
              />
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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              El. paštas
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefonas
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adresas
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="input h-20 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kredito limitas (€)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.credit_limit}
              onChange={(e) => setFormData({ ...formData, credit_limit: parseFloat(e.target.value) || 0 })}
              className="input"
            />
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

export default CompaniesPage;