import React, { useState } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { LandingPage } from './components/LandingPage';
import { CustomerPortal } from './components/CustomerPortal';
import { AdminDashboard } from './components/AdminDashboard';
import { PartnerInquiryManager } from './components/PartnerInquiryManager';
import { InquiryHub } from './components/InquiryHub';
import { PublicNotificationCenter } from './components/PublicNotificationCenter';
import { RealtimeRanking } from './components/RealtimeRanking';
import { ModuHelpCenter } from './components/ModuHelpCenter';
import { InquiryParentCategory } from './types';
import { 
  Layers, 
  User, 
  ShieldCheck, 
  Sparkles, 
  LogOut, 
  ArrowRight,
  ExternalLink,
  Code,
  Handshake,
  HelpCircle,
  Bell,
  Trophy,
  ShoppingBag
} from 'lucide-react';
import { EmbedWidgetModal } from './components/EmbedWidgetModal';
import { ModuAssistantDrawer } from './components/ModuAssistantDrawer';

const AppContent: React.FC = () => {
  const { user, userProfile, isAdmin, isPartner, loading, logout } = useAuth();
  
  // Tab switcher for Hub / Alerts / Help / Customer / Partner / Admin / Ranking views
  const [activeView, setActiveView] = useState<'hub' | 'alerts' | 'help' | 'customer' | 'partner' | 'admin' | 'ranking'>('hub');
  const [widgetModalOpen, setWidgetModalOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);

  // Global window listener to trigger ModuAssistantDrawer from sub-components
  React.useEffect(() => {
    const handleOpenAssistant = () => {
      setAssistantOpen(true);
    };
    window.addEventListener('open-modu-assistant', handleOpenAssistant);
    return () => window.removeEventListener('open-modu-assistant', handleOpenAssistant);
  }, []);

  // Prefill state bridging InquiryHub to CustomerPortal
  const [prefillData, setPrefillData] = useState<{
    parentCategory: InquiryParentCategory;
    subCategory: string;
    title: string;
    content: string;
  } | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
        <div className="p-3 bg-indigo-50 rounded-xl animate-bounce">
          <Layers className="h-8 w-8 text-indigo-600" />
        </div>
        <div className="space-y-1 text-center">
          <h3 className="font-bold text-slate-900 text-sm">모두의문의 인프라 연결 중</h3>
          <p className="text-xs text-slate-400">파이어베이스 실시간 보안 인증 데이터를 연동하고 있습니다...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, show landing page
  if (!user) {
    return <LandingPage onEnterPortal={() => {}} />;
  }

  const isElevated = isAdmin || isPartner || userProfile?.role === 'admin' || userProfile?.role === 'partner';

  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col">
      {/* Universal Top Switcheable Bar */}
      <nav className="sticky top-0 z-30 bg-white border-b border-slate-100 px-3 sm:px-6 py-2 sm:py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-2 lg:gap-3">
          
          {/* Top Bar Row (Mobile: Logo on left, Actions on right; Desktop: Logo on left) */}
          <div className="flex items-center justify-between w-full lg:w-auto">
            {/* Logo */}
            <div 
              onClick={() => setActiveView('hub')} 
              className="flex items-center space-x-2 cursor-pointer group shrink-0"
            >
              <div className="p-1.5 bg-indigo-600 text-white rounded-lg shadow-sm group-hover:scale-105 transition-transform">
                <Layers className="h-4 w-4" />
              </div>
              <span className="font-black text-base text-slate-900 tracking-tight">모두의문의</span>
            </div>

            {/* User profile actions (Visible on mobile header) */}
            <div className="flex items-center space-x-1.5 lg:hidden shrink-0">
              <button
                onClick={() => setActiveView('ranking')}
                className={`flex items-center space-x-1 text-[11px] font-extrabold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  activeView === 'ranking'
                    ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-300'
                    : 'text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/50'
                }`}
              >
                <Trophy className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span>실시간 랭킹</span>
              </button>

              <button
                onClick={logout}
                className="flex items-center space-x-1 text-[11px] font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap"
                title="로그아웃"
              >
                <LogOut className="h-3.5 w-3.5 shrink-0" />
              </button>
            </div>
          </div>

          {/* Navigation Tab Switcher for Hub / Alerts / Customer / Partner / Admin */}
          {/* On mobile: smooth horizontal touch swipe (no-scrollbar), shrink-0 to prevent vertical text squishing */}
          <div className="w-full lg:w-auto overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1">
            <div className="flex items-center space-x-1 bg-slate-100/90 p-1 rounded-xl w-max lg:w-auto">
              {/* 1. 모두의문의 (핵심 솔루션 & 지식 포털) */}
              <button
                onClick={() => setActiveView('hub')}
                className={`flex items-center space-x-1 px-2 sm:px-2.5 py-1 sm:py-1.5 text-[11px] sm:text-xs font-black rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  activeView === 'hub'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-700 hover:text-indigo-600 hover:bg-slate-200/60'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-300 shrink-0" />
                <span>모두의문의</span>
                <span className={`text-[8px] sm:text-[9px] px-1.5 py-0.2 rounded-full font-bold shrink-0 ${
                  activeView === 'hub' ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-700'
                }`}>
                  라이브
                </span>
              </button>

              {/* 2. 모두의알림 (전국민 공공/소비자 고지 및 필수 상식 센터) */}
              <button
                onClick={() => setActiveView('alerts')}
                className={`flex items-center space-x-1 px-2 sm:px-2.5 py-1 sm:py-1.5 text-[11px] sm:text-xs font-black rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  activeView === 'alerts'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-slate-700 hover:text-red-600 hover:bg-slate-200/60'
                }`}
              >
                <Bell className="h-3.5 w-3.5 animate-bounce text-amber-300 shrink-0" />
                <span>모두의알림</span>
                <span className={`text-[8px] sm:text-[9px] px-1.5 py-0.2 rounded-full font-bold shrink-0 ${
                  activeView === 'alerts' ? 'bg-white/20 text-white' : 'bg-red-50 text-red-700'
                }`}>
                  필수고지
                </span>
              </button>

              {/* 3. 모두의도움 (생필품 초특가 쇼핑, 맞춤보험, 지역축제 추천 커머스 허브) */}
              <button
                onClick={() => setActiveView('help')}
                className={`flex items-center space-x-1 px-2 sm:px-2.5 py-1 sm:py-1.5 text-[11px] sm:text-xs font-black rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  activeView === 'help'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm ring-1 ring-emerald-300'
                    : 'text-slate-700 hover:text-emerald-600 hover:bg-slate-200/60'
                }`}
              >
                <ShoppingBag className="h-3.5 w-3.5 text-amber-300 shrink-0" />
                <span>모두의도움</span>
                <span className={`text-[8px] sm:text-[9px] px-1.5 py-0.2 rounded-full font-extrabold shrink-0 ${
                  activeView === 'help' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  초특가
                </span>
              </button>

              {/* 4. 고객용 1:1 문의 */}
              <button
                onClick={() => setActiveView('customer')}
                className={`flex items-center space-x-1 px-2 sm:px-2.5 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  activeView === 'customer'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="h-3.5 w-3.5 shrink-0" />
                <span>1:1 문의</span>
              </button>

              {/* 5. 모두의비서 (AI 어시스턴트 드로어 토글) */}
              <button
                onClick={() => setAssistantOpen(true)}
                className="flex items-center space-x-1 px-2 sm:px-2.5 py-1 sm:py-1.5 text-[11px] sm:text-xs font-black rounded-lg transition-all cursor-pointer bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs hover:from-purple-700 hover:to-indigo-700 relative overflow-hidden group whitespace-nowrap shrink-0 animate-pulse"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-spin shrink-0" style={{ animationDuration: '3s' }} />
                <span>🔮 모두의비서</span>
                <span className="text-[7px] sm:text-[8px] bg-red-500 text-white px-1 py-0.2 rounded font-extrabold uppercase tracking-widest shrink-0">
                  AI
                </span>
              </button>

              {/* 6. 제휴처 문의 답변 (글자 축소) */}
              <button
                onClick={() => setActiveView('partner')}
                className={`flex items-center space-x-1 px-2 sm:px-2.5 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  activeView === 'partner'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-blue-700'
                }`}
              >
                <Handshake className="h-3.5 w-3.5 shrink-0" />
                <span>제휴처 문의 답변</span>
              </button>

              {/* 7. 관리자 대시보드 (글자 축소) */}
              <button
                onClick={() => setActiveView('admin')}
                className={`flex items-center space-x-1 px-2 sm:px-2.5 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  activeView === 'admin'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                <span>관리자 대시보드</span>
                {!isElevated && (
                  <span className="text-[7px] sm:text-[8px] px-1 py-0.2 rounded font-black uppercase tracking-wider bg-amber-200 text-amber-800 shrink-0">
                    데모
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* User profile actions (Desktop) */}
          <div className="hidden lg:flex items-center space-x-3 shrink-0">
            <button
              onClick={() => setActiveView('ranking')}
              className={`flex items-center space-x-1.5 text-[11px] font-extrabold px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeView === 'ranking'
                  ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-300'
                  : 'text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/50'
              }`}
            >
              <Trophy className="h-3.5 w-3.5 text-amber-500 animate-pulse shrink-0" />
              <span>실시간 랭킹 20</span>
            </button>

            <button
              onClick={logout}
              className="flex items-center space-x-1 text-[11px] font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 px-2 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap"
            >
              <LogOut className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden md:inline">로그아웃</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Workspace Router based on Switcheable View */}
      <main className="flex-grow">
        {activeView === 'hub' ? (
          <InquiryHub 
            onNavigateToInquiry={(prefill) => {
              setPrefillData(prefill);
              setActiveView('customer');
            }}
            onGoToCustomerPortal={() => setActiveView('customer')}
            onNavigateToAlerts={() => setActiveView('alerts')}
            onNavigateToHelp={() => setActiveView('help')}
          />
        ) : activeView === 'alerts' ? (
          <PublicNotificationCenter
            onNavigateToInquiry={(prefill) => {
              setPrefillData(prefill);
              setActiveView('customer');
            }}
            onGoToCustomerPortal={() => setActiveView('customer')}
          />
        ) : activeView === 'help' ? (
          <ModuHelpCenter
            onNavigateToInquiry={(prefill) => {
              setPrefillData(prefill);
              setActiveView('customer');
            }}
            onGoToCustomerPortal={() => setActiveView('customer')}
          />
        ) : activeView === 'admin' ? (
          <AdminDashboard />
        ) : activeView === 'partner' ? (
          <div className="max-w-7xl mx-auto px-6 py-8">
            <PartnerInquiryManager />
          </div>
        ) : activeView === 'ranking' ? (
          <RealtimeRanking
            onNavigateToInquiry={(prefill) => {
              setPrefillData(prefill);
              setActiveView('customer');
            }}
            onGoToCustomerPortal={() => setActiveView('customer')}
            onNavigateToAlerts={(searchQuery) => {
              setActiveView('alerts');
              setTimeout(() => {
                const event = new CustomEvent('set-alert-search', { detail: { query: searchQuery } });
                window.dispatchEvent(event);
              }, 100);
            }}
          />
        ) : (
          <CustomerPortal 
            initialPrefill={prefillData}
            onClearPrefill={() => setPrefillData(null)}
            onNavigateToHub={() => setActiveView('hub')}
            onNavigateToAlerts={() => setActiveView('alerts')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © 2026 모두의문의 Inc. All rights reserved. (소비자 권익 및 공정 분쟁 해결 표준 플랫폼)
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setWidgetModalOpen(true)}
              className="hover:text-slate-600 font-medium"
            >
              B2B Partner API
            </button>
            <span className="text-slate-200">|</span>
            <span className="flex items-center space-x-1">
              <Sparkles className="h-3 w-3 text-indigo-500" />
              <span>Gemini Flash 3.5 Copilot</span>
            </span>
          </div>
        </div>
      </footer>

      {/* Embed Widget Modal */}
      <EmbedWidgetModal isOpen={widgetModalOpen} onClose={() => setWidgetModalOpen(false)} />

      {/* AI Assistant Drawer ("모두의비서") */}
      <ModuAssistantDrawer isOpen={assistantOpen} onClose={() => setAssistantOpen(false)} />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
