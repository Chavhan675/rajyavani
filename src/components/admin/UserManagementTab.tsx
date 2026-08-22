import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { UserRole } from '../../types';
import { 
  Users, 
  Search, 
  ShieldCheck, 
  ShieldAlert, 
  Trash2, 
  Lock, 
  Unlock, 
  Sparkles, 
  Mail, 
  Clock, 
  Loader2,
  RefreshCw,
  UserCheck
} from 'lucide-react';
import { formatMarathiDateTime } from '../../lib/formatTime';

export default function UserManagementTab() {
  const [users, setUsers] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(query(collection(db, 'users')));
      const list: UserRole[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ uid: docSnap.id, ...docSnap.data() } as UserRole);
      });
      // Sort: SUPER_ADMIN first, then by createdAt
      list.sort((a, b) => {
        if (a.role === 'SUPER_ADMIN') return -1;
        if (b.role === 'SUPER_ADMIN') return 1;
        return (b.createdAt || 0) - (a.createdAt || 0);
      });
      setUsers(list);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setMessage({ type: 'error', text: 'वापरकर्ते लोड करताना त्रुटी आली.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleSuspension = async (targetUser: UserRole) => {
    if (targetUser.email === 'chavhanakash675@gmail.com') {
      alert('मुख्य मालकाचे (Super Admin) खाते निलंबित करता येणार नाही.');
      return;
    }

    try {
      setProcessingId(targetUser.uid);
      const newStatus = !targetUser.isSuspended;
      await updateDoc(doc(db, 'users', targetUser.uid), {
        isSuspended: newStatus,
        updatedAt: Date.now()
      });
      
      setUsers(prev => prev.map(u => u.uid === targetUser.uid ? { ...u, isSuspended: newStatus } : u));
      setMessage({ 
        type: 'success', 
        text: `खाते ${newStatus ? 'निलंबित (Suspended)' : 'पुनर्संचयित (Active)'} करण्यात आले आहे.` 
      });
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: 'स्थिती अपडेट अयशस्वी.' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleRole = async (targetUser: UserRole) => {
    if (targetUser.email === 'chavhanakash675@gmail.com') {
      alert('मुख्य सुपर अ‍ॅडमीनची भूमिका बदलता येणार नाही.');
      return;
    }

    const nextRole = targetUser.role === 'SUPER_ADMIN' ? 'USER' : 'SUPER_ADMIN';
    const confirmMsg = targetUser.role === 'SUPER_ADMIN'
      ? `तुम्ही ${targetUser.email} यांना 'वाचक (USER)' पदावर आणू इच्छिता का?`
      : `सावधान: तुम्ही ${targetUser.email} यांना 'सुपर अ‍ॅडमीन' चे सर्व अधिकार देऊ इच्छिता का?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      setProcessingId(targetUser.uid);
      await updateDoc(doc(db, 'users', targetUser.uid), {
        role: nextRole,
        updatedAt: Date.now()
      });

      setUsers(prev => prev.map(u => u.uid === targetUser.uid ? { ...u, role: nextRole } : u));
      setMessage({ type: 'success', text: `वापरकर्त्याची भूमिका '${nextRole}' म्हणून सेट केली.` });
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: 'भूमिका बदलणे अयशस्वी.' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteUser = async (targetUser: UserRole) => {
    if (targetUser.email === 'chavhanakash675@gmail.com') {
      alert('मुख्य मालकाचे खाते हटवता येणार नाही.');
      return;
    }

    if (!window.confirm(`तुम्ही खात्रीने ${targetUser.email} चे प्रोफाइल खाते कायमचे डिलीट करू इच्छिता?`)) {
      return;
    }

    try {
      setProcessingId(targetUser.uid);
      await deleteDoc(doc(db, 'users', targetUser.uid));
      setUsers(prev => prev.filter(u => u.uid !== targetUser.uid));
      setMessage({ type: 'success', text: 'वापरकर्ता यशस्वीरीत्या हटवला.' });
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: 'वापरकर्ता हटवण्यात अडचण आली.' });
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = users.filter(u => 
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.displayName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.role || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header Bar */}
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-red" />
            वापरकर्ते व्यवस्थापन (User Management)
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            राज्यवाणीच्या सर्व वाचकांची व प्रशासकीय खात्यांची सूची (एकूण {users.length} खाती)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="नाव किंवा ईमेल शोधा..."
              className="pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red w-48 sm:w-64"
            />
          </div>

          <button
            onClick={fetchUsers}
            disabled={loading}
            className="p-2 text-gray-600 hover:text-brand-red hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            title="रिफ्रेश करा"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Alert message banner */}
      {message && (
        <div className={`p-3.5 mx-6 mt-4 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-xs underline font-bold cursor-pointer">बंद करा</button>
        </div>
      )}

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-gray-50/80 text-gray-600 font-bold uppercase text-[11px] tracking-wider border-b border-gray-200">
            <tr>
              <th className="py-3 px-4">वापरकर्ता (User)</th>
              <th className="py-3 px-4">भूमिका (Role)</th>
              <th className="py-3 px-4">जिल्हा</th>
              <th className="py-3 px-4">स्थिती (Status)</th>
              <th className="py-3 px-4">शेवटचा लॉगिन</th>
              <th className="py-3 px-4 text-right">कृती (Actions)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-red" />
                  खाती लोड होत आहेत...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-400">
                  कोणतेही खाते सापडले नाही.
                </td>
              </tr>
            ) : (
              filtered.map((u) => {
                const isOwner = u.email === 'chavhanakash675@gmail.com';
                const isSuper = u.role === 'SUPER_ADMIN' || isOwner;

                return (
                  <tr key={u.uid} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white ${
                          isSuper ? 'bg-amber-600' : 'bg-brand-red'
                        }`}>
                          {(u.displayName?.charAt(0) || u.email?.charAt(0) || 'U').toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 flex items-center gap-1.5">
                            {u.displayName || 'नाव नाही'}
                            {isOwner && (
                              <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-black border border-amber-300">
                                मुख्य मालक (Owner)
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500 font-mono">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {isSuper ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          सुपर अ‍ॅडमीन
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                          <UserCheck className="w-3 h-3 text-blue-500" />
                          वाचक (User)
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-xs font-medium text-gray-700">
                      {u.preferredDistrict || 'सर्व महाराष्ट्र'}
                    </td>

                    <td className="py-3 px-4">
                      {u.isSuspended ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-700">
                          <Lock className="w-3 h-3" /> निलंबित (Suspended)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-green-100 text-green-700">
                          <Unlock className="w-3 h-3" /> सक्रिय (Active)
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-xs text-gray-500">
                      {u.lastLoginAt ? formatMarathiDateTime(u.lastLoginAt) : 'नोंद नाही'}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {!isOwner && (
                          <>
                            {/* Toggle Role */}
                            <button
                              onClick={() => handleToggleRole(u)}
                              disabled={processingId === u.uid}
                              className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                              title={u.role === 'SUPER_ADMIN' ? 'वाचक बनवा' : 'सुपर अ‍ॅडमीन बनवा'}
                            >
                              {u.role === 'SUPER_ADMIN' ? 'Demote to User' : 'Promote to Admin'}
                            </button>

                            {/* Toggle Suspend */}
                            <button
                              onClick={() => handleToggleSuspension(u)}
                              disabled={processingId === u.uid}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                u.isSuspended 
                                  ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                  : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                              }`}
                              title={u.isSuspended ? 'खाते सक्रिय करा' : 'खाते निलंबित करा'}
                            >
                              {u.isSuspended ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteUser(u)}
                              disabled={processingId === u.uid}
                              className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                              title="खाते हटवा"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
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
