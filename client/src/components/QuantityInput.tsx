import React, { useEffect, useRef } from 'react';
import { Hash } from 'lucide-react';

interface QuantityInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  unit: string;
  autoFocus?: boolean;
}

const QuantityInput: React.FC<QuantityInputProps> = ({
  value,
  onChange,
  onSubmit,
  unit,
  autoFocus = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus when component mounts or autoFocus changes
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [autoFocus]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSubmit();
    }
  };

  // Determine step based on unit
  const step = unit === 'vnt' ? 1 : 0.1;

  return (
    <div className="relative w-full">
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
        <Hash size={20} />
      </div>
      <input
        ref={inputRef}
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        step={step}
        min="0"
        placeholder={`Kiekis (${unit})`}
        className="w-full pl-10 pr-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
      />
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
        {unit}
      </div>
    </div>
  );
};

export default QuantityInput;
