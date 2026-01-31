
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Mail, Lock, User, AlertCircle, Key, ArrowLeft, CheckCircle, Info } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { Button, Card, Container, LazyImage } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { SEO } from '../components/SEO';
import { sendForgotPassword, resetPassword } from '../services/api';

const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const AuthLayout = ({ children, title }: { children?: React.ReactNode, title: string }) => (
    <div className="min-h-screen relative flex items-center justify-center py-12 px-4 bg-gray-50">
        <SEO title={title} />
        {/* Subtle Light Background Decoration */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
             <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-brand-red/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
             <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gray-200/50 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        </div>
        
        {/* Content - Added mt-20 to clear the fixed white header on mobile/small screens if needed, 
            though flex-center usually handles it. The padding ensures it doesn't touch edges. */}
        <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in-95 duration-500 mt-20 md:mt-0">
            {children}
        </div>
    </div>
);

// --- Login Page ---
export const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, socialLogin, error: authError, isLoading, isAuthenticated } = useAuth();
    const [localError, setLocalError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    // Handle Redirect Logic
    const from = location.state?.from || '/profile';

    useEffect(() => {
        if (isAuthenticated) navigate(from);
    }, [isAuthenticated, navigate, from]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError('');
        try {
            await login({ email, password });
            // Navigation handled by useEffect upon isAuthenticated change
        } catch (e: any) {
            // Check for verification flag
            if (e.requiresVerification) {
                navigate('/verify-email', { state: { email: e.email } });
            }
        }
    };

    const handleGoogle = useGoogleLogin({
        onSuccess: (res) => socialLogin(res.access_token).then(() => navigate(from)).catch(e => setLocalError("Google Login Failed: " + e.message)),
        onError: () => setLocalError('Google Authentication Failed in Browser')
    });

    return (
        <AuthLayout title="Login">
            <Card className="p-8 shadow-xl border border-gray-100 bg-white">
                <h1 className="font-heading font-bold text-3xl text-center mb-2 text-brand-dark">Welcome Back</h1>
                <p className="text-gray-500 text-center mb-8 text-sm">Access your vitality profile and orders.</p>
                
                <button 
                    onClick={() => handleGoogle()} 
                    className="w-full mb-6 flex items-center justify-center bg-white text-gray-700 font-bold py-3.5 px-4 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md transition-all duration-200 group"
                >
                    <GoogleIcon />
                    <span className="group-hover:text-black transition-colors">Continue with Google</span>
                </button>

                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-gray-400 font-bold tracking-wider">Or Login with Email</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <input 
                            type="email" 
                            value={email} 
                            onChange={e => setEmail(e.target.value)} 
                            placeholder="Email address" 
                            className="w-full p-4 pl-12 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-red focus:bg-white outline-none transition-all font-medium text-brand-dark" 
                            required 
                        />
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    </div>
                    <div className="relative">
                        <input 
                            type="password" 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            placeholder="Password" 
                            className="w-full p-4 pl-12 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-red focus:bg-white outline-none transition-all font-medium text-brand-dark" 
                            required 
                        />
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    </div>
                    
                    {(authError || localError) && (
                        <div className="flex items-center text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100 animate-in fade-in slide-in-from-top-1">
                            <AlertCircle size={16} className="mr-2 shrink-0"/> {authError || localError}
                        </div>
                    )}
                    
                    <Button fullWidth size="lg" disabled={isLoading} className="shadow-lg shadow-brand-red/20 mt-2">
                        {isLoading ? 'Signing In...' : 'Sign In'}
                    </Button>
                </form>
                <div className="mt-6 text-center text-sm flex justify-between items-center">
                    <Link to="/forgot-password" className="text-gray-500 hover:text-brand-dark hover:underline transition-colors">Forgot Password?</Link>
                    <Link to="/signup" className="text-brand-red font-bold hover:text-red-700 transition-colors">Create Account</Link>
                </div>
            </Card>
        </AuthLayout>
    );
};

// --- Signup Page ---
export const SignupPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [localError, setLocalError] = useState('');
    const { signup, error: authError, isLoading, socialLogin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleGoogle = useGoogleLogin({
        onSuccess: (res) => socialLogin(res.access_token).then(() => navigate('/profile')).catch(e => setLocalError("Google Signup Failed: " + e.message)),
        onError: () => setLocalError('Google Authentication Failed')
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError('');

        if (password !== confirmPassword) {
            setLocalError("Passwords do not match");
            return;
        }

        try {
            await signup({ name, email, password });
            navigate('/verify-email', { state: { email, from: location.state?.from } });
        } catch (e: any) {
            // Error is handled in context but we ensure it clears old errors on new submit attempt
        }
    };

    return (
        <AuthLayout title="Sign Up">
            <Card className="p-8 shadow-xl border border-gray-100 bg-white">
                <h1 className="font-heading font-bold text-3xl text-center mb-2 text-brand-dark">Join the Tribe</h1>
                <p className="text-gray-500 text-center mb-8 text-sm">Start your journey to peak performance.</p>
                
                <button 
                    onClick={() => handleGoogle()} 
                    className="w-full mb-6 flex items-center justify-center bg-white text-gray-700 font-bold py-3.5 px-4 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md transition-all duration-200 group"
                >
                    <GoogleIcon />
                    <span className="group-hover:text-black transition-colors">Sign up with Google</span>
                </button>

                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-gray-400 font-bold tracking-wider">Or Sign up with Email</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <input 
                            type="text" 
                            value={name} 
                            onChange={e => setName(e.target.value)} 
                            placeholder="Full Name" 
                            className="w-full p-4 pl-12 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-red focus:bg-white outline-none transition-all font-medium text-brand-dark" 
                            required 
                        />
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    </div>
                    <div className="relative">
                        <input 
                            type="email" 
                            value={email} 
                            onChange={e => setEmail(e.target.value)} 
                            placeholder="Email address" 
                            className="w-full p-4 pl-12 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-red focus:bg-white outline-none transition-all font-medium text-brand-dark" 
                            required 
                        />
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    </div>
                    <div className="relative">
                        <input 
                            type="password" 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            placeholder="Password" 
                            className="w-full p-4 pl-12 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-red focus:bg-white outline-none transition-all font-medium text-brand-dark" 
                            required 
                        />
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    </div>
                    <div className="relative">
                        <input 
                            type="password" 
                            value={confirmPassword} 
                            onChange={e => setConfirmPassword(e.target.value)} 
                            placeholder="Confirm Password" 
                            className={`w-full p-4 pl-12 bg-gray-50 border rounded-xl focus:ring-2 focus:bg-white outline-none transition-all font-medium text-brand-dark ${localError ? 'border-red-500 ring-red-100' : 'border-gray-200 focus:ring-brand-red'}`} 
                            required 
                        />
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    </div>
                    
                    {(authError || localError) && (
                        <div className="flex items-center text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100 animate-in fade-in slide-in-from-top-1">
                            <AlertCircle size={16} className="mr-2 shrink-0"/> {localError || authError}
                        </div>
                    )}
                    
                    <Button fullWidth size="lg" disabled={isLoading} className="shadow-lg shadow-brand-red/20 mt-2">
                        {isLoading ? 'Creating...' : 'Create Account'}
                    </Button>
                </form>
                <div className="mt-6 text-center text-sm text-gray-500">
                    Already have an account? <Link to="/login" className="text-brand-red font-bold hover:text-red-700 transition-colors">Login</Link>
                </div>
            </Card>
        </AuthLayout>
    );
};

// --- Verify Email Page ---
export const VerifyEmailPage = () => {
    const { state } = useLocation();
    const { verifyEmail } = useAuth();
    const [otp, setOtp] = useState('');
    const [msg, setMsg] = useState('');
    const navigate = useNavigate();
    const from = state?.from || '/profile';

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await verifyEmail(state?.email, otp);
            navigate(from);
        } catch (e: any) {
            setMsg(e.message || 'Verification failed');
        }
    };

    return (
        <AuthLayout title="Verify Email">
            <Card className="p-8 text-center shadow-xl bg-white border border-gray-100">
                <div className="w-16 h-16 bg-brand-red/10 text-brand-red rounded-full flex items-center justify-center mx-auto mb-4">
                    <Key size={32} />
                </div>
                <h1 className="font-heading font-bold text-2xl mb-2 text-brand-dark">Verify Email</h1>
                <p className="text-gray-500 mb-8 leading-relaxed">
                    We've sent a 6-digit code to <br/><strong>{state?.email}</strong>
                </p>
                
                <form onSubmit={handleVerify} className="space-y-6">
                    <input 
                        type="text" 
                        value={otp} 
                        onChange={e => setOtp(e.target.value)} 
                        placeholder="000000" 
                        className="w-full p-4 border border-gray-200 rounded-xl text-center text-2xl font-bold tracking-[0.5em] focus:ring-2 focus:ring-brand-red outline-none transition-all text-brand-dark" 
                        maxLength={6} 
                    />
                    {msg && <p className="text-red-500 text-sm font-bold">{msg}</p>}
                    <Button fullWidth size="lg">Verify Account</Button>
                </form>
                <p className="text-xs text-gray-400 mt-6">Check your spam folder if it doesn't arrive within 1 minute.</p>
            </Card>
        </AuthLayout>
    );
};

// --- Forgot Password Page ---
export const ForgotPasswordPage = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const sendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMsg('');
        try {
            await sendForgotPassword(email);
            setStep(2);
            setMsg(`Code sent to ${email}`);
        } catch (e: any) { setError(e.message); }
    };

    const reset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (newPass !== confirmPass) {
            setError("Passwords do not match");
            return;
        }

        try {
            await resetPassword({ email, otp, newPassword: newPass });
            navigate('/login');
        } catch (e: any) { setError(e.message); }
    };

    return (
        <AuthLayout title="Reset Password">
            <Card className="p-8 shadow-xl bg-white border border-gray-100">
                <h1 className="font-heading font-bold text-2xl mb-2 text-center text-brand-dark">Reset Password</h1>
                <p className="text-gray-500 text-center mb-8 text-sm">Recover access to your account.</p>
                
                {step === 1 ? (
                    <form onSubmit={sendCode} className="space-y-6">
                        <div className="relative">
                            <input 
                                type="email" 
                                value={email} 
                                onChange={e => setEmail(e.target.value)} 
                                placeholder="Enter your email" 
                                className="w-full p-4 pl-12 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-red focus:bg-white outline-none transition-all font-medium text-brand-dark" 
                                required
                            />
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        </div>
                        <Button fullWidth size="lg">Send Reset Code</Button>
                    </form>
                ) : (
                    <form onSubmit={reset} className="space-y-4">
                        <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-xs mb-4 flex items-start">
                            <Info size={16} className="mr-2 shrink-0 mt-0.5" />
                            <span>Code sent to <strong>{email}</strong>. Please check your spam folder.</span>
                        </div>

                        <input type="text" value={otp} onChange={e => setOtp(e.target.value)} placeholder="Enter 6-Digit Code" className="w-full p-4 border border-gray-200 rounded-xl text-center font-bold tracking-widest outline-none focus:ring-2 focus:ring-brand-red text-brand-dark" />
                        <div className="relative">
                            <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="New Password" className="w-full p-4 pl-12 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-red outline-none text-brand-dark" />
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        </div>
                        <div className="relative">
                            <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} placeholder="Confirm Password" className="w-full p-4 pl-12 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-red outline-none text-brand-dark" />
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        </div>
                        <Button fullWidth size="lg">Set New Password</Button>
                    </form>
                )}
                
                {msg && step === 1 && (
                    <div className="mt-4 flex items-center justify-center text-green-600 text-sm font-bold animate-in fade-in">
                        <CheckCircle size={16} className="mr-2" /> {msg}
                    </div>
                )}
                
                {error && (
                    <div className="mt-4 flex items-center justify-center text-red-500 text-sm font-bold bg-red-50 p-2 rounded-lg animate-in fade-in">
                        <AlertCircle size={16} className="mr-2" /> {error}
                    </div>
                )}

                <div className="mt-8 text-center">
                    <Link to="/login" className="text-sm font-bold text-gray-400 hover:text-brand-dark flex items-center justify-center transition-colors">
                        <ArrowLeft size={16} className="mr-1" /> Back to Login
                    </Link>
                </div>
            </Card>
        </AuthLayout>
    );
};
