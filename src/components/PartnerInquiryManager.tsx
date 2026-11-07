import React, { useState, useEffect, useRef } from 'react';
import {
  Handshake,
  Search,
  Filter,
  ArrowRightLeft,
  CheckCircle,
  Clock,
  Send,
  Building2,
  Calendar,
  Sparkles,
  FileText,
  UserCheck,
  AlertCircle,
  Check,
  ChevronRight,
  RefreshCw,
  Paperclip,
  Eye,
  File,
  ExternalLink,
  X,
  Bot,
  ThumbsUp,
  MessageCircle,
  Zap,
  ShieldCheck,
  Bell
} from 'lucide-react';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import { Inquiry, UserProfile, CATEGORY_MAP, InquiryParentCategory } from '../types';

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

export const PartnerInquiryManager: React.FC = () => {
  const { user: authUser, userProfile } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [partners, setPartners] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'routing' | 'all' | 'replied'>('routing');
  const [partnerFilterUid, setPartnerFilterUid] = useState<string>('all');
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);

  // Reply Form & Assignment State
  const [selectedPartnerUid, setSelectedPartnerUid] = useState<string>('');
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Gemini AI Smart Suggested Replies & Preview State
  const [isGeneratingAiReply, setIsGeneratingAiReply] = useState(false);
  const [suggestedAiReplies, setSuggestedAiReplies] = useState<{ type: string; title: string; content: string }[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Partner Quick Response Templates
  const PARTNER_TEMPLATES = [
    {
      title: '📊 정밀 맞춤 견적 및 제안',
      content: `[제휴 파트너사 견적 및 안내]\n안녕하세요, 고객님! 문의주신 세부 요청 사항을 정밀 검토하였습니다.\n\n• 제안 내역: 고객 맞춤 견적 산출 완료 및 일정 배정 가능\n• 혜택 안내: 상담 진행 시 플랫폼 전용 특별 우대 할인 10% 적용\n• 다음 단계: 유선 상담 또는 상세 조율을 위해 담당 전문가가 추가 연락드릴 예정입니다.\n궁금하신 사항은 언제든 회신 부탁드립니다. 감사합니다.`
    },
    {
      title: '📅 방문 실측 및 일정 조율',
      content: `[제휴 파트너사 현장 조율 안내]\n안녕하세요! 고객님의 요청 현장 확인 및 최적의 솔루션을 제공해 드리기 위해 현장 일정 조율이 가능합니다.\n\n• 희망 일정: 평일 오전/오후 및 주말 사전 조율 가능\n• 현장 점검 소요: 약 30분~1시간\n편하신 시간대를 남겨주시면 담당 파트너가 즉시 일정을 확정해 드리겠습니다.`
    },
    {
      title: '📦 제휴 물류/반품 직수거 안내',
      content: `[제휴 물류 전담팀 안내]\n안녕하세요! 배송/반품 관련 불편을 겪으신 점 양해 말씀드립니다.\n\n• 처리 방식: 전담 물류 택배사를 통한 1~2영업일 내 직수거 접수\n• 비용 안내: 제품 초기 이상/오배송으로 인한 전액 무상 처리\n상품을 박스에 재포장해 두시면 기사님께서 수거 방문하실 예정입니다.`
    },
    {
      title: '🍽️ 단체 대관/코스 패키지 확정',
      content: `[제휴 매장 단체 예약 안내]\n안녕하세요! 대관 및 단체 예약 문의 감사드립니다.\n\n• 제안 공간: 프라이빗 독립 룸 및 빔프로젝터 음향 설비 무상 지원\n• 코스 구성: 인원 맞춤형 스페셜 세트 및 웰컴 드링크 제공\n상세 일정 예약금 입금 및 세부 메뉴 확정을 위해 유선 안내 드리겠습니다.`
    }
  ];

  // Real-time listener on Inquiries
  useEffect(() => {
    setLoading(true);
    const inqRef = collection(db, 'inquiries');
    const q = query(inqRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Inquiry[] = [];
      snapshot.forEach((d) => {
        list.push({
          id: d.id,
          ...d.data()
        } as Inquiry);
      });
      setInquiries(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Real-time listener on Partners (users with role === 'partner' or admin)
  useEffect(() => {
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
    });

    return () => unsubscribe();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filter inquiries
  const filteredInquiries = inquiries.filter((inq) => {
    const matchesSearch = 
      inq.title.toLowerCase().includes(search.toLowerCase()) ||
      inq.content.toLowerCase().includes(search.toLowerCase()) ||
      inq.authorName.toLowerCase().includes(search.toLowerCase()) ||
      inq.authorEmail.toLowerCase().includes(search.toLowerCase());

    const matchesPartner = 
      partnerFilterUid === 'all' || 
      inq.assignedPartnerId === partnerFilterUid;

    let matchesStatus = true;
    if (filterType === 'routing') {
      matchesStatus = inq.status === 'routing' || Boolean(inq.assignedPartnerId);
    } else if (filterType === 'replied') {
      matchesStatus = inq.status === 'replied';
    }

    return matchesSearch && matchesPartner && matchesStatus;
  });

  // Active Inquiry
  const activeInquiry = inquiries.find((i) => i.id === selectedInquiryId) || filteredInquiries[0] || null;
  const lastActiveIdRef = useRef<string | null>(null);

  // Auto-set partner selection when active inquiry changes
  useEffect(() => {
    if (activeInquiry) {
      if (activeInquiry.assignedPartnerId) {
        setSelectedPartnerUid(activeInquiry.assignedPartnerId);
      } else if (partners.length > 0 && !selectedPartnerUid) {
        const matchingPartner = partners.find(p => p.partnerCategory === activeInquiry.parentCategory);
        setSelectedPartnerUid(matchingPartner ? matchingPartner.uid : partners[0]?.uid || '');
      }

      // Only update reply text if selected inquiry has switched
      if (lastActiveIdRef.current !== activeInquiry.id) {
        lastActiveIdRef.current = activeInquiry.id;
        if (activeInquiry.reply?.content) {
          setReplyText(activeInquiry.reply.content);
        } else {
          setReplyText('');
        }
      }
    }
  }, [activeInquiry?.id, partners.length]);

  // Handle Partner Assignment
  const handleAssignPartner = async (partnerUid: string) => {
    if (!activeInquiry) return;
    try {
      const partnerObj = partners.find(p => p.uid === partnerUid);
      const partnerName = partnerObj?.displayName || '선택한 제휴처';
      const inqRef = doc(db, 'inquiries', activeInquiry.id);
      await updateDoc(inqRef, {
        assignedPartnerId: partnerUid,
        assignedPartnerName: partnerName,
        assignedAt: serverTimestamp(),
        status: activeInquiry.status === 'pending' ? 'routing' : activeInquiry.status,
        updatedAt: serverTimestamp()
      });
      setSelectedPartnerUid(partnerUid);
      showToast(`'${partnerName}'로 제휴처가 성공적으로 배정되었습니다.`);
    } catch (err: any) {
      alert(`제휴처 배정 실패: ${err.message || '오류'}`);
    }
  };

  // Generate Gemini AI Smart Suggested Replies
  const handleGenerateAiReplies = async () => {
    if (!activeInquiry) return;
    setIsGeneratingAiReply(true);
    try {
      const res = await fetch('/api/ai/suggest-replies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: activeInquiry.title,
          content: activeInquiry.content,
          category: CATEGORY_MAP[activeInquiry.parentCategory]?.label || activeInquiry.parentCategory,
          subCategory: activeInquiry.subCategory
        })
      });
      const data = await res.json();
      if (data.replies && Array.isArray(data.replies)) {
        setSuggestedAiReplies(data.replies);
        showToast('✨ Gemini AI 스마트 맞춤 답변 추천 3종이 성공적으로 생성되었습니다.');
      } else {
        throw new Error('답변 생성 실패');
      }
    } catch (err: any) {
      console.error('AI Reply error:', err);
      showToast('AI 추천 생성 중 일시적인 문제가 발생했습니다. 기본 템플릿을 권장합니다.');
    } finally {
      setIsGeneratingAiReply(false);
    }
  };

  // Handle Send Partner Reply
  const handleSendPartnerReply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeInquiry) {
      alert('처리할 문의를 먼저 선택해 주세요.');
      return;
    }
    if (!replyText.trim()) {
      alert('답변 내용을 입력해 주세요.');
      return;
    }

    const currentPartner = partners.find(p => p.uid === selectedPartnerUid);
    const replierName = currentPartner 
      ? `${currentPartner.displayName} (공식 제휴처)` 
      : (activeInquiry.assignedPartnerName ? `${activeInquiry.assignedPartnerName} (공식 제휴처)` : (userProfile?.displayName || '제휴 지원팀'));

    setIsSubmitting(true);
    try {
      const inqRef = doc(db, 'inquiries', activeInquiry.id);
      
      const updateData: Record<string, any> = {
        status: 'replied',
        reply: {
          content: replyText.trim(),
          createdAt: new Date(),
          repliedBy: authUser?.uid || 'partner',
          repliedByName: replierName
        },
        updatedAt: serverTimestamp()
      };

      if (selectedPartnerUid) {
        updateData.assignedPartnerId = selectedPartnerUid;
        if (currentPartner?.displayName) {
          updateData.assignedPartnerName = currentPartner.displayName;
        }
      } else if (activeInquiry.assignedPartnerId) {
        updateData.assignedPartnerId = activeInquiry.assignedPartnerId;
        if (activeInquiry.assignedPartnerName) {
          updateData.assignedPartnerName = activeInquiry.assignedPartnerName;
        }
      }

      await updateDoc(inqRef, updateData);

      showToast(`고객('${activeInquiry.authorName || '고객'}')에게 제휴처 공식 답변이 성공적으로 발송 및 등록되었습니다.`);
    } catch (err: any) {
      console.error('Error sending partner reply:', err);
      alert(`답변 발행 실패: ${err.message || '오류가 발생했습니다.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Metrics
  const routingCount = inquiries.filter(i => i.status === 'routing').length;
  const partnerRepliedCount = inquiries.filter(i => i.status === 'replied' && i.assignedPartnerId).length;

  return (
    <div className="space-y-6 text-left">
      {/* Toast */}
      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center space-x-2 text-xs font-semibold shadow-xs">
          <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 🚀 Wide Hero Banner (동일 알림 와이드 섹션 스타일: 제휴처 1:1 전담 답변 및 파트너 매칭 스튜디오) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white p-8 md:p-10 shadow-xl border border-indigo-900/50">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-bold tracking-wide">
            <Handshake className="h-3.5 w-3.5 text-sky-300 animate-pulse" />
            <span>공식 제휴 기업 & 전문 파트너사 전담 1:1 답변 워크스페이스</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            접수된 고객 문의 실시간 배정<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-sky-200 to-indigo-200">
              제휴처 맞춤 견적 & 공식 답변하기
            </span>
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            현대차·삼성전자·LG전자·쿠팡 등 제휴사 및 공인 파트너에게 이송된 고객 문의를 실시간 배정하고,
            Gemini AI 추천 답변과 4대 전문 템플릿을 활용해 신속하고 신뢰도 높은 해결책을 원클릭으로 전송합니다.
          </p>

          {/* Hero Search Bar */}
          <div className="pt-2">
            <div className="relative flex items-center">
              <Search className="absolute left-4.5 h-5 w-5 text-indigo-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="제휴 문의 제목, 접수 고객명, 세부 내용 및 답변 검색..."
                className="w-full pl-12 pr-10 py-3.5 text-xs sm:text-sm bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-slate-900 placeholder:text-slate-400 focus:placeholder:text-slate-400 rounded-2xl border border-indigo-400/30 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 backdrop-blur-md transition-all outline-none font-medium"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-4 text-slate-400 hover:text-white focus:text-slate-700 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Metrics Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold">
              <ArrowRightLeft className="h-3.5 w-3.5 text-blue-300" />
              <span>제휴 이송 대기: <strong className="text-white ml-1">{routingCount}건</strong></span>
            </div>

            <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-bold">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-300" />
              <span>제휴 답변 완료: <strong className="text-white ml-1">{partnerRepliedCount}건</strong></span>
            </div>

            <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-bold">
              <Building2 className="h-3.5 w-3.5 text-purple-300" />
              <span>등록 제휴사: <strong className="text-white ml-1">{partners.length}곳</strong></span>
            </div>

            <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-200 text-xs font-bold">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>Gemini AI 추천 탑재</span>
            </div>
          </div>
        </div>

        {/* Ambient Glow Effects */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-20 w-64 h-64 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />
      </div>

      {/* Main Grid: Left Inquiry Queue, Right Response Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Partner Inquiry List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-xs space-y-3">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2.5 text-xs">
              <button
                onClick={() => setFilterType('routing')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] cursor-pointer transition-all ${
                  filterType === 'routing'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                제휴 이송/배정건 ({inquiries.filter(i => i.status === 'routing' || i.assignedPartnerId).length})
              </button>
              <button
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] cursor-pointer transition-all ${
                  filterType === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                전체 문의 ({inquiries.length})
              </button>
              <button
                onClick={() => setFilterType('replied')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] cursor-pointer transition-all ${
                  filterType === 'replied'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                완료건
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="제휴 문의 검색..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
              />
            </div>

            {/* Quick Partner Filtering Chips */}
            {partners.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <span className="text-slate-600 font-bold flex items-center space-x-1">
                    <Building2 className="h-3 w-3 text-blue-600" />
                    <span>업체별 보기</span>
                  </span>
                  {partnerFilterUid !== 'all' && (
                    <button
                      onClick={() => setPartnerFilterUid('all')}
                      className="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer"
                    >
                      전체 보기
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px]">
                  <button
                    onClick={() => setPartnerFilterUid('all')}
                    className={`px-2 py-0.5 rounded-md font-bold whitespace-nowrap transition-all cursor-pointer ${
                      partnerFilterUid === 'all'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    전체 ({inquiries.length})
                  </button>
                  {partners.map((p) => {
                    const count = inquiries.filter(i => i.assignedPartnerId === p.uid).length;
                    return (
                      <button
                        key={p.uid}
                        onClick={() => setPartnerFilterUid(p.uid)}
                        className={`px-2 py-0.5 rounded-md font-bold whitespace-nowrap transition-all cursor-pointer flex items-center space-x-1 ${
                          partnerFilterUid === p.uid
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <span>{p.displayName}</span>
                        {count > 0 && (
                          <span className={`text-[9px] px-1 rounded-full ${
                            partnerFilterUid === p.uid ? 'bg-white/25 text-white' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Inquiry Cards List */}
          <div className="space-y-2.5 max-h-[72vh] overflow-y-auto pr-1">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-xl">
                데이터를 동기화 중입니다...
              </div>
            ) : filteredInquiries.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-100">
                해당 조건의 제휴처 문의가 없습니다.
              </div>
            ) : (
              filteredInquiries.map((inq) => {
                const isSelected = activeInquiry?.id === inq.id;
                const catInfo = CATEGORY_MAP[inq.parentCategory];
                const assignedPartner = partners.find(p => p.uid === inq.assignedPartnerId);

                return (
                  <div
                    key={inq.id}
                    onClick={() => setSelectedInquiryId(inq.id)}
                    className={`bg-white border rounded-xl p-4 shadow-xs text-left space-y-2.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 ring-2 ring-blue-600/15 bg-blue-50/10'
                        : 'border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 text-[10px]">
                        <span className={`px-1.5 py-0.5 rounded font-bold ${catInfo?.bg} ${catInfo?.text}`}>
                          {catInfo?.label || inq.parentCategory}
                        </span>
                        <span className="text-slate-400 font-medium">#{inq.subCategory}</span>
                      </div>

                      {inq.status === 'replied' ? (
                        <span className="text-[9px] text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                          답변 완료
                        </span>
                      ) : inq.status === 'routing' ? (
                        <span className="text-[9px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 animate-pulse">
                          제휴 이송중
                        </span>
                      ) : (
                        <span className="text-[9px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                          대기
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-black text-slate-900 line-clamp-1">
                      {inq.title}
                    </h4>

                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {inq.content}
                    </p>

                    {/* Assigned Partner Tag */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px]">
                      <div className="flex items-center space-x-1 text-slate-500">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        <span>{formatDateTime(inq.createdAt)}</span>
                      </div>

                      {inq.assignedPartnerName || assignedPartner?.displayName ? (
                        <span className="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded flex items-center space-x-1">
                          <Building2 className="h-2.5 w-2.5 shrink-0" />
                          <span className="truncate max-w-[120px]">배정: {inq.assignedPartnerName || assignedPartner?.displayName}</span>
                        </span>
                      ) : (
                        <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-medium">
                          파트너 미배정
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Partner Response Studio (7 cols) */}
        <div className="lg:col-span-7">
          {activeInquiry ? (
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-6">
              {/* Inquiry Metadata */}
              <div className="space-y-2 border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center space-x-1">
                    <Handshake className="h-3.5 w-3.5" />
                    <span>제휴처 매칭 및 전용 답변 스튜디오</span>
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    접수: {formatDateTime(activeInquiry.createdAt)}
                  </span>
                </div>
                <h3 className="text-base font-black text-slate-900">{activeInquiry.title}</h3>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span>작성자: <strong className="text-slate-800">{activeInquiry.authorName}</strong> ({activeInquiry.authorEmail})</span>
                  <span>•</span>
                  <span>분야: <strong className="text-slate-800">{CATEGORY_MAP[activeInquiry.parentCategory]?.label} ({activeInquiry.subCategory})</strong></span>
                </div>
              </div>

              {/* Inquiry Content Box */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed shadow-inner">
                {activeInquiry.content}
              </div>

              {/* Customer Attachments if present */}
              {activeInquiry.attachments && activeInquiry.attachments.length > 0 && (
                <div className="p-3.5 bg-indigo-50/40 rounded-xl border border-indigo-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-900 flex items-center space-x-1.5">
                      <Paperclip className="h-3.5 w-3.5 text-indigo-600" />
                      <span>고객 첨부 파일 ({activeInquiry.attachments.length}개)</span>
                    </span>
                    <span className="text-[10px] text-indigo-600 font-medium">클릭 시 확대 및 다운로드 가능</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeInquiry.attachments.map((att, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center justify-between p-2 bg-white rounded-lg border border-indigo-100 text-xs shadow-xs"
                      >
                        <div className="flex items-center space-x-2 truncate">
                          {att.type.startsWith('image/') ? (
                            <img 
                              src={att.dataUrl} 
                              alt={att.name}
                              className="h-8 w-8 object-cover rounded cursor-pointer border border-slate-200"
                              onClick={() => setPreviewImage(att.dataUrl)}
                            />
                          ) : (
                            <File className="h-5 w-5 text-slate-400 shrink-0" />
                          )}
                          <div className="truncate">
                            <p className="font-semibold text-slate-800 text-[11px] truncate max-w-[130px]">{att.name}</p>
                            <p className="text-[10px] text-slate-400">{(att.size / 1024).toFixed(1)} KB</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1 shrink-0">
                          {att.type.startsWith('image/') && (
                            <button
                              type="button"
                              onClick={() => setPreviewImage(att.dataUrl)}
                              className="p-1 text-indigo-600 hover:bg-indigo-50 rounded"
                              title="미리보기"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <a
                            href={att.dataUrl}
                            download={att.name}
                            className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded"
                            title="다운로드"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Customer Satisfaction Feedback if present */}
              {activeInquiry.satisfaction && (
                <div className={`p-3.5 rounded-xl border text-xs flex items-start space-x-3 ${
                  activeInquiry.satisfaction.rating === 'helpful'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : 'bg-amber-50 border-amber-200 text-amber-950'
                }`}>
                  <div className="p-1.5 bg-white rounded-lg shadow-xs mt-0.5">
                    {activeInquiry.satisfaction.rating === 'helpful' ? (
                      <ThumbsUp className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <MessageCircle className="h-4 w-4 text-amber-600" />
                    )}
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs">
                        고객 만족도 피드백: {activeInquiry.satisfaction.rating === 'helpful' ? '⭐ 매우 만족 (해결됨)' : '📝 추가 확인/상담 필요'}
                      </span>
                      <span className="text-[10px] opacity-70">
                        {formatDateTime(activeInquiry.satisfaction.submittedAt)}
                      </span>
                    </div>
                    {activeInquiry.satisfaction.feedback && (
                      <p className="text-[11px] font-medium italic bg-white/70 p-2 rounded-md border border-black/5">
                        "{activeInquiry.satisfaction.feedback}"
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Admin Routing Note if present */}
              {activeInquiry.routingNote && (
                <div className="p-3.5 bg-amber-50/90 rounded-xl border border-amber-200 text-xs text-amber-950 flex items-start space-x-2.5 shadow-xs">
                  <FileText className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-bold text-amber-900 block">관리자 배정 전달 메모 / 주의사항:</span>
                    <p className="text-amber-800 leading-relaxed font-medium">{activeInquiry.routingNote}</p>
                  </div>
                </div>
              )}

              {/* Partner Assignment Selector */}
              <div className="p-4 bg-blue-50/40 rounded-xl border border-blue-100 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-blue-900 flex items-center space-x-1.5">
                    <Building2 className="h-3.5 w-3.5 text-blue-600" />
                    <span>담당 제휴처(전문가) 매칭 및 배정</span>
                  </label>
                  <span className="text-[10px] text-blue-600 font-medium">등록된 제휴 파트너 총 {partners.length}개사</span>
                </div>

                <div className="flex items-center space-x-2">
                  <select
                    value={selectedPartnerUid}
                    onChange={(e) => {
                      const newUid = e.target.value;
                      setSelectedPartnerUid(newUid);
                      if (newUid) {
                        handleAssignPartner(newUid);
                      }
                    }}
                    className="flex-1 p-2.5 text-xs bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium text-slate-800"
                  >
                    <option value="">제휴처 선택 안 됨 (배정 대기)</option>
                    {partners.map((p) => (
                      <option key={p.uid} value={p.uid}>
                        {p.displayName} ({p.role === 'admin' ? '본사 총괄' : p.partnerCategory ? CATEGORY_MAP[p.partnerCategory]?.label || p.partnerCategory : '전문가'}) - {p.email}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Gemini AI Smart Suggested Replies */}
              <div className="p-3.5 bg-gradient-to-r from-indigo-50/70 via-purple-50/50 to-blue-50/70 rounded-xl border border-indigo-100 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <div className="p-1 bg-indigo-600 text-white rounded-md">
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-black text-indigo-950 flex items-center space-x-1">
                      <span>Gemini AI 스마트 맞춤 답변 생성기</span>
                      <span className="text-[9px] bg-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded-full font-bold">
                        Flash 3.5 AI Core
                      </span>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateAiReplies}
                    disabled={isGeneratingAiReply}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs rounded-lg transition-all shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {isGeneratingAiReply ? (
                      <>
                        <RefreshCw className="h-3 w-3 animate-spin" />
                        <span>생성 중...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3 w-3" />
                        <span>AI 추천 답변 3종 생성</span>
                      </>
                    )}
                  </button>
                </div>

                {suggestedAiReplies.length > 0 ? (
                  <div className="space-y-2 pt-1">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {suggestedAiReplies.map((r, i) => (
                        <div 
                          key={i}
                          onClick={() => {
                            setReplyText(r.content);
                            showToast(`'${r.title}' AI 제안 답변이 입력창에 적용되었습니다.`);
                          }}
                          className="p-2.5 bg-white border border-indigo-200/80 hover:border-indigo-400 rounded-lg cursor-pointer transition-all hover:shadow-sm text-left group"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-bold text-indigo-900 group-hover:text-indigo-600 flex items-center space-x-1">
                              <span>{r.title}</span>
                            </span>
                            <span className="text-[9px] text-indigo-500 font-bold bg-indigo-50 px-1.5 py-0.2 rounded">
                              클릭 적용
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-600 line-clamp-3 leading-relaxed font-mono">
                            {r.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500">
                    문의 내용과 카테고리를 심층 분석하여 표준 친절형, 일정/견적 안내형, 추가 정보 확인형 답변 3종을 즉시 추천합니다.
                  </p>
                )}
              </div>

              {/* Quick Template Buttons */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 flex items-center space-x-1">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span>제휴처 신속 답변 템플릿 불러오기</span>
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {PARTNER_TEMPLATES.map((tpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setReplyText(tpl.content)}
                      className="p-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg text-left text-[11px] font-semibold text-slate-700 hover:text-blue-700 transition-all cursor-pointer truncate"
                      title={tpl.title}
                    >
                      {tpl.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendPartnerReply} className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-800">
                      제휴처 공식 견적 및 회신 내용
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {replyText.length} / 3000자
                    </span>
                  </div>
                  <textarea
                    rows={6}
                    required
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="고객님께 전달할 제휴처 공식 견적, 일정 안내, 매칭 상세 답변을 작성해 주세요..."
                    className="w-full p-3.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono leading-relaxed bg-white"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-[11px] text-slate-500 flex items-center space-x-1">
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span>발행 즉시 고객 포탈 및 실시간 관제에 [답변 완료]로 갱신됩니다.</span>
                  </div>

                  <button
                    type="submit"
                    onClick={(e) => {
                      if (!isSubmitting && replyText.trim()) {
                        handleSendPartnerReply(e);
                      }
                    }}
                    disabled={isSubmitting || !replyText.trim()}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    {isSubmitting ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                    <span>{isSubmitting ? '발행 중...' : '제휴처 답변 최종 발행'}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-2xl p-16 text-center text-xs text-slate-400">
              처리할 제휴 문의를 좌측 목록에서 선택해 주세요.
            </div>
          )}
        </div>
      </div>
      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh] bg-white rounded-2xl overflow-hidden shadow-2xl p-2" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-700">고객 첨부 이미지 확대</span>
              <button 
                type="button" 
                onClick={() => setPreviewImage(null)} 
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-2 flex items-center justify-center overflow-auto max-h-[75vh]">
              <img 
                src={previewImage} 
                alt="첨부 이미지 확대" 
                className="max-h-[70vh] max-w-full object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
