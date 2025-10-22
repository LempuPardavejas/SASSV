import React, { useState, useEffect } from 'react';
import { 
  Package, 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingCart,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import TransactionForm from '../components/TransactionForm';
import apiClient from '../utils/api';

interface DashboardStats {
  todayTransactions: number;
  todayValue: number;
  activeProjects: number;
  lowStockProducts: number;
  topCompanies: Array<{
    name: string;
    value: number;
  }>;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    todayTransactions: 0,
    todayValue: 0,
    activeProjects: 0,
    lowStockProducts: 0,
    topCompanies: []
  });
  const [loading, setLoading] = useState(true);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [transactionType, setTransactionType] = useState<'PAEMIMAS' | 'GRAZINIMAS'>('PAEMIMAS');

  // Load dashboard stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        
        // Load today's transactions
        const today = new Date().toISOString().split('T')[0];
        const transactionsResponse = await apiClient.getTransactions({
          limit: 1000
        });
        
        const todayTransactions = transactionsResponse.data?.filter(t => 
          t.created_at.startsWith(today)
        ) || [];
        
        const todayValue = todayTransactions.reduce((sum, t) => {
          const itemsValue = t.items?.reduce((itemSum, item) => itemSum + item.total_price, 0) || 0;
          return sum + itemsValue;
        }, 0);

        // Load active projects
        const projectsResponse = await apiClient.getProjects({
          status: 'AKTYVUS',
          limit: 1000
        });
        const activeProjects = projectsResponse.data?.length || 0;

        // Load low stock products
        const productsResponse = await apiClient.getProducts({
          limit: 1000
        });
        const lowStockProducts = productsResponse.data?.filter(p => 
          p.min_stock && p.stock <= p.min_stock
        ).length || 0;

        // Load top companies (mock data for now)
        const companiesResponse = await apiClient.getCompanies({
          limit: 5
        });
        const topCompanies = companiesResponse.data?.map(company => ({
          name: company.name,
          value: Math.random() * 10000 // Mock value
        })).sort((a, b) => b.value - a.value) || [];

        setStats({
          todayTransactions: todayTransactions.length,
          todayValue,
          activeProjects,
          lowStockProducts,
          topCompanies
        });
      } catch (error) {
        console.error('Failed to load dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const handleTransactionSuccess = () => {
    setShowTransactionForm(false);
    // Reload stats
    window.location.reload();
  };

  const openTransactionForm = (type: 'PAEMIMAS' | 'GRAZINIMAS') => {
    setTransactionType(type);
    setShowTransactionForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Sveiki, {user?.username}!
          </h1>
          <p className="text-gray-600">
            {user?.role === 'ADMIN' ? 'Sistemos administratorius' : 'Kliento vartotojas'}
          </p>
        </div>
        
        {/* Quick Actions */}
        <div className="flex space-x-3">
          <button
            onClick={() => openTransactionForm('PAEMIMAS')}
            className="btn btn-success flex items-center space-x-2"
          >
            <ArrowUpRight className="h-5 w-5" />
            <span>Paimti prekes</span>
          </button>
          <button
            onClick={() => openTransactionForm('GRAZINIMAS')}
            className="btn btn-primary flex items-center space-x-2"
          >
            <ArrowDownRight className="h-5 w-5" />
            <span>Grąžinti prekes</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Today's Transactions */}
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Šiandienos transakcijos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.todayTransactions}</p>
            </div>
          </div>
        </div>

        {/* Today's Value */}
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Šiandienos vertė</p>
              <p className="text-2xl font-bold text-gray-900">{stats.todayValue.toFixed(2)}€</p>
            </div>
          </div>
        </div>

        {/* Active Projects */}
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Aktyvūs projektai</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeProjects}</p>
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Žemas likutis</p>
              <p className="text-2xl font-bold text-gray-900">{stats.lowStockProducts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Greiti veiksmai</h3>
          <div className="space-y-3">
            <button
              onClick={() => openTransactionForm('PAEMIMAS')}
              className="w-full btn btn-success flex items-center justify-center space-x-2"
            >
              <ArrowUpRight className="h-5 w-5" />
              <span>Paimti prekes</span>
            </button>
            <button
              onClick={() => openTransactionForm('GRAZINIMAS')}
              className="w-full btn btn-primary flex items-center justify-center space-x-2"
            >
              <ArrowDownRight className="h-5 w-5" />
              <span>Grąžinti prekes</span>
            </button>
            {user?.role === 'ADMIN' && (
              <>
                <button className="w-full btn btn-secondary flex items-center justify-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>Pridėti produktą</span>
                </button>
                <button className="w-full btn btn-secondary flex items-center justify-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>Sukurti projektą</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Top Companies */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top įmonės</h3>
          {stats.topCompanies.length > 0 ? (
            <div className="space-y-3">
              {stats.topCompanies.map((company, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                      {index + 1}
                    </div>
                    <span className="ml-3 text-sm font-medium text-gray-900">
                      {company.name}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {company.value.toFixed(0)}€
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Nėra duomenų</p>
          )}
        </div>
      </div>

      {/* Transaction Form Modal */}
      {showTransactionForm && (
        <TransactionForm
          type={transactionType}
          onSuccess={handleTransactionSuccess}
          onCancel={() => setShowTransactionForm(false)}
          companyId={user?.company_id}
        />
      )}
    </div>
  );
};

export default Dashboard;