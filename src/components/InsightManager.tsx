import React, { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  serverTimestamp, 
  query 
} from 'firebase/firestore';
import { db } from '../firebase';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Pencil,
  BookOpen, 
  Scale, 
  FileText, 
  Award, 
  Zap, 
  PlusCircle, 
  X,
  Search,
  Eye,
  Bookmark,
  Upload,
  FileDown,
  FileSpreadsheet,
  CheckCheck,
  RefreshCw
} from 'lucide-react';

interface AIConsumerInsight {
  id: string;
  title: string;
  emoji: string;
  summary: string;
  lawBasis: string;
  fullTip: string;
  badge: string;
}

// Default Seed List for Auto-Seeding Firestore
const AI_INSIGHTS_LIST: AIConsumerInsight[] = [
  {
    id: 'is_hair',
    title: '배달음식 이물질 발견 시 100% 전액 환불 룰',
    emoji: '🪰',
    summary: '사진 촬영 후 즉시 1399(식약처) 신고 연동 시, 점주가 거부하더라도 배달앱에서 전액 환불을 보증합니다.',
    lawBasis: '식품위생법 제4조 및 공정위 고시 소비자분쟁해결기준',
    badge: 'F&B 위생',
    fullTip: '1. [중요] 발견 즉시 음식의 전체 샷 and 이물질 확대 사진을 선명하게 다각도로 촬영해 두세요.\n2. 음식을 절대 다 먹거나 버리지 말고 지퍼백 또는 용기에 밀봉하여 증거를 원형 그대로 보존하세요.\n3. 배달앱 고객센터에 사진을 전달하고 식약처 불량식품 신고전화(1399) 접수 의사를 전달하세요. 법령에 의거하여 업주는 영업 정지 리스크 방지를 위해 즉각 환불을 이행할 수밖에 없습니다.'
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
    id: 'is_content_cert',
    title: '실전 법적 대항무기 "내용증명" 완벽 작성 가이드',
    emoji: '✉️',
    summary: '수신인 특정, 피해 사실의 육하원칙 구성, 이행 독촉 기한 설정 및 불이행 시 법적 조치 예고 문구 작성 요령.',
    lawBasis: '우편법 시행규칙 제46조 및 민법 제111조 (의사표시의 효력발생시기)',
    badge: '송무/방어',
    fullTip: '1. [필수 작성 요소] 제목(내용증명), 발신인/수신인 성명 및 정확한 주소, 본문(육하원칙에 따른 피해 사실), 구체적인 요구 사항(예: 환불, 계약 해지), 이행 기한(예: 수령일로부터 7일 내), 최종 경고 문구(불이행 시 법적 조치 진행).\n2. [실전 꿀팁] 내용증명은 총 3부를 인쇄해야 합니다. (1부는 우체국 보관, 1부는 발신인 보관, 1부는 수신인 전송).\n3. [온라인 전송] 인터넷 우체국(e-그린우편)에 접속하시면 우체국에 방문하지 않고도 24시간 언제든지 한글 파일(HWP)이나 PDF로 손쉽게 내용증명을 온라인 접수 및 즉시 등기 발송할 수 있습니다.'
  },
  {
    id: 'is_certificates',
    title: '주민센터 무방문 각종 민원/행정 증명서 24시간 온라인 무료 발급',
    emoji: '📄',
    summary: '공인인증서 없이 카카오/네이버 간편인증을 활용하여 스마트폰 \'정부24\' 모바일 지갑으로 주민등록초본, 건축물대장 등 증거 서류를 즉시 무료 발급받는 방법.',
    lawBasis: '민원 처리에 관한 법률 제12조 및 전자정부법 제9조',
    badge: '행정/민원',
    fullTip: '1. [증거 확보용 필수 서류] 전세사기/임대차 분쟁 예방에는 \'건축물대장/등기부등본\', 계약 주체 먹튀 방지용 \'사업자등록 증명원\', 주소지 변동 확인에는 \'주민등록초본\'이 필수적입니다.\n2. [정부24 초간단 접수] 공인인증서가 없더라도 간편인증(네이버, 카카오, 토스 등)을 통해 로그인이 가능합니다. 모바일 정부24 앱에서 필요한 민원 증명서를 검색해 신청해 보세요.\n3. [모바일 지갑 보관] 수수료가 무료인 전자문서지갑 수령 방식을 선택하면 스마트폰에 PDF 및 암호화 증명서가 즉시 보관되며, 이를 공공기관이나 구제 분쟁처에 이메일/카카오톡 링크로 간편 전송할 수 있습니다.'
  },
  {
    id: 'is_phone_cancel',
    title: '통신사 위약금 폭탄 피하고 핸드폰 해지 신청서 작성하는 법',
    emoji: '📱',
    summary: '할인반환금 계산기, 위약금 0원 무료 탈퇴 골든타임 요건 확인 및 대리점 방문 없이 팩스/온라인으로 당일 해지 접수하는 서식 제출 팁.',
    lawBasis: '전기통신사업법 제32조의3 및 방송통신위원회 이용자보호지침',
    badge: '소비자 권익',
    fullTip: '1. [위약금 발생 조건 대조] 선택약정 25% 할인 반환금과 공시지원금 위약금은 해지 시점에 따라 다릅니다. 통신사 고객센터(114) 앱에서 해지 시점 실시간 위약금을 미리 확인하세요.\n2. [대리점 방문 회피 요령] 동네 대리점에서는 실적 수수료 삭감을 이유로 해지 처리를 고의로 지연시키거나 거부할 수 있습니다. 각 대리점 대신 \'통신사 본사 대표 해지 부서\'에 다이렉트로 해지 신청서 서식과 신분증 사본을 팩스/웹 업로드 전송하는 것이 가장 당일 완료율이 높습니다.\n3. [미성년자/사망자 해지 요령] 미성년자의 경우 법정대리인 동의서와 가족관계증명서가 필요하며, 사망자 해지의 경우 위약금이 전액 면제되며 사망증명서(또는 기본증명서)와 유가족 신분증 사본을 팩스로 제출하면 즉각 무료 해지 처리가 규정상 완료됩니다.'
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

export const InsightManager: React.FC = () => {
  const [insights, setInsights] = useState<AIConsumerInsight[]>([]);
  const [loading, setLoading] = useState(true);

  // AI Generator state
  const [generateCount, setGenerateCount] = useState<number>(1);
  const [customTopic, setCustomTopic] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Manual Creation Modal State
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState<AIConsumerInsight | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Bulk Upload state variables
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadTotal, setUploadTotal] = useState(0);
  const [dupStrategy, setDupStrategy] = useState<'skip' | 'overwrite'>('skip');
  const [validationPreview, setValidationPreview] = useState<any[]>([]);

  const [manualForm, setManualForm] = useState({
    title: '',
    emoji: '💡',
    summary: '',
    lawBasis: '',
    fullTip: '',
    badge: '필수 꿀팁'
  });

  // Edit Modal State
  const [editingInsight, setEditingInsight] = useState<AIConsumerInsight | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    emoji: '💡',
    summary: '',
    lawBasis: '',
    fullTip: '',
    badge: '필수 꿀팁'
  });

  // Delete Confirmation Modal State
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetTitle, setDeleteTargetTitle] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Real-time Firestore Listener with automatic seeding & deduplication
  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'consumer_insights'));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const items: AIConsumerInsight[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });

      // Seeding & Missing Items Update: Ensure all elements in standard AI_INSIGHTS_LIST exist in DB
      const existingIds = new Set(items.map(i => i.id));
      const missingSeeds = AI_INSIGHTS_LIST.filter(seed => !existingIds.has(seed.id));

      if (missingSeeds.length > 0) {
        console.log("Seeding missing standard insights to Firestore:", missingSeeds.map(m => m.title));
        try {
          for (const item of missingSeeds) {
            await setDoc(doc(db, 'consumer_insights', item.id), {
              ...item,
              createdAt: serverTimestamp()
            });
          }
        } catch (err) {
          console.error("Failed to seed missing insights:", err);
        }
      }

      // Deduplicate list by Title (trimmed, case-insensitive check) to absolutely prevent rendering duplicates
      const uniqueMap = new Map<string, AIConsumerInsight>();
      items.forEach(item => {
        const key = item.title.trim().toLowerCase();
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, item);
        }
      });
      
      // Also ensure standard list is in UI immediately if DB loading delay occurs
      AI_INSIGHTS_LIST.forEach(item => {
        const key = item.title.trim().toLowerCase();
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, item);
        }
      });

      setInsights(Array.from(uniqueMap.values()));
      setLoading(false);
    }, (err) => {
      console.error("Firestore insights fetch error:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // AI Generation Handler (Checking and preventing title duplicates)
  const handleGenerateAI = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      const response = await fetch('/api/insights/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          count: generateCount,
          customTopicPrompt: customTopic
        })
      });

      if (!response.ok) {
        throw new Error(`AI 서버 응답 오류 (${response.status})`);
      }

      const data = await response.json();
      const generatedList = data.items || [];

      // Save each to Firestore if it doesn't already exist
      let savedCount = 0;
      for (const item of generatedList) {
        // Check if title already exists
        const duplicateExists = insights.some(ins => ins.title.trim().toLowerCase() === item.title.trim().toLowerCase());
        if (duplicateExists) {
          console.log(`Skipping duplicate insight: ${item.title}`);
          continue;
        }

        const docRef = doc(db, 'consumer_insights', item.id);
        await setDoc(docRef, {
          ...item,
          createdAt: serverTimestamp()
        });
        savedCount++;
      }

      setCustomTopic('');
      if (generatedList.length === 0) {
        showToast("알림: AI가 새로운 소비 상식 정보를 생성하지 못했습니다. 키워드나 주제를 더 자세히 입력해 주세요.");
      } else if (savedCount > 0) {
        showToast(`성공: AI가 꼭 알아야 하는 최신 소비 생활 트렌드 상식 ${savedCount}건을 자동 브리핑 생성하여 DB에 저장했습니다!`);
      } else {
        showToast(`알림: 생성된 주제(${generatedList.map((g: any) => g.title).join(', ')})는 이미 데이터베이스에 등록되어 있습니다.`);
      }
    } catch (err: any) {
      console.error("Consumer Insight AI Generation error:", err);
      showToast(`AI 생성 오류: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Delete Insight trigger & execution
  const confirmDeleteInsight = (id: string, title: string) => {
    setDeleteTargetId(id);
    setDeleteTargetTitle(title);
  };

  const executeDeleteInsight = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteDoc(doc(db, 'consumer_insights', deleteTargetId));
      showToast(`"${deleteTargetTitle}" 상식을 성공적으로 삭제했습니다.`);
    } catch (err: any) {
      showToast(`삭제 실패: ${err.message}`);
    } finally {
      setDeleteTargetId(null);
      setDeleteTargetTitle(null);
    }
  };

  // Open Edit Modal Helper
  const openEditModal = (insight: AIConsumerInsight) => {
    setEditingInsight(insight);
    setEditForm({
      title: insight.title,
      emoji: insight.emoji,
      summary: insight.summary,
      lawBasis: insight.lawBasis,
      fullTip: insight.fullTip,
      badge: insight.badge || '필수 꿀팁'
    });
    setIsEditModalOpen(true);
  };

  // Submit Edited Insight
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInsight) return;
    if (!editForm.title.trim() || !editForm.summary.trim() || !editForm.fullTip.trim()) {
      showToast("제목, 요약, 상세 꿀팁 내용은 필수 입력입니다.");
      return;
    }

    try {
      const docRef = doc(db, 'consumer_insights', editingInsight.id);
      await setDoc(docRef, {
        id: editingInsight.id,
        ...editForm,
        updatedAt: serverTimestamp()
      }, { merge: true });

      setIsEditModalOpen(false);
      setEditingInsight(null);
      showToast(`"${editForm.title}" 트렌드 상식 정보를 성공적으로 수정했습니다.`);
    } catch (err: any) {
      showToast(`수정 실패: ${err.message}`);
    }
  };

  // Manual Submit Handler
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.title.trim() || !manualForm.summary.trim() || !manualForm.fullTip.trim()) {
      showToast("제목, 요약, 상세 꿀팁 내용은 필수 입력입니다.");
      return;
    }

    try {
      const newId = `insight_manual_${Date.now()}`;
      const docRef = doc(db, 'consumer_insights', newId);
      await setDoc(docRef, {
        id: newId,
        ...manualForm,
        createdAt: serverTimestamp()
      });

      setIsManualModalOpen(false);
      setManualForm({
        title: '',
        emoji: '💡',
        summary: '',
        lawBasis: '',
        fullTip: '',
        badge: '필수 꿀팁'
      });
      showToast(`"${manualForm.title}" 상식을 직접 등록했습니다.`);
    } catch (err: any) {
      showToast(`등록 실패: ${err.message}`);
    }
  };

  // Download Sample function for Consumer Insights
  const handleDownloadSample = () => {
    const sampleRows = [
      {
        title: '배달음식 이물질 발견 시 100% 전액 환불 및 위생 민원 접수 팁',
        emoji: '🪰',
        summary: '사진 촬영 후 즉시 1399(식약처) 신고 연동 시, 점주가 거부하더라도 배달앱에서 전액 환불을 보증합니다.',
        lawBasis: '식품위생법 제4조 및 소비자분쟁해결기준',
        badge: 'F&B 위생',
        fullTip: '1. [중요] 발견 즉시 음식의 전체 샷 및 이물질 확대 사진을 선명하게 다각도로 촬영해 두세요.\n2. 음식을 절대 다 먹거나 버리지 말고 지퍼백 또는 용기에 밀봉하여 증거를 원형 그대로 보존하세요.\n3. 배달앱 고객센터에 사진을 전달하고 식약처 불량식품 신고전화(1399) 접수 의사를 전달하세요. 법령에 의거하여 업주는 영업 정지 리스크 방지를 위해 즉각 환불을 이행할 수밖에 없습니다.'
      },
      {
        title: '인스타/블로그 공구 "단순 변심 반품 불가" 사전 고지의 법적 무효',
        emoji: '🛍️',
        summary: '구매 창에서 "환불 불가 동의"란에 미리 동의했더라도, 전자상거래법 제17조에 따라 7일 내 무조건 환불 가능합니다.',
        lawBasis: '전자상거래법 제17조 및 제35조 (강행규정)',
        badge: 'SNS 커머스',
        fullTip: '1. 전자상거래법 제17조 제1항에 의거, 소비자는 배송일로부터 7일 이내에 조건 없는 청약 철회가 가능합니다.\n2. 판매자가 "사전 환불 불가 고지 및 소비자동의서 징구"를 근거로 대더라도, 동법 제35조(강행규정)에 의해 소비자에게 불리한 약정은 원천적으로 무효가 됩니다.\n3. 판매자가 고의로 채팅방을 퇴장하거나 거절할 경우 당사 1:1 센터를 통해 내용증명 및 소관 구청 신고 가이드를 즉시 다운로드하세요.'
      },
      {
        title: '국제선 항공권 결제 당일 24시간 내 취소 수수료 면제',
        emoji: '✈️',
        summary: '해외 사이트 결제더라도 한국 지사를 둔 항공사나 국적기는 24시간 내 무료 취소 의무가 있습니다.',
        lawBasis: '전자상거래법 제17조 및 국내 항공사 개별 약관',
        badge: '여행/항공',
        fullTip: '1. 항공권을 구매한 당일 또는 24시간 이내에는 발권 취소 시 수수료를 전액 면제받을 수 있습니다.\n2. 외항사라 하더라도 한국어 사이트와 지사를 두고 있는 경우 국내 전자상거래법의 적용을 받으므로 청약철회 권리를 주장할 수 있습니다.\n3. 일부 여행사 대행 수수료는 면제 대상에서 제외될 수 있으므로, 대행사 취소 규정을 사전에 꼭 대조해 두십시오.'
      }
    ];

    const headers = ['title', 'emoji', 'summary', 'lawBasis', 'badge', 'fullTip'];

    const escapeCsvValue = (val: string) => {
      if (!val) return '';
      const stringified = String(val).replace(/"/g, '""');
      if (stringified.includes(',') || stringified.includes('\n') || stringified.includes('"')) {
        return `"${stringified}"`;
      }
      return stringified;
    };

    const csvLines = [
      headers.join(','),
      ...sampleRows.map(row => 
        headers.map(header => escapeCsvValue((row as any)[header])).join(',')
      )
    ];

    const csvContent = "\uFEFF" + csvLines.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `모두의문의_트렌드상식_대량등록_공식샘플.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Robust CSV parsing state machine with validation
  const handleCSVFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const rows: string[][] = [];
      let currentRow: string[] = [];
      let currentVal = '';
      let insideQuote = false;

      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1];

        if (insideQuote) {
          if (char === '"') {
            if (nextChar === '"') {
              currentVal += '"';
              i++;
            } else {
              insideQuote = false;
            }
          } else {
            currentVal += char;
          }
        } else {
          if (char === '"') {
            insideQuote = true;
          } else if (char === ',') {
            currentRow.push(currentVal.trim());
            currentVal = '';
          } else if (char === '\r' || char === '\n') {
            if (char === '\r' && nextChar === '\n') {
              i++;
            }
            currentRow.push(currentVal.trim());
            rows.push(currentRow);
            currentRow = [];
            currentVal = '';
          } else {
            currentVal += char;
          }
        }
      }
      if (currentVal || currentRow.length > 0) {
        currentRow.push(currentVal.trim());
        rows.push(currentRow);
      }

      if (rows.length < 2) {
        alert("올바른 대량등록 CSV 파일이 아닙니다. 최소 1개 이상의 데이터 행이 존재해야 합니다.");
        return;
      }

      const headers = rows[0].map(h => h.trim().toLowerCase());
      
      const parsedPreview = rows.slice(1).map((row, index) => {
        if (row.length === 0 || (row.length === 1 && !row[0])) return null;

        const getValue = (colName: string, korNames: string[] = []): string => {
          let colIndex = headers.indexOf(colName.toLowerCase());
          if (colIndex === -1) {
            for (const kor of korNames) {
              colIndex = headers.indexOf(kor.toLowerCase());
              if (colIndex !== -1) break;
            }
          }
          return colIndex !== -1 && row[colIndex] ? row[colIndex] : '';
        };

        const rawTitle = getValue('title', ['제목', '상식제목', '명칭']);
        const rawEmoji = getValue('emoji', ['이모지', '아이콘']) || '💡';
        const rawSummary = getValue('summary', ['요약', '내용', '한줄요약', '상식요약']);
        const rawLawBasis = getValue('lawBasis', ['법적근거', '관련법률', '근거법령', '법적기준']) || '소비자기본법';
        const rawBadge = getValue('badge', ['배지', '분류', '라벨']) || '필수 꿀팁';
        const rawFullTip = getValue('fullTip', ['상세내용', '상세꿀팁', '실천요령', '풀팁']);

        const errors: string[] = [];
        if (!rawTitle) errors.push('상식 제목(Title)이 입력되지 않았습니다.');
        if (!rawSummary) errors.push('한 줄 요약(Summary)이 입력되지 않았습니다.');
        if (!rawFullTip) errors.push('상세 꿀팁(FullTip)이 입력되지 않았습니다.');

        return {
          id: `insight_bulk_${Date.now()}_${index}`,
          title: rawTitle,
          emoji: rawEmoji,
          summary: rawSummary,
          lawBasis: rawLawBasis,
          badge: rawBadge,
          fullTip: rawFullTip,
          isValid: errors.length === 0,
          errors
        };
      }).filter(Boolean);

      setValidationPreview(parsedPreview as any[]);
    };
    reader.readAsText(file, "UTF-8");
  };

  // Run Bulk Import to Firestore
  const handleRunBulkImport = async () => {
    if (isUploading) return;
    setIsUploading(true);
    setUploadProgress(0);

    const validRows = validationPreview.filter(r => r.isValid);
    setUploadTotal(validRows.length);

    try {
      const existingTitles = new Set(insights.map(i => i.title.trim().toLowerCase()));

      for (let i = 0; i < validRows.length; i++) {
        const row = validRows[i];
        const titleKey = row.title.trim().toLowerCase();

        // deduplicate logic
        if (dupStrategy === 'skip' && existingTitles.has(titleKey)) {
          setUploadProgress(prev => prev + 1);
          continue;
        }

        const docId = `insight_bulk_${Date.now()}_${i}`;
        
        const cleanedInsight = {
          id: docId,
          title: row.title,
          emoji: row.emoji,
          summary: row.summary,
          lawBasis: row.lawBasis,
          badge: row.badge,
          fullTip: row.fullTip,
          createdAt: serverTimestamp()
        };

        await setDoc(doc(db, 'consumer_insights', docId), cleanedInsight);
        setUploadProgress(prev => prev + 1);
      }

      showToast(`성공: 총 ${validRows.length}건 중 유효한 트렌드 상식이 데이터베이스에 일괄 등록되었습니다!`);
      setIsBulkModalOpen(false);
      setValidationPreview([]);
    } catch (err: any) {
      console.error("Bulk upload error:", err);
      showToast(`일괄 등록 중 오류 발생: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8 text-left">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-950 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-3 text-xs font-bold border border-slate-800 animate-in fade-in slide-in-from-bottom-2">
          <Zap className="h-4 w-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-indigo-950 to-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm text-white">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-[11px] font-black uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
              <span>모두의문의 트렌드 지식 어드민</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              소비자 상식 및 트렌드 핵심 브리핑 실시간 구축소
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              사기 수법 대처법, 배달음식 상식, 전자상거래법 철회권, 항공 위약금 면제 조건 등 현대 한국인의 슬기로운 경제생활을 돕는 필수 소비자 상식 브리핑을 AI로 자동 생성하고 데이터베이스에 실시간 영구 축적합니다.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-xl border border-white/10 text-center">
            <span className="text-[10px] font-bold text-slate-300 block uppercase">보관 중인 국민 트렌드 상식</span>
            <span className="text-2xl font-black text-indigo-300">{insights.length}건</span>
          </div>
        </div>
      </div>

      {/* AI Generative Engine */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-indigo-600 animate-pulse" />
              <h3 className="text-sm font-black text-slate-900">AI 트렌드 상식 오토 라이팅 & 원클릭 적재소</h3>
            </div>
            <p className="text-xs text-slate-500">
              특정하고 정밀한 소비자 민원 트렌드를 지정하면, Gemini AI가 약관법 및 전자상거래소비자보호법을 심층 대조하여 대국민 필수 상식을 생성합니다.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsManualModalOpen(true)}
              className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              <span>트렌드 상식 수동 등록</span>
            </button>

            <button
              onClick={() => setIsBulkModalOpen(true)}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-sm transition-all cursor-pointer whitespace-nowrap"
            >
              <Upload className="h-4 w-4" />
              <span>솔루션 대량 등록</span>
            </button>

            <button
              onClick={handleDownloadSample}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-850 border border-emerald-200 text-xs font-black shadow-sm transition-all cursor-pointer whitespace-nowrap"
            >
              <FileDown className="h-4 w-4" />
              <span>기본 샘플 받기</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-3 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">한 번에 생성할 분량</label>
            <select
              value={generateCount}
              onChange={(e) => setGenerateCount(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={1}>1개 핵심 정밀 생성</option>
              <option value={2}>2개 연속 브리핑 생성</option>
              <option value={3}>3개 동시 지식 축적</option>
            </select>
          </div>

          <div className="md:col-span-9 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">상식 주제 키워드 (비워두면 AI 자동 발굴)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="예: 중고차 환불 사기 수법 대처, 배달 이물질 발생 시 입증 책임, 인공지능 쇼핑 피해 구제법"
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleGenerateAI}
                disabled={isGenerating}
                className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-indigo-950 hover:from-indigo-500 hover:to-slate-800 disabled:opacity-50 text-white text-xs font-black px-4.5 py-2 rounded-xl transition-all shadow-md cursor-pointer whitespace-nowrap"
              >
                <Sparkles className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>{isGenerating ? 'AI 브리핑 집필 중...' : 'AI 상식 자동 생성하기'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Insights Board */}
      <div className="space-y-4">
        <h3 className="text-base font-black text-slate-900">라이브 소비자 트렌드 상식 라이브러리</h3>

        {loading ? (
          <div className="text-center py-16 text-xs text-slate-400">지식 데이터베이스를 로드 중...</div>
        ) : insights.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-16 text-center text-slate-400">
            <BookOpen className="h-10 w-10 text-slate-200 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">등록된 트렌드 상식이 아직 없습니다.</p>
            <p className="text-[10px] text-slate-400 mt-1">상단 AI 생성버튼을 클릭하면 법령에 기조한 상식 카드가 즉시 발급됩니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {insights.map((insight) => (
              <div 
                key={insight.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-indigo-400 hover:shadow-md transition-all relative group text-left"
              >
                <div className="absolute top-4 right-4 flex items-center space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditModal(insight)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer"
                    title="수정"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => confirmDeleteInsight(insight.id, insight.title)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                    title="영구 삭제"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Category & Badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-md uppercase">
                      ⭐ {insight.badge || '필수 상식'}
                    </span>
                    <span className="text-xs text-slate-400 font-bold font-mono">
                      No. {insight.id.substring(0, 6)}
                    </span>
                  </div>

                  {/* Title & Emoji */}
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                      {insight.emoji}
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-sm leading-snug mt-0.5">
                      {insight.title}
                    </h4>
                  </div>

                  {/* Law basis info */}
                  <div className="bg-slate-50 border-l-4 border-indigo-500 rounded-r-xl p-3 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold flex items-center space-x-1">
                      <Scale className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                      <span>관련 법령 및 규정 표준</span>
                    </span>
                    <p className="text-[11px] font-extrabold text-slate-800 line-clamp-1 font-mono">
                      {insight.lawBasis}
                    </p>
                  </div>

                  {/* Summary */}
                  <p className="text-xs text-slate-600 leading-relaxed font-mono min-h-[40px] line-clamp-2">
                    {insight.summary}
                  </p>
                </div>

                {/* Preview Trigger */}
                <div className="pt-4 mt-2">
                  <button
                    onClick={() => setSelectedPreview(insight)}
                    className="w-full flex items-center justify-center space-x-1.5 py-2 text-[11px] font-black text-indigo-600 bg-slate-50 hover:bg-indigo-600 hover:text-white rounded-xl transition-all cursor-pointer border border-slate-100"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>전체 브리핑 및 실천 강령 보기</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {selectedPreview && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="space-y-1 text-left">
                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase">
                  {selectedPreview.badge}
                </span>
                <div className="flex items-center space-x-2 mt-1.5">
                  <span className="text-2xl">{selectedPreview.emoji}</span>
                  <h3 className="text-base font-black text-slate-900 leading-snug">
                    {selectedPreview.title}
                  </h3>
                </div>
              </div>
              <button 
                onClick={() => setSelectedPreview(null)} 
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-left leading-relaxed">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                <span className="font-bold text-slate-700 block">💡 한 줄 요약:</span>
                <p className="text-slate-600 font-mono">{selectedPreview.summary}</p>
              </div>

              <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 space-y-1">
                <span className="font-bold text-indigo-900 block flex items-center space-x-1">
                  <Scale className="h-4 w-4 text-indigo-600" />
                  <span>핵심 법적 근거 (법령 표준):</span>
                </span>
                <p className="text-indigo-950 font-black font-mono">{selectedPreview.lawBasis}</p>
              </div>

              <div className="space-y-1.5">
                <span className="font-bold text-slate-800 block">🔍 AI 심층 브리핑 및 구체적 실천 강령:</span>
                <div className="p-4 bg-white rounded-xl border border-slate-200 text-slate-700 whitespace-pre-line font-mono text-xs leading-relaxed shadow-inner">
                  {selectedPreview.fullTip}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 flex justify-end">
              <button
                onClick={() => setSelectedPreview(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                확인 완료
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Creation Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl border border-slate-100 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900">소비자 트렌드 상식 직접 집필</h3>
                <p className="text-xs text-slate-500">지식 데이터베이스에 저장될 정밀 소비자 상식을 작성합니다.</p>
              </div>
              <button 
                onClick={() => setIsManualModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-4 text-xs text-left">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">상식 카드 제목 *</label>
                  <input
                    type="text"
                    required
                    value={manualForm.title}
                    onChange={(e) => setManualForm({ ...manualForm, title: e.target.value })}
                    placeholder="예: 배달 음식 이물질 대처와 상해 치료 배상법"
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">이모지 *</label>
                  <input
                    type="text"
                    required
                    value={manualForm.emoji}
                    onChange={(e) => setManualForm({ ...manualForm, emoji: e.target.value })}
                    placeholder="예: 💡, 🍔, 🚗"
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-center text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">노출 라벨 배지</label>
                  <input
                    type="text"
                    value={manualForm.badge}
                    onChange={(e) => setManualForm({ ...manualForm, badge: e.target.value })}
                    placeholder="예: 필독 상식, 꿀팁"
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">근거 법령/고시 규격 *</label>
                  <input
                    type="text"
                    required
                    value={manualForm.lawBasis}
                    onChange={(e) => setManualForm({ ...manualForm, lawBasis: e.target.value })}
                    placeholder="예: 전자상거래법 제17조, 소비자분쟁해결기준"
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">한 줄 요약 *</label>
                <textarea
                  rows={2}
                  required
                  value={manualForm.summary}
                  onChange={(e) => setManualForm({ ...manualForm, summary: e.target.value })}
                  placeholder="카드의 핵심 내용을 단시간 내 읽을 수 있는 명확한 언어로 한 줄 요약합니다."
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">상세 브리핑 및 실천 요령 *</label>
                <textarea
                  rows={6}
                  required
                  value={manualForm.fullTip}
                  onChange={(e) => setManualForm({ ...manualForm, fullTip: e.target.value })}
                  placeholder="대처 요령, 입증 서류 목록, 이의제기 절차 등을 줄바꿈하여 자세히 작성합니다."
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-mono"
                />
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-600 cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-black text-white shadow-md cursor-pointer"
                >
                  지식 보관소 등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Insight Modal */}
      {isEditModalOpen && editingInsight && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900">트렌드 소비 상식 정보 수정</h3>
                <p className="text-xs text-slate-500">지정된 생활 트렌드 상식을 수정 및 보강합니다.</p>
              </div>
              <button 
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingInsight(null);
                }} 
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs text-left">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">상식 카드 제목 *</label>
                  <input
                    type="text"
                    required
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    placeholder="예: 배달 음식 이물질 대처와 상해 치료 배상법"
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">이모지 *</label>
                  <input
                    type="text"
                    required
                    value={editForm.emoji}
                    onChange={(e) => setEditForm({ ...editForm, emoji: e.target.value })}
                    placeholder="예: 💡, 🍔, 🚗"
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-center text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">노출 라벨 배지</label>
                  <input
                    type="text"
                    value={editForm.badge}
                    onChange={(e) => setEditForm({ ...editForm, badge: e.target.value })}
                    placeholder="예: 필독 상식, 꿀팁"
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">근거 법령/고시 규격 *</label>
                  <input
                    type="text"
                    required
                    value={editForm.lawBasis}
                    onChange={(e) => setEditForm({ ...editForm, lawBasis: e.target.value })}
                    placeholder="예: 전자상거래법 제17조, 소비자분쟁해결기준"
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">한 줄 요약 *</label>
                <textarea
                  rows={2}
                  required
                  value={editForm.summary}
                  onChange={(e) => setEditForm({ ...editForm, summary: e.target.value })}
                  placeholder="카드의 핵심 내용을 단시간 내 읽을 수 있는 명확한 언어로 한 줄 요약합니다."
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">상세 브리핑 및 실천 요령 *</label>
                <textarea
                  rows={6}
                  required
                  value={editForm.fullTip}
                  onChange={(e) => setEditForm({ ...editForm, fullTip: e.target.value })}
                  placeholder="대처 요령, 입증 서류 목록, 이의제기 절차 등을 줄바꿈하여 자세히 작성합니다."
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-mono"
                />
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingInsight(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-600 cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-black text-white shadow-md cursor-pointer"
                >
                  수정 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetId && deleteTargetTitle && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-6 shadow-2xl border border-slate-100 text-center animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500">
              <Trash2 className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-extrabold text-slate-900">소비자 상식 영구 삭제</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                정말 소비자 트렌드 상식 <span className="font-bold text-slate-850">"{deleteTargetTitle}"</span> 정보를 데이터베이스에서 영구 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteTargetId(null);
                  setDeleteTargetTitle(null);
                }}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-600 cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={executeDeleteInsight}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 rounded-xl text-xs font-black text-white shadow-md cursor-pointer"
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. 소비자 상식 엑셀(CSV) 대량 일괄 등록 Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full p-6 shadow-xl space-y-6 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-left">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-shrink-0">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
                  <Upload className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">소비자 트렌드 상식 대량 등록 엔진</h3>
                  <p className="text-xs text-slate-500">한 번에 수십 개 이상의 소비자 상식 및 트렌드 핵심 브리핑 정보를 검증을 거쳐 일괄 등록합니다.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsBulkModalOpen(false);
                  setValidationPreview([]);
                }}
                disabled={isUploading}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 cursor-pointer transition-all animate-none"
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
                    반드시 다운로드 받으신 샘플의 열 제목 순서(title, emoji, summary, lawBasis, badge, fullTip)와 일치해야 합니다.
                  </p>
                </div>
              </div>

              {/* Import Options */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                <label className="text-xs font-black text-slate-800 block">중복 데이터 처리 기준</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center space-x-2.5 bg-white p-2.5 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                    <input
                      type="radio"
                      name="dupStrategyInsight"
                      value="skip"
                      checked={dupStrategy === 'skip'}
                      onChange={() => setDupStrategy('skip')}
                      disabled={isUploading}
                      className="text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                    />
                    <span className="text-xs text-slate-700">
                      <strong className="text-slate-900 block font-black">중복 건너뛰기 (추천)</strong>
                      동일한 제목의 상식이 이미 존재하면 해당 데이터 스킵
                    </span>
                  </label>
                  <label className="flex items-center space-x-2.5 bg-white p-2.5 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                    <input
                      type="radio"
                      name="dupStrategyInsight"
                      value="overwrite"
                      checked={dupStrategy === 'overwrite'}
                      onChange={() => setDupStrategy('overwrite')}
                      disabled={isUploading}
                      className="text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                    />
                    <span className="text-xs text-slate-700">
                      <strong className="text-slate-900 block font-black">덮어쓰기 (강력 갱신)</strong>
                      동일 제목 발견 시 새 데이터 내용으로 덮어쓰기 업데이트
                    </span>
                  </label>
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
                          <th className="p-2 w-16 text-center">이모지</th>
                          <th className="p-2">분류 / 제목</th>
                          <th className="p-2">요약 설명 및 법적 근거</th>
                          <th className="p-2 w-32">검증 결과</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {validationPreview.map((row, index) => (
                          <tr key={row.id} className="hover:bg-slate-50/50">
                            <td className="p-2 text-slate-400 font-mono">#{index + 1}</td>
                            <td className="p-2 text-center text-lg">{row.emoji}</td>
                            <td className="p-2">
                              <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-bold block w-max mb-1">
                                {row.badge}
                              </span>
                              <span className="font-bold text-slate-900 block truncate max-w-xs">{row.title || <span className="text-red-500 italic">제목 기재 누락</span>}</span>
                            </td>
                            <td className="p-2">
                              <span className="text-slate-500 text-[10px] block truncate max-w-xs">{row.summary}</span>
                              <span className="text-slate-400 font-mono text-[9px] block">법적 근거: {row.lawBasis}</span>
                            </td>
                            <td className="p-2">
                              {row.isValid ? (
                                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                                  검증 통과 (준비 완료)
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 font-bold text-[10px] block truncate" title={row.errors.join(', ')}>
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
                      <RefreshCw className="h-3.5 w-3.5 animate-spin text-indigo-600" />
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
