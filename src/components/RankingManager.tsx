import React, { useState, useEffect, useMemo } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  writeBatch,
  serverTimestamp, 
  query 
} from 'firebase/firestore';
import { db } from '../firebase';
import { 
  Trophy, 
  Plus, 
  Trash2, 
  Pencil, 
  ArrowUp, 
  ArrowDown, 
  Search, 
  X, 
  RefreshCw, 
  Sparkles, 
  Flame, 
  TrendingUp, 
  CheckCircle2, 
  Database,
  ArrowUpDown,
  Zap,
  CheckCheck
} from 'lucide-react';
import { RankingItem, DEFAULT_SEED_RANKINGS } from './RealtimeRanking';

export const RankingManager: React.FC = () => {
  const [rankings, setRankings] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveFilter] = useState<'all' | 'inquiry' | 'alert' | 'insight'>('all');
  const [isAiSorting, setIsAiSorting] = useState(false);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RankingItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Custom Confirmation Modal state to bypass browser-blocked window.confirm inside iframes
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void | Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const askConfirmation = (title: string, message: string, onConfirm: () => void | Promise<void>) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: async () => {
        await onConfirm();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Form states
  const [addForm, setAddForm] = useState({
    type: 'insight' as 'inquiry' | 'alert' | 'insight',
    title: '',
    badge: '법률 상식',
    emoji: '💡',
    hotIndex: 1200,
    growthRate: 15,
    lawBasis: '',
    actionType: 'assistant' as 'assistant' | 'alert' | 'inquiry',
    actionTopic: '',
    parentCategory: 'other',
    subCategory: '일반상담',
    prefillTitle: '',
    prefillContent: ''
  });

  const [editForm, setEditForm] = useState({
    type: 'insight' as 'inquiry' | 'alert' | 'insight',
    title: '',
    badge: '법률 상식',
    emoji: '💡',
    hotIndex: 1200,
    growthRate: 15,
    lawBasis: '',
    actionType: 'assistant' as 'assistant' | 'alert' | 'inquiry',
    actionTopic: '',
    parentCategory: 'other',
    subCategory: '일반상담',
    prefillTitle: '',
    prefillContent: ''
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // AI Autonomous Trend Proposals states
  const [proposals, setProposals] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [scanStep, setScanStep] = useState<number>(0); // 0: setup/idle, 1: gathering, 2: parsing, 3: grounding/generating, 4: complete
  const [useGrounding, setUseGrounding] = useState(true); // Default to Google Search Grounding mode
  const [scanKeyword, setScanKeyword] = useState("");
  const [scannedNewsArticles, setScannedNewsArticles] = useState<any[]>([]);

  // Real-time listener for AI proposals
  useEffect(() => {
    const q = query(collection(db, 'ai_proposals'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: any[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() });
      });
      // Filter out only pending proposals to display in the AI Review Hub
      const pendingProposals = items.filter(item => item.status === 'pending');
      // Sort by createdAt descending
      pendingProposals.sort((a, b) => {
        const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt).getTime();
        const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt).getTime();
        return timeB - timeA;
      });
      setProposals(pendingProposals);
    }, (err) => {
      console.warn("ai_proposals real-time sync warning:", err);
    });
    return () => unsubscribe();
  }, []);

  // Scan trends trigger invoking backend Google News RSS + Gemini pipeline
  const handleScanTrends = async (withGrounding: boolean) => {
    if (isScanning) return;
    setIsScanning(true);
    setIsScanModalOpen(true);
    setScanStep(1);
    setScannedNewsArticles([]);
    
    try {
      // Stage 1 animation: Google News RSS Connect
      await new Promise(resolve => setTimeout(resolve, 800));
      setScanStep(2);

      // Stage 2 animation: News headline & metadata extraction
      await new Promise(resolve => setTimeout(resolve, 800));
      setScanStep(3);

      const res = await fetch("/api/ai/scan-trends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ useGrounding: withGrounding, keyword: scanKeyword })
      });
      const data = await res.json();
      
      if (res.ok && data.success && Array.isArray(data.proposals)) {
        const realNews = Array.isArray(data.newsArticles) ? data.newsArticles : [];
        setScannedNewsArticles(realNews);

        let count = 0;
        for (const prop of data.proposals) {
          const proposalId = `proposal_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
          await setDoc(doc(db, 'ai_proposals', proposalId), {
            ...prop,
            status: 'pending',
            createdAt: new Date(),
            source: data.source,
            searchQueries: data.searchQueries || [],
            sources: data.sources || [],
            newsArticles: realNews
          });
          count++;
        }
        setScanStep(4);
        if (data.source === "google_news_live") {
          showToast(`🎉 [구글 뉴스 실시간 수집] 실제 최신 기사 ${realNews.length}건을 바탕으로 긴급 구제 제안 ${count}건 분석 완료!`);
        } else {
          showToast(`🚀 [AI 자율 추천] 실시간 검색 미사용 모드 스캔 완료! (${count}개 제안 수집)`);
        }
      } else {
        alert("🚨 트렌드 스캔 실패!\n\n오류: " + (data.message || data.error || "알 수 없는 오류가 발생했습니다."));
        setIsScanModalOpen(false);
        setScanStep(0);
      }
    } catch (err: any) {
      console.error("Scan trends network error:", err);
      alert("🚨 네트워크 오류가 발생했습니다: " + err.message);
      setIsScanModalOpen(false);
      setScanStep(0);
    } finally {
      setIsScanning(false);
    }
  };

  // Approve proposal and push to Rank #1 with slide-down reindexing (Step 4)
  // Unified 3-Channel Broadcaster: Automatically pushes to Rankings, Public Alerts, and Consumer Insights Hub!
  const handleApproveProposal = async (proposal: any) => {
    try {
      showToast("🚀 [대통합 일괄 배포] 랭킹 1위, 긴급 알림고지 및 문의 해결 가이드 동시 제작 배포 중...");
      
      const timestampMs = Date.now();
      const todayString = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '.').replace(/\.$/, '') + ' 고지';

      // Channel 1: Pushing to Rankings (Rank #1)
      const newRankId = `rank_prop_${timestampMs}`;
      const newRankingItem = {
        rank: 1,
        type: proposal.type,
        title: proposal.title,
        badge: proposal.badge,
        emoji: proposal.emoji,
        hotIndex: Number(proposal.hotIndex) || 5000,
        growthRate: Number(proposal.growthRate) || 120,
        lawBasis: proposal.lawBasis || "",
        actionType: proposal.actionType,
        actionTopic: proposal.actionTopic,
        parentCategory: proposal.parentCategory || 'other',
        subCategory: proposal.subCategory || '지능형 자동 매핑',
        prefillTitle: proposal.prefillTitle || '',
        prefillContent: proposal.prefillContent || '',
        createdAt: serverTimestamp()
      };

      // 1. Insert as Rank 1
      await setDoc(doc(db, 'rankings', newRankId), newRankingItem);

      // 2. Shift all other ranks down by 1
      const batch = writeBatch(db);
      rankings.forEach((item) => {
        const docRef = doc(db, 'rankings', item.id);
        batch.update(docRef, { rank: Number(item.rank) + 1 });
      });
      await batch.commit();

      // Channel 2: Pushing to Public Alerts (모두의알림 긴급 피해 고지판)
      const alertId = `alert_prop_${timestampMs}`;
      const alertCategory = proposal.type === 'alert' ? 'urgent' : proposal.type === 'insight' ? 'law' : 'safe_shopping';
      const categoryLabel = proposal.type === 'alert' ? '긴급 피해주의보' : proposal.type === 'insight' ? '법 개정/의무 시행' : '복지/안심 쇼핑';

      const keyPointsStr = [
        `🚨 ${proposal.title} 심각도 경보 발령`,
        `⚖️ 근거 조항: ${proposal.lawBasis || '소비자기본법 규정'}`,
        `💡 1:1 대리 청구를 통한 100% 안심 구제 신청 즉각 지원`
      ].join('|');

      const actionGuideStr = [
        `1단계: 메인화면 실시간 랭킹 또는 1:1 CS 문의 접수처에서 '[${proposal.badge}]' 프리필 서식을 터치하여 불러옵니다.`,
        `2단계: 자신의 회원 계정 식별 수단(이메일/아이디) 및 사건 정황 일시를 상세히 기입합니다.`,
        `3단계: 제출 버튼을 누르면 당사 제휴 전담 법무팀 및 소비자 신속 전송망 핫라인을 통해 1초 만에 원스톱 이송 및 처리가 연계됩니다.`
      ].join('|');

      const newAlertItem = {
        id: alertId,
        category: alertCategory,
        categoryLabel: categoryLabel,
        badgeText: proposal.badge || '긴급 고지',
        urgency: 'high',
        title: proposal.title,
        summary: proposal.explanation || `"${proposal.title}" 사건에 따른 긴급 가이드 및 대리 청구 신청 접수가 개시되었습니다. 소비자는 정당한 보상을 청구할 권리가 있습니다.`,
        targetAudience: `해당 서비스(${proposal.badge}) 이용 이력이 있거나 피해가 의심되는 모든 국민`,
        institution: '모두의문의 AI 자율 탐지 관제팀',
        effectiveDate: todayString,
        keyPoints: keyPointsStr,
        actionGuide: actionGuideStr,
        lawBasis: proposal.lawBasis || '소비자기본법',
        contactNumber: '1372',
        pinned: true,
        createdAt: serverTimestamp()
      };

      await setDoc(doc(db, 'public_alerts', alertId), newAlertItem);

      // Channel 3: Pushing to Consumer Insights (문의 허브 - 트렌드 해결 가이드 핸드북)
      const insightId = `is_prop_${timestampMs}`;
      const newInsightItem = {
        id: insightId,
        title: proposal.title,
        emoji: proposal.emoji || '💡',
        summary: proposal.explanation || `"${proposal.title}" 사건에 대한 긴급 법적 대항 가이드라인 요약서입니다.`,
        lawBasis: proposal.lawBasis || '소비자기본법 규정',
        badge: proposal.badge || '소비자 권익',
        fullTip: [
          `[1. 사건 상황 개요]\n최근 언론 및 포털을 달구고 있는 [${proposal.title}] 사건과 관련하여 가습 수집 및 피해가 누적되고 있습니다.`,
          `\n[2. 법적 구제 근거]\n${proposal.lawBasis || '관계 법령'}에 입각해, 소비자는 부당 행위에 대한 전액 환불, 원상 복구 및 위자료 성격의 손해배상을 청구할 전속적이고 불가침한 권리를 가집니다.`,
          `\n[3. 1분 안심 실천 프로토콜]\n- 1단계: 실시간 랭킹판에 노출된 해당 카드를 클릭해 '[🔮 AI 비서 즉석 대항 빌더]' 또는 '[✉️ 1:1 대리 접수 채널]'을 가동합니다.`,
          `- 2단계: 플랫폼이 자동으로 본문 입력창에 미리 채워주는(Pre-filled) 완벽 대항 서식 양식을 불러옵니다.`,
          `- 3단계: 개인 상황에 맞게 1~2자 보정 후 전송하면 핫라인 제휴처로 무지연 공식 이송되어 엄중 대처가 연계됩니다.`,
          `\n[4. 핵심 프로 팁 및 주의 사항]\n※ 대기업 또는 가해 측이 임의로 제시하는 소액 할인쿠폰, 1개월 무료 체험권 등 약소한 회유책에 '합의 서명' 또는 '동의 완료' 처리를 해버릴 경우, 차후 국가 기관이나 정식 소송을 통한 법정 위자료 청구권이 영구 소멸될 수 있으므로, 합의 전 반드시 모두의문의 1:1 CS 자문 및 대리 이송을 활용해 본인의 온전한 권리를 확보하십시오.`
        ].join('\n'),
        createdAt: serverTimestamp()
      };

      await setDoc(doc(db, 'consumer_insights', insightId), newInsightItem);

      // 4. Mark proposal as approved
      await updateDoc(doc(db, 'ai_proposals', proposal.id), {
        status: 'approved',
        approvedAt: serverTimestamp()
      });

      showToast("🏆 대성공! 랭킹 1위 즉시 탑재 + 모두의알림 긴급 고지 + 문의 허브 해결 백과사전 동시 일괄 배포를 전격 완료했습니다!");
    } catch (err: any) {
      console.error("Unified Approve proposal error:", err);
      alert("일괄 배포 및 제안 승인 처리 실패: " + err.message);
    }
  };

  // Reject proposal (remove from pending proposals list)
  const handleRejectProposal = (proposalId: string) => {
    askConfirmation(
      "AI 제안 반려 확인",
      "정말로 이 AI 권구제 제안을 반려하고 목록에서 영구 삭제하시겠습니까?",
      async () => {
        try {
          await deleteDoc(doc(db, 'ai_proposals', proposalId));
          showToast("❌ AI 추천 제안을 반려하고 보관함에서 파기 완료했습니다.");
        } catch (err: any) {
          alert("제안 반려 실패: " + err.message);
        }
      }
    );
  };

  // Real-time listener for rankings
  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'rankings'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: RankingItem[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });

      // Sort by rank ascending
      const sorted = items.sort((a, b) => a.rank - b.rank);

      // Automatic Seeding if collection is empty
      if (items.length === 0) {
        console.log("Seeding initial 20 standard rankings from admin panel...");
        // Set immediately to default seed rankings so UI is populated instantly!
        const mappedSeeds = DEFAULT_SEED_RANKINGS.map((d, index) => ({ id: `rank_${d.rank}`, ...d } as any));
        setRankings(mappedSeeds);
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
            console.error("Admin auto seeding failed:", err);
          }
        };
        seedCollection();
      } else {
        setRankings(sorted);
        setLoading(false);
      }
    }, (err) => {
      console.error("Firestore rankings load error:", err);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Save/re-index rank order of the entire list to Firestore
  const saveRankingsToDb = async (itemsList: RankingItem[]) => {
    try {
      const batch = writeBatch(db);
      itemsList.forEach((item, index) => {
        const docRef = doc(db, 'rankings', item.id);
        batch.update(docRef, { rank: index + 1 });
      });
      await batch.commit();
      showToast("🏆 실시간 순위 데이터가 일괄 재정렬(Re-indexed) 되었습니다.");
    } catch (err) {
      console.error("Failed to save re-ordered ranks:", err);
      alert("순위 업데이트 실패: " + err);
    }
  };

  // Move item up
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newList = [...rankings];
    const temp = newList[index];
    newList[index] = newList[index - 1];
    newList[index - 1] = temp;
    setRankings(newList);
    saveRankingsToDb(newList);
  };

  // Move item down
  const handleMoveDown = (index: number) => {
    if (index === rankings.length - 1) return;
    const newList = [...rankings];
    const temp = newList[index];
    newList[index] = newList[index + 1];
    newList[index + 1] = temp;
    setRankings(newList);
    saveRankingsToDb(newList);
  };

  // AI Auto sorting based on hot index descending
  const handleAiAutoSort = async () => {
    if (rankings.length === 0) return;
    setIsAiSorting(true);
    try {
      const sortedByHotIndex = [...rankings].sort((a, b) => b.hotIndex - a.hotIndex);
      await saveRankingsToDb(sortedByHotIndex);
      showToast("🔥 AI 트래픽 인덱스 기반으로 20개 순위가 완벽 자동 재정렬되었습니다.");
    } catch (err) {
      console.error("AI auto sort error:", err);
    } finally {
      setIsAiSorting(false);
    }
  };

  // Add new ranking
  const handleAddRanking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.title.trim()) {
      alert("제목을 입력해 주세요.");
      return;
    }

    try {
      const nextRank = rankings.length + 1;
      const docId = `rank_${Date.now()}`;
      const newDoc = {
        ...addForm,
        rank: nextRank,
        createdAt: serverTimestamp()
      };

      await setDoc(doc(db, 'rankings', docId), newDoc);
      setIsAddModalOpen(false);
      // Reset form
      setAddForm({
        type: 'insight',
        title: '',
        badge: '법률 상식',
        emoji: '💡',
        hotIndex: 1200,
        growthRate: 15,
        lawBasis: '',
        actionType: 'assistant',
        actionTopic: '',
        parentCategory: 'other',
        subCategory: '일반상담',
        prefillTitle: '',
        prefillContent: ''
      });
      showToast("➕ 신규 랭킹 항목이 성공적으로 등록되었습니다!");
    } catch (err: any) {
      alert("추가 실패: " + err.message);
    }
  };

  // Open edit modal
  const openEditModal = (item: RankingItem) => {
    setEditingItem(item);
    setEditForm({
      type: item.type,
      title: item.title,
      badge: item.badge,
      emoji: item.emoji,
      hotIndex: item.hotIndex,
      growthRate: item.growthRate,
      lawBasis: item.lawBasis || '',
      actionType: item.actionType,
      actionTopic: item.actionTopic,
      parentCategory: item.parentCategory || 'other',
      subCategory: item.subCategory || '지능형 자동 매핑',
      prefillTitle: item.prefillTitle || '',
      prefillContent: item.prefillContent || ''
    });
    setIsEditModalOpen(true);
  };

  // Save edited ranking
  const handleEditRanking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      const docRef = doc(db, 'rankings', editingItem.id);
      await updateDoc(docRef, {
        ...editForm,
        updatedAt: serverTimestamp()
      });
      setIsEditModalOpen(false);
      setEditingItem(null);
      showToast("📝 랭킹 세부 정보가 실시간 수정 반영되었습니다!");
    } catch (err: any) {
      alert("수정 실패: " + err.message);
    }
  };

  // Delete ranking with automatic re-indexing
  const handleDeleteRanking = (id: string, currentRank: number) => {
    askConfirmation(
      "랭킹 항목 삭제 확인",
      "정말로 이 랭킹 항목을 삭제하시겠습니까? 삭제 후 남은 항목들의 순위는 자동으로 재조정(Re-indexed)됩니다.",
      async () => {
        try {
          await deleteDoc(doc(db, 'rankings', id));
          
          // Re-index remaining
          const remaining = rankings.filter(r => r.id !== id);
          await saveRankingsToDb(remaining);
          showToast("🗑️ 랭킹 삭제 및 잔여 순위 자동 수정을 완료했습니다.");
        } catch (err: any) {
          alert("삭제 실패: " + err.message);
        }
      }
    );
  };

  // Restore Seed Data
  const handleRestoreSeeds = () => {
    askConfirmation(
      "기본 시드 데이터 복원 확인",
      "주의! 복원 시 현재 적재된 랭킹 정보가 모두 삭제되고 초기 20개 기본 시드 데이터로 강제 리셋됩니다. 진행하시겠습니까?",
      async () => {
        setLoading(true);
        try {
          const batch = writeBatch(db);
          
          // 1. Delete all existing
          for (const item of rankings) {
            batch.delete(doc(db, 'rankings', item.id));
          }
          await batch.commit();

          // 2. Insert seeds
          for (let i = 0; i < DEFAULT_SEED_RANKINGS.length; i++) {
            const seed = DEFAULT_SEED_RANKINGS[i];
            const docId = `rank_${seed.rank}`;
            await setDoc(doc(db, 'rankings', docId), {
              ...seed,
              createdAt: serverTimestamp()
            });
          }
          showToast("🔄 국가대표급 대표 실시간 시드 데이터 20건 복원을 전격 완료했습니다!");
        } catch (err: any) {
          alert("리셋 실패: " + err.message);
        } finally {
          setLoading(false);
        }
      }
    );
  };

  // Filter rankings list
  const filteredRankings = useMemo(() => {
    return rankings.filter(item => {
      // Tab filter
      if (activeTab !== 'all' && item.type !== activeTab) return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchBadge = item.badge.toLowerCase().includes(q);
        const matchLaw = item.lawBasis?.toLowerCase().includes(q);
        if (!matchTitle && !matchBadge && !matchLaw) return false;
      }
      return true;
    });
  }, [rankings, searchQuery, activeTab]);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
      
      {/* 어드민 상단 헤더 및 통제 패널 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-amber-500 animate-bounce" />
            <h3 className="text-base font-black text-slate-900">실시간 안심 구제 랭킹 통제실</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full border border-amber-200 animate-pulse">
              LIVE BROADCAST CONTROL
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed font-semibold">
            사용자 첫 화면의 최상단 20개 실시간 구제 카드에 대한 노출 가중치, 순서 교환, 신규 카드 삽입 및 삭제를 실시간 조율합니다.
          </p>
        </div>

        {/* Action controllers */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => { setIsScanModalOpen(true); setScanStep(0); }}
            disabled={isScanning}
            className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className="h-4 w-4" />
            <span>AI 실시간 트렌드 자율 스캔</span>
          </button>

          <button
            onClick={handleAiAutoSort}
            disabled={isAiSorting || rankings.length === 0}
            className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4 text-amber-300" />
            <span>AI 트래픽 자동 정렬</span>
          </button>
          
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>신규 랭킹 카드 등록</span>
          </button>

          <button
            onClick={handleRestoreSeeds}
            className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
            title="기본 시드 20선 데이터 복원"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 🔮 AI 자율 소비자 핫이슈 제안실 */}
      {proposals.length > 0 && (
        <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 border border-indigo-500/20 p-5 sm:p-6 rounded-3xl text-white space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-500/10 pb-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-amber-300 animate-pulse" />
                <h4 className="text-sm sm:text-base font-black tracking-tight">🔮 AI 실시간 소비자 핫이슈 제안실</h4>
                <span className="text-[10px] font-black tracking-widest text-indigo-200 bg-indigo-500/20 px-2.5 py-0.5 rounded-md border border-indigo-400/30">
                  {proposals.length}건 대기중
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300 font-semibold leading-relaxed">
                실시간 구글 검색 트렌드 분석을 바탕으로 AI가 제안하는 긴급 구제 대기 항목입니다. 배포 승인 시 즉시 실시간 랭킹 1위로 탑재됩니다.
              </p>
            </div>
            
            <button
              onClick={() => handleScanTrends(useGrounding)}
              disabled={isScanning}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-1 shrink-0 transition-all cursor-pointer"
            >
              <RefreshCw className={`h-3 w-3 ${isScanning ? 'animate-spin' : ''}`} />
              <span>실시간 재스캔</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
            {proposals.map((prop) => {
              const badgeColor = prop.type === 'inquiry'
                ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-500/40'
                : prop.type === 'alert'
                ? 'bg-red-500/20 text-red-200 border border-red-500/40'
                : 'bg-amber-500/20 text-amber-200 border border-amber-500/40';

              const typeText = prop.type === 'inquiry' ? '1:1 CS 문의' : prop.type === 'alert' ? '피해 주의보' : '법률 상식';

              return (
                <div 
                  key={prop.id} 
                  className="bg-white/5 border border-indigo-500/10 hover:border-indigo-500/20 rounded-2xl p-4.5 flex flex-col justify-between space-y-4 hover:bg-white/8 transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xl p-1 bg-white/10 rounded-lg">{prop.emoji}</span>
                        <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-md ${badgeColor}`}>
                          {prop.badge}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">({typeText})</span>
                      </div>
                      
                      <div className="flex items-center space-x-1.5 font-bold font-mono text-[10px] text-red-400">
                        <TrendingUp className="h-3 w-3" />
                        <span>+{prop.growthRate}% up</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h5 className="text-xs sm:text-sm font-black text-slate-100 leading-snug">
                        {prop.title}
                      </h5>
                      <div className="flex items-center space-x-3 text-[10px] text-slate-400 font-semibold">
                        <span>근거: <strong className="text-slate-200">{prop.lawBasis || '소비자원 규정'}</strong></span>
                        <span>액션: <strong className="text-indigo-300 font-mono">{prop.actionType} ({prop.actionTopic})</strong></span>
                      </div>
                    </div>

                    <p className="text-[10.5px] leading-relaxed text-indigo-200 bg-indigo-950/40 p-2.5 rounded-xl border border-indigo-900/40">
                      <strong>🤖 AI 제안 근거:</strong> {prop.explanation}
                    </p>

                    {prop.source === "google_news_live" || prop.source === "gemini_grounded" ? (
                      <div className="text-[10.5px] leading-relaxed text-emerald-200 bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-900/40 space-y-1.5">
                        <div className="flex items-center gap-1 font-black text-emerald-400">
                          <span className="p-0.5 bg-emerald-500/10 rounded">📰</span>
                          <span>구글 뉴스 실시간 검증 완료</span>
                        </div>
                        {prop.searchQueries && prop.searchQueries.length > 0 && (
                          <div className="text-[10px] text-slate-300 font-semibold">
                            <strong>🔍 수집 출처:</strong> {prop.searchQueries.join(", ")}
                          </div>
                        )}
                        {prop.sources && prop.sources.length > 0 ? (
                          <div className="space-y-1">
                            <strong className="text-[10px] text-slate-300 block">🔗 실제 보도 기사 원문:</strong>
                            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1 no-scrollbar">
                              {prop.sources.map((src: any, idx: number) => (
                                <a
                                  key={idx}
                                  href={src.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] text-indigo-300 hover:text-indigo-200 hover:underline bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-900/40 inline-block font-medium max-w-full truncate"
                                  title={src.title}
                                >
                                  {src.title || src.url} ↗
                                </a>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-[10px] text-amber-300 font-bold">
                            검색 근거 없음
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-[10.5px] leading-relaxed text-indigo-200 bg-indigo-950/40 p-2.5 rounded-xl border border-indigo-900/40 space-y-1 font-semibold">
                        <div className="font-black text-slate-300 flex items-center gap-1">
                          <span className="p-0.5 bg-indigo-500/10 rounded">🤖</span>
                          <span>AI 추천 — 실시간 검색 미사용</span>
                        </div>
                        <div className="text-[10px] text-amber-300 font-bold">
                          검색 근거 없음
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 pt-1">
                    <button
                      onClick={() => handleApproveProposal(prop)}
                      className="flex-1 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-black shadow-sm flex items-center justify-center gap-1 cursor-pointer transition-all"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 animate-bounce" style={{ animationDuration: '2s' }} />
                      <span>Live 1위 즉시 배포</span>
                    </button>
                    <button
                      onClick={() => handleRejectProposal(prop.id)}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-red-400 rounded-xl text-xs font-bold cursor-pointer transition-all"
                      title="제안 반려"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 🔍 검색 바 및 카테고리 필터 */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Filter categories */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              activeTab === 'all' ? 'bg-white text-slate-950 shadow-3xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            전체 리스트 ({rankings.length})
          </button>
          <button
            onClick={() => setActiveFilter('inquiry')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              activeTab === 'inquiry' ? 'bg-white text-indigo-700 shadow-3xs' : 'text-slate-600 hover:text-indigo-600'
            }`}
          >
            🛵 1:1 CS 문의
          </button>
          <button
            onClick={() => setActiveFilter('alert')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              activeTab === 'alert' ? 'bg-white text-red-700 shadow-3xs' : 'text-slate-600 hover:text-red-600'
            }`}
          >
            🚨 피해 주의보
          </button>
          <button
            onClick={() => setActiveFilter('insight')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              activeTab === 'insight' ? 'bg-white text-amber-700 shadow-3xs' : 'text-slate-600 hover:text-amber-700'
            }`}
          >
            ✉️ 법률/행정 상식
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="랭킹명 및 법령 근거 실시간 검색..."
            className="w-full bg-slate-50 text-xs rounded-xl pl-9 pr-9 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 📋 랭킹 리스트 데이터 그리드 테이블 */}
      {loading ? (
        <div className="text-center py-16 space-y-3">
          <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-semibold">파이어베이스 실시간 랭킹 원천 테이블 연동 중...</p>
        </div>
      ) : filteredRankings.length === 0 ? (
        <div className="text-center py-16 bg-slate-50/50 rounded-2xl border border-slate-100">
          <p className="text-xs text-slate-400 font-bold">일치하는 랭킹 항목이 없습니다.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-3xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                <th className="p-4 w-16 text-center">순위</th>
                <th className="p-4 w-14 text-center">아이콘</th>
                <th className="p-4 w-28">대분류 / 배지</th>
                <th className="p-4">공고 및 상식 가이드 명칭</th>
                <th className="p-4 w-24 text-right">관심지수</th>
                <th className="p-4 w-20 text-right">등락율</th>
                <th className="p-4 w-32">브릿지 작동 타깃</th>
                <th className="p-4 w-32 text-center">순서조정</th>
                <th className="p-4 w-28 text-center">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRankings.map((item, index) => {
                const isRank1 = item.rank === 1;
                const isRank2 = item.rank === 2;
                const isRank3 = item.rank === 3;
                const isTop3 = isRank1 || isRank2 || isRank3;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Rank Badge */}
                    <td className="p-4 text-center font-bold">
                      <span className={`h-6 w-6 rounded-full inline-flex items-center justify-center text-xs font-black ${
                        isRank1 ? 'bg-amber-500 text-white' :
                        isRank2 ? 'bg-slate-400 text-white' :
                        isRank3 ? 'bg-orange-500 text-white' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {item.rank}
                      </span>
                    </td>

                    {/* Emoji */}
                    <td className="p-4 text-center text-2xl font-emoji">{item.emoji}</td>

                    {/* Badge */}
                    <td className="p-4 font-bold">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${
                        item.type === 'inquiry' ? 'bg-indigo-50 text-indigo-700' :
                        item.type === 'alert' ? 'bg-red-50 text-red-700' :
                        'bg-amber-50 text-amber-700'
                      }`}>
                        {item.badge}
                      </span>
                    </td>

                    {/* Title & Law Basis */}
                    <td className="p-4 max-w-sm">
                      <p className={`font-bold text-slate-800 leading-snug truncate ${isTop3 ? 'text-slate-950 font-black' : ''}`}>
                        {item.title}
                      </p>
                      {item.lawBasis && (
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">근거: {item.lawBasis}</p>
                      )}
                    </td>

                    {/* Hot Index */}
                    <td className="p-4 text-right font-semibold font-mono text-slate-700">
                      {item.hotIndex.toLocaleString()}
                    </td>

                    {/* Growth Rate */}
                    <td className="p-4 text-right font-black text-red-600 font-mono">
                      +{item.growthRate}%
                    </td>

                    {/* Action Bridge Info */}
                    <td className="p-4 font-medium text-slate-600">
                      <div className="space-y-0.5">
                        <span className="text-[9px] bg-slate-100 text-slate-700 px-1 py-0.2 rounded font-black border uppercase">
                          {item.actionType}
                        </span>
                        <p className="text-[10px] text-slate-400 font-mono truncate max-w-[110px]" title={item.actionTopic}>
                          {item.actionTopic}
                        </p>
                      </div>
                    </td>

                    {/* Priority Shifter Buttons */}
                    <td className="p-4 text-center">
                      <div className="inline-flex items-center space-x-1">
                        <button
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 disabled:opacity-20 rounded-lg cursor-pointer transition-colors shadow-3xs"
                          title="한 단계 위로"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleMoveDown(index)}
                          disabled={index === rankings.length - 1}
                          className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 disabled:opacity-20 rounded-lg cursor-pointer transition-colors shadow-3xs"
                          title="한 단계 아래로"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </button>
                      </div>
                    </td>

                    {/* CRUD Actions */}
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors cursor-pointer"
                          title="세부 정보 편집"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteRanking(item.id, item.rank)}
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors cursor-pointer"
                          title="삭제"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ➕ 신규 추가 모달 */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-950 flex items-center gap-1.5">
                <Trophy className="h-5 w-5 text-amber-500 animate-spin" style={{ animationDuration: '3s' }} />
                <span>실시간 랭킹 카드 신규 등록</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddRanking} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">대항 분류</label>
                  <select
                    value={addForm.type}
                    onChange={(e) => setAddForm({ ...addForm, type: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800"
                  >
                    <option value="insight">✉️ 법률/행정 상식</option>
                    <option value="alert">🚨 피해 주의보</option>
                    <option value="inquiry">🛵 1:1 CS 문의</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">배지 이니셜</label>
                  <input
                    type="text"
                    value={addForm.badge}
                    onChange={(e) => setAddForm({ ...addForm, badge: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">대표 이모지</label>
                  <input
                    type="text"
                    value={addForm.emoji}
                    onChange={(e) => setAddForm({ ...addForm, emoji: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-center font-emoji text-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">관심 지수 (pt)</label>
                  <input
                    type="number"
                    value={addForm.hotIndex}
                    onChange={(e) => setAddForm({ ...addForm, hotIndex: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">실시간 등락율 (%)</label>
                  <input
                    type="number"
                    value={addForm.growthRate}
                    onChange={(e) => setAddForm({ ...addForm, growthRate: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-red-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">랭킹 카드 공고/상식 제목</label>
                <textarea
                  value={addForm.title}
                  onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 leading-snug"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">법적 보호 근거 (선택)</label>
                <input
                  type="text"
                  value={addForm.lawBasis}
                  onChange={(e) => setAddForm({ ...addForm, lawBasis: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-600"
                />
              </div>

              {/* 브릿지 액션 연결 구성기 */}
              <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-3">
                <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest block">🔗 즉시 연결 브릿지 액션 바인딩</span>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">브릿지 액션 종류</label>
                    <select
                      value={addForm.actionType}
                      onChange={(e) => setAddForm({ ...addForm, actionType: e.target.value as any })}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2"
                    >
                      <option value="assistant">🔮 모두의비서 기동</option>
                      <option value="alert">🚨 모두의알림 연동</option>
                      <option value="inquiry">✉️ 1:1 민원 서식 기입</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">액션 타깃 키워드 / 토픽</label>
                    <input
                      type="text"
                      value={addForm.actionTopic}
                      onChange={(e) => setAddForm({ ...addForm, actionTopic: e.target.value })}
                      placeholder="예: content-certification, gov-wallet, 부고 등"
                      className="w-full bg-white border border-slate-200 rounded-xl p-2 font-mono text-[10px]"
                    />
                  </div>
                </div>

                {addForm.actionType === 'inquiry' && (
                  <div className="space-y-2 pt-2 border-t border-indigo-100/50">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-bold text-slate-500 block mb-0.5">상위 분류</label>
                        <select
                          value={addForm.parentCategory}
                          onChange={(e) => setAddForm({ ...addForm, parentCategory: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-lg p-1.5"
                        >
                          <option value="shopping">쇼핑/배송/결제</option>
                          <option value="travel">여가/여행/예약</option>
                          <option value="restaurant">외식/다이닝/예약</option>
                          <option value="other">기타/개선제안</option>
                        </select>
                      </div>
                      <div>
                        <label className="font-bold text-slate-500 block mb-0.5">소분류</label>
                        <input
                          type="text"
                          value={addForm.subCategory}
                          onChange={(e) => setAddForm({ ...addForm, subCategory: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-lg p-1.5"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="font-bold text-slate-500 block mb-0.5">추천 제목</label>
                      <input
                        type="text"
                        value={addForm.prefillTitle}
                        onChange={(e) => setAddForm({ ...addForm, prefillTitle: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-lg p-1.5 font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-500 block mb-0.5">서식 본문 가이드</label>
                      <textarea
                        value={addForm.prefillContent}
                        onChange={(e) => setAddForm({ ...addForm, prefillContent: e.target.value })}
                        rows={3}
                        className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-[11px] leading-relaxed"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end space-x-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl"
                >
                  정식 랭킹 삽입
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 📝 편집 모달 */}
      {isEditModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-950 flex items-center gap-1.5">
                <Pencil className="h-4.5 w-4.5 text-indigo-600" />
                <span>실시간 랭킹 카드 정보 수정 (순위 #{editingItem.rank})</span>
              </h3>
              <button onClick={() => { setIsEditModalOpen(false); setEditingItem(null); }} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditRanking} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">대항 분류</label>
                  <select
                    value={editForm.type}
                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800"
                  >
                    <option value="insight">✉️ 법률/행정 상식</option>
                    <option value="alert">🚨 피해 주의보</option>
                    <option value="inquiry">🛵 1:1 CS 문의</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">배지 이니셜</label>
                  <input
                    type="text"
                    value={editForm.badge}
                    onChange={(e) => setEditForm({ ...editForm, badge: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">대표 이모지</label>
                  <input
                    type="text"
                    value={editForm.emoji}
                    onChange={(e) => setEditForm({ ...editForm, emoji: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-center font-emoji text-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">관심 지수 (pt)</label>
                  <input
                    type="number"
                    value={editForm.hotIndex}
                    onChange={(e) => setEditForm({ ...editForm, hotIndex: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">실시간 등락율 (%)</label>
                  <input
                    type="number"
                    value={editForm.growthRate}
                    onChange={(e) => setEditForm({ ...editForm, growthRate: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-red-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">랭킹 카드 공고/상식 제목</label>
                <textarea
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 leading-snug"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">법적 보호 근거 (선택)</label>
                <input
                  type="text"
                  value={editForm.lawBasis}
                  onChange={(e) => setEditForm({ ...editForm, lawBasis: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-600"
                />
              </div>

              {/* 브릿지 액션 연결 구성기 */}
              <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-3">
                <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest block">🔗 즉시 연결 브릿지 액션 바인딩</span>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">브릿지 액션 종류</label>
                    <select
                      value={editForm.actionType}
                      onChange={(e) => setEditForm({ ...editForm, actionType: e.target.value as any })}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2"
                    >
                      <option value="assistant">🔮 모두의비서 기동</option>
                      <option value="alert">🚨 모두의알림 연동</option>
                      <option value="inquiry">✉️ 1:1 민원 서식 기입</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">액션 타깃 키워드 / 토픽</label>
                    <input
                      type="text"
                      value={editForm.actionTopic}
                      onChange={(e) => setEditForm({ ...editForm, actionTopic: e.target.value })}
                      placeholder="예: content-certification, gov-wallet, 부고 등"
                      className="w-full bg-white border border-slate-200 rounded-xl p-2 font-mono text-[10px]"
                    />
                  </div>
                </div>

                {editForm.actionType === 'inquiry' && (
                  <div className="space-y-2 pt-2 border-t border-indigo-100/50">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-bold text-slate-500 block mb-0.5">상위 분류</label>
                        <select
                          value={editForm.parentCategory}
                          onChange={(e) => setEditForm({ ...editForm, parentCategory: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-lg p-1.5"
                        >
                          <option value="shopping">쇼핑/배송/결제</option>
                          <option value="travel">여가/여행/예약</option>
                          <option value="restaurant">외식/다이닝/예약</option>
                          <option value="other">기타/개선제안</option>
                        </select>
                      </div>
                      <div>
                        <label className="font-bold text-slate-500 block mb-0.5">소분류</label>
                        <input
                          type="text"
                          value={editForm.subCategory}
                          onChange={(e) => setEditForm({ ...editForm, subCategory: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-lg p-1.5"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="font-bold text-slate-500 block mb-0.5">추천 제목</label>
                      <input
                        type="text"
                        value={editForm.prefillTitle}
                        onChange={(e) => setEditForm({ ...editForm, prefillTitle: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-lg p-1.5 font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-500 block mb-0.5">서식 본문 가이드</label>
                      <textarea
                        value={editForm.prefillContent}
                        onChange={(e) => setEditForm({ ...editForm, prefillContent: e.target.value })}
                        rows={3}
                        className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-[11px] leading-relaxed"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end space-x-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => { setIsEditModalOpen(false); setEditingItem(null); }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl animate-pulse"
                >
                  수정사항 전송
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🔮 AI 실시간 소비 트렌드 자율 스캔 모달 */}
      {isScanModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-950 text-white rounded-3xl max-w-4xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-indigo-500/20 p-6 sm:p-8 space-y-6 animate-scaleUp">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-amber-300 animate-pulse" />
                  <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-100">
                    AI 실시간 트렌드 자율 스캔 엔진 작동기
                  </h3>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-400">
                  구글 검색 및 공정위 피해구제 보도자료를 연동하여 트래픽 급상승 트렌드를 실시간 수집 및 파싱합니다.
                </p>
              </div>
              <button 
                onClick={() => { setIsScanModalOpen(false); setScanStep(0); }} 
                className="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer"
                disabled={isScanning}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Setup / Option Selection screen */}
            {!isScanning && scanStep === 0 && (
              <div className="space-y-6 max-w-2xl mx-auto py-4">
                <div className="bg-slate-900/60 p-5 rounded-2xl border border-white/5 space-y-4">
                  <h4 className="text-sm font-black text-slate-200">🔮 스캔 모드 선택 및 실시간 데이터 수집 설정</h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                    실시간 구글 뉴스 피드(Google News RSS)를 직접 수집하여 보도된 실제 기사를 바탕으로 제안 카드를 생성하거나, 검색 없이 빠른 AI 자율 모드를 선택할 수 있습니다.
                  </p>

                  {/* 🔍 실시간 검색어 입력단 (피해, 혜택, 보상, 브랜드명 등 자율 검색 매칭 가능) */}
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <label className="text-[11px] font-black text-indigo-300 uppercase tracking-wider block">
                      🔍 구글 뉴스 검색 키워드 (선택 사항)
                    </label>
                    <input
                      type="text"
                      value={scanKeyword}
                      onChange={(e) => setScanKeyword(e.target.value)}
                      placeholder="예: 티빙, 쿠팡, 통신비, 위약금, 리콜, 지원금 등"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-slate-100 font-extrabold placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                    />
                    <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                      💡 키워드를 입력하시면 해당 검색어와 관련된 최신 구글 뉴스 기사를 우선 수집하며, 비워두시면 실시간 대한민국 소비자 이슈 기사를 수집합니다.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5">
                    {/* Mode 1: Fast Mode */}
                    <div 
                      onClick={() => setUseGrounding(false)}
                      className={`p-4 rounded-2xl border cursor-pointer flex flex-col justify-between transition-all select-none ${
                        !useGrounding 
                          ? 'bg-indigo-950/40 border-indigo-500 text-slate-100' 
                          : 'bg-slate-900/40 border-white/10 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="p-1 bg-indigo-500/10 rounded-lg text-lg">🤖</span>
                          <span className="text-xs font-black">AI 자율 추천 모드</span>
                        </div>
                        <p className="text-[10px] leading-relaxed text-slate-400 font-semibold">
                          실시간 검색 없이 Gemini 3.8 내장 지식을 활용해 대표적인 소비자 구제 가이드라인을 신속하게 생성합니다.
                        </p>
                      </div>
                      <div className="flex items-center space-x-1.5 mt-4 text-[10px] font-bold text-indigo-400">
                        <span>● 빠른 응답</span>
                        <span>● 실시간 검색 미사용</span>
                      </div>
                    </div>

                    {/* Mode 2: Grounding Mode */}
                    <div 
                      onClick={() => setUseGrounding(true)}
                      className={`p-4 rounded-2xl border cursor-pointer flex flex-col justify-between transition-all select-none ${
                        useGrounding 
                          ? 'bg-emerald-950/40 border-emerald-500 text-slate-100' 
                          : 'bg-slate-900/40 border-white/10 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="p-1 bg-emerald-500/10 rounded-lg text-lg">📰</span>
                          <span className="text-xs font-black">실시간 구글 뉴스(RSS) 연동 모드 (권장)</span>
                        </div>
                        <p className="text-[10px] leading-relaxed text-slate-400 font-semibold">
                          구글 뉴스 실시간 피드에서 실제 최신 기사를 직접 수집하고, 수집된 기사 원문과 링크를 바탕으로 AI가 정밀 분석합니다.
                        </p>
                      </div>
                      <div className="flex items-center space-x-1.5 mt-4 text-[10px] font-bold text-emerald-400">
                        <span>● 실제 기사 원문 제공</span>
                        <span>● 100% 실시간 뉴스 연동</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center pt-2">
                  <button
                    onClick={() => handleScanTrends(useGrounding)}
                    className="px-8 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-2xl text-xs font-black shadow-lg shadow-indigo-500/20 flex items-center gap-2 cursor-pointer transform hover:scale-[1.02] transition-all active:scale-[0.98]"
                  >
                    <RefreshCw className="h-4 w-4 animate-pulse" />
                    <span>실시간 소비자 트렌드 스캔 개시</span>
                  </button>
                </div>
              </div>
            )}

            {/* Scanning progress display */}
            {isScanning && (
              <div className="py-8 space-y-6 text-center max-w-md mx-auto">
                <div className="flex justify-center">
                  <div className="relative flex items-center justify-center h-16 w-16">
                    <span className="animate-ping absolute inline-flex h-12 w-12 rounded-full bg-indigo-500 opacity-20"></span>
                    <RefreshCw className="h-8 w-8 text-indigo-400 animate-spin" />
                  </div>
                </div>

                <div className="space-y-3 text-left">
                  {/* Step 1 */}
                  <div className="flex items-center space-x-3 text-xs">
                    <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      scanStep > 1 ? 'bg-emerald-500 text-slate-950' : scanStep === 1 ? 'bg-indigo-600 text-white animate-pulse' : 'bg-white/10 text-slate-500'
                    }`}>
                      {scanStep > 1 ? '✓' : '1'}
                    </span>
                    <span className={scanStep === 1 ? 'text-indigo-300 font-extrabold' : scanStep > 1 ? 'text-slate-400 line-through' : 'text-slate-500'}>
                      {useGrounding ? '구글 뉴스 RSS 네트워크 피드 연결 및 기사 탐색 중...' : '키워드 기반 분석 요청 파라미터 준비 중...'}
                    </span>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-center space-x-3 text-xs">
                    <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      scanStep > 2 ? 'bg-emerald-500 text-slate-950' : scanStep === 2 ? 'bg-indigo-600 text-white animate-pulse' : 'bg-white/10 text-slate-500'
                    }`}>
                      {scanStep > 2 ? '✓' : '2'}
                    </span>
                    <span className={scanStep === 2 ? 'text-indigo-300 font-extrabold' : scanStep > 2 ? 'text-slate-400 line-through' : 'text-slate-500'}>
                      {useGrounding ? '실시간 뉴스 헤드라인 및 언론사 데이터 추출 완료...' : '로컬 인텔리전스 텍스트 가공 완료...'}
                    </span>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-center space-x-3 text-xs">
                    <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      scanStep > 3 ? 'bg-emerald-500 text-slate-950' : scanStep === 3 ? 'bg-indigo-600 text-white animate-pulse' : 'bg-white/10 text-slate-500'
                    }`}>
                      {scanStep > 3 ? '✓' : '3'}
                    </span>
                    <span className={scanStep === 3 ? 'text-indigo-300 font-extrabold' : 'text-slate-500'}>
                      {useGrounding ? '수집된 실제 구글 뉴스를 바탕으로 Gemini AI 정밀 분석 및 구제 카드 작성 중...' : '초고속 AI 자율 핫이슈 추출 및 데이터 가공 중...'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Results display (scanStep === 4) */}
            {scanStep === 4 && (
              <div className="space-y-6">
                {/* 1. Real Google News RSS Search Results Section */}
                {scannedNewsArticles.length > 0 && (
                  <div className="bg-slate-900/80 border border-indigo-500/30 rounded-2xl p-4.5 space-y-3 shadow-inner">
                    <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2.5">
                      <div className="flex items-center space-x-2">
                        <span className="text-base p-1 bg-indigo-500/20 rounded-lg">📰</span>
                        <div>
                          <h4 className="text-xs font-black text-indigo-200">
                            실시간 구글 뉴스(Google News) 실제 수집 결과
                          </h4>
                          <p className="text-[10px] text-slate-400">
                            방금 구글 뉴스 피드에서 직접 수집된 실제 기사 {scannedNewsArticles.length}건입니다.
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        실시간 피드 연동
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1 no-scrollbar">
                      {scannedNewsArticles.map((article, idx) => (
                        <div 
                          key={idx}
                          className="bg-white/5 border border-white/5 hover:border-indigo-500/40 rounded-xl p-3 flex flex-col justify-between space-y-2 hover:bg-white/8 transition-all"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-extrabold text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/50">
                                {article.source || "구글 뉴스"}
                              </span>
                              <span className="text-slate-400 text-[9.5px]">
                                {article.pubDate ? new Date(article.pubDate).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '최신'}
                              </span>
                            </div>
                            <h5 className="text-xs font-bold text-slate-200 leading-snug line-clamp-2">
                              {article.title}
                            </h5>
                          </div>
                          
                          <a
                            href={article.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1 text-[10.5px] font-black text-indigo-300 hover:text-white bg-indigo-600/30 hover:bg-indigo-600 py-1 px-2.5 rounded-lg border border-indigo-500/30 transition-all self-start"
                          >
                            <span>원문 기사 확인</span>
                            <span>↗</span>
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Generated AI Proposals Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                      <span>🤖</span>
                      <span>위 뉴스 기반 AI 긴급 랭킹 제안 ({proposals.length}건 대기)</span>
                    </span>
                    <span className="text-[11px] font-semibold text-indigo-400 bg-indigo-950/40 border border-indigo-900/50 px-2.5 py-0.5 rounded-full">
                      {useGrounding ? '실시간 뉴스 정밀 분석' : '일반 AI 추천'}
                    </span>
                  </div>

                  {proposals.length === 0 ? (
                    <div className="py-16 text-center text-slate-400 text-xs font-bold space-y-2">
                      <X className="h-8 w-8 text-slate-600 mx-auto" />
                      <p>현재 새로 탐지된 제안이 없습니다.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[46vh] overflow-y-auto pr-1.5 no-scrollbar">
                      {proposals.map((prop) => {
                        const badgeColor = prop.type === 'inquiry'
                          ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-500/40'
                          : prop.type === 'alert'
                          ? 'bg-red-500/20 text-red-200 border border-red-500/40'
                          : 'bg-amber-500/20 text-amber-200 border border-amber-500/40';

                        const typeText = prop.type === 'inquiry' ? '1:1 CS 문의' : prop.type === 'alert' ? '피해 주의보' : '법률 상식';

                        return (
                          <div 
                            key={prop.id} 
                            className="bg-white/5 border border-white/10 hover:border-indigo-500/30 rounded-2xl p-4 flex flex-col justify-between space-y-4 hover:bg-white/8 transition-all"
                          >
                            <div className="space-y-2.5">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-1.5">
                                  <span className="text-xl p-1 bg-white/10 rounded-lg">{prop.emoji}</span>
                                  <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-md ${badgeColor}`}>
                                    {prop.badge}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-bold">({typeText})</span>
                                </div>
                                <div className="flex items-center space-x-1 font-bold font-mono text-[10px] text-red-400">
                                  <TrendingUp className="h-3 w-3 animate-pulse" />
                                  <span>+{prop.growthRate}% up</span>
                                </div>
                              </div>

                              <div className="space-y-1">
                                <h5 className="text-xs sm:text-sm font-black text-slate-100 leading-snug">
                                  {prop.title}
                                </h5>
                                <div className="flex items-center space-x-3 text-[10px] text-slate-400 font-semibold">
                                  <span>근거: <strong className="text-slate-200">{prop.lawBasis || '소비자원 약관'}</strong></span>
                                  <span>액션: <strong className="text-indigo-300 font-mono">{prop.actionType}</strong></span>
                                </div>
                              </div>

                              <p className="text-[10.5px] leading-relaxed text-indigo-200 bg-indigo-950/40 p-2.5 rounded-xl border border-indigo-900/40 font-semibold">
                                <strong>🤖 AI 제안 사유:</strong> {prop.explanation}
                              </p>

                              {prop.source === "google_news_live" || prop.source === "gemini_grounded" ? (
                                <div className="text-[10.5px] leading-relaxed text-emerald-200 bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-900/40 space-y-1.5 font-semibold">
                                  <div className="flex items-center gap-1 font-black text-emerald-400">
                                    <span className="p-0.5 bg-emerald-500/10 rounded">📰</span>
                                    <span>구글 뉴스 실시간 검증 완료</span>
                                  </div>
                                  {prop.searchQueries && prop.searchQueries.length > 0 && (
                                    <div className="text-[10px] text-slate-300">
                                      <strong>🔍 검색 쿼리:</strong> {prop.searchQueries.join(", ")}
                                    </div>
                                  )}
                                  {prop.sources && prop.sources.length > 0 ? (
                                    <div className="space-y-1">
                                      <strong className="text-[10px] text-slate-300 block">🔗 보도 기사 원문 링크:</strong>
                                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1 no-scrollbar">
                                        {prop.sources.map((src: any, idx: number) => (
                                          <a
                                            key={idx}
                                            href={src.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[10px] text-indigo-300 hover:text-indigo-200 hover:underline bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-900/40 inline-block font-medium max-w-full truncate"
                                            title={src.title}
                                          >
                                            {src.title || src.url} ↗
                                          </a>
                                        ))}
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-[10px] text-amber-300">
                                      검색 근거 없음
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="text-[10.5px] leading-relaxed text-indigo-200 bg-indigo-950/40 p-2.5 rounded-xl border border-indigo-900/40 space-y-1 font-semibold">
                                  <div className="font-black text-slate-300 flex items-center gap-1">
                                    <span className="p-0.5 bg-indigo-500/10 rounded">🤖</span>
                                    <span>AI 추천 — 실시간 검색 미사용</span>
                                  </div>
                                  <div className="text-[10px] text-amber-300">
                                    검색 근거 없음
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center space-x-2 border-t border-white/5 pt-3">
                              <button
                                onClick={() => {
                                  handleApproveProposal(prop);
                                }}
                                className="flex-1 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-black shadow-sm flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>Live 1위 즉시 배포</span>
                              </button>
                              <button
                                onClick={() => handleRejectProposal(prop.id)}
                                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-red-400 rounded-xl text-xs font-bold cursor-pointer transition-all active:scale-95"
                                title="제안 반려"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-2 border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={() => { setIsScanModalOpen(false); setScanStep(0); }}
                className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
                disabled={isScanning}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ⚠️ 커스텀 컨펌/삭제 모달 */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-scaleUp text-slate-800">
            <div className="text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
                <Trash2 className="h-6 w-6 animate-pulse" />
              </div>
              <h4 className="text-base font-black text-slate-900">
                {confirmModal.title}
              </h4>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                {confirmModal.message}
              </p>
            </div>
            
            <div className="flex items-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-xl text-xs transition-all cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl text-xs shadow-sm shadow-red-500/10 transition-all cursor-pointer"
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 토스트 배너 피드백 */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center space-x-2 text-xs font-black border border-slate-800 animate-in fade-in slide-in-from-bottom-5 z-50">
          <CheckCheck className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
