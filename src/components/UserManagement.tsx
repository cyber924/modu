import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  UserPlus,
  Shield,
  Briefcase,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  AlertTriangle,
  X,
  Phone,
  Mail,
  Calendar,
  Building2,
  Filter,
  ShieldAlert,
  Clock,
  Check,
  AlertCircle
} from 'lucide-react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  setDoc, 
  serverTimestamp,
  query,
  orderBy 
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import { UserProfile, InquiryParentCategory, CATEGORY_MAP } from '../types';

const formatDateTime = (dateObj: any) => {
  if (!dateObj) return '-';
  const d = dateObj?.toDate ? dateObj.toDate() : new Date(dateObj);
  if (isNaN(d.getTime())) return '-';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}.${month}.${day} ${hours}:${minutes}`;
};

export const UserManagement: React.FC = () => {
  const { user: currentAuthUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'customer' | 'partner' | 'admin'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');

  // Modals state
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<UserProfile | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Form state for Editing
  const [editForm, setEditForm] = useState({
    displayName: '',
    role: 'customer' as 'customer' | 'partner' | 'admin',
    partnerCategory: 'all' as InquiryParentCategory | 'all',
    phone: '',
    status: 'active' as 'active' | 'suspended',
    notes: ''
  });

  // Form state for Adding
  const [addForm, setAddForm] = useState({
    email: '',
    displayName: '',
    role: 'partner' as 'customer' | 'partner' | 'admin',
    partnerCategory: 'shopping' as InquiryParentCategory | 'all',
    phone: '',
    notes: ''
  });

  // Real-time listener on `users` collection
  useEffect(() => {
    setLoading(true);
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: UserProfile[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ uid: docSnap.id, ...docSnap.data() } as UserProfile);
        });
        setUsers(list);
        setLoading(false);
      },
      (err) => {
        console.error('Error listening to users collection:', err);
        setError('사용자 목록을 불러오는 중 권한 확인 또는 네트워크 오류가 발생했습니다.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Quick Notification Helper
  const showSuccess = (msg: string) => {
    setActionSuccessMessage(msg);
    setTimeout(() => {
      setActionSuccessMessage(null);
    }, 3500);
  };

  // Open Edit Modal
  const handleOpenEdit = (user: UserProfile) => {
    setEditingUser(user);
    setEditForm({
      displayName: user.displayName || '',
      role: user.role || 'customer',
      partnerCategory: user.partnerCategory || 'all',
      phone: user.phone || '',
      status: user.status || 'active',
      notes: user.notes || ''
    });
  };

  // Save Edited User
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const userDocRef = doc(db, 'users', editingUser.uid);
      await updateDoc(userDocRef, {
        displayName: editForm.displayName.trim(),
        role: editForm.role,
        partnerCategory: editForm.role === 'partner' ? editForm.partnerCategory : 'all',
        phone: editForm.phone.trim(),
        status: editForm.status,
        notes: editForm.notes.trim()
      });

      showSuccess(`'${editForm.displayName || editingUser.email}' 님의 권한 및 계정 정보가 성공적으로 수정되었습니다.`);
      setEditingUser(null);
    } catch (err: any) {
      console.error('Error updating user:', err);
      alert(`수정 실패: ${err.message || '권한이 부족하거나 오류가 발생했습니다.'}`);
    }
  };

  // Delete User
  const handleConfirmDelete = async () => {
    if (!deletingUser) return;

    if (deletingUser.uid === currentAuthUser?.uid || deletingUser.email === currentAuthUser?.email) {
      alert('현재 로그인 중인 최고관리자 본인 계정은 삭제할 수 없습니다.');
      setDeletingUser(null);
      return;
    }

    try {
      await deleteDoc(doc(db, 'users', deletingUser.uid));
      showSuccess(`사용자 '${deletingUser.displayName || deletingUser.email}' 계정이 안전하게 삭제되었습니다.`);
      setDeletingUser(null);
    } catch (err: any) {
      console.error('Error deleting user:', err);
      alert(`삭제 실패: ${err.message || '오류가 발생했습니다.'}`);
    }
  };

  // Add New User or Partner directly
  const handleAddNewUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.email || !addForm.displayName) {
      alert('이메일과 이름을 모두 입력해 주세요.');
      return;
    }

    try {
      // Create a deterministic or generated doc ID based on email or random timestamp
      const customUid = 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
      const newDocRef = doc(db, 'users', customUid);

      await setDoc(newDocRef, {
        uid: customUid,
        email: addForm.email.trim(),
        displayName: addForm.displayName.trim(),
        role: addForm.role,
        partnerCategory: addForm.role === 'partner' ? addForm.partnerCategory : 'all',
        phone: addForm.phone.trim(),
        status: 'active',
        notes: addForm.notes.trim(),
        createdAt: serverTimestamp()
      });

      showSuccess(`새로운 ${addForm.role === 'partner' ? '제휴처' : addForm.role === 'admin' ? '관리자' : '고객'} '${addForm.displayName}' 등록이 완료되었습니다.`);
      setIsAddModalOpen(false);
      setAddForm({
        email: '',
        displayName: '',
        role: 'partner',
        partnerCategory: 'shopping',
        phone: '',
        notes: ''
      });
    } catch (err: any) {
      console.error('Error adding user:', err);
      alert(`사용자 등록 실패: ${err.message || '오류가 발생했습니다.'}`);
    }
  };

  // Filtered Users List
  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      (u.displayName?.toLowerCase().includes(search.toLowerCase()) || false) ||
      (u.email?.toLowerCase().includes(search.toLowerCase()) || false) ||
      (u.phone?.includes(search) || false);

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || (u.status || 'active') === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Metrics
  const totalUsers = users.length;
  const customerCount = users.filter((u) => u.role === 'customer').length;
  const partnerCount = users.filter((u) => u.role === 'partner').length;
  const adminCount = users.filter((u) => u.role === 'admin').length;

  return (
    <div className="space-y-6 text-left">
      {/* Alert Banner if any */}
      {actionSuccessMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center justify-between shadow-xs animate-fadeIn">
          <div className="flex items-center space-x-2 text-xs font-semibold">
            <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessMessage}</span>
          </div>
          <button 
            onClick={() => setActionSuccessMessage(null)}
            className="text-emerald-500 hover:text-emerald-700 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl flex items-center space-x-2 text-xs">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-indigo-600 uppercase tracking-wider">
            <Users className="h-3.5 w-3.5" />
            <span>User & Partner Role HQ</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-1">사용자 및 제휴처 권한 관리</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            고객, 제휴처(전문가), 마스터 관리자의 역할을 실시간으로 부여 및 회수하고 계정을 통합 제어합니다.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="h-4 w-4" />
          <span>신규 사용자/제휴처 직접 등록</span>
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-xs">
          <span className="text-xs text-slate-400 font-semibold block">총 등록 사용자</span>
          <span className="text-2xl font-black text-slate-900 block mt-1">{totalUsers}명</span>
        </div>

        <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-xs">
          <span className="text-xs text-slate-400 font-semibold block flex items-center space-x-1">
            <Users className="h-3 w-3 text-slate-500" />
            <span>일반 고객</span>
          </span>
          <span className="text-2xl font-black text-indigo-600 block mt-1">{customerCount}명</span>
        </div>

        <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-xs">
          <span className="text-xs text-slate-400 font-semibold block flex items-center space-x-1">
            <Briefcase className="h-3 w-3 text-blue-500" />
            <span>제휴처(전문가)</span>
          </span>
          <span className="text-2xl font-black text-blue-600 block mt-1">{partnerCount}개사</span>
        </div>

        <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-xs">
          <span className="text-xs text-slate-400 font-semibold block flex items-center space-x-1">
            <Shield className="h-3 w-3 text-purple-500" />
            <span>관리자 (Admin)</span>
          </span>
          <span className="text-2xl font-black text-purple-600 block mt-1">{adminCount}명</span>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-xs space-y-3">
        {/* Role Quick Tabs */}
        <div className="flex items-center gap-1.5 border-b border-slate-100 pb-3 overflow-x-auto text-xs">
          <button
            onClick={() => setRoleFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
              roleFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            전체 사용자 ({totalUsers})
          </button>
          <button
            onClick={() => setRoleFilter('customer')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap transition-all cursor-pointer flex items-center space-x-1 ${
              roleFilter === 'customer'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
            }`}
          >
            <Users className="h-3 w-3" />
            <span>고객 ({customerCount})</span>
          </button>
          <button
            onClick={() => setRoleFilter('partner')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap transition-all cursor-pointer flex items-center space-x-1 ${
              roleFilter === 'partner'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            <Briefcase className="h-3 w-3" />
            <span>제휴처 ({partnerCount})</span>
          </button>
          <button
            onClick={() => setRoleFilter('admin')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs whitespace-nowrap transition-all cursor-pointer flex items-center space-x-1 ${
              roleFilter === 'admin'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
            }`}
          >
            <Shield className="h-3 w-3" />
            <span>관리자 ({adminCount})</span>
          </button>
        </div>

        {/* Search Input & Status Select */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="이름, 이메일, 전화번호로 빠른 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none font-medium text-slate-700 w-full sm:w-auto"
            >
              <option value="all">모든 상태</option>
              <option value="active">정상 활성 계정</option>
              <option value="suspended">일시 정지 계정</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table / Card List */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            사용자 목록을 실시간으로 동기화 중입니다...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            검색 및 필터 조건에 부합하는 사용자가 존재하지 않습니다.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">사용자 프로필</th>
                  <th className="py-3 px-4">권한 (Role)</th>
                  <th className="py-3 px-4">제휴 전문 분야</th>
                  <th className="py-3 px-4">계정 상태</th>
                  <th className="py-3 px-4">가입/등록 일시</th>
                  <th className="py-3 px-4 text-right">권한 및 관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredUsers.map((u) => {
                  const isCurrentAdmin = u.uid === currentAuthUser?.uid || u.email === currentAuthUser?.email;
                  const isPartner = u.role === 'partner';
                  const isAdmin = u.role === 'admin';
                  const isSuspended = u.status === 'suspended';

                  return (
                    <tr key={u.uid} className="hover:bg-slate-50/60 transition-colors">
                      {/* Name & Email */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase ${
                            isAdmin 
                              ? 'bg-purple-100 text-purple-700' 
                              : isPartner 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-slate-100 text-slate-700'
                          }`}>
                            {u.displayName?.substring(0, 1) || u.email?.substring(0, 1) || 'U'}
                          </div>
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="font-bold text-slate-900">{u.displayName || '이름 없음'}</span>
                              {isCurrentAdmin && (
                                <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">
                                  본인(현재 접속)
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400 font-mono block">{u.email}</span>
                            {u.phone && (
                              <span className="text-[10px] text-slate-500 font-mono flex items-center space-x-1 mt-0.5">
                                <Phone className="h-2.5 w-2.5 text-slate-400" />
                                <span>{u.phone}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4">
                        {isAdmin ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-100">
                            <Shield className="h-3 w-3 text-purple-600" />
                            <span>최고 관리자</span>
                          </span>
                        ) : isPartner ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                            <Briefcase className="h-3 w-3 text-blue-600" />
                            <span>제휴처(전문가)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            <Users className="h-3 w-3 text-slate-500" />
                            <span>일반 고객</span>
                          </span>
                        )}
                      </td>

                      {/* Partner Category */}
                      <td className="py-3.5 px-4">
                        {isPartner ? (
                          u.partnerCategory && u.partnerCategory !== 'all' ? (
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              CATEGORY_MAP[u.partnerCategory]?.bg || 'bg-slate-50'
                            } ${CATEGORY_MAP[u.partnerCategory]?.text || 'text-slate-700'}`}>
                              {CATEGORY_MAP[u.partnerCategory]?.label || u.partnerCategory}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-medium">
                              통합 전분야
                            </span>
                          )
                        ) : (
                          <span className="text-slate-300 text-[11px]">-</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {isSuspended ? (
                          <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">
                            <AlertTriangle className="h-2.5 w-2.5" />
                            <span>정지됨</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                            <Check className="h-2.5 w-2.5" />
                            <span>정상 활성</span>
                          </span>
                        )}
                      </td>

                      {/* Created At */}
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {formatDateTime(u.createdAt)}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="px-2.5 py-1 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 border border-slate-200 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer"
                            title="권한 및 정보 수정"
                          >
                            <Edit2 className="h-3 w-3" />
                            <span>권한 수정</span>
                          </button>

                          <button
                            onClick={() => setDeletingUser(u)}
                            disabled={isCurrentAdmin}
                            className={`p-1.5 rounded-lg border text-xs transition-all ${
                              isCurrentAdmin
                                ? 'text-slate-300 border-slate-100 cursor-not-allowed'
                                : 'text-rose-500 border-rose-100 hover:bg-rose-50 hover:border-rose-200 cursor-pointer'
                            }`}
                            title={isCurrentAdmin ? '현재 접속 중인 본인 계정은 삭제 불가' : '사용자 삭제'}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Edit2 className="h-4 w-4 text-indigo-600" />
                <h3 className="text-base font-black text-slate-900">사용자 권한 및 프로필 변경</h3>
              </div>
              <button 
                onClick={() => setEditingUser(null)} 
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">계정 이메일 (고유 식별)</label>
                <input
                  type="text"
                  disabled
                  value={editingUser.email}
                  className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 font-mono cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">사용자/기업명</label>
                <input
                  type="text"
                  required
                  value={editForm.displayName}
                  onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                  placeholder="이름 또는 제휴사 상호명"
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Role Selector */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">역할 및 권한 (Role)</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, role: 'customer' })}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      editForm.role === 'customer'
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-700 ring-2 ring-indigo-600/20'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Users className="h-4 w-4 mx-auto mb-1 text-slate-500" />
                    <span>일반 고객</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, role: 'partner' })}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      editForm.role === 'partner'
                        ? 'bg-blue-50 border-blue-600 text-blue-700 ring-2 ring-blue-600/20'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Briefcase className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                    <span>제휴처(전문가)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, role: 'admin' })}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      editForm.role === 'admin'
                        ? 'bg-purple-50 border-purple-600 text-purple-700 ring-2 ring-purple-600/20'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Shield className="h-4 w-4 mx-auto mb-1 text-purple-600" />
                    <span>최고 관리자</span>
                  </button>
                </div>
              </div>

              {/* Partner Category (Only if role === 'partner') */}
              {editForm.role === 'partner' && (
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 space-y-1.5">
                  <label className="block text-blue-900 font-bold">제휴 전문 분야 (매칭 카테고리)</label>
                  <select
                    value={editForm.partnerCategory}
                    onChange={(e) => setEditForm({ ...editForm, partnerCategory: e.target.value as any })}
                    className="w-full p-2 border border-blue-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="all">통합/전체 카테고리</option>
                    <option value="shopping">🛍️ 쇼핑/결제/주문</option>
                    <option value="travel">✈️ 여행/항공/레저</option>
                    <option value="restaurant">🍽️ 외식/예약/대관</option>
                    <option value="other">💡 일반/기타 상담</option>
                  </select>
                  <p className="text-[10px] text-blue-600">
                    선택한 카테고리의 고객 문의가 접수되면 이 제휴처에 자동 추천 및 배정 우선순위가 부여됩니다.
                  </p>
                </div>
              )}

              {/* Phone and Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">연락처/전화번호</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="010-0000-0000"
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">계정 활성 상태</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                  >
                    <option value="active">정상 활성 (Active)</option>
                    <option value="suspended">일시 정지 (Suspended)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">관리자 메모 (내부용)</label>
                <input
                  type="text"
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  placeholder="예: VIP 제휴업체, 2026년 계약 연장 완료 등"
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-sm cursor-pointer"
                >
                  권한 및 정보 저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New User/Partner Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <UserPlus className="h-4 w-4 text-indigo-600" />
                <h3 className="text-base font-black text-slate-900">신규 사용자 및 제휴처 직접 등록</h3>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddNewUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">이메일 주소 *</label>
                <input
                  type="email"
                  required
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  placeholder="user@example.com"
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">이름 또는 제휴사 상호명 *</label>
                <input
                  type="text"
                  required
                  value={addForm.displayName}
                  onChange={(e) => setAddForm({ ...addForm, displayName: e.target.value })}
                  placeholder="홍길동 또는 (주)한국인테리어"
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Role selector */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">부여할 권한 (Role)</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAddForm({ ...addForm, role: 'partner' })}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      addForm.role === 'partner'
                        ? 'bg-blue-50 border-blue-600 text-blue-700 ring-2 ring-blue-600/20'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Briefcase className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                    <span>제휴처(전문가)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAddForm({ ...addForm, role: 'customer' })}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      addForm.role === 'customer'
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-700 ring-2 ring-indigo-600/20'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Users className="h-4 w-4 mx-auto mb-1 text-slate-500" />
                    <span>일반 고객</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAddForm({ ...addForm, role: 'admin' })}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      addForm.role === 'admin'
                        ? 'bg-purple-50 border-purple-600 text-purple-700 ring-2 ring-purple-600/20'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Shield className="h-4 w-4 mx-auto mb-1 text-purple-600" />
                    <span>최고 관리자</span>
                  </button>
                </div>
              </div>

              {/* Partner Category (if role === 'partner') */}
              {addForm.role === 'partner' && (
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 space-y-1.5">
                  <label className="block text-blue-900 font-bold">제휴 전문 분야</label>
                  <select
                    value={addForm.partnerCategory}
                    onChange={(e) => setAddForm({ ...addForm, partnerCategory: e.target.value as any })}
                    className="w-full p-2 border border-blue-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="shopping">🛍️ 쇼핑/결제/주문</option>
                    <option value="travel">✈️ 여행/항공/레저</option>
                    <option value="restaurant">🍽️ 외식/예약/대관</option>
                    <option value="other">💡 일반/기타 상담</option>
                    <option value="all">통합/전체 카테고리</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-bold mb-1">연락처/전화번호</label>
                <input
                  type="text"
                  value={addForm.phone}
                  onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                  placeholder="010-0000-0000"
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">관리자 메모 (선택사항)</label>
                <input
                  type="text"
                  value={addForm.notes}
                  onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })}
                  placeholder="제휴 분야 및 특이사항 입력"
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-sm cursor-pointer"
                >
                  등록 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-fadeIn">
            <div className="flex items-center space-x-2 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="text-base font-black">사용자 계정 영구 삭제</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              정말로 <span className="font-bold text-slate-900">{deletingUser.displayName || deletingUser.email}</span> ({deletingUser.email}) 계정을 데이터베이스에서 삭제하시겠습니까?
              <br />
              삭제된 사용자 프로필 및 권한 정보는 즉시 소멸됩니다.
            </p>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
              >
                영구 삭제 실행
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
