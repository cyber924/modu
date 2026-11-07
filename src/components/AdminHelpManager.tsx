import React, { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  query 
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
  Edit, 
  ShoppingBag, 
  BarChart2,
  X
} from 'lucide-react';
import { HELP_ITEMS as INITIAL_HELP_ITEMS, HelpItem, HelpCategory } from '../data/moduHelpData';

export const AdminHelpManager: React.FC = () => {
  const [items, setItems] = useState<HelpItem[]>(INITIAL_HELP_ITEMS);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<HelpCategory>('all');

  // Modal State for Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields matching HelpItem schema
  const [formData, setFormData] = useState({
    category: 'shopping' as 'shopping' | 'insurance' | 'festival',
    categoryLabel: '생필품 초특가',
    title: '',
    subtitle: '',
    brand: '',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
    originalPrice: 20000,
    salePrice: 13900,
    discountRate: 30,
    unitPriceDesc: '개당 최저가 적용',
    badge: '실시간 핫딜 🔥',
    badgeColor: 'red',
    rating: 4.9,
    reviewCount: 1250,
    popularityScore: 1200,
    tags: '#최저가, #생필품, #특가할인',
    purchaseUrl: 'https://www.coupang.com',
    features: '무료배송, 익일 도착, 정품 보증',
    description: '',
    shippingInfo: '무료배송 (오늘 출발)',
    providerType: '쇼핑몰 최저가' as const
  });

  // AI Smart Register Prompt State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiPreviewItem, setAiPreviewItem] = useState<HelpItem | null>(null);
  const [isAiPreviewOpen, setIsAiPreviewOpen] = useState(false);

  // Delete Confirm Modal State
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

  // Firestore Sync
  useEffect(() => {
    try {
      const q = query(collection(db, 'modu_help_items'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const fetched: HelpItem[] = [];
          snapshot.forEach((d) => {
            fetched.push({ id: d.id, ...d.data() } as HelpItem);
          });
          setItems(fetched);
        } else {
          INITIAL_HELP_ITEMS.forEach(async (item) => {
            await setDoc(doc(db, 'modu_help_items', item.id), item);
          });
          setItems(INITIAL_HELP_ITEMS);
        }
        setLoading(false);
      }, (error) => {
        console.warn('Firestore snapshot error (using local data):', error);
        setLoading(false);
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn('Firestore init fallback:', e);
      setLoading(false);
    }
  }, []);

  // Filtered items
  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
                          item.brand.toLowerCase().includes(search.toLowerCase()) ||
                          item.subtitle.toLowerCase().includes(search.toLowerCase());
    const matchesCat = catFilter === 'all' || item.category === catFilter;
    return matchesSearch && matchesCat;
  });

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      category: 'shopping',
      categoryLabel: '생필품 초특가',
      title: '',
      subtitle: '',
      brand: '',
      imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
      originalPrice: 25000,
      salePrice: 17900,
      discountRate: 28,
      unitPriceDesc: '실시간 최저가 매칭',
      badge: '초특가 핫딜 🔥',
      badgeColor: 'red',
      rating: 4.8,
      reviewCount: 950,
      popularityScore: 1000,
      tags: '#최저가, #추천상품',
      purchaseUrl: 'https://www.coupang.com',
      features: '당사 단독 할인, 무료배송',
      description: '',
      shippingInfo: '무료배송 (익일 도착)',
      providerType: '쇼핑몰 최저가'
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: HelpItem) => {
    setEditingId(item.id);
    setFormData({
      category: item.category,
      categoryLabel: item.categoryLabel,
      title: item.title,
      subtitle: item.subtitle,
      brand: item.brand,
      imageUrl: item.imageUrl,
      originalPrice: item.originalPrice,
      salePrice: item.salePrice,
      discountRate: item.discountRate,
      unitPriceDesc: item.unitPriceDesc || '',
      badge: item.badge,
      badgeColor: item.badgeColor || 'red',
      rating: item.rating,
      reviewCount: item.reviewCount,
      popularityScore: item.popularityScore || 500,
      tags: item.tags ? item.tags.join(', ') : '',
      purchaseUrl: item.purchaseUrl,
      features: item.features ? item.features.join(', ') : '',
      description: item.description || '',
      shippingInfo: item.shippingInfo || '무료배송',
      providerType: item.providerType || '쇼핑몰 최저가'
    });
    setIsModalOpen(true);
  };

  // Save Item (Create or Update)
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('⚠️ 상품명을 정확히 입력해주세요.');
      return;
    }

    const id = editingId || `help-${Date.now()}`;
    const tagArray = formData.tags.split(',').map(t => t.trim().startsWith('#') ? t.trim() : `#${t.trim()}`).filter(Boolean);
    const featureArray = formData.features.split(',').map(f => f.trim()).filter(Boolean);

    const newItem: HelpItem = {
      id,
      category: formData.category,
      categoryLabel: formData.categoryLabel,
      title: formData.title,
      subtitle: formData.subtitle,
      brand: formData.brand,
      imageUrl: formData.imageUrl,
      originalPrice: Number(formData.originalPrice),
      salePrice: Number(formData.salePrice),
      discountRate: Number(formData.discountRate),
      unitPriceDesc: formData.unitPriceDesc,
      badge: formData.badge,
      badgeColor: formData.badgeColor,
      rating: Number(formData.rating),
      reviewCount: Number(formData.reviewCount),
      popularityScore: Number(formData.popularityScore),
      tags: tagArray,
      purchaseUrl: formData.purchaseUrl,
      features: featureArray,
      description: formData.description,
      specs: { '제조사/브랜드': formData.brand, '배송안내': formData.shippingInfo },
      shippingInfo: formData.shippingInfo,
      providerType: formData.providerType
    };

    try {
      await setDoc(doc(db, 'modu_help_items', id), newItem, { merge: true });
      showToast(editingId ? '✨ 상품 정보가 성공적으로 수정되었습니다.' : '🎉 새로운 모두의도움 상품이 등록되었습니다!');
      setIsModalOpen(false);
    } catch (err) {
      console.error('Save error:', err);
      if (editingId) {
        setItems(items.map(i => i.id === id ? newItem : i));
      } else {
        setItems([newItem, ...items]);
      }
      setIsModalOpen(false);
      showToast('✨ 로컬 데이터에 반영되었습니다.');
    }
  };

  // Delete Item
  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.id) return;
    try {
      await deleteDoc(doc(db, 'modu_help_items', deleteConfirm.id));
      showToast('🗑️ 상품이 삭제되었습니다.');
    } catch (e) {
      setItems(items.filter(i => i.id !== deleteConfirm.id));
      showToast('🗑️ 로컬에서 삭제되었습니다.');
    }
    setDeleteConfirm({ isOpen: false, id: '', title: '' });
  };

  // AI Smart Register Generator via Server API & Preview Modal
  const handleAiSmartRegister = async () => {
    if (!aiPrompt.trim()) {
      showToast('⚠️ AI에게 요청할 상품 키워드나 내용을 입력해주세요.');
      return;
    }
    setIsAiGenerating(true);
    showToast('🤖 Gemini AI가 최저가 상품 및 큐레이션 정보를 분석/생성 중입니다...');

    try {
      const res = await fetch('/api/ai/smart-register-help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt })
      });
      const data = await res.json();
      if (data.success && data.item) {
        const gen = data.item;
        const id = `help-${Date.now()}`;
        const generatedItem: HelpItem = {
          id,
          category: gen.category || 'shopping',
          categoryLabel: gen.categoryLabel || '생필품 초특가',
          title: gen.title || aiPrompt,
          subtitle: gen.subtitle || '역대 최저가 및 실속 혜택 패키지',
          brand: gen.brand || '인기 브랜드',
          imageUrl: gen.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
          originalPrice: Number(gen.originalPrice || 30000),
          salePrice: Number(gen.price || gen.salePrice || 19800),
          discountRate: parseInt(gen.discountRate) || 34,
          unitPriceDesc: '실시간 최저가 매칭',
          badge: gen.badge || '🔥 AI 추천 핫딜',
          badgeColor: 'red',
          rating: 4.9,
          reviewCount: 1540,
          popularityScore: 1500,
          tags: gen.tags || ['#최저가', '#AI추천', '#인기상품', '#특가할인'],
          purchaseUrl: gen.buyUrl || 'https://www.coupang.com',
          features: ['AI 실시간 가격 비교', '무료배송', '익일 도착 보장'],
          description: gen.description || 'AI 분석 실시간 최저가 매칭 및 품질 보증 상품입니다.',
          specs: { '제조사/브랜드': gen.brand || '인기 브랜드', '배송안내': '무료배송' },
          shippingInfo: '무료배송 (익일 도착 보장)',
          providerType: gen.category === 'insurance' ? '보험사 공식 다이렉트' : gen.category === 'festival' ? '지자체 공식 연계' : '쇼핑몰 최저가'
        };

        setAiPreviewItem(generatedItem);
        setIsAiPreviewOpen(true);
        showToast('✨ AI 스마트 소싱 초안이 생성되었습니다. 내용을 확인 후 [DB에 등록] 버튼을 눌러주세요!');
        setAiPrompt('');
      } else {
        throw new Error('AI generation failed');
      }
    } catch (err) {
      console.warn('AI smart register fallback:', err);
      const id = `help-${Date.now()}`;
      const fallbackItem: HelpItem = {
        id,
        category: 'shopping',
        categoryLabel: '생필품 초특가',
        title: `[AI추천] ${aiPrompt} 실시간 최저가 묶음 패키지`,
        subtitle: '소비자 인기 1위 브랜드 특가 구성',
        brand: '인기 제조사',
        imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
        originalPrice: 30000,
        salePrice: 19800,
        discountRate: 34,
        unitPriceDesc: '실시간 최저가 매칭',
        badge: '🔥 AI 추천 핫딜',
        badgeColor: 'red',
        rating: 4.9,
        reviewCount: 2120,
        popularityScore: 1800,
        tags: ['#AI추천', '#최저가', '#인기상품', '#특가할인'],
        purchaseUrl: 'https://www.coupang.com',
        features: ['AI 추천 핫딜', '무료배송', '품질 보증'],
        description: `${aiPrompt} 관련 실시간 가격 비교 및 최저가 혜택이 적용된 엄선된 추천 상품입니다.`,
        specs: { '제조사/브랜드': '인기 제조사', '배송안내': '무료배송' },
        shippingInfo: '무료배송',
        providerType: '쇼핑몰 최저가'
      };

      setAiPreviewItem(fallbackItem);
      setIsAiPreviewOpen(true);
      showToast('✨ AI 시뮬레이션 소싱 초안이 생성되었습니다.');
      setAiPrompt('');
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleConfirmAiRegister = async () => {
    if (!aiPreviewItem) return;
    try {
      await setDoc(doc(db, 'modu_help_items', aiPreviewItem.id), aiPreviewItem, { merge: true });
      showToast('🎉 모두의도움 상품이 데이터베이스에 성공적으로 등록되었습니다!');
      setIsAiPreviewOpen(false);
      setAiPreviewItem(null);
    } catch (err) {
      console.error('AI save error:', err);
      setItems([aiPreviewItem, ...items]);
      setIsAiPreviewOpen(false);
      setAiPreviewItem(null);
      showToast('✨ 로컬 데이터베이스에 등록되었습니다.');
    }
  };

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-3 border border-slate-700 animate-bounce">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header & Actions */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
            <ShoppingBag className="w-6 h-6 text-indigo-600" />
            <span>모두의도움 커머스 큐레이션 관리</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            소비자에게 직접 노출되는 쇼핑 최저가, 안심 보험, 지역 축제 썸네일 상품을 등록·수정·삭제 및 AI로 자동 소싱합니다.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>신규 상품 등록</span>
          </button>
        </div>
      </div>

      {/* AI Smart Register Box */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 p-6 rounded-2xl shadow-lg text-white border border-indigo-500/30">
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Gemini AI 스마트 상품 자동 소싱 & 등록</h3>
            <p className="text-xs text-indigo-200">등록하고 싶은 상품 키워드나 내용을 입력하시면 AI가 가격, 혜택, 썸네일, 설명을 자동으로 완성해 드립니다.</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-4">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="예: 햇반 24개 최저가 핫딜 상품, KB 다이렉트 운전자보험 추천"
              className="w-full bg-slate-800/80 border border-indigo-500/40 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              onKeyDown={(e) => e.key === 'Enter' && handleAiSmartRegister()}
            />
          </div>
          <button
            onClick={handleAiSmartRegister}
            disabled={isAiGenerating}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50 whitespace-nowrap"
          >
            {isAiGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>AI 분석 생성 중...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>AI 자동 소싱 초안 작성</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-1 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <button
            onClick={() => setCatFilter('all')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${catFilter === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            전체 보기 ({items.length})
          </button>
          <button
            onClick={() => setCatFilter('shopping')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${catFilter === 'shopping' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            🛒 알뜰 생필품 최저가 ({items.filter(i => i.category === 'shopping').length})
          </button>
          <button
            onClick={() => setCatFilter('insurance')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${catFilter === 'insurance' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            🛡️ 안심 보험 다이렉트 ({items.filter(i => i.category === 'insurance').length})
          </button>
          <button
            onClick={() => setCatFilter('festival')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${catFilter === 'festival' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            🎪 전국 축제 & 특산물 ({items.filter(i => i.category === 'festival').length})
          </button>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="상품명, 브랜드 검색..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Items Table / Grid */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">등록된 모두의도움 상품 목록 ({filteredItems.length}건)</h3>
          <span className="text-xs text-slate-400">관리자 전용 실시간 큐레이션 매니저</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">데이터를 불러오는 중입니다...</div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center text-slate-400">조건에 일치하는 상품이 없습니다.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">상품 썸네일 & 타이틀</th>
                  <th className="py-3 px-4">구분</th>
                  <th className="py-3 px-4">가격 / 할인율</th>
                  <th className="py-3 px-4">인기 뱃지</th>
                  <th className="py-3 px-4">인기 점수</th>
                  <th className="py-3 px-4 text-right">관리 작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={item.imageUrl} 
                          alt={item.title} 
                          className="w-12 h-12 rounded-lg object-cover border border-slate-200 flex-shrink-0" 
                        />
                        <div>
                          <div className="font-bold text-slate-900 line-clamp-1">{item.title}</div>
                          <div className="text-[11px] text-slate-500 line-clamp-1">{item.subtitle}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-semibold rounded-md text-[11px]">
                        {item.providerType}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-extrabold text-slate-900">
                        {item.salePrice.toLocaleString()}원
                      </div>
                      <div className="flex items-center space-x-1.5 text-[11px]">
                        <span className="line-through text-slate-400">{item.originalPrice.toLocaleString()}원</span>
                        <span className="text-red-600 font-bold">{item.discountRate}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 font-bold rounded-lg text-[11px]">
                        {item.badge}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-700">
                      {item.popularityScore || 500}점
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-lg transition-colors"
                          title="수정"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ isOpen: true, id: item.id, title: item.title })}
                          className="p-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 rounded-lg transition-colors"
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-base font-bold text-slate-900">
                {editingId ? '✏️ 모두의도움 상품 수정' : '➕ 신규 모두의도움 상품 등록'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">카테고리 선택</label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      let label = '생필품 초특가';
                      if (val === 'insurance') label = '맞춤 안심 보험';
                      if (val === 'festival') label = '전국 축제 특산물';
                      setFormData({ ...formData, category: val, categoryLabel: label });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="shopping">알뜰 생필품 최저가 (Shopping)</option>
                    <option value="insurance">안심 보험 다이렉트 (Insurance)</option>
                    <option value="festival">전국 축제 & 특산물 (Festival)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">구분 (Provider Type)</label>
                  <select
                    value={formData.providerType}
                    onChange={(e) => setFormData({ ...formData, providerType: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="쇼핑몰 최저가">쇼핑몰 최저가</option>
                    <option value="보험사 공식 다이렉트">보험사 공식 다이렉트</option>
                    <option value="지자체 공식 연계">지자체 공식 연계</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">상품 타이틀 (메인)</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="예: 동서식품 맥심 모카골드 마일드 커피믹스 (220T + 20T)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">서브타이틀 및 핵심 혜택 설명</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="예: 무료배송 + 익일 도착 보장 · 당사 단독 특가"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">브랜드 / 제조사</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="예: 동서식품"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">단가 단위 설명 (예: 스틱당 116원)</label>
                  <input
                    type="text"
                    value={formData.unitPriceDesc}
                    onChange={(e) => setFormData({ ...formData, unitPriceDesc: e.target.value })}
                    placeholder="예: 스틱당 116원"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">정가 (원)</label>
                  <input
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">할인가 / 판매가 (원)</label>
                  <input
                    type="number"
                    value={formData.salePrice}
                    onChange={(e) => setFormData({ ...formData, salePrice: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-bold text-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">할인율 숫자 (예: 28)</label>
                  <input
                    type="number"
                    value={formData.discountRate}
                    onChange={(e) => setFormData({ ...formData, discountRate: Number(e.target.value) })}
                    placeholder="28"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-bold text-red-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">인기 뱃지 문구</label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="예: 실시간 1위 🔥"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">상세 구매 링크 URL</label>
                  <input
                    type="text"
                    value={formData.purchaseUrl}
                    onChange={(e) => setFormData({ ...formData, purchaseUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">이미지 썸네일 URL</label>
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">상품 설명 및 큐레이션 코멘트</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="소비자에게 추천하는 이유와 핵심 혜택을 상세히 기재하세요."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">태그 (쉼표로 구분)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="#최저가, #생필품, #무료배송"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{editingId ? '수정 완료 저장' : '신규 상품 등록'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Preview Modal */}
      {isAiPreviewOpen && aiPreviewItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="bg-gradient-to-r from-indigo-900 to-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                <h3 className="text-base font-bold">Gemini AI 소싱 상품 미리보기 및 검토</h3>
              </div>
              <button 
                onClick={() => setIsAiPreviewOpen(false)}
                className="text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="flex items-center space-x-3 bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                <span className="text-xs font-bold px-2.5 py-1 bg-indigo-600 text-white rounded-lg">
                  {aiPreviewItem.categoryLabel}
                </span>
                <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                  {aiPreviewItem.badge}
                </span>
              </div>

              <div className="flex gap-4">
                <img 
                  src={aiPreviewItem.imageUrl} 
                  alt={aiPreviewItem.title} 
                  className="w-28 h-28 object-cover rounded-xl border border-slate-200 shadow-sm flex-shrink-0" 
                />
                <div className="space-y-1.5 flex-1">
                  <p className="text-xs font-semibold text-indigo-600">{aiPreviewItem.brand}</p>
                  <h4 className="text-sm font-extrabold text-slate-900 leading-snug">{aiPreviewItem.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2">{aiPreviewItem.subtitle}</p>
                  <div className="flex items-center space-x-2 pt-1">
                    <span className="text-xs text-slate-400 line-through">{aiPreviewItem.originalPrice.toLocaleString()}원</span>
                    <span className="text-sm font-extrabold text-red-600">{aiPreviewItem.salePrice.toLocaleString()}원</span>
                    <span className="text-xs font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">{aiPreviewItem.discountRate}% 할인</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700">
                <p className="font-bold text-slate-900 mb-1">📝 AI 큐레이션 설명</p>
                <p className="leading-relaxed text-slate-600">{aiPreviewItem.description}</p>
                <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-1">
                  {aiPreviewItem.tags?.map((tag, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-indigo-100 text-indigo-700 font-medium rounded text-[10px]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200 font-medium">
                💡 위 내용은 Gemini AI가 실시간 소싱 및 분석한 초안입니다. 내용을 확인하신 후 하단의 <b>[DB에 최종 등록]</b> 버튼을 누르면 즉시 서비스에 반영됩니다.
              </p>
            </div>

            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    category: aiPreviewItem.category,
                    categoryLabel: aiPreviewItem.categoryLabel,
                    title: aiPreviewItem.title,
                    subtitle: aiPreviewItem.subtitle,
                    brand: aiPreviewItem.brand,
                    imageUrl: aiPreviewItem.imageUrl,
                    originalPrice: aiPreviewItem.originalPrice,
                    salePrice: aiPreviewItem.salePrice,
                    discountRate: aiPreviewItem.discountRate,
                    unitPriceDesc: aiPreviewItem.unitPriceDesc || '',
                    badge: aiPreviewItem.badge,
                    badgeColor: aiPreviewItem.badgeColor || 'red',
                    rating: aiPreviewItem.rating,
                    reviewCount: aiPreviewItem.reviewCount,
                    popularityScore: aiPreviewItem.popularityScore || 1000,
                    tags: aiPreviewItem.tags ? aiPreviewItem.tags.join(', ') : '',
                    purchaseUrl: aiPreviewItem.purchaseUrl,
                    features: aiPreviewItem.features ? aiPreviewItem.features.join(', ') : '',
                    description: aiPreviewItem.description || '',
                    shippingInfo: aiPreviewItem.shippingInfo || '무료배송',
                    providerType: aiPreviewItem.providerType || '쇼핑몰 최저가'
                  });
                  setEditingId(null);
                  setIsAiPreviewOpen(false);
                  setIsModalOpen(true);
                }}
                className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-colors"
              >
                ✏️ 수정 후 등록
              </button>
              <button
                type="button"
                onClick={() => setIsAiPreviewOpen(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirmAiRegister}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>DB에 최종 등록하기</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center border border-slate-200">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">정말 이 상품을 삭제하시겠습니까?</h3>
            <p className="text-xs text-slate-500 mb-6 bg-slate-50 p-3 rounded-lg border border-slate-200 font-medium">
              "{deleteConfirm.title}"
            </p>
            <div className="flex items-center justify-center space-x-3">
              <button
                onClick={() => setDeleteConfirm({ isOpen: false, id: '', title: '' })}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
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
