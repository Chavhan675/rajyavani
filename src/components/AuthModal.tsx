import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { X, Mail, Lock, User as UserIcon, Eye, EyeOff, ShieldCheck, ArrowRight, Loader2, AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react';

export default function AuthModal() {
  const { 
    authModalOpen, 
    setAuthModalOpen, 
    authModalTab, 
    setAuthModalTab,
    loginWithEmail,
    registerWithEmail,
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

  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

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

        {/* Role Permissions Information Note */}
        <div className="bg-amber-50/80 border-b border-amber-100 px-4 py-2 text-[11px] text-amber-900 flex items-center justify-between gap-2">
          <span>
            👑 <strong>सुपर अ‍ॅडमीन:</strong> chavhanakash675@gmail.com | 👤 <strong>इतर सर्व:</strong> साधे वाचक (Simple User)
          </span>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* Status Banners */}
          {error && (
            <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-700 text-xs sm:text-sm animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p>{error}</p>
                {error.includes('नोंदणीकृत') && (
                  <button
                    type="button"
                    onClick={() => handleTabChange('register')}
                    className="mt-1 text-xs font-bold text-brand-red underline cursor-pointer"
                  >
                    नवीन खाते तयार करण्यासाठी येथे क्लिक करा →
                  </button>
                )}
              </div>
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
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    ईमेल पत्ता (Email)
                  </label>
                  <button
                    type="button"
                    onClick={() => setEmail('chavhanakash675@gmail.com')}
                    className="text-[10px] font-bold text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded border border-amber-200 cursor-pointer"
                  >
                    👑 सुपर अ‍ॅडमीन भरा
                  </button>
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="उदा. name@example.com किंवा chavhanakash675@gmail.com"
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
