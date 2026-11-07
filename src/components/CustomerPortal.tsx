import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../AuthContext';
import { 
  PlusCircle, 
  Trash2, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  FileText, 
  LogOut, 
  HelpCircle,
  TrendingUp,
  BrainCircuit,
  Info,
  Calendar,
  Search,
  Filter,
  Copy,
  Check,
  ThumbsUp,
  MessageCircle,
  X,
  CheckCheck,
  ShieldCheck,
  ExternalLink,
  Paperclip,
  Image as ImageIcon,
  File,
  Eye,
  CheckCircle,
  Zap,
  Bell,
  ShieldAlert,
  Send
} from 'lucide-react';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  deleteDoc, 
  doc, 
  setDoc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { CATEGORY_MAP, Inquiry, InquiryParentCategory, InquiryAttachment, UserProfile } from '../types';
import { InquiryTemplateModal } from './InquiryTemplateModal';

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

export interface CustomerPortalProps {
  initialPrefill?: {
    parentCategory?: InquiryParentCategory;
    subCategory?: string;
    title?: string;
    content?: string;
  } | null;
  onClearPrefill?: () => void;
  onNavigateToHub?: () => void;
  onNavigateToAlerts?: () => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  initialPrefill,
  onClearPrefill,
  onNavigateToHub,
  onNavigateToAlerts
}) => {
  const { user, userProfile, logout } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [parentCat, setParentCat] = useState<InquiryParentCategory>('shopping');
  const [subCat, setSubCat] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  // Prefill handler from InquiryHub
  useEffect(() => {
    if (initialPrefill) {
      if (initialPrefill.parentCategory) setParentCat(initialPrefill.parentCategory);
      if (initialPrefill.subCategory) setSubCat(initialPrefill.subCategory);
      if (initialPrefill.title) setTitle(initialPrefill.title);
      if (initialPrefill.content) setContent(initialPrefill.content);

      setTimeout(() => {
        const formEl = document.getElementById('customer-inquiry-form');
        if (formEl) {
          formEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);

      showToast('✨ 문의 허브 솔루션이 작성 양식에 자동 입력되었습니다.');
      if (onClearPrefill) onClearPrefill();
    }
  }, [initialPrefill]);

  // UI accordion state for replies
  const [expandedInquiryId, setExpandedInquiryId] = useState<string | null>(null);

  // Tab state: 'all' (전체 문의) | 'pending' (처리 중) | 'completed' (문의 완료)
  const [inquiryTab, setInquiryTab] = useState<'all' | 'pending' | 'completed'>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState<'all' | InquiryParentCategory>('all');
  const [copiedReplyId, setCopiedReplyId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<InquiryAttachment[]>([]);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [feedbackInputMap, setFeedbackInputMap] = useState<Record<string, string>>({});
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState<Record<string, boolean>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleCopyReply = (text: string, inqId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedReplyId(inqId);
    showToast('공식 답변 내용이 클립보드에 복사되었습니다.');
    setTimeout(() => setCopiedReplyId(null), 2500);
  };

  // Handle local file selection & conversion to base64 attachment
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (attachments.length + files.length > 3) {
      alert('첨부파일은 최대 3개까지 첨부 가능합니다.');
      return;
    }

    setIsUploadingFile(true);
    const newAttachments: InquiryAttachment[] = [];
    const fileList = Array.from(files) as File[];

    fileList.forEach((file: File) => {
      if (file.size > 2 * 1024 * 1024) {
        alert(`'${file.name}' 파일이 너무 큽니다. 2MB 이하 파일만 첨부 가능합니다.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          newAttachments.push({
            name: file.name,
            size: file.size,
            type: file.type || 'application/octet-stream',
            dataUrl: reader.result
          });

          if (newAttachments.length === fileList.length) {
            setAttachments((prev) => [...prev, ...newAttachments]);
            setIsUploadingFile(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
          }
        }
      };
      reader.onerror = () => {
        setIsUploadingFile(false);
        alert(`'${file.name}' 파일 읽기에 실패했습니다.`);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveAttachment = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  // Persistent Firestore satisfaction rating
  const handleSatisfaction = async (inqId: string, type: 'helpful' | 'more_info', e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const inqRef = doc(db, 'inquiries', inqId);
      const feedbackText = feedbackInputMap[inqId]?.trim() || '';
      await updateDoc(inqRef, {
        satisfaction: {
          rating: type,
          submittedAt: new Date(),
          feedback: feedbackText
        },
        updatedAt: serverTimestamp()
      });

      showToast(type === 'helpful' 
        ? '⭐ 소중한 만족도 피드백이 파이어베이스에 영구 저장되었습니다. 감사합니다!' 
        : '📝 추가 문의 필요 피드백이 등록되었습니다. 담당 파트너가 확인할 수 있습니다.');
    } catch (err: any) {
      console.error('Satisfaction error:', err);
      showToast('피드백 저장 중 오류가 발생했습니다: ' + err.message);
    }
  };

  // Sync subcategory on mount only if not populated
  useEffect(() => {
    if (!subCat) {
      const defaultSub = CATEGORY_MAP[parentCat].subCategories[0]?.value || '';
      setSubCat(defaultSub);
    }
  }, []);

  const handleSelectTemplate = (
    parentCategory: InquiryParentCategory,
    subCategory: string,
    tplTitle: string,
    tplContent: string
  ) => {
    setParentCat(parentCategory);
    setSubCat(subCategory);
    setTitle(tplTitle);
    setContent(tplContent);
    setFormError('');
    setSuccessMsg('');
  };

  // Real-time Firestore Sync
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'inquiries'),
      where('authorId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docsData: Inquiry[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        docsData.push({
          id: docSnap.id,
          ...data
        } as Inquiry);
      });
      setInquiries(docsData);
      setLoading(false);
    }, (error) => {
      console.error("Inquiries Sync Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Real-time sync for partners to support smart auto-assignment
  const [partnerList, setPartnerList] = useState<UserProfile[]>([]);
  useEffect(() => {
    const qPartners = query(
      collection(db, 'users'),
      where('role', '==', 'partner')
    );
    const unsubscribe = onSnapshot(qPartners, (snapshot) => {
      const partners: UserProfile[] = [];
      snapshot.forEach((d) => {
        partners.push(d.data() as UserProfile);
      });
      setPartnerList(partners);
    }, (err) => {
      console.error("Partners fetch error:", err);
    });
    return () => unsubscribe();
  }, []);

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSuccessMsg('');

    if (title.trim().length < 2 || title.length > 120) {
      setFormError('제목은 2자 이상, 120자 이내로 입력해 주세요.');
      return;
    }
    if (content.trim().length < 5 || content.length > 3000) {
      setFormError('본문은 5자 이상, 3000자 이내로 입력해 주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Build automatic AI Mock insights during submission to enrich data
      const sampleInsights: Record<InquiryParentCategory, any> = {
        shopping: {
          sentiment: 'neutral',
          summarizedNeed: '카드 오결제 및 쇼핑 내역 환불 희망',
          suggestedResponse: '안녕하세요! 고객님의 쇼핑/결제 관련 문의가 성공적으로 접수되었습니다. 현재 1차 세부 분석이 완료되어 담당 부서 및 매칭 고수가 내용을 상세 확인하고 있습니다. 자세한 정밀 매칭 및 최종 결과는 확인 즉시 실시간으로 업데이트될 예정입니다.'
        },
        travel: {
          sentiment: 'urgent',
          summarizedNeed: '항공/숙박 일정 취소 및 예약 변경 조율',
          suggestedResponse: '안녕하세요! 고객님께서 문의하신 예약 일정 취소 및 일정 조율 요청이 성공적으로 접수되었습니다. 신속히 규정을 조회하고 최적의 대안을 정밀 분석 중이며, 상세 매칭 결과가 완료되는 대로 실시간으로 업데이트해 드리겠습니다.'
        },
        restaurant: {
          sentiment: 'positive',
          summarizedNeed: '단체 대관 대형 행사 세미나 코스 견적 산정',
          suggestedResponse: '안녕하세요! 요식업 단체 대관 및 행사 세미나 코스에 관한 견적 문의가 정상 접수되었습니다. 인원과 상세 제안 혜택을 바탕으로 최선의 할인 제안서를 작성 중이며, 세부 조율이 완료되는 대로 실시간으로 업데이트해 드리겠습니다.'
        },
        other: {
          sentiment: 'neutral',
          summarizedNeed: '일반 접수 분류 및 기술 위젯 도입 문의',
          suggestedResponse: '안녕하세요! 고객님의 소중한 문의가 접수되었습니다. 1차 대응 처리가 안전하게 완료되었으며, 내용에 따라 전문 마스터 및 파트너사가 정밀 확인 중입니다. 상세 결과 및 1차 안내는 결정되는 대로 즉시 실시간으로 업데이트될 예정입니다.'
        }
      };

      const aiData = sampleInsights[parentCat];
      const docRef = doc(collection(db, 'inquiries'));

      // Smart Auto-Assignment:
      // Find partner matching the inquiry category, or select the best available partner
      let assignedPartnerId = '';
      let assignedPartnerName = '';
      let autoAssigned = false;

      const matchingPartners = partnerList.filter((p) => 
        p.partnerCategory === parentCat || p.partnerCategory === 'all'
      );
      const chosenPartner = matchingPartners.length > 0 ? matchingPartners[0] : (partnerList[0] || null);

      if (chosenPartner) {
        assignedPartnerId = chosenPartner.uid;
        assignedPartnerName = chosenPartner.displayName || chosenPartner.email.split('@')[0] || '지정 제휴 파트너';
        autoAssigned = true;
      }

      const newInquiry = {
        id: docRef.id,
        parentCategory: parentCat,
        subCategory: subCat,
        title: title.trim(),
        content: content.trim(),
        authorId: user?.uid || '',
        authorName: userProfile?.displayName || user?.displayName || user?.email?.split('@')[0] || '사용자',
        authorEmail: user?.email || '',
        status: autoAssigned ? 'routing' : 'pending',
        assignedPartnerId: assignedPartnerId || null,
        assignedPartnerName: assignedPartnerName || null,
        assignedAt: autoAssigned ? new Date() : null,
        autoAssigned: autoAssigned,
        attachments: attachments.length > 0 ? attachments : [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        aiAnalysis: aiData
      };

      await setDoc(docRef, newInquiry);
      
      // Clear forms
      setTitle('');
      setContent('');
      setAttachments([]);
      setSuccessMsg(autoAssigned 
        ? `✅ 문의가 성공적으로 등록되었습니다! [${assignedPartnerName}] 파트너에게 스마트 자동 라우팅되어 즉시 검토에 착수합니다.`
        : '✅ 문의가 성공적으로 실시간 등록되었습니다! 어드민에서 즉시 검토에 착수합니다.');
      
      // Auto-expand new inquiry
      setExpandedInquiryId(docRef.id);
    } catch (err: any) {
      console.error("Error creating inquiry:", err);
      setFormError('문의 접수 중 장애가 발생했습니다: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelInquiry = async (inquiryId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering accordion toggling
    if (!window.confirm('정말로 이 문의 접수를 취소하고 파이어베이스에서 삭제하시겠습니까?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'inquiries', inquiryId));
    } catch (err) {
      console.error("Delete inquiry error:", err);
      alert('접수 취소 중 실패했습니다. (답변이 이미 진행 중일 수 있습니다.)');
    }
  };

  // Compute AI Trend Report based on current user's histories
  const generateAITrends = () => {
    if (inquiries.length === 0) {
      return {
        dominantCategory: '없음',
        insightMessage: '아직 접수된 문의 이력이 없습니다. 문의를 한 건 이상 작성하시면 Gemini 분석 엔진이 작동하기 시작합니다.',
        aiOffer: '새로운 제안이 대기 중입니다.'
      };
    }

    // Tally parent categories
    const counts: Record<string, number> = {};
    inquiries.forEach((inq) => {
      counts[inq.parentCategory] = (counts[inq.parentCategory] || 0) + 1;
    });

    let maxCat = 'shopping';
    let maxVal = 0;
    Object.entries(counts).forEach(([cat, val]) => {
      if (val > maxVal) {
        maxVal = val;
        maxCat = cat;
      }
    });

    const labelMap: Record<string, string> = {
      shopping: '쇼핑/결제',
      travel: '여가/여행/항공',
      restaurant: '외식/다이닝',
      other: '기술 및 기타 피드백'
    };

    const smartOffers: Record<string, { msg: string; offer: string }> = {
      shopping: {
        msg: '결제 및 쇼핑 지출 통제와 신속한 정산에 관심도가 집중되어 있습니다. 이중 결제 예방 솔루션을 도입해보세요.',
        offer: '🎁 [스마트 혜택] 제휴몰 이용 시 누적 5% 캐시백 프로모션 코드가 발급되었습니다.'
      },
      travel: {
        msg: '주로 숙박 및 항공 예매 취소/일정 변경 패턴이 감지되었습니다. 특보 알림 연동 및 여정 맞춤 플래너 이용 대상입니다.',
        offer: '✈️ [AI 추천] 이번 달 가장 선호도가 급상승한 청정 제주 에코 숙소 패키지 15% 단독 할인 제공.'
      },
      restaurant: {
        msg: '단체 모임, 비즈니스 디너, 혹은 외식 단가 견적 산출 이력이 누적되어 비즈니스 플래닝 패턴으로 정밀 감지됩니다.',
        offer: '🤝 [맞춤 제안] 제휴 패밀리 레스토랑 대관 시 무료 VIP 테이블 업그레이드 전용 바우처 증정.'
      },
      other: {
        msg: '임베드 API 연동 등 소통 자동화 기술 관련 문의 비율이 높습니다. 차세대 AI 어시스턴트 도입 플랜을 수집하세요.',
        offer: '💻 [엔터프라이즈] 자사몰 1년 제휴 위젯 무상 사용권 및 엔지니어 1:1 디버깅 슬롯 배포.'
      }
    };

    return {
      dominantCategory: labelMap[maxCat] || '종합 분류',
      insightMessage: smartOffers[maxCat]?.msg || '다양한 실시간 질문 이력이 기록 중입니다. 균형 잡힌 다이닝 및 라이프 라이프사이클을 추적합니다.',
      aiOffer: smartOffers[maxCat]?.offer || '종합 분석을 기반으로 한 스마트 서비스 추천을 수령하세요.'
    };
  };

  const aiReport = generateAITrends();

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* User Hello Header */}
      <div className="border-b border-slate-100 pb-6">
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">모두의문의 User Workspace</span>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            반갑습니다, <span className="text-indigo-600 font-extrabold">{userProfile?.displayName || user?.displayName || user?.email?.split('@')[0]}</span> 님!
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            계정 권한 등급: <span className="font-semibold text-slate-700 uppercase bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">{userProfile?.role || 'customer'}</span> | 연결 상태: <span className="text-green-600 font-bold">실시간 동기화 활성화</span>
          </p>
        </div>
      </div>

      {/* 🚀 Wide Hero Banner (동일 알림 와이드 섹션 스타일: 1:1 소비자 권익 보호 및 분쟁 해결 접수처) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white p-8 md:p-10 shadow-xl border border-indigo-900/50">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-bold tracking-wide">
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-300 animate-pulse" />
            <span>신속 공정 분쟁 해결 • 전국민 1:1 소비자 권익 구제 접수처</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            불공정 거래 & 부당 위약금 & 환불 거부<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-sky-200 to-indigo-200">
              전문 중재 및 1:1 권익 구제 맞춤 접수
            </span>
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            헬스장·필라테스 위약금 상한 초과, 모바일 기프티콘 미사용 90% 환불 거부, 전자상거래 배송 지연 및 제휴 기업 리콜 상담까지
            정부 표준 분쟁해결기준과 공정위 지침에 입각하여 공식 제휴처 및 전담 해결팀이 신속히 도와드립니다.
          </p>

          {/* Quick Search & Filter Bar inside Hero */}
          <div className="pt-2">
            <div className="relative flex items-center">
              <Search className="absolute left-4.5 h-5 w-5 text-indigo-400 pointer-events-none" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="내 접수 내역 및 답변 검색 (예: 헬스장, 환불, 현대차 리콜, 삼성전자, 배송지)..."
                className="w-full pl-12 pr-10 py-3.5 text-xs sm:text-sm bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-slate-900 placeholder:text-slate-400 focus:placeholder:text-slate-400 rounded-2xl border border-indigo-400/30 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 backdrop-blur-md transition-all outline-none font-medium"
              />
              {searchKeyword && (
                <button
                  type="button"
                  onClick={() => setSearchKeyword('')}
                  className="absolute right-4 text-slate-400 hover:text-white focus:text-slate-700 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Action Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                const formEl = document.getElementById('customer-inquiry-form');
                if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/30 hover:bg-indigo-500/40 border border-indigo-400/30 text-indigo-100 text-xs font-bold transition-all cursor-pointer"
            >
              <PlusCircle className="h-3.5 w-3.5 text-amber-300" />
              <span>바로 1:1 접수 작성하기</span>
            </button>

            {onNavigateToAlerts && (
              <button
                type="button"
                onClick={onNavigateToAlerts}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-slate-200 text-xs font-bold transition-all cursor-pointer"
              >
                <Bell className="h-3.5 w-3.5 text-sky-300" />
                <span>모두의알림 최신 고지 확인</span>
              </button>
            )}

            {onNavigateToHub && (
              <button
                type="button"
                onClick={onNavigateToHub}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-slate-200 text-xs font-bold transition-all cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                <span>25선 완벽 정답 솔루션</span>
              </button>
            )}
          </div>
        </div>

        {/* Ambient Glow Effects */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-20 w-64 h-64 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />
      </div>

      {/* Grid: 1. Submission Form (Left) & 2. My History & AI Recommendation (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Form Column */}
        <div className="lg:col-span-5 bg-white border border-slate-100 rounded-xl p-6 shadow-sm space-y-5">
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-1.5">
              <PlusCircle className="h-4.5 w-4.5 text-indigo-600" />
              <span>새로운 모든 종류의 문의하기</span>
            </h3>
            <p className="text-xs text-slate-500">
              정교한 2단계 분류 시스템으로 적확한 담당자에게 알림을 전송합니다.
            </p>
          </div>

          {/* Inquiry Hub Quick Access Link Banner */}
          {onNavigateToHub && (
            <div className="p-3 bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 border border-indigo-100 rounded-xl flex items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center space-x-2 text-left">
                <div className="p-1.5 bg-indigo-600 text-white rounded-lg">
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                </div>
                <div>
                  <span className="text-xs font-black text-indigo-950 block">문의 전 25선 완벽 정답 허브 확인</span>
                  <span className="text-[10px] text-slate-500">각 분야별 최다 질문과 완벽한 정답 가이드가 준비되어 있습니다.</span>
                </div>
              </div>
              <button
                type="button"
                onClick={onNavigateToHub}
                className="px-2.5 py-1.5 bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold rounded-lg transition-all cursor-pointer shrink-0 shadow-2xs flex items-center space-x-1"
              >
                <span>문의 허브 가기</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          )}

          {formError && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-xs rounded-lg font-medium">
              ⚠️ {formError}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-green-50 border border-green-100 text-green-700 text-xs rounded-lg font-medium">
              {successMsg}
            </div>
          )}

          <form id="customer-inquiry-form" onSubmit={handleInquirySubmit} className="space-y-4">
            
            {/* 1차 대분류 Parent Category */}
            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-600 block">1차 대분류 카테고리</label>
                <button
                  type="button"
                  onClick={() => setIsTemplateModalOpen(true)}
                  className="inline-flex items-center space-x-1 px-2.5 py-1 text-[11px] font-extrabold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-md transition-all cursor-pointer shadow-sm animate-pulse"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>스마트 템플릿 불러오기</span>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(CATEGORY_MAP) as InquiryParentCategory[]).map((catKey) => {
                  const cat = CATEGORY_MAP[catKey];
                  const isSelected = parentCat === catKey;
                  return (
                    <button
                      key={catKey}
                      type="button"
                      onClick={() => {
                        setParentCat(catKey);
                        const defaultSub = CATEGORY_MAP[catKey].subCategories[0]?.value || '';
                        setSubCat(defaultSub);
                      }}
                      className={`px-3 py-2 text-xs font-semibold rounded-lg text-left border transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 ring-1 ring-indigo-600/10'
                          : 'border-slate-100 bg-slate-50 hover:bg-slate-100/70 text-slate-600'
                      }`}
                    >
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2차 소분류 Sub Category */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-600 block">2차 세부 소분류</label>
              <select
                value={subCat}
                onChange={(e) => setSubCat(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white focus:border-indigo-500 focus:outline-none"
              >
                {CATEGORY_MAP[parentCat].subCategories.map((sub) => (
                  <option key={sub.value} value={sub.value}>
                    {sub.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-600 block">문의 제목</label>
              <input 
                type="text"
                required
                placeholder="예: 배송지 주소 변경 요청 건"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:border-indigo-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 block text-right">{title.length} / 120자</span>
            </div>

            {/* Content Body */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-600 block">상세 문의 내용</label>
              <textarea 
                required
                rows={5}
                placeholder={CATEGORY_MAP[parentCat].subCategories.find(s => s.value === subCat)?.placeholder || '상세 규격 및 요청 사항을 자세히 작성해 주세요.'}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:border-indigo-500 focus:outline-none font-mono"
              />
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center space-x-1">
                  <Info className="h-3 w-3 text-indigo-400" />
                  <span>실시간 유효성 체크 적용 중</span>
                </span>
                <span>{content.length} / 3000자</span>
              </div>
            </div>

            {/* File Attachments (Images, Documents) */}
            <div className="space-y-2 text-left">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-600 flex items-center space-x-1">
                  <Paperclip className="h-3.5 w-3.5 text-indigo-600" />
                  <span>사진 및 참고 파일 첨부</span>
                  <span className="text-[10px] font-normal text-slate-400">(선택, 최대 3개 / 2MB 이하)</span>
                </label>
                <span className="text-[10px] text-slate-400 font-semibold">{attachments.length} / 3</span>
              </div>

              {/* Hidden file input */}
              <input 
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.txt"
                onChange={handleFileChange}
                className="hidden"
                id="customer-portal-file-input"
              />

              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={attachments.length >= 3 || isUploadingFile}
                  className="flex items-center justify-center space-x-2 py-2 px-3 border border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/40 hover:bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  <span>{isUploadingFile ? '파일 인코딩 변환 중...' : '이미지 또는 문서 첨부하기'}</span>
                </button>

                {/* Attached file items */}
                {attachments.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {attachments.map((att, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      >
                        <div className="flex items-center space-x-2 truncate pr-2">
                          {att.type.startsWith('image/') ? (
                            <img 
                              src={att.dataUrl} 
                              alt={att.name} 
                              className="h-7 w-7 object-cover rounded border border-slate-200" 
                            />
                          ) : (
                            <File className="h-4 w-4 text-slate-500 shrink-0" />
                          )}
                          <div className="truncate">
                            <p className="font-medium text-slate-800 text-xs truncate max-w-[170px]">{att.name}</p>
                            <p className="text-[10px] text-slate-400">{(att.size / 1024).toFixed(1)} KB</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1 shrink-0">
                          {att.type.startsWith('image/') && (
                            <button
                              type="button"
                              onClick={() => setPreviewImage(att.dataUrl)}
                              className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-all cursor-pointer"
                              title="미리보기"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveAttachment(idx)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded transition-all cursor-pointer"
                            title="삭제"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center space-x-2 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md shadow-indigo-600/10 cursor-pointer transition-all"
            >
              <PlusCircle className="h-4 w-4" />
              <span>{isSubmitting ? '실시간 연동 적재 중...' : '모두의문의에 실시간 등록하기'}</span>
            </button>
          </form>
        </div>

        {/* History and AI Analytical Panel */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Gemini Style Analyzer Report (Durable user-data value proposition) */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-xl p-6 shadow-md border border-indigo-950 relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-10">
              <BrainCircuit className="h-32 w-32 text-indigo-400" />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-indigo-500/20 text-indigo-200 rounded-full text-[10px] font-bold border border-indigo-400/20">
                  <Sparkles className="h-3 w-3 animate-pulse" />
                  <span>모두의문의 AI 실시간 분석 피드</span>
                </div>
                <span className="text-[10px] text-indigo-300 font-semibold">Gemini Flash Core v3.5</span>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-indigo-300">내 주요 관심 카테고리</span>
                <h4 className="text-lg font-black text-white">{aiReport.dominantCategory}</h4>
              </div>

              <div className="p-3 bg-white/5 rounded-lg border border-white/5 text-xs text-slate-300 leading-relaxed">
                {aiReport.insightMessage}
              </div>

              {inquiries.length > 0 && (
                <div className="bg-indigo-600/30 border border-indigo-500/20 rounded-lg p-3 text-xs text-indigo-200 font-medium">
                  {aiReport.aiOffer}
                </div>
              )}
            </div>
          </div>

          {/* List of Inquiries with Tab Navigation */}
          {(() => {
            const completedCount = inquiries.filter(i => i.status === 'replied').length;
            const pendingCount = inquiries.filter(i => i.status === 'pending' || i.status === 'routing').length;
            const allCount = inquiries.length;

            const filteredInquiries = inquiries.filter((inq) => {
              if (inquiryTab === 'completed' && inq.status !== 'replied') return false;
              if (inquiryTab === 'pending' && inq.status === 'replied') return false;
              if (selectedCatFilter !== 'all' && inq.parentCategory !== selectedCatFilter) return false;
              if (searchKeyword.trim()) {
                const q = searchKeyword.toLowerCase();
                const titleMatch = inq.title?.toLowerCase().includes(q);
                const contentMatch = inq.content?.toLowerCase().includes(q);
                const replyMatch = inq.reply?.content?.toLowerCase().includes(q);
                const replierMatch = inq.reply?.repliedByName?.toLowerCase().includes(q) || inq.assignedPartnerName?.toLowerCase().includes(q);
                if (!titleMatch && !contentMatch && !replyMatch && !replierMatch) return false;
              }
              return true;
            });

            return (
              <div className="space-y-4">
                {/* Header & Tabs */}
                <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-3.5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm flex items-center space-x-1.5">
                        <MessageSquare className="h-4 w-4 text-indigo-600" />
                        <span>내 문의 관리</span>
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        접수된 질문의 진행 상황 및 완료된 공식 답변을 확인하세요.
                      </p>
                    </div>

                    {/* Inquiry Tabs Switcher (전체 / 처리 중 / 문의 완료) */}
                    <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
                      {/* Tab 1: 전체 */}
                      <button
                        type="button"
                        onClick={() => setInquiryTab('all')}
                        className={`flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          inquiryTab === 'all'
                            ? 'bg-white text-indigo-700 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>전체 목록</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                          inquiryTab === 'all' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {allCount}
                        </span>
                      </button>

                      {/* Tab 2: 처리 중 */}
                      <button
                        type="button"
                        onClick={() => setInquiryTab('pending')}
                        className={`flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          inquiryTab === 'pending'
                            ? 'bg-white text-amber-700 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Clock className="h-3.5 w-3.5 text-amber-500" />
                        <span>처리 중</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                          inquiryTab === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {pendingCount}
                        </span>
                      </button>

                      {/* Tab 3: 문의 완료 (Dedicated Completed Inquiries Tab) */}
                      <button
                        type="button"
                        onClick={() => setInquiryTab('completed')}
                        className={`flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          inquiryTab === 'completed'
                            ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-700/20'
                            : 'text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50/60'
                        }`}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>문의 완료</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                          inquiryTab === 'completed' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {completedCount}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Search and Category Filter Toolbar */}
                  <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-slate-100">
                    <div className="relative flex-1 w-full">
                      <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder={
                          inquiryTab === 'completed'
                            ? "완료된 문의 제목, 답변 내용, 제휴처 검색..."
                            : "문의 제목 또는 본문 내용 실시간 검색..."
                        }
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-7 py-1.5 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
                      />
                      {searchKeyword && (
                        <button
                          type="button"
                          onClick={() => setSearchKeyword('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Category Filter */}
                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                      <select
                        value={selectedCatFilter}
                        onChange={(e) => setSelectedCatFilter(e.target.value as any)}
                        className="w-full sm:w-auto text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:bg-white focus:border-indigo-500 focus:outline-none text-slate-700"
                      >
                        <option value="all">전체 카테고리</option>
                        {(Object.keys(CATEGORY_MAP) as InquiryParentCategory[]).map((k) => (
                          <option key={k} value={k}>
                            {CATEGORY_MAP[k].label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Specific Informative Banner for "문의 완료" Tab */}
                {inquiryTab === 'completed' && completedCount > 0 && (
                  <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-xl p-3.5 flex items-center justify-between text-xs text-emerald-950">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-1.5 bg-emerald-600 text-white rounded-lg shadow-sm">
                        <CheckCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="font-extrabold text-emerald-900">
                          해결 완료된 문의 ({completedCount}건)
                        </span>
                        <p className="text-[11px] text-emerald-800/90 mt-0.5">
                          제휴처 및 전담 마스터의 공식 답변이 발행된 문의입니다. 답변 복사 및 만족도 조사가 가능합니다.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Inquiry Cards List */}
                {loading ? (
                  <div className="bg-white border border-slate-100 rounded-xl p-12 text-center text-xs text-slate-400">
                    실시간 내역 동기화 중...
                  </div>
                ) : inquiries.length === 0 ? (
                  <div className="bg-white border border-slate-100 rounded-xl p-12 text-center space-y-2">
                    <HelpCircle className="h-8 w-8 text-slate-300 mx-auto" />
                    <h4 className="text-xs font-bold text-slate-700">접수된 문의 내역이 없습니다.</h4>
                    <p className="text-[10px] text-slate-400">좌측 양식을 작성해 실시간 문의를 등록해보세요.</p>
                  </div>
                ) : filteredInquiries.length === 0 ? (
                  /* Empty state for specific tab/filter */
                  inquiryTab === 'completed' ? (
                    <div className="bg-white border border-emerald-100 rounded-2xl p-10 text-center space-y-3">
                      <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                        <CheckCircle2 className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-800">아직 답변 완료된 문의가 없습니다.</h4>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                          현재 고객님께서 접수하신 {pendingCount}건의 문의를 담당자 및 제휴처에서 정밀 검토하고 있습니다. 답변이 등록되면 이곳에 모아집니다.
                        </p>
                      </div>
                      {pendingCount > 0 && (
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => setInquiryTab('pending')}
                            className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition-all cursor-pointer inline-flex items-center space-x-1.5"
                          >
                            <Clock className="h-3.5 w-3.5 text-indigo-500" />
                            <span>현재 처리 중인 문의 ({pendingCount}건) 확인하기</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center space-y-2">
                      <Search className="h-6 w-6 text-slate-300 mx-auto" />
                      <h4 className="text-xs font-bold text-slate-700">검색 및 필터 조건과 일치하는 문의가 없습니다.</h4>
                      <button
                        type="button"
                        onClick={() => { setSearchKeyword(''); setSelectedCatFilter('all'); }}
                        className="text-xs text-indigo-600 hover:underline font-bold cursor-pointer"
                      >
                        검색 및 필터 초기화
                      </button>
                    </div>
                  )
                ) : (
                  <div className="space-y-2.5 max-h-[62vh] overflow-y-auto pr-1">
                    {filteredInquiries.map((inq) => {
                      const catConfig = CATEGORY_MAP[inq.parentCategory] || CATEGORY_MAP.other;
                      const isCompleted = inq.status === 'replied';
                      // Auto expand completed inquiries when in completed tab or if clicked
                      const isExpanded = expandedInquiryId === inq.id || (inquiryTab === 'completed' && expandedInquiryId === null);
                      const formattedSub = catConfig.subCategories.find(s => s.value === inq.subCategory)?.label || inq.subCategory;
                      const satisfaction = inq.satisfaction?.rating;

                      return (
                        <div 
                          key={inq.id}
                          onClick={() => setExpandedInquiryId(expandedInquiryId === inq.id ? '' : inq.id)}
                          className={`bg-white border rounded-xl p-4 shadow-sm transition-all duration-200 cursor-pointer text-left space-y-3 ${
                            isCompleted 
                              ? 'border-emerald-200/90 hover:border-emerald-300 hover:shadow-md' 
                              : 'border-slate-100 hover:border-slate-300'
                          } ${
                            isExpanded ? 'ring-1 ring-indigo-600/10 shadow-md' : ''
                          }`}
                        >
                          {/* Top labels and status */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${catConfig.bg} ${catConfig.text}`}>
                                {catConfig.label}
                              </span>
                              <span className="text-[9px] text-slate-500 font-semibold bg-slate-100 px-1.5 py-0.5 rounded">
                                {formattedSub}
                              </span>
                              {inq.assignedPartnerName && (
                                <span className="text-[9px] text-blue-700 font-bold bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded">
                                  🏢 {inq.assignedPartnerName}
                                </span>
                              )}
                            </div>

                            {/* Status badge */}
                            <div className="flex items-center space-x-1.5">
                              {inq.status === 'replied' ? (
                                <span className="inline-flex items-center space-x-1 text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                  <span>문의 완료</span>
                                </span>
                              ) : inq.status === 'routing' ? (
                                <span className="inline-flex items-center space-x-1 text-[10px] text-blue-700 font-bold bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                                  <TrendingUp className="h-3 w-3 text-blue-500 animate-pulse" />
                                  <span>제휴사 이송 중</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center space-x-1 text-[10px] text-amber-700 font-bold bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
                                  <Clock className="h-3 w-3 text-amber-500" />
                                  <span>답변 대기</span>
                                </span>
                              )}

                              {/* Cancellation Button (Only if pending) */}
                              {inq.status === 'pending' && (
                                <button
                                  type="button"
                                  onClick={(e) => handleCancelInquiry(inq.id, e)}
                                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-slate-50 rounded-lg transition-all cursor-pointer"
                                  title="접수 취소 및 파이어베이스에서 완전 삭제"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Main Title and preview content */}
                          <div className="space-y-1">
                            <h4 className="font-extrabold text-slate-900 text-sm leading-snug">
                              {inq.title}
                            </h4>
                            <p className={`text-xs text-slate-600 font-mono leading-relaxed whitespace-pre-wrap ${
                              isExpanded ? '' : 'line-clamp-2'
                            }`}>
                              {inq.content}
                            </p>
                          </div>

                          {/* Registration Date & Time */}
                          <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-400">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3 text-slate-400" />
                              <span>접수: {formatDateTime(inq.createdAt)}</span>
                            </div>
                            <span className="text-[10px] text-indigo-600 font-bold">
                              {isExpanded ? '상세 접기 ▲' : (isCompleted ? '공식 답변 열람 ▼' : '진행 현황 보기 ▼')}
                            </span>
                          </div>

                          {/* Expanded View with Official reply, Copy, Satisfaction & AI diagnostics */}
                          {isExpanded && (
                            <div className="border-t border-slate-100 pt-3.5 space-y-3.5 bg-slate-50/70 p-3.5 rounded-xl mt-2 transition-all">
                              
                              {/* Attached files view if inquiry has attachments */}
                              {inq.attachments && inq.attachments.length > 0 && (
                                <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2">
                                  <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700">
                                    <Paperclip className="h-3.5 w-3.5 text-indigo-600" />
                                    <span>첨부된 파일 ({inq.attachments.length}개)</span>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {inq.attachments.map((att, idx) => (
                                      <div 
                                        key={idx}
                                        className="flex items-center justify-between p-2 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-all text-xs"
                                      >
                                        <div className="flex items-center space-x-2 truncate">
                                          {att.type.startsWith('image/') ? (
                                            <img 
                                              src={att.dataUrl} 
                                              alt={att.name}
                                              className="h-8 w-8 object-cover rounded cursor-pointer border border-slate-200" 
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setPreviewImage(att.dataUrl);
                                              }}
                                            />
                                          ) : (
                                            <File className="h-5 w-5 text-slate-400 shrink-0" />
                                          )}
                                          <div className="truncate">
                                            <p className="font-semibold text-slate-800 text-[11px] truncate max-w-[140px]">{att.name}</p>
                                            <p className="text-[10px] text-slate-400">{(att.size / 1024).toFixed(1)} KB</p>
                                          </div>
                                        </div>

                                        <div className="flex items-center space-x-1 shrink-0">
                                          {att.type.startsWith('image/') && (
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setPreviewImage(att.dataUrl);
                                              }}
                                              className="p-1 text-indigo-600 hover:bg-indigo-50 rounded"
                                              title="크게 보기"
                                            >
                                              <Eye className="h-3.5 w-3.5" />
                                            </button>
                                          )}
                                          <a
                                            href={att.dataUrl}
                                            download={att.name}
                                            onClick={(e) => e.stopPropagation()}
                                            className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded"
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

                              {/* Official Reply Box */}
                              {inq.reply ? (
                                <div className="bg-white border border-emerald-200 rounded-xl p-3.5 shadow-sm space-y-2.5">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-1.5">
                                      <div className="p-1 bg-emerald-600 text-white rounded-md">
                                        <ShieldCheck className="h-3.5 w-3.5" />
                                      </div>
                                      <div>
                                        <span className="text-xs font-black text-emerald-900 flex items-center space-x-1">
                                          <span>{inq.reply.repliedByName || '제휴 지원팀'}</span>
                                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-md">
                                            공식 답변
                                          </span>
                                        </span>
                                      </div>
                                    </div>

                                    {/* Copy reply button */}
                                    <div className="flex items-center space-x-2">
                                      <span className="text-[10px] text-slate-400">
                                        {formatDateTime(inq.reply.createdAt)}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={(e) => handleCopyReply(inq.reply?.content || '', inq.id, e)}
                                        className="inline-flex items-center space-x-1 px-2 py-1 text-[10px] font-bold text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-md transition-all cursor-pointer"
                                        title="답변 내용 복사하기"
                                      >
                                        {copiedReplyId === inq.id ? (
                                          <>
                                            <Check className="h-3 w-3 text-green-600" />
                                            <span className="text-green-600">복사완료</span>
                                          </>
                                        ) : (
                                          <>
                                            <Copy className="h-3 w-3" />
                                            <span>답변 복사</span>
                                          </>
                                        )}
                                      </button>
                                    </div>
                                  </div>

                                  {/* Reply content */}
                                  <div className="p-3 bg-emerald-50/30 border border-emerald-100 rounded-lg">
                                    <p className="text-xs text-slate-800 font-mono leading-relaxed whitespace-pre-wrap">
                                      {inq.reply.content}
                                    </p>
                                  </div>

                                  {/* Satisfaction Poll for Completed Inquiry */}
                                  <div className="space-y-2 pt-2 border-t border-slate-100 text-[11px]">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                      <span className="text-slate-600 font-bold flex items-center space-x-1">
                                        <span>이 답변이 문제 해결에 도움이 되셨나요?</span>
                                        {inq.satisfaction && (
                                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold border border-emerald-200">
                                            {inq.satisfaction.rating === 'helpful' ? '⭐ 만족 피드백 제출됨' : '📝 추가 문의 필요 접수됨'}
                                          </span>
                                        )}
                                      </span>
                                      <div className="flex items-center space-x-1.5">
                                        <button
                                          type="button"
                                          onClick={(e) => handleSatisfaction(inq.id, 'helpful', e)}
                                          className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center space-x-1 transition-all cursor-pointer border ${
                                            (inq.satisfaction?.rating === 'helpful')
                                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                              : 'bg-white text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 border-slate-200'
                                          }`}
                                        >
                                          <ThumbsUp className="h-3 w-3" />
                                          <span>만족해요</span>
                                        </button>

                                        <button
                                          type="button"
                                          onClick={(e) => handleSatisfaction(inq.id, 'more_info', e)}
                                          className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center space-x-1 transition-all cursor-pointer border ${
                                            (inq.satisfaction?.rating === 'more_info')
                                              ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                                              : 'bg-white text-slate-600 hover:text-amber-700 hover:bg-amber-50 border-slate-200'
                                          }`}
                                        >
                                          <MessageCircle className="h-3 w-3" />
                                          <span>추가 문의 필요</span>
                                        </button>
                                      </div>
                                    </div>

                                    {/* Optional feedback text input */}
                                    <div className="flex items-center space-x-2 pt-1">
                                      <input 
                                        type="text"
                                        placeholder="추가 의견이나 피드백을 남겨주시면 품질 개선에 반영됩니다 (선택)"
                                        value={feedbackInputMap[inq.id] ?? (inq.satisfaction?.feedback || '')}
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={(e) => setFeedbackInputMap(prev => ({ ...prev, [inq.id]: e.target.value }))}
                                        className="flex-1 text-[11px] border border-slate-200 rounded-lg px-2.5 py-1.5 focus:border-indigo-500 focus:outline-none bg-slate-50"
                                      />
                                      <button
                                        type="button"
                                        onClick={(e) => handleSatisfaction(inq.id, inq.satisfaction?.rating || 'helpful', e)}
                                        className="px-2.5 py-1.5 text-[10px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg cursor-pointer transition-all"
                                      >
                                        피드백 저장
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-xs text-slate-500 italic py-2 pl-3 border-l-2 border-slate-300 bg-white/80 p-2.5 rounded-lg">
                                  🕒 담당 어드민 및 제휴처에서 문의 내용을 확인하고 있습니다. 답변이 등록되면 실시간으로 이곳에 노출됩니다.
                                </div>
                              )}

                              {/* AI Sentiment Analysis indicator */}
                              {inq.aiAnalysis && (
                                <div className="flex items-center justify-between text-[10px] text-slate-500 bg-white border border-slate-100 px-3 py-1.5 rounded-lg">
                                  <span className="flex items-center space-x-1.5 font-bold">
                                    <Sparkles className="h-3 w-3 text-indigo-500 animate-pulse" />
                                    <span>AI 인공지능 감정 분석:</span>
                                    <span className={`uppercase font-black ${
                                      inq.aiAnalysis.sentiment === 'urgent' ? 'text-red-600' :
                                      inq.aiAnalysis.sentiment === 'negative' ? 'text-amber-600' : 'text-slate-600'
                                    }`}>
                                      {inq.aiAnalysis.sentiment === 'urgent' ? '🚨 긴급 및 최우선' : inq.aiAnalysis.sentiment}
                                    </span>
                                  </span>
                                  <span>요약: {inq.aiAnalysis.summarizedNeed}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}
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
              <span className="text-xs font-bold text-slate-700">첨부 이미지 미리보기</span>
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
                alt="첨부파일 확대 미리보기" 
                className="max-h-[70vh] max-w-full object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Floating In-App Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center space-x-2 border border-slate-800">
          <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Inquiry Template Modal */}
      <InquiryTemplateModal 
        isOpen={isTemplateModalOpen} 
        onClose={() => setIsTemplateModalOpen(false)} 
        onSelectTemplate={handleSelectTemplate} 
      />
    </div>
  );
};
