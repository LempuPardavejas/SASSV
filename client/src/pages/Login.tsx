import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, User, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-primary bg-opacity-10 rounded-full mb-4">
              <LogIn className="text-primary" size={48} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Inventoriaus Sistema
            </h1>
            <p className="text-gray-600">
              Prisijunkite prie savo paskyros
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Vartotojo vardas"
              icon={User}
              autoFocus
              required
            />

            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Slaptažodis"
              icon={Lock}
              required
            />

            {error && (
              <div className="bg-red-50 border border-danger text-danger px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Jungiamasi...' : 'Prisijungti'}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center mb-3">
              Demo prisijungimai:
            </p>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="bg-gray-50 p-2 rounded">
                <strong>Admin:</strong> admin / admin123 (PIN: 0000)
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <strong>Klientas:</strong> specvatas_user / spec123 (PIN: 1234)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
