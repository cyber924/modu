import React, { useState, useMemo, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  query, 
  doc, 
  setDoc, 
  updateDoc, 
  increment, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { HubInquiryDoc } from '../types';
import { 
  Search, 
  Filter, 
  Bookmark, 
  BookmarkCheck, 
  Copy, 
  Check, 
  ThumbsUp, 
  ArrowRight, 
  Sparkles, 
  HelpCircle, 
  ExternalLink, 
  X, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ShieldCheck, 
  ChevronLeft,
  ChevronRight, 
  Share2, 
  Printer, 
  Tag, 
  Zap, 
  Send,
  Layers,
  ShoppingBag,
  Plane,
  Utensils,
  Settings,
  Handshake,
  CheckCircle,
  Scale,
  Building2,
  Heart,
  CreditCard,
  Phone,
  BookOpen,
  Award,
  Flame,
  Building,
  Bell
} from 'lucide-react';
import { 
  HUB_CATEGORIES, 
  HUB_INQUIRIES, 
  HubCategory, 
  HubInquiryItem 
} from '../data/inquiryHubData';
import { InquiryParentCategory } from '../types';

export interface PartnerBrand {
  id: string;
  name: string;
  logoEmoji: string;
  intro: string;
  phone: string;
  chatUrl: string;
  avgResponse: string;
  color: string;
  popularInquiry: string;
  category: string;
}

export interface AIConsumerInsight {
  id: string;
  title: string;
  emoji: string;
  summary: string;
  lawBasis: string;
  fullTip: string;
  badge: string;
}

const PARTNERS_LIST: PartnerBrand[] = [
  {
    id: 'pt_bbq',
    name: 'BBQ 치킨',
    logoEmoji: '🍗',
    intro: '국내 대표 올리브유 황금올리브 치킨 브랜드. 가맹 조리 규정 준수 및 주문 취소 신속 조율CS 운영.',
    phone: '080-3436-000',
    chatUrl: 'https://www.bbq.co.kr',
    avgResponse: '2분 내 즉시 연결',
    color: 'amber',
    popularInquiry: '주문 대기 취소 및 환불 기준',
    category: '외식/다이닝'
  },
  {
    id: 'pt_domino',
    name: '도미노피자',
    logoEmoji: '🍕',
    intro: '세계 배달 피자 리더. 모바일 오주문 환불 규정 및 자체 라이더 배달 지연 보상 서비스 제공.',
    phone: '080-860-3082',
    chatUrl: 'https://web.dominos.co.kr',
    avgResponse: '3분 내 상담 연결',
    color: 'blue',
    popularInquiry: '배달 지연 보상 쿠폰 문의',
    category: '배달/피자'
  },
  {
    id: 'pt_starbucks',
    name: '스타벅스 코리아',
    logoEmoji: '☕',
    intro: '프리미엄 커피 업계 리더. 사이렌 오더 오발송 및 드라이브스루 차량 결제 중도 취소 표준 규정 운영.',
    phone: '1522-3232',
    chatUrl: 'https://www.starbucks.co.kr',
    avgResponse: '1분 내 즉각 통화',
    color: 'emerald',
    popularInquiry: '사이렌 오더 오주문 즉시 환불',
    category: '카페/디저트'
  },
  {
    id: 'pt_yeopdduk',
    name: '동대문 엽기떡볶이',
    logoEmoji: '🌶️',
    intro: '대한민국 대표 매운 떡볶이. 자체 앱 멤버십 쿠폰 결제 누락 대처 및 이물질 대응 신속 해결.',
    phone: '1661-8514',
    chatUrl: 'https://www.yupdduk.com',
    avgResponse: '2분 내 신속 연결',
    color: 'red',
    popularInquiry: '기본 사리 누락 환불 정책',
    category: '외식/식당'
  },
  {
    id: 'pt_baemin',
    name: '배달의민족',
    logoEmoji: '🛵',
    intro: '1등 배달앱 서비스. 주문 후 이물질/위생 분쟁 시 안심케어 보상제 및 배달 파손 보장 처리 제공.',
    phone: '1600-0987',
    chatUrl: 'https://baemin.com',
    avgResponse: '상담원 실시간 대기',
    color: 'cyan',
    popularInquiry: '배달 파손 및 위생 규정 신고',
    category: '배달 플랫폼'
  }
];

const AI_INSIGHTS_LIST: AIConsumerInsight[] = [
  {
    id: 'is_hair',
    title: '배달음식 이물질 발견 시 100% 전액 환불 룰',
    emoji: '🪰',
    summary: '사진 촬영 후 즉시 1399(식약처) 신고 연동 시, 점주가 거부하더라도 배달앱에서 전액 환불을 보증합니다.',
    lawBasis: '식품위생법 제4조 및 공정위 고시 소비자분쟁해결기준',
    badge: 'F&B 위생',
    fullTip: '1. [중요] 발견 즉시 음식의 전체 샷과 이물질 확대 사진을 선명하게 다각도로 촬영해 두세요.\n2. 음식을 절대 다 먹거나 버리지 말고 지퍼백 또는 용기에 밀봉하여 증거를 원형 그대로 보존하세요.\n3. 배달앱 고객센터에 사진을 전달하고 식약처 불량식품 신고전화(1399) 접수 의사를 전달하세요. 법령에 의거하여 업주는 영업 정지 리스크 방지를 위해 즉각 환불을 이행할 수밖에 없습니다.'
  },
  {
    id: 'is_sns_group',
    title: '인스타/블로그 공구 "단순 변심 반품 불가" 효력',
    emoji: '🛍️',
    summary: '구매 창에서 "환불 불가 동의"란에 미리 동의했더라도, 전자상거래법 제17조에 따라 7일 내 무조건 환불 가능합니다.',
    lawBasis: '전자상거래법 제17조 (청약철회) 및 제35조 (강행규정)',
    badge: 'SNS 커머스',
    fullTip: '1. 전자상거래법 제17조 제1항에 의거, 소비자는 배송일로부터 7일 이내에 조건 없는 청약 철회가 가능합니다.\n2. 판매자가 "사전 환불 불가 고지 및 소비자동의서 징구"를 근거로 대더라도, 동법 제35조(강행규정)에 의해 소비자에게 불리한 약정은 원천적으로 무효가 됩니다.\n3. 판매자가 고의로 채팅방을 퇴장하거나 거절할 경우 당사 1:1 센터를 통해 내용증명 및 소관 구청 신고 가이드를 즉시 다운로드하세요.'
  },
  {
    id: 'is_streaming',
    title: 'OTT/유튜브 프리미엄 해지 시 일할 정산 룰',
    emoji: '📺',
    summary: '중도 해지 신청 시 "남은 한 달은 무조건 시청해야 한다"는 약관은 법적 무효입니다. 남은 일수만큼 일할 환불받으세요.',
    lawBasis: '콘텐츠산업진흥법 제28조 및 콘텐츠이용자보호지침',
    badge: '디지털 구독',
    fullTip: '1. 넷플릭스, 유튜브 프리미엄, 티빙 등 대부분의 유료 구독 서비스는 "중도 즉시 해지" 및 이에 따른 남은 잔여일수 일할 환불 의무가 콘텐츠보호 규정에 명시되어 있습니다.\n2. "일반 예약 해지(다음 달 자동 정지)"와 "중도 환불 해지"를 구분하여 고객센터에 명확히 요구하셔야 합니다.\n3. 일부 해외 본사가 이를 거부하는 약관을 유지할 경우, 국내 대행 결제 카드사 이의제기(Chargeback) 서비스를 연동하여 즉시 해결할 수 있습니다.'
  },
  {
    id: 'is_gym',
    title: '헬스장/필라테스 중도 해지 위약금 10% 한도 규정',
    emoji: '🏋️',
    summary: '"개인 사정으로 인한 해지 시 절대 환불 불가" 각서에 서명했더라도 법적 효력 제로. 실 결제금액 기준 10% 위약금만 공제 가능합니다.',
    lawBasis: '방문판매법 제31조 (계약해지) 및 체육시설표준약관',
    badge: '헬스/피트니스',
    fullTip: '1. 방문판매법 제31조는 "계속거래 소비자는 언제든지 계약을 중도에 해지할 수 있다"고 규정하는 절대 강행 규정입니다.\n2. 중도 해지 위약금은 공정거래위원회 고시 기준 "총 실결제금액의 10%"로 강제 제한되며, 계약서의 "환불 절대 불가" 문구는 모두 무효입니다.\n3. 업주가 정상가(예: 월 10만원) 기준 위약금 소급을 정하더라도 실제 결제한 할인금액(예: 월 3만원) 기준으로 일할 공제액을 정하는 것이 합법적입니다.'
  }
];

interface InquiryHubProps {
  onNavigateToInquiry: (prefill: {
    parentCategory: InquiryParentCategory;
    subCategory: string;
    title: string;
    content: string;
  }) => void;
  onGoToCustomerPortal: () => void;
  onNavigateToAlerts?: () => void;
  onNavigateToHelp?: () => void;
}

export const InquiryHub: React.FC<InquiryHubProps> = ({ 
  onNavigateToInquiry, 
  onGoToCustomerPortal,
  onNavigateToAlerts,
  onNavigateToHelp
}) => {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<HubCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'rate' | 'newest'>('popular');
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);

  // Local Interactive States
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [helpfulCounts, setHelpfulCounts] = useState<Record<string, number>>({});
  const [userVotedIds, setUserVotedIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Partners & AI Insights detail states
  const [selectedPartner, setSelectedPartner] = useState<PartnerBrand | null>(null);
  const [selectedInsight, setSelectedInsight] = useState<AIConsumerInsight | null>(null);

  // Pagination states (4 items per page as requested)
  const [partnerPage, setPartnerPage] = useState(1);
  const PARTNER_PAGE_SIZE = 4;

  const [insightPage, setInsightPage] = useState(1);
  const INSIGHT_PAGE_SIZE = 4;

  const [guidePage, setGuidePage] = useState(1);
  const GUIDE_PAGE_SIZE = 4;

  // Real-time Firestore Hub Inquiries state
  const [dbHubInquiries, setDbHubInquiries] = useState<HubInquiryDoc[]>([]);
  const [dbPartners, setDbPartners] = useState<PartnerBrand[]>([]);
  const [dbInsights, setDbInsights] = useState<AIConsumerInsight[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'hub_inquiries'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: HubInquiryDoc[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      setDbHubInquiries(list);
    }, (err) => {
      console.warn("Firestore hub items listener:", err);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'partners'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: PartnerBrand[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      setDbPartners(list);
    }, (err) => {
      console.warn("Firestore partners listener:", err);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'consumer_insights'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: AIConsumerInsight[] = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      setDbInsights(list);
    }, (err) => {
      console.warn("Firestore insights listener:", err);
    });
    return () => unsubscribe();
  }, []);

  // Merge static PARTNERS_LIST with DB partners, deduplicating by name (trimmed, case-insensitive)
  const allPartners = useMemo(() => {
    const map = new Map<string, PartnerBrand>();
    PARTNERS_LIST.forEach(p => map.set(p.name.trim().toLowerCase(), p));
    dbPartners.forEach(p => map.set(p.name.trim().toLowerCase(), p));
    return Array.from(map.values());
  }, [dbPartners]);

  // Merge static AI_INSIGHTS_LIST with DB insights, deduplicating by title (trimmed, case-insensitive)
  const allInsights = useMemo(() => {
    const map = new Map<string, AIConsumerInsight>();
    AI_INSIGHTS_LIST.forEach(i => map.set(i.title.trim().toLowerCase(), i));
    dbInsights.forEach(i => map.set(i.title.trim().toLowerCase(), i));
    return Array.from(map.values());
  }, [dbInsights]);

  // Combined Master 50 + Firestore Inquiries (Deduplicated & dynamically merged)
  const allHubItems = useMemo(() => {
    const map = new Map<string, HubInquiryItem & { status?: string; isAIGenerated?: boolean }>();
    
    // 1. Initial 50
    HUB_INQUIRIES.forEach(item => {
      map.set(item.id, { ...item, status: 'published', isAIGenerated: false });
    });

    // 2. DB items (filter out drafts so public only sees 'published')
    dbHubInquiries.forEach(item => {
      if (item.status === 'published' || !item.status) {
        map.set(item.id, {
          id: item.id,
          category: item.category,
          categoryLabel: item.categoryLabel,
          iconName: item.iconName,
          subCategory: item.subCategory,
          rankBadge: item.rankBadge,
          resolutionRate: item.resolutionRate || 99.0,
          avgResolutionTime: item.avgResolutionTime || '즉시 해결',
          title: item.title,
          questionScenario: item.questionScenario,
          officialAnswer: item.officialAnswer,
          tags: item.tags || [],
          requiredDocs: item.requiredDocs || [],
          directInquiryPrefill: item.directInquiryPrefill,
          status: item.status || 'published',
          isAIGenerated: item.isAIGenerated ?? true,
          helpfulCount: item.helpfulCount,
          viewCount: item.viewCount
        } as any);
      }
    });

    return Array.from(map.values());
  }, [dbHubInquiries]);

  // Modal State for full-screen inspection
  const [selectedItemForModal, setSelectedItemForModal] = useState<HubInquiryItem | null>(null);

  // Quick Tags
  const POPULAR_TAGS = [
    '#청약철회7일',
    '#보증금미반환',
    '#헬스장환불',
    '#층간소음',
    '#중고사기신고',
    '#스팸신고118',
    '#파손보상',
    '#노쇼위약금',
    '#알레르기교차오염방지',
    '#전자세금계산서',
    '#파트너입점심사'
  ];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const toggleBookmark = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setBookmarkedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        showToast('북마크에서 제거되었습니다.');
      } else {
        next.add(id);
        showToast('⭐ 북마크 보관함에 저장되었습니다.');
      }
      return next;
    });
  };

  const handleHelpful = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (userVotedIds.has(id)) {
      showToast('이미 "도움이 되었어요"를 투표하셨습니다.');
      return;
    }
    setUserVotedIds(prev => new Set(prev).add(id));
    setHelpfulCounts(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    showToast('👍 피드백 감사합니다! 문제 해결에 큰 도움이 됩니다.');

    try {
      const docRef = doc(db, 'hub_inquiries', id);
      await updateDoc(docRef, {
        helpfulCount: increment(1)
      });
    } catch {
      // Ignored if document is not yet synced in Firestore
    }
  };

  const handleCopyAnswer = (item: HubInquiryItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const formattedText = `[문의 유형: ${item.title}]\n\n[공식 답변 요약]\n${item.officialAnswer.summary}\n\n[단계별 해결 가이드]\n${item.officialAnswer.steps.map(s => `${s.stepNumber}. ${s.title}: ${s.desc}`).join('\n')}\n\n[주의사항 및 체크리스트]\n${item.officialAnswer.checklist.map(c => `- ${c}`).join('\n')}\n\n[핵심 꿀팁]\n${item.officialAnswer.proTip}\n\n(출처: 모두의문의 통합 문의 해결 가이드)`;
    
    navigator.clipboard.writeText(formattedText).then(() => {
      setCopiedId(item.id);
      showToast('📋 완벽 해결 가이드 전문이 클립보드에 복사되었습니다.');
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  const handleApplyToInquiry = (item: HubInquiryItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onNavigateToInquiry({
      parentCategory: item.directInquiryPrefill.parentCategory,
      subCategory: item.directInquiryPrefill.subCategory,
      title: item.directInquiryPrefill.title,
      content: item.directInquiryPrefill.contentTemplate
    });
  };

  // Filtered & Sorted Inquiries
  const filteredInquiries = useMemo(() => {
    let list = allHubItems.filter(item => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      // Bookmark filter
      if (onlyBookmarked && !bookmarkedIds.has(item.id)) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = item.title.toLowerCase().includes(q);
        const inScenario = item.questionScenario.toLowerCase().includes(q);
        const inSummary = item.officialAnswer.summary.toLowerCase().includes(q);
        const inCategory = item.categoryLabel.toLowerCase().includes(q);
        const inSub = item.subCategory.toLowerCase().includes(q);
        const inTags = item.tags.some(t => t.toLowerCase().includes(q));
        const inSteps = item.officialAnswer.steps.some(s => s.title.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q));
        if (!inTitle && !inScenario && !inSummary && !inCategory && !inSub && !inTags && !inSteps) {
          return false;
        }
      }
      return true;
    });

    // Sort
    list = [...list].sort((a, b) => {
      if (sortBy === 'rate') {
        return b.resolutionRate - a.resolutionRate;
      }
      if (sortBy === 'newest') {
        return b.id.localeCompare(a.id);
      }
      // default: popular (order in array)
      return 0;
    });

    return list;
  }, [allHubItems, selectedCategory, searchQuery, sortBy, onlyBookmarked, bookmarkedIds]);

  // 1. Partner Directory Pagination (4 items per page)
  const totalPartnerPages = Math.max(1, Math.ceil(allPartners.length / PARTNER_PAGE_SIZE));
  const pagedPartners = useMemo(() => {
    const start = (partnerPage - 1) * PARTNER_PAGE_SIZE;
    return allPartners.slice(start, start + PARTNER_PAGE_SIZE);
  }, [allPartners, partnerPage]);

  useEffect(() => {
    if (partnerPage > totalPartnerPages) {
      setPartnerPage(totalPartnerPages);
    }
  }, [totalPartnerPages, partnerPage]);

  // 2. Trend Knowledge Pagination (4 items per page)
  const totalInsightPages = Math.max(1, Math.ceil(allInsights.length / INSIGHT_PAGE_SIZE));
  const pagedInsights = useMemo(() => {
    const start = (insightPage - 1) * INSIGHT_PAGE_SIZE;
    return allInsights.slice(start, start + INSIGHT_PAGE_SIZE);
  }, [allInsights, insightPage]);

  useEffect(() => {
    if (insightPage > totalInsightPages) {
      setInsightPage(totalInsightPages);
    }
  }, [totalInsightPages, insightPage]);

  // 3. Master Guides Pagination (4 items per page)
  const totalGuidePages = Math.max(1, Math.ceil(filteredInquiries.length / GUIDE_PAGE_SIZE));
  const pagedInquiries = useMemo(() => {
    const start = (guidePage - 1) * GUIDE_PAGE_SIZE;
    return filteredInquiries.slice(start, start + GUIDE_PAGE_SIZE);
  }, [filteredInquiries, guidePage]);

  // Reset master guide page to 1 when search or category filter changes
  useEffect(() => {
    setGuidePage(1);
  }, [selectedCategory, searchQuery, onlyBookmarked, sortBy]);

  useEffect(() => {
    if (guidePage > totalGuidePages) {
      setGuidePage(totalGuidePages);
    }
  }, [totalGuidePages, guidePage]);

  // Helper for generating clean page numbers with ellipsis
  const getGuidePageNumbers = (current: number, total: number): (number | '...')[] => {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const pages: (number | '...')[] = [];
    pages.push(1);
    if (current > 3) {
      pages.push('...');
    }
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    if (current < total - 2) {
      pages.push('...');
    }
    pages.push(total);
    return pages;
  };

  // Unanswered Query Telemetry: When visitors search but find 0 results, log it to Firestore for AI expansion!
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) return;

    const timer = setTimeout(async () => {
      if (filteredInquiries.length === 0) {
        try {
          const querySlug = trimmed.toLowerCase().replace(/[^a-z0-9가-힣]/g, '_').slice(0, 30);
          const logId = `query_${querySlug}`;
          const logRef = doc(db, 'hub_unanswered_logs', logId);
          await setDoc(logRef, {
            id: logId,
            query: trimmed,
            count: increment(1),
            lastSearchedAt: serverTimestamp(),
            resolved: false
          }, { merge: true });
        } catch (err) {
          console.warn("Unanswered log warning:", err);
        }
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [searchQuery, filteredInquiries.length]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = { all: allHubItems.length };
    HUB_CATEGORIES.forEach(c => {
      map[c.id] = allHubItems.filter(item => item.category === c.id).length;
    });
    return map;
  }, [allHubItems]);

  const getCategoryIcon = (cat: HubCategory) => {
    switch (cat) {
      case 'shopping': return <ShoppingBag className="h-4 w-4 text-pink-500" />;
      case 'leisure': return <Plane className="h-4 w-4 text-blue-500" />;
      case 'dining': return <Utensils className="h-4 w-4 text-amber-500" />;
      case 'general': return <Settings className="h-4 w-4 text-slate-500" />;
      case 'legal': return <Scale className="h-4 w-4 text-purple-600" />;
      case 'other': return <Handshake className="h-4 w-4 text-emerald-500" />;
      default: return <Layers className="h-4 w-4 text-indigo-500" />;
    }
  };

  const getCategoryBadgeClass = (cat: HubCategory) => {
    switch (cat) {
      case 'shopping': return 'bg-pink-50 text-pink-700 border-pink-200';
      case 'leisure': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'dining': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'general': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'legal': return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'other': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 animate-fadeIn">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2 border border-slate-700 animate-bounce">
          <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* 🚨 전국민 긴급 공공 알림 신규 브리핑 배너 (모두의알림 바로가기) */}
      {onNavigateToAlerts && (
        <div 
          onClick={onNavigateToAlerts}
          className="bg-gradient-to-r from-red-500/10 via-amber-500/10 to-indigo-500/10 border border-red-200/80 hover:border-red-300 p-3.5 sm:p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer shadow-2xs hover:shadow-xs transition-all group"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-red-600 text-white shadow-xs group-hover:scale-105 transition-transform">
              <Bell className="h-4 w-4 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-red-600 text-white">
                  긴급 국민 고지
                </span>
                <span className="text-xs font-black text-slate-900">
                  현대차 ICCU 리콜 • 갤럭시 Z 폴드8 사전예약 • 헬스장 10% 위약금 상한제
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                놓치면 손해 보는 법 개정과 제휴 기업(현대차·삼성전자·쿠팡) 리콜 및 알짜 혜택을 <strong className="text-indigo-600 underline underline-offset-2">모두의알림</strong>에서 실시간 확인하세요.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1 text-xs font-black text-red-600 group-hover:translate-x-1 transition-transform self-end sm:self-center">
            <span>모두의알림 바로보기</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>
      )}

      {/* 🛒 모두의도움 초특가 쇼핑 & 보험 & 지역축제 추천 배너 */}
      {onNavigateToHelp && (
        <div 
          onClick={onNavigateToHelp}
          className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-200/80 hover:border-emerald-300 p-3.5 sm:p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer shadow-2xs hover:shadow-xs transition-all group"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs group-hover:scale-105 transition-transform">
              <ShoppingBag className="h-4 w-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-600 text-white">
                  신규 론칭 • 모두의도움
                </span>
                <span className="text-xs font-black text-slate-900">
                  맥심 커피믹스·CJ 햇반 실시간 최저가 • 4세대 실손보험 비교 • 순천만 갈대축제
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                말그대로 꼭 필요한 것만 사라고 추천해 드립니다! 쇼핑몰 최저가부터 다이렉트 안심보험, 지자체 축제 산지직송까지 <strong className="text-emerald-700 underline underline-offset-2">모두의도움</strong>에서 지금 만나보세요.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1 text-xs font-black text-emerald-700 group-hover:translate-x-1 transition-transform self-end sm:self-center">
            <span>모두의도움 쇼핑하기</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white p-8 md:p-12 shadow-xl border border-indigo-800/40">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-bold tracking-wide">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>핵심 공식 서비스 • 모두의문의 공식 해결 지식허브</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            문의하기 전에 확인하는<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-sky-200 to-amber-200">
              최다 빈도 질문과 완벽한 정답 가이드
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            쇼핑, 여가, 외식, 일반, 법률/생활, 기타/B2B 제휴 등 각 분야별로 가장 빈번히 접수되는 핵심 문제 상황과 공식 전문가의 표준 해결 가이드를 제공합니다. 대기시간 없이 1분 만에 셀프 해결하세요.
          </p>

          {/* Search Input Box */}
          <div className="pt-3">
            <div className="relative flex items-center">
              <Search className="absolute left-4.5 h-5 w-5 text-indigo-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="어떤 문제가 발생하셨나요? 키워드를 검색해 보세요 (예: 배송 파손, 예약 취소, 노쇼, 알레르기, 세금계산서, 입점)..."
                className="w-full pl-12 pr-10 py-4 text-xs sm:text-sm bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-slate-900 placeholder:text-slate-400 focus:placeholder:text-slate-400 rounded-2xl border border-indigo-400/30 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 backdrop-blur-md transition-all outline-none font-medium"
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

            {/* Popular Tags */}
            <div className="flex flex-wrap items-center gap-1.5 pt-3 text-xs text-slate-300">
              <span className="text-indigo-300 font-semibold flex items-center space-x-1 mr-1">
                <Tag className="h-3 w-3" />
                <span>추천 키워드:</span>
              </span>
              {POPULAR_TAGS.map((tag, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSearchQuery(tag.replace('#', ''))}
                  className="px-2.5 py-1 rounded-lg bg-indigo-800/40 hover:bg-indigo-700/60 border border-indigo-700/50 text-[11px] font-medium text-indigo-100 hover:text-white transition-all cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative background gradients */}
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
        <div className="absolute right-20 -bottom-20 w-80 h-80 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center space-x-3.5">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">총 솔루션 데이터</span>
            <span className="text-base sm:text-lg font-black text-slate-900">{allHubItems.length}개 마스터 가이드</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center space-x-3.5">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">평균 즉시 해결률</span>
            <span className="text-base sm:text-lg font-black text-emerald-600">98.7% 검증</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center space-x-3.5">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">고객 대기시간 단축</span>
            <span className="text-base sm:text-lg font-black text-blue-600">평균 1분 내 해결</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center space-x-3.5">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block">공식 보증 기준</span>
            <span className="text-base sm:text-lg font-black text-amber-700">본사 & 제휴처 공인</span>
          </div>
        </div>
      </div>

      {/* 🏢 모두의 공식 제휴처 & 모두의 트렌드 지식 브리핑 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: 제휴처 (4개 단위 페이지네이션) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-black tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-md">
                ALLIANCE DIRECTORY
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-1.5">
                <Building className="h-5 w-5 text-indigo-600" />
                <span>모두의 안심 제휴처 디렉토리</span>
              </h2>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2.5 py-1 rounded-full shadow-2xs">
                총 {allPartners.length}개 제휴사
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pagedPartners.map((partner) => (
              <div 
                key={partner.id}
                onClick={() => setSelectedPartner(partner)}
                className="bg-white border border-slate-100 p-4 rounded-2xl shadow-xs hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group flex flex-col justify-between space-y-3.5"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{partner.logoEmoji}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-50 text-slate-500 border border-slate-100">
                      {partner.category}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors text-sm">
                      {partner.name}
                    </h3>
                    <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">
                      {partner.intro}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center space-x-1 font-semibold text-slate-700">
                    <Phone className="h-3 w-3 text-indigo-500" />
                    <span>{partner.phone}</span>
                  </div>
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                    {partner.avgResponse}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* 제휴처 4개 단위 페이지네이션 바 */}
          {totalPartnerPages > 1 && (
            <div className="flex items-center justify-between pt-2 px-1 text-xs">
              <span className="text-slate-500 text-[11px] font-semibold">
                페이지 <strong className="text-indigo-600 font-bold">{partnerPage}</strong> / {totalPartnerPages} <span className="text-slate-400 font-normal">(전체 {allPartners.length}개)</span>
              </span>
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  disabled={partnerPage === 1}
                  onClick={() => setPartnerPage(p => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-600 cursor-pointer shadow-2xs"
                  title="이전 제휴처 페이지"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                {Array.from({ length: totalPartnerPages }, (_, i) => i + 1).map(pNum => (
                  <button
                    key={pNum}
                    type="button"
                    onClick={() => setPartnerPage(pNum)}
                    className={`min-w-6 h-6 px-1.5 rounded-md text-[11px] font-extrabold transition-all cursor-pointer ${
                      partnerPage === pNum
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {pNum}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={partnerPage === totalPartnerPages}
                  onClick={() => setPartnerPage(p => Math.min(totalPartnerPages, p + 1))}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-600 cursor-pointer shadow-2xs"
                  title="다음 제휴처 페이지"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: 모두의 트렌드 지식 (4개 단위 페이지네이션) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-black tracking-widest text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-0.5 rounded-md">
                TREND KNOWLEDGE
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-1.5">
                <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
                <span>모두의 트렌드 지식</span>
              </h2>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black text-amber-800 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-full shadow-2xs">
                총 {allInsights.length}개 지식
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {pagedInsights.map((insight) => (
              <div 
                key={insight.id}
                onClick={() => setSelectedInsight(insight)}
                className="bg-white border border-slate-100 p-4 rounded-2xl shadow-xs hover:shadow-md hover:border-amber-200 transition-all cursor-pointer group flex items-start space-x-3.5"
              >
                <div className="p-2.5 bg-amber-50 rounded-xl text-xl shrink-0 group-hover:scale-105 transition-transform">
                  {insight.emoji}
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50/70 px-2 py-0.5 rounded-md">
                      {insight.badge}
                    </span>
                    <span className="text-[9px] font-medium text-slate-400 font-mono">
                      {insight.lawBasis.split(' ')[0]}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm group-hover:text-amber-800 transition-colors line-clamp-1">
                    {insight.title}
                  </h3>
                  <p className="text-slate-500 text-[11px] line-clamp-1 leading-relaxed">
                    {insight.summary}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* 모두의 트렌드 지식 4개 단위 페이지네이션 바 */}
          {totalInsightPages > 1 && (
            <div className="flex items-center justify-between pt-2 px-1 text-xs">
              <span className="text-slate-500 text-[11px] font-semibold">
                페이지 <strong className="text-amber-700 font-bold">{insightPage}</strong> / {totalInsightPages} <span className="text-slate-400 font-normal">(전체 {allInsights.length}개)</span>
              </span>
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  disabled={insightPage === 1}
                  onClick={() => setInsightPage(p => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-600 cursor-pointer shadow-2xs"
                  title="이전 지식 페이지"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                {Array.from({ length: totalInsightPages }, (_, i) => i + 1).map(pNum => (
                  <button
                    key={pNum}
                    type="button"
                    onClick={() => setInsightPage(pNum)}
                    className={`min-w-6 h-6 px-1.5 rounded-md text-[11px] font-extrabold transition-all cursor-pointer ${
                      insightPage === pNum
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {pNum}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={insightPage === totalInsightPages}
                  onClick={() => setInsightPage(p => Math.min(totalInsightPages, p + 1))}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-600 cursor-pointer shadow-2xs"
                  title="다음 지식 페이지"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>



      {/* Category Tabs & Filter Toolbar */}
      <div className="space-y-4">
        {/* Category Navigation Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-thin">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer border ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200 hover:border-slate-300'
            }`}
          >
            <span>전체 보기</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
              selectedCategory === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {categoryCounts.all}
            </span>
          </button>

          {HUB_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200 hover:border-slate-300'
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {categoryCounts[cat.id]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sub toolbar: Bookmarks & Sorting */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-b border-slate-200 pb-3">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setOnlyBookmarked(prev => !prev)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                onlyBookmarked 
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {onlyBookmarked ? (
                <BookmarkCheck className="h-3.5 w-3.5 text-amber-600" />
              ) : (
                <Bookmark className="h-3.5 w-3.5 text-slate-400" />
              )}
              <span>북마크한 질문 ({bookmarkedIds.size})</span>
            </button>

            <span className="text-xs text-slate-500 font-medium">
              총 <strong className="text-slate-900 font-bold">{filteredInquiries.length}개</strong>의 마스터 가이드 <span className="text-slate-400 font-normal">(전체 {allHubItems.length}개 중)</span>
            </span>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-medium">정렬:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="popular">문의 빈도순 (인기순)</option>
              <option value="rate">해결률 높은 순</option>
              <option value="newest">최신 등록순</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cards Grid: Clean, Modern 2-Column Responsive Bento Cards (4개 단위 페이지네이션) */}
      {filteredInquiries.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pagedInquiries.map((item) => {
              const isBookmarked = bookmarkedIds.has(item.id);
            const isHelpful = userVotedIds.has(item.id);
            const helpfulCount = (helpfulCounts[item.id] || 0) + (Math.floor(item.resolutionRate * 3) % 25 + 12);

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
              >
                {/* Card Header */}
                <div className="p-6 space-y-4">
                  {/* Category & Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center space-x-1.5 ${getCategoryBadgeClass(item.category)}`}>
                        {getCategoryIcon(item.category)}
                        <span>{item.categoryLabel}</span>
                        <span className="opacity-50">/</span>
                        <span>{item.subCategory}</span>
                      </span>

                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-extrabold">
                        {item.rankBadge}
                      </span>

                      {item.isAIGenerated && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-black">
                          <Sparkles className="h-3 w-3 text-amber-500" />
                          <span>AI 솔루션</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={(e) => toggleBookmark(item.id, e)}
                        className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                          isBookmarked 
                            ? 'text-amber-500 hover:bg-amber-50' 
                            : 'text-slate-300 hover:text-slate-600 hover:bg-slate-100'
                        }`}
                        title={isBookmarked ? '북마크 해제' : '북마크 저장'}
                      >
                        {isBookmarked ? (
                          <BookmarkCheck className="h-4 w-4" />
                        ) : (
                          <Bookmark className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                    {item.title}
                  </h3>

                  {/* Question Scenario Box */}
                  <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100 space-y-1">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-500">
                      <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
                      <span>고객 문의 상황 (Case Scenario)</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed italic">
                      "{item.questionScenario}"
                    </p>
                  </div>

                  {/* Official Answer Box */}
                  <div className="p-4 bg-gradient-to-br from-indigo-50/50 via-slate-50 to-blue-50/30 rounded-xl border border-indigo-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                        <span className="text-xs font-black text-indigo-950">공식 완벽 해결 가이드</span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-[11px] text-emerald-700 font-extrabold bg-emerald-100/70 px-2 py-0.5 rounded-md">
                        <span>해결률 {item.resolutionRate}%</span>
                      </div>
                    </div>

                    {/* Summary */}
                    <p className="text-xs text-slate-800 font-bold leading-relaxed bg-white/80 p-2.5 rounded-lg border border-indigo-100/60 shadow-2xs">
                      {item.officialAnswer.summary}
                    </p>

                    {/* 3 Steps */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-extrabold text-slate-600 block">단계별 실천 프로세스:</span>
                      <div className="space-y-1.5">
                        {item.officialAnswer.steps.map((step) => (
                          <div key={step.stepNumber} className="flex items-start space-x-2 text-xs">
                            <span className="px-1.5 py-0.5 rounded bg-indigo-600 text-white text-[10px] font-black shrink-0 mt-0.5">
                              Step {step.stepNumber}
                            </span>
                            <div className="leading-snug">
                              <span className="font-bold text-slate-900">{step.title}</span>
                              <span className="text-slate-400 mx-1">-</span>
                              <span className="text-slate-600">{step.desc}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Checkpoint / Pro Tip */}
                    <div className="p-2.5 bg-amber-50/70 rounded-lg border border-amber-200/60 text-[11px] text-amber-950 flex items-start space-x-2">
                      <Sparkles className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="font-bold text-amber-900 block">전문가 꿀팁 (Pro-Tip):</span>
                        <p className="text-amber-800 leading-relaxed font-medium">{item.officialAnswer.proTip}</p>
                      </div>
                    </div>

                    {/* Required documents if any */}
                    {item.requiredDocs && item.requiredDocs.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] text-slate-500">
                        <span className="font-bold text-slate-700">필요 준비 서류:</span>
                        {item.requiredDocs.map((doc, dIdx) => (
                          <span key={dIdx} className="bg-white px-2 py-0.5 rounded border border-slate-200 font-medium text-slate-700">
                            {doc}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {item.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md font-mono">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="px-6 py-3.5 bg-slate-50/80 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-1">
                    {/* Copy Button */}
                    <button
                      type="button"
                      onClick={(e) => handleCopyAnswer(item, e)}
                      className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition-all cursor-pointer shadow-2xs"
                      title="답변 전체 클립보드 복사"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">복사됨</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5 text-slate-500" />
                          <span>답변 복사</span>
                        </>
                      )}
                    </button>

                    {/* Helpful Vote */}
                    <button
                      type="button"
                      onClick={(e) => handleHelpful(item.id, e)}
                      className={`inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                        isHelpful
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                      title="이 가이드가 도움 되었어요"
                    >
                      <ThumbsUp className={`h-3.5 w-3.5 ${isHelpful ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span>도움됨 {helpfulCount}</span>
                    </button>
                  </div>

                  {/* Direct Bridge Button: 1:1 추가 문의 작성 */}
                  <button
                    type="button"
                    onClick={(e) => handleApplyToInquiry(item, e)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer group-hover:bg-indigo-700"
                    title="이 카테고리와 양식으로 1:1 고객 문의 즉시 접수"
                  >
                    <span>이 유형으로 1:1 문의하기</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* 마스터 가이드 4개 단위 페이지네이션 바 & 전체 갯수 표시 */}
        {totalGuidePages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4.5 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs text-slate-500 font-medium flex items-center space-x-2">
              <Layers className="h-4 w-4 text-indigo-600 shrink-0" />
              <span>
                전체 <strong className="text-slate-900 font-bold">{filteredInquiries.length}개</strong> 마스터 가이드 중{' '}
                <strong className="text-indigo-600 font-black">
                  {(guidePage - 1) * GUIDE_PAGE_SIZE + 1} - {Math.min(guidePage * GUIDE_PAGE_SIZE, filteredInquiries.length)}개
                </strong>{' '}
                표시 (페이지 <strong className="text-slate-800 font-bold">{guidePage}</strong> / {totalGuidePages})
              </span>
            </div>

            <div className="flex items-center space-x-1 sm:space-x-1.5">
              {/* First Page Button */}
              <button
                type="button"
                disabled={guidePage === 1}
                onClick={() => setGuidePage(1)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs font-semibold text-slate-600 cursor-pointer shadow-2xs"
                title="첫 페이지"
              >
                처음
              </button>

              {/* Prev Button */}
              <button
                type="button"
                disabled={guidePage === 1}
                onClick={() => setGuidePage(p => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-600 cursor-pointer shadow-2xs"
                title="이전 페이지"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {/* Page number buttons with smart windowing */}
              {getGuidePageNumbers(guidePage, totalGuidePages).map((pNum, idx) => {
                if (pNum === '...') {
                  return (
                    <span key={`ellipsis-${idx}`} className="px-1.5 text-slate-400 text-xs font-bold select-none">
                      •••
                    </span>
                  );
                }
                const num = Number(pNum);
                const isActive = guidePage === num;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setGuidePage(num)}
                    className={`min-w-8 h-8 px-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xs scale-105'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {num}
                  </button>
                );
              })}

              {/* Next Button */}
              <button
                type="button"
                disabled={guidePage === totalGuidePages}
                onClick={() => setGuidePage(p => Math.min(totalGuidePages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-600 cursor-pointer shadow-2xs"
                title="다음 페이지"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              {/* Last Page Button */}
              <button
                type="button"
                disabled={guidePage === totalGuidePages}
                onClick={() => setGuidePage(totalGuidePages)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs font-semibold text-slate-600 cursor-pointer shadow-2xs"
                title="마지막 페이지"
              >
                끝
              </button>
            </div>
          </div>
        )}
      </div>
      ) : (
        /* Empty Search State */
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-4">
          <div className="p-4 bg-indigo-50 rounded-2xl w-16 h-16 mx-auto flex items-center justify-center text-indigo-600">
            <Search className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-slate-800">일치하는 검색 결과가 없습니다</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              입력하신 검색어 <strong className="text-indigo-600">'{searchQuery}'</strong>는 미해결 지식 레이더에 실시간 접수되어 전담 AI가 공식 법령 검토 및 정답 솔루션을 자동 생성·축적할 예정입니다.
            </p>
          </div>
          <div className="flex items-center justify-center space-x-3 pt-2">
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setOnlyBookmarked(false); }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              전체 목록으로 초기화
            </button>
            <button
              type="button"
              onClick={onGoToCustomerPortal}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              1:1 맞춤 문의 작성하기 →
            </button>
          </div>
        </div>
      )}

      {/* Bottom CTA Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800 shadow-xl">
        <div className="space-y-2 text-center md:text-left max-w-xl">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 text-xs font-bold">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>해결되지 않은 개별 문의가 있으신가요?</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black">
            24시간 1:1 전담 문의 접수처
          </h3>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            고객님의 특별한 상황이나 개별 주문 건에 대해 본사 지원팀과 공식 제휴 전문가가 실시간으로 가장 정확하고 정중한 맞춤 답변을 드립니다.
          </p>
        </div>

        <button
          type="button"
          onClick={onGoToCustomerPortal}
          className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-black rounded-xl text-xs sm:text-sm flex items-center space-x-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer shrink-0"
        >
          <Send className="h-4 w-4" />
          <span>1:1 맞춤 문의 바로 작성하기</span>
        </button>
      </div>

      {/* 🏢 Partner Brand CS Hotline Modal */}
      {selectedPartner && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 animate-scaleUp flex flex-col">
            {/* Header */}
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-3xl p-2.5 bg-white rounded-2xl shadow-xs border border-slate-100">
                  {selectedPartner.logoEmoji}
                </span>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-black text-slate-950">
                      {selectedPartner.name}
                    </h3>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {selectedPartner.category}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">
                    모두의문의 공식 품질인증 및 신속 중재 제휴처
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPartner(null)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">
                  제휴 파트너 소개
                </span>
                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                  {selectedPartner.intro}
                </p>
              </div>

              {/* Contact Card */}
              <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-indigo-600 block">
                    본사 고객지원 직통센터
                  </span>
                  <div className="flex items-center space-x-1.5 text-base font-black text-slate-900">
                    <Phone className="h-4 w-4 text-indigo-600" />
                    <span>{selectedPartner.phone}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedPartner.phone);
                    setToastMessage('전화번호가 클립보드에 복사되었습니다.');
                    setTimeout(() => setToastMessage(null), 2500);
                  }}
                  className="px-3 py-1.5 bg-white hover:bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100 shadow-2xs transition-all cursor-pointer"
                >
                  번호 복사
                </button>
              </div>

              {/* Status Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">
                    평균 대기 시간
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-emerald-600">
                    {selectedPartner.avgResponse}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[9px] font-bold text-slate-400 block uppercase">
                    자주 접수되는 쟁점
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-slate-700 line-clamp-1">
                    {selectedPartner.popularInquiry}
                  </span>
                </div>
              </div>

              {/* Warning/Guide info */}
              <div className="p-3 bg-amber-50/70 border border-amber-200/50 rounded-xl text-[11px] text-amber-800 flex items-start space-x-2">
                <ShieldCheck className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  본 제휴 브랜드의 가맹점 이용 시 불공정 계약, 주문 누락, 이물 위생 등으로 구제 요청이 필요할 경우, 본사 직통센터를 통해 즉시 원만히 중재받으실 수 있습니다.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery(selectedPartner.name);
                  setSelectedPartner(null);
                }}
                className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                가이드 검색 연동
              </button>
              <button
                type="button"
                onClick={() => {
                  onNavigateToInquiry({
                    parentCategory: 'dining',
                    subCategory: selectedPartner.category,
                    title: `[${selectedPartner.name} 분쟁 조정] `,
                    content: `해당 제휴처: ${selectedPartner.name}\n발생 상황 및 일자:\n원하는 해결 조치(교환/환불 등):\n상세 내용:\n\n* 본 문의는 모두의문의 제휴 CS 핫라인에 의거하여 본사 담당자 및 당사 중재 전문 AI에게 최우선 전송됩니다.`
                  });
                  setSelectedPartner(null);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
              >
                1:1 안심 분쟁 문의하기 →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 💡 AI Trend Common Sense Detail Modal */}
      {selectedInsight && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 animate-scaleUp flex flex-col">
            {/* Header */}
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-3xl p-2.5 bg-white rounded-2xl shadow-xs border border-slate-100">
                  {selectedInsight.emoji}
                </span>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base sm:text-lg font-black text-slate-950">
                      {selectedInsight.title}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-1.5 mt-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                      {selectedInsight.badge}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      AI 법령 요약 브리핑
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInsight(null)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5 overflow-y-auto max-h-[60vh]">
              {/* Summary */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">
                  AI 핵심 한줄 브리핑
                </span>
                <p className="text-sm font-bold text-indigo-950 bg-indigo-50/50 border border-indigo-100/60 p-3.5 rounded-2xl leading-relaxed">
                  {selectedInsight.summary}
                </p>
              </div>

              {/* Law Basis */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">
                  강력한 법적 보호 근거
                </span>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 flex items-start space-x-2.5">
                  <Scale className="h-4.5 w-4.5 text-indigo-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="text-xs font-extrabold text-slate-900 block">
                      관련 법령 및 고시 기준
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                      {selectedInsight.lawBasis}
                    </p>
                  </div>
                </div>
              </div>

              {/* Complete Action Steps */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">
                  권익 보호 3단계 대처 룰
                </span>
                <div className="space-y-3">
                  {selectedInsight.fullTip.split('\n').map((tipLine, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-50/30 hover:bg-slate-50 rounded-xl border border-slate-100 transition-colors flex items-start space-x-2.5">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 shadow-xs">
                        {idx + 1}
                      </span>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                        {tipLine.replace(/^[0-9]\.\s*/, '')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery(selectedInsight.badge);
                  setSelectedInsight(null);
                }}
                className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                관련 가이드 일괄 검색
              </button>
              
              {selectedInsight.id === 'is_content_cert' && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedInsight(null);
                    const event = new CustomEvent('open-modu-assistant', {
                      detail: { action: 'start-document-builder', topic: 'content-certification' }
                    });
                    window.dispatchEvent(event);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-750 hover:to-indigo-750 text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer animate-pulse"
                >
                  ✉️ 지금 바로 내 내용증명 초안 짜기
                </button>
              )}

              {selectedInsight.id === 'is_certificates' && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedInsight(null);
                    const event = new CustomEvent('open-modu-assistant', {
                      detail: { action: 'start-document-builder', topic: 'gov-wallet' }
                    });
                    window.dispatchEvent(event);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-750 hover:to-indigo-750 text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer animate-pulse"
                >
                  📄 정부24 전자문서 즉시 제출
                </button>
              )}

              {selectedInsight.id === 'is_phone_cancel' && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedInsight(null);
                    const event = new CustomEvent('open-modu-assistant', {
                      detail: { action: 'start-document-builder', topic: 'phone-cancel' }
                    });
                    window.dispatchEvent(event);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-750 hover:to-indigo-750 text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer animate-pulse"
                >
                  📱 팩스해지 & 해지 신청 공문 기획
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  onNavigateToInquiry({
                    parentCategory: 'legal',
                    subCategory: selectedInsight.badge,
                    title: `[${selectedInsight.title} 대처 구제 요청] `,
                    content: `이슈 카테고리: ${selectedInsight.badge}\n해당 가이드: ${selectedInsight.title}\n발생 일자 및 가맹점/상호명:\n피해 금액 및 쟁점 요약:\n조치 요청 내용:\n\n* 법적 근거인 [${selectedInsight.lawBasis}]를 토대로 소비자 권익 구제 중재가 신속히 접수 및 연동됩니다.`
                  });
                  setSelectedInsight(null);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
              >
                1:1 안심 분쟁 구제 신청 →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
