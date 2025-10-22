import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Search, Package, X, Plus, Minus } from 'lucide-react';
import { SearchResult, CartItem } from '../types';
import apiClient from '../utils/api';

interface UltraFastInputProps {
  onAddToCart: (item: CartItem) => void;
  onRemoveFromCart: (productId: string) => void;
  cartItems: CartItem[];
  type: 'PAEMIMAS' | 'GRAZINIMAS';
}

const UltraFastInput: React.FC<UltraFastInputProps> = ({
  onAddToCart,
  onRemoveFromCart,
  cartItems,
  type
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [quantity, setQuantity] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [focusedField, setFocusedField] = useState<'search' | 'quantity'>('search');

  const searchInputRef = useRef<HTMLInputElement>(null);
  const quantityInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Auto-focus search input on mount
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Search products
  useEffect(() => {
    const searchProducts = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      setIsSearching(true);
      try {
        const response = await apiClient.searchProducts(searchQuery);
        setSearchResults(response.results);
        setShowResults(true);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(searchProducts, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Handle search input key events
  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults.length > 0) {
        selectProduct(searchResults[0]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      // Focus first result
      const firstResult = resultsRef.current?.querySelector('[data-result-index="0"]') as HTMLElement;
      firstResult?.focus();
    } else if (e.key === 'Escape') {
      setShowResults(false);
      setSearchQuery('');
    }
  };

  // Handle quantity input key events
  const handleQuantityKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedProduct && quantity) {
        addToCart();
      }
    } else if (e.key === 'Escape') {
      resetForm();
    }
  };

  // Select product from search results
  const selectProduct = (product: SearchResult) => {
    setSelectedProduct(product);
    setSearchQuery(`${product.code} - ${product.name}`);
    setShowResults(false);
    setQuantity('1');
    
    // Auto-focus quantity input
    setTimeout(() => {
      quantityInputRef.current?.focus();
      setFocusedField('quantity');
    }, 100);
  };

  // Add item to cart
  const addToCart = () => {
    if (!selectedProduct || !quantity) return;

    const quantityNum = parseFloat(quantity);
    if (quantityNum <= 0) return;

    // Check stock for PAEMIMAS
    if (type === 'PAEMIMAS' && selectedProduct.stock < quantityNum) {
      alert(`Nepakanka ${selectedProduct.name} sandėlyje. Galimas kiekis: ${selectedProduct.stock} ${selectedProduct.unit}`);
      return;
    }

    const cartItem: CartItem = {
      product: selectedProduct,
      quantity: quantityNum,
      totalPrice: selectedProduct.price * quantityNum
    };

    onAddToCart(cartItem);
    resetForm();
  };

  // Reset form and focus search
  const resetForm = () => {
    setSearchQuery('');
    setQuantity('');
    setSelectedProduct(null);
    setSearchResults([]);
    setShowResults(false);
    setFocusedField('search');
    searchInputRef.current?.focus();
  };

  // Get cart item for selected product
  const getCartItem = (productId: string) => {
    return cartItems.find(item => item.product.id === productId);
  };

  // Update quantity in cart
  const updateCartQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      onRemoveFromCart(productId);
    } else {
      const cartItem = getCartItem(productId);
      if (cartItem) {
        onAddToCart({
          ...cartItem,
          quantity: newQuantity,
          totalPrice: cartItem.product.price * newQuantity
        });
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            onFocus={() => setFocusedField('search')}
            placeholder="Įveskite kodą, barkodą arba pavadinimą..."
            className="input pl-10 pr-4 py-3 text-lg"
            autoComplete="off"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="spinner"></div>
            </div>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showResults && searchResults.length > 0 && (
          <div
            ref={resultsRef}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {searchResults.map((product, index) => (
              <button
                key={product.id}
                data-result-index={index}
                onClick={() => selectProduct(product)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    selectProduct(product);
                  } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    const nextResult = resultsRef.current?.querySelector(`[data-result-index="${index + 1}"]`) as HTMLElement;
                    nextResult?.focus();
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    if (index === 0) {
                      searchInputRef.current?.focus();
                    } else {
                      const prevResult = resultsRef.current?.querySelector(`[data-result-index="${index - 1}"]`) as HTMLElement;
                      prevResult?.focus();
                    }
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {product.code} - {product.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {product.category && `${product.category} • `}
                      {product.stock} {product.unit} • {product.price.toFixed(2)}€/vnt
                    </div>
                  </div>
                  <Package className="h-5 w-5 text-gray-400" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quantity Input */}
      {selectedProduct && (
        <div className="relative">
          <input
            ref={quantityInputRef}
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            onKeyDown={handleQuantityKeyDown}
            onFocus={() => setFocusedField('quantity')}
            placeholder={`Kiekis (${selectedProduct.unit})`}
            className="input pr-4 py-3 text-lg"
            step={selectedProduct.unit === 'm' ? '0.1' : '1'}
            min="0"
            autoComplete="off"
          />
          <button
            onClick={addToCart}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 btn btn-primary px-3 py-1 text-sm"
          >
            Pridėti
          </button>
        </div>
      )}

      {/* Selected Product Info */}
      {selectedProduct && (
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-blue-900">
                {selectedProduct.code} - {selectedProduct.name}
              </h3>
              <p className="text-sm text-blue-700">
                Likutis: {selectedProduct.stock} {selectedProduct.unit} • 
                Kaina: {selectedProduct.price.toFixed(2)}€/{selectedProduct.unit}
              </p>
            </div>
            <button
              onClick={resetForm}
              className="text-blue-500 hover:text-blue-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Cart Items */}
      {cartItems.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium text-gray-900">Krepšelis ({cartItems.length} prekės)</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {cartItems.map((item) => (
              <div key={item.product.id} className="card bg-gray-50 border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {item.product.code} - {item.product.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {item.quantity} {item.product.unit} × {item.product.price.toFixed(2)}€ = {item.totalPrice.toFixed(2)}€
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                      className="p-1 text-gray-500 hover:text-gray-700"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                      className="p-1 text-gray-500 hover:text-gray-700"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onRemoveFromCart(item.product.id)}
                      className="p-1 text-red-500 hover:text-red-700 ml-2"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
        <strong>Greitas įvedimas:</strong>
        <ul className="mt-1 space-y-1">
          <li>• Įveskite kodą, barkodą arba pavadinimą ir spauskite ENTER</li>
          <li>• Įveskite kiekį ir spauskite ENTER</li>
          <li>• Naudokite rodyklių klavišus navigacijai</li>
          <li>• ESC - atšaukti/grįžti atgal</li>
        </ul>
      </div>
    </div>
  );
};

export default UltraFastInput;