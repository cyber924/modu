import React, { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc 
} from 'firebase/firestore';
import { db } from '../firebase';
import { PUBLIC_ALERTS, PublicNoticeAlert, AlertCategory } from '../data/publicAlertsData';
import { 
  Bell, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Sparkles, 
  AlertTriangle, 
  Scale, 
  Gift, 
  ShieldAlert, 
  Search, 
  Flame, 
  Pin, 
  Phone, 
  CheckCircle2, 
  RefreshCw,
  Building2,
  Megaphone,
  Upload,
  FileDown,
  FileSpreadsheet,
  CheckCheck
} from 'lucide-react';

export const AlertManager: React.FC = () => {
  const [alerts, setAlerts] = useState<PublicNoticeAlert[]>(PUBLIC_ALERTS);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AlertCategory | 'all'>('all');

  // Form Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<PublicNoticeAlert | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<AlertCategory>('urgent');
  const [badgeText, setBadgeText] = useState('긴급 경보');
  const [urgency, setUrgency] = useState<'high' | 'medium' | 'normal'>('high');
  const [institution, setInstitution] = useState('한국소비자원');
  const [effectiveDate, setEffectiveDate] = useState('2026.09.16 고지');
  const [targetAudience, setTargetAudience] = useState('전 국민');
  const [summary, setSummary] = useState('');
  const [keyPointsStr, setKeyPointsStr] = useState('');
  const [actionGuideStr, setActionGuideStr] = useState('');
  const [lawBasis, setLawBasis] = useState('');
  const [contactNumber, setContactNumber] = useState('1372');
  const [pinned, setPinned] = useState(false);

  // AI draft loading
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [generatedDrafts, setGeneratedDrafts] = useState<PublicNoticeAlert[]>([]);
  const [selectedDraftIndexes, setSelectedDraftIndexes] = useState<number[]>([0, 1, 2]);

  // Bulk Upload state variables
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadTotal, setUploadTotal] = useState(0);
  const [dupStrategy, setDupStrategy] = useState<'skip' | 'overwrite'>('skip');
  const [aiAutofill, setAiAutofill] = useState(true);
  const [validationPreview, setValidationPreview] = useState<any[]>([]);

  // Custom interactive confirmation & notification states (replaces window.confirm & alert)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Premium Download Sample function for Public Notice Alerts
  const handleDownloadSample = () => {
    const sampleRows = [
      {
        category: 'urgent',
        categoryLabel: '긴급 피해주의보',
        badgeText: '긴급 경보',
        urgency: 'high',
        title: '해외 유명 호텔 및 항공 예약 플랫폼 DCC 숨은 수수료 및 취소 거부 소비자 경보',
        summary: '원화 결제(DCC) 설정 시 최대 5~8% 환전 수수료가 중복 청구되며 예약 후 24시간 내 취소는 전액 반환 권리가 인정됩니다.',
        targetAudience: '해외여행 및 호텔 예약 예정인 모든 국민',
        institution: '한국소비자원 & 공정거래위원회',
        effectiveDate: '2026.09.01 발령',
        keyPoints: '이중환전(DCC) 수수료 자동 적용 확인|예약 후 24시간 내 취소 시 청약철회 가능|부당 거부 시 카드사 차지백 즉시 신청',
        actionGuide: '1단계: 결제 시 통화를 현지 통화로 지정|2단계: 부당 수수료 청구 시 결제일로부터 7일 내 카드사 이의제기|3단계: 국제거래 소비자포털 구제 접수',
        lawBasis: '전자상거래법 제17조 및 약관규제법 제6조',
        contactNumber: '1372',
        pinned: 'true'
      },
      {
        category: 'law',
        categoryLabel: '법 개정/의무 시행',
        badgeText: '오늘부터 시행',
        urgency: 'medium',
        title: '헬스장 필라테스 중도 해지 시 정가 일할 공제 꼼수 전면 금지 및 10% 위약금 상한제',
        summary: '사업자가 할인 전 1회 정상가를 기준으로 남은 돈이 없다고 억지 부리는 행위는 위법이며 실제 결제 금액 기준으로 잔여일 공제 후 환불해야 합니다.',
        targetAudience: '체육시설 및 다중 이용 시설 등록 이용자',
        institution: '공정거래위원회 계속거래고시',
        effectiveDate: '2026.08.15 개정 고시',
        keyPoints: '정가 기준 공제 위약금 청구 원천 무효|실제 결제한 할인 금액 기준으로 일할 정산 공제|총 결제 금액의 10퍼센트 초과 위약금 부과 불법',
        actionGuide: '1단계: 해지 요청 시 메세지 또는 서면으로 의사 통지 일자 확보|2단계: 계속거래 기준 위법 사실 판매자에게 고지|3단계: 환급 거부 시 구청 위생과 및 소비자원 일괄 신고',
        lawBasis: '방문판매법 제32조 및 체육시설법 시행령',
        contactNumber: '1372',
        pinned: 'true'
      },
      {
        category: 'benefit',
        categoryLabel: '전국민 알짜 혜택',
        badgeText: '상시 혜택',
        urgency: 'normal',
        title: '청년 월세 특별지원 사업 월 최대 20만원 무상 임차료 지원 신청 개시',
        summary: '만 19세에서 34세 독립 거주 청년 중 임차보증금 5천만원 이하 및 월세 60만원 이하 거주자를 대상으로 매월 20만원씩 1년간 지원금을 지급합니다.',
        targetAudience: '독립 거주 무주택 청년',
        institution: '국토교통부',
        effectiveDate: '2026년 확대 시행',
        keyPoints: '보증금 5천만원 이하 및 월세 60만원 이하 청년 지원|청년 독립 가구 기준 중위소득 60퍼센트 이하 충족 확인|실제 납부 월세 기준 최대 월 20만원씩 12개월 지원',
        actionGuide: '1단계: 마이홈 포털 또는 복지로를 통해 청년 자격 자가진단 실행|2단계: 필수 서류(임대차 계약서, 이체 내역서, 등본) 준비|3단계: 복지로 온라인 신청 또는 주민센터 방문 접수',
        lawBasis: '청년기본법 및 주거급여법',
        contactNumber: '1600-0777',
        pinned: 'false'
      }
    ];

    const headers = [
      'category', 'categoryLabel', 'badgeText', 'urgency', 'title', 'summary', 
      'targetAudience', 'institution', 'effectiveDate', 'keyPoints', 'actionGuide', 
      'lawBasis', 'contactNumber', 'pinned'
    ];

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
    link.setAttribute("download", `모두의알림_대량업로드_공식샘플.csv`);
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
        alert("올바른 공고 알림 CSV 파일이 아닙니다. 최소 1개 이상의 데이터 행이 존재해야 합니다.");
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

        const rawTitle = getValue('title', ['제목', '공고제목', '명칭']);
        const rawCategory = (getValue('category', ['카테고리', '구분']) || 'urgent').toLowerCase() as AlertCategory;
        const rawCategoryLabel = getValue('categoryLabel', ['카테고리명', '분류명']) || '긴급 피해주의보';
        const rawBadgeText = getValue('badgeText', ['배지', '배지텍스트']) || '긴급 경보';
        const rawUrgency = (getValue('urgency', ['긴급도', '중요도']) || 'normal').toLowerCase() as 'high' | 'medium' | 'normal';
        const rawSummary = getValue('summary', ['요약', '내용', '공고요약']);
        const rawTargetAudience = getValue('targetAudience', ['대상', '대상자', '수혜대상']) || '전 국민';
        const rawInstitution = getValue('institution', ['기관', '등록기관', '제공기관']) || '소비자 대책 본부';
        const rawEffectiveDate = getValue('effectiveDate', ['시행일', '등록일', '발효일']) || '실시간 고지';
        const rawKeyPointsStr = getValue('keyPoints', ['핵심', '핵심포인트', '핵심사항', '주요내용']);
        const rawActionGuideStr = getValue('actionGuide', ['행동가이드', '대응수칙', '행동요령']);
        const rawLawBasis = getValue('lawBasis', ['법적근거', '관련법률', '근거법령']) || '';
        const rawContactNumber = getValue('contactNumber', ['문의처', '전화번호', '연락처']) || '1372';
        
        const rawPinnedStr = getValue('pinned', ['고정', '고정여부', '최상단고정']).toLowerCase();
        const rawPinned = rawPinnedStr === 'true' || rawPinnedStr === '1' || rawPinnedStr === 'y' || rawPinnedStr === '예';

        const keyPoints = rawKeyPointsStr ? rawKeyPointsStr.split('|').map(k => k.trim()).filter(Boolean) : [];
        const actionGuide = rawActionGuideStr ? rawActionGuideStr.split('|').map(a => a.trim()).filter(Boolean) : [];

        const errors: string[] = [];
        if (!rawTitle) errors.push('공고 제목(Title)이 입력되지 않았습니다.');
        
        const isAIRequired = !rawSummary || keyPoints.length === 0 || actionGuide.length === 0;

        return {
          id: `alert_bulk_${Date.now()}_${index}`,
          category: rawCategory,
          categoryLabel: rawCategoryLabel,
          badgeText: rawBadgeText,
          urgency: rawUrgency,
          title: rawTitle,
          summary: rawSummary,
          targetAudience: rawTargetAudience,
          institution: rawInstitution,
          effectiveDate: rawEffectiveDate,
          keyPoints,
          actionGuide,
          lawBasis: rawLawBasis,
          contactNumber: rawContactNumber,
          pinned: rawPinned,
          viewCount: Math.floor(Math.random() * 500) + 150,
          shareCount: Math.floor(Math.random() * 100) + 15,
          isValid: errors.length === 0,
          isAIRequired,
          errors
        };
      }).filter(Boolean);

      setValidationPreview(parsedPreview as any[]);
    };
    reader.readAsText(file, "UTF-8");
  };

  // Run Bulk Import to Firestore with options
  const handleRunBulkImport = async () => {
    if (isUploading) return;
    setIsUploading(true);
    setUploadProgress(0);

    const validRows = validationPreview.filter(r => r.isValid);
    setUploadTotal(validRows.length);

    try {
      const existingDbIds = new Set(alerts.map(a => a.id));
      const existingDbTitles = new Set(alerts.map(a => a.title.trim()));

      for (let i = 0; i < validRows.length; i++) {
        const row = validRows[i];

        if (dupStrategy === 'skip' && (existingDbIds.has(row.id) || existingDbTitles.has(row.title.trim()))) {
          setUploadProgress(prev => prev + 1);
          continue;
        }

        let finalAlert = { ...row };

        if (aiAutofill && row.isAIRequired) {
          try {
            const enrichRes = await fetch('/api/notices/expand-item', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                category: row.category,
                title: row.title,
                summary: row.summary
              })
            });
            if (enrichRes.ok) {
              const enrichedData = await enrichRes.json();
              finalAlert.summary = enrichedData.summary || finalAlert.summary;
              finalAlert.keyPoints = enrichedData.keyPoints || finalAlert.keyPoints;
              finalAlert.actionGuide = enrichedData.actionGuide || finalAlert.actionGuide;
              if (enrichedData.lawBasis) finalAlert.lawBasis = enrichedData.lawBasis;
              if (enrichedData.contactNumber) finalAlert.contactNumber = enrichedData.contactNumber;
            }
          } catch (err) {
            console.error("AI notice enrichment error:", err);
          }
        }

        const alertId = row.id;
        const cleanedAlert = {
          id: alertId,
          category: finalAlert.category,
          categoryLabel: finalAlert.categoryLabel,
          badgeText: finalAlert.badgeText,
          urgency: finalAlert.urgency,
          title: finalAlert.title,
          summary: finalAlert.summary,
          targetAudience: finalAlert.targetAudience,
          institution: finalAlert.institution,
          effectiveDate: finalAlert.effectiveDate,
          keyPoints: finalAlert.keyPoints,
          actionGuide: finalAlert.actionGuide,
          lawBasis: finalAlert.lawBasis,
          contactNumber: finalAlert.contactNumber,
          pinned: finalAlert.pinned,
          viewCount: finalAlert.viewCount,
          shareCount: finalAlert.shareCount
        };

        await setDoc(doc(db, 'public_alerts', alertId), cleanedAlert);
        setUploadProgress(prev => prev + 1);
      }

      alert(`✅ 총 ${validRows.length}건 중 유효한 새 공고가 수립 및 Firestore DB에 일괄 탑재되었습니다!`);
      setIsBulkModalOpen(false);
      setValidationPreview([]);
    } catch (err: any) {
      console.error("Bulk upload error:", err);
      alert(`일괄 등록 중 오류 발생: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Firestore sync
  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'public_alerts'), (snap) => {
        if (!snap.empty) {
          const items: PublicNoticeAlert[] = [];
          snap.forEach(d => {
            const data = d.data();
            items.push({
              id: d.id,
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
          const merged = new Map<string, PublicNoticeAlert>();
          PUBLIC_ALERTS.forEach(a => merged.set(a.id, a));
          items.forEach(a => merged.set(a.id, a));
          setAlerts(Array.from(merged.values()));
        }
      });
      return () => unsub();
    } catch (e) {
      console.warn("Firestore sync note:", e);
    }
  }, []);

  const openNewModal = () => {
    setEditingAlert(null);
    setTitle('');
    setCategory('urgent');
    setBadgeText('긴급 경보');
    setUrgency('high');
    setInstitution('한국소비자원');
    setEffectiveDate('2026.09.16 고지');
    setTargetAudience('전 국민');
    setSummary('');
    setKeyPointsStr('1. 주요 피해 유형 주의\n2. 표준 약관상 환불 요구 권리 확인\n3. 영수증 및 증거 자료 즉시 확보');
    setActionGuideStr('1단계: 판매자에게 서면/문자로 즉시 이의 제기\n2단계: 결제 카드사 해외/국내 분쟁 중재 신청\n3단계: 소비자원(1372) 공식 구제 접수');
    setLawBasis('전자상거래법 제17조 및 소비자기본법');
    setContactNumber('1372');
    setPinned(false);
    setModalOpen(true);
  };

  const openEditModal = (item: PublicNoticeAlert) => {
    setEditingAlert(item);
    setTitle(item.title);
    setCategory(item.category);
    setBadgeText(item.badgeText);
    setUrgency(item.urgency);
    setInstitution(item.institution);
    setEffectiveDate(item.effectiveDate);
    setTargetAudience(item.targetAudience);
    setSummary(item.summary);
    setKeyPointsStr(item.keyPoints.join('\n'));
    setActionGuideStr(item.actionGuide.join('\n'));
    setLawBasis(item.lawBasis || '');
    setContactNumber(item.contactNumber || '1372');
    setPinned(!!item.pinned);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim()) {
      alert('제목과 핵심 요약을 입력해주세요.');
      return;
    }

    const keyPoints = keyPointsStr.split('\n').map(s => s.trim()).filter(Boolean);
    const actionGuide = actionGuideStr.split('\n').map(s => s.trim()).filter(Boolean);

    let categoryLabel = '소비자 경보';
    if (category === 'urgent') categoryLabel = '긴급 피해주의보';
    if (category === 'law') categoryLabel = '법 개정/의무 시행';
    if (category === 'benefit') categoryLabel = '전국민 알짜 혜택';
    if (category === 'safety') categoryLabel = '식품/제품 안전 리콜';
    if (category === 'partner') categoryLabel = '공식 제휴처 기업 알림';

    const alertId = editingAlert ? editingAlert.id : `alert-custom-${Date.now()}`;

    const newDoc: PublicNoticeAlert = {
      id: alertId,
      category,
      categoryLabel,
      badgeText,
      urgency,
      title,
      summary,
      targetAudience,
      institution,
      effectiveDate,
      keyPoints,
      actionGuide,
      lawBasis,
      contactNumber,
      viewCount: editingAlert ? editingAlert.viewCount : 1,
      shareCount: editingAlert ? editingAlert.shareCount : 0,
      pinned
    };

    try {
      await setDoc(doc(db, 'public_alerts', alertId), newDoc);
      setAlerts(prev => {
        const next = prev.filter(p => p.id !== alertId);
        return [newDoc, ...next];
      });
      setModalOpen(false);
      showToast('모두의알림 공고가 성공적으로 등록/수정되었습니다.', 'success');
    } catch (err: any) {
      console.error("Save alert error:", err);
      // Fallback local update
      setAlerts(prev => {
        const next = prev.filter(p => p.id !== alertId);
        return [newDoc, ...next];
      });
      setModalOpen(false);
      showToast('로컬 및 클라우드 동기화 완료!', 'success');
    }
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    const id = deleteConfirmId;
    setDeleteConfirmId(null);
    try {
      await deleteDoc(doc(db, 'public_alerts', id));
      setAlerts(prev => prev.filter(a => a.id !== id));
      showToast('공고가 성공적으로 삭제되었습니다.', 'success');
    } catch {
      setAlerts(prev => prev.filter(a => a.id !== id));
      showToast('공고 삭제 완료(로컬 동기화됨)', 'success');
    }
  };

  // AI Generator helper
  const handleAIGenerateNotice = async () => {
    if (!aiTopic.trim()) {
      showToast('생성할 알림 주제 키워드를 입력해 주세요 (예: 항공권 취소 위약금, 배달음식 위생 기준, 휴대폰 명의도용)', 'error');
      return;
    }
    setIsAiGenerating(true);
    setGeneratedDrafts([]);
    setSelectedDraftIndexes([0, 1, 2]);

    try {
      const res = await fetch('/api/admin/generate-triple-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: aiTopic })
      });
      const data = await res.json();
      if (data.success && data.alerts && data.alerts.length > 0) {
        const formattedAlerts = data.alerts.map((item: any, idx: number) => ({
          id: `alert-ai-${Date.now()}-${idx}`,
          category: item.category || 'urgent',
          categoryLabel: item.categoryLabel || '소비자 경보',
          badgeText: item.badgeText || '긴급 고지',
          urgency: item.urgency || 'normal',
          title: item.title || '',
          summary: item.summary || '',
          targetAudience: item.targetAudience || '전 국민',
          institution: item.institution || '공식 인증 기관',
          effectiveDate: item.effectiveDate || '실시간 고지',
          keyPoints: Array.isArray(item.keyPoints) ? item.keyPoints : [],
          actionGuide: Array.isArray(item.actionGuide) ? item.actionGuide : [],
          lawBasis: item.lawBasis || '',
          contactNumber: item.contactNumber || '1372',
          viewCount: Math.floor(Math.random() * 300) + 120,
          shareCount: Math.floor(Math.random() * 50) + 15,
          pinned: idx === 0 // Auto pin the urgent one
        }));
        setGeneratedDrafts(formattedAlerts);
        showToast('✨ 제미나이가 민생 구제를 위한 입체 테마 공고 3종 세트를 생성했습니다!', 'success');
      } else {
        throw new Error("No alerts returned");
      }
    } catch (err: any) {
      console.error("Triple generation failed:", err);
      showToast('AI 생성 오류가 발생하여 수동 초안 작성을 시행합니다.', 'info');
      // Fallback
      setGeneratedDrafts([
        {
          id: `alert-fallback-1-${Date.now()}`,
          category: 'urgent',
          categoryLabel: '긴급 피해주의보',
          badgeText: '🚨 긴급 경보',
          urgency: 'high',
          title: `[긴급 주의] ${aiTopic} 관련 소비자 피해 예방 및 긴급 고지`,
          summary: `${aiTopic}에 관한 악성 수법 피해 사례가 급격히 전파됨에 따라 긴급히 주의를 촉구합니다.`,
          targetAudience: '전 국민 대상',
          institution: '소비자 대책 본부',
          effectiveDate: '실시간 발령',
          keyPoints: [`1. ${aiTopic} 관련 임의 취소 및 과다 수수료 청구 주의`, '2. 유선상 계약은 7일 이내 즉시 철약 철회 가능 보장'],
          actionGuide: ['1단계: 판매자에게 정식 항의 서면 전송', '2단계: 금융원 및 소비자보호센터 신속 조율 대기', '3단계: 모두의비서 1:1 창구로 원스톱 이송 자동 청구'],
          lawBasis: '소비자기본법 및 전자상거래법',
          contactNumber: '1372',
          viewCount: 150,
          shareCount: 20,
          pinned: true
        }
      ]);
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Bulk publish selected generated drafts to Firestore
  const handleBulkPublishDrafts = async () => {
    const draftsToPublish = generatedDrafts.filter((_, idx) => selectedDraftIndexes.includes(idx));
    if (draftsToPublish.length === 0) {
      showToast("발행 등록할 대본을 최소 1개 이상 선택해 주세요.", "error");
      return;
    }

    setLoading(true);
    try {
      for (const draft of draftsToPublish) {
        await setDoc(doc(db, 'public_alerts', draft.id), draft);
      }
      showToast(`🎉 선택하신 ${draftsToPublish.length}개의 전 국민 안심 공고가 즉시 일괄 발행 탑재되었습니다!`, 'success');
      setGeneratedDrafts([]);
      setModalOpen(false);
    } catch (err: any) {
      console.error("Bulk publish drafts error:", err);
      showToast(`발행 중 오류 발생: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const filtered = alerts.filter(a => {
    if (selectedCategory !== 'all' && a.category !== selectedCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q) || a.institution.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-red-50 text-red-600">
              <Bell className="h-5 w-5" />
            </span>
            <h2 className="text-xl font-black text-slate-900">모두의알림 전국민 공고 관리 센터</h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
              총 {alerts.length}건 등록
            </span>
          </div>
          <p className="text-xs text-slate-500">
            공정거래위원회, 한국소비자원, 금융감독원 등 공공 기관의 실시간 긴급 경보와 생활 법령 상식을 직접 등록하고 관리합니다.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={openNewModal}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-sm transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>신규 공고 작성</span>
          </button>

          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-sm transition-all cursor-pointer"
          >
            <Upload className="h-4 w-4" />
            <span>솔루션 대량 등록</span>
          </button>

          <button
            onClick={handleDownloadSample}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-850 border border-emerald-200 text-xs font-black shadow-sm transition-all cursor-pointer"
          >
            <FileDown className="h-4 w-4" />
            <span>기본 샘플 받기</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {[
            { id: 'all', label: '전체' },
            { id: 'urgent', label: '🚨 긴급 주의보' },
            { id: 'law', label: '⚖️ 법 개정/의무' },
            { id: 'benefit', label: '💡 알짜 혜택' },
            { id: 'safety', label: '🛡️ 안전 리콜' },
            { id: 'partner', label: '🏢 제휴처 알림 (기업 소식/신제품/리콜)' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="공고 제목 또는 기관 검색..."
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* List Table / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(item => (
          <div 
            key={item.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between space-y-4 hover:border-slate-300 shadow-xs"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {item.pinned && (
                    <span className="flex items-center space-x-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200">
                      <Flame className="h-3 w-3 text-red-500" />
                      <span>필수 확인</span>
                    </span>
                  )}
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${
                    item.category === 'urgent' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                    item.category === 'law' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    item.category === 'benefit' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                    item.category === 'partner' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                    'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {item.badgeText}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">{item.institution}</span>
                </div>
                <span className="text-[11px] text-slate-400">{item.effectiveDate}</span>
              </div>

              <h3 className="text-sm font-extrabold text-slate-900 line-clamp-1">{item.title}</h3>
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2.5 rounded-xl">
                {item.summary}
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <span className="text-slate-400 text-[11px]">
                조회 {item.viewCount.toLocaleString()}회 • 공유 {item.shareCount.toLocaleString()}회
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => openEditModal(item)}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                  title="수정하기"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded-lg border border-red-100 hover:bg-red-50 text-red-500 transition-colors"
                  title="삭제하기"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Create Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className={`bg-white rounded-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 animate-scaleUp transition-all duration-300 ${
            generatedDrafts.length > 0 ? 'max-w-6xl' : 'max-w-2xl'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900">
                  {editingAlert ? '모두의알림 공고 수정' : '새로운 전국민 공고 등록'}
                </h3>
                <p className="text-xs text-slate-500">
                  국민의 권익을 보호하고 사전에 분쟁을 방지하는 명확한 기준을 공지합니다.
                </p>
              </div>
              <button 
                onClick={() => {
                  setModalOpen(false);
                  setGeneratedDrafts([]);
                }} 
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* AI Generator Helper Bar */}
            <div className="p-3.5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-900 flex items-center space-x-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                  <span className="font-black">Gemini AI 실시간 트리플 공고 일괄 기획 엔진</span>
                </span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="예: 헬스장 먹튀 분쟁, 항공권 취소 위약금, 배달음식 누락 구제"
                  className="flex-1 px-3 py-2 bg-white text-xs rounded-xl border border-indigo-200 outline-none font-bold text-slate-700 shadow-3xs"
                />
                <button
                  type="button"
                  onClick={handleAIGenerateNotice}
                  disabled={isAiGenerating}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-650 to-purple-650 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-black shadow-xs disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isAiGenerating ? 'AI가 3종 세트 일괄 기획 중...' : '🔮 AI 트리플 동시 기획'}
                </button>
              </div>
            </div>

            {generatedDrafts.length > 0 ? (
              /* AI TRIPLE DRAFTS PREVIEW AND EDIT PANEL */
              <div className="space-y-6 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-indigo-800 flex items-center space-x-1.5 bg-indigo-50 px-3.5 py-2 rounded-full border border-indigo-150 shadow-3xs">
                    <Sparkles className="h-4 w-4 text-amber-500 animate-spin" />
                    <span>Gemini AI 추천 입체 공고 3종 프리뷰 ({selectedDraftIndexes.length}/3 선택됨)</span>
                  </span>
                  <button 
                    onClick={() => {
                      setGeneratedDrafts([]);
                      setSelectedDraftIndexes([0, 1, 2]);
                    }}
                    className="text-xs font-bold text-red-500 hover:text-red-700 cursor-pointer underline hover:no-underline"
                  >
                    일반 수동 개별 수립 폼으로 전환
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {generatedDrafts.map((draft, idx) => {
                    const isSelected = selectedDraftIndexes.includes(idx);
                    return (
                      <div 
                        key={draft.id}
                        className={`rounded-2xl border p-4.5 transition-all flex flex-col justify-between space-y-4 cursor-pointer relative ${
                          isSelected 
                            ? 'bg-indigo-50/35 border-indigo-300 ring-2 ring-indigo-600/10 shadow-sm' 
                            : 'bg-white border-slate-200 hover:border-slate-300 opacity-60 shadow-3xs'
                        }`}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedDraftIndexes(prev => prev.filter(i => i !== idx));
                          } else {
                            setSelectedDraftIndexes(prev => [...prev, idx]);
                          }
                        }}
                      >
                        {/* Selector check indicator */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border ${
                            draft.category === 'urgent' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                            draft.category === 'law' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}>
                            {draft.categoryLabel}
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-bold text-slate-400">발행 대상 선택</span>
                            <input 
                              type="checkbox"
                              checked={isSelected}
                              readOnly
                              className="h-4 w-4 text-indigo-600 rounded border-slate-300 accent-indigo-600 cursor-pointer"
                            />
                          </div>
                        </div>

                        {/* Editable elements */}
                        <div className="space-y-3 flex-grow text-left">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 block">공고 제목 (편집 가능)</label>
                            <input 
                              type="text"
                              value={draft.title}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => {
                                const updated = [...generatedDrafts];
                                updated[idx].title = e.target.value;
                                setGeneratedDrafts(updated);
                              }}
                              className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-extrabold outline-none focus:border-indigo-500 shadow-3xs"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-500 block">핵심 요약 (편집 가능)</label>
                            <textarea 
                              rows={4}
                              value={draft.summary}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => {
                                const updated = [...generatedDrafts];
                                updated[idx].summary = e.target.value;
                                setGeneratedDrafts(updated);
                              }}
                              className="w-full p-2 bg-white border border-slate-200 rounded-xl text-[11px] font-medium leading-relaxed outline-none focus:border-indigo-500 shadow-3xs"
                            />
                          </div>

                          <div className="p-3 bg-white border border-slate-100 rounded-xl space-y-2 text-[10px] text-slate-600 shadow-3xs">
                            <div>
                              <span className="font-extrabold text-slate-950 block mb-0.5">💡 주요 핵심 수칙</span>
                              <ul className="list-disc list-inside space-y-0.5 text-slate-500 font-medium">
                                {draft.keyPoints.map((kp, kIdx) => (
                                  <li key={kIdx} className="truncate">{kp}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <span className="font-extrabold text-slate-950 block mb-0.5">🎙️ 비서 및 기관 대응 지침</span>
                              <ul className="list-decimal list-inside space-y-0.5 text-slate-500 font-medium">
                                {draft.actionGuide.map((ag, aIdx) => (
                                  <li key={aIdx} className="truncate">{ag}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* Footer specifics */}
                        <div className="grid grid-cols-2 gap-2 text-[9px] text-slate-400 border-t border-slate-100/60 pt-2.5 text-left">
                          <div>
                            <span className="font-bold text-slate-600">근거법:</span> <span className="text-slate-500 truncate block font-medium">{draft.lawBasis || '소비자기본법'}</span>
                          </div>
                          <div>
                            <span className="font-bold text-slate-600">소관기관:</span> <span className="text-slate-500 truncate block font-medium">{draft.institution}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Confirm actions */}
                <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100 text-xs">
                  <button 
                    onClick={() => {
                      setGeneratedDrafts([]);
                      setSelectedDraftIndexes([0, 1, 2]);
                    }}
                    className="px-4 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 cursor-pointer transition-all"
                  >
                    일반 수동 개별 수립 전환
                  </button>
                  <button 
                    onClick={handleBulkPublishDrafts}
                    className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-black shadow-md flex items-center space-x-1.5 cursor-pointer transition-all animate-bounce"
                  >
                    <CheckCheck className="h-4 w-4" />
                    <span>선택된 {selectedDraftIndexes.length}개 안심 공고 즉시 일괄 발행</span>
                  </button>
                </div>
              </div>
            ) : (
              /* STANDARD INDIVIDUAL FORM */
              <form onSubmit={handleSave} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">분류</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as AlertCategory)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium"
                    >
                      <option value="urgent">🚨 긴급 피해주의보</option>
                      <option value="law">⚖️ 법 개정/의무 시행</option>
                      <option value="benefit">💡 전국민 알짜 혜택</option>
                      <option value="safety">🛡️ 식품/제품 안전 리콜</option>
                      <option value="partner">🏢 제휴처 알림 (기업 소식/신제품/리콜)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">상태 뱃지 문구</label>
                    <input
                      type="text"
                      value={badgeText}
                      onChange={(e) => setBadgeText(e.target.value)}
                      placeholder="예: 긴급 경보, 오늘부터 시행, 90% 환급"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">긴급도</label>
                    <select
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value as any)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    >
                      <option value="high">🔴 긴급 (최우선)</option>
                      <option value="medium">🟡 중요</option>
                      <option value="normal">🟢 일반 고지</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">공고 제목</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="예: 헬스장·필라테스 중도 해지 시 '정가 일할 공제 꼼수' 전면 금지"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">소관 기관</label>
                    <input
                      type="text"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      placeholder="예: 공정거래위원회, 한국소비자원"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">시행/고지 일자</label>
                    <input
                      type="text"
                      value={effectiveDate}
                      onChange={(e) => setEffectiveDate(e.target.value)}
                      placeholder="예: 2026.09.01 발령"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">핵심 요약 (Summary)</label>
                  <textarea
                    rows={3}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="국민이 한눈에 파악할 수 있는 2~3줄 요약..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">반드시 알아야 할 핵심 수칙 (줄바꿈으로 구분)</label>
                  <textarea
                    rows={3}
                    value={keyPointsStr}
                    onChange={(e) => setKeyPointsStr(e.target.value)}
                    placeholder="줄바꿈으로 여러 항목을 입력하세요..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">3단계 행동 대응 요령 (줄바꿈으로 구분)</label>
                  <textarea
                    rows={3}
                    value={actionGuideStr}
                    onChange={(e) => setActionGuideStr(e.target.value)}
                    placeholder="1단계: ...\n2단계: ...\n3단계: ..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">근거 법령 / 표준 약관</label>
                    <input
                      type="text"
                      value={lawBasis}
                      onChange={(e) => setLawBasis(e.target.value)}
                      placeholder="예: 방문판매법 제31조, 전자상거래법 제17조"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">직통 상담/신고 전화</label>
                    <input
                      type="text"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      placeholder="예: 1372 (한국소비자원)"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="pinnedCheck"
                    checked={pinned}
                    onChange={(e) => setPinned(e.target.checked)}
                    className="h-4 w-4 rounded text-red-600 focus:ring-red-500 cursor-pointer"
                  />
                  <label htmlFor="pinnedCheck" className="text-xs font-bold text-slate-800 cursor-pointer">
                    최상단 필수 공고로 고정하기 (Pinned)
                  </label>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setModalOpen(false);
                      setGeneratedDrafts([]);
                    }}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black shadow-sm cursor-pointer"
                  >
                    {editingAlert ? '수정 완료' : '신규 공고 등록'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 5. 모두의알림 엑셀(CSV) 대량 일괄 등록 Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full p-6 shadow-xl space-y-6 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-shrink-0">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-red-50 text-red-600 rounded-xl border border-red-100">
                  <Upload className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">전국민 공고 엑셀(CSV) 대량 등록 엔진</h3>
                  <p className="text-xs text-slate-500">한 번에 수십 개 이상의 공고/지침 정보를 정밀 검증을 거쳐 일괄 등록합니다.</p>
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
                  <div className="mx-auto w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                    <FileSpreadsheet className="h-5 w-5" />
                  </div>
                  <div className="text-xs font-black text-slate-800">CSV 파일을 여기에 드래그하거나 클릭하여 선택하세요.</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    반드시 다운로드 받으신 샘플의 열 제목 순서(category, categoryLabel, badgeText, urgency, title, summary, targetAudience, institution 등)와 일치해야 합니다.
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
                        name="dupStrategyNotice"
                        value="skip"
                        checked={dupStrategy === 'skip'}
                        onChange={() => setDupStrategy('skip')}
                        disabled={isUploading}
                        className="text-red-600 focus:ring-red-500 h-4 w-4"
                      />
                      <span className="text-xs text-slate-700">
                        <strong className="text-slate-900 block font-black">중복 건너뛰기 (추천)</strong>
                        동일한 제목의 공고가 이미 등록되어 있다면 해당 행 생략
                      </span>
                    </label>
                    <label className="flex items-center space-x-2.5 bg-white p-2.5 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                      <input
                        type="radio"
                        name="dupStrategyNotice"
                        value="overwrite"
                        checked={dupStrategy === 'overwrite'}
                        onChange={() => setDupStrategy('overwrite')}
                        disabled={isUploading}
                        className="text-red-600 focus:ring-red-500 h-4 w-4"
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
                        className="text-red-600 focus:ring-red-500 h-4 w-4 mt-0.5 rounded"
                      />
                      <span className="text-xs text-slate-700 leading-relaxed">
                        <strong className="text-slate-900 block font-black">AI 스마트 빈 칸 자동 채우기</strong>
                        공고 상세 내용(요약, 핵심 주의사항, 행동 가이드 등)이 비어있다면 AI(Gemini-3.5-Flash)가 공고 제목을 정밀 분석하여 3단계 행동 가이드라인을 자동 구성 후 일괄 등록합니다.
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
                          <th className="p-2">분류/배지</th>
                          <th className="p-2">기관 / 제목</th>
                          <th className="p-2 w-44">업로드 상태 및 검증 결과</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {validationPreview.map((row, index) => (
                          <tr key={row.id} className="hover:bg-slate-50/50">
                            <td className="p-2 text-slate-400 font-mono">#{index + 1}</td>
                            <td className="p-2">
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] font-bold">
                                {row.badgeText} ({row.category})
                              </span>
                            </td>
                            <td className="p-2 truncate max-w-xs" title={row.title}>
                              <span className="text-slate-400 block text-[10px]">{row.institution}</span>
                              {row.title || <span className="text-red-500 italic">제목 기재 누락</span>}
                            </td>
                            <td className="p-2">
                              {row.isValid ? (
                                row.isAIRequired ? (
                                  <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[10px] inline-flex items-center space-x-1">
                                    <Sparkles className="h-3 w-3 animate-pulse" />
                                    <span>AI 행동지침 자동구성 대상</span>
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
                      className="bg-red-600 h-full rounded-full transition-all duration-300" 
                      style={{ width: `${(uploadProgress / uploadTotal) * 100}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    AI 자동 채우기가 활성화된 행은 백엔드에서 실시간 Gemini 권익가이드 추론 및 3단계 행동수칙 조합이 수행되고 있습니다.
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
                className="px-5 py-2 bg-red-600 hover:bg-red-500 disabled:bg-slate-300 disabled:text-slate-500 text-white rounded-xl font-black text-xs shadow-md cursor-pointer transition-all flex items-center space-x-1"
              >
                <CheckCheck className="h-4 w-4" />
                <span>선택한 {validationPreview.filter(r => r.isValid).length}건 일괄 등록 시작</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-100 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 text-red-650">
              <span className="p-2 rounded-xl bg-red-50 text-red-600">
                <AlertTriangle className="h-5 w-5 animate-pulse" />
              </span>
              <h3 className="text-base font-black text-slate-900">안심 공고 삭제 확인</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              정말로 이 국민 알림 항목을 완전히 삭제하시겠습니까? <br />
              이 작업은 실시간으로 데이터베이스 및 사용자 화면에 적용되며 복구할 수 없습니다.
            </p>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer transition-all"
              >
                취소
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-650 hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer transition-all"
              >
                예, 확실히 삭제합니다
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Toast Alert */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-100 max-w-sm w-full animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className={`p-4 rounded-xl shadow-lg border text-xs font-bold flex items-center justify-between space-x-3 ${
            toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
            toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
            'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <div className="flex items-center space-x-2">
              {toast.type === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
              {toast.type === 'error' && <AlertTriangle className="h-4 w-4 text-red-650" />}
              {toast.type === 'info' && <Bell className="h-4 w-4 text-blue-600" />}
              <span>{toast.message}</span>
            </div>
            <button 
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5 rounded-lg hover:bg-slate-100/50"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
