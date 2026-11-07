import React, { useState, useMemo, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  increment 
} from 'firebase/firestore';
import { db } from '../firebase';
import { PUBLIC_ALERTS, PublicNoticeAlert, AlertCategory } from '../data/publicAlertsData';
import { 
  Bell, 
  AlertTriangle, 
  Scale, 
  Gift, 
  ShieldAlert, 
  Search, 
  Filter, 
  Share2, 
  Bookmark, 
  BookmarkCheck, 
  Phone, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  ChevronRight, 
  ChevronLeft,
  X, 
  Copy, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Building2, 
  HelpCircle,
  FileText,
  Pin,
  Flame,
  ArrowRight
} from 'lucide-react';
import { InquiryParentCategory } from '../types';

interface PublicNotificationCenterProps {
  onNavigateToInquiry?: (prefill: {
    parentCategory: InquiryParentCategory;
    subCategory: string;
    title: string;
    content: string;
  }) => void;
  onGoToCustomerPortal?: () => void;
}

export const PublicNotificationCenter: React.FC<PublicNotificationCenterProps> = ({
  onNavigateToInquiry,
  onGoToCustomerPortal
}) => {
  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState<AlertCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<'all' | 'high' | 'medium'>('all');
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);

  // Pagination (4 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 4;

  // Selected Detail Modal
  const [selectedAlert, setSelectedAlert] = useState<PublicNoticeAlert | null>(null);

  // Local storage bookmarks & shares
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('modoo_alerts_bookmarks');
      return saved ? new Set(JSON.parse(saved)) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Real-time Firestore or custom dynamic alerts state
  const [dbAlerts, setDbAlerts] = useState<PublicNoticeAlert[]>([]);

  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'public_alerts'), (snapshot) => {
        if (!snapshot.empty) {
          const items: PublicNoticeAlert[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            items.push({
              id: docSnap.id,
              category: data.category || 'urgent',
              categoryLabel: data.categoryLabel || '소비자 경보',
              badgeText: data.badgeText || '공식 고지',
              urgency: data.urgency || 'normal',
              title: data.title || '',
              summary: data.summary || '',
              targetAudience: data.targetAudience || '전 국민',
              institution: data.institution || '공식 인증 기관',
              effectiveDate: data.effectiveDate || '상시',
              keyPoints: Array.isArray(data.keyPoints) ? data.keyPoints : [],
              actionGuide: Array.isArray(data.actionGuide) ? data.actionGuide : [],
              lawBasis: data.lawBasis || '',
              contactNumber: data.contactNumber || '1372',
              viewCount: data.viewCount || 0,
              shareCount: data.shareCount || 0,
              pinned: !!data.pinned
            });
          });
          setDbAlerts(items);
        }
      }, (err) => {
        console.warn("Public alerts onSnapshot note:", err);
      });
      return () => unsub();
    } catch (e) {
      console.warn("Firestore public alerts bind error:", e);
    }
  }, []);

  // Sync with global ranking search triggers
  useEffect(() => {
    const handleSetSearch = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.query) {
        setSearchQuery(customEvent.detail.query);
        setSelectedCategory('all'); // clear category filter
        setCurrentPage(1); // reset to page 1
      }
    };
    window.addEventListener('set-alert-search', handleSetSearch);
    return () => window.removeEventListener('set-alert-search', handleSetSearch);
  }, []);

  // Merge static + Firestore
  const allAlerts = useMemo(() => {
    if (dbAlerts.length === 0) return PUBLIC_ALERTS;
    const map = new Map<string, PublicNoticeAlert>();
    PUBLIC_ALERTS.forEach(a => map.set(a.id, a));
    dbAlerts.forEach(a => map.set(a.id, a));
    return Array.from(map.values());
  }, [dbAlerts]);

  // Filter and Sort
  const filteredAlerts = useMemo(() => {
    return allAlerts.filter(alert => {
      // Category filter
      if (selectedCategory !== 'all' && alert.category !== selectedCategory) {
        return false;
      }
      // Urgency filter
      if (urgencyFilter !== 'all' && alert.urgency !== urgencyFilter) {
        return false;
      }
      // Bookmark filter
      if (onlyBookmarked && !bookmarkedIds.has(alert.id)) {
        return false;
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = alert.title.toLowerCase().includes(q);
        const inSummary = alert.summary.toLowerCase().includes(q);
        const inInstitution = alert.institution.toLowerCase().includes(q);
        const inLaw = alert.lawBasis?.toLowerCase().includes(q) || false;
        const inKeys = alert.keyPoints.some(k => k.toLowerCase().includes(q));
        if (!inTitle && !inSummary && !inInstitution && !inLaw && !inKeys) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      // Pinned items first, then urgency, then views
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      if (a.urgency === 'high' && b.urgency !== 'high') return -1;
      if (a.urgency !== 'high' && b.urgency === 'high') return 1;
      return b.viewCount - a.viewCount;
    });
  }, [allAlerts, selectedCategory, urgencyFilter, onlyBookmarked, bookmarkedIds, searchQuery]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredAlerts.length / PAGE_SIZE));
  const pagedAlerts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredAlerts.slice(start, start + PAGE_SIZE);
  }, [filteredAlerts, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, urgencyFilter, onlyBookmarked, searchQuery]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Toast trigger
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Toggle Bookmark
  const toggleBookmark = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = new Set(bookmarkedIds);
    if (updated.has(id)) {
      updated.delete(id);
      triggerToast('북마크에서 제거되었습니다.');
    } else {
      updated.add(id);
      triggerToast('📌 중요 알림으로 보관함에 저장되었습니다.');
    }
    setBookmarkedIds(updated);
    try {
      localStorage.setItem('modoo_alerts_bookmarks', JSON.stringify(Array.from(updated)));
    } catch {
      // ignore
    }
  };

  // Share Alert
  const handleShare = (alert: PublicNoticeAlert, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const text = `[모두의알림 - ${alert.badgeText}]\n🚨 ${alert.title}\n\n💡 핵심 요약: ${alert.summary}\n⚖️ 소관 기관: ${alert.institution}\n📞 직통 문의: ${alert.contactNumber || '1372'}\n\n전국민 안심 권익 포털 모두의문의에서 확인하세요!`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(alert.id);
      triggerToast('가족·지인 공유용 알림 카드가 복사되었습니다! 카카오톡 등에 바로 붙여넣기 하세요.');
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  // Bridge to 1:1 Inquiry
  const handleResolveDirectly = (alert: PublicNoticeAlert) => {
    if (onNavigateToInquiry) {
      let parentCat: InquiryParentCategory = 'shopping';
      if (alert.category === 'law') parentCat = 'other';
      if (alert.category === 'benefit') parentCat = 'other';
      if (alert.category === 'partner') {
        if (alert.title.includes('현대') || alert.title.includes('자동차')) parentCat = 'other';
        else if (alert.title.includes('삼성') || alert.title.includes('전자') || alert.title.includes('LG') || alert.title.includes('쿠팡')) parentCat = 'shopping';
        else parentCat = 'other';
      }
      if (alert.title.includes('배달') || alert.title.includes('음식')) parentCat = 'restaurant';
      if (alert.title.includes('호텔') || alert.title.includes('항공')) parentCat = 'travel';

      // Special check for dynamic hot issues (TVING, DCC, Gifticon)
      const isTvingAlert = alert.id === 'alert-13' || alert.id === 'issue-tving-leak' || alert.title.includes('티빙') || alert.title.includes('TVING');
      const isDccAlert = alert.id === 'issue-dcc-warning' || alert.title.includes('DCC') || alert.title.includes('이중 수수료') || alert.title.includes('해외 예약');
      const isGifticonAlert = alert.id === 'issue-gifticon-refund' || alert.title.includes('기프티콘') || alert.title.includes('상품권');

      if (isTvingAlert || isGifticonAlert) {
        parentCat = 'other';
      } else if (isDccAlert) {
        parentCat = 'travel';
      }

      const isPartnerAlert = alert.category === 'partner';
      let defaultContent = isPartnerAlert
        ? `■ 제휴 기업 알림 내용: ${alert.title}\n■ 제휴사/주관사: ${alert.institution} (${alert.effectiveDate})\n■ 문의 및 혜택/리콜 신청 세부 내용:\n(해당 기업 알림과 관련하여 신청하고자 하는 무상 점검, 사전예약 혜택, 보증수리 등의 내용을 기재해 주세요.)\n\n■ 요청 사항:\n공식 제휴사 전용 혜택 적용 및 신속한 안내를 요청합니다.`
        : `■ 알림 고지 내용: ${alert.title}\n■ 관련 소관 기관: ${alert.institution} (${alert.effectiveDate})\n■ 본인 피해 및 구제 희망 내용:\n(이곳에 겪으신 피해 금액, 매장명, 분쟁 일자를 상세히 기재해 주세요.)\n\n■ 요청 사항:\n공식 고지 기준에 따른 전액 환불 및 표준 위약금 재산정 중재를 요청합니다.`;

      let selectedSubCat = alert.categoryLabel;
      let selectedTitle = isPartnerAlert ? `[제휴처 기업 알림 문의] ${alert.title}` : `[모두의알림 관련 구제 요청] ${alert.title}`;

      if (isTvingAlert) {
        selectedSubCat = 'privacy_leak_compensation';
        selectedTitle = `[긴급 피해보상 청구] 티빙(TVING) 개인정보 유출 확인 및 보상안 미지급 이의 제기`;
        defaultContent = `■ 티빙 가입 계정 ID (또는 이메일): \n■ 본인 인증된 휴대폰 번호: \n■ 유출 확인된 구체적 항목: (예: ID, 이메일, 전화번호, 구독 유형)\n■ 현재 겪으신 2차 피해 유무: (예: 광고성 스팸 급증 / 보이스피싱 시도 등)\n■ 희망 보상 방식: (공식 보상 이용권 수령 / 추가 물질 피해 보상 심의 요청)\n\n※ 티빙 유출 사실 조회 화면 캡처본을 파일 첨부 영역에 등록해 주시면 더욱 신속한 합동 정산 보상이 진행됩니다.`;
      } else if (isDccAlert) {
        selectedSubCat = 'dcc_fee_compensation';
        selectedTitle = `[긴급피해 구제] DCC 이중 환전 수수료 청구 이의 제기 및 해외 예약 플랫폼 취소 환불 청구`;
        defaultContent = `■ 피해 예약 사이트명 및 예약 번호: \n■ 카드 승인 일시 및 실제 원화 결제금액: \n■ DCC 이중 수수료 및 취소 거절 구체적 경위: (예: 결제 직후 취소 요청했으나 환불 불가 약관이라며 거절함)\n■ 카드 발급사명: (예: 신한카드, 국민카드 등)\n\n※ 해외 결제 승인 상세 내역이나 취소 거절 화면 캡처본을 파일 첨부 영역에 등록해 주시면 더욱 신속한 전액 환불 조율이 진행됩니다.`;
      } else if (isGifticonAlert) {
        selectedSubCat = 'gifticon_leak_compensation';
        selectedTitle = `[알짜혜택 환급] 유효기간 만료 기프티콘 및 모바일 쿠폰 90% 현금 환급 대행 청구`;
        defaultContent = `■ 만료된 모바일 상품권 브랜드/쿠폰 종류: (예: 카카오톡 스타벅스 디저트 세트, 기프티쇼 금액권)\n■ 상품권 쿠폰 번호 (12자리~16자리): \n■ 최초 결제금액 (알 수 없는 경우 대략 기재): \n■ 환불 받으실 본인 계좌 정보: (은행명 / 계좌번호 / 예금주명)\n\n※ 만료된 기프티콘 화면 캡처본을 파일 첨부 영역에 올려주시면 전산 정합성 매칭이 신속히 진행되어 24시간 내 이체가 보장됩니다.`;
      }

      onNavigateToInquiry({
        parentCategory: parentCat,
        subCategory: selectedSubCat,
        title: selectedTitle,
        content: defaultContent
      });
      setSelectedAlert(null);
    } else if (onGoToCustomerPortal) {
      onGoToCustomerPortal();
    }
  };

  // Category Tabs metadata
  const categories: { id: AlertCategory | 'all'; label: string; icon: any; count: number; color: string }[] = [
    { 
      id: 'all', 
      label: '전체 알림', 
      icon: Bell, 
      count: allAlerts.length,
      color: 'indigo'
    },
    { 
      id: 'urgent', 
      label: '긴급 피해주의보', 
      icon: AlertTriangle, 
      count: allAlerts.filter(a => a.category === 'urgent').length,
      color: 'red'
    },
    { 
      id: 'law', 
      label: '법 개정/의무 시행', 
      icon: Scale, 
      count: allAlerts.filter(a => a.category === 'law').length,
      color: 'blue'
    },
    { 
      id: 'benefit', 
      label: '전국민 알짜 혜택', 
      icon: Gift, 
      count: allAlerts.filter(a => a.category === 'benefit').length,
      color: 'emerald'
    },
    { 
      id: 'safety', 
      label: '안전 긴급 리콜', 
      icon: ShieldAlert, 
      count: allAlerts.filter(a => a.category === 'safety').length,
      color: 'amber'
    },
    { 
      id: 'partner', 
      label: '제휴처 알림 (기업 소식/신제품/리콜)', 
      icon: Building2, 
      count: allAlerts.filter(a => a.category === 'partner').length,
      color: 'indigo'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2 border border-slate-700 animate-bounce">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white p-8 md:p-10 shadow-xl border border-indigo-900/50">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-bold tracking-wide">
            <Bell className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
            <span>전국민 안심 공공 권익 브리핑 • 모두의알림 센터</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            국민 모두가 알아야 할<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-sky-200 to-indigo-200">
              긴급 소비자 주의보 & 법령 고지 & 환급 혜택
            </span>
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            공정거래위원회, 한국소비자원, 금융감독원 등 주요 공공 기관의 실시간 긴급 경보부터
            오늘부터 시행되는 법 개정 기준, 몰라서 놓치는 숨은 정부 지원금 및 90% 환급 권리까지
            국민의 소중한 권익과 재산을 선제적으로 지켜드립니다.
          </p>

          {/* Search Bar */}
          <div className="pt-2">
            <div className="relative flex items-center">
              <Search className="absolute left-4.5 h-5 w-5 text-indigo-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="찾으시는 알림 키워드를 검색하세요 (예: 헬스장 위약금, 기프티콘 환불, 해외 직구, 스미싱, 선택약정)..."
                className="w-full pl-12 pr-10 py-3.5 text-xs sm:text-sm bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-slate-900 placeholder:text-slate-400 focus:placeholder:text-slate-400 rounded-2xl border border-indigo-400/30 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 backdrop-blur-md transition-all outline-none font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/20 transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-16 w-64 h-64 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
      </div>

      {/* Category Pills & Quick Filter Controls */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {categories.map(cat => {
              const IconComp = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-600/20 scale-102'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-indigo-600'
                  }`}
                >
                  <IconComp className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{cat.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-black ${
                    isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setOnlyBookmarked(!onlyBookmarked)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                onlyBookmarked 
                  ? 'bg-amber-50 text-amber-800 border-amber-300' 
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Bookmark className={`h-3.5 w-3.5 ${onlyBookmarked ? 'text-amber-600 fill-amber-600' : 'text-slate-400'}`} />
              <span>보관함 ({bookmarkedIds.size})</span>
            </button>
          </div>
        </div>

        {/* Results Counter Bar */}
        <div className="flex items-center justify-between px-1 text-xs text-slate-500 font-medium">
          <div>
            총 <strong className="text-slate-900 font-bold">{filteredAlerts.length}개</strong>의 전국민 알림 고지 중{' '}
            <strong className="text-indigo-600 font-black">
              {filteredAlerts.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1} - {Math.min(currentPage * PAGE_SIZE, filteredAlerts.length)}개
            </strong> 표시
          </div>
          <div className="text-[11px] text-slate-400">
            * 한국소비자원, 공정위, 금감원, 식약처 실시간 공공 데이터 연계
          </div>
        </div>
      </div>

      {/* Paged Alert Cards (4 items per page) */}
      {filteredAlerts.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pagedAlerts.map((alert) => {
              const isBookmarked = bookmarkedIds.has(alert.id);
              return (
                <div
                  key={alert.id}
                  onClick={() => setSelectedAlert(alert)}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 shadow-xs hover:shadow-md transition-all duration-200 p-6 flex flex-col justify-between space-y-4 cursor-pointer group"
                >
                  <div className="space-y-3">
                    {/* Header Tags */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {alert.pinned && (
                          <span className="flex items-center space-x-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200">
                            <Flame className="h-3 w-3 text-red-500" />
                            <span>필수 확인</span>
                          </span>
                        )}
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-md border ${
                          alert.category === 'urgent'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : alert.category === 'law'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : alert.category === 'benefit'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : alert.category === 'partner'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {alert.badgeText}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500">
                          {alert.institution}
                        </span>
                      </div>

                      {/* Bookmark Button */}
                      <button
                        type="button"
                        onClick={(e) => toggleBookmark(alert.id, e)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-amber-500 transition-colors"
                        title={isBookmarked ? '보관 해제' : '보관함에 저장'}
                      >
                        {isBookmarked ? (
                          <BookmarkCheck className="h-4 w-4 text-amber-500 fill-amber-500" />
                        ) : (
                          <Bookmark className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                      {alert.title}
                    </h3>

                    {/* Summary */}
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                      {alert.summary}
                    </p>

                    {/* Key Checklist Highlights (Max 2) */}
                    <div className="space-y-1 pt-1">
                      {alert.keyPoints.slice(0, 2).map((kp, idx) => (
                        <div key={idx} className="flex items-start space-x-1.5 text-xs text-slate-600">
                          <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{kp}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Footer Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3 text-slate-400 text-[11px]">
                      <span className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{alert.effectiveDate}</span>
                      </span>
                      <span>조회 {alert.viewCount.toLocaleString()}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={(e) => handleShare(alert, e)}
                        className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-[11px] font-bold transition-all cursor-pointer"
                        title="가족·지인에게 공유하기"
                      >
                        {copiedId === alert.id ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-600" />
                            <span className="text-emerald-600">복사됨</span>
                          </>
                        ) : (
                          <>
                            <Share2 className="h-3 w-3 text-slate-400" />
                            <span>공유</span>
                          </>
                        )}
                      </button>

                      <span className="text-indigo-600 font-extrabold text-[11px] flex items-center group-hover:translate-x-0.5 transition-transform">
                        <span>자세히 보기</span>
                        <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls (4 items per page) */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4.5 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs text-slate-500 font-medium flex items-center space-x-2">
                <Bell className="h-4 w-4 text-indigo-600 shrink-0" />
                <span>
                  페이지 <strong className="text-indigo-600 font-bold">{currentPage}</strong> / {totalPages} (전체 {filteredAlerts.length}개 알림)
                </span>
              </div>

              <div className="flex items-center space-x-1 sm:space-x-1.5">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs font-semibold text-slate-600 cursor-pointer shadow-2xs"
                >
                  처음
                </button>
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-600 cursor-pointer shadow-2xs"
                  title="이전 페이지"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                  <button
                    key={pNum}
                    type="button"
                    onClick={() => setCurrentPage(pNum)}
                    className={`min-w-8 h-8 px-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      currentPage === pNum
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {pNum}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-600 cursor-pointer shadow-2xs"
                  title="다음 페이지"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs font-semibold text-slate-600 cursor-pointer shadow-2xs"
                >
                  끝
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <Search className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800">일치하는 알림 고지 내역이 없습니다</h3>
            <p className="text-xs text-slate-500">다른 검색어를 입력하시거나 카테고리 필터를 전체로 변경해 보세요.</p>
          </div>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setOnlyBookmarked(false);
            }}
            className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors"
          >
            검색 필터 초기화
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div 
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-scaleUp p-6 sm:p-8 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-md border ${
                    selectedAlert.category === 'urgent'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : selectedAlert.category === 'law'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : selectedAlert.category === 'benefit'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : selectedAlert.category === 'partner'
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {selectedAlert.badgeText}
                  </span>
                  <span className="text-xs font-bold text-indigo-600">
                    {selectedAlert.institution}
                  </span>
                  <span className="text-xs text-slate-400">
                    {selectedAlert.effectiveDate}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                  {selectedAlert.title}
                </h2>
              </div>

              <button
                onClick={() => setSelectedAlert(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-5 text-xs sm:text-sm">
              {/* Summary Banner */}
              <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl space-y-2">
                <div className="flex items-center space-x-1.5 text-indigo-900 font-extrabold text-xs">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span>핵심 고지 요약</span>
                </div>
                <p className="text-slate-700 leading-relaxed font-medium">
                  {selectedAlert.summary}
                </p>
              </div>

              {/* Target & Legal Basis */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-semibold block">고지 대상</span>
                  <span className="text-slate-800 font-bold">{selectedAlert.targetAudience}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-semibold block">근거 법령 및 지침</span>
                  <span className="text-slate-800 font-bold">{selectedAlert.lawBasis || '소비자기본법 및 관련 표준약관'}</span>
                </div>
              </div>

              {/* Key Points */}
              <div className="space-y-2.5">
                <h4 className="font-extrabold text-slate-900 flex items-center space-x-1.5">
                  <ShieldCheck className="h-4 w-4 text-indigo-600" />
                  <span>반드시 알아야 할 핵심 수칙</span>
                </h4>
                <div className="space-y-2">
                  {selectedAlert.keyPoints.map((kp, idx) => (
                    <div key={idx} className="flex items-start space-x-2 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                      <span className="font-black text-indigo-600 shrink-0 text-xs mt-0.5">#{idx + 1}</span>
                      <span className="text-slate-700 text-xs leading-relaxed">{kp}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Guide (3단계 행동 요령) */}
              <div className="space-y-2.5">
                <h4 className="font-extrabold text-slate-900 flex items-center space-x-1.5">
                  <Flame className="h-4 w-4 text-red-500" />
                  <span>피해 예방 및 환불 3단계 대응 요령</span>
                </h4>
                <div className="space-y-2">
                  {selectedAlert.actionGuide.map((ag, idx) => (
                    <div key={idx} className="p-3 bg-indigo-50/40 rounded-xl border border-indigo-100 text-xs text-indigo-950 font-medium leading-relaxed">
                      {ag}
                    </div>
                  ))}
                </div>
              </div>

              {/* Emergency Contact */}
              {selectedAlert.contactNumber && (
                <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-amber-600" />
                    <div>
                      <span className="font-bold text-amber-900">소관 기관 직통 신고/상담: </span>
                      <span className="font-black text-amber-700 ml-1">{selectedAlert.contactNumber}</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-amber-800 font-semibold">
                    (평일 09:00 ~ 18:00)
                  </span>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleShare(selectedAlert)}
                  className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  <Share2 className="h-3.5 w-3.5 text-slate-500" />
                  <span>가족·지인에게 공유</span>
                </button>
                <button
                  type="button"
                  onClick={() => toggleBookmark(selectedAlert.id)}
                  className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                  title="보관하기"
                >
                  {bookmarkedIds.has(selectedAlert.id) ? (
                    <BookmarkCheck className="h-4 w-4 text-amber-500 fill-amber-500" />
                  ) : (
                    <Bookmark className="h-4 w-4 text-slate-400" />
                  )}
                </button>
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setSelectedAlert(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold transition-all cursor-pointer"
                >
                  닫기
                </button>
                <button
                  type="button"
                  onClick={() => handleResolveDirectly(selectedAlert)}
                  className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md transition-all cursor-pointer"
                >
                  <span>
                    {selectedAlert.category === 'partner' ? '제휴처 1:1 상담 및 혜택 신청하기' : '이 건으로 1:1 중재 접수하기'}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
