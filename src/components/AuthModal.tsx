import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { X, Mail, Lock, User as UserIcon, Eye, EyeOff, ShieldCheck, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AuthModal() {
  const { 
    authModalOpen, 
    setAuthModalOpen, 
    authModalTab, 
    setAuthModalTab,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    resetPassword
  } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!authModalOpen) return null;

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError(null);
    setSuccessMsg(null);
  };

  const handleTabChange = (tab: 'login' | 'register' | 'forgot') => {
    resetForm();
    setAuthModalTab(tab);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    if (!email.trim() || !password.trim()) {
      setError('कृपया ईमेल आणि पासवर्ड टाका.');
      return;
    }

    setIsSubmitting(true);
    const res = await loginWithEmail(email.trim(), password);
    setIsSubmitting(false);
    if (!res.success) {
      setError(res.error || 'लॉगिन अयशस्वी.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!name.trim()) {
      setError('कृपया तुमचे पूर्ण नाव टाका.');
      return;
    }
    if (!email.trim()) {
      setError('कृपया वैध ईमेल पत्ता टाका.');
      return;
    }
    if (password.length < 6) {
      setError('पासवर्ड किमान ६ अक्षरांचा असावा.');
      return;
    }
    if (password !== confirmPassword) {
      setError('पासवर्ड आणि कन्फर्म पासवर्ड जुळत नाहीत.');
      return;
    }

    setIsSubmitting(true);
    const res = await registerWithEmail(name.trim(), email.trim(), password);
    setIsSubmitting(false);
    if (!res.success) {
      setError(res.error || 'नोंदणी अयशस्वी.');
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email.trim()) {
      setError('कृपया तुमचा नोंदणीकृत ईमेल पत्ता टाका.');
      return;
    }

    setIsSubmitting(true);
    const res = await resetPassword(email.trim());
    setIsSubmitting(false);
    if (res.success) {
      setSuccessMsg('पासवर्ड रिसेट लिंक तुमच्या ईमेलवर पाठवली आहे. कृपया तुमचे इनबॉक्स (किंवा स्पॅम फोल्डर) तपासा.');
    } else {
      setError(res.error || 'पासवर्ड रिसेट लिंक पाठवण्यात अयशस्वी.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
        
        {/* Header Bar with Logo */}
        <div className="bg-gradient-to-r from-brand-red via-brand-saffron to-brand-gold p-6 text-white text-center relative">
          <button 
            onClick={() => setAuthModalOpen(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/10 hover:bg-black/20 rounded-full p-1.5 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl mb-2 shadow-inner">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-2xl font-black tracking-wide">राज्यवाणी</h3>
          <p className="text-xs text-white/90 font-medium mt-0.5">महाराष्ट्राचे अग्रगण्य डिजिटल वृत्तपत्र पोर्टल</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-100 bg-gray-50/50 p-1">
          <button
            onClick={() => handleTabChange('login')}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
              authModalTab === 'login' 
                ? 'bg-white text-brand-red shadow-sm border border-gray-200/60' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            लॉगिन (Sign In)
          </button>
          <button
            onClick={() => handleTabChange('register')}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
              authModalTab === 'register' 
                ? 'bg-white text-brand-red shadow-sm border border-gray-200/60' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            नवीन खाते (Register)
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* Status Banners */}
          {error && (
            <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-700 text-xs sm:text-sm animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3.5 bg-green-50 border border-green-200 rounded-xl flex items-start gap-2.5 text-green-700 text-xs sm:text-sm animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: LOGIN */}
          {authModalTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  ईमेल पत्ता (Email)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="उदा. name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50/80 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    पासवर्ड (Password)
                  </label>
                  <button
                    type="button"
                    onClick={() => handleTabChange('forgot')}
                    className="text-xs font-semibold text-brand-red hover:underline cursor-pointer"
                  >
                    पासवर्ड विसरलात?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-gray-50/80 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 p-0.5"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brand-red hover:bg-brand-saffron text-white py-3 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>लॉगिन होत आहे...</span>
                  </>
                ) : (
                  <>
                    <span>सुरक्षित लॉगिन करा</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 2: REGISTER */}
          {authModalTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  पूर्ण नाव (Full Name)
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="उदा. आकाश चव्हाण"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50/80 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  ईमेल पत्ता (Email)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50/80 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  पासवर्ड (Password - किमान ६ अक्षरे)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-gray-50/80 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 p-0.5"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  पासवर्ड पुन्हा टाका (Confirm Password)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50/80 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brand-red hover:bg-brand-saffron text-white py-3 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>खाते तयार होत आहे...</span>
                  </>
                ) : (
                  <>
                    <span>नवीन खाते उघडा</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 3: FORGOT PASSWORD */}
          {authModalTab === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div className="text-center mb-2">
                <h4 className="text-base font-bold text-gray-900">पासवर्ड विसरलात?</h4>
                <p className="text-xs text-gray-500 mt-1">
                  तुमचा नोंदणीकृत ईमेल पत्ता प्रविष्ट करा. आम्ही तुम्हाला पासवर्ड रिसेट करण्याची सुरक्षित लिंक पाठवू.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  ईमेल पत्ता (Email)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50/80 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brand-red hover:bg-brand-saffron text-white py-3 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>लिंक पाठवत आहे...</span>
                  </>
                ) : (
                  <span>रिसेट लिंक पाठवा</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('login')}
                className="w-full text-center text-xs font-bold text-gray-500 hover:text-gray-800 cursor-pointer pt-1"
              >
                ← लॉगिनकडे परत जा
              </button>
            </form>
          )}

          {/* Social Google Login Divider */}
          {authModalTab !== 'forgot' && (
            <>
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-gray-400 font-semibold tracking-wider">किंवा</span>
                </div>
              </div>

              <button
                type="button"
                onClick={loginWithGoogle}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl text-gray-700 text-sm font-bold shadow-sm transition-all cursor-pointer hover:border-gray-400 active:scale-[0.99]"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Google द्वारे १-क्लिक लॉगिन</span>
              </button>
            </>
          )}

          {/* Privacy & Terms note */}
          <p className="text-[11px] text-gray-400 text-center mt-4">
            लॉगिन किंवा नोंदणी करून तुम्ही राज्यवाणीच्या{' '}
            <a href="/terms" className="underline hover:text-gray-600">अटी व शर्ती</a> आणि{' '}
            <a href="/privacy-policy" className="underline hover:text-gray-600">गोपनीयता धोरणास</a> संमती देता.
          </p>
        </div>

      </div>
    </div>
  );
}
