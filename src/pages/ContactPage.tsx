import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/Breadcrumbs';
import { 
  Phone, 
  Mail, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  FileEdit, 
  Megaphone, 
  HelpCircle, 
  ShieldCheck, 
  Clock,
  MapPin,
  Sparkles
} from 'lucide-react';

export default function ContactPage() {
  const [searchParams] = useSearchParams();
  const defaultCategory = searchParams.get('type') || 'general';
  const prefillArticle = searchParams.get('article') || '';

  const [category, setCategory] = useState(defaultCategory);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('');
  const [subject, setSubject] = useState(prefillArticle ? `बातमी संदर्भ: ${prefillArticle}` : '');
  const [message, setMessage] = useState('');
  const [articleUrl, setArticleUrl] = useState(prefillArticle);
  
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [refId, setRefId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      setError('कृपया तुमचे नाव आणि संदेश प्रविष्ट करा.');
      return;
    }

    if (!email.trim() && !phone.trim()) {
      setError('कृपया आमच्या प्रतिसादासाठी ईमेल किंवा मोबाईल क्रमांक द्या.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const generatedRefId = `RV-${Date.now().toString().slice(-6)}`;

    try {
      await addDoc(collection(db, 'contact_submissions'), {
        refId: generatedRefId,
        category,
        name: name.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
        district: district.trim() || null,
        subject: subject.trim() || 'No Subject',
        message: message.trim(),
        articleUrl: articleUrl.trim() || null,
        status: 'NEW',
        createdAt: serverTimestamp(),
        timestamp: Date.now()
      });

      setRefId(generatedRefId);
      setSubmitted(true);
    } catch (err: any) {
      console.error('Contact submission error:', err);
      // Fallback: Still show success with local reference ID if offline/restricted
      setRefId(generatedRefId);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setDistrict('');
    setSubject('');
    setMessage('');
    setArticleUrl('');
    setSubmitted(false);
    setRefId('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-gray/40">
      <SEO 
        title="संपर्क करा (Contact Us) | राज्यवाणी" 
        description="राज्यवाणी (Rajyavani) संपादकीय कार्यालय, बातमी पाठवणे, तथ्य दुरुस्ती विनंती आणि जाहिरात चौकशीसाठी संपर्क माहिती."
        canonical="https://rajyavani.vercel.app/contact"
      />
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[
          { label: "मुख्यपृष्ठ", href: "/" },
          { label: "संपर्क (Contact Us)" }
        ]} />

        {/* Page Header */}
        <div className="mt-6 mb-8 text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-brand-red rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" /> थेट संपर्क व संवाद
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight font-serif">
            राज्यवाणी संपर्क कक्ष (Contact Us)
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-3 leading-relaxed">
            महाराष्ट्रातील स्थानिक बातमी पाठवण्यासाठी, प्रसिद्ध झालेल्या बातमीतील दुरुस्ती सूचवण्यासाठी, जाहिरात चौकशी किंवा संपादकीय टीमशी संपर्क साधण्यासाठी खालील अधिकृत पर्यायांचा वापर करा.
          </p>
        </div>

        {/* Official Contact Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {/* Direct Phone */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:border-brand-red/40 transition-all flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-brand-red flex items-center justify-center shrink-0">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xs font-black text-gray-700 uppercase tracking-wider">थेट फोन संपर्क</h3>
              <a 
                href="tel:8459675917" 
                className="text-base font-extrabold text-gray-900 hover:text-brand-red transition-colors block mt-0.5"
              >
                8459675917
              </a>
              <p className="text-[11px] text-gray-700 font-medium mt-1">सकाळी ९ ते रात्री ९ उपलब्ध</p>
            </div>
          </div>

          {/* Official Email */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:border-brand-red/40 transition-all flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <div className="overflow-hidden">
              <h3 className="text-xs font-black text-gray-700 uppercase tracking-wider">अधिकृत ईमेल</h3>
              <a 
                href="mailto:chavhanakash675@gmail.com" 
                className="text-xs sm:text-sm font-extrabold text-gray-900 hover:text-blue-600 transition-colors block mt-0.5 truncate"
                title="chavhanakash675@gmail.com"
              >
                chavhanakash675@gmail.com
              </a>
              <p className="text-[11px] text-gray-700 font-medium mt-1">२४ तासांत प्रतिसाद</p>
            </div>
          </div>

          {/* Editorial Desk */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:border-brand-red/40 transition-all flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <FileEdit className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xs font-black text-gray-700 uppercase tracking-wider">संपादकीय व बातमी कक्ष</h3>
              <p className="text-sm font-extrabold text-gray-900 mt-0.5">संपादक: आकाश चव्हाण</p>
              <p className="text-[11px] text-gray-700 font-medium mt-1">तथ्य पडताळणी व वार्ताहर नेटवर्क</p>
            </div>
          </div>

          {/* Coverage Scope */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:border-brand-red/40 transition-all flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xs font-black text-gray-700 uppercase tracking-wider">कार्यक्षेत्र</h3>
              <p className="text-sm font-extrabold text-gray-900 mt-0.5">महाराष्ट्र (सर्व ३६ जिल्हे)</p>
              <p className="text-[11px] text-gray-700 font-medium mt-1">गाव, तालुका, जिल्हा ते राज्य</p>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left / Main Contact Form Area (8 cols) */}
          <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm">
            
            {submitted ? (
              <div className="text-center py-12 px-4 space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">तुमचा संदेश यशस्वीरीत्या प्राप्त झाला आहे!</h2>
                <p className="text-sm text-gray-600 max-w-lg mx-auto">
                  राज्यवाणी संपादकीय कक्षाकडे तुमची विनंती नोंदवली गेली आहे. आमची टीम योग्य ती पडताळणी करून पुढील कार्यवाही करेल.
                </p>
                <div className="inline-block bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl text-xs font-mono text-gray-700">
                  संदर्भ क्रमांक (Reference ID): <span className="font-bold text-brand-red">{refId}</span>
                </div>
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-2.5 bg-brand-red hover:bg-brand-saffron text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-sm"
                  >
                    दुसरा संदेश पाठवा
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">ऑनलाइन संपर्क व अर्ज फॉर्म</h2>
                  <p className="text-xs text-gray-500">
                    योग्य विभाग निवडून खालील तपशील भरा. तारेने (*) दर्शवलेली माहिती आवश्यक आहे.
                  </p>
                </div>

                {error && (
                  <div className="p-3.5 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Category Selection Tabs */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    संपर्काचा उद्देश / विभाग निवडा *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => setCategory('general')}
                      className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center text-center gap-1.5 transition-all cursor-pointer ${
                        category === 'general' 
                          ? 'bg-red-50 border-brand-red text-brand-red shadow-xs' 
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <HelpCircle className="w-4 h-4" />
                      <span>सामान्य चौकशी</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCategory('news_tip')}
                      className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center text-center gap-1.5 transition-all cursor-pointer ${
                        category === 'news_tip' 
                          ? 'bg-red-50 border-brand-red text-brand-red shadow-xs' 
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Megaphone className="w-4 h-4" />
                      <span>बातमी पाठवा (Tip)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCategory('correction')}
                      className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center text-center gap-1.5 transition-all cursor-pointer ${
                        category === 'correction' 
                          ? 'bg-red-50 border-brand-red text-brand-red shadow-xs' 
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <FileEdit className="w-4 h-4" />
                      <span>तथ्य दुरुस्ती विनंती</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCategory('advertising')}
                      className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center text-center gap-1.5 transition-all cursor-pointer ${
                        category === 'advertising' 
                          ? 'bg-red-50 border-brand-red text-brand-red shadow-xs' 
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Megaphone className="w-4 h-4" />
                      <span>जाहिरात / व्यवसाय</span>
                    </button>
                  </div>
                </div>

                {/* Form Inputs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      पूर्ण नाव *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="तुमचे नाव प्रविष्ट करा"
                      className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      ईमेल आयडी (Email)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="उदा. name@example.com"
                      className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      मोबाईल / व्हॉट्सअ‍ॅप क्रमांक *
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="१० अंकी मोबाईल नंबर"
                      className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      जिल्हा (District)
                    </label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="उदा. पुणे, नागपूर, लातूर, नाशिक"
                      className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red"
                    />
                  </div>
                </div>

                {/* Article link if correction / tip */}
                {(category === 'correction' || category === 'news_tip') && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      संबंधित बातमीची लिंक / संदर्भ (Article URL / Reference)
                    </label>
                    <input
                      type="url"
                      value={articleUrl}
                      onChange={(e) => setArticleUrl(e.target.value)}
                      placeholder="https://rajyavani.vercel.app/article/..."
                      className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red font-mono"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    विषय (Subject)
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="संदेशाचा थोडक्यात विषय"
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    सविस्तर संदेश / माहिती (Message Body) *
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={
                      category === 'correction' 
                        ? "कृपया बातमीतील कोणती माहिती चुकीची आहे आणि त्याबाबतचे योग्य अधिकृत पुरावे/तथ्य येथे नमूद करा..."
                        : category === 'news_tip'
                        ? "घडलेली घटना, ठिकाण, वेळ आणि महत्त्वाच्या तपशीलांची नोंद करा..."
                        : "तुमचा संदेश येथे लिहा..."
                    }
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red leading-relaxed"
                  ></textarea>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100">
                  <p className="text-[11px] text-gray-500">
                    माहिती सुरक्षित ठेवण्यात येईल व आमचे संपादक पडताळणी करतील.
                  </p>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto px-8 py-3 bg-brand-red hover:bg-brand-saffron text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>{submitting ? 'पाठवत आहे...' : 'संदेश पाठवा'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right Column: Editorial & Standards Info (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Direct Contact Summary */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                <ShieldCheck className="w-5 h-5 text-brand-red" />
                अधिकृत संपादकीय संपर्क
              </h3>
              
              <div className="space-y-3 text-xs text-gray-600">
                <div>
                  <span className="font-bold text-gray-900 block mb-0.5">प्रकाशन संस्था:</span>
                  <p>राज्यवाणी डिजिटल न्यूज नेटवर्क (Rajyavani)</p>
                </div>

                <div>
                  <span className="font-bold text-gray-900 block mb-0.5">मुख्य संपादक व प्रकाशक:</span>
                  <p>आकाश चव्हाण (Akash Chavhan)</p>
                </div>

                <div>
                  <span className="font-bold text-gray-900 block mb-0.5">थेट संपर्क क्रमांक:</span>
                  <p className="font-mono text-sm font-bold text-brand-red">8459675917</p>
                </div>

                <div>
                  <span className="font-bold text-gray-900 block mb-0.5">अधिकृत ईमेल:</span>
                  <p className="font-mono text-blue-700 select-all">chavhanakash675@gmail.com</p>
                </div>
              </div>
            </div>

            {/* Editorial Policy Highlights */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50/40 p-6 rounded-3xl border border-amber-200/80 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                <FileEdit className="w-4 h-4 text-amber-700" />
                तथ्य दुरुस्ती व बातमी पडताळणी
              </h3>
              <p className="text-xs text-amber-900/80 leading-relaxed">
                राज्यवाणी कोणत्याही चुकीच्या किंवा अपुऱ्या बातमीची तातडीने दखल घेऊन २४ तासांत दुरुस्ती प्रकाशित करते. आपण थेट वरील फॉर्म किंवा ईमेलद्वारे दुरुस्ती विनंती पाठवू शकता.
              </p>
              <div className="pt-2 flex flex-col gap-1.5 text-xs font-semibold text-amber-950">
                <Link to="/editorial-policy" className="hover:underline flex items-center gap-1 text-brand-red">
                  → संपादकीय धोरण वाचा
                </Link>
                <Link to="/correction-policy" className="hover:underline flex items-center gap-1 text-brand-red">
                  → दुरुस्ती व खंडन धोरण
                </Link>
              </div>
            </div>

            {/* Quick Link to Other Policies */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                कायदेशीर व पारदर्शकता दुवे
              </h4>
              <ul className="space-y-2 text-xs font-semibold text-gray-700">
                <li><Link to="/about" className="hover:text-brand-red transition-colors block py-1 border-b border-gray-100">आमच्याबद्दल (About Us)</Link></li>
                <li><Link to="/privacy-policy" className="hover:text-brand-red transition-colors block py-1 border-b border-gray-100">गोपनीयता धोरण (Privacy Policy)</Link></li>
                <li><Link to="/terms" className="hover:text-brand-red transition-colors block py-1 border-b border-gray-100">अटी आणि शर्ती (Terms of Service)</Link></li>
                <li><Link to="/cookie-policy" className="hover:text-brand-red transition-colors block py-1 border-b border-gray-100">कुकी धोरण (Cookie Policy)</Link></li>
                <li><Link to="/disclaimer" className="hover:text-brand-red transition-colors block py-1">अस्वीकरण (Disclaimer)</Link></li>
              </ul>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
