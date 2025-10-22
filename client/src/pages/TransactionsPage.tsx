import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Transaction } from '../types';
import apiClient from '../utils/api';

const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedProject, setSelectedProject] = useState('');

  useEffect(() => {
    loadTransactions();
  }, [searchQuery, selectedType, selectedProject]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getTransactions({
        type: selectedType || undefined,
        projectId: selectedProject || undefined,
        limit: 100
      });
      setTransactions(response.data || []);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Ar tikrai norite ištrinti šią transakciją?')) return;
    
    try {
      await apiClient.deleteTransaction(id);
      loadTransactions();
    } catch (error) {
      console.error('Failed to delete transaction:', error);
    }
  };

  const getTransactionIcon = (type: string) => {
    return type === 'PAEMIMAS' ? ArrowUpRight : ArrowDownRight;
  };

  const getTransactionColor = (type: string) => {
    return type === 'PAEMIMAS' ? 'text-green-600' : 'text-blue-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transakcijos</h1>
          <p className="text-gray-600">Peržiūrėkite visas prekių transakcijas</p>
        </div>
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
                placeholder="Ieškoti transakcijų..."
                className="input pl-10"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="input"
            >
              <option value="">Visi tipai</option>
              <option value="PAEMIMAS">Paėmimas</option>
              <option value="GRAZINIMAS">Grąžinimas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="spinner"></div>
          </div>
        ) : (
          transactions.map((transaction) => {
            const Icon = getTransactionIcon(transaction.type);
            const totalValue = transaction.items?.reduce((sum, item) => sum + item.total_price, 0) || 0;
            
            return (
              <div key={transaction.id} className="card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${
                      transaction.type === 'PAEMIMAS' ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      <Icon className={`h-5 w-5 ${getTransactionColor(transaction.type)}`} />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900">
                          {transaction.type === 'PAEMIMAS' ? 'Prekių paėmimas' : 'Prekių grąžinimas'}
                        </h3>
                        {transaction.confirmed_by_pin && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Patvirtinta
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {transaction.project_name} • {transaction.company_name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(transaction.created_at).toLocaleString('lt-LT')} • 
                        {transaction.created_by_username}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-medium text-gray-900">
                      {totalValue.toFixed(2)}€
                    </div>
                    <div className="text-sm text-gray-500">
                      {transaction.items?.length || 0} prekės
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <button className="text-blue-600 hover:text-blue-800">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(transaction.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        
        {transactions.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            <p>Transakcijų nerasta</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsPage;