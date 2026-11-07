export type InquiryParentCategory = 'shopping' | 'travel' | 'restaurant' | 'other';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'customer' | 'partner' | 'admin';
  createdAt: any; // Timestamp or Date
  partnerCategory?: InquiryParentCategory | 'all';
  phone?: string;
  status?: 'active' | 'suspended';
  notes?: string;
}

export interface InquiryReply {
  content: string;
  createdAt: any; // Firestore Timestamp
  repliedBy: string;
  repliedByName: string;
}

export interface InquiryAIAnalysis {
  sentiment: 'positive' | 'neutral' | 'negative' | 'urgent';
  summarizedNeed: string;
  suggestedResponse: string;
}

export interface InquiryAttachment {
  name: string;
  size: number;
  type: string;
  dataUrl: string; // Base64 data URL for instant secure storage and viewing
}

export interface InquirySatisfaction {
  rating: 'helpful' | 'more_info';
  submittedAt: any;
  feedback?: string;
}

export interface Inquiry {
  id: string;
  parentCategory: InquiryParentCategory;
  subCategory: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  status: 'pending' | 'routing' | 'replied';
  assignedPartnerId?: string; // partner UID if routed
  assignedPartnerName?: string; // partner company or display name (e.g. 착한식당)
  assignedAt?: any; // Timestamp when assigned
  routingNote?: string; // note for routing / assignment
  autoAssigned?: boolean; // flag if auto-assigned by smart engine
  attachments?: InquiryAttachment[]; // File and proof attachments
  satisfaction?: InquirySatisfaction; // Customer satisfaction rating
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
  reply?: InquiryReply | null;
  aiAnalysis?: InquiryAIAnalysis | null;
}

// 2-Tier categories configuration constant
export interface SubCategoryConfig {
  value: string;
  label: string;
  placeholder: string;
}

export interface ParentCategoryConfig {
  value: InquiryParentCategory;
  label: string;
  color: string;
  bg: string;
  border: string;
  text: string;
  desc: string;
  unsplashUrl: string;
  subCategories: SubCategoryConfig[];
}

export const CATEGORY_MAP: Record<InquiryParentCategory, ParentCategoryConfig> = {
  shopping: {
    value: 'shopping',
    label: '쇼핑/배송/결제',
    color: '#EC4899', // pink-500
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    text: 'text-pink-700',
    desc: '글로벌 오픈마켓 배송 지연, 결제 수단 확인, 환불 요청 문의',
    unsplashUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80',
    subCategories: [
      { value: 'delivery', label: '🚚 배송 문의', placeholder: '주문번호와 송장 조회가 필요한 내용을 적어주세요.' },
      { value: 'refund', label: '💳 반품/환불', placeholder: '결제 수단, 환불 사유, 상품 훼손 여부 등을 기재해주세요.' },
      { value: 'payment_issue', label: '🛍️ 결제 오류', placeholder: '할부 처리 오류, 중복 결제 등의 장애 상황을 입력하세요.' }
    ]
  },
  travel: {
    value: 'travel',
    label: '여가/여행/예약',
    color: '#3B82F6', // blue-500
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    desc: '항공권 취소, 패키지 제휴 조율, 숙소 변경 일괄 관리',
    unsplashUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    subCategories: [
      { value: 'flight_schedule', label: '✈️ 항공권 예약', placeholder: '여정 정보, 변경 희망 날짜, 항공사를 기재해주세요.' },
      { value: 'hotel_booking', label: '🏨 숙소 및 리조트', placeholder: '체크인/아웃 일자, 룸 타입 및 특별 요청 사항을 입력해주세요.' },
      { value: 'package_tour', label: '🗺️ 패키지 변경', placeholder: '가이드 포함 유무, 여행 코스 변경에 대한 제안을 적어주세요.' }
    ]
  },
  restaurant: {
    value: 'restaurant',
    label: '외식/다이닝/예약',
    color: '#F59E0B', // amber-500
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    desc: '테이블 단체 대관, 비즈니스 디너 코스 및 제휴 식당 단가',
    unsplashUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    subCategories: [
      { value: 'group_reservation', label: '🍽️ 단체/대관 문의', placeholder: '예약 일시, 예상 인원 수, 뷔페/코스 단가를 적어주세요.' },
      { value: 'dietary_needs', label: '🥦 알레르기/비건', placeholder: '특이 식성, 알레르기 유발 방지 옵션에 대해 기재해주세요.' },
      { value: 'partnership', label: '🤝 프랜차이즈 협업', placeholder: '지점 제휴, 신메뉴 입점 제안 및 납품 단가 협의 내용을 적어주세요.' }
    ]
  },
  other: {
    value: 'other',
    label: '일반/기타/개선제안',
    color: '#6B7280', // gray-500
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    text: 'text-gray-700',
    desc: '서비스 개선을 위한 고견, 기술 문의 및 파트너 제휴 의뢰',
    unsplashUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
    subCategories: [
      { value: 'widget_api', label: '💻 임베드 위젯/API', placeholder: '외부 자사몰 문의 등록 연동 관련 기술 제안을 입력하세요.' },
      { value: 'marketing', label: '📈 광고 및 제휴', placeholder: '제휴 마케팅 제안서 및 배너 광고 집행 문의를 적어주세요.' },
      { value: 'general_feedback', label: '💡 서비스 피드백', placeholder: '불편하셨던 점이나 더해졌으면 하는 아이디어를 적어주세요.' }
    ]
  }
};

export interface HubInquiryDoc {
  id: string;
  category: 'shopping' | 'leisure' | 'dining' | 'general' | 'legal' | 'other';
  categoryLabel: string;
  iconName: string;
  subCategory: string;
  rankBadge: string;
  resolutionRate: number;
  avgResolutionTime: string;
  title: string;
  questionScenario: string;
  officialAnswer: {
    summary: string;
    steps: Array<{ stepNumber: number; title: string; desc: string }>;
    checklist: string[];
    proTip: string;
  };
  tags: string[];
  requiredDocs?: string[];
  directInquiryPrefill: {
    parentCategory: InquiryParentCategory;
    subCategory: string;
    title: string;
    contentTemplate: string;
  };
  status: 'published' | 'draft' | 'archived';
  isAIGenerated?: boolean;
  viewCount?: number;
  helpfulCount?: number;
  createdAt?: any;
  updatedAt?: any;
}

export interface HubUnansweredQueryLog {
  id: string;
  query: string;
  count: number;
  lastSearchedAt: any;
  resolved?: boolean;
}

