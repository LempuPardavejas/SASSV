import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, RotateCcw, History, LogOut, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Button from '../components/Button';
import type { Project, Transaction } from '../types';

const ClientDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Load active projects
      const projectsRes = await api.get<Project[]>('/projects', {
        params: { status: 'AKTYVUS' },
      });
      setProjects(projectsRes.data);

      // Load recent transactions
      const transactionsRes = await api.get<Transaction[]>('/transactions');
      setRecentTransactions(transactionsRes.data.slice(0, 5));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Kraunama...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Inventoriaus Sistema
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Prisijungęs kaip: <strong>{user?.username}</strong>
              </p>
            </div>
            <Button
              variant="secondary"
              icon={LogOut}
              onClick={handleLogout}
            >
              Atsijungti
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={() => navigate('/take')}
            className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 border-2 border-transparent hover:border-success group"
          >
            <div className="flex items-center gap-4">
              <div className="p-4 bg-success bg-opacity-10 rounded-full group-hover:bg-success group-hover:bg-opacity-20 transition-colors">
                <Package className="text-success" size={48} />
              </div>
              <div className="text-left">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  PAIMTI PREKES
                </h2>
                <p className="text-gray-600">
                  Registruoti prekių paėmimą
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/return')}
            className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 border-2 border-transparent hover:border-primary group"
          >
            <div className="flex items-center gap-4">
              <div className="p-4 bg-primary bg-opacity-10 rounded-full group-hover:bg-primary group-hover:bg-opacity-20 transition-colors">
                <RotateCcw className="text-primary" size={48} />
              </div>
              <div className="text-left">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  GRĄŽINTI PREKES
                </h2>
                <p className="text-gray-600">
                  Registruoti prekių grąžinimą
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="text-success" size={24} />
              <h3 className="text-lg font-semibold text-gray-900">
                Aktyvūs Projektai
              </h3>
            </div>
            <p className="text-3xl font-bold text-primary">
              {projects.length}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <History className="text-primary" size={24} />
              <h3 className="text-lg font-semibold text-gray-900">
                Transakcijos
              </h3>
            </div>
            <p className="text-3xl font-bold text-primary">
              {recentTransactions.length}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <Button
              variant="secondary"
              icon={History}
              onClick={() => navigate('/history')}
              className="w-full"
              size="lg"
            >
              Peržiūrėti Istoriją
            </Button>
          </div>
        </div>

        {/* Active Projects */}
        {projects.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Aktyvūs Projektai
            </h3>
            <div className="space-y-3">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {project.name}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Sukurta: {new Date(project.created_at).toLocaleDateString('lt-LT')}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-success bg-opacity-10 text-success rounded-full text-sm font-medium">
                    {project.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Transactions */}
        {recentTransactions.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Paskutinės Transakcijos
            </h3>
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          transaction.type === 'PAEMIMAS'
                            ? 'bg-success bg-opacity-10 text-success'
                            : 'bg-primary bg-opacity-10 text-primary'
                        }`}
                      >
                        {transaction.type}
                      </span>
                      <span className="font-medium text-gray-900">
                        {transaction.project_name}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {new Date(transaction.created_at).toLocaleString('lt-LT')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Prekių: {transaction.items?.length || 0}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ClientDashboard;
