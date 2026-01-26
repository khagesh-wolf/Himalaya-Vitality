
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { Button, Card, Container } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { SEO } from '../components/SEO';

export const AdminLoginPage = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(password)) {
      navigate('/admin');
    } else {
      setError('Invalid password');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20">
      <SEO title="Admin Login" />
      <Container className="max-w-md w-full">
        <div className="text-center mb-8">
            <div className="mx-auto flex items-center justify-center mb-4">
                <img 
                    src="https://i.ibb.co/tMXQXvJn/logo-red.png" 
                    alt="Himalaya Vitality" 
                    className="h-16 w-auto object-contain" 
                />
            </div>
            <h1 className="font-heading font-bold text-2xl text-brand-dark">Admin Access</h1>
            <p className="text-gray-500 text-sm mt-2">Enter your secure credentials to continue.</p>
        </div>

        <Card className="p-8 border-none shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Password</label>
                    <div className="relative">
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-red outline-none pl-12"
                            placeholder="Enter password"
                        />
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    </div>
                </div>

                {error && <div className="text-red-500 text-sm font-medium text-center bg-red-50 p-3 rounded-lg">{error}</div>}

                <Button fullWidth size="lg">Login to Dashboard</Button>
            </form>
        </Card>
        
        <p className="text-center text-xs text-gray-400 mt-8">Restricted Access • Himalaya Vitality © 2024</p>
      </Container>
    </div>
  );
};
