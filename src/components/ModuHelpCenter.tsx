import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShoppingBag, 
  ShoppingCart, 
  Tag, 
  Sparkles, 
  Heart, 
  Share2, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ExternalLink, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  Flame, 
  Gift, 
  MapPin, 
  Calendar, 
  ChevronRight, 
  Percent, 
  Star, 
  Eye, 
  ThumbsUp, 
  AlertCircle, 
  X,
  Truck,
  CreditCard,
  Check,
  TrendingDown,
  Layers
} from 'lucide-react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  query 
} from 'firebase/firestore';
import { db } from '../firebase';
import { HELP_CATEGORIES, HELP_ITEMS as INITIAL_HELP_ITEMS, HelpCategory, HelpItem } from '../data/moduHelpData';
import { InquiryParentCategory } from '../types';

interface ModuHelpCenterProps {
  onNavigateToInquiry?: (prefill: {
    parentCategory: InquiryParentCategory;
    subCategory: string;
    title: string;
    content: string;
  }) => void;
  onGoToCustomerPortal?: () => void;
}

export const ModuHelpCenter: React.FC<ModuHelpCenterProps> = ({
  onNavigateToInquiry,
  onGoToCustomerPortal
}) => {
  // Items state with Firestore sync & auto seeding
  const [items, setItems] = useState<HelpItem[]>(INITIAL_HELP_ITEMS);
  const [loading, setLoading] = useState(true);

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

  // Category & Filter states
  const [selectedCategory, setSelectedCategory] = useState<HelpCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popularity' | 'discount' | 'priceAsc' | 'reviews'>('popularity');
  
  // Selected detail modal
  const [selectedItem, setSelectedItem] = useState<HelpItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  
  // Wishlist (Favorites) state with LocalStorage persistence
  const [wishlist, setWishlist] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('modu_help_wishlist');
      return saved ? new Set(JSON.parse(saved)) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  });

  // Cart state with LocalStorage persistence
  const [cartItems, setCartItems] = useState<{ id: string; qty: number }[]>(() => {
    try {
      const saved = localStorage.getItem('modu_help_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Time remaining countdown simulation for flash deal
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 28, seconds: 45 });
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleWishlist = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setWishlist(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        showToast('찜 목록에서 제외되었습니다.');
      } else {
        next.add(id);
        showToast('❤️ 찜 목록에 보관되었습니다!');
      }
      localStorage.setItem('modu_help_wishlist', JSON.stringify([...next]));
      return next;
    });
  };

  const addToCart = (item: HelpItem, qtyToAdd: number = 1) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      let updated;
      if (existing) {
        updated = prev.map(i => i.id === item.id ? { ...i, qty: i.qty + qtyToAdd } : i);
      } else {
        updated = [...prev, { id: item.id, qty: qtyToAdd }];
      }
      localStorage.setItem('modu_help_cart', JSON.stringify(updated));
      return updated;
    });
    showToast(`🛒 [${item.title.slice(0, 15)}...] 장바구니에 ${qtyToAdd}개 담았습니다!`);
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => {
      const updated = prev.filter(i => i.id !== id);
      localStorage.setItem('modu_help_cart', JSON.stringify(updated));
      return updated;
    });
    showToast('장바구니에서 삭제되었습니다.');
  };

  // Filtered and Sorted Items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Category match
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesBrand = item.brand.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesTags = item.tags.some(t => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesBrand && !matchesDesc && !matchesTags) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'popularity') return b.popularityScore - a.popularityScore;
      if (sortBy === 'discount') return b.discountRate - a.discountRate;
      if (sortBy === 'priceAsc') return a.salePrice - b.salePrice;
      if (sortBy === 'reviews') return b.reviewCount - a.reviewCount;
      return 0;
    });
  }, [items, selectedCategory, searchQuery, sortBy]);

  // Cart total calculations
  const cartSummary = useMemo(() => {
    let totalOriginal = 0;
    let totalSale = 0;
    let totalCount = 0;
    cartItems.forEach(cartItem => {
      const item = items.find(i => i.id === cartItem.id);
      if (item) {
        totalOriginal += item.originalPrice * cartItem.qty;
        totalSale += item.salePrice * cartItem.qty;
        totalCount += cartItem.qty;
      }
    });
    return {
      totalOriginal,
      totalSale,
      totalSaved: totalOriginal - totalSale,
      totalCount
    };
  }, [cartItems, items]);

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-2 animate-bounce border border-slate-700">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Banner (Top Commerce Promotion Header) */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white relative overflow-hidden shadow-md">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            
            {/* Left Headline */}
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-300/30 text-xs font-black">
                <Flame className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                <span>모두의도움 — 국민 생활 밀착형 초특가 커머스 & 추천 허브</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
                "이건 무조건 사야 돼!"<br className="sm:hidden" /> 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">
                  실생활 필수품 최저가 & 안심보험 & 지역축제
                </span> 
                추천
              </h1>
              <p className="text-xs sm:text-sm text-indigo-200/90 leading-relaxed">
                복잡한 검색 없이 말그대로 꼭 필요한 것만 골라 드립니다. 
                커피믹스·햇반 실시간 역대 최저가부터 다이렉트 필수 보험 비교, 지자체 공인 축제·특산물 직송까지 쇼핑몰처럼 한눈에 담아가세요!
              </p>
            </div>

            {/* Right Action: Flash Timer & Cart Preview */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto shrink-0 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-red-500/20 border border-red-400/30 rounded-xl text-red-300">
                  <Clock className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <div className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider">오늘의 타임특가 마감까지</div>
                  <div className="text-base sm:text-lg font-black text-amber-300 font-mono">
                    {String(timeLeft.hours).padStart(2, '0')}:
                    {String(timeLeft.minutes).padStart(2, '0')}:
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </div>
                </div>
              </div>

              <div className="h-8 w-px bg-white/20 hidden sm:block"></div>

              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black px-4 py-2.5 rounded-xl shadow-md transition-all cursor-pointer text-xs"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>장바구니 ({cartSummary.totalCount})</span>
                {cartSummary.totalSaved > 0 && (
                  <span className="bg-slate-900 text-amber-300 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                    -{cartSummary.totalSaved.toLocaleString()}원 절약
                  </span>
                )}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        
        {/* Category Tabs: 3 core categories as requested */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {HELP_CATEGORIES.map(cat => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 ring-2 ring-indigo-400'
                    : 'bg-white text-slate-700 hover:bg-slate-100 hover:text-indigo-600 border border-slate-200'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Sort Controls Toolbar */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Search Bar */}
          <div className="relative w-full sm:w-96">
            <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="햇반, 커피믹스, 실손보험, 지역축제 검색..."
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <span className="text-[11px] font-bold text-slate-400 hidden sm:inline">정렬:</span>
            <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs">
              <button
                onClick={() => setSortBy('popularity')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  sortBy === 'popularity' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                인기순
              </button>
              <button
                onClick={() => setSortBy('discount')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  sortBy === 'discount' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                최대할인순
              </button>
              <button
                onClick={() => setSortBy('priceAsc')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  sortBy === 'priceAsc' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                최저가순
              </button>
              <button
                onClick={() => setSortBy('reviews')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  sortBy === 'reviews' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                리뷰많은순
              </button>
            </div>
          </div>

        </div>

        {/* Product Cards Grid: Shopping Mall Thumbnail Style */}
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <ShoppingBag className="h-10 w-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">검색 조건에 맞는 상품이 없습니다</h3>
            <p className="text-xs text-slate-400">검색어를 변경하거나 다른 카테고리를 선택해 보세요.</p>
            <button
              onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
              className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
            >
              전체 상품 목록으로 초기화
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {filteredItems.map((item) => {
              const isWish = wishlist.has(item.id);

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedItem(item);
                    setQuantity(1);
                  }}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-indigo-400 hover:-translate-y-1 transition-all duration-200 flex flex-col group cursor-pointer relative"
                >
                  {/* Top Thumbnail Image Container */}
                  <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />

                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>

                    {/* Top-Left: Discount Badge */}
                    <div className="absolute top-2.5 left-2.5 flex items-center space-x-1">
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-red-600 text-white shadow-sm flex items-center space-x-0.5">
                        <Percent className="h-2.5 w-2.5" />
                        <span>{item.discountRate}% OFF</span>
                      </span>
                      <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-slate-900/80 text-white backdrop-blur-xs">
                        {item.badge}
                      </span>
                    </div>

                    {/* Top-Right: Wishlist Heart Button */}
                    <button
                      onClick={(e) => toggleWishlist(item.id, e)}
                      className={`absolute top-2.5 right-2.5 p-1.5 rounded-full transition-all cursor-pointer shadow-sm ${
                        isWish
                          ? 'bg-red-500 text-white scale-110'
                          : 'bg-white/80 hover:bg-white text-slate-600 hover:text-red-500'
                      }`}
                      title={isWish ? '찜 해제' : '찜하기'}
                    >
                      <Heart className={`h-3.5 w-3.5 ${isWish ? 'fill-current' : ''}`} />
                    </button>

                    {/* Bottom-Left Over Image: Provider Tag */}
                    <div className="absolute bottom-2 left-2.5 text-[10px] font-bold text-white drop-shadow-md">
                      {item.brand}
                    </div>
                  </div>

                  {/* Card Content Area */}
                  <div className="p-4 flex flex-col flex-grow justify-between space-y-3">
                    
                    {/* Category & Title */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-extrabold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                          {item.categoryLabel}
                        </span>
                        <div className="flex items-center space-x-1 text-slate-500 font-semibold">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span>{item.rating}</span>
                          <span className="text-slate-400">({item.reviewCount.toLocaleString()})</span>
                        </div>
                      </div>

                      <h3 className="text-xs sm:text-sm font-black text-slate-900 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        {item.subtitle}
                      </p>
                    </div>

                    {/* Features Snippet */}
                    <div className="bg-slate-50 p-2 rounded-xl space-y-1 border border-slate-100">
                      {item.features.slice(0, 2).map((feat, idx) => (
                        <div key={idx} className="flex items-center space-x-1.5 text-[10px] text-slate-600">
                          <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500 shrink-0" />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>

                    {/* Pricing Box */}
                    <div className="pt-1 border-t border-slate-100">
                      <div className="flex items-baseline space-x-1.5 text-slate-400 text-[11px] line-through">
                        <span>정가 {item.originalPrice.toLocaleString()}원</span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <div className="flex items-baseline space-x-1">
                          <span className="text-sm sm:text-base font-black text-red-600">
                            {item.salePrice.toLocaleString()}원
                          </span>
                        </div>
                        {item.unitPriceDesc && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                            {item.unitPriceDesc}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(item, 1);
                        }}
                        className="flex items-center justify-center space-x-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-[11px] font-bold transition-all cursor-pointer"
                      >
                        <ShoppingCart className="h-3 w-3 text-slate-600" />
                        <span>담기</span>
                      </button>
                      
                      <a
                        href={item.purchaseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center justify-center space-x-1 py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[11px] font-bold shadow-xs transition-all cursor-pointer"
                      >
                        <span>바로구매</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </a>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Shopping Mall Product Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto border border-slate-200">
            
            {/* Modal Header Bar */}
            <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-lg text-xs font-black bg-indigo-50 text-indigo-700">
                  {selectedItem.categoryLabel}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  {selectedItem.brand} 공식 혜택
                </span>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-6">
              
              {/* Product Top Two Columns (Image on Left, Price/Specs on Right) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                
                {/* Large Thumbnail */}
                <div className="space-y-3">
                  <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                    <img
                      src={selectedItem.imageUrl}
                      alt={selectedItem.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-black px-2.5 py-1 rounded-xl shadow-md">
                      {selectedItem.discountRate}% 특별 할인
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-xs text-slate-600">
                    <div className="flex items-center space-x-1.5">
                      <Truck className="h-4 w-4 text-indigo-600" />
                      <span className="font-bold">{selectedItem.shippingInfo}</span>
                    </div>
                    <span className="text-slate-400 text-[11px] font-semibold">100% 안심 보증</span>
                  </div>
                </div>

                {/* Info & Buying Controls */}
                <div className="space-y-4">
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                      {selectedItem.title}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      {selectedItem.subtitle}
                    </p>
                  </div>

                  {/* Rating & Popularity */}
                  <div className="flex items-center space-x-3 text-xs">
                    <div className="flex items-center space-x-1 text-amber-500 font-black">
                      <Star className="h-4 w-4 fill-current" />
                      <span>{selectedItem.rating}</span>
                      <span className="text-slate-400 font-normal">({selectedItem.reviewCount.toLocaleString()} 리뷰)</span>
                    </div>
                    <span className="text-slate-300">|</span>
                    <div className="flex items-center space-x-1 text-slate-500 font-semibold">
                      <Eye className="h-3.5 w-3.5" />
                      <span>실시간 조회 {selectedItem.popularityScore.toLocaleString()}회</span>
                    </div>
                  </div>

                  {/* Price Box */}
                  <div className="bg-indigo-50/70 border border-indigo-100 p-4 rounded-2xl space-y-1">
                    <div className="text-xs text-slate-400 line-through">
                      정가 {selectedItem.originalPrice.toLocaleString()}원
                    </div>
                    <div className="flex items-baseline justify-between">
                      <div className="flex items-baseline space-x-1.5">
                        <span className="text-xl sm:text-2xl font-black text-red-600">
                          {selectedItem.salePrice.toLocaleString()}원
                        </span>
                        <span className="text-xs font-bold text-red-500">
                          ({selectedItem.discountRate}% OFF)
                        </span>
                      </div>
                      {selectedItem.unitPriceDesc && (
                        <span className="text-xs font-black text-indigo-700 bg-white px-2 py-0.5 rounded-lg border border-indigo-200">
                          {selectedItem.unitPriceDesc}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-indigo-700/80 pt-1">
                      ⚡ 모두의도움 회원 전용 실시간 최저가 검증 완료 링크
                    </p>
                  </div>

                  {/* Quantity & Total Price for Shopping/Festival Items */}
                  {selectedItem.category !== 'insurance' && (
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-xs font-bold text-slate-700">구매 수량</span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="h-7 w-7 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="text-xs font-black w-6 text-center">{quantity}</span>
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          className="h-7 w-7 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-100 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Estimated Total */}
                  <div className="flex items-baseline justify-between pt-2 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-500">예상 결제 금액:</span>
                    <span className="text-lg font-black text-slate-900">
                      {(selectedItem.salePrice * (selectedItem.category === 'insurance' ? 1 : quantity)).toLocaleString()}원
                    </span>
                  </div>

                  {/* Actions in Modal */}
                  <div className="flex items-center space-x-2 pt-2">
                    <button
                      onClick={() => toggleWishlist(selectedItem.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                        wishlist.has(selectedItem.id)
                          ? 'bg-red-50 border-red-300 text-red-500'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                      title="찜하기"
                    >
                      <Heart className={`h-5 w-5 ${wishlist.has(selectedItem.id) ? 'fill-current' : ''}`} />
                    </button>

                    <button
                      onClick={() => {
                        addToCart(selectedItem, quantity);
                        setSelectedItem(null);
                      }}
                      className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-2xl transition-all cursor-pointer shadow-sm flex items-center justify-center space-x-1.5"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span>장바구니 담기</span>
                    </button>

                    <a
                      href={selectedItem.purchaseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs font-black rounded-2xl transition-all cursor-pointer shadow-md flex items-center justify-center space-x-1.5"
                    >
                      <span>{selectedItem.category === 'insurance' ? '공식 다이렉트 가입' : '최저가 바로구매'}</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>

                </div>

              </div>

              {/* Product Detailed Description & Features */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-sm font-black text-slate-900 flex items-center space-x-1.5">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                  <span>핵심 추천 이유 & 상세 안내</span>
                </h4>
                
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {selectedItem.description}
                </p>

                {/* Key Points */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {selectedItem.features.map((feat, idx) => (
                    <div key={idx} className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-700">
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span>포인트 0{idx + 1}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        {feat}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Specs Table */}
                <div className="space-y-2 pt-2">
                  <h5 className="text-xs font-extrabold text-slate-700">상품 및 제휴 규격 명세</h5>
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden text-xs">
                    {Object.entries(selectedItem.specs).map(([k, v], idx) => (
                      <div key={k} className={`flex items-center px-4 py-2.5 ${idx % 2 === 0 ? 'bg-slate-50/60' : 'bg-white'}`}>
                        <span className="w-28 font-bold text-slate-500 shrink-0">{k}</span>
                        <span className="text-slate-800 font-semibold">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* Cart Drawer / Slide-over Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between">
            
            {/* Cart Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5 text-indigo-600" />
                <h3 className="text-sm font-black text-slate-900">
                  내 장바구니 ({cartSummary.totalCount})
                </h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="p-5 overflow-y-auto flex-grow space-y-3">
              {cartItems.length === 0 ? (
                <div className="py-20 text-center space-y-3">
                  <ShoppingBag className="h-10 w-10 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-500">장바구니가 비어 있습니다.</p>
                  <p className="text-[11px] text-slate-400">마음에 드는 상품의 [담기]를 눌러보세요!</p>
                </div>
              ) : (
                cartItems.map(cartItem => {
                  const item = items.find(i => i.id === cartItem.id);
                  if (!item) return null;

                  return (
                    <div key={cartItem.id} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="h-16 w-16 object-cover rounded-xl shrink-0 border border-slate-200"
                      />
                      <div className="flex-1 min-w-0 space-y-1">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {item.title}
                        </h4>
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-black text-red-600">
                            {(item.salePrice * cartItem.qty).toLocaleString()}원
                          </span>
                          <span className="text-[11px] text-slate-400 font-semibold">
                            수량 {cartItem.qty}개
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(cartItem.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg cursor-pointer"
                        title="삭제"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Cart Footer Summary */}
            {cartItems.length > 0 && (
              <div className="p-5 border-t border-slate-100 bg-slate-50 space-y-3">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>정가 합계:</span>
                    <span className="line-through">{cartSummary.totalOriginal.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>모두의도움 절약 할인:</span>
                    <span>-{cartSummary.totalSaved.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-200">
                    <span>최종 결제 예상액:</span>
                    <span className="text-base text-red-600">{cartSummary.totalSale.toLocaleString()}원</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => {
                      setCartItems([]);
                      localStorage.removeItem('modu_help_cart');
                      showToast('장바구니를 모두 비웠습니다.');
                    }}
                    className="py-2.5 bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-100 cursor-pointer"
                  >
                    전체 비우기
                  </button>
                  <button
                    onClick={() => {
                      showToast('🎉 제휴 쇼핑몰 일괄 최저가 주문 페이지로 연결합니다!');
                      setTimeout(() => setIsCartOpen(false), 1500);
                    }}
                    className="py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow-md cursor-pointer"
                  >
                    주문 진행하기
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
