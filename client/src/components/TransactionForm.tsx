import React, { useState, useEffect } from 'react';
import { Package, CheckCircle, AlertCircle, X } from 'lucide-react';
import { Project, CartItem } from '../types';
import apiClient from '../utils/api';
import UltraFastInput from './UltraFastInput';

interface TransactionFormProps {
  type: 'PAEMIMAS' | 'GRAZINIMAS';
  onSuccess: () => void;
  onCancel: () => void;
  companyId?: string;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  type,
  onSuccess,
  onCancel,
  companyId
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [pin, setPin] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load projects
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await apiClient.getProjects({ 
          companyId,
          status: 'AKTYVUS',
          limit: 100 
        });
        setProjects(response.data || []);
        
        // Auto-select first project if only one
        if (response.data && response.data.length === 1) {
          setSelectedProject(response.data[0].id);
        }
      } catch (error) {
        console.error('Failed to load projects:', error);
        setError('Nepavyko įkelti projektų');
      }
    };

    loadProjects();
  }, [companyId]);

  // Add item to cart
  const handleAddToCart = (item: CartItem) => {
    setCartItems(prev => {
      const existingIndex = prev.findIndex(cartItem => cartItem.product.id === item.product.id);
      
      if (existingIndex >= 0) {
        // Update existing item
        const updated = [...prev];
        updated[existingIndex] = item;
        return updated;
      } else {
        // Add new item
        return [...prev, item];
      }
    });
  };

  // Remove item from cart
  const handleRemoveFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  // Calculate total
  const totalValue = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Submit transaction
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProject) {
      setError('Pasirinkite projektą');
      return;
    }

    if (cartItems.length === 0) {
      setError('Pridėkite bent vieną prekę');
      return;
    }

    if (!pin) {
      setError('Įveskite PIN kodą');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const transactionData = {
        project_id: selectedProject,
        type,
        items: cartItems.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity
        })),
        notes: notes.trim() || undefined,
        pin
      };

      await apiClient.createTransaction(transactionData);
      onSuccess();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Transakcijos klaida');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${type === 'PAEMIMAS' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
              <Package className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {type === 'PAEMIMAS' ? 'Prekių paėmimas' : 'Prekių grąžinimas'}
              </h2>
              <p className="text-sm text-gray-500">
                {type === 'PAEMIMAS' ? 'Išduoti prekes įmonei' : 'Priimti prekes atgal į sandėlį'}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex h-[calc(90vh-120px)]">
          {/* Left Panel - Input */}
          <div className="flex-1 p-6 border-r border-gray-200 overflow-y-auto">
            <div className="space-y-6">
              {/* Project Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Projektas *
                </label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="input"
                  required
                >
                  <option value="">Pasirinkite projektą</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ultra Fast Input */}
              <UltraFastInput
                onAddToCart={handleAddToCart}
                onRemoveFromCart={handleRemoveFromCart}
                cartItems={cartItems}
                type={type}
              />
            </div>
          </div>

          {/* Right Panel - Cart & Summary */}
          <div className="w-96 p-6 bg-gray-50 overflow-y-auto">
            <div className="space-y-6">
              {/* Cart Summary */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Krepšelis ({cartItems.length} prekės)
                </h3>
                
                {cartItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>Krepšelis tuščias</p>
                    <p className="text-sm">Pridėkite prekes naudodami paieškos laukelį</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div key={item.product.id} className="bg-white p-3 rounded-lg border border-gray-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 text-sm">
                              {item.product.code}
                            </div>
                            <div className="text-xs text-gray-500 mb-1">
                              {item.product.name}
                            </div>
                            <div className="text-xs text-gray-600">
                              {item.quantity} {item.product.unit} × {item.product.price.toFixed(2)}€
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-gray-900">
                              {item.totalPrice.toFixed(2)}€
                            </div>
                            <button
                              onClick={() => handleRemoveFromCart(item.product.id)}
                              className="text-red-500 hover:text-red-700 text-xs"
                            >
                              Šalinti
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Total */}
              {cartItems.length > 0 && (
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Prekių skaičius:</span>
                      <span className="font-medium">{totalItems}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Prekių rūšių:</span>
                      <span className="font-medium">{cartItems.length}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2">
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Iš viso:</span>
                        <span className="text-primary">{totalValue.toFixed(2)}€</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PIN Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PIN kodas *
                </label>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="input"
                  placeholder="Įveskite PIN kodą"
                  maxLength={4}
                  required
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pastabos
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input h-20 resize-none"
                  placeholder="Papildoma informacija..."
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    <span className="text-sm text-red-700">{error}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onCancel}
                  className="btn btn-secondary flex-1"
                  disabled={loading}
                >
                  Atšaukti
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1 flex items-center justify-center"
                  disabled={loading || cartItems.length === 0 || !selectedProject || !pin}
                >
                  {loading ? (
                    <div className="spinner mr-2"></div>
                  ) : (
                    <CheckCircle className="h-5 w-5 mr-2" />
                  )}
                  {loading ? 'Apdorojama...' : 'Patvirtinti'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;