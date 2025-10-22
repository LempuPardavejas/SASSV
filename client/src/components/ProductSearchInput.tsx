import React, { useState, useRef, useEffect } from 'react';
import { Search, Package } from 'lucide-react';
import api from '../utils/api';
import type { Product } from '../types';

interface ProductSearchInputProps {
  onProductSelect: (product: Product) => void;
  autoFocus?: boolean;
}

const ProductSearchInput: React.FC<ProductSearchInputProps> = ({
  onProductSelect,
  autoFocus = true,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Search products
  useEffect(() => {
    const searchProducts = async () => {
      if (!query.trim()) {
        setResults([]);
        setShowDropdown(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await api.get<Product[]>('/products/search', {
          params: { q: query },
        });
        setResults(response.data);
        setShowDropdown(response.data.length > 0);
        setSelectedIndex(0);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(searchProducts, 150);
    return () => clearTimeout(debounce);
  }, [query]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % results.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowDropdown(false);
        break;
    }
  };

  // Handle product selection
  const handleSelect = (product: Product) => {
    onProductSelect(product);
    setQuery('');
    setResults([]);
    setShowDropdown(false);
    setSelectedIndex(0);
    
    // Return focus to input
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full">
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Search size={20} />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Įveskite kodą, barkodą arba pavadinimą..."
          className="w-full pl-10 pr-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {/* Dropdown with results */}
      {showDropdown && results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto"
        >
          {results.map((product, index) => (
            <button
              key={product.id}
              onClick={() => handleSelect(product)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                index === selectedIndex ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <Package className="text-gray-400 mt-1 flex-shrink-0" size={20} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-semibold text-primary">
                      {product.code}
                    </span>
                    {product.barcode && (
                      <span className="font-mono text-xs text-gray-500">
                        {product.barcode}
                      </span>
                    )}
                  </div>
                  <div className="font-medium text-gray-900">{product.name}</div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                    <span>Vienetas: <strong>{product.unit}</strong></span>
                    <span>Likutis: <strong className={product.stock <= (product.min_stock || 0) ? 'text-danger' : 'text-success'}>{product.stock} {product.unit}</strong></span>
                    <span>Kaina: <strong>{product.price.toFixed(2)} €</strong></span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {showDropdown && results.length === 0 && !isLoading && query.trim() && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500">
          Produktų nerasta
        </div>
      )}
    </div>
  );
};

export default ProductSearchInput;
