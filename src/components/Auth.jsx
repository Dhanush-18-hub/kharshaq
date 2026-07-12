import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation } from 'react-router-dom';
import * as z from 'zod';
import { useAuth } from '../context/AuthContext';
import { 
  Mail, Lock, User, Phone, Eye, EyeOff, Globe, ChevronDown, CheckCircle2, ShieldCheck, 
  Truck, Clock, RotateCcw, Sparkles, MessageSquare, ArrowLeft, Key
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// ---------------- Zod Schemas ----------------

const signupSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters.'),
  email: z.string().email('Invalid email address.'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number (e.g., 9876543210).'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters.')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
    .regex(/[0-9]/, 'Password must contain at least one number.')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character.'),
  confirmPassword: z.string(),
  agreeTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must agree to the Terms & Conditions.' })
  }),
  newsletter: z.boolean().optional()
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword']
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address.'),
  password: z.string().min(1, 'Password is required.'),
  rememberMe: z.boolean().optional()
});

const phoneSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number (e.g., 9876543210).')
});

const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be exactly 6 digits.')
});

const forgotSchema = z.object({
  email: z.string().email('Invalid email address.')
});

const resetSchema = z.object({
  otp: z.string().length(6, 'OTP must be exactly 6 digits.'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters.')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
    .regex(/[0-9]/, 'Password must contain at least one number.')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character.'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword']
});

export default function Auth({ initialMode = 'login' }) {
  const { login, signup, googleLogin, sendOtp, verifyOtp, requestForgotPassword, resetPassword } = useAuth();
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Destination redirect path (protected routes return)
  const fromPath = location.state?.from?.pathname || '/';

  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'phone'
  const [authStep, setAuthStep] = useState('form'); // 'form', 'otp', 'forgot', 'reset-password'
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [savedPhone, setSavedPhone] = useState('');
  const [savedResetEmail, setSavedResetEmail] = useState('');
  
  const [resendCooldown, setResendCooldown] = useState(0);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState('English');
  const [isGoogleAvailable, setIsGoogleAvailable] = useState(false);

  // Cooldown countdown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

  // Google OAuth script initialization
  useEffect(() => {
    const initGoogle = () => {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId) return;

      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            if (response.credential) {
              try {
                const loggedUser = await googleLogin(response.credential);
                if (loggedUser && loggedUser.role === 'admin') {
                  navigate('/admin/dashboard', { replace: true });
                } else {
                  navigate(fromPath, { replace: true });
                }
              } catch (err) {}
            }
          }
        });
        
        setTimeout(() => {
          let loaded = false;
          const googleBtnLogin = document.getElementById('google-btn-login');
          if (googleBtnLogin) {
            window.google.accounts.id.renderButton(googleBtnLogin, {
              theme: 'outline',
              size: 'large',
              width: googleBtnLogin.offsetWidth || 240
            });
            loaded = true;
          }
          const googleBtnSignup = document.getElementById('google-btn-signup');
          if (googleBtnSignup) {
            window.google.accounts.id.renderButton(googleBtnSignup, {
              theme: 'outline',
              size: 'large',
              width: googleBtnSignup.offsetWidth || 240
            });
            loaded = true;
          }
          if (loaded) {
            setIsGoogleAvailable(true);
          }
        }, 150);
      }
    };

    // Load Google Identity Services script if configured
    if (import.meta.env.VITE_GOOGLE_CLIENT_ID) {
      if (!document.getElementById('google-gsi-script')) {
        const script = document.createElement('script');
        script.id = 'google-gsi-script';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = initGoogle;
        document.body.appendChild(script);
      } else {
        initGoogle();
      }
    }
  }, [isSignUp, loginMethod, authStep]);

  // React Hook Forms definitions
  const signupForm = useForm({ resolver: zodResolver(signupSchema), defaultValues: { newsletter: false } });
  const emailLoginForm = useForm({ resolver: zodResolver(loginSchema), defaultValues: { rememberMe: false } });
  const phoneForm = useForm({ resolver: zodResolver(phoneSchema) });
  const otpForm = useForm({ resolver: zodResolver(otpSchema) });
  const forgotForm = useForm({ resolver: zodResolver(forgotSchema) });
  const resetForm = useForm({ resolver: zodResolver(resetSchema) });

  const watchResetPassword = resetForm.watch('password') || '';

  // Get password strength progress
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, text: 'Empty', color: 'bg-gray-200' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pass)) score += 1;
    
    if (score <= 2) return { score, text: 'Weak 🔴', color: 'bg-red-500' };
    if (score <= 4) return { score, text: 'Medium 🟡', color: 'bg-amber-500' };
    return { score, text: 'Strong 🟢', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(watchResetPassword);

  const toggleMode = (signUp) => {
    setIsSignUp(signUp);
    setAuthStep('form');
    setLoginMethod('email');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // Google Login Fallback simulation (dev only)
  const triggerMockGoogleLogin = async () => {
    const mockToken = `mock-google-token-${Math.floor(Math.random() * 900000 + 100000)}`;
    toast('Simulating Google Login for local development...', { icon: '🤖' });
    try {
      const loggedUser = await googleLogin(mockToken);
      if (loggedUser && loggedUser.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate(fromPath, { replace: true });
      }
    } catch (err) {}
  };

  // Form Submissions
  const onSignupSubmit = async (data) => {
    try {
      const loggedUser = await signup(data);
      if (loggedUser && loggedUser.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate(fromPath, { replace: true });
      }
    } catch (err) {}
  };

  const onEmailLoginSubmit = async (data) => {
    try {
      const loggedUser = await login(data.email, data.password, data.rememberMe);
      if (loggedUser && loggedUser.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate(fromPath, { replace: true });
      }
    } catch (err) {}
  };

  const onPhoneSubmit = async (data) => {
    try {
      await sendOtp(data.phone);
      setSavedPhone(data.phone);
      setResendCooldown(30);
      setAuthStep('otp');
    } catch (err) {}
  };

  const onOtpSubmit = async (data) => {
    try {
      const loggedUser = await verifyOtp(savedPhone, data.otp);
      if (loggedUser && loggedUser.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate(fromPath, { replace: true });
      }
    } catch (err) {}
  };

  const onResendOtp = async () => {
    if (resendCooldown > 0) return;
    try {
      await sendOtp(savedPhone);
      setResendCooldown(30);
    } catch (err) {}
  };

  const onForgotSubmit = async (data) => {
    try {
      await requestForgotPassword(data.email);
      setSavedResetEmail(data.email);
      setAuthStep('reset-password');
    } catch (err) {}
  };

  const onResetSubmit = async (data) => {
    try {
      await resetPassword(savedResetEmail, data.otp, data.password);
      // Success, send back to login form
      setAuthStep('form');
      setIsSignUp(false);
      setLoginMethod('email');
      emailLoginForm.reset({ email: savedResetEmail });
    } catch (err) {}
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-10 pt-[130px]">
      {/* Breadcrumb */}
      <div className="text-[13px] font-bold text-gray-400 mb-6 flex items-center gap-1.5 select-none">
        <span className="cursor-pointer hover:text-primary-green transition-colors" onClick={() => navigate('/')}>Home</span>
        <span>&gt;</span>
        <span className="text-gray-700">{isSignUp ? 'Sign Up' : 'Login'}</span>
      </div>

      {/* Main Container Panel */}
      <div className="bg-white border border-border-color rounded-[32px] overflow-hidden shadow-premium grid grid-cols-1 lg:grid-cols-12 min-h-[680px]">
        
        {/* Left Column: Welcome Banner & Features */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#F4F9F1] via-[#EAF2E4] to-[#DBEAD1] p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-10 right-4 w-12 h-12 bg-emerald-100/40 rounded-full blur-xl pointer-events-none" />
          <div className="absolute bottom-40 left-4 w-16 h-16 bg-green-200/30 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col gap-6 relative z-10">
            <div className="self-start px-3.5 py-1 bg-primary-green/10 text-primary-green font-bold text-[12px] rounded-full border border-primary-green/20 flex items-center gap-1">
              <span>Welcome to Karshaq</span>
              <span>🌿</span>
            </div>

            {isSignUp ? (
              <div className="flex flex-col gap-6">
                <h2 className="text-[32px] font-black text-gray-800 leading-tight text-left">
                  Join Karshaq Family<br />
                  <span className="text-primary-green font-bold">Eat Fresh, Live Healthy Everyday!</span>
                </h2>
                <p className="text-[14px] font-semibold text-gray-500 leading-relaxed text-left">
                  Create your account and enjoy a seamless shopping experience with exclusive benefits.
                </p>

                <div className="flex flex-col gap-4 mt-2 select-none">
                  <div className="flex items-start gap-3.5 text-left">
                    <div className="w-9 h-9 rounded-xl bg-white border border-green-100 flex items-center justify-center text-primary-green shrink-0 shadow-sm">
                      <Sparkles className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="text-[14px] font-black text-gray-800 leading-snug">Exclusive Offers</h4>
                      <p className="text-[12px] font-bold text-gray-400">Get access to special deals and discounts</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 text-left">
                    <div className="w-9 h-9 rounded-xl bg-white border border-green-100 flex items-center justify-center text-primary-green shrink-0 shadow-sm">
                      <ShieldCheck className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="text-[14px] font-black text-gray-800 leading-snug">Order Tracking</h4>
                      <p className="text-[12px] font-bold text-gray-400">Track your orders in real-time</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 text-left">
                    <div className="w-9 h-9 rounded-xl bg-white border border-green-100 flex items-center justify-center text-primary-green shrink-0 shadow-sm">
                      <Clock className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="text-[14px] font-black text-gray-800 leading-snug">Faster Checkout</h4>
                      <p className="text-[12px] font-bold text-gray-400">Save time with quick & easy checkout</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                <h2 className="text-[32px] font-black text-gray-800 leading-tight text-left">
                  Freshness You Can Trust,<br />
                  <span className="text-primary-green font-bold">Quality You Can Taste.</span>
                </h2>
                <p className="text-[14px] font-semibold text-gray-500 leading-relaxed text-left">
                  Join thousands of happy customers who trust us for farm fresh, chemical free produce delivered to their doorstep.
                </p>

                <div className="flex flex-col gap-4 mt-2 select-none">
                  <div className="flex items-start gap-3.5 text-left">
                    <div className="w-9 h-9 rounded-xl bg-white border border-green-100 flex items-center justify-center text-primary-green shrink-0 shadow-sm">
                      <CheckCircle2 className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="text-[14px] font-black text-gray-800 leading-snug">100% Farm Fresh</h4>
                      <p className="text-[12px] font-bold text-gray-400">Handpicked daily from farms</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 text-left">
                    <div className="w-9 h-9 rounded-xl bg-white border border-green-100 flex items-center justify-center text-primary-green shrink-0 shadow-sm">
                      <ShieldCheck className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="text-[14px] font-black text-gray-800 leading-snug">Chemical Free</h4>
                      <p className="text-[12px] font-bold text-gray-400">No harmful chemicals or pesticides</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 text-left">
                    <div className="w-9 h-9 rounded-xl bg-white border border-green-100 flex items-center justify-center text-primary-green shrink-0 shadow-sm">
                      <Truck className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="text-[14px] font-black text-gray-800 leading-snug">Fast & Reliable Delivery</h4>
                      <p className="text-[12px] font-bold text-gray-400">On time delivery, every time</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom graphic basket */}
          <div className="mt-8 lg:mt-0 relative w-full h-[220px] rounded-2xl overflow-hidden flex items-end justify-center select-none z-10 shadow-sm border border-black/5 bg-white">
            <img 
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600" 
              alt="Farm Basket" 
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        </div>

        {/* Right Column: Interactive Forms */}
        <div className="lg:col-span-7 p-8 lg:p-12 flex flex-col justify-between relative bg-white">
          
          {/* Form Header Tabs & Language Selection */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-8 select-none">
            <div className="flex items-center gap-6">
              <button 
                onClick={() => toggleMode(false)}
                className={`text-[16px] font-black relative pb-3 transition-colors cursor-pointer ${!isSignUp ? 'text-primary-green' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Login
                {!isSignUp && <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-primary-green rounded-full" />}
              </button>
              <button 
                onClick={() => toggleMode(true)}
                className={`text-[16px] font-black relative pb-3 transition-colors cursor-pointer ${isSignUp ? 'text-primary-green' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Sign Up
                {isSignUp && <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-primary-green rounded-full" />}
              </button>
            </div>

            {/* Language Selection */}
            <div className="relative">
              <button 
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-border-color rounded-xl hover:bg-gray-50 transition-colors text-[13px] font-bold text-gray-600 cursor-pointer"
              >
                <Globe className="w-4 h-4 text-gray-400" />
                <span>{selectedLang}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>
              {langDropdownOpen && (
                <div className="absolute right-0 top-[110%] w-[120px] bg-white border border-border-color rounded-xl shadow-lg z-50 overflow-hidden py-1">
                  {['English', 'Hindi', 'Telugu'].map((l) => (
                    <button 
                      key={l}
                      onClick={() => {
                        setSelectedLang(l);
                        setLangDropdownOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-gray-50 text-[12px] font-semibold text-gray-700 cursor-pointer"
                    >
                      {l}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Form Content Cards */}
          <div className="flex-1 flex flex-col justify-center max-w-[480px] mx-auto w-full">
            
            {/* 1. SIGNUP CARD */}
            {isSignUp && authStep === 'form' && (
              <div className="flex flex-col gap-6">
                <div className="text-left">
                  <h3 className="text-[26px] font-black text-gray-800 flex items-center gap-2">
                    Create Your Account <span className="text-primary-green">🌿</span>
                  </h3>
                  <p className="text-[13px] font-bold text-gray-400 mt-1">Join thousands of happy customers today!</p>
                </div>

                {/* Google Sign Up */}
                <div className="relative overflow-hidden w-full flex items-center justify-center">
                  <button 
                    onClick={triggerMockGoogleLogin}
                    className="w-full flex items-center justify-center gap-2.5 border border-border-color rounded-xl py-2.5 hover:bg-gray-50 transition-colors text-[13px] font-bold text-gray-600 cursor-pointer select-none"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12 5.04c1.62 0 3.08.56 4.22 1.65l3.15-3.15C17.45 1.84 14.97 1 12 1 7.35 1 3.4 3.65 1.5 7.5l3.9 3.03c.92-2.77 3.52-4.49 6.6-4.49z"/>
                      <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.47h6.44c-.28 1.47-1.11 2.72-2.36 3.56l3.66 2.84c2.14-1.97 3.75-4.88 3.75-8.51z"/>
                      <path fill="#FBBC05" d="M5.4 14.53c-.24-.72-.37-1.49-.37-2.28s.13-1.56.37-2.28L1.5 6.94C.54 8.87 0 11.02 0 13.25c0 2.23.54 4.38 1.5 6.31l3.9-3.03z"/>
                      <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.1.74-2.51 1.18-4.3 1.18-3.08 0-5.68-1.72-6.6-4.49l-3.9 3.03C3.4 20.35 7.35 23 12 23z"/>
                    </svg>
                    <span>Sign up with Google</span>
                  </button>
                  {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
                    <div 
                      id="google-btn-signup"
                      className={`absolute inset-0 opacity-0 cursor-pointer ${isGoogleAvailable ? 'pointer-events-auto' : 'pointer-events-none'}`}
                    />
                  )}
                </div>

                <div className="flex items-center gap-3 text-gray-300 text-[11px] font-black uppercase tracking-wider select-none">
                  <div className="h-[1px] bg-gray-100 flex-1" />
                  <span>or email signup</span>
                  <div className="h-[1px] bg-gray-100 flex-1" />
                </div>

                <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="flex flex-col gap-4 text-left">
                  {/* Full Name & Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-extrabold text-gray-500">Full Name</label>
                      <div className="flex items-center gap-2 border border-border-color rounded-xl px-3 py-2.5 bg-white focus-within:border-primary-green transition-colors">
                        <User className="w-4 h-4 text-gray-400 shrink-0" />
                        <input 
                          type="text" 
                          placeholder="Your Name" 
                          {...signupForm.register('name')}
                          className="bg-transparent border-none text-[13px] font-semibold text-gray-700 focus:outline-none w-full placeholder:text-gray-300"
                        />
                      </div>
                      {signupForm.formState.errors.name && <span className="text-[11px] text-red-500 font-bold">{signupForm.formState.errors.name.message}</span>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-extrabold text-gray-500">Email Address</label>
                      <div className="flex items-center gap-2 border border-border-color rounded-xl px-3 py-2.5 bg-white focus-within:border-primary-green transition-colors">
                        <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                        <input 
                          type="email" 
                          placeholder="name@email.com" 
                          {...signupForm.register('email')}
                          className="bg-transparent border-none text-[13px] font-semibold text-gray-700 focus:outline-none w-full placeholder:text-gray-300"
                        />
                      </div>
                      {signupForm.formState.errors.email && <span className="text-[11px] text-red-500 font-bold">{signupForm.formState.errors.email.message}</span>}
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-extrabold text-gray-500">Phone Number</label>
                    <div className="flex items-center gap-2 border border-border-color rounded-xl px-3 py-2.5 bg-white focus-within:border-primary-green transition-colors">
                      <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                      <input 
                        type="tel" 
                        placeholder="Indian Phone (e.g. 9876543210)" 
                        {...signupForm.register('phone')}
                        className="bg-transparent border-none text-[13px] font-semibold text-gray-700 focus:outline-none w-full placeholder:text-gray-300"
                      />
                    </div>
                    {signupForm.formState.errors.phone && <span className="text-[11px] text-red-500 font-bold">{signupForm.formState.errors.phone.message}</span>}
                  </div>

                  {/* Passwords */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-extrabold text-gray-500">Password</label>
                      <div className="flex items-center gap-2 border border-border-color rounded-xl px-3 py-2.5 bg-white focus-within:border-primary-green transition-colors">
                        <Lock className="w-4 h-4 text-gray-400 shrink-0" />
                        <input 
                          type={showPassword ? "text" : "password"} 
                          placeholder="Password" 
                          {...signupForm.register('password')}
                          className="bg-transparent border-none text-[13px] font-semibold text-gray-700 focus:outline-none w-full placeholder:text-gray-300"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {signupForm.formState.errors.password && <span className="text-[11px] text-red-500 font-bold">{signupForm.formState.errors.password.message}</span>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-extrabold text-gray-500">Confirm Password</label>
                      <div className="flex items-center gap-2 border border-border-color rounded-xl px-3 py-2.5 bg-white focus-within:border-primary-green transition-colors">
                        <Lock className="w-4 h-4 text-gray-400 shrink-0" />
                        <input 
                          type={showConfirmPassword ? "text" : "password"} 
                          placeholder="Confirm" 
                          {...signupForm.register('confirmPassword')}
                          className="bg-transparent border-none text-[13px] font-semibold text-gray-700 focus:outline-none w-full placeholder:text-gray-300"
                        />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-gray-400">
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {signupForm.formState.errors.confirmPassword && <span className="text-[11px] text-red-500 font-bold">{signupForm.formState.errors.confirmPassword.message}</span>}
                    </div>
                  </div>

                  {/* Agree checkbox */}
                  <label className="flex items-start gap-2.5 cursor-pointer mt-1 select-none">
                    <input 
                      type="checkbox" 
                      {...signupForm.register('agreeTerms')}
                      className="mt-0.5 rounded border-gray-300 text-primary-green focus:ring-primary-green cursor-pointer" 
                    />
                    <span className="text-[12px] font-bold text-gray-500 leading-snug">
                      I agree to the <span className="text-primary-green hover:underline cursor-pointer">Terms & Conditions</span> and <span className="text-primary-green hover:underline">Privacy Policy</span>
                    </span>
                  </label>
                  {signupForm.formState.errors.agreeTerms && <span className="text-[11px] text-red-500 font-bold">{signupForm.formState.errors.agreeTerms.message}</span>}

                  {/* Newsletter checkbox */}
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      {...signupForm.register('newsletter')}
                      className="mt-0.5 rounded border-gray-300 text-primary-green focus:ring-primary-green cursor-pointer" 
                    />
                    <span className="text-[12px] font-bold text-gray-500 leading-snug">
                      Receive farm newsletters, offers & updates (optional)
                    </span>
                  </label>

                  <button 
                    type="submit"
                    disabled={signupForm.formState.isSubmitting}
                    className="w-full mt-3 bg-primary-green hover:bg-dark-green text-white font-bold text-[14px] py-3 rounded-xl transition-all cursor-pointer shadow-md select-none disabled:opacity-50"
                  >
                    {signupForm.formState.isSubmitting ? 'Creating account...' : 'Create Account'}
                  </button>
                </form>

                <p className="text-[13px] font-semibold text-gray-400 text-center mt-2">
                  Already have an account?{' '}
                  <span onClick={() => toggleMode(false)} className="text-primary-green font-bold cursor-pointer hover:underline">
                    Login
                  </span>
                </p>
              </div>
            )}

            {/* 2. LOGIN CARD (EMAIL METHOD) */}
            {!isSignUp && loginMethod === 'email' && authStep === 'form' && (
              <div className="flex flex-col gap-6">
                <div className="text-left">
                  <h3 className="text-[26px] font-black text-gray-800 flex items-center gap-2">
                    Welcome Back! <span className="text-primary-green">👋</span>
                  </h3>
                  <p className="text-[13px] font-bold text-gray-400 mt-1">Login to continue to your account</p>
                </div>

                {/* Social Login Options */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="relative overflow-hidden w-full flex items-center justify-center">
                    <button 
                      onClick={triggerMockGoogleLogin}
                      className="w-full flex items-center justify-center gap-2 border border-border-color rounded-xl py-2.5 hover:bg-gray-50 transition-colors text-[13px] font-bold text-gray-600 cursor-pointer select-none"
                    >
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path fill="#EA4335" d="M12 5.04c1.62 0 3.08.56 4.22 1.65l3.15-3.15C17.45 1.84 14.97 1 12 1 7.35 1 3.4 3.65 1.5 7.5l3.9 3.03c.92-2.77 3.52-4.49 6.6-4.49z"/>
                        <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.47h6.44c-.28 1.47-1.11 2.72-2.36 3.56l3.66 2.84c2.14-1.97 3.75-4.88 3.75-8.51z"/>
                        <path fill="#FBBC05" d="M5.4 14.53c-.24-.72-.37-1.49-.37-2.28s.13-1.56.37-2.28L1.5 6.94C.54 8.87 0 11.02 0 13.25c0 2.23.54 4.38 1.5 6.31l3.9-3.03z"/>
                        <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.1.74-2.51 1.18-4.3 1.18-3.08 0-5.68-1.72-6.6-4.49l-3.9 3.03C3.4 20.35 7.35 23 12 23z"/>
                      </svg>
                      <span>Google</span>
                    </button>
                    {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
                      <div 
                        id="google-btn-login"
                        className={`absolute inset-0 opacity-0 cursor-pointer ${isGoogleAvailable ? 'pointer-events-auto' : 'pointer-events-none'}`}
                      />
                    )}
                  </div>
                  <button 
                    onClick={() => setLoginMethod('phone')}
                    className="flex items-center justify-center gap-2 border border-border-color rounded-xl py-2.5 hover:bg-gray-50 transition-colors text-[13px] font-bold text-gray-600 cursor-pointer select-none"
                  >
                    <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>Phone OTP</span>
                  </button>
                </div>

                <div className="flex items-center gap-3 text-gray-300 text-[11px] font-black uppercase tracking-wider select-none">
                  <div className="h-[1px] bg-gray-100 flex-1" />
                  <span>or email login</span>
                  <div className="h-[1px] bg-gray-100 flex-1" />
                </div>

                <form onSubmit={emailLoginForm.handleSubmit(onEmailLoginSubmit)} className="flex flex-col gap-4.5 text-left">
                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-extrabold text-gray-500">Email Address</label>
                    <div className="flex items-center gap-2 border border-border-color rounded-xl px-3 py-2.5 bg-white focus-within:border-primary-green transition-colors">
                      <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                      <input 
                        type="email" 
                        placeholder="name@email.com" 
                        {...emailLoginForm.register('email')}
                        className="bg-transparent border-none text-[13px] font-semibold text-gray-700 focus:outline-none w-full placeholder:text-gray-300"
                      />
                    </div>
                    {emailLoginForm.formState.errors.email && <span className="text-[11px] text-red-500 font-bold">{emailLoginForm.formState.errors.email.message}</span>}
                  </div>

                  {/* Password */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between select-none">
                      <label className="text-[12px] font-extrabold text-gray-500">Password</label>
                      <span 
                        onClick={() => setAuthStep('forgot')}
                        className="text-[11px] font-extrabold text-primary-green hover:underline cursor-pointer"
                      >
                        Forgot Password?
                      </span>
                    </div>
                    <div className="flex items-center gap-2 border border-border-color rounded-xl px-3 py-2.5 bg-white focus-within:border-primary-green transition-colors">
                      <Lock className="w-4 h-4 text-gray-400 shrink-0" />
                      <input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Enter password" 
                        {...emailLoginForm.register('password')}
                        className="bg-transparent border-none text-[13px] font-semibold text-gray-700 focus:outline-none w-full placeholder:text-gray-300"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {emailLoginForm.formState.errors.password && <span className="text-[11px] text-red-500 font-bold">{emailLoginForm.formState.errors.password.message}</span>}
                  </div>

                  {/* Remember me */}
                  <label className="flex items-center gap-2 cursor-pointer mt-1 select-none">
                    <input 
                      type="checkbox" 
                      {...emailLoginForm.register('rememberMe')}
                      className="rounded border-gray-300 text-primary-green focus:ring-primary-green cursor-pointer" 
                    />
                    <span className="text-[12px] font-extrabold text-gray-500">
                      Remember me
                    </span>
                  </label>

                  <button 
                    type="submit"
                    disabled={emailLoginForm.formState.isSubmitting}
                    className="w-full mt-3 bg-primary-green hover:bg-dark-green text-white font-bold text-[14px] py-3 rounded-xl transition-all cursor-pointer shadow-md select-none disabled:opacity-50"
                  >
                    {emailLoginForm.formState.isSubmitting ? 'Logging in...' : 'Login'}
                  </button>
                </form>

                <p className="text-[13px] font-semibold text-gray-400 text-center mt-2">
                  Don't have an account?{' '}
                  <span onClick={() => toggleMode(true)} className="text-primary-green font-bold cursor-pointer hover:underline">
                    Sign Up
                  </span>
                </p>
              </div>
            )}

            {/* 3. LOGIN CARD (PHONE NUMBER ENTRY METHOD) */}
            {!isSignUp && loginMethod === 'phone' && authStep === 'form' && (
              <div className="flex flex-col gap-6">
                <div className="text-left">
                  <h3 className="text-[26px] font-black text-gray-800 flex items-center gap-2">
                    Phone Login <span className="text-primary-green">📱</span>
                  </h3>
                  <p className="text-[13px] font-bold text-gray-400 mt-1">Enter your mobile number to receive a 6-digit OTP</p>
                </div>

                <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="flex flex-col gap-4 text-left">
                  {/* Phone */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-extrabold text-gray-500">Mobile Number</label>
                    <div className="flex items-center gap-2 border border-border-color rounded-xl px-3 py-2.5 bg-white focus-within:border-primary-green transition-colors">
                      <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                      <input 
                        type="tel" 
                        placeholder="e.g. 9876543210" 
                        {...phoneForm.register('phone')}
                        className="bg-transparent border-none text-[13px] font-semibold text-gray-700 focus:outline-none w-full placeholder:text-gray-300"
                      />
                    </div>
                    {phoneForm.formState.errors.phone && <span className="text-[11px] text-red-500 font-bold">{phoneForm.formState.errors.phone.message}</span>}
                  </div>

                  <button 
                    type="submit"
                    disabled={phoneForm.formState.isSubmitting}
                    className="w-full mt-3 bg-primary-green hover:bg-dark-green text-white font-bold text-[14px] py-3 rounded-xl transition-all cursor-pointer shadow-md select-none disabled:opacity-50"
                  >
                    {phoneForm.formState.isSubmitting ? 'Sending OTP...' : 'Send OTP'}
                  </button>
                </form>

                <div className="flex items-center justify-between text-[13px] font-bold mt-2">
                  <button onClick={() => setLoginMethod('email')} className="text-gray-400 hover:text-gray-600 flex items-center gap-1 cursor-pointer">
                    <ArrowLeft className="w-4 h-4" /> Use Email
                  </button>
                </div>
              </div>
            )}

            {/* 4. OTP ENTRY SCREEN */}
            {authStep === 'otp' && (
              <div className="flex flex-col gap-6">
                <div className="text-left">
                  <h3 className="text-[26px] font-black text-gray-800 flex items-center gap-2">
                    Enter Verification Code <span className="text-primary-green">🔑</span>
                  </h3>
                  <p className="text-[13px] font-bold text-gray-400 mt-1">We sent a 6-digit OTP code to +91 {savedPhone}</p>
                </div>

                <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="flex flex-col gap-4.5 text-left">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-extrabold text-gray-500">6-Digit OTP</label>
                    <div className="flex items-center gap-2 border border-border-color rounded-xl px-3 py-2.5 bg-white focus-within:border-primary-green transition-colors">
                      <Key className="w-4 h-4 text-gray-400 shrink-0" />
                      <input 
                        type="text" 
                        maxLength={6}
                        placeholder="Enter 6-digit code" 
                        {...otpForm.register('otp')}
                        className="bg-transparent border-none text-[13px] font-semibold text-gray-700 focus:outline-none w-full placeholder:text-gray-300 tracking-[0.25em]"
                      />
                    </div>
                    {otpForm.formState.errors.otp && <span className="text-[11px] text-red-500 font-bold">{otpForm.formState.errors.otp.message}</span>}
                  </div>

                  <button 
                    type="submit"
                    disabled={otpForm.formState.isSubmitting}
                    className="w-full mt-3 bg-primary-green hover:bg-dark-green text-white font-bold text-[14px] py-3 rounded-xl transition-all cursor-pointer shadow-md select-none disabled:opacity-50"
                  >
                    {otpForm.formState.isSubmitting ? 'Verifying...' : 'Verify & Login'}
                  </button>
                </form>

                <div className="flex items-center justify-between text-[13px] font-bold mt-2 select-none">
                  <button 
                    onClick={() => {
                      setAuthStep('form');
                      otpForm.reset();
                    }} 
                    className="text-gray-400 hover:text-gray-600 flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>

                  <button 
                    onClick={onResendOtp}
                    disabled={resendCooldown > 0}
                    className={`font-black ${resendCooldown > 0 ? 'text-gray-300' : 'text-primary-green hover:underline cursor-pointer'}`}
                  >
                    {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
                  </button>
                </div>
              </div>
            )}

            {/* 5. FORGOT PASSWORD REQUEST CARD */}
            {authStep === 'forgot' && (
              <div className="flex flex-col gap-6">
                <div className="text-left">
                  <h3 className="text-[26px] font-black text-gray-800 flex items-center gap-2">
                    Forgot Password? <span className="text-primary-green">🔒</span>
                  </h3>
                  <p className="text-[13px] font-bold text-gray-400 mt-1">Enter your registered email address to receive reset OTP code</p>
                </div>

                <form onSubmit={forgotForm.handleSubmit(onForgotSubmit)} className="flex flex-col gap-4 text-left">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-extrabold text-gray-500">Email Address</label>
                    <div className="flex items-center gap-2 border border-border-color rounded-xl px-3 py-2.5 bg-white focus-within:border-primary-green transition-colors">
                      <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                      <input 
                        type="email" 
                        placeholder="name@email.com" 
                        {...forgotForm.register('email')}
                        className="bg-transparent border-none text-[13px] font-semibold text-gray-700 focus:outline-none w-full placeholder:text-gray-300"
                      />
                    </div>
                    {forgotForm.formState.errors.email && <span className="text-[11px] text-red-500 font-bold">{forgotForm.formState.errors.email.message}</span>}
                  </div>

                  <button 
                    type="submit"
                    disabled={forgotForm.formState.isSubmitting}
                    className="w-full mt-3 bg-primary-green hover:bg-dark-green text-white font-bold text-[14px] py-3 rounded-xl transition-all cursor-pointer shadow-md select-none disabled:opacity-50"
                  >
                    {forgotForm.formState.isSubmitting ? 'Sending code...' : 'Request Reset OTP'}
                  </button>
                </form>

                <div className="flex text-[13px] font-bold mt-2">
                  <button 
                    onClick={() => setAuthStep('form')} 
                    className="text-gray-400 hover:text-gray-600 flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Login
                  </button>
                </div>
              </div>
            )}

            {/* 6. RESET PASSWORD CARD */}
            {authStep === 'reset-password' && (
              <div className="flex flex-col gap-6">
                <div className="text-left">
                  <h3 className="text-[26px] font-black text-gray-800 flex items-center gap-2">
                    Reset Your Password <span className="text-primary-green">🛡️</span>
                  </h3>
                  <p className="text-[13px] font-bold text-gray-400 mt-1">We sent a reset OTP code to {savedResetEmail}. Fill the form below to recover your account.</p>
                </div>

                <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="flex flex-col gap-4 text-left">
                  {/* Reset OTP */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-extrabold text-gray-500">6-Digit Reset OTP</label>
                    <div className="flex items-center gap-2 border border-border-color rounded-xl px-3 py-2.5 bg-white focus-within:border-primary-green transition-colors">
                      <Key className="w-4 h-4 text-gray-400 shrink-0" />
                      <input 
                        type="text" 
                        maxLength={6}
                        placeholder="Enter 6-digit code" 
                        {...resetForm.register('otp')}
                        className="bg-transparent border-none text-[13px] font-semibold text-gray-700 focus:outline-none w-full placeholder:text-gray-300 tracking-widest"
                      />
                    </div>
                    {resetForm.formState.errors.otp && <span className="text-[11px] text-red-500 font-bold">{resetForm.formState.errors.otp.message}</span>}
                  </div>

                  {/* Passwords */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-extrabold text-gray-500">New Password</label>
                      <div className="flex items-center gap-2 border border-border-color rounded-xl px-3 py-2.5 bg-white focus-within:border-primary-green transition-colors">
                        <Lock className="w-4 h-4 text-gray-400 shrink-0" />
                        <input 
                          type={showPassword ? "text" : "password"} 
                          placeholder="Password" 
                          {...resetForm.register('password')}
                          className="bg-transparent border-none text-[13px] font-semibold text-gray-700 focus:outline-none w-full placeholder:text-gray-300"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {watchResetPassword && (
                        <div className="mt-1 flex flex-col gap-1 select-none">
                          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden flex">
                            <div className={`h-full ${strength.color}`} style={{ width: `${(strength.score / 5) * 100}%` }} />
                          </div>
                          <span className="text-[10px] font-black text-gray-500">Strength: {strength.text}</span>
                        </div>
                      )}
                      {resetForm.formState.errors.password && <span className="text-[11px] text-red-500 font-bold">{resetForm.formState.errors.password.message}</span>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-extrabold text-gray-500">Confirm Password</label>
                      <div className="flex items-center gap-2 border border-border-color rounded-xl px-3 py-2.5 bg-white focus-within:border-primary-green transition-colors">
                        <Lock className="w-4 h-4 text-gray-400 shrink-0" />
                        <input 
                          type={showConfirmPassword ? "text" : "password"} 
                          placeholder="Confirm" 
                          {...resetForm.register('confirmPassword')}
                          className="bg-transparent border-none text-[13px] font-semibold text-gray-700 focus:outline-none w-full placeholder:text-gray-300"
                        />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-gray-400">
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {resetForm.formState.errors.confirmPassword && <span className="text-[11px] text-red-500 font-bold">{resetForm.formState.errors.confirmPassword.message}</span>}
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={resetForm.formState.isSubmitting}
                    className="w-full mt-3 bg-primary-green hover:bg-dark-green text-white font-bold text-[14px] py-3 rounded-xl transition-all cursor-pointer shadow-md select-none disabled:opacity-50"
                  >
                    {resetForm.formState.isSubmitting ? 'Resetting password...' : 'Reset Password'}
                  </button>
                </form>

                <div className="flex text-[13px] font-bold mt-2">
                  <button 
                    onClick={() => {
                      setAuthStep('forgot');
                      resetForm.reset();
                    }} 
                    className="text-gray-400 hover:text-gray-600 flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Bottom Security Seals Deck */}
          <div className="border-t border-gray-100 pt-6 mt-8 grid grid-cols-3 gap-2 select-none">
            <div className="flex flex-col md:flex-row items-center gap-2 justify-center">
              <ShieldCheck className="w-6 h-6 text-primary-green/80 shrink-0" />
              <div className="text-center md:text-left">
                <h5 className="text-[10px] font-black text-gray-800 leading-tight">Secure Payments</h5>
                <p className="text-[9px] text-gray-400 font-bold">100% safe & secure</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-2 justify-center border-x border-gray-100">
              <CheckCircle2 className="w-6 h-6 text-primary-green/80 shrink-0" />
              <div className="text-center md:text-left">
                <h5 className="text-[10px] font-black text-gray-800 leading-tight">Privacy Protected</h5>
                <p className="text-[9px] text-gray-400 font-bold">Your data is safe</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-2 justify-center">
              <Sparkles className="w-6 h-6 text-primary-green/80 shrink-0" />
              <div className="text-center md:text-left">
                <h5 className="text-[10px] font-black text-gray-800 leading-tight">Trusted Quality</h5>
                <p className="text-[9px] text-gray-400 font-bold">Happy customers</p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
      
      {/* Why Choose Karshaq Strip (Only visible on Login mode) */}
      {!isSignUp && authStep === 'form' && (
        <div className="mt-8 bg-[#F4F9F1] border border-border-color rounded-2xl py-6 px-8 flex flex-col md:flex-row items-center justify-between gap-6 select-none relative overflow-hidden">
          <h4 className="text-[15px] font-black text-gray-800 shrink-0">Why Choose Karshaq?</h4>
          
          <div className="flex flex-wrap items-center gap-6 justify-center md:justify-end flex-1">
            <div className="flex items-center gap-2 bg-white/60 px-3.5 py-2 rounded-xl border border-green-100/50">
              <span className="text-[14px] font-black text-primary-green">50,000+</span>
              <span className="text-[11px] font-bold text-gray-500">Happy Customers</span>
            </div>

            <div className="flex items-center gap-2 bg-white/60 px-3.5 py-2 rounded-xl border border-green-100/50">
              <span className="text-[14px] font-black text-primary-green">100%</span>
              <span className="text-[11px] font-bold text-gray-500">Chemical Free</span>
            </div>

            <div className="flex items-center gap-2 bg-white/60 px-3.5 py-2 rounded-xl border border-green-100/50">
              <Truck className="w-4 h-4 text-primary-green" />
              <span className="text-[11px] font-bold text-gray-500">Free Delivery above ₹499</span>
            </div>

            <div className="flex items-center gap-2 bg-white/60 px-3.5 py-2 rounded-xl border border-green-100/50">
              <span className="text-[14px] font-black text-primary-green">4.9/5</span>
              <span className="text-[11px] font-bold text-gray-500">Customer Rating</span>
            </div>
          </div>
          
          <div className="hidden xl:block absolute right-4 bottom-0 w-16 h-16 pointer-events-none opacity-20">
            <Globe className="w-full h-full text-primary-green" />
          </div>
        </div>
      )}
    </div>
  );
}
