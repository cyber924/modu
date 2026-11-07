import React, { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp, 
  query, 
  orderBy, 
  writeBatch 
} from 'firebase/firestore';
import { db } from '../firebase';
import { 
  Sparkles, 
  Plus, 
  RefreshCw, 
  Trash2, 
  CheckCircle, 
  Eye, 
  Search, 
  AlertCircle, 
  ArrowRight, 
  FileText, 
  Scale, 
  ShieldCheck, 
  Zap, 
  Clock, 
  Sliders, 
  HelpCircle, 
  ExternalLink,
  ChevronRight,
  Database,
  Layers,
  Flame,
  CheckCheck,
  Building2,
  Utensils,
  Plane,
  CreditCard,
  X,
  Upload,
  FileDown,
  FileSpreadsheet
} from 'lucide-react';
import { HUB_INQUIRIES, HUB_CATEGORIES, HubInquiryItem, HubCategory } from '../data/inquiryHubData';
import { HubInquiryDoc, HubUnansweredQueryLog } from '../types';

export const AdminHubManager: React.FC = () => {
  const [dbInquiries, setDbInquiries] = useState<HubInquiryDoc[]>([]);
  const [unansweredLogs, setUnansweredLogs] = useState<HubUnansweredQueryLog[]>([]);
  const [loading, setLoading] = useState(true);

  // AI Generator state
  const [generateCategory, setGenerateCategory] = useState<string>('legal');
  const [generateCount, setGenerateCount] = useState<number>(5);
  const [customTopic, setCustomTopic] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<string>('');

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Table filter state
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [selectedPreview, setSelectedPreview] = useState<HubInquiryDoc | null>(null);

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

  // Pristine Korean consumer dispute scenarios for CSV download
  const basicSampleRows = [
    {
      category: "shopping",
      categoryLabel: "쇼핑/배송",
      subCategory: "전자상거래/환불",
      title: "반품 처리가 완료된 수입 전자제품의 배송비 차감 분쟁 해결책",
      questionScenario: "네이버 스마트스토어에서 해외 직구 80만원 상당의 오디오 앰프를 주문하여 수령했습니다. 박스를 전혀 개봉하지 않고 배송 완료 후 3일 차에 단순 변심으로 인한 반품 신청을 제기하였으나, 판매처는 '해외 물류비' 명목으로 편도 15만원(왕복 30만원)의 과도한 배송비 청구를 하며 정당한 환불을 거부하고 있습니다. 이에 대한 대처 프로세스는 무엇인가요?",
      summary: "전자상거래법 제18조 제9항에 근거하여 반품비용은 원칙적으로 실제 배송에 소요된 비용을 초과할 수 없습니다. 해외 운임 송장 및 객관적 청구 서류가 소명되지 않는 비합리적 정액 배송비 청구는 거부할 수 있으며, 한국소비자원 피해구제 절차를 통해 전액 정산받을 수 있습니다.",
      step1_title: "배송비 상세 소명 요청",
      step1_desc: "판매처에 메일 또는 톡톡 메신저를 통해 반품 배송비 30만 원에 대한 세부 명세서(해외 특송 요금 청구서, 영수증 등) 및 객관적 증빙 서류 제출을 공식 요구합니다.",
      step2_title: "전자상거래약관 위반 통지",
      step2_desc: "사전 고지되지 않았거나 실비 증빙이 부재한 고액 위약금성 배송비 청구는 위법함을 알리고, 결제 대행사(PG사)에 배송 완료 증명과 함께 '결제 대금 보류 서비스(에스크로)' 적용을 신청합니다.",
      step3_title: "소비자보호원 피해구제 신청",
      step3_desc: "해외구매대행 불공정 거래 피해 양식에 근거하여 한국소비자원에 피해구제 접수를 제기하고, 중재위원회 권고안에 따라 배송비 실비 차감 후 환불 처리를 종결합니다.",
      checklist: "반품 접수 캡처본|해외 물류비 명세 및 사전 고지 캡처본|상품 미개봉 상태 증빙 사진",
      proTip: "해외 구매대행이라도 소비자의 '단순 변심 반품권'은 전자상거래법에 의해 7일 이내 보장됩니다! 판매자가 임의로 지정한 정액 반품비는 '실제 증빙 요금'이 아닐 경우 전액 거부 가능합니다.",
      tags: "해외직구, 반품배송비, 청약철회, 전자상거래법",
      requiredDocs: "구매 영수증, 판매자 채팅 내역, 미개봉 증명 사진"
    },
    {
      category: "legal",
      categoryLabel: "법률/생활",
      subCategory: "주택임대차",
      title: "월세 계약 후 입주 첫날 누수 및 난방기기 고장에 따른 임대인 책임 요구",
      questionScenario: "보증금 1천만 원, 월세 65만 원의 신축 빌라를 임차하여 오늘 입주했습니다. 그러나 입주와 동시에 화장실 천장에서 지속적인 누수가 발견되었으며, 보일러 역시 정상적으로 작동하지 않아 온수 이용이 전면 차단된 상태입니다. 집주인은 세입자가 살면서 고쳐 써야 한다고 수리를 거부하고 있습니다.",
      summary: "민법 제623조에 의하여 임대인은 임대차 계약 존속 중 그 사용, 수익에 필요한 상태를 유지할 의무를 부담합니다. 일상적인 소모품 수선이 아닌 구조적 누수 및 핵심 설비인 난방 보일러 고장 수리는 전적으로 임대인의 부담이며, 불이행 시 손해배상 청구 및 계약 해지가 가능합니다.",
      step1_title: "하자 현황 채증 및 통지",
      step1_desc: "화장실 천장의 누수 상황과 보일러 온수 에러 코드를 동영상으로 촬영하여 임대인에게 메시지로 즉시 공유하고 내용증명을 보냅니다.",
      step2_title: "견적서 발송 및 최고 기한 지정",
      step2_desc: "전문 수리 업체의 견적서를 확보하여 임대인에게 송부한 뒤, '3일 이내 수리 시작 및 조치가 없을 시 직접 수선 후 월세에서 차감 공제함'을 통지합니다.",
      step3_title: "임대차분쟁조정위원회 접수",
      step3_desc: "합의 불발 시 주택임대차분쟁조정위원회에 중재 신청을 접수하며, 상황에 따라 임차 목적 미달성을 원인으로 전세 계약 즉시 해지 및 보증금 반환 소송을 청구합니다.",
      checklist: "누수 발생 일시 기록|수리 견적서 및 영수증|임대인과의 메시지 기록 전문",
      proTip: "대규모 수선(누수, 보일러, 배관 공사 등)은 세입자의 과실이 없는 한 100% 임대인 책임입니다! 지체될 경우 즉시 임시 거처(모텔 등) 숙박 영수증과 보일러 고장 피해 비용 청구가 가능합니다.",
      tags: "누수하자, 보일러고장, 임대인의무, 민법623조, 분쟁조정",
      requiredDocs: "임대차 계약서, 하자 채증 영상, 수리 수선 견적서"
    },
    {
      category: "leisure",
      categoryLabel: "여가/티켓",
      subCategory: "항공권취소",
      title: "출발 전 천재지변(태풍/폭설)으로 인한 항공권 취소 위약금 면제 가이드",
      questionScenario: "제주도행 왕복 항공권(4인 가족, 총 60만 원)을 예약하고 출발 전날 공항으로 가려 했으나, 기상청의 강력한 태풍 경보로 비행기 전 편이 무더기 결항되었습니다. 항공사는 예약 취소를 요구하는 고객에게 특가 항공권이라는 명목으로 인당 10만 원씩 총 40만 원의 과도한 취소 위약금을 청구하고 있어 억울합니다.",
      summary: "소비자분쟁해결기준(공정거래위원회 고시) 및 항공사 표준약관상 천재지변, 기상악화 등의 불가항력적인 원인으로 인한 항공기 결항 시에는 위약금 없이 전액 환불하는 것이 의무화되어 있습니다.",
      step1_title: "결항 증명원 발급 요청",
      step1_desc: "해당 항공사 혹은 공항 공사 웹사이트를 통해 본인이 예약한 편명의 '항공기 결항 결정 증명원' 또는 관련 공식 안내 문자를 캡처하여 확보합니다.",
      step2_title: "항공사 특별 면제 부서 이의 신청",
      step2_desc: "결항 증명과 결제 영수증을 첨부하여 단순 자진 취소가 아닌 '불가항력 결항에 따른 취소 신청서'를 고객센터 및 이메일로 발급 접수합니다.",
      step3_title: "소비자원 구제 및 이행 청구",
      step3_desc: "특가표라는 면책 조항을 들며 환불을 지연 및 거부할 경우, 소비자 24 포털을 통해 불공정 거래 행위 위반으로 제소하여 공식 중재 절차를 완료합니다.",
      checklist: "항공편 결항 증명원|취소 위약금 사전 영수증|결제 승인 카드 명세서",
      proTip: "특가 상품, 얼리버드 티켓이라도 국가적 재난이나 기상 악화 결항 시에는 '위약금 부과 불가'가 대원칙입니다. 항공사 예약 취소 전에 자진 취소를 유도하는 낚시성 전화에 주의하세요!",
      tags: "항공결항, 기상악화, 취소수수료, 특가항공권, 환불의무",
      requiredDocs: "결항증명서, 항공권 예약 정보, 이의제기 접수증"
    },
    {
      category: "dining",
      categoryLabel: "외식/다이닝",
      subCategory: "예약보증금",
      title: "식당 노쇼(No-Show) 방지 예약 보증금의 당일 취소 시 정당한 환불 기준",
      questionScenario: "미슐랭 가이드 식당에 4인 예약을 진행하며 노쇼 방지 보증금으로 인당 5만 원씩 총 20만 원을 선결제했습니다. 그러나 예약 당일 갑작스러운 교통사고로 인해 예약 시간 2시간 전에 부득이하게 취소를 통지하게 되었습니다. 식당은 당일 취소는 표준 약관에 상관없이 보증금 20만 원 전액이 소멸된다며 한 푼도 돌려줄 수 없다고 완강하게 거부 중입니다.",
      summary: "공정위 고시 외식업종 소비자분쟁해결기준에 따르면 예약시간 기준 1시간 전 이전에 예약을 취소한 경우 보증금 전액을 환불해 주어야 하며, 1시간 미만 시점에 취소한 경우에만 보증금을 예약금 위약으로 귀속 시킬 수 있습니다.",
      step1_title: "사고 증빙 및 공식 취소 의사 통지",
      step1_desc: "취소 사유(예: 응급실 진료 영수증, 교통사고 접수증 등 불가피한 사건)와 취소 요청 일시가 명확히 기록된 텍스트 메시지 및 이메일을 식당 매니저에게 정식 접수합니다.",
      step2_title: "공정위 외식업 소비자분쟁해결기준 고지",
      step2_desc: "식당 자체의 불법적인 전액 몰수 약관은 공정거래위원회 '외식업 소비자분쟁해결기준'에 위배되는 무효한 조항임을 알리고, 합리적 정산을 강력히 요청합니다.",
      step3_title: "결제 취소 보류 신청 및 소관 제소",
      step3_desc: "카드 결제나 네이버 페이 등의 스마트 결제 채널을 통해 불공정 약관 몰수 행위로 결제 대금 이의신청(민원 접수)을 제기하여 안전하게 환불 정산 처리를 이행 받습니다.",
      checklist: "당일 예약 취소 통지 일시 캡처|응급 상황 증빙 서류|식당 자체 규정 안내 화면 캡처",
      proTip: "식당의 자체 '당일 전액 소멸' 조항은 약관규제법 제6조에 해당하여 고객에게 부당하게 불리한 불공정 조항으로 법적 무효입니다! 당당히 환불 요구 권리를 피력하세요.",
      tags: "식당노쇼, 예약금환불, 외식업약관, 공정거래위원회, 부당이득반환",
      requiredDocs: "취소 내역 캡처, 보증금 결제 영수증, 피치못할 사유 소명 서류"
    },
    {
      category: "general",
      categoryLabel: "일반/계정",
      subCategory: "정기결제",
      title: "SaaS 및 OTT 자동 연장 정기 결제의 미사용 기간 즉시 해지 및 환불",
      questionScenario: "인공지능 이미지 생성 정기 멤버십 서비스에 연간 24만 원 결제 설정을 해두었습니다. 자동 갱신 알림이 사전에 오지 않았고, 주말에 자고 일어나니 '다음 년도 이용요금 24만원'이 자동 승인 카드에서 승인되었습니다. 승인 후 단 1회도 플랫폼에 접속하지 않고 로그인 기록이 없는 상태인데, '이미 연간 연장 처리가 완료되어 해지 및 전액 환불이 절대 불가하다'고 답변을 받았습니다.",
      summary: "콘텐츠산업진흥법 및 소비자분쟁해결기준에 따르면, 정기 자동 결제 갱신 후 서비스를 실제 이용하지 않고 7일 이내에 계약 해지를 요청하는 경우 수수료 없이 결제 금액 전체를 전액 반환 및 청약 철회하여야 합니다.",
      step1_title: "로그인 및 다운로드 미사용 보존",
      step1_desc: "자동 연장 결제 이후 서비스 대시보드나 리소스 서버를 일체 터치하지 마시고, 깨끗한 로그 상태를 그대로 유지합니다.",
      step2_title: "전자 청약 철회 요구서 작성 송부",
      step2_desc: "계약 체결 및 결제 사실을 인지한 후 7일 이내에 청약철회를 제기함을 명확히 명시하고, 미사용 접속 기록 증명서 확보 및 청약철회 의사를 서면 발송합니다.",
      step3_title: "소비자단체 및 구제 접수",
      step3_desc: "미국 등 해외 플랫폼의 경우, 결제한 카드사 혹은 페이팔의 '미승인 및 미사용 서비스 분쟁 해결(Chargeback)' 절차를 이용하면 빠르게 자동 전액 강제 강제 환불 처리가 완료됩니다.",
      checklist: "정기결제 승인 통지 메일|이용 기록 일체 전무 캡처|이의 제기 이메일 발송 내역",
      proTip: "대부분의 현대 IT 서비스 및 멤버십은 결제 후 '단 1초의 이용 기록도 없다면' 전자상거래법의 청약철회 7일 적용을 받아 무조건 환불해 주는 것이 국내법상 강제 조항입니다!",
      tags: "구독형멤버십, 자동정기결제, 청약철회, 미사용환불, 카드사차지백",
      requiredDocs: "카드 승인 문자, 청약철회 요구 서류, 미접속 증빙 사진"
    },
    {
      category: "other",
      categoryLabel: "기타/B2B",
      subCategory: "용역외주",
      title: "IT 외주/개발 프로젝트 중도 타절에 따른 공정한 기성고 산정 및 정산 가이드",
      questionScenario: "앱 개발 스타트업으로서 중소기업의 마케팅 홈페이지 개발 용역(계약 금액 3,000만 원, 계약금 1,000만 원 선지급)을 착수하여 화면 설계와 UI/UX 프로토타입 개발을 80% 이상 끝마쳤습니다. 그런데 돌연 발주사가 자신들의 경영 사정 악화로 프로젝트 중도 해지(타절)를 구두 통보하면서 이미 지급한 계약금 1,000만 원까지 전액 반환하라는 과도한 무리수를 두고 있어 생계 위기입니다.",
      summary: "민법 제673조(도급인의 해제권)에 따라 발주자는 수급인이 일을 완성하기 전에는 손해를 배상하고 언제든지 계약을 해제할 수 있으나, 계약 해제 시까지 이미 완료된 영역에 대한 공정 기성 비율(기성고)에 상응하는 용역비와 잔여 손실을 전부 보전해 주어야 합니다.",
      step1_title: "현재까지의 산출물 동결 및 보고서 확정",
      step1_desc: "수행한 Figma 디자인, 요구사항 명세서, 소스코드 저장소의 최종 커밋 일시를 고정하고, 문서화된 '단계별 기성 산출물 증명 보고서'를 생성합니다.",
      step2_title: "공식 계약 타절에 따른 정산 내용증명 통지",
      step2_desc: "계약서 조항 및 관련 법률에 의거하여, 기 기성율 65%에 따른 총비용 1,950만 원 중 선지급금 1,000만 원을 차감한 잔여 대금 950만 원의 추가 정산 및 청구 소송 전단계 내용증명을 보냅니다.",
      step3_title: "대한상사중재원 또는 기술분쟁조정위원회 접수",
      step3_desc: "대기업 및 발주처의 대금 체불 행위 및 불공정 하도급 위반 사항으로 중소벤처기업부 기술분쟁조정이나 공정거래조정원에 구제 신청을 진행하여 합의 조정을 완결합니다.",
      checklist: "외주 용역 계약서 전문|현재까지의 작업 진척 소스코드 스크린샷|발주사의 일방 타절 메시지 증거",
      proTip: "외주 개발 시 기성고 정산은 '내가 일한 날짜'가 아닌 '계약상 정의된 최종 완료 결과 대비 산출물의 객관적 공정 가치'로 책정되므로 피그마, 기획안 등의 증명서 보존이 절대적으로 필수입니다!",
      tags: "용역계약타절, 외주정산, 기성고비율, 손해배상청구, 대한상사중재",
      requiredDocs: "도급계약서, 산출물 전달 증빙 메일, 대금 청구 상세 내역"
    }
  ];

  // Bulk Upload State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [validationPreview, setValidationPreview] = useState<any[]>([]);
  const [dupStrategy, setDupStrategy] = useState<'skip' | 'overwrite' | 'force'>('skip');
  const [aiAutofill, setAiAutofill] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadTotal, setUploadTotal] = useState(0);

  // Download standard Excel-compatible UTF-8 BOM CSV with 6 category examples
  const handleDownloadBasicSample = () => {
    const headers = [
      "category",
      "categoryLabel",
      "subCategory",
      "title",
      "questionScenario",
      "summary",
      "step1_title",
      "step1_desc",
      "step2_title",
      "step2_desc",
      "step3_title",
      "step3_desc",
      "checklist",
      "proTip",
      "tags",
      "requiredDocs"
    ];

    const escapeCSV = (str: string) => {
      if (!str) return '""';
      const escaped = str.replace(/"/g, '""');
      return `"${escaped}"`;
    };

    const csvContent = basicSampleRows.map(row => {
      return [
        escapeCSV(row.category),
        escapeCSV(row.categoryLabel),
        escapeCSV(row.subCategory),
        escapeCSV(row.title),
        escapeCSV(row.questionScenario),
        escapeCSV(row.summary),
        escapeCSV(row.step1_title),
        escapeCSV(row.step1_desc),
        escapeCSV(row.step2_title),
        escapeCSV(row.step2_desc),
        escapeCSV(row.step3_title),
        escapeCSV(row.step3_desc),
        escapeCSV(row.checklist),
        escapeCSV(row.proTip),
        escapeCSV(row.tags),
        escapeCSV(row.requiredDocs)
      ].join(",");
    });

    const finalString = [headers.join(","), ...csvContent].join("\n");
    // Prefix with UTF-8 BOM to prevent Korean character corruption in Excel
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), finalString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "modu_hub_sample_basic.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("🛍️ 6대 분야 모범 사례가 채워진 CSV 샘플을 다운로드했습니다.");
  };

  // Download blank CSV layout for easy batch typing
  const handleDownloadBlankTemplate = () => {
    const headers = [
      "category",
      "categoryLabel",
      "subCategory",
      "title",
      "questionScenario",
      "summary",
      "step1_title",
      "step1_desc",
      "step2_title",
      "step2_desc",
      "step3_title",
      "step3_desc",
      "checklist",
      "proTip",
      "tags",
      "requiredDocs"
    ];

    const blankRows = [
      [
        "legal",
        "법률/생활",
        "주택임대차",
        "여기에 20~45자 내외의 분쟁 문제 상황 제목을 기재하십시오 (예: 임대인의 수선 의무 지체)",
        "실제로 소비자가 겪는 자세하고 생생한 구체적인 분쟁 시나리오 사실관계를 1~2문단 이상 작성하세요.",
        "법적 효력이 있는 공정위 규정이나 민법 조항을 명시한 정교하고 직관적인 해결책 한줄 요약을 작성해 주세요.",
        "1단계 행동 지침 제목",
        "준비하고 보존해야 할 계약서 등 증거 자료 확보 지침 상세를 작성하세요.",
        "2단계 행동 지침 제목",
        "전문 제휴사 직결 전송, 내용증명 서면 통보, 공식 소관부서 분쟁조정 대처 요령을 작성하세요.",
        "3단계 행동 지침 제목",
        "한국소비자원, 중소벤처기업부 조정위원회 등 최종 보상 판결 및 피해보상 중재 절차 종결 방법을 작성하세요.",
        "수집해야 할 주의물건1|필수 영수증2 (파이프 기호 '|' 로 각 체크리스트 항목을 구분하여 기재)",
        "상대방을 정중하고 똑똑하게 압박하거나 신속한 합의를 이끌어내는 전문가만의 실전 Pro-Tip을 쓰세요.",
        "태그1, 태그2, 태그3 (쉼표로 구분)",
        "계약서, 결제 영수증, 대화 캡처 등 필요 서류 리스트 (쉼표로 구분)"
      ]
    ];

    const escapeCSV = (str: string) => {
      if (!str) return '""';
      const escaped = str.replace(/"/g, '""');
      return `"${escaped}"`;
    };

    const csvContent = blankRows.map(row => row.map(escapeCSV).join(","));
    const finalString = [headers.join(","), ...csvContent].join("\n");
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), finalString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "modu_hub_blank_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("✍️ 즉시 기재하여 대량 업로드할 수 있는 공란 CSV 양식을 다운로드했습니다.");
  };

  // State-machine CSV parser that perfectly handles quoted multiline values
  const parseCSV = (text: string): string[][] => {
    const result: string[][] = [];
    let row: string[] = [];
    let currentVal = '';
    let inQuotes = false;
    
    // Normalize line endings to LF
    const cleanText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    for (let i = 0; i < cleanText.length; i++) {
      const char = cleanText[i];
      const nextChar = cleanText[i + 1];
      
      if (inQuotes) {
        if (char === '"') {
          if (nextChar === '"') {
            currentVal += '"';
            i++; 
          } else {
            inQuotes = false;
          }
        } else {
          currentVal += char;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
        } else if (char === ',') {
          row.push(currentVal);
          currentVal = '';
        } else if (char === '\n') {
          row.push(currentVal);
          result.push(row);
          row = [];
          currentVal = '';
        } else {
          currentVal += char;
        }
      }
    }
    if (currentVal || row.length > 0) {
      row.push(currentVal);
      result.push(row);
    }
    return result;
  };

  // Handle local CSV file selection and map into validation state
  const handleCSVFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawText = event.target?.result as string;
      if (!rawText) return;

      try {
        const rawGrid = parseCSV(rawText);
        if (rawGrid.length < 2) {
          showToast("오류: 업로드된 CSV 파일에 유효한 레코드가 없습니다.");
          return;
        }

        // Parse header and map columns
        const headers = rawGrid[0].map(h => h.trim().toLowerCase());
        const mappedRows = rawGrid.slice(1).filter(r => r.length > 0 && r.some(cell => cell.trim())).map((row, index) => {
          const getVal = (colName: string) => {
            const idx = headers.indexOf(colName.toLowerCase());
            return idx !== -1 && row[idx] ? row[idx].trim() : '';
          };

          const rawCategory = getVal('category') || 'legal';
          const title = getVal('title') || '';
          const questionScenario = getVal('questionScenario') || '';
          const summary = getVal('summary') || '';
          const step1Title = getVal('step1_title') || '';
          const step1Desc = getVal('step1_desc') || '';
          const step2Title = getVal('step2_title') || '';
          const step2Desc = getVal('step2_desc') || '';
          const step3Title = getVal('step3_title') || '';
          const step3Desc = getVal('step3_desc') || '';
          const checklistRaw = getVal('checklist') || '';
          const proTip = getVal('proTip') || '';
          const tagsRaw = getVal('tags') || '';
          const docsRaw = getVal('requiredDocs') || '';

          // Basic validation checks
          const errors: string[] = [];
          if (!title) errors.push("제목(title) 누락");
          if (title.length < 5) errors.push("제목 글자 수 부족 (5자 이상 필요)");
          if (!['legal', 'shopping', 'leisure', 'dining', 'general', 'other'].includes(rawCategory)) {
            errors.push(`허용되지 않는 카테고리: ${rawCategory}`);
          }

          const hasSolution = summary && step1Title && step1Desc;
          const isAIRequired = !hasSolution && aiAutofill;

          return {
            id: `bulk_${Date.now()}_${index}_${Math.random().toString(36).slice(2, 5)}`,
            category: rawCategory,
            categoryLabel: getVal('categoryLabel') || '전문 가이드',
            subCategory: getVal('subCategory') || '대량업로드',
            title,
            questionScenario,
            summary,
            step1Title,
            step1Desc,
            step2Title,
            step2Desc,
            step3Title,
            step3Desc,
            checklist: checklistRaw,
            proTip,
            tags: tagsRaw,
            requiredDocs: docsRaw,
            isValid: errors.length === 0,
            errors,
            isAIRequired
          };
        });

        setValidationPreview(mappedRows);
        showToast(`📊 CSV 파싱 완료! 총 ${mappedRows.length}개의 리코드가 검증 테이블에 로드되었습니다.`);
      } catch (err: any) {
        showToast(`파일 분석 실패: ${err.message}`);
      }
    };
    reader.readAsText(file, "UTF-8");
  };

  // Perform massive batch write to Firebase (and call AI expansion if triggered)
  const handleRunBulkImport = async () => {
    if (validationPreview.length === 0) {
      showToast("업로드할 유효한 리코드가 없습니다.");
      return;
    }

    const validRows = validationPreview.filter(r => r.isValid);
    if (validRows.length === 0) {
      showToast("가공 오류가 있어 업로드를 진행할 수 없습니다. 데이터를 수정하세요.");
      return;
    }

    setIsUploading(true);
    setUploadTotal(validRows.length);
    setUploadProgress(0);

    const existingTitlesSet = new Set(allMergedList.map(item => item.title));

    try {
      let successCount = 0;
      let skipCount = 0;

      for (let i = 0; i < validRows.length; i++) {
        const row = validRows[i];

        // Deduplication Check
        if (dupStrategy === 'skip' && existingTitlesSet.has(row.title)) {
          skipCount++;
          setUploadProgress(i + 1);
          continue;
        }

        let finalPayload = { ...row };

        // AI Autofill Trigger
        if (row.isAIRequired) {
          try {
            const aiRes = await fetch("/api/hub/expand-item", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                category: row.category,
                title: row.title,
                questionScenario: row.questionScenario
              })
            });
            if (aiRes.ok) {
              const aiData = await aiRes.json();
              finalPayload.summary = aiData.summary || '';
              finalPayload.step1Title = aiData.steps?.[0]?.title || '1단계';
              finalPayload.step1Desc = aiData.steps?.[0]?.desc || '';
              finalPayload.step2Title = aiData.steps?.[1]?.title || '2단계';
              finalPayload.step2Desc = aiData.steps?.[1]?.desc || '';
              finalPayload.step3Title = aiData.steps?.[2]?.title || '3단계';
              finalPayload.step3Desc = aiData.steps?.[2]?.desc || '';
              finalPayload.checklist = Array.isArray(aiData.checklist) ? aiData.checklist.join('\n') : '';
              finalPayload.proTip = aiData.proTip || '';
              if (aiData.tags && Array.isArray(aiData.tags)) {
                finalPayload.tags = aiData.tags.join(', ');
              }
              if (aiData.requiredDocs && Array.isArray(aiData.requiredDocs)) {
                finalPayload.requiredDocs = aiData.requiredDocs.join(', ');
              }
            }
          } catch (aiErr) {
            console.error("Row expansion failed:", aiErr);
          }
        }

        // Construct final document structure
        const steps = [];
        if (finalPayload.step1Title) steps.push({ stepNumber: 1, title: finalPayload.step1Title, desc: finalPayload.step1Desc });
        if (finalPayload.step2Title) steps.push({ stepNumber: 2, title: finalPayload.step2Title, desc: finalPayload.step2Desc });
        if (finalPayload.step3Title) steps.push({ stepNumber: 3, title: finalPayload.step3Title, desc: finalPayload.step3Desc });

        const checklistArr = typeof finalPayload.checklist === 'string' && finalPayload.checklist
          ? finalPayload.checklist.split(/[\|\n]/).map((s: string) => s.trim()).filter(Boolean)
          : [];

        const tagsArr = typeof finalPayload.tags === 'string' && finalPayload.tags
          ? finalPayload.tags.split(',').map((s: string) => s.trim().startsWith('#') ? s.trim() : `#${s.trim()}`).filter(Boolean)
          : ['#대량등록'];

        const docsArr = typeof finalPayload.requiredDocs === 'string' && finalPayload.requiredDocs
          ? finalPayload.requiredDocs.split(',').map((s: string) => s.trim()).filter(Boolean)
          : [];

        const newId = `hub_bulk_${Date.now()}_${i}`;
        const docRef = doc(db, 'hub_inquiries', newId);

        await setDoc(docRef, {
          id: newId,
          category: finalPayload.category,
          categoryLabel: finalPayload.categoryLabel,
          iconName: 'Layers',
          subCategory: finalPayload.subCategory,
          rankBadge: row.isAIRequired ? 'AI 정밀 수립' : 'CSV 공식 수입',
          resolutionRate: 98.9,
          avgResolutionTime: '즉시 가이드',
          title: finalPayload.title,
          questionScenario: finalPayload.questionScenario,
          officialAnswer: {
            summary: finalPayload.summary,
            steps,
            checklist: checklistArr,
            proTip: finalPayload.proTip
          },
          tags: tagsArr,
          requiredDocs: docsArr,
          directInquiryPrefill: {
            parentCategory: finalPayload.category,
            subCategory: 'general',
            title: `[피해구제] ${finalPayload.title}`,
            contentTemplate: '세부 사실관계를 입력해 주세요.'
          },
          status: 'published',
          isAIGenerated: row.isAIRequired,
          viewCount: Math.floor(Math.random() * 40) + 5,
          helpfulCount: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        successCount++;
        setUploadProgress(i + 1);
      }

      setIsBulkModalOpen(false);
      setValidationPreview([]);
      showToast(`🎉 대량 등록 일괄 처리가 무사히 끝났습니다! (성공: ${successCount}건, 중복 건너뜀: ${skipCount}건)`);
    } catch (err: any) {
      showToast(`일괄 등록 도중 장애가 발생했습니다: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Manual Add Modal State
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualForm, setManualForm] = useState({
    title: '',
    category: 'legal' as HubCategory,
    categoryLabel: '법률/생활',
    subCategory: '',
    questionScenario: '',
    summary: '',
    step1Title: '',
    step1Desc: '',
    step2Title: '',
    step2Desc: '',
    step3Title: '',
    step3Desc: '',
    checklist: '',
    proTip: '',
    tags: '',
    requiredDocs: ''
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Real-time Firestore Listeners
  useEffect(() => {
    setLoading(true);
    // 1. Hub Inquiries collection listener
    const q = query(collection(db, 'hub_inquiries'));
    const unsubscribeHub = onSnapshot(q, (snapshot) => {
      const items: HubInquiryDoc[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      setDbInquiries(items);
      setLoading(false);
    }, (err) => {
      console.error("Firestore Hub Inquiries error:", err);
      setLoading(false);
    });

    // 2. Unanswered queries telemetry listener
    const qUnanswered = query(collection(db, 'hub_unanswered_logs'));
    const unsubscribeLogs = onSnapshot(qUnanswered, (snapshot) => {
      const logs: HubUnansweredQueryLog[] = [];
      snapshot.forEach((docSnap) => {
        logs.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      logs.sort((a, b) => (b.count || 0) - (a.count || 0));
      setUnansweredLogs(logs);
    }, (err) => {
      console.warn("Unanswered logs fetch warning (may be empty initially):", err);
    });

    return () => {
      unsubscribeHub();
      unsubscribeLogs();
    };
  }, []);

  // Compute all titles across both Master static items and DB items to enforce strict negative prompting (0% duplicate)
  const allExistingTitles = Array.from(new Set([
    ...HUB_INQUIRIES.map(i => i.title),
    ...dbInquiries.map(i => i.title)
  ]));

  // Total unique knowledge base count
  const allUniqueIds = new Set([...HUB_INQUIRIES.map(i => i.id), ...dbInquiries.map(i => i.id)]);
  const totalLiveKnowledgeCount = allUniqueIds.size;

  // 1. Automatic Background Seeding of Master 50
  useEffect(() => {
    if (loading) return;

    const existingDbIds = new Set(dbInquiries.map(d => d.id));
    const missingItems = HUB_INQUIRIES.filter(item => !existingDbIds.has(item.id));

    if (missingItems.length > 0) {
      const seedMissing = async () => {
        try {
          for (const masterItem of missingItems) {
            const docRef = doc(db, 'hub_inquiries', masterItem.id);
            await setDoc(docRef, {
              ...masterItem,
              status: 'published',
              isAIGenerated: false,
              viewCount: Math.floor(Math.random() * 200) + 120,
              helpfulCount: Math.floor(Math.random() * 80) + 40,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
          }
          console.log(`Auto-seeded ${missingItems.length} missing Master items successfully!`);
        } catch (err) {
          console.error("Auto-seeding Master 50 items error:", err);
        }
      };
      seedMissing();
    }
  }, [loading, dbInquiries]);

  // 2. Continuous AI Generator Handler (with batching for 10 items)
  const handleGenerateAI = async (forcedTopic?: string) => {
    if (isGenerating) return;
    setIsGenerating(true);
    const activeTopic = forcedTopic || customTopic;

    try {
      const runBatch = async (batchCount: number, batchIndex: number) => {
        setGenerationProgress(`AI 심층 분석 및 법령 검토 중 (${batchIndex}차 ${batchCount}개 생성)...`);
        
        const response = await fetch('/api/hub/generate-batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category: generateCategory,
            count: batchCount,
            existingTitles: allExistingTitles,
            customTopicPrompt: activeTopic
          })
        });

        if (!response.ok) {
          throw new Error(`AI 서버 응답 오류 (${response.status})`);
        }

        const data = await response.json();
        return data.items || [];
      };

      let generatedList: any[] = [];

      if (generateCount === 10) {
        // Run 2 batches of 5 items sequentially to prevent token truncation and latency timeouts
        const batch1 = await runBatch(5, 1);
        setGenerationProgress('1차 배치 완료, 2차 배치 연속 생성 중 (5개)...');
        const batch2 = await runBatch(5, 2);
        generatedList = [...batch1, ...batch2];
      } else {
        generatedList = await runBatch(generateCount, 1);
      }

      setGenerationProgress(`생성된 ${generatedList.length}건을 Firestore DB에 안전하게 적재 중...`);

      // Save each to Firestore
      for (const item of generatedList) {
        const docRef = doc(db, 'hub_inquiries', item.id);
        await setDoc(docRef, {
          ...item,
          status: 'published',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      // If triggered from an unanswered log, mark it resolved
      if (forcedTopic) {
        const matchedLog = unansweredLogs.find(l => l.query === forcedTopic);
        if (matchedLog) {
          await updateDoc(doc(db, 'hub_unanswered_logs', matchedLog.id), {
            resolved: true
          });
        }
      }

      setCustomTopic('');
      showToast(`대박 성공! AI가 엄선한 신규 분쟁 솔루션 ${generatedList.length}건이 DB에 등록되었습니다.`);
    } catch (err: any) {
      console.error("AI Generation error:", err);
      showToast(`AI 생성 오류: ${err.message}`);
    } finally {
      setIsGenerating(false);
      setGenerationProgress('');
    }
  };

  // 3. Toggle Status (published vs draft)
  const handleToggleStatus = async (item: HubInquiryDoc) => {
    try {
      const nextStatus = item.status === 'published' ? 'draft' : 'published';
      await updateDoc(doc(db, 'hub_inquiries', item.id), {
        status: nextStatus,
        updatedAt: serverTimestamp()
      });
      showToast(`상태 변경 완료: [${nextStatus === 'published' ? '공개 노출' : '비공개 초안'}]`);
    } catch (err: any) {
      showToast(`변경 실패: ${err.message}`);
    }
  };

  // 4. Delete item (Trigger confirmation modal)
  const handleDeleteItem = (id: string, title: string) => {
    setDeleteConfirm({
      isOpen: true,
      id,
      title
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      await deleteDoc(doc(db, 'hub_inquiries', deleteConfirm.id));
      showToast("솔루션이 성공적으로 삭제되었습니다.");
    } catch (err: any) {
      showToast(`삭제 실패: ${err.message}`);
    } finally {
      setDeleteConfirm({ isOpen: false, id: '', title: '' });
    }
  };

  // 5. Manual creation submission
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.title.trim() || !manualForm.questionScenario.trim() || !manualForm.summary.trim()) {
      showToast("제목, 시나리오, 요약은 필수 입력값입니다.");
      return;
    }

    try {
      const newId = `hub_manual_${Date.now()}`;
      const docRef = doc(db, 'hub_inquiries', newId);

      const steps = [];
      if (manualForm.step1Title) steps.push({ stepNumber: 1, title: manualForm.step1Title, desc: manualForm.step1Desc });
      if (manualForm.step2Title) steps.push({ stepNumber: 2, title: manualForm.step2Title, desc: manualForm.step2Desc });
      if (manualForm.step3Title) steps.push({ stepNumber: 3, title: manualForm.step3Title, desc: manualForm.step3Desc });

      const checklistArr = manualForm.checklist ? manualForm.checklist.split('\n').filter(s => s.trim()) : [];
      const tagsArr = manualForm.tags ? manualForm.tags.split(',').map(s => s.trim().startsWith('#') ? s.trim() : `#${s.trim()}`).filter(Boolean) : ['#직접등록'];
      const docsArr = manualForm.requiredDocs ? manualForm.requiredDocs.split(',').map(s => s.trim()).filter(Boolean) : [];

      await setDoc(docRef, {
        id: newId,
        category: manualForm.category,
        categoryLabel: manualForm.categoryLabel,
        iconName: 'FileText',
        subCategory: manualForm.subCategory || '일반',
        rankBadge: '관리자 공인 솔루션',
        resolutionRate: 99.5,
        avgResolutionTime: '즉시 가이드',
        title: manualForm.title,
        questionScenario: manualForm.questionScenario,
        officialAnswer: {
          summary: manualForm.summary,
          steps,
          checklist: checklistArr,
          proTip: manualForm.proTip
        },
        tags: tagsArr,
        requiredDocs: docsArr,
        directInquiryPrefill: {
          parentCategory: 'other',
          subCategory: 'general',
          title: `[문의] ${manualForm.title}`,
          contentTemplate: '세부 사실관계를 기재해 주세요.'
        },
        status: 'published',
        isAIGenerated: false,
        viewCount: 1,
        helpfulCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setIsManualModalOpen(false);
      setManualForm({
        title: '',
        category: 'legal',
        categoryLabel: '법률/생활',
        subCategory: '',
        questionScenario: '',
        summary: '',
        step1Title: '',
        step1Desc: '',
        step2Title: '',
        step2Desc: '',
        step3Title: '',
        step3Desc: '',
        checklist: '',
        proTip: '',
        tags: '',
        requiredDocs: ''
      });
      showToast("새 공식 문의 솔루션이 등록되었습니다.");
    } catch (err: any) {
      showToast(`등록 실패: ${err.message}`);
    }
  };

  // Combine DB items + initial 50 items for table display if not yet synced, or prioritize DB docs
  const mergedInquiriesMap = new Map<string, HubInquiryDoc>();
  // 1. Initial 50
  HUB_INQUIRIES.forEach(item => {
    mergedInquiriesMap.set(item.id, {
      ...item,
      status: 'published',
      isAIGenerated: false
    });
  });
  // 2. Firestore DB items override
  dbInquiries.forEach(item => {
    mergedInquiriesMap.set(item.id, item);
  });
  const allMergedList = Array.from(mergedInquiriesMap.values());

  // Filtered List
  const filteredList = allMergedList.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.questionScenario.toLowerCase().includes(search.toLowerCase()) ||
      item.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    
    const matchesCat = catFilter === 'all' || item.category === catFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

    return matchesSearch && matchesCat && matchesStatus;
  });

  return (
    <div className="space-y-8 text-left">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-3 text-xs font-bold border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <Zap className="h-4 w-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Overview Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm text-white">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-[11px] font-black uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
              <span>모두의문의 지속적 AI 지식 자동 축적 엔진</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              1,000개+ 마스터 CS/분쟁 솔루션 실시간 확장 관리소
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Gemini AI를 활용하여 대한민국 표준 소비자 분쟁, 전자상거래법, 하도급, 생활 법률 지식을 버튼 한 번으로 대량 생성하고 영구 DB에 실시간 축적합니다. 중복 방지 알고리즘이 완벽히 가동됩니다.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 text-center">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">라이브 총 지식</span>
              <span className="text-xl font-black text-amber-300">{totalLiveKnowledgeCount}건</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 text-center">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Firestore DB 동기화</span>
              <span className="text-xl font-black text-sky-300">{dbInquiries.length}건</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: Continuous AI Generation Station */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                <Flame className="h-4 w-4" />
              </div>
              <h3 className="text-base font-black text-slate-900">AI 신규 문의 솔루션 자동 생성 엔진</h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                중복 0% 방어 작동 중 (기존 {allExistingTitles.length}건 대조)
              </span>
            </div>
            <p className="text-xs text-slate-500">
              분야를 선택하고 생성 수량을 지정하면, AI가 기존에 없던 새롭고 정교한 분쟁/CS 시나리오와 공식 약관 근거 3단계 해결책을 자동 생성합니다.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            {/* 1. 수동 직접 작성 */}
            <button
              onClick={() => setIsManualModalOpen(true)}
              className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>수동 직접 작성</span>
            </button>

            {/* 2. 대량 등록 */}
            <button
              onClick={() => setIsBulkModalOpen(true)}
              className="flex items-center space-x-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-sm"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>솔루션 대량 등록</span>
            </button>

            {/* 3. 기본 샘플 다운로드 */}
            <button
              onClick={handleDownloadBasicSample}
              className="flex items-center space-x-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap animate-pulse"
              title="6대 분야 명품 예제가 포함된 완성형 CSV 파일 다운로드"
            >
              <FileDown className="h-3.5 w-3.5" />
              <span>기본 샘플 받기</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* Category selection */}
          <div className="md:col-span-4 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">생성 희망 분야</label>
            <select
              value={generateCategory}
              onChange={(e) => setGenerateCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="legal">⚖️ 법률/생활/소비자 권익 (추천)</option>
              <option value="shopping">🛍️ 쇼핑/배송/전자상거래 결제</option>
              <option value="leisure">✈️ 여가/티켓/항공권/숙소</option>
              <option value="dining">🍽️ 외식/다이닝/노쇼/예약</option>
              <option value="general">⚙️ 일반/계정/개인정보/보안</option>
              <option value="other">🤝 기타/B2B/업무제휴/외주계약</option>
              <option value="all">🌐 전 분야 균등 엄선 생성</option>
            </select>
          </div>

          {/* Quantity selector */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">1회 생성 수량</label>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
              {[3, 5, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setGenerateCount(num)}
                  className={`py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                    generateCount === num
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {num}개 {num === 5 && '🌟'}
                </button>
              ))}
            </div>
          </div>

          {/* Optional specific topic prompt */}
          <div className="md:col-span-5 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              특정 분쟁 주제 키워드 <span className="text-slate-400 font-normal">(선택 사항)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="예: 맹견 입마개 사고, 배달앱 이물질 환불 거부, 원룸 누수 수리비"
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={() => handleGenerateAI()}
                disabled={isGenerating}
                className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white text-xs font-black px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer whitespace-nowrap"
              >
                <Sparkles className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>{isGenerating ? 'AI 생성 중...' : `AI 솔루션 ${generateCount}개 자동 생성`}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Progress Indicator */}
        {isGenerating && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-center space-x-3 animate-pulse">
            <RefreshCw className="h-5 w-5 text-indigo-600 animate-spin" />
            <div className="space-y-0.5">
              <span className="text-xs font-black text-indigo-900">지능형 지식 축적 엔진 가동 중</span>
              <p className="text-[11px] text-indigo-700">{generationProgress}</p>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: Visitor Unanswered Search Radar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-red-50 text-red-600 rounded-lg">
              <AlertCircle className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">
                방문자 미해결 검색어 실시간 레이더 (Unanswered Search Radar)
              </h3>
              <p className="text-xs text-slate-500">
                사용자가 문의 허브에서 검색했으나 결과가 0건이었던 질문들입니다. 클릭 한 번으로 해당 질문에 딱 맞는 정답 솔루션을 AI로 즉각 생성합니다.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-slate-400">
            미해결 키워드: {unansweredLogs.filter(l => !l.resolved).length}건
          </span>
        </div>

        {unansweredLogs.filter(l => !l.resolved).length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            🎉 현재 미해결된 유저 검색어가 없습니다. 허브의 지식 커버리지가 매우 높습니다!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {unansweredLogs.filter(l => !l.resolved).slice(0, 6).map((log) => (
              <div 
                key={log.id} 
                className="border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-indigo-300 p-3.5 rounded-xl transition-all flex items-center justify-between gap-3 group"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-red-100 text-red-700 font-black">
                      {log.count || 1}회 검색
                    </span>
                    <span className="text-xs font-bold text-slate-800 truncate block">
                      "{log.query}"
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleGenerateAI(log.query)}
                  disabled={isGenerating}
                  className="flex items-center space-x-1 text-[11px] font-black text-indigo-600 bg-indigo-50 group-hover:bg-indigo-600 group-hover:text-white px-2.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>맞춤 생성</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 3: Master Knowledge Hub Explorer & Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-black text-slate-900">
              전체 문의 솔루션 통합 라이브러리 ({filteredList.length}건)
            </h3>
            <p className="text-xs text-slate-500">
              현재 포털에 라이브 서비스 중인 모든 마스터 및 AI 솔루션 항목입니다.
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="제목, 시나리오, 태그 검색..."
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Category filter */}
            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700"
            >
              <option value="all">전체 분야</option>
              <option value="legal">⚖️ 법률/생활</option>
              <option value="shopping">🛍️ 쇼핑/배송</option>
              <option value="leisure">✈️ 여가/티켓</option>
              <option value="dining">🍽️ 외식/다이닝</option>
              <option value="general">⚙️ 일반/계정</option>
              <option value="other">🤝 기타/B2B</option>
            </select>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700"
            >
              <option value="all">전체 상태</option>
              <option value="published">공개 (Published)</option>
              <option value="draft">초안 (Draft)</option>
            </select>
          </div>
        </div>

        {/* Knowledge Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold">
                <th className="py-3 px-4">분야</th>
                <th className="py-3 px-4">문제 상황 및 질문 제목</th>
                <th className="py-3 px-4">생성 출처</th>
                <th className="py-3 px-4">해결률 / 조회</th>
                <th className="py-3 px-4">상태</th>
                <th className="py-3 px-4 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    일치하는 문의 솔루션 데이터가 없습니다.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`text-[11px] font-black px-2 py-0.5 rounded-md border ${
                        item.category === 'legal' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        item.category === 'shopping' ? 'bg-pink-50 text-pink-700 border-pink-200' :
                        item.category === 'leisure' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        item.category === 'dining' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                        item.category === 'other' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                        'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {item.categoryLabel || item.category}
                      </span>
                    </td>

                    <td className="py-3 px-4 max-w-md">
                      <div 
                        onClick={() => setSelectedPreview(item)}
                        className="cursor-pointer group"
                      >
                        <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                          {item.title}
                        </span>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {item.questionScenario}
                        </p>
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      {item.isAIGenerated ? (
                        <span className="inline-flex items-center space-x-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                          <Sparkles className="h-3 w-3 text-amber-500" />
                          <span>AI 자동 축적</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          <ShieldCheck className="h-3 w-3 text-emerald-600" />
                          <span>공식 마스터 50선</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-black text-emerald-600">
                          {item.resolutionRate || 99.1}%
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          조회 {item.viewCount || 0}회
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(item)}
                        className={`text-[10px] font-black px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          item.status === 'published'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {item.status === 'published' ? '🟢 공개 라이브' : '⚪ 비공개 초안'}
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap space-x-2">
                      <button
                        onClick={() => setSelectedPreview(item)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        title="솔루션 카드 미리보기"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id, item.title)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="솔루션 삭제"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Detail Preview Modal */}
      {selectedPreview && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <span className="text-[11px] font-black text-indigo-600 uppercase tracking-wide">
                  [{selectedPreview.categoryLabel}] {selectedPreview.subCategory}
                </span>
                <h3 className="text-lg font-black text-slate-900 leading-snug">
                  {selectedPreview.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPreview(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl space-y-1 border border-slate-200/70">
                <span className="font-bold text-slate-700 block">고객 고충 상황 시나리오:</span>
                <p className="text-slate-600 leading-relaxed">{selectedPreview.questionScenario}</p>
              </div>

              <div className="bg-emerald-50/60 border border-emerald-200/70 p-4 rounded-xl space-y-1">
                <span className="font-black text-emerald-900 block">공식 법령/약관 해결 요약:</span>
                <p className="text-emerald-800 leading-relaxed font-medium">
                  {selectedPreview.officialAnswer?.summary}
                </p>
              </div>

              {/* Steps */}
              {selectedPreview.officialAnswer?.steps && selectedPreview.officialAnswer.steps.length > 0 && (
                <div className="space-y-2">
                  <span className="font-bold text-slate-800 block">단계별 실천 프로세스:</span>
                  <div className="space-y-2">
                    {selectedPreview.officialAnswer.steps.map((st) => (
                      <div key={st.stepNumber} className="border border-slate-200 p-3 rounded-xl bg-white space-y-1">
                        <span className="font-black text-indigo-600">Step {st.stepNumber}. {st.title}</span>
                        <p className="text-slate-600">{st.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Checklist & Pro Tip */}
              {selectedPreview.officialAnswer?.proTip && (
                <div className="bg-amber-50/70 border border-amber-200 p-3.5 rounded-xl space-y-1">
                  <span className="font-bold text-amber-900 block">💡 전문가 Pro-Tip:</span>
                  <p className="text-amber-800">{selectedPreview.officialAnswer.proTip}</p>
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                {selectedPreview.tags?.map((t, i) => (
                  <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-mono text-[10px]">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 flex justify-end">
              <button
                onClick={() => setSelectedPreview(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Manual Direct Submission Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl border border-slate-100 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900">새 문의 솔루션 수동 등록</h3>
                <p className="text-xs text-slate-500">관리자가 직접 정답 가이드를 작성하여 허브에 게시합니다.</p>
              </div>
              <button onClick={() => setIsManualModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">분야</label>
                  <select
                    value={manualForm.category}
                    onChange={(e) => {
                      const cat = e.target.value as HubCategory;
                      const catConfig = HUB_CATEGORIES.find(c => c.id === cat);
                      setManualForm({
                        ...manualForm,
                        category: cat,
                        categoryLabel: catConfig?.label || cat
                      });
                    }}
                    className="w-full border border-slate-200 rounded-xl p-2 bg-slate-50 text-xs font-bold"
                  >
                    {HUB_CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">세부 분류</label>
                  <input
                    type="text"
                    value={manualForm.subCategory}
                    onChange={(e) => setManualForm({ ...manualForm, subCategory: e.target.value })}
                    placeholder="예: 임대차 분쟁, 배송 파손"
                    className="w-full border border-slate-200 rounded-xl p-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">질문 제목 *</label>
                <input
                  type="text"
                  required
                  value={manualForm.title}
                  onChange={(e) => setManualForm({ ...manualForm, title: e.target.value })}
                  placeholder="예: 헬스장 중도 해지 시 위약금 10% 초과 청구 대처법"
                  className="w-full border border-slate-200 rounded-xl p-2 text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">고충 시나리오 *</label>
                <textarea
                  rows={3}
                  required
                  value={manualForm.questionScenario}
                  onChange={(e) => setManualForm({ ...manualForm, questionScenario: e.target.value })}
                  placeholder="소비자가 실제로 겪는 구체적인 상황을 기재해 주세요."
                  className="w-full border border-slate-200 rounded-xl p-2 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">공식 해결 결론 요약 (약관/법령 근거) *</label>
                <textarea
                  rows={2}
                  required
                  value={manualForm.summary}
                  onChange={(e) => setManualForm({ ...manualForm, summary: e.target.value })}
                  placeholder="공정위 고시 및 법령에 따른 단호한 결론 요약"
                  className="w-full border border-slate-200 rounded-xl p-2 text-xs font-medium text-emerald-900 bg-emerald-50/50"
                />
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-3">
                <span className="font-bold text-slate-800 block">3단계 조치 절차</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="border border-slate-200 p-2.5 rounded-xl space-y-1">
                    <span className="font-bold text-indigo-600 block">Step 1</span>
                    <input
                      type="text"
                      value={manualForm.step1Title}
                      onChange={(e) => setManualForm({ ...manualForm, step1Title: e.target.value })}
                      placeholder="단계명 (예: 증거 확보)"
                      className="w-full border border-slate-200 rounded p-1 text-xs font-bold"
                    />
                    <textarea
                      rows={2}
                      value={manualForm.step1Desc}
                      onChange={(e) => setManualForm({ ...manualForm, step1Desc: e.target.value })}
                      placeholder="상세 행동 요령"
                      className="w-full border border-slate-200 rounded p-1 text-xs"
                    />
                  </div>
                  <div className="border border-slate-200 p-2.5 rounded-xl space-y-1">
                    <span className="font-bold text-indigo-600 block">Step 2</span>
                    <input
                      type="text"
                      value={manualForm.step2Title}
                      onChange={(e) => setManualForm({ ...manualForm, step2Title: e.target.value })}
                      placeholder="단계명 (예: 공식 통지)"
                      className="w-full border border-slate-200 rounded p-1 text-xs font-bold"
                    />
                    <textarea
                      rows={2}
                      value={manualForm.step2Desc}
                      onChange={(e) => setManualForm({ ...manualForm, step2Desc: e.target.value })}
                      placeholder="상세 행동 요령"
                      className="w-full border border-slate-200 rounded p-1 text-xs"
                    />
                  </div>
                  <div className="border border-slate-200 p-2.5 rounded-xl space-y-1">
                    <span className="font-bold text-indigo-600 block">Step 3</span>
                    <input
                      type="text"
                      value={manualForm.step3Title}
                      onChange={(e) => setManualForm({ ...manualForm, step3Title: e.target.value })}
                      placeholder="단계명 (예: 환불 확정)"
                      className="w-full border border-slate-200 rounded p-1 text-xs font-bold"
                    />
                    <textarea
                      rows={2}
                      value={manualForm.step3Desc}
                      onChange={(e) => setManualForm({ ...manualForm, step3Desc: e.target.value })}
                      placeholder="상세 행동 요령"
                      className="w-full border border-slate-200 rounded p-1 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">전문가 Pro-Tip</label>
                <input
                  type="text"
                  value={manualForm.proTip}
                  onChange={(e) => setManualForm({ ...manualForm, proTip: e.target.value })}
                  placeholder="실무 꿀팁이나 상대방을 설득하는 핵심 문구"
                  className="w-full border border-slate-200 rounded-xl p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">태그 (쉼표 구분)</label>
                  <input
                    type="text"
                    value={manualForm.tags}
                    onChange={(e) => setManualForm({ ...manualForm, tags: e.target.value })}
                    placeholder="#환불, #위약금, #공정위"
                    className="w-full border border-slate-200 rounded-xl p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">필요 서류 (쉼표 구분)</label>
                  <input
                    type="text"
                    value={manualForm.requiredDocs}
                    onChange={(e) => setManualForm({ ...manualForm, requiredDocs: e.target.value })}
                    placeholder="계약서, 결제 영수증"
                    className="w-full border border-slate-200 rounded-xl p-2 text-xs"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black shadow-md cursor-pointer"
                >
                  공식 솔루션 등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal for Deletion */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start space-x-3">
              <div className="bg-red-50 text-red-600 p-2 rounded-xl border border-red-100 flex-shrink-0">
                <Trash2 className="h-5 w-5" />
              </div>
              <div className="space-y-1.5 min-w-0">
                <h4 className="text-sm font-black text-slate-900">
                  문의 솔루션 영구 삭제
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  정말 <span className="font-bold text-slate-800">"{deleteConfirm.title}"</span> 솔루션을 허브에서 삭제하시겠습니까? 이 작업은 되돌릴 수 없으며 유저들이 해당 지식을 즉시 조회할 수 없게 됩니다.
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
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-black text-xs shadow-sm transition-colors cursor-pointer"
              >
                영구 삭제
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. 엑셀(CSV) 솔루션 대량 일괄 등록 Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full p-6 shadow-xl space-y-6 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-shrink-0">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
                  <Upload className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">공식 솔루션 엑셀(CSV) 대량 등록 엔진</h3>
                  <p className="text-xs text-slate-500">한 번에 100개 이상의 지식 정보를 정밀 검증을 거쳐 일괄 등록합니다.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsBulkModalOpen(false);
                  setValidationPreview([]);
                }}
                disabled={isUploading}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 cursor-pointer transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-5 overflow-y-auto flex-grow pr-1">
              
              {/* CSV Upload Area */}
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50 hover:bg-slate-50/50 transition-all text-center relative">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCSVFileChange}
                  disabled={isUploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <div className="space-y-2 pointer-events-none">
                  <div className="mx-auto w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <FileSpreadsheet className="h-5 w-5" />
                  </div>
                  <div className="text-xs font-black text-slate-800">CSV 파일을 여기에 드래그하거나 클릭하여 선택하세요.</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    반드시 다운로드 받으신 샘플의 열 제목 순서(category, categoryLabel, subCategory, title, questionScenario, summary, step1_title, step1_desc 등)와 일치해야 합니다.
                  </p>
                </div>
              </div>

              {/* Import Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                
                {/* Deduplication check option */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-800 block">중복 데이터 처리 기준</label>
                  <div className="grid grid-cols-1 gap-1.5">
                    <label className="flex items-center space-x-2.5 bg-white p-2.5 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                      <input
                        type="radio"
                        name="dupStrategy"
                        value="skip"
                        checked={dupStrategy === 'skip'}
                        onChange={() => setDupStrategy('skip')}
                        disabled={isUploading}
                        className="text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                      />
                      <span className="text-xs text-slate-700">
                        <strong className="text-slate-900 block font-black">중복 건너뛰기 (추천)</strong>
                        동일한 제목의 솔루션이 이미 등록되어 있다면 해당 행 생략
                      </span>
                    </label>
                    <label className="flex items-center space-x-2.5 bg-white p-2.5 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                      <input
                        type="radio"
                        name="dupStrategy"
                        value="overwrite"
                        checked={dupStrategy === 'overwrite'}
                        onChange={() => setDupStrategy('overwrite')}
                        disabled={isUploading}
                        className="text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                      />
                      <span className="text-xs text-slate-700">
                        <strong className="text-slate-900 block font-black">덮어쓰기 (강력 갱신)</strong>
                        동일 제목 발견 시 기존 데이터 내용을 새 내용으로 업데이트
                      </span>
                    </label>
                  </div>
                </div>

                {/* AI autofill option */}
                <div className="space-y-2 flex flex-col justify-between">
                  <div>
                    <label className="text-xs font-black text-slate-800 block mb-2">AI 지능형 보완 처리</label>
                    <label className="flex items-start space-x-3 bg-white p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={aiAutofill}
                        onChange={(e) => setAiAutofill(e.target.checked)}
                        disabled={isUploading}
                        className="text-indigo-600 focus:ring-indigo-500 h-4 w-4 mt-0.5 rounded"
                      />
                      <span className="text-xs text-slate-700 leading-relaxed">
                        <strong className="text-slate-900 block font-black">AI 스마트 빈 칸 자동 채우기</strong>
                        해결책 내용(summary, steps 등)이 비어있는 행을 발견하면 AI(Gemini-3.5-Flash)가 제목과 시나리오를 자동 정밀 분석하여 3단계 공식 가이드라인과 꿀팁을 자동 완성 후 업로드
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Validation Preview List */}
              {validationPreview.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800">
                      실시간 정밀 사전 검증 (Dry-run 검토 중: 총 {validationPreview.length}건)
                    </span>
                    <div className="flex space-x-2 text-[11px] font-bold">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
                        정상 등록 {validationPreview.filter(r => r.isValid).length}건
                      </span>
                      {validationPreview.filter(r => !r.isValid).length > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-red-50 text-red-700">
                          가공 오류 {validationPreview.filter(r => !r.isValid).length}건
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold">
                          <th className="p-2 w-16">구분</th>
                          <th className="p-2">카테고리</th>
                          <th className="p-2">제목 (Title)</th>
                          <th className="p-2 w-44">업로드 상태 및 검증 결과</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {validationPreview.map((row, index) => (
                          <tr key={row.id} className="hover:bg-slate-50/50">
                            <td className="p-2 text-slate-400 font-mono">#{index + 1}</td>
                            <td className="p-2">
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] font-bold">
                                {row.categoryLabel} ({row.category})
                              </span>
                            </td>
                            <td className="p-2 truncate max-w-xs" title={row.title}>
                              {row.title || <span className="text-red-500 italic">제목 기재 누락</span>}
                            </td>
                            <td className="p-2">
                              {row.isValid ? (
                                row.isAIRequired ? (
                                  <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[10px] inline-flex items-center space-x-1">
                                    <Sparkles className="h-3 w-3 animate-pulse" />
                                    <span>AI 지식 보완 대상</span>
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                                    검증 통과 (즉시 등록)
                                  </span>
                                )
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 font-bold text-[10px]" title={row.errors.join(', ')}>
                                  오류: {row.errors[0]}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Upload Progress Bar */}
              {isUploading && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 animate-pulse">
                  <div className="flex justify-between text-xs font-black text-indigo-900">
                    <span className="flex items-center space-x-1.5">
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Firebase Firestore DB 대량 동기화 중...</span>
                    </span>
                    <span>{uploadProgress} / {uploadTotal} 건 처리 완료</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-full rounded-full transition-all duration-300" 
                      style={{ width: `${(uploadProgress / uploadTotal) * 100}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    AI 보완이 활성화된 행은 백엔드에서 실시간 Gemini 추론 및 3단계 표준 해결 가이드라인 형성이 수행되고 있습니다.
                  </p>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-100 pt-4 flex justify-end space-x-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsBulkModalOpen(false);
                  setValidationPreview([]);
                }}
                disabled={isUploading}
                className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-50 cursor-pointer transition-all disabled:opacity-50"
              >
                닫기
              </button>
              <button
                type="button"
                onClick={handleRunBulkImport}
                disabled={isUploading || validationPreview.length === 0 || validationPreview.filter(r => r.isValid).length === 0}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 disabled:text-slate-500 text-white rounded-xl font-black text-xs shadow-md cursor-pointer transition-all flex items-center space-x-1"
              >
                <CheckCheck className="h-4 w-4" />
                <span>선택한 {validationPreview.filter(r => r.isValid).length}건 일괄 등록 시작</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
