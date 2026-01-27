
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ShieldAlert } from 'lucide-react';
import { Button, Card, Container } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { SEO } from '../components/SEO';

export const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
        if(isAdmin) navigate('/admin');
        else {
            // Logged in but not admin
            setError("Access Denied: Admin privileges required.");
        }
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login({ email, password });
      // Navigation is handled by useEffect
    } catch (e: any) {
      setError(e.message || 'Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-stone-900 flex items-center justify-center py-20 px-4">
      <SEO title="Admin Login" />
      
      {/* Abstract Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-red/10 rounded-full blur-3xl translate-y-1/2 translate-x-1/2"></div>
      </div>

      <Container className="max-w-md w-full relative z-10">
        <div className="text-center mb-8">
            <div className="mx-auto flex items-center justify-center mb-6">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center border border-white/10 backdrop-blur-md shadow-2xl">
                    <img 
                        src="https://i.ibb.co/tMXQXvJn/logo-red.png" 
                        alt="Himalaya Vitality" 
                        className="h-10 w-auto object-contain" 
                    />
                </div>
            </div>
            <h1 className="font-heading font-bold text-3xl text-white mb-2">Admin Portal</h1>
            <p className="text-gray-400 text-sm">Secure access for staff only.</p>
        </div>

        <Card className="p-8 border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Email</label>
                    <div className="relative">
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-4 pl-12 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand-red outline-none text-white placeholder-gray-600 transition-all"
                            placeholder="admin@himalaya.com"
                            required
                        />
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    </div>
                </div>

                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Password</label>
                    <div className="relative">
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-4 pl-12 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-brand-red outline-none text-white placeholder-gray-600 transition-all"
                            placeholder="••••••••"
                            required
                        />
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    </div>
                </div>

                {error && (
                    <div className="flex items-center gap-2 text-red-400 text-sm font-medium bg-red-900/20 p-3 rounded-lg border border-red-900/30">
                        <ShieldAlert size={16} /> {error}
                    </div>
                )}

                <Button fullWidth size="lg" className="shadow-lg shadow-brand-red/20 font-bold tracking-wide mt-2">
                    Authenticate
                </Button>
            </form>
        </Card>
        
        <div className="text-center mt-8 space-y-4">
            <Link to="/" className="text-xs text-gray-500 hover:text-white transition-colors">Return to Store</Link>
            <p className="text-[10px] text-gray-600 uppercase tracking-widest">System V1.2 • Himalaya Vitality</p>
        </div>
      </Container>
    </div>
  );
};
