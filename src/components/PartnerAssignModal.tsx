import React, { useState, useEffect } from 'react';
import {
  X,
  Handshake,
  Search,
  CheckCircle2,
  Building2,
  Phone,
  Mail,
  Sparkles,
  AlertCircle,
  FileText,
  UserX,
  Check
} from 'lucide-react';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
  query,
  where
} from 'firebase/firestore';
import { db } from '../firebase';
import { Inquiry, UserProfile, CATEGORY_MAP, InquiryParentCategory } from '../types';

interface PartnerAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  inquiry: Inquiry | null;
  onAssignSuccess?: (partnerId: string, partnerName: string) => void;
}

export const PartnerAssignModal: React.FC<PartnerAssignModalProps> = ({
  isOpen,
  onClose,
  inquiry,
  onAssignSuccess
}) => {
  const [partners, setPartners] = useState<UserProfile[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedPartnerUid, setSelectedPartnerUid] = useState<string>('');
  const [routingNote, setRoutingNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real-time listener on Partners (users with role === 'partner' or admin)
  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);

    const usersRef = collection(db, 'users');
    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      const pList: UserProfile[] = [];
      snapshot.forEach((d) => {
        const u = d.data() as UserProfile;
        if (u.role === 'partner' || u.role === 'admin') {
          pList.push(u);
        }
      });
      setPartners(pList);
      setLoading(false);
    });

    // Also fetch inquiries to calculate partner workloads
    const inqRef = collection(db, 'inquiries');
    const unsubInq = onSnapshot(inqRef, (snap) => {
      const iList: Inquiry[] = [];
      snap.forEach((d) => iList.push(d.data() as Inquiry));
      setInquiries(iList);
    });

    return () => {
      unsubscribe();
      unsubInq();
    };
  }, [isOpen]);

  // Set initial selected partner if inquiry already has one, or default recommendation
  useEffect(() => {
    if (inquiry && isOpen) {
      if (inquiry.assignedPartnerId) {
        setSelectedPartnerUid(inquiry.assignedPartnerId);
      } else if (partners.length > 0) {
        // Auto recommend partner matching the inquiry category
        const bestMatch = partners.find((p) => p.partnerCategory === inquiry.parentCategory);
        if (bestMatch) {
          setSelectedPartnerUid(bestMatch.uid);
        } else {
          setSelectedPartnerUid('');
        }
      }
      setRoutingNote(inquiry.routingNote || '');
    }
  }, [inquiry?.id, isOpen, partners]);

  if (!isOpen || !inquiry) return null;

  const inquiryCat = CATEGORY_MAP[inquiry.parentCategory];

  // Filter partners
  const filteredPartners = partners.filter((p) => {
    const matchesSearch =
      p.displayName.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      (p.phone && p.phone.includes(search));

    const matchesCategory =
      selectedCategoryFilter === 'all' ||
      p.partnerCategory === selectedCategoryFilter ||
      p.partnerCategory === 'all';

    return matchesSearch && matchesCategory;
  });

  // Calculate ongoing workload count for a partner
  const getPartnerWorkload = (partnerUid: string) => {
    return inquiries.filter(
      (i) => i.assignedPartnerId === partnerUid && i.status !== 'replied'
    ).length;
  };

  // Handle Confirm Assignment
  const handleConfirmAssignment = async () => {
    if (!selectedPartnerUid) {
      alert('배정할 제휴처(파트너사)를 목록에서 선택해 주세요.');
      return;
    }

    const selectedPartner = partners.find((p) => p.uid === selectedPartnerUid);
    const partnerName = selectedPartner ? selectedPartner.displayName : '지정 제휴처';

    setIsSubmitting(true);
    try {
      const inquiryRef = doc(db, 'inquiries', inquiry.id);
      await updateDoc(inquiryRef, {
        status: 'routing',
        assignedPartnerId: selectedPartnerUid,
        assignedPartnerName: partnerName,
        assignedAt: serverTimestamp(),
        routingNote: routingNote.trim() || null,
        updatedAt: serverTimestamp()
      });

      if (onAssignSuccess) {
        onAssignSuccess(selectedPartnerUid, partnerName);
      }
      onClose();
    } catch (err: any) {
      console.error('Error assigning partner:', err);
      alert('제휴처 배정 실패: ' + (err.message || '오류가 발생했습니다.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Unassign (배정 해제)
  const handleUnassign = async () => {
    if (!window.confirm('현재 배정된 제휴처를 해제하고 일반 대기(pending) 상태로 되돌리시겠습니까?')) {
      return;
    }

    setIsSubmitting(true);
    try {
      const inquiryRef = doc(db, 'inquiries', inquiry.id);
      await updateDoc(inquiryRef, {
        status: 'pending',
        assignedPartnerId: null,
        assignedPartnerName: null,
        assignedAt: null,
        routingNote: null,
        updatedAt: serverTimestamp()
      });
      onClose();
    } catch (err: any) {
      console.error('Error unassigning partner:', err);
      alert('배정 해제 실패: ' + (err.message || '오류'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs text-left animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-600/30 rounded-xl border border-blue-400/30">
              <Handshake className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight">제휴사 스마트 매칭 및 공식 배정</h3>
              <p className="text-xs text-slate-300">
                사용자 관리에서 등록된 전문 제휴처 리스트 중 최적의 담당 업체를 지정합니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Target Inquiry Summary Card */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${inquiryCat?.bg} ${inquiryCat?.text}`}>
                  {inquiryCat?.label || inquiry.parentCategory}
                </span>
                <span className="text-slate-500 font-semibold">#{inquiry.subCategory}</span>
              </div>
              <span className="text-[11px] text-slate-500">
                작성자: <strong className="text-slate-800">{inquiry.authorName}</strong> ({inquiry.authorEmail})
              </span>
            </div>
            <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-snug">
              {inquiry.title}
            </h4>
            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-100">
              {inquiry.content}
            </p>
          </div>

          {/* Search & Filter Controls */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                <Building2 className="h-4 w-4 text-blue-600" />
                <span>배정할 제휴처 선택 (총 {partners.length}개사 등록됨)</span>
              </label>

              {/* Category Filter */}
              <div className="flex items-center space-x-1 overflow-x-auto text-[11px]">
                <button
                  type="button"
                  onClick={() => setSelectedCategoryFilter('all')}
                  className={`px-2 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    selectedCategoryFilter === 'all'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  전체
                </button>
                {Object.entries(CATEGORY_MAP).map(([catKey, catVal]) => (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => setSelectedCategoryFilter(catKey)}
                    className={`px-2 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                      selectedCategoryFilter === catKey
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {catVal.label.split('/')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Search input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="제휴처 이름(예: 착한식당, 한국여행), 이메일, 전화번호 검색..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
              />
            </div>
          </div>

          {/* Partner Cards List */}
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                등록된 제휴처 목록을 불러오는 중입니다...
              </div>
            ) : filteredPartners.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                검색 조건에 맞는 제휴처가 없습니다. 사용자 관리에서 제휴처(partner) 역할을 등록해 주세요.
              </div>
            ) : (
              filteredPartners.map((partner) => {
                const isSelected = selectedPartnerUid === partner.uid;
                const isOptimalMatch =
                  partner.partnerCategory === inquiry.parentCategory ||
                  partner.partnerCategory === 'all';
                const workload = getPartnerWorkload(partner.uid);
                const partnerCatInfo = partner.partnerCategory
                  ? CATEGORY_MAP[partner.partnerCategory as InquiryParentCategory]
                  : null;

                return (
                  <div
                    key={partner.uid}
                    onClick={() => setSelectedPartnerUid(partner.uid)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-600/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {/* Avatar initial */}
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {partner.displayName.substring(0, 2)}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <h5 className="text-xs font-black text-slate-900">
                            {partner.displayName}
                          </h5>
                          {partner.role === 'admin' ? (
                            <span className="text-[9px] bg-red-50 text-red-700 font-bold px-1.5 py-0.2 rounded border border-red-100">
                              본사 관리자
                            </span>
                          ) : (
                            <span className="text-[9px] bg-blue-50 text-blue-700 font-bold px-1.5 py-0.2 rounded border border-blue-100">
                              공식 제휴사
                            </span>
                          )}

                          {isOptimalMatch && (
                            <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.2 rounded border border-emerald-200 flex items-center space-x-0.5">
                              <Sparkles className="h-2.5 w-2.5 text-emerald-600" />
                              <span>최적 추천</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                          <span className="flex items-center space-x-1">
                            <Mail className="h-3 w-3 text-slate-400" />
                            <span>{partner.email}</span>
                          </span>
                          {partner.phone && (
                            <>
                              <span>•</span>
                              <span className="flex items-center space-x-1">
                                <Phone className="h-3 w-3 text-slate-400" />
                                <span>{partner.phone}</span>
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right side: Workload & Selection */}
                    <div className="flex items-center space-x-3 shrink-0">
                      <div className="text-right">
                        {partnerCatInfo && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded block mb-0.5 ${partnerCatInfo.bg} ${partnerCatInfo.text}`}>
                            {partnerCatInfo.label.split('/')[0]}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500 font-medium">
                          진행 배정 <strong className="text-blue-700">{workload}건</strong>
                        </span>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Admin Routing Note (관리자 전달 메모) */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <FileText className="h-3.5 w-3.5 text-slate-500" />
                <span>제휴처 전달 메모 / 특이사항 (선택)</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">
                제휴처 전용 답변 화면에 함께 표시됩니다
              </span>
            </label>
            <textarea
              rows={2}
              value={routingNote}
              onChange={(e) => setRoutingNote(e.target.value)}
              placeholder="예: 긴급 환불 요청 건이므로 빠른 유선 상담 요망, 맞춤 견적서 첨부 요청 등..."
              className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50/40"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div>
            {inquiry.assignedPartnerId && (
              <button
                type="button"
                onClick={handleUnassign}
                disabled={isSubmitting}
                className="text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 flex items-center space-x-1 transition-all cursor-pointer"
              >
                <UserX className="h-3.5 w-3.5" />
                <span>현재 배정 해제</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
            >
              닫기
            </button>
            <button
              type="button"
              disabled={isSubmitting || !selectedPartnerUid}
              onClick={handleConfirmAssignment}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>
                {isSubmitting
                  ? '배정 처리 중...'
                  : selectedPartnerUid
                  ? `'${partners.find((p) => p.uid === selectedPartnerUid)?.displayName || '제휴처'}'로 배정 확정`
                  : '제휴처를 선택해 주세요'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
