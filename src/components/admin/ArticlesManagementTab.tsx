import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { 
  Newspaper, 
  Search, 
  Trash2, 
  ExternalLink, 
  CheckCircle, 
  Clock, 
  Archive, 
  Sparkles, 
  RefreshCw, 
  Loader2, 
  FileText,
  Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import Image from '../Image';

export default function ArticlesManagementTab() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'articles'),
        orderBy('publishedAt', 'desc'),
        limit(80)
      );
      const snap = await getDocs(q);
      const list: any[] = [];
      snap.forEach(d => {
        list.push({ id: d.id, ...d.data() });
      });
      setArticles(list);
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: 'बातम्या लोड करताना त्रुटी आली.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleStatusChange = async (articleId: string, nextStatus: string) => {
    try {
      setProcessingId(articleId);
      await updateDoc(doc(db, 'articles', articleId), {
        status: nextStatus,
        updatedAt: Date.now()
      });
      setArticles(prev => prev.map(a => a.id === articleId ? { ...a, status: nextStatus } : a));
      setMessage({ type: 'success', text: `बातमी स्थिती '${nextStatus}' केली.` });
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: 'स्थिती बदलणे अयशस्वी.' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (articleId: string, title: string) => {
    if (!window.confirm(`तुम्ही खात्रीने "${title.substring(0, 40)}..." ही बातमी डिलीट करू इच्छिता?`)) {
      return;
    }

    try {
      setProcessingId(articleId);
      await deleteDoc(doc(db, 'articles', articleId));
      setArticles(prev => prev.filter(a => a.id !== articleId));
      setMessage({ type: 'success', text: 'बातमी यशस्वीरीत्या हटवली.' });
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: 'बातमी हटवण्यात अडचण आली.' });
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = articles.filter(a => {
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    const matchesCategory = categoryFilter === 'ALL' || a.category === categoryFilter;
    const matchesSearch = 
      (a.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.summary || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.district || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesCategory && matchesSearch;
  });

  const categories = Array.from(new Set(articles.map(a => a.category).filter(Boolean)));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header Bar */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-brand-red" />
            बातम्या व्यवस्थापन (Article Manager)
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            सर्व बातम्यांचे पुनरावलोकन, संपादन, मंजुरी (Approval), व नियंत्रण (एकूण {articles.length} बातम्या)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 font-bold text-gray-700 focus:bg-white focus:outline-none"
          >
            <option value="ALL">सर्व स्थिती (Status)</option>
            <option value="PUBLISHED">प्रकाशित (Published)</option>
            <option value="DRAFT">मसुदा (Draft)</option>
            <option value="ARCHIVED">संग्रहित (Archived)</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 font-bold text-gray-700 focus:bg-white focus:outline-none"
          >
            <option value="ALL">सर्व वर्ग (Categories)</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="शीर्षक किंवा जिल्हा शोधा..."
              className="pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red w-44 sm:w-56"
            />
          </div>

          <button
            onClick={fetchArticles}
            disabled={loading}
            className="p-1.5 text-gray-600 hover:text-brand-red hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            title="रिफ्रेश करा"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-3.5 mx-6 mt-4 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-xs underline font-bold cursor-pointer">बंद करा</button>
        </div>
      )}

      {/* Articles Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-gray-50/80 text-gray-600 font-bold uppercase text-[11px] tracking-wider border-b border-gray-200">
            <tr>
              <th className="py-3 px-4">बातमी (Headline & Category)</th>
              <th className="py-3 px-4">जिल्हा</th>
              <th className="py-3 px-4">स्थिती</th>
              <th className="py-3 px-4">प्रसिद्धी दिनांक</th>
              <th className="py-3 px-4 text-right">नियंत्रण (Actions)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-red" />
                  बातम्या लोड होत आहेत...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-400">
                  कोणतीही बातमी सापडली नाही.
                </td>
              </tr>
            ) : (
              filtered.map((art) => {
                const textContent = (art.content || '').replace(/<[^>]+>/g, ' ');
                const wordCount = textContent.trim().split(/\s+/).filter(Boolean).length;

                return (
                  <tr key={art.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-4 max-w-md">
                      <div className="flex gap-3 items-start">
                        <div className="w-14 h-11 rounded-lg overflow-hidden shrink-0 bg-gray-100 border border-gray-200">
                          <Image
                            src={art.imageUrl}
                            category={art.category}
                            alt={art.title}
                            size="thumbnail"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            <span className="text-[10px] font-bold text-brand-red uppercase tracking-wider bg-red-50 px-1.5 py-0.2 rounded">
                              {art.category}
                            </span>
                            {art.aiGenerated && (
                              <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                                <Sparkles className="w-2.5 h-2.5" /> AI Desk
                              </span>
                            )}
                            <span className="text-[10px] text-gray-400 font-mono">
                              {wordCount} शब्द
                            </span>
                          </div>
                          <Link
                            to={`/article/${art.id}`}
                            target="_blank"
                            className="font-bold text-gray-900 hover:text-brand-red line-clamp-1 flex items-center gap-1"
                          >
                            <span>{art.title}</span>
                            <ExternalLink className="w-3 h-3 shrink-0 opacity-40 hover:opacity-100" />
                          </Link>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-xs text-gray-600 font-medium">
                      {art.district || '-'}
                    </td>

                    <td className="py-3 px-4">
                      {art.status === 'PUBLISHED' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3" /> प्रकाशित
                        </span>
                      ) : art.status === 'ARCHIVED' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600">
                          <Archive className="w-3 h-3" /> संग्रहित
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                          <Clock className="w-3 h-3" /> मसुदा (Draft)
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-xs text-gray-500 font-mono">
                      {art.publishedAt ? format(new Date(art.publishedAt), "dd MMM yyyy, HH:mm") : '-'}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {art.status !== 'PUBLISHED' && (
                          <button
                            onClick={() => handleStatusChange(art.id, 'PUBLISHED')}
                            disabled={processingId === art.id}
                            className="px-2 py-1 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                            title="मंजूर व प्रकाशित करा"
                          >
                            Approve
                          </button>
                        )}
                        {art.status === 'PUBLISHED' && (
                          <button
                            onClick={() => handleStatusChange(art.id, 'DRAFT')}
                            disabled={processingId === art.id}
                            className="px-2 py-1 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                            title="अप्रकाशित करा (Move to Draft)"
                          >
                            Unpublish
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(art.id, art.title)}
                          disabled={processingId === art.id}
                          className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                          title="हटवा"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
