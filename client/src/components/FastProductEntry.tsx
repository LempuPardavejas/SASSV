import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, Edit2, Trash2 } from 'lucide-react';
import ProductSearchInput from './ProductSearchInput';
import QuantityInput from './QuantityInput';
import Button from './Button';
import type { Product, CartItem } from '../types';

interface FastProductEntryProps {
  cart: CartItem[];
  onAddToCart: (item: CartItem) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveFromCart: (id: string) => void;
}

const FastProductEntry: React.FC<FastProductEntryProps> = ({
  cart,
  onAddToCart,
  onUpdateQuantity,
  onRemoveFromCart,
}) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState('');

  const productSearchRef = useRef<HTMLDivElement>(null);
  const quantityInputRef = useRef<HTMLDivElement>(null);

  // Calculate totals
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  // Handle product selection
  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setQuantity('');
  };

  // Handle adding product to cart
  const handleAddToCart = () => {
    if (!selectedProduct || !quantity || parseFloat(quantity) <= 0) {
      return;
    }

    const qty = parseFloat(quantity);
    const cartItem: CartItem = {
      id: `${selectedProduct.id}-${Date.now()}`,
      productId: selectedProduct.id,
      productCode: selectedProduct.code,
      productName: selectedProduct.name,
      quantity: qty,
      unit: selectedProduct.unit,
      pricePerUnit: selectedProduct.price,
      totalPrice: qty * selectedProduct.price,
    };

    onAddToCart(cartItem);

    // Reset for next entry
    setSelectedProduct(null);
    setQuantity('');
  };

  // Handle editing quantity
  const handleSaveEdit = (itemId: string) => {
    if (editQuantity && parseFloat(editQuantity) > 0) {
      onUpdateQuantity(itemId, parseFloat(editQuantity));
    }
    setEditingItemId(null);
    setEditQuantity('');
  };

  const startEdit = (item: CartItem) => {
    setEditingItemId(item.id);
    setEditQuantity(item.quantity.toString());
  };

  const cancelEdit = () => {
    setEditingItemId(null);
    setEditQuantity('');
  };

  return (
    <div className="space-y-4">
      {/* Input Section */}
      <div className="bg-white p-6 rounded-lg shadow-md border-2 border-primary">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">
          Greitas prekės įvedimas
        </h3>

        <div className="space-y-4">
          {/* Product Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              1. Prekės paieška
            </label>
            <ProductSearchInput
              onProductSelect={handleProductSelect}
              autoFocus={!selectedProduct}
            />
          </div>

          {/* Quantity Input - Only shown when product is selected */}
          {selectedProduct && (
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono text-sm font-semibold text-primary">
                      {selectedProduct.code}
                    </span>
                    <span className="ml-2 font-medium text-gray-900">
                      {selectedProduct.name}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedProduct(null);
                      setQuantity('');
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="mt-1 text-sm text-gray-600">
                  Likutis: <strong>{selectedProduct.stock} {selectedProduct.unit}</strong> | 
                  Kaina: <strong>{selectedProduct.price.toFixed(2)} €/{selectedProduct.unit}</strong>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  2. Kiekis
                </label>
                <QuantityInput
                  value={quantity}
                  onChange={setQuantity}
                  onSubmit={handleAddToCart}
                  unit={selectedProduct.unit}
                  autoFocus={true}
                />
              </div>

              <Button
                variant="success"
                size="lg"
                icon={Plus}
                onClick={handleAddToCart}
                disabled={!quantity || parseFloat(quantity) <= 0}
                className="w-full"
              >
                Pridėti į sąrašą
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Cart Section */}
      {cart.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Prekių sąrašas ({cart.length})
            </h3>
            <div className="text-sm text-gray-600">
              Iš viso: <strong>{totalItems.toFixed(2)}</strong> | 
              Suma: <strong className="text-primary text-lg ml-1">{totalValue.toFixed(2)} €</strong>
            </div>
          </div>

          <div className="space-y-2">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-semibold text-primary">
                      {item.productCode}
                    </span>
                    <span className="font-medium text-gray-900">
                      {item.productName}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    {editingItemId === item.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={editQuantity}
                          onChange={(e) => setEditQuantity(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(item.id);
                            if (e.key === 'Escape') cancelEdit();
                          }}
                          className="w-24 px-2 py-1 border border-gray-300 rounded"
                          autoFocus
                        />
                        <span>{item.unit}</span>
                        <button
                          onClick={() => handleSaveEdit(item.id)}
                          className="text-success hover:text-green-700"
                        >
                          Išsaugoti
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          Atšaukti
                        </button>
                      </div>
                    ) : (
                      <>
                        <span>
                          Kiekis: <strong>{item.quantity} {item.unit}</strong>
                        </span>
                        <span>×</span>
                        <span>{item.pricePerUnit.toFixed(2)} €</span>
                        <span>=</span>
                        <span className="font-semibold text-primary">
                          {item.totalPrice.toFixed(2)} €
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {editingItemId !== item.id && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(item)}
                      className="p-2 text-gray-400 hover:text-primary transition-colors"
                      title="Redaguoti kiekį"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => onRemoveFromCart(item.id)}
                      className="p-2 text-gray-400 hover:text-danger transition-colors"
                      title="Pašalinti"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FastProductEntry;
