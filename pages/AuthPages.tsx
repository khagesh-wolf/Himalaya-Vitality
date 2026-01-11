import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Mail, Lock, User, AlertCircle, Key, ArrowLeft, CheckCircle } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { Button, Card, Container } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { SEO } from '../components/SEO';
import { sendForgotPassword, resetPassword } from '../services/api';

// --- Login Page ---
export const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, socialLogin, error, isLoading, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) navigate('/profile');
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login({ email, password });
            navigate('/profile');
        } catch (e: any) {
            // Check for verification flag from API/Context
            if (e.requiresVerification) {
                navigate('/verify-email', { state: { email: e.email } });
            }
        }
    };

    const handleGoogle = useGoogleLogin({
        onSuccess: (res) => socialLogin(res.access_token).then(() => navigate('/profile')),
        onError: () => console.error('Google Failed')
    });

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20">
            <SEO title="Login" />
            <Container className="max-w-md w-full">
                <Card className="p-8 shadow-xl">
                    <h1 className="font-heading font-bold text-2xl text-center mb-6">Welcome Back</h1>
                    <Button fullWidth onClick={() => handleGoogle()} className="mb-4 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50">Continue with Google</Button>
                    <div className="relative my-6 text-center text-sm text-gray-400"><span>or with email</span></div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full p-3 border rounded-xl" required />
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full p-3 border rounded-xl" required />
                        {error && <div className="text-red-500 text-sm">{error}</div>}
                        <Button fullWidth disabled={isLoading}>{isLoading ? 'Signing In...' : 'Sign In'}</Button>
                    </form>
                    <div className="mt-4 text-center text-sm">
                        <Link to="/forgot-password" class="text-brand-red font-bold">Forgot Password?</Link>
                    </div>
                    <div className="mt-4 text-center text-sm text-gray-500">
                        No account? <Link to="/signup" className="text-brand-red font-bold">Sign up</Link>
                    </div>
                </Card>
            </Container>
        </div>
    );
};

// --- Signup Page ---
export const SignupPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signup, error, isLoading } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await signup({ name, email, password });
            // Navigate to verify with email in state
            navigate('/verify-email', { state: { email } });
        } catch (e) { /* Error handled in context */ }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20">
            <SEO title="Sign Up" />
            <Container className="max-w-md w-full">
                <Card className="p-8 shadow-xl">
                    <h1 className="font-heading font-bold text-2xl text-center mb-6">Create Account</h1>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" className="w-full p-3 border rounded-xl" required />
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full p-3 border rounded-xl" required />
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full p-3 border rounded-xl" required />
                        {error && <div className="text-red-500 text-sm">{error}</div>}
                        <Button fullWidth disabled={isLoading}>{isLoading ? 'Creating...' : 'Sign Up'}</Button>
                    </form>
                    <div className="mt-4 text-center text-sm text-gray-500">
                        Have an account? <Link to="/login" className="text-brand-red font-bold">Login</Link>
                    </div>
                </Card>
            </Container>
        </div>
    );
};

// --- Verify Email Page ---
export const VerifyEmailPage = () => {
    const { state } = useLocation();
    const { verifyEmail } = useAuth();
    const [otp, setOtp] = useState('');
    const [msg, setMsg] = useState('');
    const navigate = useNavigate();

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await verifyEmail(state?.email, otp);
            navigate('/profile');
        } catch (e: any) {
            setMsg(e.message || 'Verification failed');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20">
            <Container className="max-w-md w-full">
                <Card className="p-8 text-center">
                    <h1 className="font-bold text-2xl mb-2">Verify Email</h1>
                    <p className="text-gray-500 mb-6">Enter code sent to {state?.email}</p>
                    <form onSubmit={handleVerify} className="space-y-4">
                        <input type="text" value={otp} onChange={e => setOtp(e.target.value)} placeholder="123456" className="w-full p-3 border rounded-xl text-center text-lg tracking-widest" maxLength={6} />
                        {msg && <p className="text-red-500">{msg}</p>}
                        <Button fullWidth>Verify</Button>
                    </form>
                </Card>
            </Container>
        </div>
    );
};

// --- Forgot Password Page ---
export const ForgotPasswordPage = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPass, setNewPass] = useState('');
    const [msg, setMsg] = useState('');
    const navigate = useNavigate();

    const sendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await sendForgotPassword(email);
            setStep(2);
        } catch (e: any) { setMsg(e.message); }
    };

    const reset = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await resetPassword({ email, otp, newPassword: newPass });
            navigate('/login');
        } catch (e: any) { setMsg(e.message); }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20">
            <Container className="max-w-md w-full">
                <Card className="p-8">
                    <h1 className="font-bold text-2xl mb-4 text-center">Reset Password</h1>
                    {step === 1 ? (
                        <form onSubmit={sendCode} className="space-y-4">
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" className="w-full p-3 border rounded-xl" />
                            <Button fullWidth>Send Code</Button>
                        </form>
                    ) : (
                        <form onSubmit={reset} className="space-y-4">
                            <input type="text" value={otp} onChange={e => setOtp(e.target.value)} placeholder="Code" className="w-full p-3 border rounded-xl" />
                            <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="New Password" class="w-full p-3 border rounded-xl" />
                            <Button fullWidth>Reset Password</Button>
                        </form>
                    )}
                    {msg && <p className="text-red-500 mt-4 text-center">{msg}</p>}
                </Card>
            </Container>
        </div>
    );
};