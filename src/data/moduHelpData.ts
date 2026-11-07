export type HelpCategory = 'all' | 'shopping' | 'insurance' | 'festival';

export interface HelpItem {
  id: string;
  category: 'shopping' | 'insurance' | 'festival';
  categoryLabel: string;
  title: string;
  subtitle: string;
  brand: string;
  imageUrl: string;
  originalPrice: number;
  salePrice: number;
  discountRate: number; // e.g. 40 (meaning 40%)
  unitPriceDesc?: string; // e.g. "개당 866원" or "월 납입료"
  badge: string;
  badgeColor: string; // e.g. 'red', 'indigo', 'emerald', 'amber'
  rating: number; // e.g. 4.9
  reviewCount: number;
  popularityScore: number; // clicks or views
  tags: string[];
  purchaseUrl: string;
  features: string[];
  description: string;
  specs: { [key: string]: string };
  shippingInfo: string;
  providerType: '쇼핑몰 최저가' | '보험사 공식 다이렉트' | '지자체 공식 연계';
}

export const HELP_CATEGORIES: { id: HelpCategory; label: string; icon: string; count: number }[] = [
  { id: 'all', label: '전체 추천', icon: '✨', count: 12 },
  { id: 'shopping', label: '1. 🛒 알뜰 생필품 최저가', icon: '🛒', count: 4 },
  { id: 'insurance', label: '2. 🛡️ 맞춤 안심 보험', icon: '🛡️', count: 4 },
  { id: 'festival', label: '3. 🎪 전국 축제 & 특산물', icon: '🎪', count: 4 },
];

export const HELP_ITEMS: HelpItem[] = [
  // ==================== [1. 알뜰 생필품 최저가] ====================
  {
    id: 'shop-coffee-01',
    category: 'shopping',
    categoryLabel: '생필품 초특가',
    title: '동서식품 맥심 모카골드 마일드 커피믹스 220T + 20T 보너스팩',
    subtitle: '국민 필수 커피믹스 총 240포 실시간 역대 최저가 갱신! 무료배송',
    brand: '동서식품 맥심',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    originalPrice: 38500,
    salePrice: 27900,
    discountRate: 28,
    unitPriceDesc: '스틱당 116원 (역대 최저)',
    badge: '실시간 1위 🔥',
    badgeColor: 'red',
    rating: 4.9,
    reviewCount: 38240,
    popularityScore: 9840,
    tags: ['#국민커피', '#240스틱', '#무료배송', '#오늘출발'],
    purchaseUrl: 'https://www.coupang.com',
    features: [
      '아라비카 원두 본연의 부드럽고 깊은 황금비율 로스팅',
      '220포 정품 규격에 추가 20포 증정 한정판 기획팩',
      '전국 당일/익일 새벽배송 보장 및 공식 유통기한 1년 이상 보증'
    ],
    description: '대한민국 사무실과 가정의 영원한 필수품! 맥심 모카골드 마일드 240포 대용량 패키지입니다. 오픈마켓 및 대형마트 가격비교 알고리즘을 통해 검증된 실시간 최저가 링크를 연결해 드립니다.',
    specs: {
      '용량/수량': '240포 (220T + 20T 증정)',
      '식품 유형': '커피 조제품',
      '제조원': '동서식품(주)',
      '유통기한': '제조일로부터 18개월'
    },
    shippingInfo: '무료배송 (오늘 주문 시 내일 도착)',
    providerType: '쇼핑몰 최저가'
  },
  {
    id: 'shop-hetban-02',
    category: 'shopping',
    categoryLabel: '생필품 초특가',
    title: 'CJ제일제당 햇반 백미 즉석밥 210g x 24개 (1박스 안심 기획)',
    subtitle: '갓 지은 밥맛 그대로, 1인가구 및 비상식량 필수품 최저가 할인전',
    brand: 'CJ제일제당',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
    originalPrice: 34900,
    salePrice: 20800,
    discountRate: 40,
    unitPriceDesc: '개당 866원 (마트 대비 40% 저렴)',
    badge: '40% 초특가 ⚡',
    badgeColor: 'amber',
    rating: 4.9,
    reviewCount: 52190,
    popularityScore: 12480,
    tags: ['#햇반최저가', '#24개박스', '#개당866원', '#비상식량'],
    purchaseUrl: 'https://www.cjthemarket.com',
    features: [
      '도정 후 24시간 내 지어낸 갓 지은 찰기 가득 밥맛',
      '무균화 포장 시스템으로 보존료 없이 9개월 실온 보관',
      '전자레인지 2분 조리로 간편하고 든든한 한 끼 완성'
    ],
    description: '물가 상승으로 즉석밥 가격이 부담되셨다면 주목하세요! CJ제일제당 정품 햇반 210g 24개들이 1박스를 최저가 혜택으로 직배송해 드립니다.',
    specs: {
      '용량': '210g x 24개',
      '원재료': '멥쌀 99.9%(국산), 미강추출물',
      '보관 방법': '실온 보관 (서늘한 곳)',
      '조리법': '전자레인지 700W 2분 / 1000W 1분 30초'
    },
    shippingInfo: '무료배송 (CJ대한통운 직송)',
    providerType: '쇼핑몰 최저가'
  },
  {
    id: 'shop-water-03',
    category: 'shopping',
    categoryLabel: '생필품 초특가',
    title: '제주삼다수 그린 무라벨 2L x 12병 (2팩 묶음 세트)',
    subtitle: '한라산 지하 420m 화산암반수 무라벨 분리수거 편리 패키지',
    brand: '제주개발공사',
    imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=800&q=80',
    originalPrice: 18000,
    salePrice: 11900,
    discountRate: 34,
    unitPriceDesc: '병당 991원 (문 앞 직배송)',
    badge: '문앞 배송 🚚',
    badgeColor: 'indigo',
    rating: 4.9,
    reviewCount: 41200,
    popularityScore: 8750,
    tags: ['#삼다수', '#무라벨생수', '#2L12병', '#가정필수'],
    purchaseUrl: 'https://brand.naver.com/samdasoo',
    features: [
      '제주 한라산 천연 화산송이가 걸러낸 미네랄 천연 광천수',
      '라벨을 뜯을 필요 없는 친환경 에코 무라벨 간편 분리수거',
      '엘리베이터 없는 계단 가구도 집 앞까지 기사님 안심 배송'
    ],
    description: '무거운 생수를 마트에서 들고 오지 마세요. 깨끗함의 대명사 제주삼다수 2L 12병을 집 앞 현관까지 안심 직배송으로 배송해 드립니다.',
    specs: {
      '용량': '2L x 12병',
      '취수원': '제주특별자치도 제주시 조천읍 교래리',
      '수질 검사': '미국 FDA 및 일본 후생성 수질기준 합격',
      '보관법': '직사광선을 피하고 서늘한 곳 보관'
    },
    shippingInfo: '전국 무료 직배송 (전문 물류 배송)',
    providerType: '쇼핑몰 최저가'
  },
  {
    id: 'shop-ramen-04',
    category: 'shopping',
    categoryLabel: '생필품 초특가',
    title: '농심 신라면 120g x 20봉 멀티팩 (4개입 x 5팩 묶음)',
    subtitle: '한국인의 얼큰한 매운맛, 유통기한 넉넉한 정품 공장직송 박스',
    brand: '농심',
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
    originalPrice: 21000,
    salePrice: 14800,
    discountRate: 30,
    unitPriceDesc: '봉당 740원 (창고형 할인마트가)',
    badge: '창고 특가 🍜',
    badgeColor: 'red',
    rating: 4.8,
    reviewCount: 29800,
    popularityScore: 7630,
    tags: ['#신라면', '#20봉박스', '#봉당740원', '#얼큰한라면'],
    purchaseUrl: 'https://www.nongshim.com',
    features: [
      '소고기 육수와 표고버섯, 고급 고춧가루의 깊고 얼큰한 국물',
      '특수 배합 공법으로 끓여낸 쫄깃쫄깃한 면발 탄력 유지',
      '신선한 최신 제조일자 상품만 선별하여 안전 포장 출고'
    ],
    description: '대한민국 1등 라면 신라면! 비상용 식량이나 캠핑, 야식으로 가장 손이 많이 가는 필수 라면을 20봉 박스 최저가로 쟁여두세요.',
    specs: {
      '구성': '120g x 20봉 (4입 5팩)',
      '칼로리': '봉당 500kcal',
      '제조원': '(주)농심 안양공장',
      '유통기한': '제조일로부터 6개월'
    },
    shippingInfo: '무료배송 (에어캡 안전 박스 포장)',
    providerType: '쇼핑몰 최저가'
  },

  // ==================== [2. 맞춤 안심 보험 비교] ====================
  {
    id: 'ins-silson-01',
    category: 'insurance',
    categoryLabel: '다이렉트 안심보험',
    title: '[한화손해보험] 무배당 다이렉트 4세대 실손의료비보장보험',
    subtitle: '병원비·입원비·약값 든든 보장! 설계사 수수료 0원 다이렉트 최저가',
    brand: '한화손해보험 다이렉트',
    imageUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
    originalPrice: 18000,
    salePrice: 11800,
    discountRate: 34,
    unitPriceDesc: '예상 월 납입료 (35세 기준)',
    badge: '국민보험 🛡️',
    badgeColor: 'emerald',
    rating: 4.9,
    reviewCount: 18760,
    popularityScore: 11200,
    tags: ['#4세대실손', '#다이렉트할인', '#병원비보장', '#모바일청구'],
    purchaseUrl: 'https://www.hwgeneralins.com',
    features: [
      '급여 의료비 최대 80%, 비급여 최대 70% 자기부담금 제외 보장',
      '병원 다녀온 후 영수증 사진 한 장으로 1분 내 모바일 즉시 청구',
      '비급여 이용량에 따른 할인·할증 제도로 병원 안 가면 보험료 할인'
    ],
    description: '대한민국 국민 4천만 명이 가입한 필수 보험! 복잡한 오프라인 대리점 수수료를 싹 뺀 다이렉트 전용으로 월 1만 원대 초반에 실제 지출한 병원비를 보장받으세요.',
    specs: {
      '가입 연령': '만 0세 ~ 65세',
      '보험 기간': '1년 갱신 (최대 100세 보장)',
      '입원 보장': '연간 최대 5,000만 원 한도',
      '통원 보장': '회당 최대 20만 원 한도 (처방조제 포함)'
    },
    shippingInfo: '온라인 전자청약 즉시 효력 발생 (우편 서류 무료)',
    providerType: '보험사 공식 다이렉트'
  },
  {
    id: 'ins-driver-02',
    category: 'insurance',
    categoryLabel: '다이렉트 안심보험',
    title: '[DB손해보험] 프로미라이프 참좋은 다이렉트 운전자보험 (필수특약)',
    subtitle: '민식이법·스쿨존 사고·형사합의금 최대 2억 원, 변호사 선임비 5,000만 원',
    brand: 'DB손해보험 프로미라이프',
    imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
    originalPrice: 15000,
    salePrice: 9900,
    discountRate: 34,
    unitPriceDesc: '월 9,900원 균일가 (안심 플랜)',
    badge: '운전자 필수 🚗',
    badgeColor: 'blue',
    rating: 4.9,
    reviewCount: 24300,
    popularityScore: 10450,
    tags: ['#운전자보험', '#민식이법대비', '#변호사선임비', '#월9900원'],
    purchaseUrl: 'https://www.idbins.com',
    features: [
      '교통사고처리지원금(형사합의금) 실제 피해 금액 최대 2억 원 지급',
      '경찰 조사 단계부터 보장되는 변호사 선임 비용 최대 5,000만 원',
      '벌금(대인 3,000만 원, 대물 500만 원) 전액 한도 실손 보상'
    ],
    description: '자동차보험이 남에게 준 피해를 물어주는 것이라면, 운전자보험은 운전자 자신을 형사처벌과 벌금으로부터 지키는 방패입니다. 커피 두 잔 가격으로 안심하고 운전하세요.',
    specs: {
      '가입 대상': '자가용 운전자 (만 18세 ~ 70세)',
      '보험 기간': '3년 / 5년 / 10년 / 20년 만기',
      '교통사고 처리지원': '최대 2억 원 (사망/중상해/중과실)',
      '면허정지/취소 위로금': '일당 3만 원 ~ 5만 원 추가 가능'
    },
    shippingInfo: '카카오페이/네이버페이 원클릭 간편 가입',
    providerType: '보험사 공식 다이렉트'
  },
  {
    id: 'ins-fire-03',
    category: 'insurance',
    categoryLabel: '다이렉트 안심보험',
    title: '[KB손해보험] 1인가구·원룸·아파트 우리집 안심 주거 화재보험',
    subtitle: '아래층 누수 피해 2,000만 원 보상 + 화재 손해 1억 원 + 임시거주비',
    brand: 'KB손해보험 다이렉트',
    imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
    originalPrice: 13000,
    salePrice: 7900,
    discountRate: 39,
    unitPriceDesc: '월 7,900원 (자가/전월세 모두 가능)',
    badge: '누수/화재 해결 🏠',
    badgeColor: 'indigo',
    rating: 4.8,
    reviewCount: 9400,
    popularityScore: 6890,
    tags: ['#화재보험', '#아래층누수보상', '#전월세필수', '#가재도구보장'],
    purchaseUrl: 'https://direct.kbinsure.co.kr',
    features: [
      '세입자 및 집주인 모두 가입 가능! 아래층 천장 누수 수리비 실손 배상',
      '화재로 인한 가재도구(가전제품, 가구, 옷) 및 건물 손해 1억 원 보상',
      '화재 복구 기간 동안 발생하는 호텔/임시 숙소 거주비 1일 최대 10만 원'
    ],
    description: '전세/월세 살면서 가장 무서운 순간이 아랫집 천장에 물이 샐 때입니다. 일상생활배상책임과 주거 화재를 하나로 묶어 월 7천원대로 집안 걱정을 한 번에 날려버리세요.',
    specs: {
      '가입 대상': '아파트, 오피스텔, 다세대, 빌라, 단독주택',
      '건물 화재 손해': '최대 1억 ~ 3억 원',
      '급배수 누수 손해': '최대 2,000만 원 (자기부담금 10만 원)',
      '화재 대물 배상': '최대 10억 원 한도'
    },
    shippingInfo: '건축물대장 자동 조회로 주소만 넣으면 3분 완료',
    providerType: '보험사 공식 다이렉트'
  },
  {
    id: 'ins-dental-04',
    category: 'insurance',
    categoryLabel: '다이렉트 안심보험',
    title: '[라이나생명] THE건강한치아보험V (비갱신 순수보장형 플랜)',
    subtitle: '비싼 임플란트 개당 150만 원, 크라운 20만 원 무제한, 충치 5만 원',
    brand: '라이나생명',
    imageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80',
    originalPrice: 28000,
    salePrice: 19500,
    discountRate: 30,
    unitPriceDesc: '월 19,500원 (비갱신 10년)',
    badge: '치과비 폭탄 방어 🦷',
    badgeColor: 'cyan',
    rating: 4.8,
    reviewCount: 15400,
    popularityScore: 8120,
    tags: ['#치아보험', '#임플란트150만', '#크라운무제한', '#치과비방어'],
    purchaseUrl: 'https://www.lina.co.kr',
    features: [
      '가장 부담되는 임플란트 치아 치료 시 영구치 1개당 150만 원 보장',
      '신경치료 후 씌우는 골드/세라믹 크라운 치료 연간 개수 제한 없이 지급',
      '레진·인레이·온레이 충치 치료 1개당 5~10만 원 실손 정액 지급'
    ],
    description: '치과 한 번 가면 수백만 원 깨지는 공포! 라이나생명의 베스트셀러 치아보험으로 충치 치료부터 노후 임플란트까지 든든하게 사전 방어하세요.',
    specs: {
      '가입 나이': '만 20세 ~ 60세',
      '보장 개시': '충치치료 90일 후 / 보철(임플란트) 90일 후 (1~2년 50%)',
      '임플란트 한도': '개당 150만 원 (연간 3개 또는 무제한 특약)',
      '크라운 치료': '개당 20만 원 (연간 개수 제한 없음)'
    },
    shippingInfo: '전화 상담 없이 인터넷 모바일 셀프 가입 가능',
    providerType: '보험사 공식 다이렉트'
  },

  // ==================== [3. 전국 지역축제 & 특산물 추천] ====================
  {
    id: 'fest-suncheon-01',
    category: 'festival',
    categoryLabel: '지역축제 & 산지특산물',
    title: '[전남 순천] 2026 순천만 갈대축제 & 남도 보양 짱뚱어탕(2인분) 패키지',
    subtitle: '황금빛 갈대 물결 입장권 30% 할인 + 산지직송 짱뚱어탕 밀키트 증정',
    brand: '순천시 & 남도장터 공식 연계',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    originalPrice: 22000,
    salePrice: 15000,
    discountRate: 32,
    unitPriceDesc: '입장권 + 밀키트 2인 포함가',
    badge: '가을 추천 🌾',
    badgeColor: 'amber',
    rating: 4.9,
    reviewCount: 8200,
    popularityScore: 13200,
    tags: ['#순천만갈대축제', '#짱뚱어탕밀키트', '#남도특산물', '#가을여행'],
    purchaseUrl: 'https://scbay.suncheon.go.kr',
    features: [
      '대한민국 1호 국가정원 및 순천만 습지 자유이용 모바일 바코드 티켓',
      '축제 현장 직거래 부스에서 공수한 무항생제 짱뚱어 시래기 전골 밀키트',
      '순천만 현장 스탬프 투어 완료 시 지역사랑상품권 5,000원권 현장 환급'
    ],
    description: '가을 낭만의 끝판왕! 5.4㎢에 달하는 광활한 황금빛 갈대밭을 산책하고, 순천의 명물 짱뚱어탕을 집에서 신선하게 맛볼 수 있는 지자체 콜라보 특별 기획전입니다.',
    specs: {
      '축제 기간': '2026.10.15 ~ 2026.11.10 (상시 개방)',
      '축제 장소': '전남 순천시 순천만길 513-25 순천만습지',
      '특산품 구성': '순천만 짱뚱어탕 600g x 2팩 (냉동 급속 배송)',
      '환급 혜택': '모바일 순천사랑상품권 5,000원 즉시 증정'
    },
    shippingInfo: '입장권 즉시 모바일 MMS 발송 / 특산품 아이스박스 무료배송',
    providerType: '지자체 공식 연계'
  },
  {
    id: 'fest-jinju-02',
    category: 'festival',
    categoryLabel: '지역축제 & 산지특산물',
    title: '[경남 진주] 제74회 진주 남강유등축제 유람선 승선권 & 지리산 흑돼지 (1kg)',
    subtitle: '촉석루 야경 유등 띄우기 체험권 + 지리산 산청 프리미엄 삼겹·목살 직송',
    brand: '진주시 & 지리산로컬푸드',
    imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
    originalPrice: 45000,
    salePrice: 29900,
    discountRate: 33,
    unitPriceDesc: '유람선 2인권 + 흑돼지 1kg 풀패키지',
    badge: '야경 축제 🏮',
    badgeColor: 'red',
    rating: 4.9,
    reviewCount: 6400,
    popularityScore: 11800,
    tags: ['#진주유등축제', '#지리산흑돼지', '#남강유람선', '#경남여행'],
    purchaseUrl: 'https://yudeung.com',
    features: [
      '남강 위에 띄워진 수만 개 형형색색 등불 사이를 가르는 유람선 우선 승선',
      '지리산 맑은 공기에서 자란 1등급 흑돼지 구이용 삼겹살 500g + 목살 500g',
      '축제장 주변 온누리상품권 가맹점 10% 추가 캐시백 쿠폰북 동봉'
    ],
    description: '임진왜란의 역사와 화려한 빛의 향연! 대한민국 명예 문화관광축제인 진주 남강유등축제의 프리미엄 승선권과 신선한 지리산 흑돼지 1kg을 특가에 누려보세요.',
    specs: {
      '축제 일정': '2026.10.05 ~ 2026.10.20',
      '축제 장소': '경남 진주시 남강 및 진주성 일원',
      '특산품 구성': '무항생제 지리산 흑돼지 1kg (산소포장 냉장 출고)',
      '체험 내용': '소망등 달기 체험권 + 남강 수상 유람선 탑승'
    },
    shippingInfo: '유람선 탑승 바코드 카카오 알림톡 발송 / 흑돼지 신선 냉장배송',
    providerType: '지자체 공식 연계'
  },
  {
    id: 'fest-boryeong-03',
    category: 'festival',
    categoryLabel: '지역축제 & 산지특산물',
    title: '[충남 보령] 보령 머드테라피 웰니스 이용권 & 대천항 자연산 대하 (1kg/25미)',
    subtitle: '천연 보령머드 뷰티 스파 패키지 + 대천항 당일 어획 신선 대하 산지직송',
    brand: '보령축제관광재단 & 대천수협',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
    originalPrice: 42000,
    salePrice: 28000,
    discountRate: 33,
    unitPriceDesc: '머드스파 입장권 + 자연산 대하 1kg',
    badge: '해산물 산지직송 🦐',
    badgeColor: 'indigo',
    rating: 4.8,
    reviewCount: 4720,
    popularityScore: 9400,
    tags: ['#보령머드스파', '#대천항자연산대하', '#가을대하구이', '#서해안특산물'],
    purchaseUrl: 'https://www.mudfestival.or.kr',
    features: [
      '이스라엘 사해 머드보다 미네랄이 풍부한 보령머드 페이셜&바디 케어권',
      '새벽 대천항 위판장에서 직경매한 싱싱하고 통통한 서해안 가을 대하 1kg',
      '대천해수욕장 짚트랙 20% 현장 할인 제휴 연계 바우처 제공'
    ],
    description: '피부 미용에 탁월한 천연 머드 케어로 힐링하고, 가을 제철 살이 꽉 찬 대천항 자연산 대하를 소금구이로 즐겨보세요! 생산자와 소비자를 직거래로 잇는 알짜 패키지입니다.',
    specs: {
      '축제 장소': '충남 보령시 대천해수욕장 머드광장',
      '체험 유효기간': '구매일로부터 6개월 내 상시 사용 가능',
      '특산품 구성': '대천항 자연산 대하 1kg (약 25~30미 내외, 빙장 포장)',
      '연계 혜택': '보령사랑상품권 지류 교환권 5,000원권 포함'
    },
    shippingInfo: '티켓 모바일 저장 / 대하 당일 조업 얼음 빙장 직배송',
    providerType: '지자체 공식 연계'
  },
  {
    id: 'fest-hwacheon-04',
    category: 'festival',
    categoryLabel: '지역축제 & 산지특산물',
    title: '[강원 화천] 얼음나라 화천 산천어축제 얼음낚시 사전권 & 산천어 구이 세트',
    subtitle: '세계 4대 겨울 축제! 대기 없는 전용 낚시터 + 화천 사랑상품권 5천원 페이백',
    brand: '재단법인 나라 (화천군)',
    imageUrl: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=800&q=80',
    originalPrice: 18000,
    salePrice: 12000,
    discountRate: 33,
    unitPriceDesc: '낚시터 전용 입장권 + 상품권 페이백',
    badge: '얼음낚시 예약 🎣',
    badgeColor: 'cyan',
    rating: 4.9,
    reviewCount: 11200,
    popularityScore: 10100,
    tags: ['#산천어축제', '#얼음낚시사전예약', '#화천상품권환급', '#겨울축제'],
    purchaseUrl: 'https://www.narafestival.com',
    features: [
      '현장 줄서기 대기 없는 온라인 사전예약 전용 낚시터 입장 바코드',
      '잡은 산천어를 현장에서 즉석 숯불구이/회로 즐길 수 있는 무료 조리권',
      '현장 농특산물 부스에서 현금처럼 쓰는 화천사랑상품권 5,000원권 100% 증정'
    ],
    description: 'CNN이 선정한 세계 7대 겨울 불가사의! 1급수 맑은 얼음 밑 산천어를 낚아 올리는 손맛과 얼음 썰매, 눈조각 감상까지 온 가족이 즐기는 대한민국 최고 겨울 축제입니다.',
    specs: {
      '축제 기간': '2027.01.09 ~ 2027.02.01 (예정 및 사전 예약)',
      '축제 장소': '강원특별자치도 화천군 화천천 및 3개 읍면 일원',
      '지급 상품': '낚시터 입장권 + 화천사랑상품권 5,000원 + 낚시대 세트',
      '체험 내용': '얼음낚시, 산천어 맨손잡기, 눈썰매장, 세계얼음썰매체험'
    },
    shippingInfo: '모바일 바코드 즉시 전송 (취소 수수료 없이 당일 전액 환불)',
    providerType: '지자체 공식 연계'
  }
];
