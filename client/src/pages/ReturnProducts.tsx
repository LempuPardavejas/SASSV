import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import FastProductEntry from '../components/FastProductEntry';
import PinModal from '../components/PinModal';
import Button from '../components/Button';
import type { Project, CartItem } from '../types';

const ReturnProducts: React.FC = () => {
  const { user, verifyPin } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notes, setNotes] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const response = await api.get<Project[]>('/projects', {
        params: { status: 'AKTYVUS' },
      });
      setProjects(response.data);

      // Auto-select first project if available
      if (response.data.length > 0) {
        setSelectedProject(response.data[0].id);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      alert('Klaida kraunant projektus');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = (item: CartItem) => {
    setCart([...cart, item]);
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    setCart(
      cart.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            quantity,
            totalPrice: quantity * item.pricePerUnit,
          };
        }
        return item;
      })
    );
  };

  const handleRemoveFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const handleSubmit = () => {
    if (!selectedProject) {
      alert('Pasirinkite projektą');
      return;
    }

    if (cart.length === 0) {
      alert('Pridėkite bent vieną prekę');
      return;
    }

    setShowPinModal(true);
  };

  const handlePinSubmit = async (pin: string): Promise<boolean> => {
    const isValid = await verifyPin(pin);
    
    if (!isValid) {
      return false;
    }

    // PIN verified, save transaction
    try {
      setIsSaving(true);

      const transactionData = {
        projectId: selectedProject,
        companyId: user?.companyId,
        type: 'GRAZINIMAS',
        pin,
        items: cart.map((item) => ({
          productId: item.productId,
          productCode: item.productCode,
          productName: item.productName,
          quantity: item.quantity,
          unit: item.unit,
          pricePerUnit: item.pricePerUnit,
          totalPrice: item.totalPrice,
        })),
        notes: notes || undefined,
      };

      await api.post('/transactions', transactionData);

      alert('Transakcija sėkmingai išsaugota!');
      navigate('/');
    } catch (error: any) {
      console.error('Error saving transaction:', error);
      alert(error.response?.data?.error || 'Klaida išsaugant transakciją');
      return false;
    } finally {
      setIsSaving(false);
    }

    return true;
  };

  const totalValue = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              icon={ArrowLeft}
              onClick={() => navigate('/')}
            >
              Atgal
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Grąžinti Prekes
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Registruokite prekių grąžinimą
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Kraunama...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Project Selection */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Projektas
              </label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Pasirinkite projektą</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Fast Product Entry */}
            <FastProductEntry
              cart={cart}
              onAddToCart={handleAddToCart}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveFromCart={handleRemoveFromCart}
            />

            {/* Notes */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pastabos (nebūtina)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Papildomos pastabos..."
              />
            </div>

            {/* Submit */}
            {cart.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Patvirtinti Grąžinimą
                  </h3>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Bendra suma:</p>
                    <p className="text-2xl font-bold text-primary">
                      {totalValue.toFixed(2)} €
                    </p>
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="lg"
                  icon={Save}
                  onClick={handleSubmit}
                  disabled={!selectedProject || cart.length === 0 || isSaving}
                  className="w-full"
                >
                  {isSaving ? 'Išsaugoma...' : 'Patvirtinti su PIN'}
                </Button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* PIN Modal */}
      <PinModal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        onSubmit={handlePinSubmit}
        title="Patvirtinti Grąžinimą"
      />
    </div>
  );
};

export default ReturnProducts;
