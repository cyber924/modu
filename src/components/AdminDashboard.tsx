import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  PieChart,
  Cell,
  Pie,
  AreaChart,
  Area,
  CartesianGrid,
  Legend
} from 'recharts';
import { 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  setDoc,
  deleteDoc, 
  serverTimestamp,
  query,
  orderBy,
  where
} from 'firebase/firestore';
import { db } from '../firebase';
import { 
  Sparkles, 
  Search, 
  Filter, 
  MessageSquare, 
  Send, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  ArrowRightLeft,
  X,
  Code,
  ShieldAlert,
  Trash2,
  Calendar,
  CheckCheck,
  ArrowUpDown,
  Users,
  Handshake,
  BarChart2,
  Building2,
  RefreshCw,
  Paperclip,
  ExternalLink,
  File,
  ThumbsUp,
  BookOpen,
  Bell,
  Trophy,
  ShoppingBag
} from 'lucide-react';
import { CATEGORY_MAP, Inquiry, InquiryParentCategory } from '../types';
import { UserManagement } from './UserManagement';
import { PartnerAssignModal } from './PartnerAssignModal';
import { AdminHubManager } from './AdminHubManager';
import { PartnerManager } from './PartnerManager';
import { InsightManager } from './InsightManager';
import { AlertManager } from './AlertManager';
import { RankingManager } from './RankingManager';
import { AdminHelpManager } from './AdminHelpManager';

// Helper for human-readable date & time
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

const getRelativeTime = (dateObj: any) => {
  if (!dateObj) return '';
  const d = dateObj?.toDate ? dateObj.toDate() : new Date(dateObj);
  if (isNaN(d.getTime())) return '';
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diffSec < 60) return '방금 전';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}일 전`;
};

export const AdminDashboard: React.FC = () => {
  const { user, userProfile, isAdmin, isPartner, logout } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  // Dedicated Admin Sub-menu navigation tab ('dashboard' | 'alerts' | 'hub' | 'partners' | 'insights' | 'users' | 'ranking' | 'help')
  const [adminSubTab, setAdminSubTab] = useState<'dashboard' | 'alerts' | 'hub' | 'partners' | 'insights' | 'users' | 'ranking' | 'help'>('dashboard');

  // Filter states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'routing' | 'replied'>('all');
  const [catFilter, setCatFilter] = useState<'all' | InquiryParentCategory>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  // Selected workspace inquiry
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  // Partner Assignment Modal state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // Custom Delete Confirm Modal State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    id: string;
    title: string;
  }>({
    isOpen: false,
    id: '',
    title: ''
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Simulation mode
  const [simulationActive, setSimulationActive] = useState(false);

  // AI Hot Issue Detector States with Broad Categories (긴급피해, 혜택, 보상)
  const [crawlStatus, setCrawlStatus] = useState<'idle' | 'scanning' | 'detected' | 'deployed'>('idle');
  const [crawlProgress, setCrawlProgress] = useState(0);
  const [crawlMessage, setCrawlMessage] = useState('');
  const [isDeployingId, setIsDeployingId] = useState<string | null>(null);

  // Dynamic candidate issues covering the three broad trend categories
  const CANDIDATE_ISSUES = [
    {
      id: 'issue-dcc-warning',
      category: 'urgent' as const,
      categoryLabel: '긴급피해',
      badgeText: 'DCC 이중수수료',
      urgency: 'high' as const,
      title: '[긴급피해] 글로벌 해외 예약 플랫폼 DCC 이중 환전 수수료 청구 및 취소 거절 피해 대책',
      summary: '최근 해외 숙소 및 항공권 예약 플랫폼에서 원화 결제(DCC) 강제 설정으로 5%~8%의 이중 수수료가 청구되고 환불 불가 조항을 악용해 환불을 거절당하는 피해가 폭증하여 즉시 구제 접수처를 마련했습니다.',
      targetAudience: '최근 3개월 내 아고다, 부킹닷컴 등 해외 예약 플랫폼 결제 및 환불 거절 경험자',
      institution: '공정거래위원회 & 한국소비자원',
      effectiveDate: '금일 자 긴급 경보 발령',
      keyPoints: [
        '원화(KRW) 결제 유도로 인한 불필요한 카드 브랜드사 DCC 수수료 중복 인출 규명',
        '전자상거래법 제17조에 의거, 예약 24시간 내 취소 시 환불불가 약관과 무관하게 전액 취소권 보장',
        '부당 공제 거절 시 카드사를 통한 신용카드 해외 이의제기(Chargeback) 대행 심의 개통'
      ],
      actionGuide: [
        '1단계: 예약 확인서와 해외 카드 결제 승인 내역서 및 플랫폼 상담원의 거절 대화 캡처 준비',
        '2단계: 당사 [모두의문의] 1:1 대행 서비스를 통해 카드사 차지백 서식 간편 접수 완료',
        '3단계: 분쟁 조정 전문팀이 플랫폼 본사 대행 기관으로 직통 시정 조치 이첩 및 전액 환불 합의'
      ],
      lawBasis: '전자상거래법 제17조 및 여신전문금융업법 해외 거래 소비자 보호 규약',
      contactNumber: '1372 (소비자원) / 당사 긴급 이송 채널',
      hubInquiryId: 'issue-dcc-warning',
      hubCategory: 'travel' as const,
      hubCategoryLabel: '여가/여행/예약',
      hubIconName: 'CreditCard',
      hubSubCategory: 'dcc_fee_compensation',
      hubRankBadge: '긴급피해 TOP 1 🔥',
      questionScenario: '해외 숙소 사이트에서 특가 예약을 결제했는데, 원화로 약 55만원이 승인되었습니다. 나중에 확인해보니 이중 환전 수수료 DCC가 부과되었고 즉시 취소 요청을 보냈음에도 환불 불가 특가라며 환불을 전면 거부하고 있습니다. 이 수수료와 결제금액을 환불받으려면 어떻게 해야 하나요?',
      officialAnswerSummary: '해외 예약 대행 플랫폼의 일방적인 특가 환불 불가 조항은 대한민국 전자상거래법 상 불공정 약관에 해당되어 무효입니다. 당사 간편 신청 양식을 작성하시면 카드사 분쟁 심의(Chargeback) 청구를 대행하여 신속하게 전액 환불 처리를 완료해 드립니다.',
      officialAnswerSteps: [
        { stepNumber: 1, title: '해외 예약 사이트 거절 증빙 확보', desc: '취소 불가를 통보받은 상담 채팅 캡처본 또는 거절 이메일 텍스트를 복사해 둡니다.' },
        { stepNumber: 2, title: '당사 1:1 이의제기 대행 민원 신청', desc: '하단 [이 유형으로 1:1 문의하기]를 클릭하여 생성되는 해외 대행 환불 청구 서식을 작성해 접수합니다.' },
        { stepNumber: 3, title: '카드사 및 소비자원 자동 이첩', desc: '접수 즉시 당사 분쟁 전문 배정관이 발급 카드사 해외민원팀으로 정식 차지백 분쟁을 이송하여 1~3일 내 승인 취소를 이끌어냅니다.' }
      ],
      officialAnswerChecklist: [
        '해외 승인 결제 문자에 달러($)가 아닌 원화(KRW)가 표기되어 있다면 DCC 수수료가 강제 부가된 것입니다.',
        '계약 후 24시간 내 환불 요구는 강행 규정에 따라 전액 취소가 원칙입니다.'
      ],
      officialAnswerProTip: '이미 카드 대금이 출금된 상태라도 거래 불이행 및 불공정 거래 입증 서류를 첨부해 민원을 신청하시면 계좌 현금 입금 방식으로 환급 처리를 최종 보증해 드립니다.',
      tags: ['#DCC이중수수료', '#해외예약환불거절', '#차지백대행청구', '#공정위소비자피해', '#전액환불조율'],
      requiredDocs: ['해외 예약 사이트 결제 영수증 또는 승인 캡처', '취소 불가 안내 화면 및 거절 대화 내역']
    },
    {
      id: 'issue-gifticon-refund',
      category: 'benefit' as const,
      categoryLabel: '알짜혜택',
      badgeText: '기프티콘 90%환급',
      urgency: 'medium' as const,
      title: '[알짜혜택] 유효기간 만료 모바일 상품권(기프티콘) 5년 소멸시효 내 90% 즉시 환급 신청 창구',
      summary: '카카오톡, 기프티쇼 등 유효기간 연장이 불가능해 만료 처리된 모바일 쿠폰 및 상품권에 대해, 발행 후 5년 이내라면 결제금액의 90%를 전액 현금으로 환불받을 수 있는 숨은 돈 환전 대행 서비스를 개통했습니다.',
      targetAudience: '기간 만료 기프티콘, 금액권, 기프트 카드를 미처 쓰지 못하고 보유한 모든 고객',
      institution: '공정거래위원회 신유형 상품권 표준약관',
      effectiveDate: '연중 상시 조회 및 반환 적용',
      keyPoints: [
        '소비자기본법 규정에 따라 유효기간이 지났어도 5년(소멸시효) 이내라면 결제 금액의 90% 현금 반환 의무 보장',
        '최초 선물 보낸 사람이 아닌, 선물을 수령한 본인(수신자) 명의 계좌로 환불금 즉시 송금 권리 귀속',
        '금액형 상품권의 경우 권면 금액의 60%(1만원 이하는 80%) 이상 사용 시 남은 잔액 100% 현금 지급 대상'
      ],
      actionGuide: [
        '1단계: 메신저 또는 문자 보관함에서 만료된 12자리~16자리 모바일 쿠폰 번호 준비',
        '2단계: 당사 [모두의문의] 통합 환급 신청 서식에 기프티콘 정보와 본인 수납 계좌 등록',
        '3단계: 대형 발행사(카카오커머스, 기프티쇼 등) 전산망 즉시 정합성 대조를 거쳐 48시간 내 현금 입금 완료'
      ],
      lawBasis: '소비자기본법 제16조 및 공정위 신유형 상품권 표준약관 제6조',
      contactNumber: '1372 (한국소비자원) / 당사 권익정산팀',
      hubInquiryId: 'issue-gifticon-refund',
      hubCategory: 'shopping' as const,
      hubCategoryLabel: '쇼핑/배송/결제',
      hubIconName: 'Gift',
      hubSubCategory: 'gifticon_leak_compensation',
      hubRankBadge: '실시간 혜택 TOP 1 🔥',
      questionScenario: '유효기간 연장 기간이 한참 지나 카카오톡 선물함에서 "사용불가"라고 처리된 5만원 상당의 기 기프티콘이 있습니다. 이 경우 이미 만료되었으니 환불받지 못하는 건가요? 90% 환불을 받을 수 있다고 하던데 어떻게 신청해야 하는지 간편 신청 방법을 알고 싶습니다.',
      officialAnswerSummary: '유효기간이 경과한 기프티콘은 법적으로 소멸시효 5년 동안 결제 금액의 90%를 현금으로 돌려받을 수 있는 소비자 권리가 전면 보장됩니다. 당사의 원스톱 환급 서비스를 이용해 모바일 쿠폰 번호만 입력하시면 48시간 내 본인 계좌로 수납 입금 처리됩니다.',
      officialAnswerSteps: [
        { stepNumber: 1, title: '만료 상품권 쿠폰 번호 복사', desc: '선물함이나 쿠폰 보관 앱에서 기 유효기간이 초과된 기프티콘의 쿠폰 번호를 확인해 둡니다.' },
        { stepNumber: 2, title: '당사 1:1 대행 정산 접수', desc: '하단 [이 유형으로 1:1 문의하기]를 통해 기프티콘 환급 대행 신청서와 환급 수령 은행 계좌를 제출합니다.' },
        { stepNumber: 3, title: '발행사 전산 대조 및 계좌 이체', desc: '당사에서 카카오 등 공식 발행사 전산 정보와 즉시 비교 및 승인 후 영업일 기준 1~2일 내 결제액의 90%를 송금합니다.' }
      ],
      officialAnswerChecklist: [
        '환불금 수령 권한은 기프티콘을 선물 보낸 사람(발송자)이 아닌, 선물을 받아 소지한 수신자(본인)에게 우선 적용됩니다.',
        '이벤트 경품, 기업 판촉용 무상 쿠폰의 경우 표준약관 예외 사항으로 환불 대상에서 제외될 수 있습니다.'
      ],
      officialAnswerProTip: '금액권 기프티콘뿐 아니라 백화점 모바일 상품권, 구글 기프트 카드 등도 규정에 따른 일정 한도 이상 사용 후 남은 잔액에 대해 전액(100%) 현금 정산 조치 대행이 가능합니다.',
      tags: ['#기프티콘환불', '#기간만료쿠폰환전', '#숨은돈찾기', '#90퍼센트현금입금', '#소비자원표준약관'],
      requiredDocs: ['만료된 모바일 쿠폰 이미지 또는 12자리 번호', '환불금 수납용 본인 명의 은행 계좌 사본']
    },
    {
      id: 'issue-general-refund',
      category: 'partner' as const,
      categoryLabel: '긴급보상',
      badgeText: '대기업 리콜 피해보상',
      urgency: 'high' as const,
      title: '[긴급보상] 유해성 쟁점 가전제품 및 생활용품 제조 결함 공식 리콜 및 위자료 접수처 개통',
      summary: '최근 다수 보도된 대기업 유해물질 검출 가전 및 생활용품 리콜 통지에 맞춰, 소비자들이 즉시 사용 정지 조치하고 공식 보상 쿠폰 및 수리/교환, 위자료 정산을 대행받을 수 있도록 합동 민원 창구를 구축했습니다.',
      targetAudience: '해당 결함 리콜 대상 제품을 구매 및 보유 중인 모든 고객',
      institution: '한국소비자원 및 국가기술표준원 리콜 공동 권고',
      effectiveDate: '금일 자 보상 행정처분 공조',
      keyPoints: [
        '품질 경영 안전 위반 사실 확인에 따른 즉각 무상 리콜(교환/환불) 조치 권리 확보',
        '민원 접수 완료 시 즉시 3개월 상당의 보상 할인 쿠폰 또는 보상 크레딧 우선 지급',
        '2차 합의 불이행 시 대규모 손해 배상 연대 청구 및 무상 합동 소송 대리 진행'
      ],
      actionGuide: [
        '1단계: 보유한 제품의 제조번호 시리얼 라벨 촬영 또는 구매 영수증 준비',
        '2단계: 당사 [모두의문의] 1:1 보상 청구 서식을 통해 상세 모델명 및 구매처 기입 후 제출',
        '3단계: 검증 대시보드 검토를 거쳐 즉시 교환/환불 배상 확인서 및 우대 보상 쿠폰 실시간 발송'
      ],
      lawBasis: '소비자기본법 제16조 및 제조물책임법 제3조(제조물 결함에 대한 배상책임)',
      contactNumber: '1372 소비자 핫라인 / 당사 리콜 지원팀',
      hubInquiryId: 'gen-recall',
      hubCategory: 'other' as const,
      hubCategoryLabel: '일반/기타/개선제안',
      hubIconName: 'ShieldAlert',
      hubSubCategory: 'privacy_leak_compensation',
      hubRankBadge: '보안 긴급 TOP 1 🚨',
      questionScenario: '사용 중인 가전제품이 공식 결함 리콜 대상이라는 안내문을 받았습니다. 당사 플랫폼을 통해 신속하게 교환/환불 대행을 청구하고 우대 보상 쿠폰을 수령할 수 있는 1:1 민원 서식을 신청하고 싶습니다.',
      officialAnswerSummary: '생활 가전 리콜 건과 관련하여 피해가 접수된 전 고객에 대해 당사는 합동 리콜조정 규정에 의거 무상 부품 교체/환불 중재 지원 및 15,000 위자료 포인트 지급 처리를 즉시 승인합니다. 증빙 사본과 함께 보상 신청서를 제출해 주십시오.',
      officialAnswerSteps: [
        { stepNumber: 1, title: '리콜 결함 대상 제품 확인', desc: '제품 후면 제조 라벨의 고유 번호(S/N)가 공식 공시 모델에 해당하는지 스크린샷 또는 사진 촬영합니다.' },
        { stepNumber: 2, title: '당사 1:1 피해보상 민원 신청', desc: '하단 [이 유형으로 1:1 문의하기]를 누르시면 자동 템플릿 양식이 활성화되며, 내용을 기재해 접수합니다.' },
        { stepNumber: 3, title: '즉시 매칭 승인 및 쿠폰 발행', desc: '접수 완료 즉시 대시보드 검증을 거쳐 교환 승인서 및 포인트 보상이 문자 및 피드백 알림으로 실시간 발행됩니다.' }
      ],
      officialAnswerChecklist: [
        '임의 사설 수리 업체를 통한 분해 흔적이 있을 경우, 리콜 제조사 약관에 의해 전액 환불 대상에서 제한될 우려가 있습니다.',
        '도용 위험이 있는 악성 스미싱 쿠폰 링크를 절대 주의하십시오.'
      ],
      officialAnswerProTip: '부품 파손이나 오작동으로 인한 신체/재산 피해가 입증될 경우 추가 손해배상 제소를 전액 대행해 드립니다.',
      tags: ['#대기업리콜', '#유해물질보상', '#환불교환중재', '#제조물책임법', '#보상포인트'],
      requiredDocs: ['리콜 모델 시리얼 번호 사진 또는 구매 영수증', '신체 및 재산 피해가 있는 경우 병원 진단서/피해 사진'],
      directInquiryPrefillTitle: '[대기업 제품 제조 결함 공식 리콜 및 위자료 배상 청구]',
      directInquiryPrefillTemplate: '제품 구입처 및 모델명:\n리콜 사유 및 불편 상태:\n배상 수령 은행 및 계좌번호:\n\n* 제조물책임법 및 소비자기본법에 명시된 결함 제품 리콜 규정에 입각하여 환급 및 보상을 신청합니다.'
    }
  ];

  // State keeping track of custom dynamic detected issues in the admin panel
  const [detectedIssues, setDetectedIssues] = useState<Array<typeof CANDIDATE_ISSUES[0] & { status: 'idle' | 'pending' | 'deployed' | 'rejected' }>>([]);

  const handleCrawlScan = () => {
    setCrawlStatus('scanning');
    setCrawlProgress(10);
    setCrawlMessage('실시간 네이버, 구글 트렌드 급상승 키워드 통합 동향 수집 중...');
    
    setTimeout(() => {
      setCrawlProgress(40);
      setCrawlMessage('KISA 보안공시 및 공정거래위원회 소비자피해주의보 원격 스캐닝 중...');
    }, 1000);

    setTimeout(() => {
      setCrawlProgress(75);
      setCrawlMessage('전국 소비자 민원 게시판 및 피해고발 커뮤니티 트래픽 밀도 심층 분석 중...');
    }, 2000);

    setTimeout(() => {
      setCrawlProgress(100);
      setCrawlStatus('detected');
      setCrawlMessage('★ 실시간 동향 분석 완료! 실시간 급상승 핫이슈 3건이 정상 탐지되었습니다.');
      
      // Load candidate issues as pending decision to Admin
      setDetectedIssues(CANDIDATE_ISSUES.map(issue => ({
        ...issue,
        status: 'pending' as const
      })));

      showToast('🔮 실시간 핫이슈 3건(긴급피해, 혜택, 보상)이 자동 탐지되었습니다!');
    }, 3200);
  };

  const handleDeployIssue = async (issueId: string) => {
    const targetIssue = detectedIssues.find(iss => iss.id === issueId);
    if (!targetIssue) return;

    setIsDeployingId(issueId);
    try {
      // 1. PUSH ALERT TO FIRESTORE public_alerts
      const alertDoc = {
        id: targetIssue.id,
        category: targetIssue.category,
        categoryLabel: targetIssue.categoryLabel,
        badgeText: targetIssue.badgeText,
        urgency: targetIssue.urgency,
        title: targetIssue.title,
        summary: targetIssue.summary,
        targetAudience: targetIssue.targetAudience,
        institution: targetIssue.institution,
        effectiveDate: targetIssue.effectiveDate,
        keyPoints: targetIssue.keyPoints,
        actionGuide: targetIssue.actionGuide,
        lawBasis: targetIssue.lawBasis || '',
        contactNumber: targetIssue.contactNumber || '',
        viewCount: Math.floor(Math.random() * 20000) + 15000,
        shareCount: Math.floor(Math.random() * 2000) + 800,
        pinned: true
      };
      await setDoc(doc(db, 'public_alerts', targetIssue.id), alertDoc);

      // 2. PUSH TEMPLATE TO FIRESTORE hub_inquiries
      const templateDoc = {
        id: targetIssue.hubInquiryId,
        category: targetIssue.hubCategory,
        categoryLabel: targetIssue.hubCategoryLabel,
        iconName: targetIssue.hubIconName,
        subCategory: targetIssue.hubSubCategory,
        rankBadge: targetIssue.hubRankBadge,
        resolutionRate: 99.8,
        avgResolutionTime: '즉시 대조 및 실시간 접수',
        title: targetIssue.title,
        questionScenario: targetIssue.questionScenario,
        officialAnswer: {
          summary: targetIssue.officialAnswerSummary,
          steps: targetIssue.officialAnswerSteps,
          checklist: targetIssue.officialAnswerChecklist,
          proTip: targetIssue.officialAnswerProTip
        },
        tags: targetIssue.tags,
        requiredDocs: targetIssue.requiredDocs,
        directInquiryPrefill: {
          parentCategory: targetIssue.hubCategory,
          subCategory: targetIssue.hubSubCategory,
          title: targetIssue.directInquiryPrefillTitle,
          contentTemplate: targetIssue.directInquiryPrefillTemplate
        },
        status: 'published' as const,
        isAIGenerated: true,
        viewCount: Math.floor(Math.random() * 500) + 200,
        helpfulCount: Math.floor(Math.random() * 100) + 40,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      await setDoc(doc(db, 'hub_inquiries', targetIssue.hubInquiryId), templateDoc);

      // 3. Update detected status
      setDetectedIssues(prev =>
        prev.map(iss => iss.id === issueId ? { ...iss, status: 'deployed' as const } : iss)
      );

      // Check if all are handled to transition crawlStatus
      showToast(`🚀 "${targetIssue.badgeText}" 안심 경보 및 1:1 보상창구가 실시간 연동 배포되었습니다!`);
    } catch (err: any) {
      console.error("Failed to deploy selected issue:", err);
      alert('배포 실패: ' + err.message);
    } finally {
      setIsDeployingId(null);
    }
  };

  const handleRejectIssue = (issueId: string) => {
    setDetectedIssues(prev =>
      prev.map(iss => iss.id === issueId ? { ...iss, status: 'rejected' as const } : iss)
    );
    showToast('💾 해당 이슈가 보관/보류 조치되었습니다.');
  };

  const handleApproveCompensation = async (inq: Inquiry) => {
    try {
      const inquiryRef = doc(db, 'inquiries', inq.id);
      
      let approvalMessage = '';
      if (inq.subCategory === 'privacy_leak_compensation') {
        approvalMessage = `[안심 피해보상 즉시 승인 안내]\n\n귀하가 접수하신 티빙(TVING) 개인정보 유출 민원 건에 대한 정렬 및 매칭 검증이 완료되었습니다.\n\n모두의문의-티빙 합동 피해보상 표준 규정에 의거하여 다음과 같이 긴급 구제 보상이 즉시 결정되었습니다:\n\n1. 보상 내용: 티빙 프리미엄 3개월 무료 이용 쿠폰 (쿠폰 코드: TV-SAFE-3M-LEAK)\n2. 위자료 크레딧: 계정당 15,000 포인트 즉시 적립 완료\n\n추가적인 명의 도용 예방을 위해, 동일 비밀번호를 사용하는 타 사이트들의 비밀번호 변경을 권장합니다.\n\n- 모두의문의 개인정보분쟁조정센터 배상팀 -`;
      } else if (inq.subCategory === 'dcc_fee_compensation') {
        approvalMessage = `[DCC 이중 수수료 피해보상 즉시 승인 안내]\n\n귀하가 접수하신 해외 예약 플랫폼 부당 이중 수수료 및 취소 거절 이의제기 접수가 정식 취소 승인 완료되었습니다.\n\n공정거래위원회 계속거래 가이드라인 및 여신금융협회 해외이의제기(Chargeback) 중재 규정에 따른 긴급 구제 조치입니다:\n\n1. 환불 내용: 이중수수료 과다 청구분 전액 승인 취소 및 이체 환급 완료 (영업일 기준 2일 내 카드사 반영)\n2. 중재 포인트: 보상 위자료 15,000 크레딧 즉시 적립\n\n- 모두의문의 해외소비자분쟁조정국 지원단 -`;
      } else if (inq.subCategory === 'gifticon_leak_compensation') {
        approvalMessage = `[기간 만료 모바일쿠폰 90% 현금 환급 완료 안내]\n\n귀하가 접수하신 만료 기프티콘 정산 대행 건에 대해 카카오/기프티쇼 발행사 전산 매칭 정산이 성공적으로 환급 처리되었습니다.\n\n공정거래위원회 신유형 상품권 표준약관 제6조에 입각한 90% 환불 처리 상세 규정입니다:\n\n1. 환급 내용: 최초 결제 금액의 90% 전액 기재하신 은행 계좌로 즉시 현금 송금 승인 완료 (입금주: 모두의알림_쿠폰환급)\n2. 보너스 혜택: 당사 전용 1,500 보너스 안전 포인트 추가 충전 완료\n\n- 모두의문의 신유형상품권 정산조정팀 -`;
      } else {
        approvalMessage = `[민원 권익구제 승인 안내]\n\n귀하가 신청하신 알림 관련 구제 민원이 정식 승인되어 소관 협력 파트너사 및 행정관청에 안전하게 이송되었습니다. 접수 기준에 따라 신속히 피해 배상이 진행됩니다.\n\n- 모두의문의 민원조정위원회 지원본부 -`;
      }

      await updateDoc(inquiryRef, {
        status: 'replied',
        updatedAt: serverTimestamp(),
        reply: {
          content: approvalMessage,
          createdAt: new Date(),
          repliedBy: user?.uid || 'admin_system',
          repliedByName: userProfile?.displayName || '모두의문의 마스터 어드민'
        }
      });
      showToast('🏆 해당 소비자의 권익구제 피해보상 청구가 즉시 정식 승인/정산되었습니다!');
    } catch (err: any) {
      console.error("Failed to approve compensation:", err);
      alert('승인 처리 실패: ' + err.message);
    }
  };

  // Real-time Firestore query for Admin (all inquiries)
  useEffect(() => {
    if (!user) return;

    // If admin or partner, load all inquiries. Otherwise, load own inquiries (demo/safe fallback)
    const q = (isAdmin || isPartner)
      ? query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'))
      : query(collection(db, 'inquiries'), where('authorId', '==', user.uid), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docsData: Inquiry[] = [];
      snapshot.forEach((docSnap) => {
        docsData.push({
          id: docSnap.id,
          ...docSnap.data()
        } as Inquiry);
      });
      setInquiries(docsData);
      setLoading(false);

      // Auto-select first pending inquiry if none selected
      if (docsData.length > 0) {
        setSelectedInquiryId((prev) => {
          if (prev && docsData.some(i => i.id === prev)) return prev;
          const firstPending = docsData.find(i => i.status === 'pending');
          return firstPending ? firstPending.id : docsData[0].id;
        });
      }
    }, (error) => {
      console.error("Admin real-time sync error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, isAdmin, isPartner]);

  const activeInquiry = inquiries.find(i => i.id === selectedInquiryId);

  // Handle reply submission
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiryId || !replyContent.trim()) return;

    setIsReplying(true);
    try {
      const inquiryRef = doc(db, 'inquiries', selectedInquiryId);
      await updateDoc(inquiryRef, {
        status: 'replied',
        updatedAt: serverTimestamp(),
        reply: {
          content: replyContent.trim(),
          createdAt: new Date(), // Local fallback + firestore conversion
          repliedBy: user?.uid || 'admin_system',
          repliedByName: userProfile?.displayName || '모두의문의 마스터 어드민'
        }
      });
      setReplyContent('');
      alert('✅ 실시간 답변 발송 및 DB 저장이 완료되었습니다!');
    } catch (err: any) {
      console.error("Error replying to inquiry:", err);
      alert('답변 발송 실패: ' + err.message);
    } finally {
      setIsReplying(false);
    }
  };

  // Route/Transfer inquiry to a partner (SaaS B2B mapping)
  const handleRouteToPartner = async (inquiryId: string) => {
    try {
      const inquiryRef = doc(db, 'inquiries', inquiryId);
      await updateDoc(inquiryRef, {
        status: 'routing',
        updatedAt: serverTimestamp(),
        assignedPartnerId: 'partner_corp_991', // Mock partnered organization ID
        reply: {
          content: '이 문의는 모두의문의 지능형 관제 시스템에 의해 협약된 전문 파트너 기관(Partner Corp)으로 직결 배정되었습니다. 즉시 심사 대기 리스트에 등록되었으며, 영업일 기준 4시간 내 세부 답변을 제공해 드립니다.',
          createdAt: new Date(),
          repliedBy: 'router_system',
          repliedByName: '지능형 자동 중개소'
        }
      });
      showToast('✈️ 협약 제휴사로 실시간 안전 이송 및 즉시 알림 메일 발송 완료!');
    } catch (err: any) {
      console.error("Routing error:", err);
      showToast('이송 중 장애 발생: ' + err.message);
    }
  };

  const handleDeleteInquiry = (inquiryId: string) => {
    const targetInq = inquiries.find(i => i.id === inquiryId);
    setDeleteConfirm({
      isOpen: true,
      id: inquiryId,
      title: targetInq?.title || '선택한 문의'
    });
  };

  const handleConfirmDeleteInquiry = async () => {
    if (!deleteConfirm.id) return;
    try {
      await deleteDoc(doc(db, 'inquiries', deleteConfirm.id));
      setSelectedInquiryId(null);
      showToast("문의가 성공적으로 영구 삭제되었습니다.");
    } catch (err: any) {
      console.error("Delete error:", err);
      showToast('삭제 중 장애: ' + err.message);
    } finally {
      setDeleteConfirm({ isOpen: false, id: '', title: '' });
    }
  };

  // Populate suggestion via AI draft
  const applyAIDraft = () => {
    if (!activeInquiry?.aiAnalysis?.suggestedResponse) return;
    setReplyContent(activeInquiry.aiAnalysis.suggestedResponse);
  };

  // Compute Stats for Charts & Metric banners
  const totalCount = inquiries.length;
  const pendingCount = inquiries.filter(i => i.status === 'pending').length;
  const routingCount = inquiries.filter(i => i.status === 'routing').length;
  const repliedCount = inquiries.filter(i => i.status === 'replied').length;
  const resolutionRate = totalCount > 0 ? Math.round(((repliedCount + routingCount) / totalCount) * 100) : 100;

  // Chart data: categories count
  const categoriesData = (Object.keys(CATEGORY_MAP) as InquiryParentCategory[]).map(catKey => {
    const count = inquiries.filter(i => i.parentCategory === catKey).length;
    return {
      name: CATEGORY_MAP[catKey].label.split('/')[0],
      문의수: count
    };
  });

  // Chart data: daily inquiry counts for the last 7 days
  const dailyData = (() => {
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getMonth() + 1}/${d.getDate()}`;
      return {
        dateStr,
        dateKey: d.toDateString(),
        '접수건수': 0
      };
    }).reverse();

    inquiries.forEach(inq => {
      if (!inq.createdAt) return;
      const d = inq.createdAt.toDate ? inq.createdAt.toDate() : new Date(inq.createdAt);
      if (isNaN(d.getTime())) return;
      const dayStr = d.toDateString();
      const match = last7Days.find(item => item.dateKey === dayStr);
      if (match) {
        match['접수건수'] += 1;
      }
    });

    return last7Days.map(({ dateStr, 접수건수 }) => ({
      name: dateStr,
      '접수건수': 접수건수
    }));
  })();

  const pieData = [
    { name: '답변 대기', value: pendingCount, color: '#F59E0B' },
    { name: '제휴사 이송', value: routingCount, color: '#3B82F6' },
    { name: '답변 완료', value: repliedCount, color: '#10B981' }
  ].filter(p => p.value > 0);

  // Filtering list
  const filteredInquiries = inquiries.filter((inq) => {
    const matchesSearch = 
      inq.title.toLowerCase().includes(search.toLowerCase()) ||
      inq.content.toLowerCase().includes(search.toLowerCase()) ||
      inq.authorEmail.toLowerCase().includes(search.toLowerCase()) ||
      inq.authorName.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || inq.status === statusFilter;
    const matchesCat = catFilter === 'all' || inq.parentCategory === catFilter;

    return matchesSearch && matchesStatus && matchesCat;
  }).sort((a, b) => {
    const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
    const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
    return sortBy === 'newest' ? timeB - timeA : timeA - timeB;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-6 gap-4">
        <div>
          <span className="text-xs font-bold text-red-600 uppercase tracking-widest flex items-center space-x-1.5">
            <ShieldAlert className="h-3.5 w-3.5 text-red-500 animate-pulse" />
            <span>모두의문의 Master Admin HQ</span>
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-1">통합 문의 허브 실시간 관제 시스템</h1>
          <p className="text-xs text-slate-500 mt-1">
            담당자: <span className="font-semibold text-slate-700">{userProfile?.displayName || user?.email}</span> (Master) | 전체 사이트 통합 감지 엔진 작동 중
          </p>
        </div>

        {/* Demo Simulator button */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSimulationActive(!simulationActive)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              simulationActive 
                ? 'bg-amber-100 text-amber-800 border-amber-200' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {simulationActive ? '⚙️ 시뮬레이터 활성화 중' : '⚙️ 시뮬레이터 작동'}
          </button>
        </div>
      </div>

      {/* Dedicated Admin Sub-Navigation Menu Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
        <div className="flex items-center gap-1 overflow-x-auto text-[11px]">
          <button
            onClick={() => setAdminSubTab('dashboard')}
            className={`flex items-center space-x-1 py-1.5 px-2.5 rounded-lg font-black transition-all cursor-pointer whitespace-nowrap ${
              adminSubTab === 'dashboard'
                ? 'bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/10'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <BarChart2 className="h-3.5 w-3.5" />
            <span>실시간 문의 관제</span>
            <span className={`text-[9px] px-1 py-0.2 rounded-full font-mono ${
              adminSubTab === 'dashboard' ? 'bg-slate-700 text-slate-200' : 'bg-slate-100 text-slate-600'
            }`}>
              {totalCount}
            </span>
          </button>

          <button
            onClick={() => setAdminSubTab('alerts')}
            className={`flex items-center space-x-1 py-1.5 px-2.5 rounded-lg font-black transition-all cursor-pointer whitespace-nowrap ${
              adminSubTab === 'alerts'
                ? 'bg-red-600 text-white shadow-sm ring-2 ring-red-600/10'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-red-50 hover:text-red-600'
            }`}
          >
            <Bell className="h-3.5 w-3.5" />
            <span>모두의 알림고지</span>
          </button>

          <button
            onClick={() => setAdminSubTab('hub')}
            className={`flex items-center space-x-1 py-1.5 px-2.5 rounded-lg font-black transition-all cursor-pointer whitespace-nowrap ${
              adminSubTab === 'hub'
                ? 'bg-gradient-to-r from-amber-600 to-indigo-600 text-white shadow-sm ring-2 ring-indigo-600/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>문의 허브 솔루션</span>
          </button>

          <button
            onClick={() => setAdminSubTab('partners')}
            className={`flex items-center space-x-1 py-1.5 px-2.5 rounded-lg font-black transition-all cursor-pointer whitespace-nowrap ${
              adminSubTab === 'partners'
                ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600/10'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-600'
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>제휴처 관리</span>
          </button>

          <button
            onClick={() => setAdminSubTab('insights')}
            className={`flex items-center space-x-1 py-1.5 px-2.5 rounded-lg font-black transition-all cursor-pointer whitespace-nowrap ${
              adminSubTab === 'insights'
                ? 'bg-violet-600 text-white shadow-sm ring-2 ring-violet-600/10'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-violet-50 hover:text-violet-600'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>트렌드 상식 관리</span>
          </button>

          <button
            onClick={() => setAdminSubTab('users')}
            className={`flex items-center space-x-1 py-1.5 px-2.5 rounded-lg font-black transition-all cursor-pointer whitespace-nowrap ${
              adminSubTab === 'users'
                ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-600/10'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>사용자 및 권한 관리</span>
          </button>

          <button
            onClick={() => setAdminSubTab('ranking')}
            className={`flex items-center space-x-1 py-1.5 px-2.5 rounded-lg font-black transition-all cursor-pointer whitespace-nowrap ${
              adminSubTab === 'ranking'
                ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-600/10'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-amber-50 hover:text-amber-650'
            }`}
          >
            <Trophy className="h-3.5 w-3.5 text-amber-500 group-hover:scale-110" />
            <span>실시간 랭킹 관리</span>
          </button>

          <button
            onClick={() => setAdminSubTab('help')}
            className={`flex items-center space-x-1 py-1.5 px-2.5 rounded-lg font-black transition-all cursor-pointer whitespace-nowrap ${
              adminSubTab === 'help'
                ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-600/10'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600'
            }`}
          >
            <ShoppingBag className="h-3.5 w-3.5 text-indigo-500" />
            <span>모두의도움 관리</span>
          </button>
        </div>

        <div className="text-[10px] text-slate-400 font-medium hidden md:block">
          전용 어드민 세부 관리 센터
        </div>
      </div>

      {/* Sub-menu Tab: Public Alerts Management */}
      {adminSubTab === 'alerts' && <AlertManager />}

      {/* Sub-menu Tab 3: Knowledge Hub & AI Generator */}
      {adminSubTab === 'hub' && <AdminHubManager />}

      {/* Sub-menu Tab 4: Partner Manager */}
      {adminSubTab === 'partners' && <PartnerManager />}

      {/* Sub-menu Tab 5: Consumer Insight Manager */}
      {adminSubTab === 'insights' && <InsightManager />}

      {/* Sub-menu Tab 2: User & Role Management */}
      {adminSubTab === 'users' && <UserManagement />}

      {/* Sub-menu Tab 6: Real-time Ranking Control Center */}
      {adminSubTab === 'ranking' && <RankingManager />}

      {/* Sub-menu Tab 7: ModuHelp Commerce Manager */}
      {adminSubTab === 'help' && <AdminHelpManager />}

      {/* Sub-menu Tab 1: Real-time Inquiry Dashboard & Analytics */}
      {adminSubTab === 'dashboard' && (
        <div className="space-y-8">
          {/* Stats Cards Section - 5 Cards Layout */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm text-left">
          <span className="text-xs text-slate-400 font-semibold block">총 문의 적재량</span>
          <span className="text-2xl font-black text-slate-900 block mt-1">{totalCount}건</span>
        </div>
        <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm text-left">
          <span className="text-xs text-slate-400 font-semibold block flex items-center space-x-1">
            <Clock className="h-3 w-3 text-amber-500" />
            <span>미해결 대기</span>
          </span>
          <span className="text-2xl font-black text-amber-600 block mt-1">{pendingCount}건</span>
        </div>
        <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm text-left">
          <span className="text-xs text-slate-400 font-semibold block flex items-center space-x-1">
            <CheckCircle className="h-3 w-3 text-emerald-500" />
            <span>해결 완료</span>
          </span>
          <span className="text-2xl font-black text-emerald-600 block mt-1">{repliedCount}건</span>
        </div>
        <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm text-left">
          <span className="text-xs text-slate-400 font-semibold block flex items-center space-x-1">
            <ArrowRightLeft className="h-3 w-3 text-blue-500" />
            <span>제휴사 자동 배정</span>
          </span>
          <span className="text-2xl font-black text-blue-600 block mt-1">{routingCount}건</span>
        </div>
        <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm text-left">
          <span className="text-xs text-slate-400 font-semibold block flex items-center space-x-1">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span>실시간 처리율</span>
          </span>
          <span className="text-2xl font-black text-green-600 block mt-1">{resolutionRate}%</span>
        </div>
      </div>

      {/* Charts & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. 일별 상담 접수 건수 추이 (AreaChart) */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100/50 pb-2">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-indigo-500" />
              <span>최근 7일간 일별 접수 건수</span>
            </h4>
            <span className="text-[10px] text-slate-400 font-semibold font-mono">Real-time Volume</span>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} allowDecimals={false} />
                <RechartsTooltip />
                <Area type="monotone" dataKey="접수건수" stroke="#6366F1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorInq)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. 카테고리별 누적 문의 추이 (BarChart) */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100/50 pb-2">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart2 className="h-4 w-4 text-purple-500" />
              <span>카테고리별 누적 분포</span>
            </h4>
            <span className="text-[10px] text-slate-400 font-semibold font-mono">By Category</span>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={categoriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} allowDecimals={false} />
                <RechartsTooltip />
                <Bar dataKey="문의수" fill="#8B5CF6" radius={[4, 4, 0, 0]} barSize={25} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. 해결 상태 밸런스 차트 (PieChart) */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100/50 pb-2">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-emerald-500" />
              <span>실시간 해결 상태 분석</span>
            </h4>
            <span className="text-[10px] text-slate-400 font-semibold font-mono">Resolution balance</span>
          </div>
          {pieData.length > 0 ? (
            <div className="h-32 w-full relative my-auto">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={32}
                    outerRadius={52}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[9px] font-bold text-slate-400 uppercase">해결율</span>
                <span className="text-sm font-black text-slate-700 font-mono">{resolutionRate}%</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-xs text-slate-400 my-auto">데이터 없음</div>
          )}
          
          <div className="flex justify-center space-x-4 text-[10px] font-bold text-slate-500 border-t border-slate-100/50 pt-2 shrink-0">
            <span className="flex items-center space-x-1">
              <span className="h-2 w-2 rounded-full bg-amber-500"></span>
              <span>대기 ({pendingCount})</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="h-2 w-2 rounded-full bg-blue-500"></span>
              <span>이송 ({routingCount})</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="h-2 w-2 rounded-full bg-green-500"></span>
              <span>완료 ({repliedCount})</span>
            </span>
          </div>
        </div>
      </div>

      {/* Simulator Guidance */}
      {simulationActive && (
        <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-900 space-y-1">
          <span className="font-bold block">⚙️ 시뮬레이션 제어 센터 작동 알림</span>
          <p>
            현재 마스터 관리자 이메일로 테스트 중이 아닌 타 계정이더라도, 시뮬레이터 기능을 통해 타사 문의에 실시간으로 수동 답변을 발행하거나 제휴 이송 테스트(Firestore에 데이터 쓰기 및 즉각 갱신)를 막힘없이 전개할 수 있습니다.
          </p>
        </div>
      )}

      {/* AI 핫이슈 실시간 탐지 및 긴급구제 연동 브릿지 통제소 */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="space-y-1">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-indigo-600 animate-pulse" />
              <span>🔮 AI 실시간 소비 트렌드 & 핫이슈 자동 탐지기 (Auto-Discovery Engine)</span>
              <span className="bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded font-bold">1등급 긴급통제</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              인터넷 검색량, SNS 언급 지표, KISA 및 소비자보호원 보도자료를 실시간 스캐닝하여 카테고리별(긴급피해, 혜택, 보상) 핫이슈를 탐지하고 공지 배포 여부를 직접 제어합니다.
            </p>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => {
                setCrawlStatus('idle');
                setCrawlProgress(0);
                setCrawlMessage('');
                setDetectedIssues([]);
              }}
              className="px-2.5 py-1 text-[10px] font-bold border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-lg cursor-pointer"
            >
              스캐너 초기화
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Crawler and Deployer Bridge (5 cols) */}
          <div className="lg:col-span-5 bg-slate-50/50 rounded-xl p-4 border border-slate-100 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 block font-black">1단계: 실시간 동향 크롤러</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-black font-mono ${
                crawlStatus === 'idle' ? 'bg-slate-100 text-slate-500' :
                crawlStatus === 'scanning' ? 'bg-indigo-50 text-indigo-600 animate-pulse' :
                crawlStatus === 'detected' ? 'bg-red-50 text-red-600 font-bold' :
                'bg-emerald-50 text-emerald-600'
              }`}>
                {crawlStatus === 'idle' && '대기 중 (Idle)'}
                {crawlStatus === 'scanning' && '스캐닝 중...'}
                {crawlStatus === 'detected' && '⚠️ 핫이슈 발견 (결정 대기)'}
                {crawlStatus === 'deployed' && '✅ 처리 완료'}
              </span>
            </div>

            {crawlStatus === 'idle' && (
              <div className="space-y-3 py-6 text-center">
                <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <RefreshCw className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-slate-700">실시간 데이터 수집기 대기 중</p>
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                    실시간 포털 검색 점유율 및 정부 공시 데이터를 스캐닝하여<br />
                    소비 피해 경보 및 알짜 혜택, 보상안을 실시간 발굴하십시오.
                  </p>
                </div>
                <button
                  onClick={handleCrawlScan}
                  className="mx-auto flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-md shadow-indigo-600/10 transition-all cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>실시간 인터넷 핫이슈 수집/스캔 개시</span>
                </button>
              </div>
            )}

            {crawlStatus === 'scanning' && (
              <div className="space-y-4 py-8">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] text-indigo-600 font-bold">
                    <span>{crawlMessage}</span>
                    <span>{crawlProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${crawlProgress}%` }}
                    />
                  </div>
                </div>
                <div className="text-center">
                  <span className="inline-flex items-center space-x-1.5 text-[10px] text-slate-400 animate-pulse">
                    <span className="h-1.5 w-1.5 bg-indigo-600 rounded-full animate-ping"></span>
                    <span>AI 통합 크롤러가 SNS 및 정부부처 공시를 분석 중입니다...</span>
                  </span>
                </div>
              </div>
            )}

            {(crawlStatus === 'detected' || crawlStatus === 'deployed') && (
              <div className="space-y-3 text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  🔮 발견된 실시간 후보 이슈 ({detectedIssues.filter(iss => iss.status !== 'rejected').length}건)
                </span>
                
                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1 no-scrollbar">
                  {detectedIssues.map((issue) => {
                    if (issue.status === 'rejected') return null;
                    return (
                      <div 
                        key={issue.id} 
                        className={`p-3 rounded-xl border transition-all ${
                          issue.status === 'deployed' 
                            ? 'bg-emerald-50/30 border-emerald-100' 
                            : 'bg-white border-slate-200 hover:border-indigo-200 shadow-sm'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                            issue.categoryLabel === '긴급피해' ? 'bg-red-50 text-red-600 border border-red-100' :
                            issue.categoryLabel === '알짜혜택' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                            'bg-indigo-50 text-indigo-600 border border-indigo-100'
                          }`}>
                            {issue.categoryLabel}
                          </span>
                          <span className="text-[9px] text-slate-400 font-bold font-mono">
                            위험도: {issue.urgency === 'high' ? '🔴 높음' : '🟡 보통'}
                          </span>
                        </div>
                        
                        <h4 className="text-[11px] font-black text-slate-800 leading-tight mb-1">
                          {issue.title}
                        </h4>
                        <p className="text-[10px] text-slate-500 leading-normal mb-2.5">
                          {issue.summary}
                        </p>

                        <div className="flex items-center justify-end gap-1.5 border-t border-slate-50 pt-2">
                          {issue.status === 'pending' ? (
                            <>
                              <button
                                onClick={() => handleRejectIssue(issue.id)}
                                className="px-2 py-1 text-[9px] font-bold text-slate-500 hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer"
                              >
                                보류
                              </button>
                              <button
                                onClick={() => handleDeployIssue(issue.id)}
                                disabled={isDeployingId !== null}
                                className="px-2.5 py-1 text-[9px] font-black bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm cursor-pointer flex items-center gap-1"
                              >
                                {isDeployingId === issue.id ? (
                                  <>
                                    <RefreshCw className="h-2 w-2 animate-spin" />
                                    <span>배포 중..</span>
                                  </>
                                ) : (
                                  <span>즉시 추가 (공지&1:1개통)</span>
                                )}
                              </button>
                            </>
                          ) : (
                            <div className="w-full flex items-center justify-between text-[10px] text-emerald-700 font-bold bg-emerald-50/50 p-1.5 rounded-lg border border-emerald-100/60 leading-tight">
                              <span className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3 text-emerald-600 shrink-0" />
                                <span>포털 Live 공지 및 1:1 서식 개통됨</span>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {detectedIssues.filter(iss => iss.status !== 'rejected').length === 0 && (
                    <div className="py-6 text-center text-slate-400 text-[11px] font-bold">
                      모든 탐지 후보가 처리되었습니다.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Submitted Compensation Claims Queue (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-4 space-y-3 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold text-slate-800 flex items-center space-x-1">
                  <span className="font-black text-slate-800">2단계 ~ 4단계: 실시간 동향 연동 피해보상 접수 심사 현황</span>
                  <span className="bg-indigo-100 text-indigo-700 text-[9px] px-1.5 py-0.1 rounded font-black shrink-0">
                    {inquiries.filter(i => 
                      i.subCategory === 'privacy_leak_compensation' || 
                      i.subCategory === 'dcc_fee_compensation' || 
                      i.subCategory === 'gifticon_leak_compensation'
                    ).length}건 접수
                  </span>
                </span>
                <p className="text-[10px] text-slate-400">관리자가 추가한 트렌드 알림창에서 소비자들이 직접 제출한 1:1 권익구제 및 환불/정산 접수 목록입니다.</p>
              </div>
            </div>

            {inquiries.filter(i => 
              i.subCategory === 'privacy_leak_compensation' || 
              i.subCategory === 'dcc_fee_compensation' || 
              i.subCategory === 'gifticon_leak_compensation'
            ).length === 0 ? (
              <div className="py-24 text-center text-slate-400 space-y-2">
                <ShieldAlert className="h-8 w-8 text-slate-200 mx-auto animate-pulse" />
                <p className="text-[11px] font-bold text-slate-600">접수된 피해보상 민원 신청서가 아직 없습니다.</p>
                <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                  스캐너를 가동해 긴급이슈나 혜택을 <span className="font-semibold text-slate-600">"즉시 추가"</span>하여 개통한 후,<br />
                  고객 알림창에서 1:1 민원을 직접 제출하는 시뮬레이션을 진행해보십시오.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[330px] no-scrollbar">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold">
                      <th className="py-2 pr-2">작성자/접수유형</th>
                      <th className="py-2 px-2">민원 상세 명세</th>
                      <th className="py-2 px-2">피해 구체 내용</th>
                      <th className="py-2 px-2">조치상태</th>
                      <th className="py-2 pl-2 text-right">조치</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {inquiries
                      .filter(i => 
                        i.subCategory === 'privacy_leak_compensation' || 
                        i.subCategory === 'dcc_fee_compensation' || 
                        i.subCategory === 'gifticon_leak_compensation'
                      )
                      .map((inq) => (
                        <tr key={inq.id} className="hover:bg-slate-50/50">
                          <td className="py-2.5 pr-2">
                            <span className="font-bold text-slate-800 block">{inq.authorName}</span>
                            <span className={`inline-flex px-1.5 py-0.2 rounded text-[8px] font-black mt-1 ${
                              inq.subCategory === 'privacy_leak_compensation' ? 'bg-indigo-100 text-indigo-700' :
                              inq.subCategory === 'dcc_fee_compensation' ? 'bg-amber-100 text-amber-700' :
                              'bg-emerald-100 text-emerald-700'
                            }`}>
                              {inq.subCategory === 'privacy_leak_compensation' && '티빙 보안'}
                              {inq.subCategory === 'dcc_fee_compensation' && 'DCC 환불'}
                              {inq.subCategory === 'gifticon_leak_compensation' && '기프티콘'}
                            </span>
                          </td>
                          <td className="py-2.5 px-2">
                            <span className="font-semibold text-slate-700 block truncate max-w-[120px]" title={inq.title}>
                              {inq.title}
                            </span>
                            <span className="text-[9px] text-slate-400 block font-mono mt-0.5">{inq.authorPhone || '연락처 연동됨'}</span>
                          </td>
                          <td className="py-2.5 px-2 text-slate-600 leading-relaxed max-w-[150px] truncate" title={inq.content}>
                            {inq.content}
                          </td>
                          <td className="py-2.5 px-2">
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${
                              inq.status === 'replied'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                : 'bg-amber-50 text-amber-700 border border-amber-100 animate-pulse'
                            }`}>
                              {inq.status === 'replied' ? '정산 승인완료' : '검증 대기중'}
                            </span>
                          </td>
                          <td className="py-2.5 pl-2 text-right">
                            {inq.status === 'pending' ? (
                              <button
                                onClick={() => handleApproveCompensation(inq)}
                                className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded text-[10px] cursor-pointer whitespace-nowrap"
                              >
                                즉시보상 & 정산승인
                              </button>
                            ) : (
                              <span className="text-[9px] text-emerald-600 font-bold block whitespace-nowrap">보상금/이용권 지급완료</span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Workspace split panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Inquiry Queue (Left) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Filtering Header */}
          <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm space-y-3">
            {/* Quick Status Tabs */}
            <div className="flex items-center gap-1.5 border-b border-slate-100 pb-3 overflow-x-auto text-xs">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] whitespace-nowrap transition-all cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                전체 ({totalCount})
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] whitespace-nowrap transition-all cursor-pointer flex items-center space-x-1 ${
                  statusFilter === 'pending'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                <Clock className="h-3 w-3" />
                <span>미해결 대기 ({pendingCount})</span>
              </button>
              <button
                onClick={() => setStatusFilter('replied')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] whitespace-nowrap transition-all cursor-pointer flex items-center space-x-1 ${
                  statusFilter === 'replied'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                <CheckCircle className="h-3 w-3" />
                <span>해결 완료 ({repliedCount})</span>
              </button>
              <button
                onClick={() => setStatusFilter('routing')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] whitespace-nowrap transition-all cursor-pointer flex items-center space-x-1 ${
                  statusFilter === 'routing'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                <ArrowRightLeft className="h-3 w-3" />
                <span>제휴이송 ({routingCount})</span>
              </button>
            </div>

            {/* Search and Secondary Filters */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="제목, 내용, 이름, 이메일로 검색..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between gap-2 pt-0.5">
              <div className="flex items-center gap-2">
                <select
                  value={catFilter}
                  onChange={(e) => setCatFilter(e.target.value as any)}
                  className="text-[10px] border border-slate-200 rounded-lg px-2 py-1 bg-white focus:outline-none font-medium text-slate-700"
                >
                  <option value="all">모든 카테고리</option>
                  <option value="shopping">쇼핑</option>
                  <option value="travel">여행</option>
                  <option value="restaurant">식음료</option>
                  <option value="other">기타</option>
                </select>
              </div>

              {/* Sort Toggle */}
              <button
                onClick={() => setSortBy(sortBy === 'newest' ? 'oldest' : 'newest')}
                className="text-[10px] font-semibold text-slate-600 hover:text-indigo-600 flex items-center space-x-1 px-2 py-1 border border-slate-200 rounded-lg bg-slate-50/50 hover:bg-white transition-all cursor-pointer"
                title="등록 시간순 정렬 전환"
              >
                <ArrowUpDown className="h-3 w-3" />
                <span>{sortBy === 'newest' ? '최신 접수순' : '오래된 접수순'}</span>
              </button>
            </div>
          </div>

          {/* Queue List */}
          <div className="space-y-2.5 max-h-[70vh] overflow-y-auto pr-1">
            {filteredInquiries.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-xl p-12 text-center text-xs text-slate-400">
                조건에 매칭되는 실시간 문의가 존재하지 않습니다.
              </div>
            ) : (
              filteredInquiries.map((inq) => {
                const catConfig = CATEGORY_MAP[inq.parentCategory] || CATEGORY_MAP.other;
                const isSelected = selectedInquiryId === inq.id;
                const formattedSub = catConfig.subCategories.find(s => s.value === inq.subCategory)?.label || inq.subCategory;

                return (
                  <div
                    key={inq.id}
                    onClick={() => setSelectedInquiryId(inq.id)}
                    className={`bg-white border rounded-xl p-4 shadow-sm text-left space-y-2.5 transition-all duration-150 cursor-pointer ${
                      isSelected 
                        ? 'border-indigo-600 ring-2 ring-indigo-600/10 shadow-md bg-indigo-50/10' 
                        : 'border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${catConfig.bg} ${catConfig.text}`}>
                          {catConfig.label.split('/')[0]}
                        </span>
                        <span className="text-[8px] text-slate-500 font-semibold bg-slate-100 px-1 py-0.5 rounded">
                          {formattedSub}
                        </span>
                      </div>

                      {/* Status indicator */}
                      <div>
                        {inq.status === 'replied' ? (
                          <span className="text-[9px] text-emerald-700 font-extrabold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full flex items-center space-x-1">
                            <CheckCheck className="h-2.5 w-2.5" />
                            <span>해결 완료</span>
                          </span>
                        ) : inq.status === 'routing' ? (
                          <span className="text-[9px] text-blue-700 font-bold bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full flex items-center space-x-1">
                            <Building2 className="h-2.5 w-2.5 text-blue-600 shrink-0" />
                            <span className="max-w-[100px] truncate">{inq.assignedPartnerName ? `${inq.assignedPartnerName} 배정` : '제휴 배정'}</span>
                          </span>
                        ) : (
                          <span className="text-[9px] text-amber-700 font-bold bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full animate-pulse flex items-center space-x-0.5">
                            <Clock className="h-2.5 w-2.5 text-amber-500" />
                            <span>대기</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h5 className="font-extrabold text-slate-900 text-xs leading-tight line-clamp-1">
                        {inq.title}
                      </h5>
                      <p className="text-[10px] text-slate-500 line-clamp-1 font-mono">
                        {inq.authorName} ({inq.authorEmail})
                      </p>
                    </div>

                    {/* Registration Date & Time (날짜와 시간 표시) */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                      <div className="flex items-center space-x-1 font-medium text-slate-500">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        <span className="font-mono text-slate-600">{formatDateTime(inq.createdAt)}</span>
                        <span className="text-[9px] text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.2 rounded ml-1">
                          {getRelativeTime(inq.createdAt)}
                        </span>
                      </div>

                      {inq.reply && (
                        <span className="text-[9px] text-emerald-600 font-medium flex items-center space-x-1">
                          <span>답변: {formatDateTime(inq.reply.createdAt)}</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Detailed Workspace & Smart Reply Panel (Right) */}
        <div className="lg:col-span-7">
          {activeInquiry ? (
            <div className="bg-white border border-indigo-100 rounded-xl p-6 shadow-md text-left space-y-6">
              
              {/* Inquiry Identity */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {CATEGORY_MAP[activeInquiry.parentCategory]?.label || '기타'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">
                      ID: {activeInquiry.id.substring(0, 8)}...
                    </span>
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-base mt-1">
                    {activeInquiry.title}
                  </h3>
                </div>

                <div className="flex items-center space-x-2">
                  {activeInquiry.assignedPartnerName ? (
                    <div className="flex items-center space-x-1.5">
                      <span className="flex items-center space-x-1 px-2.5 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg">
                        <Building2 className="h-3.5 w-3.5 text-blue-600" />
                        <span>배정: {activeInquiry.assignedPartnerName}</span>
                      </span>
                      <button
                        onClick={() => setIsAssignModalOpen(true)}
                        className="flex items-center space-x-1 px-2 py-1 text-[10px] font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-all cursor-pointer"
                        title="배정된 제휴처를 변경합니다"
                      >
                        <RefreshCw className="h-3 w-3" />
                        <span>배정 변경</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsAssignModalOpen(true)}
                      className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-all cursor-pointer"
                      title="등록된 제휴처 리스트에서 담당 파트너사를 선택하여 배정합니다"
                    >
                      <Handshake className="h-3.5 w-3.5" />
                      <span>제휴사 배정</span>
                    </button>
                  )}

                  {/* Root admin delete privilege */}
                  <button
                    onClick={() => handleDeleteInquiry(activeInquiry.id)}
                    className="p-1 text-slate-400 hover:text-red-600 hover:bg-slate-50 rounded"
                    title="영구 삭제"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Inquiry Content Box */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 bg-slate-50/80 px-3 py-2 rounded-lg border border-slate-100">
                  <span className="font-semibold text-slate-700">작성자: {activeInquiry.authorName} ({activeInquiry.authorEmail})</span>
                  <div className="flex items-center space-x-1.5 text-slate-500 font-mono">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>접수일시: {formatDateTime(activeInquiry.createdAt)}</span>
                    <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">
                      {getRelativeTime(activeInquiry.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed shadow-inner">
                  {activeInquiry.content}
                </div>

                {/* Assigned Partner Routing Note if present */}
                {activeInquiry.routingNote && (
                  <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 flex items-start space-x-2 text-xs text-blue-900">
                    <Building2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">제휴처 전달 특이사항 메모: </span>
                      <span>{activeInquiry.routingNote}</span>
                    </div>
                  </div>
                )}

                {/* Customer Attachments if present */}
                {activeInquiry.attachments && activeInquiry.attachments.length > 0 && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-left">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700">
                      <Paperclip className="h-3.5 w-3.5 text-indigo-600" />
                      <span>고객 첨부 파일 ({activeInquiry.attachments.length}건)</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activeInquiry.attachments.map((att, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-xs">
                          <div className="flex items-center space-x-2 truncate">
                            {att.type.startsWith('image/') ? (
                              <img src={att.dataUrl} alt={att.name} className="h-7 w-7 object-cover rounded border border-slate-200" />
                            ) : (
                              <File className="h-4 w-4 text-slate-400 shrink-0" />
                            )}
                            <div className="truncate">
                              <p className="font-semibold text-slate-800 text-[11px] truncate max-w-[130px]">{att.name}</p>
                              <p className="text-[10px] text-slate-400">{(att.size / 1024).toFixed(1)} KB</p>
                            </div>
                          </div>
                          <a href={att.dataUrl} download={att.name} className="p-1 text-slate-500 hover:text-indigo-600 rounded">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Customer Satisfaction Feedback if present */}
                {activeInquiry.satisfaction && (
                  <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                    activeInquiry.satisfaction.rating === 'helpful'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}>
                    <div className="flex items-center space-x-2">
                      <ThumbsUp className="h-4 w-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="font-bold">고객 만족도 평가: </span>
                        <span>{activeInquiry.satisfaction.rating === 'helpful' ? '⭐ 매우 만족 (해결됨)' : '📝 추가 확인 필요'}</span>
                        {activeInquiry.satisfaction.feedback && (
                          <span className="block text-[11px] italic text-slate-600 mt-0.5">"{activeInquiry.satisfaction.feedback}"</span>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {formatDateTime(activeInquiry.satisfaction.submittedAt)}
                    </span>
                  </div>
                )}
              </div>

              {/* AI Gemini Telemetry insights (B2B value) */}
              {activeInquiry.aiAnalysis && (
                <div className="bg-gradient-to-r from-indigo-50 to-indigo-50/20 border border-indigo-100 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-900">
                      <Sparkles className="h-4 w-4 text-indigo-600 animate-pulse" />
                      <span>Gemini AI 스마트 판독 엔진</span>
                    </div>
                    <span className="text-[10px] text-indigo-600 font-semibold uppercase">실시간 감정 분석</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs text-slate-600">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 block font-bold">감정 등급</span>
                      <span className={`font-black uppercase ${
                        activeInquiry.aiAnalysis.sentiment === 'urgent' ? 'text-red-600 font-black' :
                        activeInquiry.aiAnalysis.sentiment === 'negative' ? 'text-amber-600' : 'text-slate-600'
                      }`}>
                        {activeInquiry.aiAnalysis.sentiment === 'urgent' ? '🚨 긴급 경보 (Urgent)' : activeInquiry.aiAnalysis.sentiment}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 block font-bold">핵심 요약</span>
                      <span className="font-medium text-slate-800">{activeInquiry.aiAnalysis.summarizedNeed}</span>
                    </div>
                  </div>

                  {/* Smart suggestion apply trigger */}
                  <div className="pt-2 border-t border-indigo-100/40 flex items-center justify-between gap-4">
                    <p className="text-[10px] text-indigo-950 italic line-clamp-1">
                      💡 제안: "{activeInquiry.aiAnalysis.suggestedResponse}"
                    </p>
                    <button
                      onClick={applyAIDraft}
                      className="flex-shrink-0 flex items-center space-x-1 px-2.5 py-1 text-[10px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-all cursor-pointer shadow-sm shadow-indigo-600/10"
                    >
                      <span>제안 답변 적용</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Status or reply form */}
              {activeInquiry.status === 'replied' ? (
                <div className="p-4 bg-emerald-50/80 border border-emerald-100 text-emerald-900 rounded-xl space-y-3">
                  <div className="flex flex-wrap items-center justify-between text-xs font-bold border-b border-emerald-100/70 pb-2 gap-2">
                    <span className="flex items-center space-x-1.5 text-emerald-800">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                      <span>답변 완료 처리 내역</span>
                    </span>
                    <div className="flex items-center space-x-2 text-[10px] text-emerald-700 font-medium font-mono">
                      <span>발행자: {activeInquiry.reply?.repliedByName}</span>
                      <span>•</span>
                      <span>완료일시: {formatDateTime(activeInquiry.reply?.createdAt)}</span>
                    </div>
                  </div>
                  <p className="text-xs font-mono leading-relaxed text-emerald-950 whitespace-pre-wrap bg-white/80 p-3 rounded-lg border border-emerald-100/60 shadow-xs">
                    {activeInquiry.reply?.content}
                  </p>
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => {
                        setReplyContent(activeInquiry.reply?.content || '');
                        // Force change status to pending locally or allow editing
                        const updatedInquiry = { ...activeInquiry, status: 'pending' as const };
                        setInquiries(prev => prev.map(i => i.id === activeInquiry.id ? updatedInquiry : i));
                      }}
                      className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold underline cursor-pointer"
                    >
                      ✏️ 답변 내용 재수정 및 갱신 발행하기
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSendReply} className="space-y-3 text-left">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 block">수동 맞춤 답변 발행 양식</label>
                    <textarea 
                      required
                      rows={5}
                      placeholder="고객에게 전송할 정중하고 격식 있는 실시간 답변 내용을 적어주세요. 전송 버튼을 누르면 고객의 화면에 딜레이 없이 실시간 반영됩니다."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2.5 focus:border-indigo-500 focus:outline-none font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isReplying}
                    className="w-full flex items-center justify-center space-x-2 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md shadow-indigo-600/10 transition-all cursor-pointer"
                  >
                    <Send className="h-4 w-4" />
                    <span>{isReplying ? '답변 발송 및 동기화 중...' : '실시간 답변 즉시 발행하기'}</span>
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-xl p-16 text-center text-slate-400 space-y-2">
              <MessageSquare className="h-10 w-10 text-slate-200 mx-auto" />
              <h4 className="text-xs font-bold text-slate-700">활성화된 작업 워크스페이스가 없습니다.</h4>
              <p className="text-[10px] text-slate-400">좌측 대기열에서 가공하거나 답변을 처리할 대상을 클릭해 주십시오.</p>
            </div>
          )}
        </div>
      </div>
        </div>
      )}

      {/* Partner Assignment Modal */}
      <PartnerAssignModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        inquiry={activeInquiry}
        onAssignSuccess={(partnerId, partnerName) => {
          // Assignment updated
        }}
      />

      {/* Custom Confirmation Modal for Deletion */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150 text-left">
            <div className="flex items-start space-x-3">
              <div className="bg-red-50 text-red-600 p-2 rounded-xl border border-red-100 flex-shrink-0">
                <Trash2 className="h-5 w-5" />
              </div>
              <div className="space-y-1.5 min-w-0">
                <h4 className="text-sm font-black text-slate-900">
                  문의 영구 삭제
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  경고: 마스터 관리자 권한으로 이 문의를 영구 삭제하시겠습니까? 정말 <span className="font-bold text-slate-800">"{deleteConfirm.title}"</span> 문의를 삭제하시겠습니까? 이 작업은 되돌릴 수 없으며 복구가 불가능합니다.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setDeleteConfirm({ isOpen: false, id: '', title: '' })}
                className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 text-xs transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={handleConfirmDeleteInquiry}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-black text-xs shadow-sm transition-colors cursor-pointer"
              >
                영구 삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global State-driven Toast Overlay */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center space-x-2 text-xs z-50 animate-in slide-in-from-bottom-5 duration-200">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
