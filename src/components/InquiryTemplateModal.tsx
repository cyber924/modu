import React, { useState } from 'react';
import { Sparkles, X, Search, HelpCircle, ArrowRight, CheckCircle } from 'lucide-react';
import { InquiryParentCategory, CATEGORY_MAP } from '../types';

interface InquiryTemplate {
  id: string;
  parentCategory: InquiryParentCategory;
  subCategory: string;
  title: string;
  content: string;
  summary: string;
  tags: string[];
}

const TEMPLATE_DATABASE: InquiryTemplate[] = [
  // 쇼핑/배송/결제
  {
    id: 'shop_delivery_coupang',
    parentCategory: 'shopping',
    subCategory: 'delivery',
    title: '[쿠팡 배송지 오기입] 쿠팡(Coupang) 주문 배송 주소지 긴급 변경 요청',
    summary: '쿠팡(Coupang) 주문번호 매핑 및 배송 주소 실시간 정정',
    tags: ['쿠팡', 'Coupang', '배송지', '주소변경', '출차전', '송장'],
    content: `[주문 정보 및 배송지 정밀 확인]
- 주문 쇼핑몰 플랫폼: 쿠팡 (Coupang)
- 주문 번호: 20260912-CP-9920138
- 구매 상품명: 프리미엄 테크 서포트 패키지
- 수령인 성함: [실제 수령인 성함을 입력해 주세요]

[배송지 변경 상세 내역]
- 기존 주소 (오기입): 서울시 마포구 독막로 123-45 (기존 등록 오류)
- 변경 주소 (신규): 서울시 강남구 테헤란로 456길 78, 4층 402호
- 수령지 특이사항: [예: 문 앞에 놓아주시고 공동현관 비번은 #1234* 입니다]

[요청 사항]
쿠팡 배송 차량이 출차하여 현장에 인도되기 전에 해당 배송 정보가 정상적으로 시스템에 갱신되도록 실시간 관제 및 신속한 라우팅을 부탁드립니다.`
  },
  {
    id: 'shop_delivery_smartstore',
    parentCategory: 'shopping',
    subCategory: 'delivery',
    title: '[스마트스토어 배송 지연] 네이버 스마트스토어(SmartStore) 배송 지연에 따른 긴급 통관/송장 추적',
    summary: '네이버 스마트스토어(SmartStore) 특정 허브 지연 및 미수령건 탐색',
    tags: ['스마트스토어', '네이버', 'SmartStore', '배송지연', '운송장', '택배'],
    content: `[스마트스토어 주문 정보]
- 쇼핑몰 플랫폼: 네이버 스마트스토어 (SmartStore)
- 스마트스토어 상호명 (스토어명): [예: 데일리테크 컴퍼니]
- 주문 번호: ST-2026-928103
- 운송장 번호: [예: CJ대한통운 1234567890]

[배송 지연 상황 분석 요청]
현재 스마트스토어 상에서 배송 시작된 지 5일이 경과하였으나, 특정 허브(예: 옥천Hub)에서 실시간 이동이 멈춘 상태입니다.
- 최종 확인일: 2026년 9월 12일
- 현재 운송장 배송 상태: [예: 간선 하차 대기]

[관리자 전달 사항]
해당 스토어의 담당자와 직접 연계하여 누락 배송물인지 혹은 통관 지연 건인지 정확히 판독 후, 수령 완료 예상 시점을 피드백해 주십시오.`
  },
  {
    id: 'shop_refund_damage',
    parentCategory: 'shopping',
    subCategory: 'refund',
    title: '[스마트스토어 반품신청] 제품 파손/오배송으로 인한 스마트스토어 반품 및 즉시 환불 접수',
    summary: '오구입 방지 및 정확한 파손 사유 전달을 통한 즉각 환불 절차',
    tags: ['스마트스토어', '반품', '환불', '파손', '오배송', '네이버'],
    content: `[반품 및 환불 요청서]
- 쇼핑몰 플랫폼: 스마트스토어 (SmartStore)
- 구매 스마트스토어명: [스토어명을 적어주세요, 예: 센스 인테리어 스토어]
- 상품 주문번호: 2026-ST-4029130
- 반품 대상 상품명: 원목 데스크테리어 오거나이저

[반품 사유 상세 기술]
- 수령 상태: 제품 배송 외관 박스는 온전하였으나 내부 메인 원목 프레임 우측면이 약 3cm 가량 심각하게 파손되어 도착함.
- 상세 원인: [초기 불량 / 배송 중 충격 파손 / 색상 상이 등 기술]
- 증빙 사진 첨부 예정: [접수 완료 후 어드민 채널 전송]

[환불 및 수거 요청]
해당 스마트스토어 판매자 측에 파손 상황을 신속히 고지하여 교환이 아닌 '반품 후 전액 환불' 처리가 진행되도록 허브 관제를 부탁드립니다. 택배사 수거 희망 주소지는 배송지와 동일합니다.`
  },
  {
    id: 'shop_payment_double',
    parentCategory: 'shopping',
    subCategory: 'payment_issue',
    title: '[결제오류 승인 취소] 타임아웃 오류로 인한 신용카드 중복(이중) 결제 취소 요청',
    summary: '네트워크 타임아웃 등으로 이중 승인된 결제 대금 정밀 환수',
    tags: ['이중결제', '중복결제', '결제오류', '신용카드', '승인취소', '네이버페이'],
    content: `[중복 결제 상세 보고서]
- 결제 플랫폼/쇼핑몰: [예: 쿠팡 / 스마트스토어]
- 중복 발생 시점: 2026년 9월 12일 19시 경
- 사용한 카드사: [예: 신한카드 / 현대카드]
- 결제 금액: [예: 45,000원]

[장애 경위]
결제하기 버튼을 누르는 시점에 네트워크 타임아웃 오류 메시지가 발생하여 새로고침한 뒤 승인 처리를 하였으나, 카드사 알림상으로 동일 금액이 2회 연속 승인(이중 승인)된 점을 감안하여 1건의 취소를 긴급 접수합니다.
- 1차 승인 승인번호: [승인번호 또는 미정]
- 2차 승인 승인번호: [승인번호]

[요청 사항]
모두의문의 관제 마스터님, 본 건을 긴급 심사하여 이중 수납된 중복 대금이 안전히 취소 전표 처리되도록 즉시 라우팅해 주십시오.`
  },

  // 여가/여행/예약
  {
    id: 'travel_flight_change',
    parentCategory: 'travel',
    subCategory: 'flight_schedule',
    title: '[항공권 여정 변경] 아시아권 항공 노선 출발 일정 연기 및 위약금 면제 조건 심사',
    summary: '개인 변심 및 일정 지연에 따른 항공 특약 수수료 판독',
    tags: ['항공권', '예약변경', '위약금', '여정변경', '항공사', '대한항공'],
    content: `[항공 여행 예약 상세 내역]
- 예약 항공사: [예: 대한항공 / 아시아나항공]
- 항공권 예약 번호: PNR-TL-2026A
- 기존 출발 일정: 2026년 10월 15일 09:30 인천 출발
- 목적지: [예: 도쿄 나리타 / 방콕 수완나품]

[변경 희망 일정]
- 신규 출발 일정: 2026년 10월 18일 동일 시간대 출발 희망
- 변경 인원 수: 성인 2명

[관리자 검토 요청 사항]
일정 변경 시 항공사 약관 및 제휴 플랫폼 특약에 따른 수수료 부과 조건(위약금 면제 혜택 해당 여부)을 판독하여 정확하고 빠르게 전달해 주시기 바랍니다.`
  },
  {
    id: 'travel_hotel_transfer',
    parentCategory: 'travel',
    subCategory: 'hotel_booking',
    title: '[체크인 정보 변경] 숙소 리조트 투숙객 명의 변경 및 대리인 양도 승인 요청',
    summary: '호텔/리조트 투숙객 명의 정정 및 체크인 차단 예방',
    tags: ['호텔', '숙박양도', '체크인', '명의변경', '야놀자', '아고다'],
    content: `[호텔/리조트 예약 데이터]
- 제휴 예약처: [예: 야놀자 / 아고다]
- 숙소/리조트명: [예: 그랜드 조선 제주]
- 예약자 성함: [기존 예약자 성함]
- 예약 일정: 2026.10.10 ~ 2026.10.12 (2박)

[수정 요청 사항]
기존 체크인 고객 성함을 타인에게 '숙박권 양도'하는 절차를 진행하고자 합니다.
- 실제 투숙객(양수인) 성함: [실제 체크인할 분의 성함을 입력하세요]
- 투숙객 연락처: [실제 투숙객 전화번호]

현지 리조트 프런트 데스크에 수작업 연락이 지연되지 않도록, 해당 파트너 네트워크망을 통해 정확하게 전달하여 입실 거부를 방지해 주십시오.`
  },

  // 외식/다이닝/예약
  {
    id: 'restaurant_group_seminar',
    parentCategory: 'restaurant',
    subCategory: 'group_reservation',
    title: '[기업 단체 대관] 기업 세미나/워크숍 테이블 단독 대관 및 코스 메뉴 맞춤 견적',
    summary: '단독 대관 최소 보증 인원 설정 및 빔프로젝터 음향 장비 포함 단가 설계',
    tags: ['단체대관', '세미나', '워크숍', '견적요청', '코스요리', '뷔페'],
    content: `[비즈니스 단체 대관 제안 요청서]
- 희망 대관 일시: 2026년 [월] [일]일 [시] ~ [시]
- 예상 참가 인원: [인원 수 입력, 예: 40명]
- 대관 희망 지역/식당 분류: [예: 강남권 이탈리안 파인 다이닝]

[대관 규격 및 예산안]
- 1인당 배정 예산: [예: 100,000원 선]
- 식사 구성 형태: [코스 요리 / 뷔페식 / 프리미엄 핑거푸드 중 선택]
- 필요 장비 지원: 빔프로젝터, 무선 마이크 2대, 단독 음향 장비 사용 지원 여부

[문의 사항]
기업 워크숍 세미나에 유리하도록 외부 음향 연동 혜택 제공 및 해당 일정의 단독 대관 조건에 관한 제안서를 받아보고 싶습니다. 견적 전송 부탁드립니다.`
  },

  // 숨고식 생활/기술/어학 분야 고수 전문가 매칭 (일반/기타/개선제안)
  {
    id: 'soomgo_interior',
    parentCategory: 'other',
    subCategory: 'general_feedback',
    title: '[숨고 매칭] 아파트 거실/주방 친환경 리모델링 인테리어 전문 고수 매칭 및 통합 견적 요청',
    summary: '실시간 하비스트 및 평당 단가 비교용 인테리어 숨고 고수 매칭',
    tags: ['숨고', '인테리어', '리모델링', '견적요청', '고수찾기', '전문가', '도배'],
    content: `[리모델링 견적 및 전문가 매칭 요청서]
1. 리모델링 대상 공간: 아파트 거실 및 주방 부분 리모델링 (약 15평)
2. 희망 시공 주소지: [예: 서울시 영등포구 신길동]
3. 시공 예정 일자: 2026년 [월] [일]일 경 (협의 가능)
4. 예상 예산 범위: [예: 500만원 ~ 1,000만원 선]

[세부 요구 사항 및 선호 스타일]
- 바닥재: 친환경 LX하우시스 강마루 시공 희망
- 벽면: 전체 실크 벽지 도배 및 거실 아트월 템바보드 포인트 시공
- 조명: 3인치 다운라이트 매립등 신설 및 주방 펜던트 조명 교체
- 주방 싱크대: 아일랜드 식탁 일체형 무광 화이트 싱크대 상/하부장 전면 교체

[전문가 고수 매칭 기준]
- 하자보수이행증권 발급이 필수로 가능하고 포트폴리오 10회 이상 보유하신 종합 인테리어 전문 고수분의 상세 견적서와 포트폴리오를 실시간 라우팅해 주시기 바랍니다.`
  },
  {
    id: 'soomgo_developer',
    parentCategory: 'other',
    subCategory: 'widget_api',
    title: '[개발자 매칭] SaaS 비즈니스 연동 반응형 웹사이트 및 하이브리드 모바일 앱 고수 개발자 의뢰',
    summary: '구축 스펙(RFP) 설정 및 경력 개발 전문가 단가 조율 매칭',
    tags: ['개발자', '숨고', '전문가찾기', '웹사이트', '앱개발', 'SaaS', '외주'],
    content: `[웹 & 앱 신규 개발 제안 요청서 (RFP)]
1. 프로젝트명: B2B 고객 문의 실시간 관리형 SaaS 연동 플랫폼 신규 개발
2. 핵심 개발 기능:
   - React, Next.js 기반 반응형 프론트엔드 구축
   - Node.js/Express 백엔드 및 실시간 동기화 데이터베이스(Firestore) 연동
   - 네이버/카카오/구글 3대 소셜 로그인 및 PG 결제 게이트웨이 연동
   - 실시간 관리자 푸시 메시지 및 고객용 알림톡 연동
3. 타겟 플랫폼: PC/모바일 웹 브라우저 및 안드로이드/iOS 네이티브 앱 (하이브리드 앱)
4. 희망 예산 규모: [예: 2,000만원 ~ 3,500만원 선 (조율 가능)]
5. 프로젝트 일정: 개발 시작일로부터 최대 3개월 이내 완료 희망

[전문가 추천 조건]
- 개인 고수 개발자 혹은 전문 외주 법인 파트너 중, 유사 실시간 통제 SaaS 솔루션 구축 경험이 있는 팀의 개발 견적 및 기술 미팅 슬롯 배정을 안전하게 중개해 주십시오.`
  },
  {
    id: 'soomgo_english_coach',
    parentCategory: 'other',
    subCategory: 'marketing',
    title: '[영어 고수 매칭] 글로벌 IT 테크 기업 PM 직군 비즈니스 영어 1:1 면접 집중 코칭',
    summary: '이력서 교정 및 맞춤형 모의 면접 연동 원어민/교포 교육 전문가 추천',
    tags: ['영어과외', '코칭', '숨고', '전문가', '영어면접', '회화', '1대1'],
    content: `[1:1 영어 면접 코칭 매칭 신청서]
1. 수강 대상자 수준: 일상 회화 가능하나 비즈니스 전문 어휘 및 프리젠테이션 역량 부족 (오픽 IM 수준)
2. 코칭 최종 목표: 미국계 실리콘밸리 지사 IT Product Manager (PM) 직군 면접 대비 및 영문 이력서 정밀 교정
3. 수강 진행 방식: 주 2회, 회당 60분 진행 (온라인 Zoom 화상 과외 중심 + 주말 대면 조율 가능)
4. 희망 시간대: 주중 퇴근 이후 (20시 ~ 22시) 또는 토요일 오전 시간
5. 예상 월 수강 예산: [예: 회당 4~5만원 수준, 월 35만원 안팎]

[전문가 희망 요건]
- 글로벌 테크 기업 면접관 출신이시거나 영어 이력서 컨설팅 경력 3년 이상의 원어민 또는 교포급 전문 교육 고수님의 매칭을 통해 시범 테스트 수업 1회 진행을 중개 요청드립니다.`
  },
  {
    id: 'soomgo_video_design',
    parentCategory: 'other',
    subCategory: 'marketing',
    title: '[디자인/영상 매칭] 기업용 유튜브 숏폼 영상 정기 편집 및 로고 BI/CI 프리미엄 디자인 의뢰',
    summary: '유튜브 Shorts 주 2편 정기 가공 및 플랫 스타일 브랜드 심볼 디자인 고수',
    tags: ['영상편집', '로고디자인', '디자이너', '숨고', '고수', ' Shorts', 'BI'],
    content: `[브랜드 마케팅 및 디자인 견적 요청서]
1. 요청 분야:
   - 기업 공식 유튜브 채널 홍보용 숏폼(Shorts) 주 2편 정기 편집 (편당 60초 내외)
   - 신규 론칭 브랜드 CI/BI 프리미엄 로고 디자인 (가이드북 포함 총 3개 시안 제공 조건)
2. 영상 편집 요구 스펙:
   - 화려한 자막 디자인, 트렌디한 효과음 및 배경음악 셀렉션, 컷편집 위주 빠른 템포
   - 4K 원본 소스 전달 예정
3. 로고 디자인 컨셉:
   - 심플하면서도 현대적인 SaaS 테크 기업 지향 (그라디언트 배제, 단색/2색 플랫 스타일)
4. 희망 단가 및 계약:
   - 숏폼 영상 편당 [예: 100,000원] 선
   - 로고 디자인 패키지 [예: 800,000원] 선 (전자세금계산서 발행 조건)

[매칭 요청]
해당 영상 편집 및 브랜드 디자인 분야에서 검증된 감각적인 디자인 포트폴리오를 보유한 고수 프리랜서 또는 전문 스튜디오의 신속한 견적 매칭을 요청드립니다.`
  }
];

interface InquiryTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (
    parentCategory: InquiryParentCategory,
    subCategory: string,
    title: string,
    content: string
  ) => void;
}

export const InquiryTemplateModal: React.FC<InquiryTemplateModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | InquiryParentCategory>('all');

  if (!isOpen) return null;

  // Filter templates based on tab and search keyword
  const filteredTemplates = TEMPLATE_DATABASE.filter((tpl) => {
    const matchesTab = activeTab === 'all' || tpl.parentCategory === activeTab;
    const matchesSearch =
      searchQuery === '' ||
      tpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesTab && matchesSearch;
  });

  const handleApply = (tpl: InquiryTemplate) => {
    onSelectTemplate(tpl.parentCategory, tpl.subCategory, tpl.title, tpl.content);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div 
        className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-150 bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-indigo-600 text-white rounded-lg">
              <Sparkles className="h-4.5 w-4.5 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                지능형 스마트 문의 템플릿 제어소
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                작성 오작동 및 엉뚱한 기술 방지 • 행정 편의성 극대화 • 숨고형 다이렉트 고수 견적/전문가 실시간 매칭
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search & Tabs control bar */}
        <div className="p-5 border-b border-slate-100 bg-white space-y-4">
          {/* Interactive Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input 
              type="text"
              placeholder="예: '쿠팡', '인테리어', '숨고', '리모델링', '로고' 등 키워드로 스마트 매칭 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:border-indigo-600 focus:outline-none transition-all placeholder:text-slate-400 bg-slate-50/50 focus:bg-white"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3 text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                지우기
              </button>
            )}
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              전체 템플릿
            </button>
            {(Object.keys(CATEGORY_MAP) as InquiryParentCategory[]).map((catKey) => {
              const cat = CATEGORY_MAP[catKey];
              const isActive = activeTab === catKey;
              return (
                <button
                  key={catKey}
                  onClick={() => setActiveTab(catKey)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.label.split('/')[0]} ({TEMPLATE_DATABASE.filter(t => t.parentCategory === catKey).length})
                </button>
              );
            })}
          </div>
        </div>

        {/* Body content: Templates grid list */}
        <div className="flex-grow overflow-y-auto p-5 bg-slate-50/30">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-20 space-y-2">
              <HelpCircle className="h-10 w-10 text-slate-300 mx-auto" />
              <h4 className="text-xs font-bold text-slate-800">검색 조건에 맞는 스마트 템플릿이 없습니다.</h4>
              <p className="text-[11px] text-slate-400">다른 키워드나 태그를 입력해 주십시오.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.map((tpl) => {
                const catConfig = CATEGORY_MAP[tpl.parentCategory];
                const subLabel = catConfig.subCategories.find(s => s.value === tpl.subCategory)?.label || tpl.subCategory;

                return (
                  <div 
                    key={tpl.id}
                    className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all text-left flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2.5">
                      {/* Badge line */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${catConfig.bg} ${catConfig.text}`}>
                          {catConfig.label.split('/')[0]}
                        </span>
                        <span className="text-[9px] text-slate-500 font-semibold bg-slate-100 px-1.5 py-0.5 rounded-md">
                          {subLabel}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="font-extrabold text-slate-900 text-xs leading-snug line-clamp-2">
                        {tpl.title}
                      </h3>

                      {/* Brief description */}
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                        💡 {tpl.summary}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {tpl.tags.map((tag) => (
                          <span 
                            key={tag} 
                            onClick={() => setSearchQuery(tag)}
                            className="text-[8px] font-bold text-indigo-600 bg-indigo-50/50 hover:bg-indigo-100/70 px-1.5 py-0.2 rounded transition-all cursor-pointer"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Footer Apply CTA */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[9px] text-slate-400 font-semibold">
                        글자 수: 약 {tpl.content.length}자
                      </span>
                      <button
                        onClick={() => handleApply(tpl)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 text-[10px] font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all shadow-sm shadow-indigo-600/10 cursor-pointer"
                      >
                        <span>템플릿 자동 적용하기</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-[10px] text-slate-500 font-medium">
          <div className="flex items-center space-x-1.5">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
            <span>스마트 양식을 사용하면 올바른 가이드라인 제공으로 해결 정확도가 98.7% 향상됩니다.</span>
          </div>
          <span className="hidden sm:inline">모두의문의 지능형 어시스턴트 엔진</span>
        </div>
      </div>
    </div>
  );
};
