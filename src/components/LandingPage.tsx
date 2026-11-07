import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { 
  ArrowRight, 
  Mail, 
  Lock, 
  UserPlus, 
  LogIn, 
  Sparkles, 
  CheckCircle, 
  Code, 
  HelpCircle, 
  ExternalLink,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { CATEGORY_MAP, InquiryParentCategory } from '../types';
import { EmbedWidgetModal } from './EmbedWidgetModal';

interface LandingPageProps {
  onEnterPortal: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterPortal }) => {
  const { user, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  
  // Auth Form states
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  
  // Interactive Category Preview
  const [selectedCat, setSelectedCat] = useState<InquiryParentCategory>('shopping');
  const [widgetModalOpen, setWidgetModalOpen] = useState(false);

  // Sample playbook questions for interactive showcase
  const playbooks = [
    {
      category: '쇼핑/배송/결제',
      tag: '환불 조율',
      title: '카드 승인 오류 및 중복 결제 자동 취소 가이드',
      question: '이중으로 승인 문자가 날아왔는데, 승인번호는 각각 다릅니다. 시스템상 자동 취소가 되는지 확인하고 싶어요.',
      answer: '데이터베이스를 즉시 검증한 결과 동시간 대 결제 시도 중 네트워크 지연으로 인한 이중 승인이 감지되었습니다. 10분 내로 주거래 은행 카드를 통해 1건이 자동 취소 환불 처리됩니다.'
    },
    {
      category: '여가/여행/예약',
      tag: '항공 변경',
      title: '태풍 경보로 인한 제주행 항공권 변경 및 수수료 면제 요청',
      question: '기상 악화 경보가 발효되었는데 수수료 없이 내일 아침 첫 비행기로 변경이 가능한가요?',
      answer: '국토교통부 기상 특보 연동 시스템에 의해 항공사 특별 면제 대상에 등록되었습니다. 수수료 100% 면제 혜택과 함께 대체 항공편(KE1205)의 최우선 가용한 잔여 석을 선점해 드렸습니다.'
    },
    {
      category: '외식/다이닝/예약',
      tag: '기업 제휴',
      title: '비즈니스 오프닝 단체 세미나 대관 및 맞춤 코스 요리 제안',
      question: '총 45명 임직원이 함께할 비즈니스 디너를 위해 저염식, 비건 옵션을 곁들인 코스 구성이 가능한지 궁금합니다.',
      answer: '당사 수석 셰프와 협의하여 고품질 전복 스테이크 및 유기농 비건 가니쉬로 구성된 한정 VIP 패키지를 제안드립니다. 마이크 시설 및 대형 빔 프로젝터 대여는 전액 무상 제공됩니다.'
    }
  ];

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAuthLoading(true);

    try {
      if (isSignUp) {
        if (!name.trim()) throw new Error('이름 또는 기업명을 입력해주세요.');
        if (password.length < 6) throw new Error('비밀번호는 최소 6자 이상이어야 합니다.');
        await signUpWithEmail(email, password, name);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('이미 가입된 이메일 주소입니다.');
      } else if (err.code === 'auth/wrong-password') {
        setError('비밀번호가 일치하지 않습니다.');
      } else if (err.code === 'auth/user-not-found') {
        setError('해당 이메일로 등록된 계정을 찾을 수 없습니다.');
      } else {
        setError(err.message || '인증 오류가 발생했습니다.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-800 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-md shadow-indigo-600/20">
              <Layers className="h-5 w-5" />
            </div>
            <span className="font-bold text-xl text-slate-900 tracking-tight">모두의문의</span>
          </div>

          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setWidgetModalOpen(true)}
              className="hidden sm:flex items-center space-x-1 text-xs font-semibold text-slate-600 hover:text-slate-950 transition-all cursor-pointer"
            >
              <Code className="h-4 w-4 text-indigo-500" />
              <span>B2B 임베드 연동</span>
            </button>
            
            {user ? (
              <button 
                onClick={onEnterPortal}
                className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-600/10 transition-all cursor-pointer"
              >
                <span>내 포털 바로가기</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <a 
                href="#auth-section"
                className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all"
              >
                <span>로그인 / 가입</span>
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative py-16 sm:py-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Text Left */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold border border-indigo-100">
              <Sparkles className="h-3.5 w-3.5 text-indigo-500 animate-pulse" />
              <span>대한민국 모든 소비자 권익 보호 및 분쟁 신속 해결 표준 플랫폼</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight">
              소비자 안심을 위해 <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-500">
                1초 만에 법률 및 정답 가이드를
              </span> <br className="hidden sm:block" />
              스마트 AI 정답 자동 매칭
            </h1>

            <p className="text-slate-600 text-base max-w-xl leading-relaxed">
              모두의문의는 쇼핑, 여행, 외식, 배달 등 일상의 복잡한 소비자 질문을 분석하여 공정거래위원회 표준 고시 및 전문가 법령 데이터베이스를 기반으로 정확한 법적 대처 방안을 제공합니다. 1초 검색으로 소비자의 억울함을 완벽하게 해소하세요.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              {user ? (
                <button
                  onClick={onEnterPortal}
                  className="flex items-center justify-center space-x-2 px-6 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md shadow-indigo-600/10 transition-all cursor-pointer"
                >
                  <span>통합 문의 센터 입장하기</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <a
                  href="#auth-section"
                  className="flex items-center justify-center space-x-2 px-6 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md shadow-indigo-600/10 transition-all"
                >
                  <span>지금 무료로 시작하기</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              )}

              <button
                onClick={() => setWidgetModalOpen(true)}
                className="flex items-center justify-center space-x-2 px-6 py-3 text-sm font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-all cursor-pointer"
              >
                <Code className="h-4 w-4 text-slate-500" />
                <span>B2B 연동 위젯 샘플</span>
              </button>
            </div>

            {/* Visual Social Proof Labels */}
            <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-8 max-w-md">
              <div>
                <span className="block text-2xl font-bold text-slate-900">99.8%</span>
                <span className="text-xs text-slate-500">실시간 문의 처리율</span>
              </div>
              <div>
                <span className="block text-2xl font-bold text-slate-900">0.2초</span>
                <span className="text-xs text-slate-500">인공지능 즉각 분석 시간</span>
              </div>
              <div>
                <span className="block text-2xl font-bold text-slate-900">1초 연동</span>
                <span className="text-xs text-slate-500">SaaS 코드 위젯 삽입</span>
              </div>
            </div>
          </div>

          {/* Graphic Right */}
          <div className="lg:col-span-5 relative">
            <div className="absolute inset-0 bg-indigo-200/20 blur-3xl rounded-full scale-75 -z-10"></div>
            <div className="bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden p-1.5">
              <img 
                src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80" 
                alt="Customer Service Representative" 
                className="w-full h-80 object-cover rounded-xl"
                referrerPolicy="no-referrer"
              />
              <div className="p-4 space-y-1">
                <span className="text-xs text-indigo-600 font-semibold uppercase tracking-wider">모두의문의 AI Intelligence</span>
                <h3 className="text-sm font-bold text-slate-800">질문의 쟁점을 정확히 파악하고 올바른 대처법을 찾아냅니다.</h3>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Interactive Category Selector Preview */}
      <section className="py-16 px-6 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs text-indigo-600 font-bold uppercase tracking-widest">Interactive Categories</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">정교하게 짜인 2단계 분류 시스템</h2>
            <p className="text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
              모두의문의는 유기적인 대처를 위해 1차 대분류와 2차 지능형 세부 소분류 카테고리를 연동하여 즉각 솔루션을 찾습니다.
            </p>
          </div>

          {/* Selector grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(Object.keys(CATEGORY_MAP) as InquiryParentCategory[]).map((catKey) => {
              const cat = CATEGORY_MAP[catKey];
              const isSelected = selectedCat === catKey;
              return (
                <button
                  key={catKey}
                  onClick={() => setSelectedCat(catKey)}
                  className={`p-4 rounded-xl text-left border transition-all duration-300 flex flex-col justify-between space-y-6 cursor-pointer ${
                    isSelected 
                      ? 'border-indigo-500 bg-indigo-50/20 shadow-md ring-1 ring-indigo-500/20' 
                      : 'border-slate-100 hover:border-slate-300 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className={`p-2.5 rounded-lg w-fit ${cat.bg} ${cat.text} font-bold text-lg`}>
                    {catKey === 'shopping' ? '🛒' : catKey === 'travel' ? '✈️' : catKey === 'restaurant' ? '🍽️' : '💡'}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{cat.label}</h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{cat.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Deep dive details for selected category */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center transition-all duration-500">
            <div className="md:col-span-5 space-y-4">
              <span className="text-xs text-indigo-600 font-bold uppercase">상세 소분류 매핑</span>
              <h3 className="text-xl font-bold text-slate-900">
                {CATEGORY_MAP[selectedCat].label} 하위 세부 카테고리
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                해당 1차 카테고리를 선택한 후, 질문의 성격에 적합한 2차 소분류 탭을 골라 실시간 답변 담당 파트너사나 AI에게 즉각 알림을 발송합니다.
              </p>
              
              <div className="space-y-2">
                {CATEGORY_MAP[selectedCat].subCategories.map((sub) => (
                  <div 
                    key={sub.value} 
                    className="flex items-center space-x-2 text-xs text-slate-700 bg-white px-3 py-2 rounded-lg border border-slate-100 shadow-sm"
                  >
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="font-semibold">{sub.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-7 rounded-xl overflow-hidden relative h-52 sm:h-64 shadow-md">
              <img 
                src={CATEGORY_MAP[selectedCat].unsplashUrl} 
                alt={CATEGORY_MAP[selectedCat].label} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex items-end p-6">
                <div className="text-white space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">Unsplash Premium Reference</span>
                  <p className="text-sm font-semibold">{CATEGORY_MAP[selectedCat].desc}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Inquiry Playbooks / Case Studies */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs text-indigo-600 font-bold uppercase tracking-widest">Inquiry Playbooks</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">실시간 문의 처리 실례</h2>
            <p className="text-sm text-slate-500 max-w-xl mx-auto">
              InquireHub의 어드민 콘솔과 파트너사를 통해 고도화된 실시간 답변 예시를 체험해 보세요.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {playbooks.map((book, idx) => (
              <div 
                key={idx} 
                className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                      {book.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">{book.tag}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm leading-snug line-clamp-1">
                    {book.title}
                  </h4>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs text-slate-600 space-y-1">
                    <span className="font-bold text-[10px] text-slate-500 uppercase">Q. 고객 질문</span>
                    <p className="line-clamp-2 italic">"{book.question}"</p>
                  </div>
                </div>

                <div className="border-t border-slate-100/60 pt-3 space-y-1 text-xs text-slate-700">
                  <span className="font-bold text-[10px] text-indigo-600 uppercase flex items-center space-x-1">
                    <Sparkles className="h-3 w-3 text-indigo-500 animate-pulse" />
                    <span>InquireHub 해결 가이드</span>
                  </span>
                  <p className="line-clamp-3 font-medium text-slate-800">
                    {book.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Auth and Onboarding Hybrid Section */}
      <section id="auth-section" className="py-16 sm:py-24 px-6 bg-slate-900 text-white relative">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          {/* Info Side */}
          <div className="space-y-6 text-left">
            <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider">Start Securing Support</span>
            <h2 className="text-3xl font-extrabold tracking-tight">이메일 혹은 구글 계정으로 즉시 연동하세요</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              일반 고객은 실시간 문의 내역 보관 및 AI 분석 보고서를 수령할 수 있으며, 제휴 파트너사는 스크립트 기반 문의 접수 채널을 무료로 할당받을 수 있습니다.
            </p>

            <div className="space-y-3">
              <div className="flex items-start space-x-3 text-xs">
                <CheckCircle className="h-4 w-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-100 block">실시간 내역 영구 보관</span>
                  <span className="text-slate-400">브라우저 쿠키 소멸과 무관하게 내 질문을 철저히 추적하고 보관합니다.</span>
                </div>
              </div>
              <div className="flex items-start space-x-3 text-xs">
                <CheckCircle className="h-4 w-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-100 block">인공지능 소비 제안 피드</span>
                  <span className="text-slate-400">데이터가 축적되면 Gemini가 나의 라이프스타일 관심사를 정교히 카탈로그화합니다.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="bg-white text-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl space-y-5 border border-slate-100">
            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-slate-900 text-lg">
                {isSignUp ? 'InquireHub 가입하기' : 'InquireHub 로그인'}
              </h3>
              <p className="text-xs text-slate-500">
                {isSignUp ? '몇 초만에 이메일 계정을 생성해 보세요.' : '등록된 이메일 계정으로 안전하게 접근하세요.'}
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-xs rounded-lg font-medium">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-3.5">
              {isSignUp && (
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-semibold text-slate-600 block">이름 / 상호명</label>
                  <div className="relative">
                    <UserPlus className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input 
                      type="text" 
                      required
                      placeholder="홍길동 또는 기업명"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-slate-600 block">이메일 주소</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input 
                    type="email" 
                    required
                    placeholder="example@inquirehub.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-slate-600 block">비밀번호</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input 
                    type="password" 
                    required
                    placeholder="•••••••• (최소 6자)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full flex items-center justify-center space-x-1.5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
              >
                <LogIn className="h-4 w-4" />
                <span>{authLoading ? '처리 중...' : isSignUp ? '회원가입 완료' : '이메일 로그인'}</span>
              </button>
            </form>

            <div className="relative flex py-1 items-center justify-center">
              <div className="flex-grow border-t border-slate-100"></div>
              <span className="flex-shrink mx-3 text-slate-400 text-[10px] font-bold uppercase">또는</span>
              <div className="flex-grow border-t border-slate-100"></div>
            </div>

            {/* Google Login Provider */}
            <button
              onClick={signInWithGoogle}
              className="w-full flex items-center justify-center space-x-2 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-all cursor-pointer"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-4 w-4" />
              <span>구글 계정으로 연동하기</span>
            </button>

            {/* View toggle */}
            <div className="text-center pt-2">
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                }}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
              >
                {isSignUp ? '이미 회원이신가요? 로그인하기' : 'InquireHub 계정이 없으신가요? 1초 가입하기'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Embed Widget Modal */}
      <EmbedWidgetModal isOpen={widgetModalOpen} onClose={() => setWidgetModalOpen(false)} />
    </div>
  );
};
