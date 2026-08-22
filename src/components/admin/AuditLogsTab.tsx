import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { AuthAuditLog } from '../../types';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Clock, 
  Search, 
  RefreshCw, 
  Loader2, 
  LogIn, 
  LogOut, 
  Key, 
  UserPlus, 
  AlertTriangle,
  FileText
} from 'lucide-react';
import { formatMarathiDateTime } from '../../lib/formatTime';

export default function AuditLogsTab() {
  const [logs, setLogs] = useState<AuthAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'auth_audit_logs'),
        orderBy('timestamp', 'desc'),
        limit(100)
      );
      const snap = await getDocs(q);
      const fetched: AuthAuditLog[] = [];
      snap.forEach(d => {
        fetched.push({ id: d.id, ...d.data() } as AuthAuditLog);
      });
      setLogs(fetched);
    } catch (err: any) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getActionBadge = (action: string, status: string) => {
    const isSuccess = status === 'SUCCESS';

    switch (action) {
      case 'LOGIN':
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
            isSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <LogIn className="w-3 h-3" />
            {isSuccess ? 'लॉगिन यशस्वी' : 'लॉगिन अयशस्वी'}
          </span>
        );
      case 'LOGOUT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
            <LogOut className="w-3 h-3" /> लॉगआउट
          </span>
        );
      case 'REGISTER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
            <UserPlus className="w-3 h-3" /> नवीन नोंदणी
          </span>
        );
      case 'PASSWORD_RESET_REQUEST':
      case 'PASSWORD_CHANGE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <Key className="w-3 h-3" /> पासवर्ड बदल
          </span>
        );
      case 'SESSION_TIMEOUT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <Clock className="w-3 h-3" /> सत्र समाप्ती (Timeout)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {action}
          </span>
        );
    }
  };

  const filteredLogs = logs.filter(l => {
    const matchesAction = filterAction === 'ALL' || l.action === filterAction;
    const matchesSearch = 
      (l.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.action || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.details || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesAction && matchesSearch;
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header Bar */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-brand-red" />
            सुरक्षा व ॲक्टिव्हिटी लॉग (Security & Login History)
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            वेबसाइटवरील सर्व लॉगिन, नोंदणी, पासवर्ड बदल व सुरक्षा इव्हेंट्सची थेट नोंद
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Action Filter */}
          <label htmlFor="admin-audit-action-filter" className="sr-only">ॲक्टिव्हिटी प्रकार फिल्टर (Filter by Action)</label>
          <select
            id="admin-audit-action-filter"
            name="filterAction"
            aria-label="ॲक्टिव्हिटी प्रकारानुसार फिल्टर करा (Filter by Action Type)"
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 font-bold text-gray-700 focus:bg-white focus:outline-none cursor-pointer"
          >
            <option value="ALL">सर्व ॲक्टिव्हिटी (All)</option>
            <option value="LOGIN">लॉगिन (Login)</option>
            <option value="REGISTER">नवीन नोंदणी (Register)</option>
            <option value="LOGOUT">लॉगआउट (Logout)</option>
            <option value="PASSWORD_CHANGE">पासवर्ड बदल (Password Change)</option>
            <option value="SESSION_TIMEOUT">सत्र समाप्ती (Timeout)</option>
          </select>

          {/* Search */}
          <div className="relative">
            <label htmlFor="admin-audit-search" className="sr-only">लॉग शोधा (Search Audit Logs)</label>
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              id="admin-audit-search"
              name="auditSearch"
              aria-label="ईमेल किंवा माहिती शोधा"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ईमेल किंवा माहिती शोधा..."
              className="pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red w-48 sm:w-56"
            />
          </div>

          <button
            onClick={fetchLogs}
            disabled={loading}
            className="p-2 text-gray-600 hover:text-brand-red hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            title="रिफ्रेश करा"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-gray-50/80 text-gray-600 font-bold uppercase text-[11px] tracking-wider border-b border-gray-200">
            <tr>
              <th className="py-3 px-4">वेळ (Timestamp)</th>
              <th className="py-3 px-4">इव्हेंट प्रकार (Event)</th>
              <th className="py-3 px-4">ईमेल (User Email)</th>
              <th className="py-3 px-4">तपशील (Details)</th>
              <th className="py-3 px-4">ब्राउझर / डिव्हाइस</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-red" />
                  सुरक्षा लॉग्स लोड होत आहेत...
                </td>
              </tr>
            ) : filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-400">
                  कोणतीही लॉग नोंद सापडली नाही.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/60 transition-colors font-sans">
                  <td className="py-3 px-4 text-xs font-mono text-gray-600 whitespace-nowrap">
                    {formatMarathiDateTime(log.timestamp)}
                  </td>

                  <td className="py-3 px-4">
                    {getActionBadge(log.action, log.status)}
                  </td>

                  <td className="py-3 px-4 font-mono font-medium text-gray-800">
                    {log.email || 'अनामित / निनावी'}
                  </td>

                  <td className="py-3 px-4 text-xs text-gray-600">
                    {log.details || '-'}
                  </td>

                  <td className="py-3 px-4 text-[11px] text-gray-400 max-w-xs truncate" title={log.userAgent}>
                    {log.userAgent ? log.userAgent.split(' ')[0] : 'Web Client'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 flex justify-between items-center">
        <span>एकूण {filteredLogs.length} नोंदी दाखवत आहे (जास्तीत जास्त १०० अलीकडील)</span>
        <span className="font-semibold text-gray-700">सुरक्षित ऑडिट मोड सक्रिय</span>
      </div>
    </div>
  );
}
