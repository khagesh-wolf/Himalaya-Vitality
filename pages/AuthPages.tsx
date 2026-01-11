
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, AlertCircle } from 'lucide-react';
import { Button, Card, Container } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { SEO } from '../components/SEO';

const SocialButton = ({ onClick }: { onClick: () => void }) => {
    return (
        <button 
            onClick={onClick}
            className="flex items-center justify-center w-full px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-bold text-sm text-gray-700 bg-white shadow-sm"
        >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
        </button>
    );
};

export const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, socialLogin, error, isLoading } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login({ email, password });
            navigate('/');
        } catch (e) {
            // Error handled in context
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20">
            <SEO title="Login" />
            <Container className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="font-heading font-extrabold text-3xl text-brand-dark mb-2">Welcome Back</h1>
                    <p className="text-gray-500">Sign in to access your account and order history.</p>
                </div>

                <Card className="p-8 border-none shadow-xl">
                    <div className="space-y-3 mb-6">
                        <SocialButton onClick={() => socialLogin('google')} />
                    </div>

                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                        <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-400">or continue with email</span></div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                            <div className="relative">
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full p-3.5 pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-red outline-none" 
                                    placeholder="you@example.com"
                                    required
                                />
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between">
                                <label className="text-xs font-bold text-gray-500 uppercase">Password</label>
                                <a href="#" className="text-xs text-brand-red font-bold hover:underline">Forgot?</a>
                            </div>
                            <div className="relative">
                                <input 
                                    type="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full p-3.5 pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-red outline-none" 
                                    placeholder="••••••••"
                                    required
                                />
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center">
                                <AlertCircle size={16} className="mr-2 shrink-0"/> {error}
                            </div>
                        )}

                        <Button fullWidth size="lg" className="h-12" disabled={isLoading}>
                            {isLoading ? 'Signing In...' : 'Sign In'}
                        </Button>
                    </form>
                </Card>

                <p className="text-center text-sm text-gray-500 mt-8">
                    Don't have an account? <Link to="/signup" className="text-brand-red font-bold hover:underline">Sign up</Link>
                </p>
            </Container>
        </div>
    );
};

export const SignupPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signup, socialLogin, error, isLoading } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await signup({ name, email, password });
            navigate('/');
        } catch (e) {
            // Error handled in context
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20">
            <SEO title="Sign Up" />
            <Container className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="font-heading font-extrabold text-3xl text-brand-dark mb-2">Create Account</h1>
                    <p className="text-gray-500">Join the tribe and optimize your vitality.</p>
                </div>

                <Card className="p-8 border-none shadow-xl">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full p-3.5 pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-red outline-none" 
                                    placeholder="John Doe"
                                    required
                                />
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                            <div className="relative">
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full p-3.5 pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-red outline-none" 
                                    placeholder="you@example.com"
                                    required
                                />
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Password</label>
                            <div className="relative">
                                <input 
                                    type="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full p-3.5 pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-red outline-none" 
                                    placeholder="Create a password"
                                    required
                                />
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center">
                                <AlertCircle size={16} className="mr-2 shrink-0"/> {error}
                            </div>
                        )}

                        <Button fullWidth size="lg" className="h-12" disabled={isLoading}>
                            {isLoading ? 'Creating Account...' : 'Sign Up'}
                        </Button>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                        <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-400">or sign up with</span></div>
                    </div>

                    <div className="space-y-3">
                        <SocialButton onClick={() => socialLogin('google')} />
                    </div>
                </Card>

                <p className="text-center text-sm text-gray-500 mt-8">
                    Already have an account? <Link to="/login" className="text-brand-red font-bold hover:underline">Login</Link>
                </p>
            </Container>
        </div>
    );
};
