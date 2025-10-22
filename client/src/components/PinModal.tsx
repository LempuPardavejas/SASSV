import React, { useState, useRef, useEffect } from 'react';
import { Lock } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (pin: string) => Promise<boolean>;
  title?: string;
}

const PinModal: React.FC<PinModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title = 'Patvirtinti PIN kodu',
}) => {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input when modal opens
  useEffect(() => {
    if (isOpen) {
      setPin(['', '', '', '']);
      setError('');
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value.slice(-1); // Only last digit
    setPin(newPin);
    setError('');

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (index === 3 && value) {
      const fullPin = [...newPin.slice(0, 3), value].join('');
      handleSubmit(fullPin);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (pinValue?: string) => {
    const fullPin = pinValue || pin.join('');

    if (fullPin.length !== 4) {
      setError('PIN kodas turi būti 4 skaitmenų');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const isValid = await onSubmit(fullPin);

      if (isValid) {
        onClose();
      } else {
        setError('Neteisingas PIN kodas');
        setPin(['', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError('PIN patvirtinimo klaida');
      setPin(['', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    
    if (pastedData.length === 4) {
      const newPin = pastedData.split('');
      setPin(newPin);
      handleSubmit(pastedData);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="py-4">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-primary bg-opacity-10 rounded-full">
            <Lock className="text-primary" size={48} />
          </div>
        </div>

        <p className="text-center text-gray-600 mb-6">
          Įveskite 4 skaitmenų PIN kodą transakcijai patvirtinti
        </p>

        <div className="flex justify-center gap-3 mb-6">
          {pin.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={isSubmitting}
            />
          ))}
        </div>

        {error && (
          <p className="text-center text-danger text-sm mb-4">{error}</p>
        )}

        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1"
          >
            Atšaukti
          </Button>
          <Button
            variant="primary"
            onClick={() => handleSubmit()}
            disabled={pin.join('').length !== 4 || isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? 'Tikrinama...' : 'Patvirtinti'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PinModal;
