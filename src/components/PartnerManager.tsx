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
  Building2, 
  Phone, 
  MessageCircle, 
  Clock, 
  Utensils, 
  ShoppingBag, 
  Plane, 
  MoreHorizontal, 
  RefreshCw, 
  Check, 
  X,
  Search,
  Zap,
  Tag
} from 'lucide-react';

interface PartnerBrand {
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

// Default Seed List for Auto-Seeding Firestore
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
    category: 'restaurant'
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
    category: 'restaurant'
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
    category: 'restaurant'
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
    category: 'restaurant'
  },
  {
    id: 'pt_baemin',
    name: '배달의민족',
    logoEmoji: '🛵',
    intro: '1등 배달앱 서비스. 주문 후 이물질/위생 분쟁 시 안심케어 보상제 및 배달 파손 보장 처리 제공.',
    phone: '1600-0987',
    chatUrl: 'https://baemin.com',
    avgResponse: '상담원 실시간 대기',
    color: 'sky',
    popularInquiry: '배달 파손 및 위생 규정 신고',
    category: 'shopping'
  }
];

export const PartnerManager: React.FC = () => {
  const [partners, setPartners] = useState<PartnerBrand[]>([]);
  const [loading, setLoading] = useState(true);
  
  // AI Generator state
  const [generateCategory, setGenerateCategory] = useState<string>('restaurant');
  const [generateCount, setGenerateCount] = useState<number>(1);
  const [customTopic, setCustomTopic] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Manual Creation Modal State
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const [manualForm, setManualForm] = useState({
    name: '',
    logoEmoji: '🍗',
    intro: '',
    phone: '',
    chatUrl: '',
    avgResponse: '평균 10분 내 해결',
    color: 'emerald',
    popularInquiry: '',
    category: 'restaurant'
  });

  // Edit Modal State
  const [editingPartner, setEditingPartner] = useState<PartnerBrand | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    logoEmoji: '🍗',
    intro: '',
    phone: '',
    chatUrl: '',
    avgResponse: '평균 10분 내 해결',
    color: 'emerald',
    popularInquiry: '',
    category: 'restaurant'
  });

  // Delete Confirmation Modal State
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Real-time Firestore Listener with automatic bidirectional synchronization
  useEffect(() => {
    setLoading(true);
    const partnersRef = collection(db, 'partners');
    const usersRef = collection(db, 'users');

    let currentPartners: PartnerBrand[] = [];
    let currentUsers: any[] = [];

    const syncCollections = async (pList: PartnerBrand[], uList: any[]) => {
      // Sync from partners to users
      for (const partner of pList) {
        const matchingUser = uList.find(u => 
          u.uid === partner.id || 
          u.email === `${partner.id}@modu.com` || 
          u.displayName.trim().toLowerCase() === partner.name.trim().toLowerCase()
        );
        if (!matchingUser) {
          console.log(`Syncing partner ${partner.name} to users collection...`);
          try {
            await setDoc(doc(db, 'users', partner.id), {
              uid: partner.id,
              email: `${partner.id}@modu.com`,
              displayName: partner.name,
              role: 'partner',
              partnerCategory: partner.category === 'restaurant' ? 'restaurant' : partner.category === 'shopping' ? 'shopping' : partner.category === 'travel' ? 'travel' : 'other',
              phone: partner.phone,
              notes: partner.intro,
              createdAt: serverTimestamp()
            });
          } catch (err) {
            console.error(`Failed to sync partner ${partner.name} to users:`, err);
          }
        }
      }

      // Sync from users to partners
      for (const user of uList) {
        if (user.role === 'partner' || user.role === 'admin') {
          const matchingPartner = pList.find(p => 
            p.id === user.uid || 
            p.name.trim().toLowerCase() === user.displayName.trim().toLowerCase()
          );
          if (!matchingPartner) {
            console.log(`Syncing user ${user.displayName} to partners collection...`);
            const fallbackCategory = user.partnerCategory || 'restaurant';
            try {
              await setDoc(doc(db, 'partners', user.uid), {
                id: user.uid,
                name: user.displayName,
                logoEmoji: fallbackCategory === 'shopping' ? '🛍️' : fallbackCategory === 'travel' ? '✈️' : fallbackCategory === 'restaurant' ? '🍕' : '🏢',
                intro: user.notes || '공식 제휴 파트너 계정입니다. 배정 시 실시간으로 대응 처리가 지원됩니다.',
                phone: user.phone || '1588-0000',
                chatUrl: '#',
                avgResponse: '평균 10분 내 즉시 해결',
                color: fallbackCategory === 'shopping' ? 'indigo' : fallbackCategory === 'travel' ? 'sky' : fallbackCategory === 'restaurant' ? 'emerald' : 'slate',
                popularInquiry: '제휴 채널 연계 문의',
                category: fallbackCategory,
                createdAt: serverTimestamp()
              });
            } catch (err) {
              console.error(`Failed to sync user ${user.displayName} to partners:`, err);
            }
          }
        }
      }
    };

    const unsubPartners = onSnapshot(partnersRef, async (snapshot) => {
      const items: PartnerBrand[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });

      // Seeding: If DB is empty, auto-populate the default seed list!
      if (items.length === 0) {
        console.log("Seeding default partners to Firestore...");
        try {
          for (const item of PARTNERS_LIST) {
            await setDoc(doc(db, 'partners', item.id), {
              ...item,
              createdAt: serverTimestamp()
            });
          }
        } catch (err) {
          console.error("Failed to seed default partners:", err);
        }
      } else {
        currentPartners = items;
        // Deduplicate list by Name (trimmed, case-insensitive check) to absolutely prevent rendering duplicates
        const uniqueMap = new Map<string, PartnerBrand>();
        items.forEach(item => {
          const key = item.name.trim().toLowerCase();
          if (!uniqueMap.has(key)) {
            uniqueMap.set(key, item);
          }
        });
        setPartners(Array.from(uniqueMap.values()));
        setLoading(false);

        if (currentUsers.length > 0) {
          await syncCollections(items, currentUsers);
        }
      }
    }, (err) => {
      console.error("Firestore Partners fetch error:", err);
      setLoading(false);
    });

    const unsubUsers = onSnapshot(usersRef, async (snapshot) => {
      const items: any[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data());
      });
      currentUsers = items;

      if (currentPartners.length > 0) {
        await syncCollections(currentPartners, items);
      }
    });

    return () => {
      unsubPartners();
      unsubUsers();
    };
  }, []);

  // AI Brand Generation Handler (Checking and preventing name duplicates)
  const handleGenerateAI = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      const response = await fetch('/api/partners/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: generateCategory,
          count: generateCount,
          customTopicPrompt: customTopic
        })
      });

      if (!response.ok) {
        throw new Error(`AI 서버 응답 오류 (${response.status})`);
      }

      const data = await response.json();
      const generatedList = data.items || [];

      // Save each generated brand to Firestore if it doesn't already exist
      let savedCount = 0;
      for (const item of generatedList) {
        // Check if brand name already exists
        const duplicateExists = partners.some(p => p.name.trim().toLowerCase() === item.name.trim().toLowerCase());
        if (duplicateExists) {
          console.log(`Skipping duplicate generation for: ${item.name}`);
          continue;
        }

        const docRef = doc(db, 'partners', item.id);
        await setDoc(docRef, {
          ...item,
          createdAt: serverTimestamp()
        });
        savedCount++;
      }

      setCustomTopic('');
      if (generatedList.length === 0) {
        showToast("알림: AI가 새로운 제휴처 브랜드를 발굴하지 못했습니다. 분야를 확인하시거나 키워드를 세분화하여 다시 입력해 주세요.");
      } else if (savedCount > 0) {
        showToast(`성공: AI가 ${savedCount}개의 안심 제휴처 브랜드를 신규 발굴하여 DB에 저장했습니다!`);
      } else {
        showToast(`알림: 추천된 브랜드(${generatedList.map((g: any) => g.name).join(', ')})는 이미 데이터베이스에 등재되어 있습니다.`);
      }
    } catch (err: any) {
      console.error("Partner AI Generation error:", err);
      showToast(`AI 생성 오류: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Delete brand trigger & execution
  const confirmDeleteBrand = (id: string, name: string) => {
    setDeleteTargetId(id);
    setDeleteTargetName(name);
  };

  const executeDeleteBrand = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteDoc(doc(db, 'partners', deleteTargetId));
      showToast(`"${deleteTargetName}" 제휴처를 성공적으로 삭제했습니다.`);
    } catch (err: any) {
      showToast(`삭제 실패: ${err.message}`);
    } finally {
      setDeleteTargetId(null);
      setDeleteTargetName(null);
    }
  };

  // Open Edit Modal Helper
  const openEditModal = (partner: PartnerBrand) => {
    setEditingPartner(partner);
    setEditForm({
      name: partner.name,
      logoEmoji: partner.logoEmoji,
      intro: partner.intro,
      phone: partner.phone,
      chatUrl: partner.chatUrl,
      avgResponse: partner.avgResponse,
      color: partner.color || 'emerald',
      popularInquiry: partner.popularInquiry || '',
      category: partner.category || 'restaurant'
    });
    setIsEditModalOpen(true);
  };

  // Submit Edited Partner
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPartner) return;
    if (!editForm.name.trim() || !editForm.phone.trim()) {
      showToast("브랜드명과 전화번호는 필수 입력입니다.");
      return;
    }

    try {
      const docRef = doc(db, 'partners', editingPartner.id);
      await setDoc(docRef, {
        id: editingPartner.id,
        ...editForm,
        updatedAt: serverTimestamp()
      }, { merge: true });

      setIsEditModalOpen(false);
      setEditingPartner(null);
      showToast(`"${editForm.name}" 제휴처 정보를 성공적으로 수정했습니다.`);
    } catch (err: any) {
      showToast(`수정 실패: ${err.message}`);
    }
  };

  // Manual Brand Register Submission
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.name.trim() || !manualForm.phone.trim()) {
      showToast("브랜드명과 전화번호는 필수 입력입니다.");
      return;
    }

    try {
      const newId = `partner_manual_${Date.now()}`;
      const docRef = doc(db, 'partners', newId);
      await setDoc(docRef, {
        id: newId,
        ...manualForm,
        createdAt: serverTimestamp()
      });

      setIsManualModalOpen(false);
      setManualForm({
        name: '',
        logoEmoji: '🍗',
        intro: '',
        phone: '',
        chatUrl: '',
        avgResponse: '평균 10분 내 해결',
        color: 'emerald',
        popularInquiry: '',
        category: 'restaurant'
      });
      showToast(`"${manualForm.name}" 안심 제휴처를 직접 등록했습니다.`);
    } catch (err: any) {
      showToast(`등록 실패: ${err.message}`);
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'restaurant': return '🍔 외식/요식업';
      case 'shopping': return '🛍️ 쇼핑/이커머스';
      case 'travel': return '✈️ 여가/항공/호텔';
      default: return '🤝 기타/용역계약';
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'emerald': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'sky': return 'bg-sky-50 text-sky-800 border-sky-200';
      case 'red': return 'bg-red-50 text-red-800 border-red-200';
      case 'pink': return 'bg-pink-50 text-pink-800 border-pink-200';
      case 'green': return 'bg-green-50 text-green-800 border-green-200';
      case 'amber': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'indigo': return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'violet': return 'bg-violet-50 text-violet-800 border-violet-200';
      case 'slate': return 'bg-slate-50 text-slate-800 border-slate-200';
      default: return 'bg-blue-50 text-blue-800 border-blue-200';
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
      <div className="bg-gradient-to-r from-slate-900 to-emerald-950 border border-slate-800 p-6 rounded-2xl shadow-sm text-white">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-black uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
              <span>모두의문의 공식 제휴망 어드민</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              안심 해결 제휴처 및 브랜드 자동 등록 관리 센터
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              국내 유명 치킨, 피자, 이커머스 쇼핑몰, 숙박앱 등 주요 민원 발생 제휴처를 수동 또는 AI 원클릭으로 무제한 발굴하고 등록합니다. 등록된 제휴처는 실시간 문의 이송 시 즉각 연계 매핑됩니다.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-xl border border-white/10 text-center">
            <span className="text-[10px] font-bold text-slate-300 block uppercase">등록된 제휴 파트너</span>
            <span className="text-2xl font-black text-emerald-300">{partners.length}개사</span>
          </div>
        </div>
      </div>

      {/* AI Generative Control */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-indigo-600 animate-pulse" />
              <h3 className="text-sm font-black text-slate-900">AI 제휴사 오토 파일링 & 생성 엔진</h3>
            </div>
            <p className="text-xs text-slate-500">
              분야와 지정 브랜드를 선택하면 Gemini AI가 본사 콜센터 번호 및 고객센터 세부 해결 수칙을 검토하여 전문 제휴 정보를 전산 자동 적재합니다.
            </p>
          </div>

          <button
            onClick={() => setIsManualModalOpen(true)}
            className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            <span>제휴 파트너 수동 등록</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-4 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">제휴 분야</label>
            <select
              value={generateCategory}
              onChange={(e) => setGenerateCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="restaurant">🍔 외식/요식업 (도미노, 비에이치씨 등)</option>
              <option value="shopping">🛍️ 쇼핑/이커머스/패션 (무신사, 쿠팡 등)</option>
              <option value="travel">✈️ 여가/숙박/항공 (야놀자, 대한항공 등)</option>
              <option value="other">🤝 기타 전문 용역/CS 제휴 기관</option>
            </select>
          </div>

          <div className="md:col-span-3 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">동시 생성 수량</label>
            <select
              value={generateCount}
              onChange={(e) => setGenerateCount(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={1}>1개 신규 발굴</option>
              <option value={2}>2개 연속 등록</option>
              <option value={3}>3개 동시 적재</option>
            </select>
          </div>

          <div className="md:col-span-5 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">특별 희망 브랜드명 (선택)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="예: 미스터피자, 지그재그, 에어비앤비, 배달의민족"
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleGenerateAI}
                disabled={isGenerating}
                className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-black px-4.5 py-2 rounded-xl transition-all shadow-md cursor-pointer whitespace-nowrap"
              >
                <Sparkles className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>{isGenerating ? 'AI 적재 중...' : 'AI 신규 등록하기'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Partners List Grid */}
      <div className="space-y-4">
        <h3 className="text-base font-black text-slate-900">현재 등재 완료된 안심제휴 브랜드 가맹점</h3>
        
        {loading ? (
          <div className="text-center py-16 text-xs text-slate-400">제휴처 목록을 실시간 동기화 중...</div>
        ) : partners.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-16 text-center text-slate-400">
            <Building2 className="h-10 w-10 text-slate-200 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">등재된 공식 제휴사 브랜드가 현재 없습니다.</p>
            <p className="text-[10px] text-slate-400 mt-1">상단 AI 생성기나 수동 작성을 통해 전국구 안심 가맹점을 개설해 주십시오.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {partners.map((partner) => (
              <div 
                key={partner.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-indigo-400 hover:shadow-md transition-all relative group text-left"
              >
                <div className="absolute top-4 right-4 flex items-center space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditModal(partner)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer"
                    title="수정"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => confirmDeleteBrand(partner.id, partner.name)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                    title="삭제"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Title & Badge */}
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl h-11 w-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-inner">
                      {partner.logoEmoji}
                    </span>
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-slate-900 text-sm truncate">{partner.name}</h4>
                      <span className={`inline-block text-[9px] font-bold px-2 py-0.2 rounded-md border ${getColorClasses(partner.color)} mt-1`}>
                        {getCategoryLabel(partner.category)}
                      </span>
                    </div>
                  </div>

                  {/* Intro */}
                  <p className="text-xs text-slate-500 leading-relaxed font-mono min-h-[40px] line-clamp-2">
                    {partner.intro}
                  </p>

                  {/* Info table */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-bold flex items-center space-x-1">
                        <Phone className="h-3 w-3" />
                        <span>직통 문의처</span>
                      </span>
                      <span className="font-extrabold text-slate-800 font-mono">{partner.phone}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-bold flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>평균 응답속도</span>
                      </span>
                      <span className="font-bold text-emerald-600">{partner.avgResponse}</span>
                    </div>

                    <div className="pt-1.5 border-t border-slate-200/60">
                      <span className="text-[10px] text-slate-400 block font-bold mb-1">인기 이의제기 태그</span>
                      <span className="font-medium text-slate-700 text-[11px] block truncate font-mono">
                        🔥 {partner.popularInquiry || "오배송 및 즉시 환불 소명"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Direct Action Link */}
                <div className="pt-4 mt-2">
                  <a
                    href={partner.chatUrl}
                    target="_blank"
                    rel="noreferrer referrer"
                    className="w-full flex items-center justify-center space-x-1.5 py-2 text-[11px] font-black text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-xl transition-all cursor-pointer"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>실시간 1:1 민원 전산망 가동</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manual Creation Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl border border-slate-100 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900">제휴사 가맹점 수동 직접 개설</h3>
                <p className="text-xs text-slate-500">안심 제휴사 민원 핫라인 정보를 정밀 기입합니다.</p>
              </div>
              <button 
                onClick={() => setIsManualModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-4 text-xs text-left">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">가맹 파트너사 명칭 *</label>
                  <input
                    type="text"
                    required
                    value={manualForm.name}
                    onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })}
                    placeholder="예: 굽네치킨 본사, 지그재그 쇼핑몰"
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">대표 이모지 *</label>
                  <input
                    type="text"
                    required
                    value={manualForm.logoEmoji}
                    onChange={(e) => setManualForm({ ...manualForm, logoEmoji: e.target.value })}
                    placeholder="예: 🍗, 🏨, 👚"
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-center text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">제휴 분야 분류</label>
                  <select
                    value={manualForm.category}
                    onChange={(e) => setManualForm({ ...manualForm, category: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-white text-xs font-bold"
                  >
                    <option value="restaurant">🍔 외식/요식업</option>
                    <option value="shopping">🛍️ 쇼핑/이커머스</option>
                    <option value="travel">✈️ 여가/호텔/항공</option>
                    <option value="other">🤝 기타 전문 제휴사</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">장식 컬러 테마</label>
                  <select
                    value={manualForm.color}
                    onChange={(e) => setManualForm({ ...manualForm, color: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-white text-xs font-bold"
                  >
                    <option value="emerald">Emerald (초록)</option>
                    <option value="sky">Sky (하늘)</option>
                    <option value="red">Red (빨강)</option>
                    <option value="pink">Pink (핑크)</option>
                    <option value="indigo">Indigo (남색)</option>
                    <option value="slate">Slate (회색)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">공식 CS 소개글 *</label>
                <textarea
                  rows={2}
                  required
                  value={manualForm.intro}
                  onChange={(e) => setManualForm({ ...manualForm, intro: e.target.value })}
                  placeholder="예: 굽네치킨 본사 전담 민원센터와 원스톱 매핑 연계되어 조리 위생 상해 및 불친절 이의제기를 직통 처리합니다."
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">CS 콜센터 직통 번호 *</label>
                  <input
                    type="text"
                    required
                    value={manualForm.phone}
                    onChange={(e) => setManualForm({ ...manualForm, phone: e.target.value })}
                    placeholder="예: 1577-0000"
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">평균 민원 해결속도</label>
                  <input
                    type="text"
                    value={manualForm.avgResponse}
                    onChange={(e) => setManualForm({ ...manualForm, avgResponse: e.target.value })}
                    placeholder="예: 평균 10분 내 처리"
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">상담 채널 가상 URL (혹은 실제 주소)</label>
                  <input
                    type="text"
                    value={manualForm.chatUrl}
                    onChange={(e) => setManualForm({ ...manualForm, chatUrl: e.target.value })}
                    placeholder="https://example.com/chat"
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">인기 이의제기 사유 태그</label>
                <input
                  type="text"
                  value={manualForm.popularInquiry}
                  onChange={(e) => setManualForm({ ...manualForm, popularInquiry: e.target.value })}
                  placeholder="예: 이물질 환불 및 실손 치료비 배상 요구"
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-bold"
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
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-black text-white shadow-md cursor-pointer"
                >
                  제휴 파트너 등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Partner Modal */}
      {isEditModalOpen && editingPartner && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl border border-slate-100 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900">제휴 파트너 정보 수정</h3>
                <p className="text-xs text-slate-500">지정된 가맹점 정보를 실시간 교정 및 업데이트합니다.</p>
              </div>
              <button 
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingPartner(null);
                }} 
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs text-left">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">가맹 파트너사 명칭 *</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="예: 굽네치킨 본사, 지그재그 쇼핑몰"
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">대표 이모지 *</label>
                  <input
                    type="text"
                    required
                    value={editForm.logoEmoji}
                    onChange={(e) => setEditForm({ ...editForm, logoEmoji: e.target.value })}
                    placeholder="예: 🍗, 🏨, 👚"
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-center text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">제휴 분야 분류</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-white text-xs font-bold"
                  >
                    <option value="restaurant">🍔 외식/요식업</option>
                    <option value="shopping">🛍️ 쇼핑/이커머스</option>
                    <option value="travel">✈️ 여가/호텔/항공</option>
                    <option value="other">🤝 기타 전문 제휴사</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">장식 컬러 테마</label>
                  <select
                    value={editForm.color}
                    onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 bg-white text-xs font-bold"
                  >
                    <option value="emerald">Emerald (초록)</option>
                    <option value="sky">Sky (하늘)</option>
                    <option value="red">Red (빨강)</option>
                    <option value="pink">Pink (핑크)</option>
                    <option value="indigo">Indigo (남색)</option>
                    <option value="slate">Slate (회색)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">공식 CS 소개글 *</label>
                <textarea
                  rows={2}
                  required
                  value={editForm.intro}
                  onChange={(e) => setEditForm({ ...editForm, intro: e.target.value })}
                  placeholder="예: 굽네치킨 본사 전담 민원센터와 원스톱 매핑 연계되어 조리 위생 상해 및 불친절 이의제기를 직통 처리합니다."
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">CS 콜센터 직통 번호 *</label>
                  <input
                    type="text"
                    required
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="예: 1577-0000"
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">평균 민원 해결속도</label>
                  <input
                    type="text"
                    value={editForm.avgResponse}
                    onChange={(e) => setEditForm({ ...editForm, avgResponse: e.target.value })}
                    placeholder="예: 평균 10분 내 처리"
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">상담 채널 가상 URL (혹은 실제 주소)</label>
                  <input
                    type="text"
                    value={editForm.chatUrl}
                    onChange={(e) => setEditForm({ ...editForm, chatUrl: e.target.value })}
                    placeholder="https://example.com/chat"
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">인기 이의제기 사유 태그</label>
                <input
                  type="text"
                  value={editForm.popularInquiry}
                  onChange={(e) => setEditForm({ ...editForm, popularInquiry: e.target.value })}
                  placeholder="예: 이물질 환불 및 실손 치료비 배상 요구"
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-bold"
                />
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingPartner(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-600 cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-black text-white shadow-md cursor-pointer"
                >
                  제휴 파트너 수정 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetId && deleteTargetName && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-6 shadow-2xl border border-slate-100 text-center animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500">
              <Trash2 className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-extrabold text-slate-900">제휴처 영구 삭제</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                정말 제휴처 브랜드 <span className="font-bold text-slate-850">"{deleteTargetName}"</span> 정보를 데이터베이스에서 영구 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteTargetId(null);
                  setDeleteTargetName(null);
                }}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-600 cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={executeDeleteBrand}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 rounded-xl text-xs font-black text-white shadow-md cursor-pointer"
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
