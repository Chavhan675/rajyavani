import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { 
  X, 
  User as UserIcon, 
  Mail, 
  ShieldCheck, 
  Key, 
  MapPin, 
  Bookmark, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  LogOut,
  Sparkles,
  Bot
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { MAHARASHTRA_DISTRICTS } from '../data/maharashtraDistricts';

export default function UserProfileModal() {
  const { 
    user, 
    userRole, 
    isSuperAdmin,
    profileModalOpen, 
    setProfileModalOpen, 
    setBookmarksModalOpen,
    bookmarks,
    updateProfileData,
    changePassword,
    sendVerificationEmail,
    signOut 
  } = useAuth();

  const [displayName, setDisplayName] = useState(userRole?.displayName || user?.displayName || '');
  const [preferredDistrict, setPreferredDistrict] = useState(userRole?.preferredDistrict || 'मुंबई');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [twoFactor, setTwoFactor] = useState(userRole?.twoFactorEnabled || false);

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [isSendingVerif, setIsSendingVerif] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!profileModalOpen || !user) return null;

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    setIsUpdatingProfile(true);

    const res = await updateProfileData({
      displayName,
      preferredDistrict,
      twoFactorEnabled: twoFactor
    });

    setIsUpdatingProfile(false);
    if (res.success) {
      setStatusMsg({ type: 'success', text: 'तुमची प्रोफाइल माहिती यशस्वीरीत्या सेव्ह झाली!' });
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'प्रोफाइल अपडेट अयशस्वी.' });
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (newPassword.length < 6) {
      setStatusMsg({ type: 'error', text: 'नवीन पासवर्ड किमान ६ अक्षरांचा असावा.' });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setStatusMsg({ type: 'error', text: 'नवीन पासवर्ड जुळत नाही.' });
      return;
    }

    setIsChangingPass(true);
    const res = await changePassword(newPassword);
    setIsChangingPass(false);

    if (res.success) {
      setNewPassword('');
      setConfirmNewPassword('');
      setStatusMsg({ type: 'success', text: 'पासवर्ड यशस्वीरीत्या बदलला आहे!' });
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'पासवर्ड बदलण्यात अयशस्वी.' });
    }
  };

  const handleSendVerification = async () => {
    setStatusMsg(null);
    setIsSendingVerif(true);
    const res = await sendVerificationEmail();
    setIsSendingVerif(false);
    if (res.success) {
      setStatusMsg({ type: 'success', text: 'पडताळणी ईमेल पाठवला आहे. कृपया इनबॉक्स तपासा.' });
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'ईमेल पाठवण्यात अयशस्वी.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gray-900 text-white p-5 flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-red flex items-center justify-center font-bold text-base shadow-md">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover" />
              ) : (
                (user.displayName?.charAt(0) || user.email?.charAt(0) || 'U').toUpperCase()
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span>{userRole?.displayName || user.displayName || 'वापरकर्ता प्रोफाइल'}</span>
                {isSuperAdmin ? (
                  <span className="bg-amber-400/20 text-amber-300 text-[11px] px-2 py-0.5 rounded-full font-black border border-amber-400/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" /> सुपर अ‍ॅडमीन (Owner)
                  </span>
                ) : (
                  <span className="bg-blue-500/20 text-blue-300 text-[11px] px-2 py-0.5 rounded-full font-bold border border-blue-400/30">
                    वाचक (Reader)
                  </span>
                )}
              </h3>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
          </div>

          <button
            onClick={() => setProfileModalOpen(false)}
            className="text-gray-400 hover:text-white p-1.5 rounded-full hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-gray-800">
          
          {/* Status Message */}
          {statusMsg && (
            <div className={`p-3.5 rounded-xl flex items-start gap-2.5 text-xs sm:text-sm font-medium ${
              statusMsg.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Quick Access Action Bar for Super Admin */}
          {isSuperAdmin && (
            <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-xl border border-red-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Bot className="w-6 h-6 text-brand-red" />
                <div>
                  <h4 className="text-sm font-bold text-gray-900">AI डेस्क व मुख्य नियंत्रण कक्ष</h4>
                  <p className="text-xs text-gray-600">सर्व बातम्या, युझर्स, व ऑटोमेशनचे नियंत्रण करा</p>
                </div>
              </div>
              <Link 
                to="/admin" 
                onClick={() => setProfileModalOpen(false)}
                className="bg-brand-red hover:bg-brand-saffron text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-colors shadow-sm"
              >
                डॅशबोर्ड उघडा →
              </Link>
            </div>
          )}

          {/* Bookmarks Summary */}
          <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-brand-red/10 rounded-xl flex items-center justify-center text-brand-red">
                <Bookmark className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">माझ्या सेव्ह केलेल्या बातम्या</h4>
                <p className="text-xs text-gray-500">एकूण {bookmarks.length} बातम्या जतन केलेल्या आहेत</p>
              </div>
            </div>
            <button
              onClick={() => {
                setProfileModalOpen(false);
                setBookmarksModalOpen(true);
              }}
              className="text-xs font-bold bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 px-3 py-1.5 rounded-lg transition-all shadow-2xs cursor-pointer"
            >
              बातम्या पहा ({bookmarks.length})
            </button>
          </div>

          {/* Form 1: General Info */}
          <form onSubmit={handleProfileSave} className="space-y-4 pt-2 border-t border-gray-100">
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-brand-red" /> वैयक्तिक माहिती व पसंती
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">पूर्ण नाव</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="नाव प्रविष्ट करा"
                  className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">आवडता जिल्हा</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <select
                    value={preferredDistrict}
                    onChange={(e) => setPreferredDistrict(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red"
                  >
                    {MAHARASHTRA_DISTRICTS.map((dist) => (
                      <option key={dist.slug} value={dist.nameMarathi}>
                        {dist.nameMarathi} ({dist.division})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Email Verification Status */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-semibold text-gray-700">ईमेल पडताळणी स्थिती:</span>
                {user.emailVerified ? (
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                    ✓ पडताळणी पूर्ण
                  </span>
                ) : (
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    अपूर्ण
                  </span>
                )}
              </div>
              {!user.emailVerified && (
                <button
                  type="button"
                  onClick={handleSendVerification}
                  disabled={isSendingVerif}
                  className="text-xs font-bold text-brand-red hover:underline disabled:opacity-50 cursor-pointer"
                >
                  {isSendingVerif ? 'पाठवत आहे...' : 'पडताळणी लिंक पाठवा'}
                </button>
              )}
            </div>

            {/* Two-Factor Option */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div>
                <span className="text-xs font-bold text-gray-800 block">द्वि-स्तरीय सुरक्षा (Two-Factor Auth)</span>
                <span className="text-[11px] text-gray-500">प्रत्येक महत्त्वाच्या क्रियेसाठी अतिरिक्त सुरक्षा स्तर</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={twoFactor} 
                  onChange={(e) => setTwoFactor(e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-red"></div>
              </label>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="bg-gray-900 hover:bg-black text-white text-xs font-bold py-2 px-5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isUpdatingProfile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>बदल सेव्ह करा</span>
              </button>
            </div>
          </form>

          {/* Form 2: Password Change */}
          <form onSubmit={handlePasswordChange} className="space-y-4 pt-4 border-t border-gray-100">
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Key className="w-4 h-4 text-brand-red" /> पासवर्ड बदला (Change Password)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">नवीन पासवर्ड</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="किमान ६ अक्षरे"
                  className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">पासवर्ड पुष्टी करा</label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="नवीन पासवर्ड पुन्हा टाका"
                  className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isChangingPass || !newPassword}
                className="bg-brand-red hover:bg-brand-saffron text-white text-xs font-bold py-2 px-5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isChangingPass ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>पासवर्ड अपडेट करा</span>
              </button>
            </div>
          </form>

        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <p className="text-[11px] text-gray-400">
            सक्रिय सत्र (Active Session) • ३० मिनिटे निष्क्रियतेनंतर ऑटो-लॉगआउट
          </p>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>लॉगआउट करा</span>
          </button>
        </div>

      </div>
    </div>
  );
}
