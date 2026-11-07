import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trophy, 
  Flame, 
  ArrowUpRight, 
  Sparkles, 
  FileText, 
  Bell, 
  MessageSquare, 
  Zap, 
  Search, 
  CheckCircle2, 
  TrendingUp,
  X,
  Volume2
} from 'lucide-react';
import { collection, onSnapshot, query, orderBy, setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { InquiryParentCategory } from '../types';

export interface RankingItem {
  id: string;
  rank: number;
  type: 'inquiry' | 'alert' | 'insight';
  title: string;
  badge: string;
  emoji: string;
  hotIndex: number;
  growthRate: number;
  lawBasis?: string;
  actionType: 'assistant' | 'alert' | 'inquiry';
  actionTopic: string;
  parentCategory?: string;
  subCategory?: string;
  prefillTitle?: string;
  prefillContent?: string;
}

// 20 High-Fidelity Default Seed Items with action mappings
export const DEFAULT_SEED_RANKINGS: Omit<RankingItem, 'id'>[] = [
  {
    rank: 1,
    type: 'insight',
    title: '실전 법적 대항무기 "내용증명" 완벽 작성법 및 e-그린 등기 발송',
    badge: '송무/방어',
    emoji: '✉️',
    hotIndex: 9842,
    growthRate: 142,
    lawBasis: '우편법 시행규칙 제46조 및 민법 제111조',
    actionType: 'assistant',
    actionTopic: 'content-certification'
  },
  {
    rank: 2,
    type: 'alert',
    title: '농어촌 감소지역 여행경비 50% 지역화폐 환급 및 특별 고지 사업',
    badge: '복지 혜택',
    emoji: '🚨',
    hotIndex: 8910,
    growthRate: 120,
    lawBasis: '국가균형발전 특별법 및 지자체 조례 특별 고시',
    actionType: 'alert',
    actionTopic: '농어촌'
  },
  {
    rank: 3,
    type: 'insight',
    title: '통신사 위약금 제로(0원) 핸드폰 본사 해지 신청서 작성 및 팩스 발송',
    badge: '소비자 권익',
    emoji: '📱',
    hotIndex: 7544,
    growthRate: 92,
    lawBasis: '전기통신사업법 제32조의3 및 방통위 이용자 가이드라인',
    actionType: 'assistant',
    actionTopic: 'phone-cancel'
  },
  {
    rank: 4,
    type: 'inquiry',
    title: '배달음식 이물질 검출 시 식약처 1399 즉시 신고 및 100% 전액 환불 룰',
    badge: 'F&B 위생',
    emoji: '🛵',
    hotIndex: 6820,
    growthRate: 84,
    lawBasis: '식품위생법 제4조 및 공정위 고시 소비자분쟁기준',
    actionType: 'inquiry',
    actionTopic: 'F&B 위생',
    parentCategory: 'restaurant',
    subCategory: '알레르기/위생',
    prefillTitle: '[배달음식 이물질 전액 환불 요청] ',
    prefillContent: '배달 플랫폼명 및 가맹점명:\n이물질 발견 일시:\n증거 사진 유무 (밀봉 보관 여부):\n\n* 식약처 불량식품(1399) 공식 신고 접수 진행 가이드를 기반으로 제휴처에 즉각 이송됩니다.'
  },
  {
    rank: 5,
    type: 'inquiry',
    title: '배달 플랫폼 입점 헬스장/필라테스 중도 해지 위약금 10% 한도 규정 가이드',
    badge: '피트니스',
    emoji: '🏋️',
    hotIndex: 6110,
    growthRate: 78,
    lawBasis: '방문판매법 제31조 (계약해지) 및 체육시설표준약관',
    actionType: 'inquiry',
    actionTopic: '피트니스',
    parentCategory: 'other',
    subCategory: '서비스 피드백',
    prefillTitle: '[헬스장 중도 해지 및 정산 환불 청구] ',
    prefillContent: '헬스장/필라테스 상호명:\n실 결제 금액 및 등록 개월 수:\n이용 개월 수 / 잔여 일수:\n\n* 방문판매법 강행 규정에 따라 위약금 10% 공제 후 정당한 정산 환불 처리를 청구합니다.'
  },
  {
    rank: 6,
    type: 'alert',
    title: '가짜 부고 문자 및 모바일 건강검진 사칭 스미싱 링크 유포 긴급 경보',
    badge: '금융 안심',
    emoji: '⚠️',
    hotIndex: 5940,
    growthRate: 72,
    lawBasis: '인터넷침해대응센터 실시간 위험 경보 발령',
    actionType: 'alert',
    actionTopic: '부고'
  },
  {
    rank: 7,
    type: 'insight',
    title: '주민센터 방문 없이 카카오/네이버 모바일 전자지갑 민원 증명서 24시간 무료 발급',
    badge: '행정/민원',
    emoji: '📄',
    hotIndex: 5280,
    growthRate: 68,
    lawBasis: '민원 처리에 관한 법률 제12조 및 전자정부법 제9조',
    actionType: 'assistant',
    actionTopic: 'gov-wallet'
  },
  {
    rank: 8,
    type: 'inquiry',
    title: '유튜브 프리미엄 / OTT 중도 구독 취소 시 잔여 일수 일할 환불 수칙',
    badge: '구독 해지',
    emoji: '📺',
    hotIndex: 4990,
    growthRate: 64,
    lawBasis: '콘텐츠산업진흥법 제28조 및 콘텐츠이용자보호지침',
    actionType: 'inquiry',
    actionTopic: '구독 해지',
    parentCategory: 'shopping',
    subCategory: '반품/환불',
    prefillTitle: '[OTT 서비스 중도 구독 취소 및 일할 환불 청구] ',
    prefillContent: '구독 서비스명 (예: 유튜브 프리미엄, 넷플릭스 등):\n정기 결제 일자 및 월 결제액:\n해지 요청 일시:\n\n* 중도 해지 신청 시 일할 정산 환불 의무 규정에 입각하여 반환을 요구합니다.'
  },
  {
    rank: 9,
    type: 'alert',
    title: '해외직구 에어팟/브랜드 위조품 판매 피해 주의 고지 및 즉각 대처 가이드',
    badge: '직구 사기',
    emoji: '🛍️',
    hotIndex: 4510,
    growthRate: 58,
    lawBasis: '관세법 기준 위조품 수입 전면 금지 및 공정거래법',
    actionType: 'alert',
    actionTopic: '위조'
  },
  {
    rank: 10,
    type: 'inquiry',
    title: '도미노피자 앱 멤버십 쿠폰 결제 누락 대처 및 배달 지연 자체 자동 환불 규정',
    badge: '배달 지연',
    emoji: '🍕',
    hotIndex: 4120,
    growthRate: 50,
    lawBasis: '공식 안심제휴처 중재 가이드라인 적용',
    actionType: 'inquiry',
    actionTopic: '배달 지연',
    parentCategory: 'restaurant',
    subCategory: '단체/대관 문의',
    prefillTitle: '[도미노피자 배달 지연 보상 중재 요청] ',
    prefillContent: '주문 지점 및 주문 번호:\n주문 시간 및 배달 완료 시간:\n지연 사유 및 요구 보상 내용:\n\n* 모두의문의 공식 제휴 핫라인에 의거하여 즉각 이송됩니다.'
  },
  {
    rank: 11,
    type: 'insight',
    title: '전세계약 전 등기부등본 및 건축물대장 안심 대조 임차인 권리 자가 체킹 가이드',
    badge: '부동산 안심',
    emoji: '🏠',
    hotIndex: 3890,
    growthRate: 44,
    lawBasis: '민법 제621조 (임대차의 등기) 및 임대차보호법',
    actionType: 'assistant',
    actionTopic: 'gov-wallet'
  },
  {
    rank: 12,
    type: 'insight',
    title: '인스타/블로그 공동구매 "단순 변심 반품 불가" 판매자 특약 무력화 솔루션',
    badge: 'SNS 쇼핑',
    emoji: '🛒',
    hotIndex: 3420,
    growthRate: 38,
    lawBasis: '전자상거래법 제17조 (청약철회) 및 제35조 강행 규정',
    actionType: 'inquiry',
    actionTopic: 'SNS 쇼핑',
    parentCategory: 'shopping',
    subCategory: '반품/환불',
    prefillTitle: '[SNS 공구 임의 약관 무효 청구 및 청약철회 요구] ',
    prefillContent: '판매처 SNS 계정 주소 및 판매자명:\n구매 물품 및 결제 일자:\n반품 요청 사유:\n\n* 사전 반품 불가 약정은 전자상거래법 제35조에 따라 무효이므로 7일 내 무조건 반품을 이행할 것을 청구합니다.'
  },
  {
    rank: 13,
    type: 'inquiry',
    title: '미성년자 자녀가 부모 동의 없이 인앱 결제한 구글/애플 게임 결제 전액 환불 요령',
    badge: '콘텐츠 결제',
    emoji: '🎮',
    hotIndex: 2990,
    growthRate: 32,
    lawBasis: '민법 제5조 (미성년자의 행위능력) 및 법정대리인 동의권',
    actionType: 'inquiry',
    actionTopic: '콘텐츠 결제',
    parentCategory: 'shopping',
    subCategory: '결제 오류',
    prefillTitle: '[미성년자 무동의 유료 결제 소급 정정 요구] ',
    prefillContent: '결제 플랫폼 (구글 플레이 / 애플 앱스토어):\n해당 게임명 및 결제 금액:\n미성년 자녀 나이:\n\n* 민법 제5조에 의거, 미성년자가 동의 없이 체결한 행위로서 전면적인 무효 및 취소를 통보합니다.'
  },
  {
    rank: 14,
    type: 'inquiry',
    title: '층간소음 한계 데시벨 법적 기준 입증 및 주거환경 분쟁 중재 조정 접수 가이드',
    badge: '생활 분쟁',
    emoji: '🔇',
    hotIndex: 2850,
    growthRate: 28,
    lawBasis: '소음진동관리법 및 공동주택 관리규약',
    actionType: 'inquiry',
    actionTopic: '생활 분쟁',
    parentCategory: 'other',
    subCategory: '서비스 피드백',
    prefillTitle: '[주거환경 층간소음 피해 공식 중재 조정 요청] ',
    prefillContent: '거주 형태 (아파트 / 오피스텔 / 빌라):\n피해 소음 유형 및 지속 시간대:\n자가 측정 데시벨 정보 및 기록 여부:\n\n* 생활 분쟁 중재위원회로 정식 연계 및 자문이 시작됩니다.'
  },
  {
    rank: 15,
    type: 'insight',
    title: '당근마켓/번개장터 중고거래 사기 대응 더치트 즉시 연동 및 피해 진술서 무상 자동 작성',
    badge: '사기 대응',
    emoji: '🥕',
    hotIndex: 2410,
    growthRate: 24,
    lawBasis: '형법 제347조 (사기) 및 경찰서 공식 진술 증빙 서식',
    actionType: 'assistant',
    actionTopic: 'content-certification'
  },
  {
    rank: 16,
    type: 'inquiry',
    title: '유료 주차장 문콕 및 파손 뺑소니 사건 발생 시 CCTV 의무 미공조 상가 대처 수칙',
    badge: '차량 파손',
    emoji: '🚗',
    hotIndex: 2180,
    growthRate: 20,
    lawBasis: '주차장법 제17조 및 개인정보 보호법 제18조',
    actionType: 'inquiry',
    actionTopic: '차량 파손',
    parentCategory: 'other',
    subCategory: '광고 및 제휴',
    prefillTitle: '[상가 주차장 관리 책임 미흡에 따른 배상 청구] ',
    prefillContent: '상가 및 주차장명:\n사고 일시 및 파손 위치:\n주차장 관리인의 CCTV 제공 거부 사유:\n\n* 주차장법상 관리 책임 소홀 및 정당한 영상 열람권에 따른 배상 중재 청구를 요청합니다.'
  },
  {
    rank: 17,
    type: 'inquiry',
    title: '스타벅스 사이렌 오더 음료 오발송 및 매장 제조 완료 전 승인 즉시 환불 규약',
    badge: '카페 오발송',
    emoji: '☕',
    hotIndex: 1990,
    growthRate: 16,
    lawBasis: '공식 안심제휴처 중재 기준 준용',
    actionType: 'inquiry',
    actionTopic: '카페 오발송',
    parentCategory: 'restaurant',
    subCategory: '알레르기/비건',
    prefillTitle: '[스타벅스 사이렌 오더 오발송 긴급 환불 조정] ',
    prefillContent: '이용 지점명 및 주문 번호:\n음료 오발송 경위 및 상세 내용:\n매장 직원의 환불 대응 거부 상황 여부:\n\n* 공식 안심 파트너 핫라인 중재에 따라 우선 검토 전송됩니다.'
  },
  {
    rank: 18,
    type: 'inquiry',
    title: '알레르기 유발 물질 교차오염 표시 위반 프랜차이즈 식당 대상 공식 항의 공문 발송',
    badge: '식품 안전',
    emoji: '🥦',
    hotIndex: 1740,
    growthRate: 12,
    lawBasis: '식품등의 표시·광고에 관한 법률 및 식약처 고시',
    actionType: 'inquiry',
    actionTopic: '식품 안전',
    parentCategory: 'restaurant',
    subCategory: '알레르기/비건',
    prefillTitle: '[식품 알레르기 표시 누락 및 공식 엄중 경고] ',
    prefillContent: '음식점 브랜드명 및 지점 위치:\n구매 식음료 및 교차 오염 의심 증상 내용:\n본사 관리 부서 항의 피드백 요구 내역:\n\n* 소비자 위생 안전 보장 조례에 입각하여 본사 제휴 채널에 이송됩니다.'
  },
  {
    rank: 19,
    type: 'inquiry',
    title: '항공권 임의 예약 취소 및 과다 수수료 공제 시 약관규제법 기준 전면 정산 대응책',
    badge: '항공 취소',
    emoji: '✈️',
    hotIndex: 1520,
    growthRate: 8,
    lawBasis: '약관의 규제에 관한 법률 제6조 및 공정위 항공권 약관 표준안',
    actionType: 'inquiry',
    actionTopic: '항공 취소',
    parentCategory: 'travel',
    subCategory: '✈️ 항공권 예약',
    prefillTitle: '[항공권 취소 수수료 과다 징수 이의 신청] ',
    prefillContent: '항공사 및 예약 대행 플랫폼명:\n원 결제액 및 부과된 취소 위약금:\n항공 규정 위반 쟁점 사항:\n\n* 약관규제법에 명시된 불공정 약정 조항을 근거로 부당 청구 정정을 강력히 요구합니다.'
  },
  {
    rank: 20,
    type: 'insight',
    title: '국세청 현금영수증 및 세금계산서 의무 발행 누락 먹튀 사업자 과태료 독촉 수칙',
    badge: '세무/세금',
    emoji: '💸',
    hotIndex: 1110,
    growthRate: 4,
    lawBasis: '조세범 처벌법 제15조 및 소득세법 제162조의3',
    actionType: 'assistant',
    actionTopic: 'gov-wallet'
  }
];

interface RealtimeRankingProps {
  onNavigateToInquiry: (prefill: {
    parentCategory: InquiryParentCategory;
    subCategory: string;
    title: string;
    content: string;
  }) => void;
  onGoToCustomerPortal: () => void;
  onNavigateToAlerts: (searchQuery?: string) => void;
}

export const RealtimeRanking: React.FC<RealtimeRankingProps> = ({
  onNavigateToInquiry,
  onGoToCustomerPortal,
  onNavigateToAlerts
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'inquiry' | 'alert' | 'insight'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [rankingList, setRankingList] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load ranking items from Firestore in real-time with automatic seeding
  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'rankings'));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const items: RankingItem[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });

      // Sort items by rank asc
      const sorted = items.sort((a, b) => a.rank - b.rank);

      // Automatic Seeding if collection is empty
      if (items.length === 0) {
        console.log("Seeding initial 20 standard rankings into Firestore...");
        // Set immediately to default seed rankings so UI is populated instantly!
        const mappedSeeds = DEFAULT_SEED_RANKINGS.map((d, index) => ({ id: `rank_${d.rank}`, ...d } as any));
        setRankingList(mappedSeeds);
        setLoading(false);

        const seedCollection = async () => {
          try {
            for (let i = 0; i < DEFAULT_SEED_RANKINGS.length; i++) {
              const seed = DEFAULT_SEED_RANKINGS[i];
              const docId = `rank_${seed.rank}`;
              await setDoc(doc(db, 'rankings', docId), {
                ...seed,
                createdAt: serverTimestamp()
              });
            }
          } catch (err) {
            console.error("Failed to seed initial rankings:", err);
          }
        };
        seedCollection();
      } else {
        setRankingList(sorted);
        setLoading(false);
      }
    }, (err) => {
      console.warn("Firestore rankings snapshot reader note:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Bridge action execution router
  const handleBridgeAction = (item: RankingItem) => {
    if (item.actionType === 'assistant') {
      const event = new CustomEvent('open-modu-assistant', {
        detail: { action: 'start-document-builder', topic: item.actionTopic }
      });
      window.dispatchEvent(event);
    } else if (item.actionType === 'alert') {
      onNavigateToAlerts(item.actionTopic);
    } else if (item.actionType === 'inquiry') {
      onNavigateToInquiry({
        parentCategory: (item.parentCategory as any) || 'other',
        subCategory: item.subCategory || '지능형 자동 매핑',
        title: item.prefillTitle || `[${item.badge} 해결 요청] `,
        content: item.prefillContent || '상세 진행 상황을 기재해 주십시오.'
      });
    }
  };

  // Filter logic
  const filteredItems = useMemo(() => {
    // If loading or state is still initializing, use static seed lists immediately for seamless UX
    const listToFilter = rankingList.length > 0 ? rankingList : DEFAULT_SEED_RANKINGS.map((d, index) => ({ id: `seed_${index}`, ...d }));

    return listToFilter.filter(item => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchBadge = item.badge.toLowerCase().includes(q);
        const matchLaw = item.lawBasis?.toLowerCase().includes(q);
        if (!matchTitle && !matchBadge && !matchLaw) return false;
      }

      // Category tab filter
      if (activeFilter === 'all') return true;
      return item.type === activeFilter;
    });
  }, [rankingList, searchQuery, activeFilter]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-6 sm:space-y-8 animate-fadeIn">
      
      {/* 📣 1. Real-time Hot Keyword Ticker (AI 트렌드 급상승 톺아보기) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl px-3.5 sm:px-5 py-2.5 sm:py-3.5 flex items-center justify-between overflow-hidden shadow-md">
        <div className="flex items-center space-x-2 shrink-0">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </span>
          <span className="text-[10px] font-black tracking-widest text-red-400 uppercase bg-red-950/50 px-2 py-0.5 rounded-md border border-red-900/40">
            LIVE TICKER
          </span>
          <span className="text-slate-400 font-bold text-xs pl-1 hidden xs:inline">실시간 검색 급상승:</span>
        </div>
        
        {/* Scrolling text marquee */}
        <div className="flex-grow mx-4 overflow-hidden relative h-5 select-none text-xs">
          <div className="absolute flex space-x-12 whitespace-nowrap animate-marquee">
            <span className="text-slate-200 font-medium">🔥 1위 내용증명 초안 빌더 <strong className="text-amber-400 font-black pl-0.5">(+182%)</strong></span>
            <span className="text-slate-200 font-medium">🔥 2위 농어촌 여행 환급금 <strong className="text-amber-400 font-black pl-0.5">(+145%)</strong></span>
            <span className="text-slate-200 font-medium">🔥 3위 LGU+/KT 약정 해지 <strong className="text-amber-400 font-black pl-0.5">(+112%)</strong></span>
            <span className="text-slate-200 font-medium">🔥 4위 배달의민족 이물 위생 <strong className="text-amber-400 font-black pl-0.5">(+92%)</strong></span>
            <span className="text-slate-200 font-medium">🔥 5위 필라테스 환불 거부 <strong className="text-amber-400 font-black pl-0.5">(+78%)</strong></span>
            {/* Seamless duplicate */}
            <span className="text-slate-200 font-medium">🔥 1위 내용증명 초안 빌더 <strong className="text-amber-400 font-black pl-0.5">(+182%)</strong></span>
            <span className="text-slate-200 font-medium">🔥 2위 농어촌 여행 환급금 <strong className="text-amber-400 font-black pl-0.5">(+145%)</strong></span>
            <span className="text-slate-200 font-medium">🔥 3위 LGU+/KT 약정 해지 <strong className="text-amber-400 font-black pl-0.5">(+112%)</strong></span>
            <span className="text-slate-200 font-medium">🔥 4위 배달의민족 이물 위생 <strong className="text-amber-400 font-black pl-0.5">(+92%)</strong></span>
            <span className="text-slate-200 font-medium">🔥 5위 필라테스 환불 거부 <strong className="text-amber-400 font-black pl-0.5">(+78%)</strong></span>
          </div>
        </div>

        <div className="shrink-0 text-slate-500 text-[10px] font-semibold hidden sm:inline">
          한국정부24 & 공정거래위원회 연동중
        </div>
      </div>

      {/* 👑 2. Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-black uppercase tracking-wider">
            <Trophy className="h-3 w-3 text-amber-600 animate-spin" style={{ animationDuration: '3s' }} />
            <span>대한민국 최초 실시간 민생/소비자 랭킹보드</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            🏆 실시간 안심 구제 랭킹 TOP 20
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-semibold">
            조회수, 안심 접수 성공률, 북마크 추천수 데이터를 가중치 합산하여 분석된 20대 핵심 민원 및 혜택 카드입니다.
          </p>
        </div>

        {/* Dynamic Interactive Stats summary */}
        <div className="flex items-center space-x-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-3xs shrink-0 text-xs">
          <div className="space-y-0.5">
            <span className="text-[10px] font-black text-slate-400 block uppercase">실시간 수집 샘플</span>
            <span className="font-extrabold text-slate-900 block">총 12,842건 고지</span>
          </div>
          <div className="w-px h-8 bg-slate-100" />
          <div className="space-y-0.5">
            <span className="text-[10px] font-black text-slate-400 block uppercase">일일 자동 정밀 중재</span>
            <span className="font-black text-emerald-600 block">99.2% 성공률</span>
          </div>
        </div>
      </div>

      {/* 🔍 3. Live Navigation Search and Tab Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        
        {/* Category Tabs */}
        <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl w-full sm:w-auto overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeFilter === 'all'
                ? 'bg-white text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
            }`}
          >
            전체 랭킹 ({filteredItems.length})
          </button>
          <button
            onClick={() => setActiveFilter('inquiry')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeFilter === 'inquiry'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-indigo-600 hover:bg-white/40'
            }`}
          >
            🛵 1:1 CS 문의
          </button>
          <button
            onClick={() => setActiveFilter('alert')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeFilter === 'alert'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-red-600 hover:bg-white/40'
            }`}
          >
            🚨 피해 주의보
          </button>
          <button
            onClick={() => setActiveFilter('insight')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeFilter === 'insight'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-amber-700 hover:bg-white/40'
            }`}
          >
            ✉️ 법률/행정 상식
          </button>
        </div>

        {/* Search bar inside ranking */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="랭킹 키워드 및 법령 즉각 검색..."
            className="w-full bg-slate-50 text-xs rounded-xl pl-10 pr-9 py-2.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white text-slate-800 font-semibold"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 🏆 4. Ranking Keen Card Grid */}
      {filteredItems.length === 0 ? (
        <div className="p-16 text-center bg-white border border-slate-200 rounded-3xl space-y-4 shadow-sm">
          <div className="p-4 bg-slate-50 rounded-2xl w-14 h-14 mx-auto flex items-center justify-center text-slate-400 border border-slate-100">
            <Search className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-slate-800">일치하는 랭킹 항목이 없습니다</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              검색하신 단어나 조건에 해당되는 랭킹 정보가 실시간 데이터베이스에 누락되어 있습니다. 검색어를 지우고 다시 확인해 주세요.
            </p>
          </div>
          <button
            onClick={() => { setSearchQuery(''); setActiveFilter('all'); }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
          >
            검색 필터 초기화
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, index) => {
            const displayRank = item.rank || (index + 1);
            const isRank1 = displayRank === 1;
            const isRank2 = displayRank === 2;
            const isRank3 = displayRank === 3;
            const isTop3 = isRank1 || isRank2 || isRank3;

            // Define card borders/shadows based on Ranks 1, 2, 3 (Gold, Silver, Bronze)
            const borderClass = isRank1
              ? 'border-2 border-amber-300 ring-4 ring-amber-100/50 bg-gradient-to-b from-amber-50/40 via-white to-white'
              : isRank2
              ? 'border-2 border-slate-300 bg-gradient-to-b from-slate-50/30 via-white to-white'
              : isRank3
              ? 'border-2 border-orange-200 bg-gradient-to-b from-orange-50/20 via-white to-white'
              : 'border border-slate-200 hover:border-slate-300 bg-white';

            const badgeColor = item.type === 'inquiry'
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-150'
              : item.type === 'alert'
              ? 'bg-red-50 text-red-700 border border-red-150'
              : 'bg-amber-50 text-amber-700 border border-amber-150';

            return (
              <div
                key={item.id || `rank_${displayRank}`}
                className={`relative rounded-3xl p-5.5 flex flex-col justify-between transition-all duration-300 group hover:-translate-y-1 hover:shadow-lg ${borderClass}`}
              >
                {/* Gold Rank Ribbon for Rank 1 */}
                {isRank1 && (
                  <div className="absolute -top-3.5 -left-3.5 bg-amber-500 text-white font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full shadow-md flex items-center gap-1 border border-amber-400">
                    <Sparkles className="h-3 w-3 text-amber-200 animate-spin" style={{ animationDuration: '3s' }} />
                    <span>POPULAR NO.1</span>
                  </div>
                )}

                {/* Card Top Row */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {/* Rank Indicator Badge */}
                      <span className={`h-7 w-7 rounded-full flex items-center justify-center font-black text-xs shadow-3xs ${
                        isRank1
                          ? 'bg-amber-500 text-white border border-amber-400 scale-110'
                          : isRank2
                          ? 'bg-slate-400 text-white border border-slate-300'
                          : isRank3
                          ? 'bg-orange-600 text-white border border-orange-500'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {displayRank}
                      </span>

                      {/* Type Badge */}
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${badgeColor}`}>
                        {item.badge}
                      </span>
                    </div>

                    {/* Growth Ticker Rate */}
                    <div className="flex items-center space-x-1 font-semibold text-[11px] text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100/50">
                      <TrendingUp className="h-3 w-3 shrink-0" />
                      <span>+{item.growthRate}% 급증</span>
                    </div>
                  </div>

                  {/* Title & Emoji Row */}
                  <div className="flex items-start space-x-3.5 pt-1">
                    <span className="text-3xl p-2 bg-slate-50 border border-slate-100 rounded-2xl shadow-3xs group-hover:scale-110 transition-transform">
                      {item.emoji}
                    </span>
                    <div className="space-y-1">
                      <h4 className={`text-sm font-black leading-snug tracking-tight text-slate-900 line-clamp-3 group-hover:text-amber-700 transition-colors ${isTop3 ? 'font-extrabold text-slate-950' : ''}`}>
                        {item.title}
                      </h4>
                      {item.lawBasis && (
                        <span className="text-[10px] font-semibold text-slate-400 leading-none block pt-0.5">
                          근거: {item.lawBasis}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Bottom / Hot Index & Bridge Button */}
                <div className="pt-5 mt-4 border-t border-slate-100/80 space-y-3.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1 text-slate-400 font-semibold">
                      <Flame className="h-3.5 w-3.5 text-slate-400 group-hover:text-red-500 transition-colors" />
                      <span>실시간 관심 지수</span>
                    </div>
                    <span className="font-extrabold text-slate-800">
                      {(item.hotIndex || 0).toLocaleString()} pt
                    </span>
                  </div>

                  {/* Bridge Call Action Button */}
                  <button
                    onClick={() => handleBridgeAction(item)}
                    className={`w-full py-2.5 rounded-xl font-black text-xs flex items-center justify-center space-x-1.5 transition-all shadow-3xs cursor-pointer ${
                      isRank1
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white hover:shadow-md'
                        : isRank2
                        ? 'bg-slate-800 hover:bg-slate-950 text-white'
                        : isRank3
                        ? 'bg-orange-600 hover:bg-orange-700 text-white'
                        : 'bg-slate-50 group-hover:bg-amber-50 border border-slate-200 group-hover:border-amber-200 text-slate-700 group-hover:text-amber-800'
                    }`}
                  >
                    <span>
                      {item.actionType === 'assistant'
                        ? '🔮 AI 비서 즉석 대항 빌더 연동'
                        : item.actionType === 'alert'
                        ? '🚨 안심 경보/고지 전문 확인하기'
                        : '✉️ 1:1 대리 접수 채널 가동'}
                    </span>
                    <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 💡 5. Bottom Informational Info banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 sm:p-6 text-slate-600 text-xs flex flex-col sm:flex-row items-start gap-4.5">
        <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-3xs shrink-0">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
        </div>
        <div className="space-y-1.5 leading-relaxed">
          <h5 className="font-bold text-slate-900 text-xs sm:text-sm">실시간 랭킹 시스템 검증 및 자격 요건 안내</h5>
          <p className="text-[11px] font-medium text-slate-500">
            본 실시간 순위는 공공 포털 Open API, 지자체 공시 자료, 그리고 모두의문의 접수 트래픽을 가공하여 10분 주기로 순위가 조정됩니다.
            사기 및 피해 발생량이 폭증하거나 법령이 개정되는 시점에는 긴급 보정 계수가 추가되어 가짜 뉴스 유통 방지 및 국민 안전 확보에 우선 적용됩니다.
          </p>
        </div>
      </div>
    </div>
  );
};
