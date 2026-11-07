import { InquiryParentCategory } from '../types';

export type HubCategory = 'shopping' | 'leisure' | 'dining' | 'general' | 'legal' | 'other';

export interface HubStep {
  stepNumber: number;
  title: string;
  desc: string;
}

export interface HubInquiryItem {
  id: string;
  category: HubCategory;
  categoryLabel: string;
  iconName: string;
  subCategory: string;
  rankBadge: string;
  resolutionRate: number; // percentage (e.g. 99.2)
  avgResolutionTime: string;
  title: string;
  questionScenario: string;
  officialAnswer: {
    summary: string;
    steps: HubStep[];
    checklist: string[];
    proTip: string;
  };
  tags: string[];
  requiredDocs?: string[];
  directInquiryPrefill: {
    parentCategory: InquiryParentCategory;
    subCategory: string;
    title: string;
    contentTemplate: string;
  };
}

export const HUB_CATEGORIES: { id: HubCategory; label: string; emoji: string; desc: string }[] = [
  { id: 'shopping', label: '쇼핑/배송/결제', emoji: '🛍️', desc: '배송 추적, 불량 교환, 반품 배송비, 결제 수단 확인' },
  { id: 'leisure', label: '여가/티켓/여행', emoji: '✈️', desc: '공연/전시 취소, 단체 대관, 모바일 바코드, 연령 증빙' },
  { id: 'dining', label: '외식/다이닝/예약', emoji: '🍽️', desc: '노쇼 위약금, 알레르기/비건, 콜키지 요금, 분할 결제' },
  { id: 'general', label: '일반/계정/보안', emoji: '⚙️', desc: '본인 인증, 간편 로그인 연동 해제, 휴면 복구, 시스템 오류' },
  { id: 'legal', label: '법률/생활/소비자', emoji: '⚖️', desc: '청약철회권, 소비자 피해구제, 임대차/계약 분쟁, 초상권/저작권' },
  { id: 'other', label: '기타/B2B/업무제휴', emoji: '🤝', desc: '신규 입점 심사, 세금계산서 정산, 대량구매, 법인 제휴' },
];

export const HUB_INQUIRIES: HubInquiryItem[] = [
  // ==================== [1] 쇼핑 (Shopping) - 5 items ====================
  {
    id: 'shop-01',
    category: 'shopping',
    categoryLabel: '쇼핑/배송',
    iconName: 'PackageCheck',
    subCategory: '배송/교환/파손',
    rankBadge: '쇼핑 TOP 1 최다 문의 🔥',
    resolutionRate: 99.2,
    avgResolutionTime: '즉시 접수 (1분)',
    title: '배송 중 상품 파손 또는 오배송 시 즉시 맞수거 교환/환불 처리 절차',
    questionScenario: '주문한 도자기 그릇 세트가 배송 중 깨져서 도착했거나, 주문과 전혀 다른 색상의 의류가 배송되었습니다. 반품 택배 접수를 제가 직접 해야 하나요? 비용이 발생하나요?',
    officialAnswer: {
      summary: '고객 과실이 아닌 배송 중 파손 및 오배송은 왕복 배송비 100% 무료이며, 택배 기사님이 새 상품을 가지고 방문하여 동시에 수거하는 [맞교환] 또는 [즉시 전액 환불]로 처리됩니다.',
      steps: [
        {
          stepNumber: 1,
          title: '송장 및 파손 부위 촬영',
          desc: '박스 겉면 송장 라벨 전체와 개봉 직후 파손/오배송된 상품의 식별 가능한 사진 2~3장을 촬영해 주세요.'
        },
        {
          stepNumber: 2,
          title: '1:1 문의 접수 또는 교환 신청',
          desc: '하단 [이 유형으로 1:1 문의하기]를 누르시면 전용 양식이 열리며, 사진을 첨부하여 접수해 주시면 30분 내 승인 처리됩니다.'
        },
        {
          stepNumber: 3,
          title: '안심 맞수거 완료',
          desc: '지정 택배사(우체국/CJ대한통운)에서 1~2 영업일 내 방문하여 기존 물품 수거 및 새 상품 인도가 자동으로 진행됩니다.'
        }
      ],
      checklist: [
        '기존 파손 물품과 포장 박스는 수거 기사님 전달을 위해 보관해 주세요.',
        '송장 번호가 훼손되지 않도록 박스 외부 사진을 함께 첨부해 주세요.'
      ],
      proTip: '외관 박스가 심하게 찌그러진 경우 박스 훼손 사진까지 함께 첨부하시면 물류 보상 센터 직통으로 빠른 당일 출고가 진행됩니다.'
    },
    tags: ['#파손보상', '#오배송교환', '#무료맞수거', '#송장라벨'],
    requiredDocs: ['택배 송장 사진', '파손 부위 상세 사진'],
    directInquiryPrefill: {
      parentCategory: 'shopping',
      subCategory: 'delivery',
      title: '[배송 파손/오배송] 즉시 교환 및 안심 맞수거 요청',
      contentTemplate: '1. 주문번호: \n2. 송장번호: \n3. 수령 상품 상태(파손 부위 / 오배송 내역): \n4. 희망 처리 방식: (새 상품 맞교환 / 전액 환불)\n5. 첨부 파일: 파손 사진 및 송장 사진을 하단에 첨부했습니다.'
    }
  },
  {
    id: 'shop-02',
    category: 'shopping',
    categoryLabel: '쇼핑/결제',
    iconName: 'MapPin',
    subCategory: '배송지/주문정보 변경',
    rankBadge: '쇼핑 TOP 2 문의',
    resolutionRate: 97.8,
    avgResolutionTime: '즉시 셀프 해결',
    title: '결제 완료 후 배송지 주소/수령인 연락처/주문 옵션 변경 가능 시점 및 방법',
    questionScenario: '결제를 마친 후 이사 전 주소나 이전 휴대폰 번호로 잘못 주문한 것을 발견했습니다. 이미 결제된 상태인데 주소지를 변경할 수 있나요? 옵션 변경도 가능한가요?',
    officialAnswer: {
      summary: '주문 상태가 [결제 완료] 또는 [상품 준비 중] 단계인 경우 배송지 변경이 가능하며, 이미 [배송 준비 중/송장 출력 완료] 단계로 넘어간 경우에는 물류센터 출고를 멈출 수 없어 반송 후 재발송 처리가 필요합니다.',
      steps: [
        {
          stepNumber: 1,
          title: '현재 주문 배송 상태 조회',
          desc: '주문 내역에서 송장 번호가 이미 생성되었는지 확인합니다.'
        },
        {
          stepNumber: 2,
          title: '출고 전 즉시 변경 접수',
          desc: '아직 송장이 등록되지 않은 상태라면 1:1 고객 문의로 새 주소지와 신규 수령인 연락처를 접수하시면 담당자가 물류 시스템에 즉시 동기화합니다.'
        },
        {
          stepNumber: 3,
          title: '이미 출고된 경우 조치',
          desc: '이미 택배사로 인계된 상태라면 담당 택배 기사님 연락처로 배송지 변경 요청을 하거나, 수취 거절 후 회수 반송을 진행합니다.'
        }
      ],
      checklist: [
        '해외 직구 및 맞춤 제작 상품의 경우 통관 부호 및 수령인 일치가 필수입니다.',
        '옵션(사이즈/색상) 변경은 출고 오류 방지를 위해 주문 취소 후 재결제를 권장합니다.'
      ],
      proTip: '오전 10시 및 오후 2시는 물류센터 당일 일괄 출고 타임이므로, 이 시간대 직전에는 즉시 접수해 주셔야 출고 정지가 가능합니다.'
    },
    tags: ['#배송지변경', '#주문정보수정', '#출고전변경', '#연락처수정'],
    directInquiryPrefill: {
      parentCategory: 'shopping',
      subCategory: 'delivery',
      title: '[배송지 변경 긴급 요청] 출고 전 주소지 변경 요청',
      contentTemplate: '1. 주문번호: \n2. 변경 전 주소: \n3. 변경 후 새 주소: \n4. 수령인 성함 및 연락처: \n※ 물류센터 출고 전 빠른 변경 부탁드립니다.'
    }
  },
  {
    id: 'shop-03',
    category: 'shopping',
    categoryLabel: '쇼핑/반품',
    iconName: 'RotateCcw',
    subCategory: '반품비/단순변심',
    rankBadge: '쇼핑 TOP 3 문의',
    resolutionRate: 98.4,
    avgResolutionTime: '1영업일 이내',
    title: '단순 변심에 의한 반품 시 왕복 배송비 부과 기준 및 포장 규정',
    questionScenario: '구매한 의류의 실물 색상이 생각했던 것과 달라 단순 변심으로 반품하고 싶습니다. 반품 배송비는 얼마가 차감되며, 원래 박스가 없으면 어떻게 포장해야 하나요?',
    officialAnswer: {
      summary: '상품 수령 후 7일 이내 단순 변심 반품이 가능하며, 왕복 택배비(기본 6,000원, 제주/도서산간 추가)는 환불 예정 금액에서 자동 차감됩니다. 상품 태그 훼손 및 착용 흔적이 없어야 합니다.',
      steps: [
        {
          stepNumber: 1,
          title: '반품 기한 및 상태 점검',
          desc: '수령일로부터 7일 이내 접수, 의류 택(Tag) 미제거, 착용 흔적 및 화장품/향수 냄새가 없어야 합니다.'
        },
        {
          stepNumber: 2,
          title: '안전 재포장',
          desc: '원래 포장 비닐 또는 대체 박스에 안전하게 밀봉해 주시고, 부속품 및 사은품이 있는 경우 모두 동봉해 주세요.'
        },
        {
          stepNumber: 3,
          title: '반품 수거 접수 및 환불 완료',
          desc: '접수 시 지정 택배사 기사님이 영업일 기준 1~2일 내 자동 방문하며, 물류센터 검수 완료 후 차감 환불됩니다.'
        }
      ],
      checklist: [
        '위생용품, 맞춤 제작품, 밀봉 개봉 시 가치가 멸실되는 상품은 단순 변심 반품이 제한됩니다.',
        '반품 택배 상자 안에 현금을 직접 동봉하지 마세요(분실 위험 방지).'
      ],
      proTip: '신용카드로 결제하신 경우 반품 완료 시 카드사 전표 취소로 처리되어 청구 금액에서 자동 상계됩니다.'
    },
    tags: ['#단순변심반품', '#왕복배송비', '#택배비차감', '#포장규정'],
    directInquiryPrefill: {
      parentCategory: 'shopping',
      subCategory: 'refund',
      title: '[단순 변심 반품 접수] 왕복 배송비 차감 후 반품 수거 요청',
      contentTemplate: '1. 주문번호: \n2. 반품 상품명: \n3. 반품 사유: 단순 변심 (색상/사이즈 차이)\n4. 상품 상태: 택 미제거 및 미착용 보관 중\n5. 수거 희망 주소지: '
    }
  },
  {
    id: 'shop-04',
    category: 'shopping',
    categoryLabel: '쇼핑/환불',
    iconName: 'AlertCircle',
    subCategory: '품절취소/환불일정',
    rankBadge: '쇼핑 TOP 4 문의',
    resolutionRate: 99.6,
    avgResolutionTime: '즉시 카드 승인 취소',
    title: '품절 취소 알림 수신 시 결제 금액 환불 일정 및 보상 포인트 안내',
    questionScenario: '주문 후 하루 뒤에 재고 부족으로 품절 취소되었다는 문자를 받았습니다. 결제한 카드는 언제 한도가 복원되고, 쿠폰이나 보상 혜택은 어떻게 되나요?',
    officialAnswer: {
      summary: '판매처 재고 부족으로 인한 품절 취소는 즉시 전액 환불 승인되며, 사용하셨던 할인 쿠폰 복원과 함께 결제 금액의 3% 상당의 안심 보상 적립금이 자동으로 지급됩니다.',
      steps: [
        {
          stepNumber: 1,
          title: '결제 수단별 환불 소요일 확인',
          desc: '체크/신용카드: 당일 승인 취소(카드사 매입 상태에 따라 2~3영업일 소요), 가상계좌/무통장: 환불 계좌로 1영업일 내 입금.'
        },
        {
          stepNumber: 2,
          title: '사용 쿠폰 즉시 자동 재발급',
          desc: '결제 시 적용했던 유효기간 만료 전 쿠폰은 시스템에서 즉시 재발급되어 다시 사용하실 수 있습니다.'
        },
        {
          stepNumber: 3,
          title: '품절 보상 포인트 확인',
          desc: '고객님의 소중한 시간을 보상해 드리고자 구매 금액의 3%(최대 10,000P)가 안심 캐시로 적립됩니다.'
        }
      ],
      checklist: [
        '가상계좌 입금 고객님의 경우 환불 받으실 본인 명의 계좌번호를 등록해 주셔야 입금이 완료됩니다.'
      ],
      proTip: '유사한 대체 상품 추천이 필요하신 경우 1:1 문의를 주시면 제휴처 MD가 실시간 최저가 대체품을 안내해 드립니다.'
    },
    tags: ['#품절취소', '#환불일정', '#쿠폰재발급', '#보상포인트'],
    directInquiryPrefill: {
      parentCategory: 'shopping',
      subCategory: 'refund',
      title: '[품절 취소 문의] 가상계좌 환불 및 대체 상품 추천 요청',
      contentTemplate: '1. 주문번호: \n2. 품절 취소된 상품명: \n3. 환불 계좌 정보: (은행명 / 계좌번호 / 예금주명)\n4. 동일 카테고리 유사 추천 상품 확인 요청 유무: '
    }
  },
  {
    id: 'shop-05',
    category: 'shopping',
    categoryLabel: '쇼핑/정산',
    iconName: 'Receipt',
    subCategory: '세금계산서/지출증빙',
    rankBadge: '쇼핑 TOP 5 문의',
    resolutionRate: 98.9,
    avgResolutionTime: '당일 발급',
    title: '전자 세금계산서 및 개인사업자/법인 지출증빙 현금영수증 발급 방법',
    questionScenario: '회사 비품 구매용으로 법인카드가 아닌 무통장 입금으로 결제했습니다. 홈택스에 자동 전송되는 전자세금계산서나 사업자 지출증빙 영수증을 받으려면 어떻게 해야 하나요?',
    officialAnswer: {
      summary: '무통장/가상계좌 결제 시 사업자등록증 사본을 접수해 주시면 국세청 홈택스 표준 전자세금계산서가 발행되며, 신용카드 결제의 경우 신용카드 매출전표가 세법상 정규 지출증빙으로 인정됩니다.',
      steps: [
        {
          stepNumber: 1,
          title: '결제 수단 확인',
          desc: '카드 결제 건은 [신용카드 매출전표]가 부가세법 제33조에 따라 세금계산서와 동일한 효력을 갖습니다.'
        },
        {
          stepNumber: 2,
          title: '사업자등록증 접수 (무통장 건)',
          desc: '사업자등록증 사본과 계산서 수신용 담당자 이메일을 1:1 문의로 접수해 주세요.'
        },
        {
          stepNumber: 3,
          title: '국세청 홈택스 즉시 발행',
          desc: '담당 재무팀 검토 후 익일 국세청 홈택스로 전자세금계산서 승인 번호가 자동 전송됩니다.'
        }
      ],
      checklist: [
        '세금계산서 발행 신청은 구매 확정 월의 익월 10일 이전까지 완료되어야 국세청 마감 기한을 준수할 수 있습니다.',
        '카드 결제와 세금계산서는 이중 발행이 법적으로 불가합니다.'
      ],
      proTip: '마이페이지 [결제 영수증] 메뉴에서 신용카드 매출전표를 PDF로 즉시 다운로드하실 수 있습니다.'
    },
    tags: ['#전자세금계산서', '#지출증빙', '#현금영수증', '#사업자등록증'],
    requiredDocs: ['사업자등록증 사본', '계산서 수신 이메일'],
    directInquiryPrefill: {
      parentCategory: 'shopping',
      subCategory: 'payment_issue',
      title: '[전자세금계산서 발행 요청] 사업자 지출증빙 발행 신청',
      contentTemplate: '1. 주문번호: \n2. 사업자등록번호: \n3. 상호(법인명): \n4. 대표자 성명: \n5. 계산서 수신 이메일: \n6. 첨부: 사업자등록증 사본 첨부'
    }
  },

  // ==================== [2] 여가 (Leisure / Travel / Culture) - 5 items ====================
  {
    id: 'lei-01',
    category: 'leisure',
    categoryLabel: '여가/티켓',
    iconName: 'Ticket',
    subCategory: '취소/기상악화/환불',
    rankBadge: '여가 TOP 1 최다 문의 🔥',
    resolutionRate: 98.1,
    avgResolutionTime: '즉시 승인',
    title: '전시·공연·테마파크 티켓 당일 취소 및 우천/천재지변 취소 환불 기준',
    questionScenario: '내일 야외 페스티벌 및 테마파크를 가기로 예약했는데 폭우 및 태풍 특보가 발효되었습니다. 당일 취소 시 위약금이 부과되나요? 기상 악화 시 전액 환불받을 수 있나요?',
    officialAnswer: {
      summary: '기상청 공식 호우/태풍 주의보 이상 발효 시 또는 시설 주최측의 공식 운영 중단 공지가 있을 경우 취소 수수료 0원으로 100% 전액 환불 처리됩니다. 개인 변심 당일 취소는 관람 2시간 전까지 규정 수수료가 적용됩니다.',
      steps: [
        {
          stepNumber: 1,
          title: '천재지변/기상특보 공식 공지 확인',
          desc: '주최측 공식 휴장 공지 또는 기상청 특보 발표 시 별도 소명 없이 전액 환불 대상이 됩니다.'
        },
        {
          stepNumber: 2,
          title: '예매 번호 및 취소 접수',
          desc: '1:1 문의 또는 예매 상세 화면에서 [천재지변 전액 환불]을 선택하여 접수해 주세요.'
        },
        {
          stepNumber: 3,
          title: '위약금 면제 및 결제 취소',
          desc: '제휴 레저처 확인 즉시 위약금 감면 처리되며 당일 결제 승인 취소가 완료됩니다.'
        }
      ],
      checklist: [
        '개인 사정으로 인한 당일 취소는 관람 시작 시간 이후에는 환불이 불가합니다.',
        '패키지 상품의 경우 미사용 일부 티켓만 부분 환불이 어려울 수 있습니다.'
      ],
      proTip: '야외 시설의 경우 우천 예보 시 주최측에서 [사전 무료 일정 변경] 옵션을 제공하므로 취소 전 날짜 변경을 먼저 검토해 보세요.'
    },
    tags: ['#기상악화환불', '#당일취소위약금', '#우천취소', '#전액환불'],
    directInquiryPrefill: {
      parentCategory: 'travel',
      subCategory: 'package_tour',
      title: '[기상 특보/천재지변] 레저/티켓 취소 수수료 면제 환불 요청',
      contentTemplate: '1. 예매번호: \n2. 시설/공연명: \n3. 방문 예정 일시: \n4. 취소 사유: 기상청 호우/태풍 특보로 인한 방문 불가\n5. 환불 희망 내용: 위약금 면제 100% 전액 취소'
    }
  },
  {
    id: 'lei-02',
    category: 'leisure',
    categoryLabel: '여가/대관',
    iconName: 'Users',
    subCategory: '단체관람/기업대관',
    rankBadge: '여가 TOP 2 문의',
    resolutionRate: 99.0,
    avgResolutionTime: '2시간 내 전담 매니저 배정',
    title: '단체 관람(10인 이상) 및 기업 워크숍 대관 할인 혜택과 후불 정산 조건',
    questionScenario: '회사 워크숍으로 25명이 단체 관람 및 세미나실 대관을 진행하려 합니다. 단체 할인율은 몇 %이며, 사전 견적서 발급과 행사 후 법인 후불 정산이 가능한가요?',
    officialAnswer: {
      summary: '10인 이상 단체 예매 시 정가 대비 15%~30% 단체 우대 할인이 적용되며, 사전 공식 견적서 및 비교 견적서 발급은 물론 법인 고객을 위한 행사 후 익월말 세금계산서 후불 정산이 지원됩니다.',
      steps: [
        {
          stepNumber: 1,
          title: '희망 인원 및 일정 견적 접수',
          desc: '방문 희망 일자, 예상 인원수, 부대시설(빔프로젝터, 케이터링) 필요 여부를 접수합니다.'
        },
        {
          stepNumber: 2,
          title: '전담 B2B 매니저 1:1 매칭',
          desc: '접수 2시간 이내에 시설 본사 전담 단체 기획팀장이 직통 유선 연락 및 공식 직인 견적서를 송부합니다.'
        },
        {
          stepNumber: 3,
          title: '법인 정산 협약 및 사전 좌석 홀딩',
          desc: '기업 전용 후불 결제 승인 및 단체 버스 전용 주차 구역 무료 배정이 완료됩니다.'
        }
      ],
      checklist: [
        '단체 관람은 최소 방문 3영업일 전까지 인원 확정 및 사전 홀딩이 필요합니다.',
        '세금계산서 후불 정산 시 사업자등록증 및 담당자 명함 확인이 필요합니다.'
      ],
      proTip: '평일 오전 또는 화~목요일 일정으로 조율 시 추가 5% 얼리버드 대관료 감면 혜택이 제공됩니다.'
    },
    tags: ['#단체관람할인', '#기업대관', '#후불정산', '#공식견적서'],
    directInquiryPrefill: {
      parentCategory: 'travel',
      subCategory: 'hotel_booking',
      title: '[B2B 기업 단체 예약] 단체 관람 할인 및 대관 견적 문의',
      contentTemplate: '1. 기업/단체명: \n2. 행사 희망 일시: \n3. 예상 인원: (성인 00명 / 아동 00명)\n4. 필요 부대시설: (마이크/음향/빔프로젝터/전용주차)\n5. 결제 방식: (법인카드 현장결제 / 세금계산서 후불정산)'
    }
  },
  {
    id: 'lei-03',
    category: 'leisure',
    categoryLabel: '여가/티켓',
    iconName: 'QrCode',
    subCategory: '모바일바코드/발권',
    rankBadge: '여가 TOP 3 문의',
    resolutionRate: 99.5,
    avgResolutionTime: '즉시 재발송 (30초)',
    title: '모바일 예매 바코드 미도착 또는 캡처본 입장 불가 시 현장 재발권',
    questionScenario: '예매를 완료했는데 카카오톡 알림톡이나 문자로 모바일 바코드가 오지 않았습니다. 친구가 보내준 화면 캡처 사진만으로 현장 입장이 가능한가요?',
    officialAnswer: {
      summary: '보안 정책상 복제 방지를 위해 정적 화면 캡처본 입장은 제한될 수 있으나, 현장 무인 발권기(키오스크) 또는 매표소에서 [예약자 휴대폰 번호 + 생년월일 6자리] 입력 시 종이 지류 티켓으로 즉시 무료 재발권됩니다.',
      steps: [
        {
          stepNumber: 1,
          title: '스팸 차단함 및 카카오톡 검색',
          desc: '카카오톡 상단 검색창에 [InquireHub] 또는 시설명을 검색하여 알림톡을 확인해 주세요.'
        },
        {
          stepNumber: 2,
          title: '알림톡 즉시 재발송 요청',
          desc: '고객 포탈 [예매 내역]에서 [모바일 바코드 재발송] 버튼을 누르면 30초 내 즉시 전송됩니다.'
        },
        {
          stepNumber: 3,
          title: '현장 데스크 본인 확인 발권',
          desc: '통신 장애 등으로 수신이 안 될 경우 현장 인포메이션 데스크에서 신분증 제시 후 즉시 발권받으실 수 있습니다.'
        }
      ],
      checklist: [
        '선물하기로 전달받은 티켓은 최초 수령자의 휴대폰 번호 인증이 필요할 수 있습니다.'
      ],
      proTip: '공식 예매 완료 페이지의 웹 화면(URL)을 직접 띄우시면 실시간 동적 바코드가 표시되어 캡처본 없이도 바로 태그 입장됩니다.'
    },
    tags: ['#모바일바코드', '#티켓미도착', '#현장재발권', '#캡처본입장'],
    directInquiryPrefill: {
      parentCategory: 'travel',
      subCategory: 'flight_schedule',
      title: '[티켓 발권 문의] 모바일 바코드 미수신 재발송 요청',
      contentTemplate: '1. 예매자 성함: \n2. 예매 시 등록한 휴대폰 번호: \n3. 예매 일자 및 상품명: \n4. 바코드 수신 희망 방식: (카카오톡 알림톡 재전송 / SMS 문자 전송)'
    }
  },
  {
    id: 'lei-04',
    category: 'leisure',
    categoryLabel: '여가/우대',
    iconName: 'IdCard',
    subCategory: '증빙서류/보호자동반',
    rankBadge: '여가 TOP 4 문의',
    resolutionRate: 98.7,
    avgResolutionTime: '즉시 확인',
    title: '연령별(유아/청소년/경로) 증빙 서류 지참 규정 및 보호자 동반 기준',
    questionScenario: '36개월 미만 유아 무료입장과 만 65세 이상 경로 할인을 적용받으려 합니다. 주민등록등본 종이를 꼭 출력해가야 하나요? 모바일 전자지갑(정부24)도 효력이 인정되나요?',
    officialAnswer: {
      summary: '주민등록등본, 가족관계증명서, 건강보험증뿐만 아니라 [정부24 모바일 전자문서 지갑] 및 PASS 앱 전자신분증 등 공식 디지털 증빙도 100% 현장 효력이 인정됩니다. (사진 캡처본은 생년월일 및 최근 3개월 발급 일자 식별 시 인정)',
      steps: [
        {
          stepNumber: 1,
          title: '인정되는 공식 증빙 서류 준비',
          desc: '유아: 주민등록등본, 건강보험증, 아기수첩 / 청소년: 학생증, 청소년증 / 경로: 주민등록증, 운전면허증.'
        },
        {
          stepNumber: 2,
          title: '모바일 전자지갑 앱 활용',
          desc: '스마트폰 [정부24] 또는 [카카오톡 지갑/PASS]의 모바일 등본을 현장 게이트 직원에게 제시하시면 됩니다.'
        },
        {
          stepNumber: 3,
          title: '보호자 필수 동반 안전 규정',
          desc: '만 10세 미만 아동의 경우 놀이시설 안전 규정상 성인 보호자 최소 1인 이상의 동반 입장이 필수입니다.'
        }
      ],
      checklist: [
        '서류상 생년월일과 수혜 대상자의 연령 기준일(방문일 기준 만 나이)을 미리 확인해 주세요.',
        '증빙 서류 미지참 시 현장에서 정상 요금과의 차액 결제가 발생할 수 있습니다.'
      ],
      proTip: '방문 직전 스마트폰 정부24 앱에서 전자문서지갑 등본을 1회 발급해 두시면 지갑 없이도 전국 제휴 시설에서 즉시 인증됩니다.'
    },
    tags: ['#유아무료입장', '#경로할인', '#정부24모바일등본', '#보호자동반'],
    directInquiryPrefill: {
      parentCategory: 'travel',
      subCategory: 'package_tour',
      title: '[우대 할인 기준 확인] 유아/청소년/경로 증빙 서류 사전 검토 요청',
      contentTemplate: '1. 방문 예정 시설: \n2. 우대 적용 대상자 (예: 28개월 유아 1명, 68세 경로 1명): \n3. 지참 예정 증빙: (정부24 모바일 등본 / 여권 사본)\n4. 보호자 동반 탑승 가능 여부 문의: '
    }
  },
  {
    id: 'lei-05',
    category: 'leisure',
    categoryLabel: '여가/유실물',
    iconName: 'Search',
    subCategory: '분실물/택배수령',
    rankBadge: '여가 TOP 5 문의',
    resolutionRate: 96.4,
    avgResolutionTime: '당일 분실물 조회',
    title: '시설 내 소지품 분실 시 현장 유실물 보관소 확인 및 자택 안심 택배 수령',
    questionScenario: '어제 워터파크/공연장을 이용하다가 탈의실 또는 객석에 스마트폰 충전기와 모자를 두고 왔습니다. 이미 퇴장했는데 어떻게 찾을 수 있으며 자택으로 택배 발송이 되나요?',
    officialAnswer: {
      summary: '시설 내 고객 안심 유실물 센터에서 실시간 수거 등록 시스템을 운영 중이며, 분실 위치와 물품 특징을 접수해 주시면 대조 후 자택으로 착불 안전 안심 택배 발송 또는 현장 방문 수령을 도와드립니다.',
      steps: [
        {
          stepNumber: 1,
          title: '분실 정보 1:1 접수',
          desc: '분실 일시, 분실 장소(구역 번호/라커 번호), 물품 상세 브랜드/색상/특징을 남겨주세요.'
        },
        {
          stepNumber: 2,
          title: '보관소 실시간 매칭 조회',
          desc: '시설 마감 후 보안팀 수거 리스트와 일치 여부를 즉시 대조하여 3시간 내 결과를 알려드립니다.'
        },
        {
          stepNumber: 3,
          title: '안심 택배 발송 또는 방문 수령',
          desc: '일치할 경우 수령인 주소를 확인하여 우체국 안심 택배로 안전 포장 후 발송됩니다.'
        }
      ],
      checklist: [
        '신분증, 신용카드, 고가 귀중품은 본인 확인 절차(신분증 대조) 후 발송됩니다.',
        '습득된 유실물은 경찰청 유실물 포털(Lost112) 지침에 따라 최대 30일 보관 후 경찰서로 이관됩니다.'
      ],
      proTip: '물품의 사진이나 구매 내역 캡처본을 함께 첨부해 주시면 동일 품목 중에서도 오배송 없이 가장 정확하고 빠르게 식별됩니다.'
    },
    tags: ['#분실물센터', '#소지품유실', '#안심택배수령', '#Lost112'],
    directInquiryPrefill: {
      parentCategory: 'travel',
      subCategory: 'hotel_booking',
      title: '[분실물 조회 접수] 시설 내 분실 소지품 확인 및 택배 수령 요청',
      contentTemplate: '1. 방문 일자 및 이용 구역: \n2. 분실 물품명: (브랜드 / 색상 / 기종)\n3. 물품 상세 특징: (스티커 부착 여부, 스크래치 위치 등)\n4. 택배 수령 희망 주소 및 연락처: '
    }
  },

  // ==================== [3] 외식 (Dining / Restaurant) - 5 items ====================
  {
    id: 'din-01',
    category: 'dining',
    categoryLabel: '외식/예약',
    iconName: 'UtensilsCrossed',
    subCategory: '노쇼/예약금환불',
    rankBadge: '외식 TOP 1 최다 문의 🔥',
    resolutionRate: 98.6,
    avgResolutionTime: '즉시 환불 처리',
    title: '단체 예약(룸/회식) 노쇼(No-Show) 위약금 규정 및 인원 변경 마감 시한',
    questionScenario: '주말 저녁 8명 룸 예약을 위해 예약금 8만 원을 결제했습니다. 당일 참석 인원이 6명으로 줄어들거나 피치 못하게 취소해야 할 경우 예약금 환불 규정이 어떻게 되나요?',
    officialAnswer: {
      summary: '공정거래위원회 외식업 소비자분쟁해결기준을 준수하여 예약 시간 24시간 전 취소 시 예약금 100% 전액 환불되며, 당일 취소 및 노쇼 발생 시 식자재 선준비 비용으로 인해 예약금이 차감됩니다. 단순 인원 축소는 방문 2시간 전까지 통보 시 위약금 없이 반영됩니다.',
      steps: [
        {
          stepNumber: 1,
          title: '취소/변경 시점 확인',
          desc: '예약일 기준 1일 전(24시간 전)까지는 고객 포탈에서 클릭 한 번으로 예약금 100% 자동 환불 취소 가능합니다.'
        },
        {
          stepNumber: 2,
          title: '당일 인원 변동 사전 연락',
          desc: '예약 시간 최소 2시간 전까지 매장 또는 1:1 문의로 최종 인원을 통보하시면 준비 메뉴 수량이 즉시 조절됩니다.'
        },
        {
          stepNumber: 3,
          title: '예약금 정산 방식',
          desc: '방문 시 결제한 예약금은 최종 매장 식사 금액에서 자동 공제 차감되어 나머지 차액만 결제하시면 됩니다.'
        }
      ],
      checklist: [
        '당일 무단 노쇼(연락 두절) 시 예약금은 전액 환불이 불가합니다.',
        '코스 요리의 경우 예약 당일 식재료 사전 숙성으로 인해 인원 축소 시 최소 코스 비용이 발생할 수 있습니다.'
      ],
      proTip: '전체 취소 대신 날짜/시간 변경을 원하실 경우 매장 잔여 좌석에 한해 위약금 차감 없이 1회에 한해 일정 연기가 가능합니다.'
    },
    tags: ['#노쇼위약금', '#예약금전액환불', '#단체인원변경', '#공정위기준'],
    directInquiryPrefill: {
      parentCategory: 'restaurant',
      subCategory: 'group_reservation',
      title: '[외식 예약 변경/취소] 단체 룸 예약 인원 변동 및 예약금 정산 요청',
      contentTemplate: '1. 예약 매장명: \n2. 예약 일시 및 예약자명: \n3. 변경 사항: (기존 00명 -> 변경 00명 / 예약 취소 및 예약금 환불)\n4. 사유: '
    }
  },
  {
    id: 'din-02',
    category: 'dining',
    categoryLabel: '외식/조리',
    iconName: 'ShieldAlert',
    subCategory: '알레르기/비건/조리요청',
    rankBadge: '외식 TOP 2 문의',
    resolutionRate: 99.4,
    avgResolutionTime: '조리팀 직접 확인 (1시간 내)',
    title: '특정 식재료 알레르기(견과류/갑각류/글루텐) 및 비건 맞춤 조리 사전 요청법',
    questionScenario: '동행자 중 심각한 땅콩 알레르기 환자와 페스코 채식주의자가 있습니다. 교차 오염 방지가 가능한지, 특정 코스 메뉴를 대체 식재료로 조리해 주실 수 있나요?',
    officialAnswer: {
      summary: '공식 제휴 레스토랑은 식약처 알레르기 유발 물질 21종 표시 지침을 철저히 준수하며, 예약 최소 1일 전 고지해 주시면 전용 조리도구 분리 사용 및 비건/대체 식재료(글루텐프리 면, 버섯 등) 맞춤 플레이팅을 제공합니다.',
      steps: [
        {
          stepNumber: 1,
          title: '상세 알레르기 유발 물질 및 비건 유형 기재',
          desc: '해당 인원수와 함께 반응 유발 물질(예: 갑각류 알레르기, 비건 락토오보 등)을 명확히 입력합니다.'
        },
        {
          stepNumber: 2,
          title: '헤드 셰프 코스 조율 및 피드백',
          desc: '주방 조리팀에서 해당 손님 전용 코스 대체 조리 계획(육수 교체, 전용 팬 조리)을 확정하여 안내드립니다.'
        },
        {
          stepNumber: 3,
          title: '방문 당일 담당 서버 재확인',
          desc: '착석 시 테이블 담당 서버가 사전 요청된 맞춤 식단을 재브리핑하며 안전하게 서빙을 진행합니다.'
        }
      ],
      checklist: [
        '중증 아나필락시스(호흡곤란) 유발 이력이 있으신 경우 반드시 예약 시 사전 경고 메모를 남겨주세요.',
        '방문 당일 현장 요청 시 육수나 기본 베이스 변경이 어려울 수 있으니 사전 고지가 필수입니다.'
      ],
      proTip: '1:1 문의 시 요청사항을 남겨주시면 주방 헤드 셰프가 확인한 맞춤 대체 메뉴 리스트를 답변으로 미리 받아보실 수 있습니다.'
    },
    tags: ['#알레르기교차오염방지', '#비건채식코스', '#식재료대체', '#아나필락시스예방'],
    directInquiryPrefill: {
      parentCategory: 'restaurant',
      subCategory: 'dietary_needs',
      title: '[식재료 특이사항 사전 공유] 알레르기 케어 및 비건 대체 조리 요청',
      contentTemplate: '1. 예약 매장명 및 예약 일시: \n2. 예약자 성함: \n3. 알레르기 대상 물질: (예: 땅콩, 게, 새우, 밀가루 글루텐 등)\n4. 반응 심각도: (단순 두드러기 / 아나필락시스 호흡곤란 주의)\n5. 희망 대체 요청사항: '
    }
  },
  {
    id: 'din-03',
    category: 'dining',
    categoryLabel: '외식/주류',
    iconName: 'Wine',
    subCategory: '콜키지/주류반입',
    rankBadge: '외식 TOP 3 문의',
    resolutionRate: 98.3,
    avgResolutionTime: '즉시 매장 규정 확인',
    title: '콜키지(Corkage) 정책, 반입 가능 주류 종류 및 글라스 제공 비용',
    questionScenario: '기념일에 개인이 소장한 고급 와인이나 위스키를 가져가서 마시고 싶습니다. 매장 반입이 가능한지, 병당 콜키지 비용과 칠링 버킷/전용 잔 제공 여부가 궁금합니다.',
    officialAnswer: {
      summary: '와인은 기본 병당 20,000원~30,000원 선이며 리델 등 전문 글라스 교체 및 아이스 칠링 버킷 서비스가 포함됩니다. 매장 내 판매 중인 주류와 동일한 라벨은 반입이 제한될 수 있으며, 고도주(위스키/전통주)는 전용 콜키지 규정이 적용됩니다.',
      steps: [
        {
          stepNumber: 1,
          title: '반입 희망 주류 및 수량 체크',
          desc: '반입하실 주류의 종류(와인, 사케, 위스키)와 병 수를 확인합니다.'
        },
        {
          stepNumber: 2,
          title: '콜키지 프리 프로모션 여부 확인',
          desc: '특정 코스 주문 고객 또는 평일 런치 이용 고객에게 [콜키지 1병 무료] 제휴 혜택을 제공하는 매장이 있으니 문의해 보세요.'
        },
        {
          stepNumber: 3,
          title: '현장 전문 소믈리에 서브',
          desc: '오픈, 에어레이션(디캔팅), 칠링 버킷 및 잔 교체 서비스를 편안하게 이용하실 수 있습니다.'
        }
      ],
      checklist: [
        '테이블당 반입 가능 병 수 제한(통상 최대 2병)이 있을 수 있으니 사전 확인이 필요합니다.',
        '잔 파손 시 별도의 글라스 브로큰 차지(Broken Charge)가 발생할 수 있습니다.'
      ],
      proTip: '매장에서 지정한 페어링 주류를 1병 이상 주문하실 경우 반입 주류 1병을 무료 콜키지로 제공하는 제휴 매장이 많습니다.'
    },
    tags: ['#와인콜키지', '#위스키반입', '#칠링서비스', '#콜키지프리'],
    directInquiryPrefill: {
      parentCategory: 'restaurant',
      subCategory: 'partnership',
      title: '[콜키지 정책 문의] 주류 반입 규정 및 글라스 차지 확인 요청',
      contentTemplate: '1. 예약 매장 및 일시: \n2. 반입 예정 주류: (와인 0병 / 위스키 0병 / 사케 0병)\n3. 디캔팅 및 칠링 버킷 필요 여부: \n4. 매장 콜키지 할인 제휴 적용 가능 여부 문의: '
    }
  },
  {
    id: 'din-04',
    category: 'dining',
    categoryLabel: '외식/이벤트',
    iconName: 'Cake',
    subCategory: '외부음식/생일이벤트',
    rankBadge: '외식 TOP 4 문의',
    resolutionRate: 99.1,
    avgResolutionTime: '즉시 매장 협의',
    title: '생일 케이크 및 외부 음식물 반입 허용 여부와 기념일 이벤트 협의',
    questionScenario: '부모님 환갑 기념 식사라 맞춤 제작 생일 앙금 케이크를 외부에서 사 가려고 합니다. 케이크 촛불 점화 및 현장 취식이 가능한가요? 케이크 냉장 보관도 해주시나요?',
    officialAnswer: {
      summary: '위생법상 일반 외부 음식물 취식은 금지되나, [축하용 생일 케이크]의 경우 촛불 점화 및 사진 촬영은 100% 허용되며, 식사 후 디저트로 나누어 드실 수 있도록 전용 앞접시와 포크가 무료 제공됩니다. (방문 즉시 케이크 냉장 보관 지원)',
      steps: [
        {
          stepNumber: 1,
          title: '방문 시 데스크에 케이크 보관 요청',
          desc: '도착 즉시 매장 카운터에 케이크를 맡기시면 식사 중 신선도 유지를 위해 전용 냉장고에 보관해 드립니다.'
        },
        {
          stepNumber: 2,
          title: '식사 마무리 시점 서빙 요청',
          desc: '디저트 타임에 서버에게 말씀해 주시면 케이크 서빙, 촛불 라이터, 생일 전용 앞접시를 세팅해 드립니다.'
        },
        {
          stepNumber: 3,
          title: '기념일 축하 레터링 서비스 (선택)',
          desc: '사전 예약 시 요청하신 고객님께는 디저트 접시에 초콜릿 축하 레터링 서비스를 무료로 선사해 드립니다.'
        }
      ],
      checklist: [
        '케이크 외 외부 주류, 과일, 조리 음식 등 다른 외부 음식물 반입은 위생 사고 방지를 위해 엄격히 제한됩니다.'
      ],
      proTip: '1:1 문의 접수 시 주인공의 성함이나 축하 문구를 미리 남겨주시면 매장 웰컴 카드 또는 기념일 디저트 레터링을 무료로 준비해 드립니다.'
    },
    tags: ['#생일케이크반입', '#케이크냉장보관', '#기념일레터링', '#환갑기념식사'],
    directInquiryPrefill: {
      parentCategory: 'restaurant',
      subCategory: 'group_reservation',
      title: '[기념일 이벤트 사전 조율] 생일 케이크 반입 및 냉장 보관/레터링 요청',
      contentTemplate: '1. 매장명 및 예약 일시: \n2. 행사 목적: (생일 / 환갑 / 기념일)\n3. 케이크 반입 여부: 외부 맞춤 케이크 반입 및 냉장 보관 요청\n4. 요청 축하 레터링 문구: (예: "사랑하는 어머니 환갑을 축하드립니다")'
    }
  },
  {
    id: 'din-05',
    category: 'dining',
    categoryLabel: '외식/결제',
    iconName: 'CreditCard',
    subCategory: '법인카드/분할결제/주차',
    rankBadge: '외식 TOP 5 문의',
    resolutionRate: 98.8,
    avgResolutionTime: '현장 즉시 결제 처리',
    title: '법인카드 분할 결제, 영수증 품목별 상세 분할 출력 및 주차 정산 등록',
    questionScenario: '회사 부서 회식으로 100만 원이 나와 2개의 부서 법인카드로 각각 50만 원씩 나누어 결제해야 합니다. 메뉴별 상세 내역이 찍힌 영수증 발급과 4대 차량 무료 주차 등록이 되나요?',
    officialAnswer: {
      summary: '여러 장의 법인카드/개인카드 금액 분할 결제 및 인원별 N분의 1 결제가 포스 시스템에서 즉시 가능하며, 회사 회계 증빙용 메뉴 상세 내역서 및 건물 주차 관리 시스템에 전 차량 무료 주차권(최대 2~3시간)이 등록됩니다.',
      steps: [
        {
          stepNumber: 1,
          title: '결제 전 분할 방식 안내',
          desc: '카드별 결제 희망 금액(예: A카드 50만 원, B카드 50만 원)을 결제 전 카운터에 말씀해 주세요.'
        },
        {
          stepNumber: 2,
          title: '회계 증빙용 상세 메뉴 주문서 출력',
          desc: '신용카드 매출전표와 함께 단가와 수량이 명시된 [상세 주문 내역서]를 함께 출력해 드립니다.'
        },
        {
          stepNumber: 3,
          title: '차량 번호 일괄 주차 등록',
          desc: '참석하신 동행자 차량 번호 4자리를 카운터 태블릿에 입력하시면 즉시 사전 주차 정산이 완료됩니다.'
        }
      ],
      checklist: [
        '주차 정산은 출차 전 미리 등록해 주셔야 게이트 출차 시 요금이 부과되지 않습니다.'
      ],
      proTip: '회사 사전 품의용으로 견적서가 먼저 필요하신 경우 1:1 문의를 남겨주시면 매장 공식 직인 견적서를 PDF로 보내드립니다.'
    },
    tags: ['#법인카드분할결제', '#상세품목영수증', '#무료주차등록', '#회식회계증빙'],
    directInquiryPrefill: {
      parentCategory: 'restaurant',
      subCategory: 'group_reservation',
      title: '[결제 및 주차 사전 확인] 법인카드 분할 결제 및 상세 견적서 요청',
      contentTemplate: '1. 매장명 및 방문 일시: \n2. 결제 방식: (법인카드 2장 분할 결제 예정)\n3. 필요 서류: 회사 제출용 메뉴 상세 내역서 및 영수증\n4. 주차 예정 차량 대수: 0대'
    }
  },

  // ==================== [4] 일반 (General / Platform / Security) - 5 items ====================
  {
    id: 'gen-01',
    category: 'general',
    categoryLabel: '일반/계정',
    iconName: 'UserCog',
    subCategory: '계정정보/간편로그인',
    rankBadge: '일반 TOP 1 최다 문의 🔥',
    resolutionRate: 99.3,
    avgResolutionTime: '즉시 셀프 해결',
    title: '회원 계정 정보(휴대폰 번호/이메일) 변경 및 간편 로그인 연동 해제',
    questionScenario: '휴대폰 번호가 바뀌어 인증 문자를 받을 수 없습니다. 또한 기존 카카오 로그인 대신 네이버나 일반 이메일 로그인으로 변경하여 연동하고 싶은데 어떻게 해야 하나요?',
    officialAnswer: {
      summary: '마이페이지 [보안 및 계정 관리]에서 본인 명의 새 휴대폰 번호로 1회 인증 시 즉시 번호가 변경되며, 기존 카카오/네이버/구글 간편 로그인 연동 해제 및 일반 비밀번호 로그인을 손쉽게 전환할 수 있습니다.',
      steps: [
        {
          stepNumber: 1,
          title: '계정 관리 메뉴 진입',
          desc: '우측 상단 프로필 클릭 후 [내 정보 수정 / 보안 센터]로 이동합니다.'
        },
        {
          stepNumber: 2,
          title: '새 휴대폰 번호 인증',
          desc: '[연락처 변경]을 누르고 새 휴대폰으로 수신된 6자리 번호를 인증하면 과거 모든 주문 및 문의 내역이 안전하게 유지됩니다.'
        },
        {
          stepNumber: 3,
          title: '소셜 로그인 연동 해제/추가',
          desc: '연동을 원치 않는 소셜 계정의 [연동 해제]를 누르고 새 이메일과 비밀번호를 설정하시면 됩니다.'
        }
      ],
      checklist: [
        '기존 휴대폰 번호를 이미 분실하여 본인 인증이 불가능하신 경우 1:1 고객센터에 신분증 본인 확인 후 수동 변경을 지원합니다.'
      ],
      proTip: '구글, 카카오 등 2개 이상의 간편 로그인을 함께 연결해 두시면 스마트폰 분실 시에도 PC에서 언제든 막힘없이 로그인하실 수 있습니다.'
    },
    tags: ['#휴대폰번호변경', '#소셜로그인연동해제', '#계정보안', '#카카오로그인'],
    directInquiryPrefill: {
      parentCategory: 'other',
      subCategory: 'general_feedback',
      title: '[계정 정보 수정 요청] 이전 번호 분실로 인한 수동 휴대폰 번호 갱신',
      contentTemplate: '1. 가입 아이디(이메일): \n2. 기존 등록된 번호: \n3. 변경할 새 휴대폰 번호: \n4. 본인 확인 요청 사유: 기기 분실/통신사 번호 이동'
    }
  },
  {
    id: 'gen-02',
    category: 'general',
    categoryLabel: '일반/인증',
    iconName: 'Fingerprint',
    subCategory: '본인인증오류/대체수단',
    rankBadge: '일반 TOP 2 문의',
    resolutionRate: 98.2,
    avgResolutionTime: '즉시 대체 인증',
    title: '본인 인증 오류(통신사/외국인 등록번호/PASS 앱) 발생 시 대체 인증법',
    questionScenario: '알뜰폰을 사용 중인데 PASS 앱이나 SMS 문자가 오지 않아 가입 및 문의 접수 단계에서 본인 인증이 넘어가지 않습니다. 외국인 등록번호나 법인폰 사용자도 인증이 가능한가요?',
    officialAnswer: {
      summary: '알뜰폰(MVNO) 이용 시 알뜰폰 전용 통신사(SKT/KT/LGU+ 알뜰폰)를 정확히 선택하셔야 하며, 법인 명의 폰이나 외국인 등록번호의 경우 공동인증서, 금융인증서, 또는 등록 이메일 2차 핀코드 대체 인증을 지원합니다.',
      steps: [
        {
          stepNumber: 1,
          title: '알뜰폰 통신망 세부 선택',
          desc: '통신 3사 탭이 아닌 [알뜰폰] 라디오 버튼을 선택 후 세부 망사업자를 지정해 주세요.'
        },
        {
          stepNumber: 2,
          title: 'PASS 앱 푸시 대신 SMS 문자 인증 선택',
          desc: 'PASS 앱 연동 지연 시 화면 하단 [문자(SMS)로 인증하기]를 클릭하시면 10초 내 문자가 도착합니다.'
        },
        {
          stepNumber: 3,
          title: '법인폰/외국인 대체 인증',
          desc: '법인폰 이용자는 통신사 법인명의 본인확인 서비스에 등록되어 있거나 금융인증서 대체 인증 탭을 이용하시면 됩니다.'
        }
      ],
      checklist: [
        '스마트폰 스팸 필터링 앱(T스팸필터 등)에서 1600/1588 번호가 차단되어 있는지 확인해 주세요.',
        '외국인 등록증 소지자는 통신사에 등록된 영문 성명(대소문자, 띄어쓰기)과 완벽히 일치해야 인증됩니다.'
      ],
      proTip: '크롬 브라우저 시크릿 창이나 팝업 차단이 켜져 있는 경우 인증 팝업이 차단될 수 있으니 팝업 허용 설정을 확인하세요.'
    },
    tags: ['#본인인증오류', '#알뜰폰PASS인증', '#외국인등록번호', '#법인폰인증'],
    directInquiryPrefill: {
      parentCategory: 'other',
      subCategory: 'widget_api',
      title: '[본인 인증 장애 접수] 알뜰폰/외국인 통신사 인증 실패 대체 승인 요청',
      contentTemplate: '1. 가입 성함: \n2. 이용 통신사: (예: KT M모바일, 리브엠 등)\n3. 오류 발생 증상: (SMS 미수신 / 통신사 불일치 오류 코드)\n4. 스크린샷 유무: '
    }
  },
  {
    id: 'gen-03',
    category: 'general',
    categoryLabel: '일반/회원',
    iconName: 'UserX',
    subCategory: '휴면계정/회원탈퇴',
    rankBadge: '일반 TOP 3 문의',
    resolutionRate: 99.7,
    avgResolutionTime: '즉시 자동 해제',
    title: '휴면 계정 복구 및 탈퇴 시 적립금/보유 쿠폰 소멸 유예 안내',
    questionScenario: '1년 넘게 접속하지 않아 휴면 계정으로 잠겨있습니다. 로그인만 하면 기존 포인트가 그대로 남아있나요? 회원 탈퇴 후 재가입하면 이전 데이터가 유지되나요?',
    officialAnswer: {
      summary: '휴면 계정은 로그인 시 [휴면 해제] 버튼을 누르면 별도 서류 없이 즉시 활성화되며 잔여 포인트와 이용 내역이 그대로 복원됩니다. 단, 회원 탈퇴를 완료할 경우 전자상거래법에 따른 법정 보관 내역을 제외한 모든 포인트와 쿠폰은 즉시 영구 파기되어 복구가 불가능합니다.',
      steps: [
        {
          stepNumber: 1,
          title: '휴면 계정 즉시 해제',
          desc: '기존 아이디/비밀번호로 로그인 시 뜨는 [휴면 계정 복구 확인]을 클릭하시면 1초 만에 정상 활성화됩니다.'
        },
        {
          stepNumber: 2,
          title: '유효기간 잔여 포인트 확인',
          desc: '포인트 자체의 유효기간(통상 적립일로부터 1~2년)이 지나지 않은 포인트는 그대로 복원되어 바로 사용하실 수 있습니다.'
        },
        {
          stepNumber: 3,
          title: '탈퇴 전 유의사항',
          desc: '탈퇴 시 진행 중인 주문, A/S, 미해결 문의가 있는 경우 처리가 완료된 후 탈퇴가 가능합니다.'
        }
      ],
      checklist: [
        '탈퇴 완료 후에는 동일 휴대폰 번호나 이메일로 30일간 재가입이 제한됩니다 (부정 가입 방지).',
        '탈퇴 전 보유하신 현금성 예치금은 본인 계좌로 전액 환불 인출 후 탈퇴해 주세요.'
      ],
      proTip: '임시로 서비스를 이용하지 않으실 경우 탈퇴 대신 마케팅 수신 알림만 꺼두시면 포인트 소멸 없이 언제든 재방문하실 수 있습니다.'
    },
    tags: ['#휴면계정해제', '#회원탈퇴주의사항', '#포인트소멸', '#재가입제한'],
    directInquiryPrefill: {
      parentCategory: 'other',
      subCategory: 'general_feedback',
      title: '[휴면 계정 및 탈퇴 문의] 잔여 포인트 조회 및 휴면 계정 복구 확인',
      contentTemplate: '1. 회원 아이디: \n2. 가입 시 등록 휴대폰 번호: \n3. 문의 내용: 장기 미접속 휴면 해제 및 잔여 포인트 유효기간 확인'
    }
  },
  {
    id: 'gen-04',
    category: 'general',
    categoryLabel: '일반/개인정보',
    iconName: 'ShieldCheck',
    subCategory: '수신동의/개인정보열람',
    rankBadge: '일반 TOP 4 문의',
    resolutionRate: 99.8,
    avgResolutionTime: '즉시 설정 반영',
    title: '개인정보 이용 내역 통지 확인 및 마케팅(SMS/앱 푸시) 수신 동의/철회 설정',
    questionScenario: '매년 날아오는 개인정보 이용 내역 이메일이 무엇인가요? 또한 프로모션이나 할인 이벤트 광고 문자를 그만 받고 싶은데 어디서 끄나요?',
    officialAnswer: {
      summary: '개인정보 이용 내역 통지는 정보통신망법 제30조의2에 따라 서비스 제공자가 연 1회 이용자에게 수집 항목과 이용 목적을 투명하게 안내하는 법정 의무 공지입니다. 마케팅 수신 거부는 [마이페이지 -> 알림 설정]에서 원클릭으로 철회하실 수 있습니다.',
      steps: [
        {
          stepNumber: 1,
          title: '알림 설정 페이지 이동',
          desc: '설정 메뉴 내 [마케팅 정보 수신 설정]으로 들어갑니다.'
        },
        {
          stepNumber: 2,
          title: '채널별 선택 거부 (SMS / 이메일 / 앱 푸시)',
          desc: '광고성 알림 토글을 OFF로 전환하시면 즉시 발송 대상자 목록에서 제외됩니다.'
        },
        {
          stepNumber: 3,
          title: '필수 거래성 알림 유지 안내',
          desc: '결제 영수증, 배송 상황, 1:1 문의 답변 알림 등 고객 보호를 위한 필수 거래성 정보는 안전하게 계속 수신됩니다.'
        }
      ],
      checklist: [
        '수신 거부 처리 후 시스템 동기화 시차로 인해 최대 24시간 내 이미 예약된 문자가 1회 수신될 수 있습니다.'
      ],
      proTip: '야간(21:00 ~ 익일 08:00)에는 법적으로 모든 마케팅 알림이 전면 자동 차단되므로 안심하셔도 좋습니다.'
    },
    tags: ['#마케팅수신거부', '#개인정보이용내역', '#광고문자차단', '#알림설정'],
    directInquiryPrefill: {
      parentCategory: 'other',
      subCategory: 'general_feedback',
      title: '[알림 수신 설정] 마케팅 수신 일괄 철회 및 개인정보 이용 내역 확인',
      contentTemplate: '1. 회원 이메일: \n2. 연락처: \n3. 요청 사항: SMS 및 이메일 마케팅 정보 수신 일괄 철회 요청'
    }
  },
  {
    id: 'gen-05',
    category: 'general',
    categoryLabel: '일반/시스템',
    iconName: 'Bug',
    subCategory: '오류신고/앱버그/보상',
    rankBadge: '일반 TOP 5 문의',
    resolutionRate: 97.5,
    avgResolutionTime: '즉시 기술팀 대응',
    title: '서비스 이용 중 버그/시스템 오류 발생 시 스크린샷 접수 및 보상 기준',
    questionScenario: '결제 진행 중 화면이 멈추면서 금액만 빠져나가고 주문 내역에는 나타나지 않습니다. 브라우저 캐시 삭제는 어떻게 하며 오류 발생 시 어떻게 보상받나요?',
    officialAnswer: {
      summary: '네트워크 순단 또는 결제 모듈 통신 오류로 결제 승인 후 주문 생성이 누락된 경우, 카드사 자동 대조 시스템에 의해 30분 내 자동 망취소(승인 취소)되거나 관리자가 수동 주문을 즉시 생성해 드립니다. 시스템 장애로 인한 불편 시 죄송한 마음을 담아 할인 쿠폰을 보상 지급합니다.',
      steps: [
        {
          stepNumber: 1,
          title: '브라우저 캐시 및 앱 데이터 새로고침',
          desc: '모바일 앱을 완전히 종료 후 재실행하거나 브라우저 캐시(Ctrl+Shift+R)를 새로고침해 봅니다.'
        },
        {
          stepNumber: 2,
          title: '오류 화면 캡처 및 결제 승인 문자 확인',
          desc: '카드 결제 문자(승인 번호, 금액)와 오류가 발생한 화면을 캡처해 주세요.'
        },
        {
          stepNumber: 3,
          title: '1:1 긴급 기술 지원 접수',
          desc: '하단 문의하기로 접수해 주시면 기술 지원팀이 결제 게이트웨이(PG사) 로그를 조회하여 1시간 내 취소 또는 주문 정상화를 완료합니다.'
        }
      ],
      checklist: [
        '통신사 점검 시간(매일 23:55 ~ 00:30)에는 금융사 서버 점검으로 결제 순단이 발생할 수 있습니다.'
      ],
      proTip: '오류 문의 접수 시 사용 중이신 기기 모델명(예: 갤럭시 S24, 아이폰 15)과 브라우저(크롬, 사파리)를 적어주시면 원인 분석이 배로 빨라집니다.'
    },
    tags: ['#결제오류복구', '#시스템장애보상', '#망취소자동환불', '#버그접수'],
    directInquiryPrefill: {
      parentCategory: 'other',
      subCategory: 'widget_api',
      title: '[긴급 결제 오류 제보] 결제 승인 후 주문서 미생성 장애 확인 요청',
      contentTemplate: '1. 결제 발생 일시: \n2. 결제 수단 및 승인 금액: (예: 신한카드 / 48,000원)\n3. 승인 번호: \n4. 이용 기기 및 브라우저 환경: (예: 아이폰 사파리)\n5. 스크린샷: 카드 결제 문자 첨부'
    }
  },

  // ==================== [5] 기타 (Other / Partnership / Special) - 5 items ====================
  {
    id: 'oth-01',
    category: 'other',
    categoryLabel: '기타/입점',
    iconName: 'Building',
    subCategory: '입점제안/파트너십',
    rankBadge: '기타 TOP 1 최다 제휴 문의 🔥',
    resolutionRate: 99.0,
    avgResolutionTime: '영업일 2일 내 전담 MD 피드백',
    title: '신규 파트너사 입점 및 B2B 제휴 제안 프로세스 (심사 기준 및 구비 서류)',
    questionScenario: '당사의 우수한 프리미엄 식품/패션 상품을 InquireHub 제휴 몰에 정식 입점하거나 제휴 파트너로 등록하여 고객 문의에 직접 응대하고 싶습니다. 입점 심사 절차와 수수료 조건은 어떻게 되나요?',
    officialAnswer: {
      summary: '공식 제휴 파트너 입점은 [온라인 제안서 접수 -> 카테고리별 전문 MD 심사(영업일 2일 내) -> 수수료 협의 및 전자계약 체결 -> 전용 파트너 스튜디오 개정 부여]의 투명한 4단계 원스톱으로 진행됩니다.',
      steps: [
        {
          stepNumber: 1,
          title: '회사 소개서 및 상품 카탈로그 제출',
          desc: '사업자등록증, 통신판매업신고증 사본 및 취급 품목 제안서를 1:1 문의로 접수합니다.'
        },
        {
          stepNumber: 2,
          title: '전담 카테고리 MD 배정 및 실사',
          desc: '쇼핑, 여가, 외식 등 각 분야 전문 MD가 품질, 배송 역량, CS 응대 프로세스를 검토 후 개별 유선 미팅을 진행합니다.'
        },
        {
          stepNumber: 3,
          title: '전자 표준 계약 체결 및 파트너 콘솔 개방',
          desc: '최종 승인 시 [파트너 문의 답변 스튜디오] 접근 권한이 부여되어 고객 유치 및 실시간 답변을 즉시 개시할 수 있습니다.'
        }
      ],
      checklist: [
        '식품의 경우 시험성적서 및 제조 위생 인증(HACCP) 서류 구비가 필수입니다.',
        '위탁 판매와 직매입 등 희망하시는 정산 모델을 제안서에 명시해 주시면 협의가 훨씬 신속해집니다.'
      ],
      proTip: '기존 타 이커머스 플랫폼 또는 오프라인 매장 운영 실적(월 매출, 리뷰 평점)을 첨부하시면 패스트트랙 심사 혜택을 받으실 수 있습니다.'
    },
    tags: ['#파트너입점심사', '#B2B제휴제안', '#카테고리MD', '#파트너스튜디오권한'],
    requiredDocs: ['사업자등록증', '통신판매업신고증', '회사소개서/상품제안서'],
    directInquiryPrefill: {
      parentCategory: 'other',
      subCategory: 'marketing',
      title: '[신규 파트너 입점 제안] 카테고리 공식 제휴처 등록 신청',
      contentTemplate: '1. 회사명(상호): \n2. 사업자등록번호: \n3. 주요 취급 상품/서비스 카테고리: (쇼핑 / 여가 / 외식 / 기타)\n4. 자사몰 또는 공식 판매처 URL: \n5. 제휴 제안 핵심 요약: \n6. 담당자 성함, 직함, 연락처, 이메일: '
    }
  },
  {
    id: 'oth-02',
    category: 'other',
    categoryLabel: '기타/마케팅',
    iconName: 'Sparkles',
    subCategory: '인플루언서/SNS협찬',
    rankBadge: '기타 TOP 2 문의',
    resolutionRate: 98.4,
    avgResolutionTime: '3영업일 내 검토',
    title: '인플루언서·유튜브 크리에이터 협찬 및 마케팅 프로모션 협업 문의 절차',
    questionScenario: '팔로워 5만 명 이상의 인스타그램/유튜브/블로그 채널을 운영하는 인플루언서입니다. 신규 상품 리뷰 협찬, 할인 공동구매 프로모션, 또는 앰버서더 협업을 제안하고 싶습니다.',
    officialAnswer: {
      summary: '진정성 있는 콘텐츠를 제작해 주실 모든 크리에이터 분들의 협업을 진심으로 환영합니다. 채널 링크와 콘텐츠 포트폴리오를 제휴 창구로 접수해 주시면 마케팅팀에서 타겟 고객군과 매칭 후 시딩 제품 및 제휴 혜택을 안내드립니다.',
      steps: [
        {
          stepNumber: 1,
          title: '운영 채널 및 타겟 오디언스 통계 접수',
          desc: 'SNS 채널 URL, 구독자/팔로워 수, 주력 콘텐츠 장르 및 희망 협찬 품목을 접수해 주세요.'
        },
        {
          stepNumber: 2,
          title: '마케팅 기획팀 콘텐츠 적합도 검토',
          desc: '월간 마케팅 캠페인 테마와의 시너지, 팔로워 인게이지먼트율을 검토하여 3영업일 내 피드백을 전달합니다.'
        },
        {
          stepNumber: 3,
          title: '무상 협찬품 발송 및 전용 할인 코드 발급',
          desc: '선정 시 리뷰 제작용 제품 100% 무상 제공과 함께 구독자 전용 특별 할인 쿠폰 코드를 지원합니다.'
        }
      ],
      checklist: [
        '공정거래위원회 추천·보증 심사 지침에 따라 [경제적 대가 제공(협찬/유료광고)] 문구 표기가 필수입니다.'
      ],
      proTip: '단순 제품 협찬 외에 구독자 대상 댓글 이벤트 또는 기획전 아이디어를 함께 제안해 주시면 우선 협업 대상자로 선정됩니다.'
    },
    tags: ['#인플루언서협찬', '#크리에이터협업', '#공동구매제안', '#체험단지원'],
    directInquiryPrefill: {
      parentCategory: 'other',
      subCategory: 'marketing',
      title: '[크리에이터 마케팅 협업 제안] 인플루언서 제품 협찬 및 프로모션 기획안',
      contentTemplate: '1. 크리에이터 활동명: \n2. 운영 채널 URL: (유튜브 / 인스타그램 / 틱톡 / 블로그)\n3. 팔로워/구독자 수 및 월간 조회수: \n4. 희망 협업 분야: (제품 무상 협찬 리뷰 / 구독자 할인 공구 / 앰버서더)\n5. 담당자 연락처: '
    }
  },
  {
    id: 'oth-03',
    category: 'other',
    categoryLabel: '기타/기업복지',
    iconName: 'Gift',
    subCategory: '복지몰/대량모바일상품권',
    rankBadge: '기타 TOP 3 문의',
    resolutionRate: 99.3,
    avgResolutionTime: '당일 B2B 특별 견적서 발송',
    title: '사내 임직원 복지몰 연동(API/SSO) 및 대량 모바일 상품권 구매 할인율',
    questionScenario: '사내 명절 선물 및 임직원 창립기념일 복지 포인트 지급을 위해 모바일 상품권을 5,000만 원어치 대량 구매하고자 합니다. 구매 금액대별 할인율과 사내 복지 시스템 API 연동이 가능한가요?',
    officialAnswer: {
      summary: '1,000만 원 이상 대량 B2B 법인 구매 시 구매 금액대별 최대 5%~12% 특별 할인율이 적용되며, 기업 인사·총무팀을 위한 대량 MMS 일괄 발송 시스템 및 자사 복지몰 자동 주문 연동 API/SSO 표준 규격을 제공합니다.',
      steps: [
        {
          stepNumber: 1,
          title: '예상 구매 규모 및 희망 상품군 접수',
          desc: '필요한 총 예산, 예상 수량, 지급 희망 일자를 기재하여 B2B 견적을 요청합니다.'
        },
        {
          stepNumber: 2,
          title: '법인 맞춤 단가 및 대량 할인 견적서 수신',
          desc: '접수 당일 법인 전담팀에서 할인율이 적용된 공식 B2B 견적서와 상품 목록을 회신합니다.'
        },
        {
          stepNumber: 3,
          title: 'MMS 즉시 예약 발송 또는 API 연동 키 발급',
          desc: '지정 일시에 임직원 휴대폰 번호로 예약 발송되며, 복지몰 연동 시 실시간 재고 연동 API 토큰을 발급해 드립니다.'
        }
      ],
      checklist: [
        '대량 모바일 쿠폰의 유효기간은 법정 기본 1년 이상 보장되며, 만료 30일 전 임직원 대상 무료 알림톡이 전송됩니다.'
      ],
      proTip: '기업 로고와 대표이사 축하 메시지가 들어간 [맞춤형 커스텀 MMS 카드 디자인]을 무료로 제작해 드립니다.'
    },
    tags: ['#대량모바일상품권', '#임직원명절복지', '#B2B할인율', '#복지몰API연동'],
    directInquiryPrefill: {
      parentCategory: 'other',
      subCategory: 'widget_api',
      title: '[B2B 대량 구매/복지몰 연동] 모바일 상품권 대량 구매 견적 요청',
      contentTemplate: '1. 기업명: \n2. 구매 목적: (임직원 명절 복지 / 프로모션 경품)\n3. 예상 구매 예산 및 수량: (예: 3,000만 원 / 1,000명분)\n4. 희망 지급 일자: \n5. 사내 복지몰 API 연동 필요 유무: (필요 / 불필요)\n6. 담당자 연락처 및 이메일: '
    }
  },
  {
    id: 'oth-04',
    category: 'other',
    categoryLabel: '기타/사회공헌',
    iconName: 'HeartHandshake',
    subCategory: '비영리단체/CSR기부',
    rankBadge: '기타 TOP 4 문의',
    resolutionRate: 98.7,
    avgResolutionTime: '정기 심의 (월 2회)',
    title: '비영리 단체·사회공헌(CSR) 연계 티켓 기부 및 공익 행사 후원 요청 창구',
    questionScenario: '지역 아동센터 및 취약계층 청소년을 위한 문화체험 행사 후원을 기획 중입니다. 소외계층 아동들을 위한 전시/공연 무료 관람 티켓 지원이나 물품 후원을 연계받을 수 있나요?',
    officialAnswer: {
      summary: 'InquireHub는 지속 가능한 사회적 가치를 실현하고자 공식 비영리 사단법인, 사회복지공동모금회, 지역 아동복지시설과의 [나눔 동행 문화 티켓 기부 프로그램]을 상시 운영하고 있습니다.',
      steps: [
        {
          stepNumber: 1,
          title: '행사 기획안 및 비영리 고유번호증 제출',
          desc: '지원 대상 인원, 행사 취지, 기부금 영수증 발행 가능 여부가 포함된 공문/기획안을 접수합니다.'
        },
        {
          stepNumber: 2,
          title: 'CSR 파트너십 상생 위원회 심의',
          desc: '월 2회 정기 심의를 통해 입점 제휴사 및 본사 매칭 그랜트 후원 티켓/물품 배정을 확정합니다.'
        },
        {
          stepNumber: 3,
          title: '후원 물품/티켓 전달 및 결과 보고',
          desc: '선정 단체에 공식 티켓 바우처 전달 및 안전한 관람 지원 전담 매니저를 파견합니다.'
        }
      ],
      checklist: [
        '공식 지정기부금 단체 또는 비영리 민간단체 등록증을 보유한 기관에 한해 후원 심사가 진행됩니다.'
      ],
      proTip: '방문 희망 시기를 방학 기간이나 평일 낮 시간대로 설정해 주시면 제휴 문화재단과의 매칭 성공률이 매우 높아집니다.'
    },
    tags: ['#사회공헌CSR', '#문화티켓기부', '#소외계층후원', '#비영리단체나눔'],
    directInquiryPrefill: {
      parentCategory: 'other',
      subCategory: 'general_feedback',
      title: '[CSR 사회공헌 후원 요청] 취약계층 문화 나눔 티켓 지원 공문 접수',
      contentTemplate: '1. 기관/단체명: \n2. 고유번호(사업자번호): \n3. 행사명 및 후원 희망 일자: \n4. 지원 대상자: (예: 지역아동센터 아동 20명, 인솔교사 3명)\n5. 희망 후원 내용: (전시 관람 티켓 지원)\n6. 담당자 연락처: '
    }
  },
  {
    id: 'oth-05',
    category: 'other',
    categoryLabel: '기타/보안제보',
    iconName: 'ShieldAlert',
    subCategory: '부정거래/컴플라이언스',
    rankBadge: '기타 TOP 5 문의 (신속 보호)',
    resolutionRate: 99.9,
    avgResolutionTime: '즉시 계정 보호 조치',
    title: '비정상 이용 패턴 제보 및 내부 신문고(컴플라이언스/부정 결제) 운영',
    questionScenario: '내가 결제하지 않은 카드의 인증 문자가 오거나 타인이 내 계정을 도용하여 문의를 올린 정황이 발견되었습니다. 또한 제휴처의 부당한 추가 요금 요구를 익명으로 고발할 수 있나요?',
    officialAnswer: {
      summary: '고객님의 소중한 자산과 권익을 보호하기 위해 24시간 실시간 이상 거래 감지 시스템(FDS) 및 비밀 보장 직통 준법감시 신문고를 운영하고 있으며, 도용 의심 접수 즉시 해당 계정 잠금 및 결제 차단 조치가 실행됩니다.',
      steps: [
        {
          stepNumber: 1,
          title: '긴급 도용 계정 즉시 보호 잠금',
          desc: '1:1 긴급 제보 시 보안팀이 해당 계정의 접속 세션을 즉시 강제 만료하고 2차 비밀번호 변경을 안내합니다.'
        },
        {
          stepNumber: 2,
          title: 'FDS 부정 결제 즉시 승인 취소',
          desc: '피해 발생 거래가 확인될 경우 결제사 제휴 공조를 통해 고객 부담금 0원으로 즉시 환불/취소 조치합니다.'
        },
        {
          stepNumber: 3,
          title: '제휴처 부당 행위 엄벌 및 패널티',
          desc: '공식 가격 외 부당 요금 청구, 허위 리뷰 유도 등 불공정 행위 제휴처는 영구 퇴출 및 고발 조치됩니다.'
        }
      ],
      checklist: [
        '신문고 제보는 공익신고자 보호법에 따라 제보자의 신원이 100% 철저히 비밀 보장됩니다.'
      ],
      proTip: '도용 의심 문자나 이상 화면의 캡처를 함께 첨부해 주시면 사이버수사대 공조 수사 자료로 즉시 활용됩니다.'
    },
    tags: ['#부정결제신고', '#계정도용보호', '#컴플라이언스신문고', '#FDS보안센터'],
    directInquiryPrefill: {
      parentCategory: 'other',
      subCategory: 'general_feedback',
      title: '[보안/부정 거래 긴급 제보] 계정 도용 의심 및 부당 거래 신문고 접수',
      contentTemplate: '1. 피해 의심 아이디: \n2. 비정상 발생 일시: \n3. 피해 정황 상세: (타인 결제 시도 / 제휴처 부당 요금 요구 등)\n4. 긴급 계정 보호 조치 희망 여부: (즉시 계정 잠금 요청)'
    }
  },

  // ==================== [6] 법률/생활/소비자 권익 (Legal & Living) - 15 items ====================
  {
    id: 'legal-01',
    category: 'legal',
    categoryLabel: '법률/전자상거래',
    iconName: 'Scale',
    subCategory: '청약철회/환불거부',
    rankBadge: '법률 TOP 1 핵심 권리 ⚖️',
    resolutionRate: 99.5,
    avgResolutionTime: '즉시 법적 해석 안내',
    title: '전자상거래법상 7일 이내 단순 변심 청약철회 거부(환불 불가 특약) 대응 절차',
    questionScenario: '온라인 쇼핑몰 상세페이지에 [세일 상품, 수제화, 단순 변심 환불 절대 불가 사전 동의함]이라고 명시되어 있다는 이유로 7일 이내 반품 접수를 일방적으로 거부당했습니다. 법적으로 환불받을 수 없나요?',
    officialAnswer: {
      summary: '전자상거래 등에서의 소비자보호에 관한 법률 제17조 및 제35조(강행규정)에 의거하여, 판매자가 [환불 불가]를 사전 고지하거나 소비자가 동의했더라도 법률상 보장된 7일 이내 청약철회권을 배제하는 특약은 무효입니다.',
      steps: [
        {
          stepNumber: 1,
          title: '물품 수령 7일 이내 청약철회 의사표시 기록 확보',
          desc: '1:1 고객센터 문의 내역, 문자메시지, 내용증명 등으로 물품 수령일로부터 7일 이내에 환불을 요청한 객관적 증거를 남깁니다.'
        },
        {
          stepNumber: 2,
          title: '포장 단순 개봉과 훼손 구별',
          desc: '물품의 내용을 확인하기 위해 단순히 택배 박스나 포장을 개봉한 것은 법적으로 상품 가치 훼손으로 보지 않음을 판매자에게 고지합니다.'
        },
        {
          stepNumber: 3,
          title: '소비자원(1372) 및 공정위 신고 접수',
          desc: '판매자가 지속적으로 반품을 거부할 경우 한국소비자원 피해구제 신청 및 지자체 전자상거래 담당 부서에 법 위반 과태료 처분을 고발합니다.'
        }
      ],
      checklist: [
        '소비자의 주문에 따라 개별적으로 맞춤 생산되는 주문제작 상품(예: 맞춤 양복 등)은 청약철회가 제한될 수 있습니다.',
        '반품 배송비(소비자 부담)를 제외한 상품 결제 대금 전액은 물품 반환 후 3영업일 이내에 환불되어야 합니다.'
      ],
      proTip: '판매자가 [반품 불가 동의에 체크하셨습니다]라고 주장하더라도, 전자상거래법 제35조의 강행규정 위반으로 법적 효력이 전혀 없음을 단호히 밝히시면 대부분 자진 환불로 종결됩니다.'
    },
    tags: ['#청약철회7일', '#전자상거래법17조', '#환불불가특약무효', '#소비자원1372', '#강행규정'],
    requiredDocs: ['물품 수령일 확인 택배 송장', '7일 이내 환불 요청 대화 캡처본'],
    directInquiryPrefill: {
      parentCategory: 'other',
      subCategory: 'consumer_dispute',
      title: '[전자상거래 분쟁] 판매자의 7일 이내 단순 변심 청약철회 거부 중재 요청',
      contentTemplate: '1. 주문 일자 및 주문번호: \n2. 물품 수령 일자: \n3. 환불 요청 일자: \n4. 판매자 거부 사유: (환불 불가 사전 고지 주장 등)\n5. 상품 개봉 상태: (내용물 확인차 단순 개봉 등)'
    }
  },
  {
    id: 'legal-02',
    category: 'legal',
    categoryLabel: '법률/미성년자보호',
    iconName: 'ShieldAlert',
    subCategory: '미성년자결제/무단과금',
    rankBadge: '법률 TOP 2 최다 문의 ⚖️',
    resolutionRate: 98.9,
    avgResolutionTime: '당일 서류 검토 및 취소',
    title: '미성년자(만 19세 미만) 자녀의 법정대리인 동의 없는 고액 결제 취소권(민법 제5조)',
    questionScenario: '만 14세 중학생 자녀가 부모의 휴대폰이나 카드를 이용해 80만 원 상당의 인앱 아이템/디지털 바우처를 결제했습니다. 부모 동의 없이 이루어진 미성년자 계약을 소급해서 취소하고 환불받을 수 있나요?',
    officialAnswer: {
      summary: '민법 제5조 제2항에 따라 법정대리인의 명시적 동의 없는 미성년자의 법률행위는 취소할 수 있으며, 취소 시 계약은 처음부터 무효가 되어 전액 환불받을 수 있습니다. 단, 미성년자가 성년자로 속이기 위한 적극적 기망행위가 없었음이 소명되어야 합니다.',
      steps: [
        {
          stepNumber: 1,
          title: '가족관계증명서 및 미성년자 본인 신원 증빙 준비',
          desc: '자녀의 만 나이와 법정대리인(부모) 관계를 소명하는 가족관계증명서(상세)를 준비합니다.'
        },
        {
          stepNumber: 2,
          title: '법정대리인 미동의 결제 취소권 행사 서면 접수',
          desc: '플랫폼 고객센터 또는 결제대행사(PG)에 [민법 제5조 미성년자 법률행위 취소 통지서]를 접수합니다.'
        },
        {
          stepNumber: 3,
          title: '결제 취소 및 자녀 명의 계정 재발 방지 보호 설정',
          desc: '취소 승인 후 환불이 완료되면 부모 결제 비밀번호 강화 및 자녀 단말기 결제 한도를 차단합니다.'
        }
      ],
      checklist: [
        '자녀가 부모의 신분증과 본인인증 번호를 적극적으로 도용하여 성인 인증을 마친 경우 기망행위로 인정되어 취소가 제한될 수 있습니다.',
        '구글 플레이, 애플 앱스토어의 경우 최초 1회에 한해 미동의 결제 건에 대해 우호적인 환불 심사를 제공합니다.'
      ],
      proTip: '결제 시점 전후로 부모가 결제 사실을 인지하지 못했다는 정황(결제 즉시 항의 내역 등)을 소명하면 심사 통과율이 99%에 달합니다.'
    },
    tags: ['#미성년자결제취소', '#민법제5조', '#법정대리인동의', '#인앱결제환불', '#청소년보호'],
    requiredDocs: ['가족관계증명서(상세)', '법정대리인 신분증 사본', '결제 내역서'],
    directInquiryPrefill: {
      parentCategory: 'other',
      subCategory: 'minor_cancellation',
      title: '[미성년자 결제 취소 요청] 법정대리인 동의 없는 결제 건 민법 제5조 취소권 행사',
      contentTemplate: '1. 결제 일시 및 결제 금액: \n2. 결제한 미성년자 생년월일: (만 OO세)\n3. 법정대리인(부/모) 성명 및 연락처: \n4. 결제 발생 경위: (부모 단말기 무단 사용 등)\n5. 첨부 서류: 가족관계증명서'
    }
  },
  {
    id: 'legal-03',
    category: 'legal',
    categoryLabel: '법률/생활서비스',
    iconName: 'FileText',
    subCategory: '헬스장/학원/계약해지',
    rankBadge: '생활분쟁 TOP 1 🏋️',
    resolutionRate: 98.4,
    avgResolutionTime: '공식 산식 중재 (1일)',
    title: '헬스장/필라테스/PT/학원 등 계속거래 중도 계약 해지 시 위약금(10%) 한도 및 환불 산정',
    questionScenario: '6개월 120만 원(정상가 200만 원)으로 헬스장과 PT를 계약하고 2주 다닌 뒤 개인 사정으로 환불을 요구했더니, [할인 이벤트 적용 상품이므로 정상가 일할 계산 및 위약금 40%]를 공제하여 남는 돈이 없다고 합니다. 적법한가요?',
    officialAnswer: {
      summary: '방문판매 등에 관한 법률 제31조 및 공정거래위원회 [계속거래 등의 해지·해제에 따른 위약금 및 대금의 환급에 관한 고시]에 따라, 소비자는 언제든지 계약을 중도 해지할 수 있으며 위약금은 총 결제 대금의 10%를 초과할 수 없습니다. 또한 이용료 공제는 [정상가]가 아닌 [실제 결제한 할인 금액]을 기준으로 일할 계산되어야 합니다.',
      steps: [
        {
          stepNumber: 1,
          title: '실제 결제 금액 기준 이용료 산정',
          desc: '총 결제 금액을 총 계약 일수(또는 회수)로 나눈 1회(1일)당 실제 단가에 이용 일수를 곱하여 기이용료를 계산합니다.'
        },
        {
          stepNumber: 2,
          title: '법정 위약금 상한(10%) 적용',
          desc: '총 계약 금액의 최대 10%까지만 위약금으로 공제하고, 나머지 잔여액은 3영업일 이내 반환을 요구합니다.'
        },
        {
          stepNumber: 3,
          title: '사업자 불응 시 한국소비자원 피해구제 접수',
          desc: '약관 규제에 관한 법률 위반 불공정 약관임을 지적하는 내용증명을 발송하고 소비자원 피해구제를 신청합니다.'
        }
      ],
      checklist: [
        '계약서에 [이벤트 특가 환불 불가], [정상가 기준 공제] 조항이 있더라도 법률 고시보다 소비자에게 불리한 조항은 무효입니다.',
        '락커룸비, 운동복 대여료 등 부가 이용료도 동일하게 실이용일 기준 정산 대상입니다.'
      ],
      proTip: '공정거래위원회 계속거래 고시 제5조 조항을 문자로 발송하며 "정상가가 아닌 실결제액 기준 일할 차감 및 위약금 10% 공제 잔여액을 반환해 달라"고 명시하면 분쟁이 신속히 타결됩니다.'
    },
    tags: ['#헬스장환불', '#PT계약해지', '#위약금10퍼센트', '#계속거래고시', '#공정위환불기준'],
    requiredDocs: ['계약서 사본 또는 영수증', '이용 일수/횟수 증빙 기록'],
    directInquiryPrefill: {
      parentCategory: 'other',
      subCategory: 'fitness_refund',
      title: '[계속거래 중도 해지 분쟁] 헬스장/학원 법정 위약금 상한 및 잔여금 환불 중재',
      contentTemplate: '1. 시설/업체명: \n2. 계약 일자 및 총 결제 금액: \n3. 총 계약 기간(또는 PT 횟수): \n4. 실제 이용 일수/횟수: \n5. 업체 측 요구 위약금: \n6. 공정위 기준 환불 요청 금액: '
    }
  },
  {
    id: 'legal-04',
    category: 'legal',
    categoryLabel: '법률/부동산/임대차',
    iconName: 'Building2',
    subCategory: '전월세/보증금반환',
    rankBadge: '주거권익 TOP 1 🏠',
    resolutionRate: 97.8,
    avgResolutionTime: '법적 절차 로드맵 안내',
    title: '원룸/오피스텔 임대차 계약 만료 후 전세/월세 보증금 미반환 시 대처(임차권등기명령)',
    questionScenario: '임대차 계약 만료 3개월 전에 갱신 거절을 통보하고 퇴거일이 되었는데, 임대인(집주인)이 "다음 세입자가 들어와야 돈을 줄 수 있다"며 보증금 반환을 거부합니다. 새 집으로 이사 가야 하는데 대항력을 유지하려면 어떻게 해야 하나요?',
    officialAnswer: {
      summary: '주택임대차보호법 제3조의3에 의거하여, 계약 만료 후 보증금을 돌려받지 못한 임차인은 관할 법원에 [임차권등기명령]을 신청하여 등기부에 기재된 후 이사를 가야 기존의 우선변제권과 대항력이 100% 온전히 유지됩니다. 또한 만료일 다음 날부터 연 5%(소송 시 연 12%)의 법정 지연손해금을 청구할 수 있습니다.',
      steps: [
        {
          stepNumber: 1,
          title: '계약 해지 통보 증거 확보',
          desc: '만료 2~6개월 전 집주인에게 계약 갱신 거절 의사를 밝힌 카카오톡, 문자메시지 또는 내용증명 우편을 준비합니다.'
        },
        {
          stepNumber: 2,
          title: '관할 법원 임차권등기명령 전자 신청',
          desc: '대한민국 법원 전자소송(ecfs.go.kr) 사이트에서 임대차계약서 확정일자, 주민등록초본을 첨부하여 신청합니다 (신청 비용은 임대인에게 청구 가능).'
        },
        {
          stepNumber: 3,
          title: '등기부등본 기재 확인 후 이사 및 지급명령 진행',
          desc: '부동산 등기부등본 을구에 임차권등기가 완료된 것을 확인한 후 주민등록을 이전하고, 지급명령 신청을 통해 강제집행 권원을 확보합니다.'
        }
      ],
      checklist: [
        '임차권등기가 등기부에 실제로 기재되기 전에 미리 전출(주민등록 이전)을 하면 대항력이 상실되므로 절대 주의해야 합니다.',
        'HUG(주택도시보증공사) 또는 SGI 전세보증금반환보증에 가입된 경우 즉시 이행청구 심사로 전액 대위변제받을 수 있습니다.'
      ],
      proTip: '임차권등기가 경료되면 등기부등본이 훼손되어 다른 세입자를 구하기 극히 어려워지므로, 집주인에게 "임차권등기명령 접수 완료 통지"를 전달하는 것만으로도 대출을 받아 즉시 반환하는 경우가 많습니다.'
    },
    tags: ['#보증금미반환', '#임차권등기명령', '#주택임대차보호법', '#지연이자청구', '#전세사기예방'],
    requiredDocs: ['임대차계약서(확정일자 포함)', '등기부등본', '주민등록초본', '해지통보 문자/내용증명'],
    directInquiryPrefill: {
      parentCategory: 'other',
      subCategory: 'lease_dispute',
      title: '[임대차 보증금 분쟁] 계약 만료 후 전월세 보증금 미반환에 따른 법적 구제 절차',
      contentTemplate: '1. 소재지 주소: \n2. 보증금 액수: \n3. 임대차 계약 기간: \n4. 갱신 거절 통보 일자 및 수단: \n5. 임대인 회신 내용: \n6. 임차권등기명령 및 지연이자 청구 진행 요청'
    }
  },
  {
    id: 'legal-05',
    category: 'legal',
    categoryLabel: '법률/생활환경',
    iconName: 'HelpCircle',
    subCategory: '층간소음/이웃사이센터',
    rankBadge: '생활분쟁 TOP 2 🔇',
    resolutionRate: 96.2,
    avgResolutionTime: '중재 신청 매뉴얼 제공',
    title: '아파트/공동주택 층간소음 분쟁 시 적법한 대처 요령(주거침입 방지) 및 공식 중재 절차',
    questionScenario: '위층의 야간 발망치 소리와 의자 끄는 소리로 일상생활이 불가능합니다. 홧김에 위층 문을 두드리거나 인터폰을 계속 걸면 제가 형사처벌을 받을 수 있나요? 합법적인 해결과 층간소음 이웃사이센터 중재 절차는 어떻게 되나요?',
    officialAnswer: {
      summary: '대법원 판례에 따라 위층 호실에 직접 들어가거나 현관문을 두드리는 행위, 초인종을 연속으로 누르는 행위는 주거침입 또는 스토킹처벌법 위반으로 처벌될 수 있습니다. 관리사무소 중재 → 데시벨(dB) 측정 기록 확보 → 환경부 [층간소음 이웃사이센터] 현장 진단 및 분쟁조정위원회를 거치는 것이 가장 합법적이고 강력한 해결책입니다.',
      steps: [
        {
          stepNumber: 1,
          title: '관리주체(관리사무소) 1차 공식 조사 요청',
          desc: '공동주택관리법 제79조에 따라 관리사무소에 소음 피해를 서면 접수하고 해당 세대 방문 권고를 요청합니다.'
        },
        {
          stepNumber: 2,
          title: '소음 일지 작성 및 스마트폰/소음측정기 기록',
          desc: '주간(등가소음도 39dB) / 야간(등가소음도 34dB) 기준을 초과하는 소음 발생 시각과 지속 시간을 2주 이상 꼼꼼히 기록합니다.'
        },
        {
          stepNumber: 3,
          title: '환경부 층간소음 이웃사이센터 무료 현장 진단 신청',
          desc: '국가소음정보시스템(noiseinfo.or.kr, 1661-2642)에 중재 상담 및 전문가 방문 소음 측정 서비스를 신청합니다.'
        }
      ],
      checklist: [
        '보복 소음 발생용 우퍼 스피커 설치는 경범죄처벌법 및 민사상 불법행위 손해배상 책임이 인정될 수 있으므로 피해야 합니다.',
        '전화 통화 및 문자 통지, 천장 가벼운 두드림 등은 법적으로 허용된 소극적 의사표시 범위에 속합니다.'
      ],
      proTip: '이웃사이센터의 전문 측정관이 직접 방문하여 측정한 공인 소음 성적서는 향후 중앙환경분쟁조정위원회 손해배상 청구 시 결정적인 증거 자료로 인정됩니다.'
    },
    tags: ['#층간소음해결', '#이웃사이센터', '#공동주택관리법', '#소음기준데시벨', '#환경분쟁조정'],
    requiredDocs: ['소음 피해 발생 일지', '관리사무소 중재 접수증'],
    directInquiryPrefill: {
      parentCategory: 'other',
      subCategory: 'noise_dispute',
      title: '[공동주택 층간소음 분쟁] 이웃사이센터 신청 및 환경분쟁조정 대응 자문',
      contentTemplate: '1. 거주 형태: (아파트 / 빌라 / 오피스텔)\n2. 소음 유형: (발걸음 진동 / 가구 끄는 소리 / 악기 등)\n3. 주 발생 시간대: (야간 OO시~OO시)\n4. 관리사무소 1차 중재 경과: \n5. 소음 측정 자료 보유 여부: '
    }
  },
  {
    id: 'legal-06',
    category: 'legal',
    categoryLabel: '법률/개인정보/IT',
    iconName: 'ShieldCheck',
    subCategory: '불법스팸/개인정보침해',
    rankBadge: '디지털권익 TOP 1 🛡️',
    resolutionRate: 98.7,
    avgResolutionTime: 'KISA 신고 연동 안내',
    title: '개인정보 불법 유출 및 무단 광고성 스팸(문자/전화) 수신 시 KISA 신고 및 손해배상',
    questionScenario: '가입한 적도 없는 사이트나 텔레마케팅 업체에서 내 실명과 전화번호를 부르며 대출 및 주식 리딩방 문자가 쏟아집니다. 내 개인정보가 불법으로 거래된 것 같은데 신고하고 법적으로 배상받을 수 있나요?',
    officialAnswer: {
      summary: '정보통신망 이용촉진 및 정보보호 등에 관한 법률 제50조 및 개인정보 보호법 제39조의2에 따라, 사전 수신 동의 없는 영리 목적 광고 전송은 최대 3천만 원의 과태료 처분 대상이며, 정보주체는 개인정보 유출에 대해 최대 300만 원 한도의 법정손해배상을 청구할 수 있습니다.',
      steps: [
        {
          stepNumber: 1,
          title: '스팸 수신 캡처 및 발신 번호 증빙 보관',
          desc: '(광고) 문구 미표기, 무료 수신거부 080 번호 미표기, 야간(21시~08시) 전송 내역 화면을 캡처합니다.'
        },
        {
          stepNumber: 2,
          title: 'KISA 불법스팸대응센터(118) 원클릭 신고',
          desc: '한국인터넷진흥원 불법스팸대응센터(spam.kisa.or.kr)에 발신 번호 및 전송 내용을 업로드하여 방송통신위원회 조사를 요청합니다.'
        },
        {
          stepNumber: 3,
          title: '개인정보 분쟁조정위원회 손해배상 조정 신청',
          desc: '내 정보를 무단 취득한 업체를 상대로 개인정보보호위원회(kopico.go.kr)에 분쟁조정을 신청하여 손해배상금(위자료) 지급을 청구합니다.'
        }
      ],
      checklist: [
        '휴대폰 단말기의 [스팸 신고] 기능을 누르면 KISA 서버로 원스톱 자동 전송되어 증거가 영구 보존됩니다.',
        '개인정보 수집 출처 요구권(개인정보 보호법 제20조)을 행사하여 어디서 내 정보를 획득했는지 밝히도록 요구할 수 있습니다.'
      ],
      proTip: '상대방에게 "개인정보 보호법 제20조에 따라 본인의 정보 수집 출처를 통지해 주시기 바라며, 불응 시 118 신고 및 과태료 고발 조치합니다"라고 답장하면 즉시 명단에서 영구 파기 처리됩니다.'
    },
    tags: ['#불법스팸신고118', '#개인정보침해배상', '#정보통신망법50조', '#법정손해배상', '#스팸문자차단'],
    requiredDocs: ['스팸 문자 원본 캡처본', '통화 녹음 파일'],
    directInquiryPrefill: {
      parentCategory: 'other',
      subCategory: 'privacy_infringement',
      title: '[개인정보 침해] 무단 스팸 전송 및 개인정보 불법 수집 신고/구제 신청',
      contentTemplate: '1. 스팸 발신 번호 및 발신 업체명: \n2. 수신 일시: \n3. 광고 내용: (대출/도박/주식/물품 등)\n4. (광고) 표시 및 080 수신거부 유무: \n5. 정보 수집 출처 고지 요구 결과: '
    }
  },
  {
    id: 'legal-07',
    category: 'legal',
    categoryLabel: '법률/명예훼손/초상권',
    iconName: 'AlertCircle',
    subCategory: '초상권침해/악플삭제',
    rankBadge: '온라인권익 TOP 1 🚫',
    resolutionRate: 99.1,
    avgResolutionTime: '즉시 임시조치 접수 (1시간)',
    title: '초상권 침해 및 인터넷/SNS 명예훼손성 게시물에 대한 즉시 임시조치(블라인드) 청구',
    questionScenario: '네이버 블로그, 인스타그램, 온라인 커뮤니티에 내 얼굴이 모자이크 없이 그대로 노출된 사진이 올라왔거나, 사실과 다른 악의적인 비방글이 게시되었습니다. 게시자에게 연락이 안 되는데 포털에서 즉시 지울 수 있나요?',
    officialAnswer: {
      summary: '정보통신망 이용촉진 및 정보보호 등에 관한 법률 제44조의2(정보의 삭제요청 등)에 따라, 자신의 사생활 침해나 명예훼손을 당한 사람은 해당 정보통신서비스 제공자(네이버, 다음, 인스타, 유튜브 등)에 즉시 삭제 또는 30일간 접근을 차단하는 [임시조치(블라인드)]를 요청할 수 있으며 플랫폼은 지체 없이 조치해야 합니다.',
      steps: [
        {
          stepNumber: 1,
          title: '게시물 URL 및 침해 화면 전체 캡처',
          desc: '게시물 링크(URL), 게시자 닉네임, 침해된 사진 및 비방 문구가 명확히 보이도록 화면 전체를 캡처합니다.'
        },
        {
          stepNumber: 2,
          title: '포털 권리침해신고센터 임시조치 접수',
          desc: '네이버/카카오 권리침해신고센터에 본인 신분증 마스킹 사본을 첨부하여 명예훼손/초상권 침해 임시조치를 접수합니다.'
        },
        {
          stepNumber: 3,
          title: '방송통신심의위원회 통신심의 및 형사 고소 검토',
          desc: '해외 플랫폼(인스타, X 등)의 경우 방심위(kocsc.or.kr) 권리침해 심의를 신청하거나 경찰서 사이버팀에 사이버명예훼손죄로 고소합니다.'
        }
      ],
      checklist: [
        '임시조치 신청이 접수되면 해당 게시물은 즉시 30일간 일반인의 열람이 차단됩니다.',
        '작성자가 30일 이내에 이의신청을 하지 않으면 게시물은 영구 삭제 처리됩니다.'
      ],
      proTip: '게시자에게 직접 댓글로 실랑이를 벌이기 전에 포털 권리침해센터에 임시조치를 접수하면 불필요한 감정 소모 없이 1~2시간 이내에 게시물이 즉시 비공개로 전환됩니다.'
    },
    tags: ['#임시조치블라인드', '#초상권침해삭제', '#사이버명예훼손', '#방심위권리침해', '#게시물삭제요청'],
    requiredDocs: ['게시물 URL 링크', '침해 화면 캡처', '본인 확인 신분증 사본'],
    directInquiryPrefill: {
      parentCategory: 'other',
      subCategory: 'defamation_removal',
      title: '[게시물 삭제 요청] 초상권 침해 및 명예훼손 게시물에 대한 즉시 임시조치 청구',
      contentTemplate: '1. 침해 게시물 URL: \n2. 게시자 닉네임/ID: \n3. 침해 유형: (초상권 무단 도용 / 허위사실 유포 / 모욕 등)\n4. 침해 구체적 내용: \n5. 즉시 블라인드 및 영구 삭제 요청'
    }
  },
  {
    id: 'legal-08',
    category: 'legal',
    categoryLabel: '법률/중고거래/형사',
    iconName: 'Handshake',
    subCategory: '중고거래사기/더치트',
    rankBadge: '사기예방 TOP 1 🚨',
    resolutionRate: 98.1,
    avgResolutionTime: '경찰 접수 가이드 안내',
    title: '중고거래 사기 피해(송금 후 미발송/잠적) 시 경찰청 사이버수사대 신고 및 배상명령신청',
    questionScenario: '중고거래 앱에서 고가의 전자기기를 구매하기로 하고 판매자 계좌로 40만 원을 송금했는데, 택배 송장도 주지 않고 채팅방을 나가며 전화를 차단했습니다. 사기꾼을 처벌하고 돈을 돌려받으려면 어떻게 해야 하나요?',
    officialAnswer: {
      summary: '온라인 중고 사기는 형법 제347조(사기죄)에 해당하며, 경찰청 사이버범죄 신고시스템(ECRM) 접수 및 관할 경찰서 방문 고소를 통해 수사가 개시됩니다. 형사 재판 과정에서 [배상명령신청서]를 법원에 제출하면 별도의 비싼 민사소송 없이도 피해 원금을 판결문으로 강제 집행하여 회수할 수 있습니다.',
      steps: [
        {
          stepNumber: 1,
          title: '은행 이체확인증 발급 및 대화 전문 캡처',
          desc: '은행 앱에서 상대방 계좌번호와 수취인 실명이 기재된 [계좌 이체확인증(PDF)]을 발급받고 채팅 전문을 캡처합니다.'
        },
        {
          stepNumber: 2,
          title: '경찰청 ECRM 온라인 임시 접수 후 방문 진술',
          desc: 'ecrm.police.go.kr에 사전 등록 후 신분증과 증빙 서류를 지참하여 가까운 경찰서 민원실(사이버범죄수사팀)을 방문합니다.'
        },
        {
          stepNumber: 3,
          title: '더치트(TheCheat) 등록 및 법원 배상명령 신청',
          desc: '더치트에 사기 계좌를 즉시 등록해 추가 피해를 막고, 검찰 기소 후 담당 형사재판부에 배상명령신청서를 우편 제출합니다.'
        }
      ],
      checklist: [
        '소액이라도 상습 사기범의 경우 전국 사건이 병합되어 구속 수사되며, 피의자 가족이 합의를 요청해 올 확률이 높습니다.',
        '안전거래(에스크로)를 사칭한 피싱 결제창(가짜 URL 링크) 유도 사기인지 반드시 대조해야 합니다.'
      ],
      proTip: '이체확인증 발급 시 은행 창구에 갈 필요 없이 모바일 뱅킹 앱에서 [이체결과 조회 → 이체확인증 저장]을 누르면 10초 만에 공인 증빙 PDF를 무료로 다운로드할 수 있습니다.'
    },
    tags: ['#중고사기신고', '#경찰청ECRM', '#배상명령신청', '#더치트등록', '#이체확인증발급'],
    requiredDocs: ['은행 계좌 이체확인증', '판매글 화면 캡처본', '채팅 대화 전문'],
    directInquiryPrefill: {
      parentCategory: 'other',
      subCategory: 'fraud_investigation',
      title: '[중고거래 사기 피해] 사이버수사대 신고 서류 검토 및 피해금 회수 절차',
      contentTemplate: '1. 피해 발생 일시: \n2. 피해 금액: (OO원)\n3. 사기 피의자 계좌번호 및 은행/예금주명: \n4. 피의자 연락처/아이디: \n5. 플랫폼명: (당근/번개장터/중고나라 등)\n6. 경찰 접수 번호(있는 경우): '
    }
  },
  {
    id: 'legal-09',
    category: 'legal',
    categoryLabel: '법률/부동산/인테리어',
    iconName: 'Layers',
    subCategory: '인테리어하자/지체상금',
    rankBadge: '주거분쟁 TOP 2 🛠️',
    resolutionRate: 97.2,
    avgResolutionTime: '하자 보수 협상안 제시',
    title: '인테리어/리모델링 공사 부실 하자 및 완공 지연 시 하자보수 청구와 지체상금 공제',
    questionScenario: '4주 완공 약속으로 계약금과 중도금 3천만 원을 지급한 아파트 리모델링 공사가 2달째 마감되지 않았고 타일 깨짐과 누수 하자가 발견되었습니다. 잔금 지급을 보류하고 지체상금을 깎을 수 있나요?',
    officialAnswer: {
      summary: '민법 제664조(도급계약) 및 건설산업기본법에 따라, 수급인(시공사)은 목적물의 하자에 대해 1년간(방수/구조체는 최장 5년) 무상 보수 의무가 있습니다. 또한 공사 기한 지연에 대한 [지체상금]은 잔금에서 우선 공제할 수 있으며, 하자가 중대하여 보수가 거부될 경우 잔금 지급을 거절(동시이행항변권)할 수 있습니다.',
      steps: [
        {
          stepNumber: 1,
          title: '현장 하자 사진/동영상 촬영 및 하자 목록표 작성',
          desc: '줄눈 불량, 누수, 수평 오차 등 하자 부위를 포스트잇으로 번호를 매겨 상세 사진 및 동영상으로 박제합니다.'
        },
        {
          stepNumber: 2,
          title: '하자보수 최고 및 잔금 지급 유보 내용증명 발송',
          desc: '시공사에 7일 이내 하자 보수 완료 일정을 통보하며, 보수 완료 시까지 잔금 지급을 유보한다는 내용증명을 발송합니다.'
        },
        {
          stepNumber: 3,
          title: '지체상금(통상 1일당 공사금액의 1/1000) 산정 공제',
          desc: '약정된 완공일 익일부터 실제 완공일까지의 일수에 지체상금률을 곱한 금액을 잔금에서 공제 통보합니다.'
        }
      ],
      checklist: [
        '잔금을 먼저 다 지급해 버리면 시공사가 현장을 이탈해 하자 보수가 매우 어려워지므로 반드시 보수 완료 후 잔금을 정산해야 합니다.',
        '공사 지연 사유가 소비자의 자재 변경 요구나 아파트 민원에 의한 것이라면 해당 일수는 지체일수에서 제외될 수 있습니다.'
      ],
      proTip: '대한상사중재원 또는 서울시/지자체 인테리어 하자분쟁조정위원회에 무료 조정을 신청하면 법원 감정비용(수백만 원) 없이도 공인 건축사의 현장 감정과 중재 결정을 신속히 받을 수 있습니다.'
    },
    tags: ['#인테리어하자보수', '#지체상금공제', '#민법도급계약', '#잔금지급거절권', '#건설분쟁조정'],
    requiredDocs: ['인테리어 공사 도급계약서', '시방서/견적서', '하자 부위 상세 사진', '지급 영수증'],
    directInquiryPrefill: {
      parentCategory: 'other',
      subCategory: 'interior_dispute',
      title: '[인테리어 시공 분쟁] 완공 지체상금 공제 및 부실 공사 하자보수 이행 청구',
      contentTemplate: '1. 공사 현장 주소: \n2. 총 공사 계약금액: \n3. 기지급 금액 및 남은 잔금: \n4. 약정 완공일 및 현재 지연 일수: \n5. 주요 하자 내용: (타일 단차, 누수, 미시공 부위 등)\n6. 요구 사항: 하자 보수 완료 전 잔금 지급 유보 및 지체상금 공제'
    }
  },
  {
    id: 'legal-10',
    category: 'legal',
    categoryLabel: '법률/노동/근로기준',
    iconName: 'Clock',
    subCategory: '주휴수당/부당해고',
    rankBadge: '노동권익 TOP 1 💼',
    resolutionRate: 98.6,
    avgResolutionTime: '노동청 진정 매뉴얼 안내',
    title: '아르바이트/단기근로 주휴수당 미지급 및 당일 해고 통보 시 고용노동부 진정 및 해고예고수당',
    questionScenario: '주 3일 하루 6시간씩(주 18시간) 6개월간 일한 카페 알바생입니다. 사장님이 시급만 주고 주휴수당은 원래 안 주는 거라며 오늘 출근하자마자 "내일부터 나오지 마라"고 당일 해고했습니다. 수당과 해고 보상을 받을 수 있나요?',
    officialAnswer: {
      summary: '근로기준법 제55조에 따라 1주 소정근로시간이 15시간 이상이고 개근한 근로자에게는 사업장 규모와 무관하게 1일분의 유급휴일(주휴수당)을 의무 지급해야 합니다. 또한 근로기준법 제26조에 의거하여 30일 전에 해고 예고를 하지 않은 경우 30일분 통상임금에 해당하는 [해고예고수당]을 즉시 지급해야 합니다.',
      steps: [
        {
          stepNumber: 1,
          title: '근로계약서, 출퇴근 기록, 급여통장 내역 확보',
          desc: '주 15시간 이상 근무를 증명할 출퇴근 기록부, 매장 스케줄표, 교통카드 승하차 내역, 급여 입금 내역을 정리합니다.'
        },
        {
          stepNumber: 2,
          title: '미지급 주휴수당 및 해고예고수당 총액 정산',
          desc: '지난 6개월간 발생한 주휴수당 합계와 30일분 통상임금(해고예고수당) 산출표를 작성합니다 (임금채권 소멸시효 3년).'
        },
        {
          stepNumber: 3,
          title: '고용노동부 노동포털(labor.moel.go.kr) 임금체불 진정 접수',
          desc: '온라인으로 사업장 관할 노동지청에 진정서를 접수하면 근로감독관이 배정되어 사업주와 대질 조사를 거쳐 입금을 강제합니다.'
        }
      ],
      checklist: [
        '5인 미만 영세 사업장이라도 주휴수당과 해고예고수당 지급 의무는 법적으로 100% 적용됩니다.',
        '근로자가 계속 근로한 기간이 3개월 미만인 경우에는 해고예고수당 지급 대상에서 제외됩니다.'
      ],
      proTip: '근로계약서를 작성하지 않은 경우 사업주는 근로기준법 제17조 위반으로 최대 500만 원의 벌금형을 받게 되므로, 미작성 사실을 함께 진정하면 밀린 수당이 당일 신속히 전액 입금되는 경우가 많습니다.'
    },
    tags: ['#주휴수당계산', '#해고예고수당', '#고용노동부진정', '#근로기준법제55조', '#임금체불신고'],
    requiredDocs: ['근로계약서(미작성 시 근무 스케줄표)', '급여통장 입금 내역', '출퇴근 기록'],
    directInquiryPrefill: {
      parentCategory: 'other',
      subCategory: 'labor_wage_dispute',
      title: '[임금 체불 진정] 주휴수당 미지급 및 부당 당일 해고에 따른 권리 구제',
      contentTemplate: '1. 사업장명 및 근무지 주소: \n2. 근무 기간: (202O.OO.OO ~ 202O.OO.OO)\n3. 1주 소정근로시간: (주 OO시간)\n4. 약정 시급: (OO원)\n5. 체불 내역: 미지급 주휴수당(약 OO원) + 해고예고수당 30일분\n6. 노동청 출석 조사 희망'
    }
  },
  {
    id: 'legal-11',
    category: 'legal',
    categoryLabel: '법률/해외직구/금융',
    iconName: 'CreditCard',
    subCategory: '해외직구사기/차지백',
    rankBadge: '소비자보호 TOP 2 🌐',
    resolutionRate: 97.9,
    avgResolutionTime: '차지백 신청 서식 제공',
    title: '해외 직구 사기 및 오배송/파손 시 신용카드사 차지백(Chargeback) 및 국제거래 소비자포털',
    questionScenario: '해외 명품 직구 사이트에서 가방을 결제했는데 3주째 송장 번호가 조회되지 않고 판매자 이메일이 반송됩니다. 사기 사이트에 속은 것 같은데 카드 결제 금액을 취소하고 돌려받을 수 있나요?',
    officialAnswer: {
      summary: '해외 직구 결제 시 비자(Visa), 마스터(Mastercard), 아멕스(Amex) 등 국제 브랜드 신용카드로 결제한 경우, 물품 미배송, 가품 배송, 파손 발생 시 결제일로부터 120일 이내에 국내 발급 카드사에 [해외이용 차지백(Chargeback) 서비스]를 신청하여 대금을 강제 환불받을 수 있습니다.',
      steps: [
        {
          stepNumber: 1,
          title: '판매자 대상 공식 이메일 항의 및 반송 내역 캡처',
          desc: '주문 취소 및 환불을 요청하는 영문 이메일을 발송하고, 판매자가 답변을 회피하거나 반송된 화면을 캡처합니다.'
        },
        {
          stepNumber: 2,
          title: '국내 카드사 해외분쟁담당 부서 차지백 접수',
          desc: '해당 카드사 고객센터에 연락하여 [해외거래 이의제기(차지백)]를 접수하고 구매 영수증, 송장 추적 불가 화면을 제출합니다.'
        },
        {
          stepNumber: 3,
          title: '한국소비자원 국제거래 소비자포털(crossborder.kca.go.kr) 지원',
          desc: '사기 사이트의 관할국 소비자보호 기관과 공조를 위해 소비자원에 분쟁 조정 대행을 무료로 신청합니다.'
        }
      ],
      checklist: [
        '해외 계좌 송금이나 가상화폐 결제는 차지백 보호를 전혀 받을 수 없으므로 해외 직구는 반드시 신용카드를 사용해야 합니다.',
        '결제 당시 사이트 URL, 가격 표기 화면, 결제 확인 메일을 PDF로 미리 저장해 두어야 입증이 수월합니다.'
      ],
      proTip: '사기 사이트의 전형적인 특징(터무니없는 80~90% 할인, 사업자 주소 없음, 결제 시 원화 대신 USD 자동 결제 유도) 캡처를 함께 제출하면 카드사 차지백 승인이 1~2주 내에 신속히 완료됩니다.'
    },
    tags: ['#해외직구차지백', '#국제분쟁조정', '#신용카드이의제기', '#국제소비자포털', '#가품직구환불'],
    requiredDocs: ['카드 결제 내역서', '주문 확인서 및 영수증', '판매자 이메일 교신 내역'],
    directInquiryPrefill: {
      parentCategory: 'other',
      subCategory: 'overseas_chargeback',
      title: '[해외 직구 피해] 신용카드사 차지백 이의제기 및 국제거래 소비자 분쟁 접수',
      contentTemplate: '1. 해외 결제 사이트 URL: \n2. 카드사 및 브랜드: (신한 Visa / 현대 Master 등)\n3. 결제 일시 및 통화 금액: (USD OO)\n4. 피해 유형: (물품 미배송 / 가품 의심 / 주문 후 판매자 연락두절)\n5. 카드사 차지백 신청서 작성 요청'
    }
  },
  {
    id: 'legal-12',
    category: 'legal',
    categoryLabel: '법률/식품안전/위생',
    iconName: 'Utensils',
    subCategory: '음식물이물질/식품위생',
    rankBadge: '소비자보호 TOP 3 🪰',
    resolutionRate: 98.8,
    avgResolutionTime: '식약처 신고 절차 안내',
    title: '식품/배달 음식 내 위험 이물질(쇳조각, 벌레, 유리) 발견 시 증거 보존 요령 및 식약처 신고와 배상',
    questionScenario: '주문한 찌개 배달 음식을 먹던 중 날카로운 쇳조각(수세미 철사)을 씹어 어금니가 파절되었습니다. 식당 사장님이 찌개값만 환불해 주겠다고 하는데, 치과 치료비와 위자료를 어떻게 보상받을 수 있나요?',
    officialAnswer: {
      summary: '식품위생법 제46조에 따라 식품 조리·제조 과정의 이물질 혼입은 식품의약품안전처 조사 대상이며 과태료 및 영업정지 행정처분 사유입니다. 소비자분쟁해결기준에 의거하여 소비자는 [해당 음식값 환불]뿐만 아니라 이물질로 인해 발생한 [치과 치료비, 약제비, 향후 보철 비용 및 일실수입 전액]을 손해배상 청구할 수 있습니다.',
      steps: [
        {
          stepNumber: 1,
          title: '이물질 원형 훼손 방지 및 현장 사진/동영상 촬영',
          desc: '이물질을 씻거나 버리지 말고 지퍼백에 밀봉 보관하며, 음식에 박혀 있는 상태와 입안 상처를 즉시 촬영합니다.'
        },
        {
          stepNumber: 2,
          title: '1399 부정·불량식품 통합신고센터 원클릭 신고',
          desc: '국번 없이 1399 또는 식품안전나라(foodsafetykorea.go.kr)에 신고하면 관할 보건소 위생과 담당관이 현장 실사 및 성분 분석을 진행합니다.'
        },
        {
          stepNumber: 3,
          title: '병원 진단서 발급 및 매장 영업배상책임보험 접수 요청',
          desc: '치과 진단서와 진료비 영수증을 발급받아 식당 측에 가입된 음식물배상책임보험 접수 번호를 요구합니다.'
        }
      ],
      checklist: [
        '치료비 외에 결근 등으로 인한 일실손해가 있는 경우 소득 증빙을 첨부하여 함께 청구할 수 있습니다.',
        '자영업자가 보험 처리를 거부할 경우 보건소 조사 결과 보고서를 근거로 민사 소액소송을 통해 강제 집행할 수 있습니다.'
      ],
      proTip: '이물질 실물을 보건소 위생과 조사관에게 인계할 때 반드시 [이물 수거 인수증]을 받아두셔야 증거 멸실을 방지하고 명확한 인과관계를 인정받을 수 있습니다.'
    },
    tags: ['#식품이물질신고1399', '#음식물배상책임보험', '#치아파절배상', '#식품위생법위반', '#보건소위생과'],
    requiredDocs: ['이물질 보관 사진 및 동영상', '치과 진단서/진료비 영수증', '주문 영수증'],
    directInquiryPrefill: {
      parentCategory: 'other',
      subCategory: 'food_safety_claim',
      title: '[식품 안전 사고] 음식물 내 위해 이물질 발견에 따른 식약처 신고 및 치료비 배상 청구',
      contentTemplate: '1. 음식점명 및 주문 일시: \n2. 발견된 이물질 종류: (쇳조각 / 유리 파편 / 곤충 등)\n3. 신체 피해 여부: (치아 손상 / 식도 찰과상 / 장염 등)\n4. 이물질 실물 보관 여부: (지퍼백 밀봉 보관 중)\n5. 식당 측 1차 대응: \n6. 음식물배상보험 접수 및 치료비 청구'
    }
  },
  {
    id: 'legal-13',
    category: 'legal',
    categoryLabel: '법률/교통/렌터카',
    iconName: 'Zap',
    subCategory: '렌터카사고/휴차료',
    rankBadge: '소비자분쟁 TOP 1 🚗',
    resolutionRate: 97.4,
    avgResolutionTime: '표준약관 기준 감액 안내',
    title: '렌터카 경미 사고 시 과도한 수리비 및 휴차보상료 청구에 대한 표준약관 기준 감액 협상',
    questionScenario: '제주도 여행 중 렌터카 앞 범퍼에 3cm 미세 긁힘이 발생했는데, 렌터카 업체가 범퍼 통교체 비용 60만 원과 수리 기간 4일간의 휴차보상료 30만 원을 요구합니다. 자차보험 미가입 상태인데 그대로 다 물어줘야 하나요?',
    officialAnswer: {
      summary: '공정거래위원회 [자동차대여 표준약관] 제19조 및 소비자분쟁해결기준에 따라, 경미한 도색 손상은 부품 교체가 아닌 판금·도색 기준의 통상 수리비만 청구할 수 있습니다. 또한 휴차보상료는 정상 대여요금이 아닌 [통상 대여요금의 50%]에 실제 [객관적 수리 소요 기간(통상 1~2일)]만을 곱하여 산정해야 합니다.',
      steps: [
        {
          stepNumber: 1,
          title: '사고 부위 고화질 근접 사진 및 전체 차량 상태 증빙',
          desc: '스크래치의 길이, 깊이, 기존 흠집 여부를 자를 대고 촬영하거나 동영상으로 기록합니다.'
        },
        {
          stepNumber: 2,
          title: '공식 1급 정비공장 정비 견적서 및 정비명세서 요구',
          desc: '업체의 구두 청구를 거부하고 자동차관리법상 공인된 [정비 견적서]와 부품 탈착 내역서 서면 교부를 요구합니다.'
        },
        {
          stepNumber: 3,
          title: '공정위 표준약관 기준 휴차료 50% 감액 및 소비자원 중재',
          desc: '실제 입고 기간 확인 후 정상요금의 50%를 초과하는 과다 청구액에 대해 지급 거절 및 분쟁 조정을 신청합니다.'
        }
      ],
      checklist: [
        '운행이 가능한 단순 흠집의 경우 차량이 실제 정비공장에 입고되어 수리된 기간에 대해서만 휴차료가 인정됩니다.',
        '출차 전 촬영해 둔 외관 동영상이 있다면 기존 스크래치와 겹치는지 반드시 대조해야 합니다.'
      ],
      proTip: '업체에 "공정위 자동차대여 표준약관에 따라 공인 정비 견적서와 실제 입고 일수 증명서를 발급해 주시면 50% 휴차료를 즉시 송금하겠다"고 서면 통지하면 대부분 10~20만 원 선에서 합의됩니다.'
    },
    tags: ['#렌터카휴차료', '#자동차대여표준약관', '#경미사고수리비', '#소비자원렌터카중재', '#범퍼스크래치'],
    requiredDocs: ['차량 임대차계약서', '손상 부위 상세 사진', '업체 측 청구 견적서'],
    directInquiryPrefill: {
      parentCategory: 'other',
      subCategory: 'rentcar_dispute',
      title: '[렌터카 분쟁] 경미 손상에 대한 과다 수리비 및 휴차보상료 표준약관 기준 감액 중재',
      contentTemplate: '1. 렌터카 대여 업체명: \n2. 사고 일시 및 장소: \n3. 손상 부위 및 정도: (범퍼 미세 스크래치 등)\n4. 업체 요구 금액: (수리비 OO원 + 휴차료 OO일 OO원)\n5. 표준약관(휴차료 50% 및 실수리기간) 기준 재산정 요청'
    }
  },
  {
    id: 'legal-14',
    category: 'legal',
    categoryLabel: '법률/반려동물/의료',
    iconName: 'Heart',
    subCategory: '펫호텔/동물병원과잉진료',
    rankBadge: '반려동물권익 TOP 1 🐕',
    resolutionRate: 96.8,
    avgResolutionTime: '진료기록부 발급 자문',
    title: '반려동물 펫호텔 위탁 사고 및 동물병원 과잉진료/의료분쟁 시 진료기록부 열람 및 배상',
    questionScenario: '명절 연휴 동안 애견호텔에 반려견을 맡겼는데 직원의 관리 소홀로 다른 대형견에게 물려 큰 부상을 입었습니다. 호텔 측은 [이용 중 발생한 사고에 일체 책임지지 않는다]는 서명 각서를 내밀며 발뺌합니다. 법적 책임이 없나요?',
    officialAnswer: {
      summary: '약관의 규제에 관한 법률 제6조 및 제7조에 따라, 사업자의 고의 또는 중대한 과실로 인한 법률상의 책임을 배제하는 면책 조항은 고객이 서명했더라도 무효입니다. 펫호텔은 선량한 관리자의 주의의무(선관주의의무) 위반으로 치료비 전액을 배상해야 하며, 수의사법 개정에 따라 동물병원 진료부 및 검사 결과 열람을 요구할 권리가 보장됩니다.',
      steps: [
        {
          stepNumber: 1,
          title: '펫호텔 CCTV 영상 확보 및 보관 요청',
          desc: '사고 당시 상황이 녹화된 CCTV 영상이 삭제되기 전에 스마트폰으로 촬영하거나 파일 복사를 즉시 요구합니다.'
        },
        {
          stepNumber: 2,
          title: '수의사 상해 진단서 및 진료비 영수증 발급',
          desc: '치료를 담당한 동물병원에서 상해 원인(교상 등)이 명시된 진단서와 수술비/입원비 상세 내역서를 발급받습니다.'
        },
        {
          stepNumber: 3,
          title: '사업자 배상책임보험 접수 및 민사 손해배상 청구',
          desc: '업체의 [애완동물위탁관리업 배상책임보험]으로 치료비 및 위자료를 접수하고 거부 시 지급명령을 진행합니다.'
        }
      ],
      checklist: [
        '동물보호법상 위탁관리업 등록업체인지 확인하고 무등록 영업장일 경우 지자체 축산과에 형사 고발이 가능합니다.',
        '호텔 위탁 계약서에 서명한 면책 서약서는 민법상 공서양속 위반으로 효력이 전혀 인정되지 않습니다.'
      ],
      proTip: '업체가 CCTV 공개를 거부할 경우 증거인멸 우려를 이유로 경찰에 재물손괴 및 과실치상 혐의로 사건을 접수하면 경찰관 입회하에 CCTV 원본을 즉시 확보할 수 있습니다.'
    },
    tags: ['#펫호텔사고배상', '#동물병원진료기록', '#약관규제법무효', '#반려동물의료분쟁', '#선관주의의무위반'],
    requiredDocs: ['동물병원 진단서 및 진료비 명세서', 'CCTV 영상 또는 사고 사진', '위탁 계약서'],
    directInquiryPrefill: {
      parentCategory: 'other',
      subCategory: 'pet_hotel_dispute',
      title: '[반려동물 위탁 사고] 펫호텔 관리 소홀에 따른 치료비 전액 배상 및 면책 각서 무효 통지',
      contentTemplate: '1. 펫호텔/동물병원 상호: \n2. 사고 발생 일시: \n3. 반려견 품종 및 상해 상태: (교상, 골절 등)\n4. 총 발생 진료비: (OO원)\n5. 업체 측 주장: (면책 조항 서명 주장 등)\n6. 약관규제법 위반 통지 및 치료비 배상 청구'
    }
  },
  {
    id: 'legal-15',
    category: 'legal',
    categoryLabel: '법률/지식재산권/저작권',
    iconName: 'Bookmark',
    subCategory: '폰트/이미지저작권내용증명',
    rankBadge: '저작권분쟁 TOP 1 📑',
    resolutionRate: 98.5,
    avgResolutionTime: '내용증명 분석 및 대응안 제시',
    title: '폰트/이미지 저작권 침해 관련 법무법인 합의금(수백만 원) 요구 내용증명 수령 시 합법적 대응',
    questionScenario: '개인 블로그나 소상공인 인스타그램 홍보 카드뉴스에 무료 폰트와 인터넷 이미지를 썼는데, 법무법인으로부터 [저작권법 위반으로 형사 고소 및 민사 손해배상 예정, 합의금 200만 원 패키지 구매 요망] 내용증명을 받았습니다. 당장 입금해야 하나요?',
    officialAnswer: {
      summary: '문화체육관광부 및 한국저작권위원회의 공식 가이드라인에 따르면, 폰트 파일(프로그램) 자체를 무단 복제·배포한 것이 아니라 이미지가 렌더링된 결과물(JPG/PNG)만을 사용한 것은 폰트 프로그램 저작권 침해에 해당하지 않습니다. 무차별적인 고액 합의금 요구나 패키지 강매는 공갈·부당이득 소지가 있으므로 섣불리 합의하지 마시고 침해 요건을 엄밀히 따져야 합니다.',
      steps: [
        {
          stepNumber: 1,
          title: '사용 형태 분석 (폰트 프로그램 복제 vs 단순 이미지)',
          desc: '외주 디자이너가 작업한 결과물을 받아서 단순 게시한 것인지, 본인이 직접 번들 프로그램을 불법 다운로드해 설치했는지 확인합니다.'
        },
        {
          stepNumber: 2,
          title: '한국저작권위원회 저작권상담센터(1800-5455) 무료 자문',
          desc: '수령한 내용증명 스캔본을 준비하고 저작권위원회의 폰트 분쟁 전문 공인 상담관에게 무료 침해 판단을 의뢰합니다.'
        },
        {
          stepNumber: 3,
          title: '합법적 답변서(내용증명) 회신 및 부당 합의금 거절',
          desc: '고의성이 없었음을 밝히고 해당 게시물을 즉시 자진 삭제 조치하였음을 입증하는 정중한 답변서를 발송합니다.'
        }
      ],
      checklist: [
        '대법원 판례상 폰트 도안(글자 모양) 자체는 저작권법상 저작물로 인정되지 않으며, 컴퓨터 프로그램 파일(.ttf/.otf)만이 보호 대상입니다.',
        '미성년자나 영세 소상공인의 우발적 침해에 대해 검찰청은 [저작권 침해 고소 각하 제도]를 운영하여 무차별 형사 처벌을 방지하고 있습니다.'
      ],
      proTip: '내용증명에 당황하여 법무법인에 전화를 걸어 덜컥 침해를 인정하거나 합의에 응하지 마시고, 해당 이미지를 즉시 비공개한 뒤 "외주 제작사 결과물 단순 수령으로 고의성이 전혀 없었다"는 취지의 서면을 보내면 대부분 추가 조치 없이 종결됩니다.'
    },
    tags: ['#폰트저작권내용증명', '#저작권합의금대응', '#한국저작권위원회', '#폰트프로그램판례', '#외주저작권분쟁'],
    requiredDocs: ['수령한 법무법인 내용증명 스캔본', '문제 된 게시물 캡처본', '외주 용역 계약서'],
    directInquiryPrefill: {
      parentCategory: 'other',
      subCategory: 'copyright_claim_defense',
      title: '[저작권 분쟁 대응] 폰트/이미지 저작권 침해 내용증명 수령에 따른 법적 소명 자문',
      contentTemplate: '1. 내용증명 발송 법무법인/저작권사명: \n2. 지목된 저작물: (OO 폰트 / OO 스톡 이미지 등)\n3. 사용 위치: (개인 블로그 / 회사 SNS / 웹사이트 등)\n4. 제작 주체: (자체 제작 / 외주 디자이너 납품 등)\n5. 요구 합의금 액수: (OO원)\n6. 저작권위원회 기준 소명서 작성 요청'
    }
  },

  // ==================== [7] 기타/B2B/업무/행정 추가 (Other & B2B Expansion) - 10 items ====================
  {
    id: 'oth-06',
    category: 'other',
    categoryLabel: '기타/회계세무',
    iconName: 'FileText',
    subCategory: '세금계산서/정산',
    rankBadge: 'B2B TOP 1 세무 📊',
    resolutionRate: 99.8,
    avgResolutionTime: '즉시 홈택스 전송 (5분)',
    title: '전자세금계산서 기재사항 착오정정 및 국세청 전송 후 수정 세금계산서 발행 승인',
    questionScenario: '당월 납품 거래에 대해 세금계산서를 발행했는데 사업자등록번호 1자리가 오타 났거나 공급가액이 잘못 입력되어 이미 국세청으로 전송 완료되었습니다. 가산세 없이 수정 세금계산서를 어떻게 재발행하나요?',
    officialAnswer: {
      summary: '부가가치세법 시행령 제70조에 따라 국세청 전송이 완료된 전자세금계산서라도 확정신고 기한 내에 [기재사항 착오정정] 사유로 수정 전자세금계산서를 발행하면 가산세 부담 없이 당초 계산서는 마이너스(-) 처리되고 올바른 새 계산서가 자동 교부됩니다.',
      steps: [
        {
          stepNumber: 1,
          title: '수정 사유 선택 (기재사항 착오정정 등)',
          desc: '당초 발행된 계산서의 국세청 승인번호를 조회하고 수정 사유를 [기재사항 착오정정] 또는 [공급가액 변동]으로 선택합니다.'
        },
        {
          stepNumber: 2,
          title: '마이너스 취소분 1장 + 정정분 1장 동시 자동 생성',
          desc: '시스템에서 기존 오류분을 음수(-) 처리하는 계산서와 올바른 정보가 기재된 계산서 총 2건을 세트로 연동 발행합니다.'
        },
        {
          stepNumber: 3,
          title: '거래처 전자서명 승인 및 국세청 익일 전송',
          desc: '거래처 세무 담당자에게 승인 알림톡을 발송하여 승인을 완료하고 국세청 홈택스 최종 반영을 확인합니다.'
        }
      ],
      checklist: [
        '과세기간에 대한 확정신고 기한(1기: 7월 25일, 2기: 1월 25일) 전까지 발행해야 수정세금계산서 지연발급 가산세(1%)가 면제됩니다.',
        '사업자등록번호 변경 시에는 반드시 홈택스 상의 최신 사업자등록증 사본을 확인 후 진행해야 합니다.'
      ],
      proTip: '당사 파트너 포털의 [세무 지원] 탭에서 "수정 세금계산서 간편 발행"을 누르시면 클릭 한 번으로 마이너스 취소와 올바른 계산서가 원스톱으로 홈택스에 동시 전송됩니다.'
    },
    tags: ['#수정세금계산서', '#기재사항착오정정', '#국세청홈택스', '#세금계산서가산세면제', '#B2B회계'],
    requiredDocs: ['당초 전자세금계산서 승인번호', '수정 사업자등록증 사본'],
    directInquiryPrefill: {
      parentCategory: 'other',
      subCategory: 'tax_invoice_correction',
      title: '[세무 정산] 기발행 전자세금계산서 오류에 따른 수정 세금계산서 승인 요청',
      contentTemplate: '1. 기존 세금계산서 승인번호: \n2. 사업자등록번호 및 상호: \n3. 수정 사유: (사업자번호 착오 / 공급가액 오기입 / 환입 등)\n4. 정정할 올바른 금액 및 정보: \n5. 국세청 즉시 재전송 요청'
    }
  },
  {
    id: 'oth-07',
    category: 'other',
    categoryLabel: '기타/B2B복지',
    iconName: 'Gift',
    subCategory: '기업복지몰/바우처',
    rankBadge: 'B2B TOP 2 복지 🎁',
    resolutionRate: 99.4,
    avgResolutionTime: '전용 견적서 당일 회신',
    title: '기업 B2B 임직원 복지몰(폐쇄몰) 단체 우대 할인 및 전용 바우처 발급 제휴 계약',
    questionScenario: '회사 임직원 500명을 위한 명절 복지 선물 및 사내 복지 포인트 연동 전용 할인 코드를 발급받고 싶습니다. 일반 판매가 대비 추가 기업 할인율과 전용 랜딩페이지 구축이 가능한가요?',
    officialAnswer: {
      summary: '인원 50인 이상 기업 및 법인 고객을 대상으로 [임직원 전용 B2B 복지몰 파트너십]을 상시 운영하고 있습니다. 회사 고유 이메일 도메인(@company.com) 인증 또는 전용 폐쇄몰 URL을 통해 일반가 대비 15~35% 우대 할인율과 월별 일괄 정산 시스템을 무상 구축해 드립니다.',
      steps: [
        {
          stepNumber: 1,
          title: '기업 정보 및 대상 임직원 규모 접수',
          desc: '사업자등록증, 예상 이용 임직원 수, 희망 복지 품목군(식음료, 모바일 쿠폰, 여가 티켓 등)을 전달받습니다.'
        },
        {
          stepNumber: 2,
          title: '기업 맞춤형 할인율 산정 및 제휴 협약 체결',
          desc: '연간 거래 예상 규모에 따른 최적 할인 테이블과 전용 바우처 발급 관리자 계정을 무상 제공합니다.'
        },
        {
          stepNumber: 3,
          title: '사내 인트라넷 전용 배너 및 인증 시스템 연동',
          desc: '기업 인사팀 전용 대시보드를 오픈하여 임직원 이용 현황 및 전자세금계산서 월마감 정산을 자동화합니다.'
        }
      ],
      checklist: [
        '이지웰, 베네피아, SK베네피트 등 주요 복지 포인트 플랫폼과의 결제 API 연동도 지원 가능합니다.',
        '최소 약정 기간 없이 기업 복지 시즌(설, 추석, 창립기념일)에만 한시적으로 바우처를 대량 구매할 수도 있습니다.'
      ],
      proTip: '사원수 300인 이상 기업의 경우 인사총무팀 전용 커스텀 모바일 쿠폰(회사 로고 및 CEO 격려 문구 인쇄)을 무료로 제작해 드립니다.'
    },
    tags: ['#기업복지몰제휴', '#임직원할인바우처', '#사내복지포인트', '#B2B폐쇄몰', '#대량쿠폰발행'],
    requiredDocs: ['사업자등록증 사본', '회사 소개서 또는 제휴 신청 공문'],
    directInquiryPrefill: {
      parentCategory: 'other',
      subCategory: 'corporate_welfare',
      title: '[B2B 제휴] 기업 임직원 전용 복지몰 단체 할인 및 모바일 바우처 도입 제안',
      contentTemplate: '1. 회사명 및 사업자등록번호: \n2. 임직원 수: (약 OO명)\n3. 희망 복지 서비스: (식음료 할인 / 모바일 상품권 / 명절 패키지)\n4. 도입 희망 시기: \n5. 담당자 부서/성함/직통 연락처: '
    }
  },
  {
    id: 'oth-08',
    category: 'other',
    categoryLabel: '기타/지식재산',
    iconName: 'ShieldAlert',
    subCategory: '상표권도용/리셀러차단',
    rankBadge: '브랜드보호 TOP 1 🛡️',
    resolutionRate: 99.2,
    avgResolutionTime: '24시간 내 게시 중단',
    title: '브랜드 상표권 및 상품 상세페이지 무단 도용 판매자에 대한 침해 중단(Take-down) 소명',
    questionScenario: '당사가 특허청에 상표 등록한 고유 브랜드명과 직접 제작한 제품 상세페이지 사진을 그대로 복사하여 판매하는 무단 리셀러 및 해외 가품 업자를 발견했습니다. 즉시 판매 중단 및 상품 삭제를 요구할 수 있나요?',
    officialAnswer: {
      summary: '상표법 제108조 및 저작권법 제103조에 따라 정당한 권리자의 소명 자료가 접수되면, 플랫폼은 해당 침해 상품의 노출을 24시간 이내에 즉시 중단(Take-down)하고 해당 판매자에게 판매 자격 정지 또는 계정 영구 퇴출 조치를 취합니다.',
      steps: [
        {
          stepNumber: 1,
          title: '상표등록원부 및 저작물 원본 파일 준비',
          desc: '특허청 상표등록증, 상세페이지 원본 기획서(PSD 등), 촬영 메타데이터를 권리 증빙으로 준비합니다.'
        },
        {
          stepNumber: 2,
          title: '지식재산권 침해 신고서 및 판매 중단 요구서 접수',
          desc: '침해 상품 링크(URL)와 침해 요소를 1:1 대조한 비교표를 작성하여 브랜드보호팀에 공식 접수합니다.'
        },
        {
          stepNumber: 3,
          title: '침해 판매자 소명 요구 및 상품 영구 삭제',
          desc: '판매자가 3영업일 이내 정품 유통 경로를 소명하지 못할 경우 해당 상품을 영구 삭제하고 정산금을 동결합니다.'
        }
      ],
      checklist: [
        '병행수입품의 경우 진품이고 상표권을 훼손하지 않는 범위의 재판매는 허용될 수 있으나, 독점 상세페이지 무단 도용은 저작권 침해로 100% 차단됩니다.',
        '해외 위조품(가품) 유통 의심 시 관세청 특사경 및 특허청 기술경찰 합동 수사 의뢰를 병행합니다.'
      ],
      proTip: '상표등록번호와 함께 침해 비교 캡처본을 제출해 주시면 [브랜드 보호 패스트트랙]이 가동되어 접수 당일 6시간 이내에 검색 노출이 전면 차단됩니다.'
    },
    tags: ['#상표권침해신고', '#상세페이지도용차단', '#가품리셀러퇴출', '#지식재산권보호', '#테이크다운요청'],
    requiredDocs: ['상표등록원부(사본)', '상세페이지 저작권 입증 원본 파일', '침해 URL 목록'],
    directInquiryPrefill: {
      parentCategory: 'other',
      subCategory: 'brand_protection_claim',
      title: '[지식재산권 보호] 자사 상표 및 상세페이지 무단 도용 판매자 즉시 판매 중단 요청',
      contentTemplate: '1. 권리자 상호 및 상표등록번호: \n2. 침해 판매자 상호 및 스토어 URL: \n3. 침해 상품 링크: \n4. 침해 상세 내용: (고유 상표 무단 사용, 자체 촬영 사진 도용 등)\n5. 조치 요청 사항: 상품 즉시 노출 중단 및 재발 방지 확약'
    }
  },
  {
    id: 'oth-09',
    category: 'other',
    categoryLabel: '기타/글로벌결제',
    iconName: 'CreditCard',
    subCategory: '외국인결제/인보이스',
    rankBadge: '글로벌비즈니스 TOP 1 💳',
    resolutionRate: 98.7,
    avgResolutionTime: '글로벌 결제 링크 즉시 발급',
    title: '해외 바이어 및 외국인 고객 결제(Global Invoicing / 다국어 카드 승인) 연동 지원',
    questionScenario: '해외 거주 외국인 고객이나 해외 바이어가 국내 휴대폰 본인인증 없이 비자, 마스터, 페이팔(PayPal), 위챗페이로 결제하기를 원합니다. 영문 인보이스(Invoice) 발행과 글로벌 간편결제 창 링크 생성이 가능한가요?',
    officialAnswer: {
      summary: '국내 통신사 본인인증(PASS)이 불가능한 외국인 및 해외 기업을 위해 3D Secure 해외 신용카드 결제 게이트웨이 및 영문 전자 인보이스(Invoice) 결제 링크 생성 시스템을 지원합니다. 미국 달러(USD), 일본 엔화(JPY), 유로(EUR) 등 다통화 결제가 가능합니다.',
      steps: [
        {
          stepNumber: 1,
          title: '영문 결제 링크(Payment Link) URL 생성',
          desc: '주문 품목, 바이어 영문 성명, 결제 통화 및 금액을 입력하여 1회용 보안 결제 URL을 생성합니다.'
        },
        {
          stepNumber: 2,
          title: '해외 카드사 3D Secure 무인증/간편 보안 결제 진행',
          desc: '외국인 고객이 수신한 링크에서 Visa/Master/JCB/Amex 카드로 국내 SMS 인증 없이 해외 카드사 인증만으로 결제를 완료합니다.'
        },
        {
          stepNumber: 3,
          title: '공식 영문 영수증(Commercial Invoice/Receipt) 자동 발급',
          desc: '결제 완료 즉시 국제 세무 증빙으로 사용 가능한 영문 결제 영수증 PDF가 바이어 이메일로 자동 전송됩니다.'
        }
      ],
      checklist: [
        '해외 결제 수수료는 브랜드사 및 PG사 수수료 기준 3.2~3.8% 수준이 적용됩니다.',
        '수출 실적 증빙이 필요한 기업의 경우 외화 영세율 세금계산서 또는 수출신고필증 연동 데이터를 제공합니다.'
      ],
      proTip: '페이팔(PayPal) 및 알리페이/위챗페이 결제 연동도 파트너 관리자 설정에서 체크 한 번으로 활성화할 수 있어 중화권 및 북미 고객의 결제 이탈률을 90% 줄일 수 있습니다.'
    },
    tags: ['#글로벌결제연동', '#외국인카드결제', '#페이팔인보이스', '#해외바이어인보이스', '#다통화결제'],
    requiredDocs: ['수출/해외 거래 주문서', '바이어 영문 사업자/개인 정보'],
    directInquiryPrefill: {
      parentCategory: 'other',
      subCategory: 'global_payment_setup',
      title: '[글로벌 비즈니스] 해외 바이어 결제를 위한 영문 결제 링크 및 인보이스 발급 요청',
      contentTemplate: '1. 결제 고객/기업명(영문): \n2. 고객 수신 이메일: \n3. 결제 요청 품목 및 수량: \n4. 결제 통화 및 총액: (예: USD 1,500)\n5. 결제 수단: (해외 신용카드 / PayPal 등)\n6. 영문 인보이스 즉시 발급 요청'
    }
  },
  {
    id: 'oth-10',
    category: 'other',
    categoryLabel: '기타/B2B제조',
    iconName: 'Building2',
    subCategory: 'OEM/ODM/비밀유지',
    rankBadge: '제조파트너십 TOP 1 🏭',
    resolutionRate: 98.9,
    avgResolutionTime: 'NDA 체결 후 2일 내 검토',
    title: 'OEM/ODM 공동 기획 제조 파트너십 및 상호 비밀유지계약서(NDA) 체결 절차',
    questionScenario: '독창적인 레시피나 특허 기술을 바탕으로 공동 PB 상품을 개발하여 당사 플랫폼에 독점 입점하고 싶습니다. 기술 유출을 방지하기 위한 공식 비밀유지계약(NDA) 체결과 샘플 검수 절차는 어떻게 되나요?',
    officialAnswer: {
      summary: '우수한 기술력과 아이디어를 보유한 제조 협력사와의 안전하고 투명한 협업을 위해, 기술 미팅 전 표준 전자 비밀유지계약서(NDA)를 최우선 체결합니다. 이후 상품기획팀(MD)의 1차 샘플 관능 검수 및 최소 발주 수량(MOQ), 품질 보증(QC) 협의가 단계별로 진행됩니다.',
      steps: [
        {
          stepNumber: 1,
          title: '전자 서명 상호 비밀유지계약(NDA) 선체결',
          desc: '모두싸인 등 공인 전자서명을 통해 기술 유출 및 아이디어 무단 도용을 법적으로 원천 방지하는 NDA를 체결합니다.'
        },
        {
          stepNumber: 2,
          title: '시제품(Sample) 및 공인 시험성적서 제출',
          desc: '본사 상품개발 연구소로 테스트 샘플 3~5개와 공인 검사기관(KCL, SGS 등) 안전성 시험 성적서를 전달합니다.'
        },
        {
          stepNumber: 3,
          title: '원가 구조 분석 및 공동 PB 런칭 계약 체결',
          desc: '생산 능력, 납기 일정, MOQ 및 마진율을 확정하고 공식 OEM/ODM 제조 도급 계약을 체결합니다.'
        }
      ],
      checklist: [
        'HACCP, ISO 9001/14001, GMP 등 위생 및 품질 인증 시설을 보유한 제조사의 경우 가산점이 부여됩니다.',
        '협의된 시제품 개발 비용 및 금형 비용의 분담 비율은 계약서에 명확히 명시됩니다.'
      ],
      proTip: '기존에 생산 중인 대표 제품의 포트폴리오와 보유 설비 현황 사진을 함께 제출하시면 MD 서류 심사 기간이 1주일에서 2일로 대폭 단축됩니다.'
    },
    tags: ['#OEM파트너십', '#ODM공동제조', '#비밀유지계약NDA', '#PB상품기획', '#시험성적서검수'],
    requiredDocs: ['사업자등록증', '공장등록증(해당 시)', '공인 품질 시험성적서', '제품 제안서'],
    directInquiryPrefill: {
      parentCategory: 'other',
      subCategory: 'oem_manufacturing_proposal',
      title: '[OEM/ODM 제안] 기술 유출 방지 NDA 체결 및 공동 PB 상품 개발 협의',
      contentTemplate: '1. 제조사명 및 소재지: \n2. 보유 공장/설비 인증: (HACCP, ISO, GMP 등)\n3. 제안 상품 카테고리: (가공식품, 화장품, 생활용품 등)\n4. 샘플 발송 가능 여부: \n5. 표준 전자 NDA 체결 희망 일자: '
    }
  },
  {
    id: 'oth-11',
    category: 'other',
    categoryLabel: '기타/B2B운영',
    iconName: 'Clock',
    subCategory: '정기구독/여신거래',
    rankBadge: 'B2B TOP 3 운영 🔄',
    resolutionRate: 99.6,
    avgResolutionTime: '즉시 결제 주기 변경',
    title: '기업 정기 배송 및 B2B 정기 결제 주기 일괄 변경(월말 후불 여신 거래 등록)',
    questionScenario: '회사에서 정기적으로 배송받는 사무용품 및 원두/간식 구독 서비스의 결제를 건별 카드 결제에서 [매월 말일 일괄 전자세금계산서 청구 후 익월 10일 무통장 입금] 여신 거래로 전환할 수 있나요?',
    officialAnswer: {
      summary: '6개월 이상 지속 거래 중이거나 월 결제 규모 100만 원 이상의 우수 기업 회원에게는 재무 회계 편의를 위한 [B2B 후불 여신 거래(월말 일괄 청구 제도)]를 제공합니다. 간단한 신용 심사 후 익월 정산일 일괄 결제로 즉시 전환됩니다.',
      steps: [
        {
          stepNumber: 1,
          title: '후불 여신 거래 신청서 및 사업자등록증 접수',
          desc: '월 예상 구매 한도와 법인 결제 주기(예: 매월 25일 마감, 익월 10일 입금)를 기재한 신청서를 제출합니다.'
        },
        {
          stepNumber: 2,
          title: '나이스평가정보(NICE) 기업 신용도 신속 심사',
          desc: '채무 불이행 여부 등 기본적인 기업 신용 평가를 거쳐 월 여신 한도액(300만~2,000만 원)을 승인합니다.'
        },
        {
          stepNumber: 3,
          title: '자동 월말 합산 청구 및 전자세금계산서 일괄 발행',
          desc: '주문 시 결제 없이 물품이 즉시 출고되며, 매월 말일 합산 세금계산서 1장이 지정된 회계 이메일로 자동 청구됩니다.'
        }
      ],
      checklist: [
        '공공기관, 관공서, 학교 및 대기업 계열사의 경우 신용 심사 없이 사업자등록증만으로 즉시 후불 거래가 개설됩니다.',
        '약정된 입금 기일을 15일 이상 연체할 경우 후불 거래 자격이 일시 중지될 수 있습니다.'
      ],
      proTip: '월말 일괄 청구 도입 시 매번 부서별로 법인카드를 품의하고 전표 처리할 필요가 없어 기업 재무팀의 관리 공수가 80% 이상 절감됩니다.'
    },
    tags: ['#B2B후불거래', '#월말합산청구', '#법인여신한도', '#정기배송주기변경', '#세금계산서후불'],
    requiredDocs: ['사업자등록증 사본', '법인인감증명서(해당 시)', '후불거래 신청서'],
    directInquiryPrefill: {
      parentCategory: 'other',
      subCategory: 'credit_billing_setup',
      title: '[B2B 결제 방식 변경] 정기 주문 건에 대한 월말 합산 후불 세금계산서 거래 신청',
      contentTemplate: '1. 기업명 및 사업자번호: \n2. 현재 월평균 주문 금액: (약 OO만 원)\n3. 희망 월 여신 한도: (OO만 원)\n4. 희망 결제일: (매월 말일 마감, 익월 OO일 입금)\n5. 계산서 수신 회계팀 이메일: '
    }
  },
  {
    id: 'oth-12',
    category: 'other',
    categoryLabel: '기타/IT기술제휴',
    iconName: 'Settings',
    subCategory: 'API연동/기술제안',
    rankBadge: '테크파트너십 TOP 1 💻',
    resolutionRate: 99.1,
    avgResolutionTime: '기술 검토 24시간 내 피드백',
    title: '물류 ERP, 알림톡, 결제 게이트웨이(PG) 신규 오픈소스 및 기술 제휴 제안',
    questionScenario: '저희 솔루션사는 실시간 AI 배송 최적화 및 스마트 알림톡 기술을 보유하고 있습니다. 인콰이어허브의 문의 라우팅 및 제휴처 주문 시스템과 양방향 REST API 연동 제휴를 공식 제안하고 싶습니다.',
    officialAnswer: {
      summary: '플랫폼의 기술적 경쟁력을 극대화하기 위해 유망 SaaS, 물류 ERP, AI 자동화 솔루션 기업과의 테크 제휴(Tech Alliance)를 적극 환영합니다. API 명세서 검토 후 전담 기술 매니저가 배정되어 샌드박스(Sandbox) 테스트 환경과 웹훅(Webhook) 엔드포인트를 제공합니다.',
      steps: [
        {
          stepNumber: 1,
          title: '솔루션 소개서 및 API 기술 명세서(Swagger 등) 제출',
          desc: '연동 인터페이스 규격, 트래픽 처리 역량, 보안 인증(ISMS-P 등)을 포함한 기술 제안서를 접수합니다.'
        },
        {
          stepNumber: 2,
          title: '개발팀 CTO/아키텍트 1차 아키텍처 적합성 검토',
          desc: '데이터 정합성, 시스템 부하 영향도, 개인정보 암호화 준수 여부를 24시간 내 검토하여 피드백을 회신합니다.'
        },
        {
          stepNumber: 3,
          title: '개발용 샌드박스 API Key 발급 및 PoC 테스트',
          desc: '테스트 계정과 모의 결제/주문 더미 데이터를 제공하여 실시간 데이터 송수신 테스트를 진행합니다.'
        }
      ],
      checklist: [
        '모든 연동 트래픽은 HTTPS TLS 1.3 및 OAuth 2.0 / API Key 헤더 인증을 필수 적용해야 합니다.',
        'SLA(서비스 수준 협약) 99.9% 가용성 보장이 요구됩니다.'
      ],
      proTip: '제안서에 이미 구축된 타사 레퍼런스 및 벤치마크 테스트 성능 수치를 첨부해 주시면 PoC(개념 검증) 단계로 즉각 승인됩니다.'
    },
    tags: ['#API기술제휴', '#REST웹훅연동', '#ERP연동솔루션', '#샌드박스테스트', '#테크파트너십'],
    requiredDocs: ['API 기술 명세서(PDF/링크)', '회사 소개서', '보안 인증 증빙'],
    directInquiryPrefill: {
      parentCategory: 'other',
      subCategory: 'tech_api_partnership',
      title: '[기술 제휴 제안] 시스템 양방향 REST API / 웹훅(Webhook) 연동 협력 제안',
      contentTemplate: '1. 솔루션/기업명: \n2. 제안 기술 분야: (AI 자동화, 배송 ERP, 간편결제, 알림 솔루션 등)\n3. 연동 기대 효과: \n4. 기술 문서(Swagger/API 문서) URL: \n5. 기술 담당자(CTO/개발팀장) 연락처: '
    }
  },
  {
    id: 'oth-13',
    category: 'other',
    categoryLabel: '기타/공간대관',
    iconName: 'Building2',
    subCategory: '팝업스토어/공간셰어링',
    rankBadge: '공간협업 TOP 1 🏙️',
    resolutionRate: 98.3,
    avgResolutionTime: '현장 실사 일정 1일 내 확정',
    title: '성수/강남 오프라인 팝업스토어 단기 공간 셰어링 및 협업 대관 심사',
    questionScenario: '신규 브랜드 런칭을 위해 성수동 및 강남 플래그십 스토어의 1층 쇼룸 공간을 2주간 단기 팝업스토어로 대관하고 싶습니다. 대관 비용 산정 방식과 시설 원상복구, 소방/안전 승인 기준은 무엇인가요?',
    officialAnswer: {
      summary: '트렌디한 브랜드 경험 창출을 위해 오프라인 직영 플래그십 공간 셰어링을 지원합니다. 브랜드 성격에 따라 [순수 고정 대관료 모델] 또는 [매출 연동 수수료(RS) 모델] 중 선택 가능하며, 전문 공간 디렉터가 동선 기획 및 인허가를 원스톱 지원합니다.',
      steps: [
        {
          stepNumber: 1,
          title: '팝업 기획안 및 공간 연출 3D/투시도 접수',
          desc: '팝업 컨셉, 예상 방문객 수, 집기 배치도 및 전시 품목 명세서를 제출받아 브랜드 적합성을 심사합니다.'
        },
        {
          stepNumber: 2,
          title: '현장 답사 및 소방/전력 인프라 기술 점검',
          desc: '허용 전기 용량(kW), 대형 조형물 하중, 비상구 소방 피난 동선 안전 점검을 실시합니다.'
        },
        {
          stepNumber: 3,
          title: '대관 계약 체결 및 온·오프라인 공동 마케팅 지원',
          desc: '보증금 예치 및 계약을 완료하고, 당사 앱 푸시 알림 및 SNS 채널에 팝업 오픈 소식을 무료 홍보합니다.'
        }
      ],
      checklist: [
        '식음료(F&B) 시음/시식 팝업의 경우 관할 구청 즉석판매제조가공업 영업신고증이 사전 구비되어야 합니다.',
        '행사 종료 후 48시간 이내에 시설 원상복구 완료 후 예치 보증금 전액이 반환됩니다.'
      ],
      proTip: '당사 멤버십 고객 대상 단독 할인 혜택이나 웰컴 기프트 증정을 기획안에 포함하시면 대관료를 최대 30% 감면 지원해 드립니다.'
    },
    tags: ['#성수동팝업스토어', '#공간대관심사', '#플래그십쇼룸대여', '#단기공간셰어링', '#오프라인팝업'],
    requiredDocs: ['팝업스토어 기획안', '공간 투시도 또는 시안', '사업자등록증'],
    directInquiryPrefill: {
      parentCategory: 'other',
      subCategory: 'popup_space_rental',
      title: '[오프라인 공간 협업] 성수/강남 플래그십 쇼룸 단기 팝업스토어 대관 신청',
      contentTemplate: '1. 브랜드/행사명: \n2. 희망 팝업 대관 기간: (202O.OO.OO ~ OO.OO, 총 OO일간)\n3. 팝업 주요 컨셉 및 전시 품목: \n4. 일평균 예상 방문객 수: \n5. 식음료(F&B) 시식 포함 여부: \n6. 기획안 첨부 및 현장 답사 신청'
    }
  },
  {
    id: 'oth-14',
    category: 'other',
    categoryLabel: '기타/ESG친환경',
    iconName: 'Zap',
    subCategory: 'ESG친환경/재활용',
    rankBadge: 'ESG가치소비 TOP 1 🌱',
    resolutionRate: 99.7,
    avgResolutionTime: '인증 심사 2일 내 완료',
    title: 'ESG 친환경 패키징 도입 및 생분해 포장재 인증 파트너사 등록 심사',
    questionScenario: '당사 제품 포장재를 100% 사탕수수 종이 및 생분해(PLA) 완충재, 무라벨 용기로 전면 교체했습니다. 플랫폼 내 [ESG 친환경 공식 인증 마크] 부착과 가치소비 기획전 입점이 가능한가요?',
    officialAnswer: {
      summary: '지속 가능한 지구와 친환경 소비 문화를 선도하기 위해 [ESG 그린 파트너십] 제도를 운영하고 있습니다. 환경부 공인 친환경 인증(환경표지 인증 등)을 획득한 제품에 대해 공식 친환경 엠블럼을 부여하고 수수료 2% 인하 혜택을 제공합니다.',
      steps: [
        {
          stepNumber: 1,
          title: '환경부 환경성적표지 및 생분해 공인 시험성적서 제출',
          desc: '한국환경산업기술원(KEITI) 친환경 인증서, FSC 산림인증, 생분해 테스트 결과서를 접수합니다.'
        },
        {
          stepNumber: 2,
          title: 'ESG 친환경 공식 엠블럼 상품 페이지 자동 적용',
          desc: '검증 완료 즉시 검색 결과 및 상품 상세페이지 최상단에 [100% ECO Friendly] 공인 배지가 노출됩니다.'
        },
        {
          stepNumber: 3,
          title: '연중 무휴 상설 [ESG 가치소비 테마관] 무료 입점',
          desc: '친환경 관심 고객을 타겟팅한 전용 테마 기획전에 무료 배너 노출 및 공동 프로모션을 지원합니다.'
        }
      ],
      checklist: [
        '실제 인증이 없는 허위 친환경 광고(그린워싱, Greenwashing) 적발 시 즉시 퇴출 및 공정위 신고 조치됩니다.',
        '택배 포장 테이프와 운송장까지 친환경 소재를 사용할 경우 [친환경 배송 우수 파트너]로 추가 선정됩니다.'
      ],
      proTip: '친환경 포장 전환 과정을 담은 30초 숏폼 영상이나 사진을 제출하시면 공식 인스타그램 및 블로그 공식 매거진에 우수 친환경 기업 스토리로 무료 특집 인터뷰를 게재해 드립니다.'
    },
    tags: ['#ESG친환경인증', '#생분해포장재', '#환경표지인증', '#그린파트너십', '#가치소비기획전'],
    requiredDocs: ['친환경 인증서(환경표지/FSC 등)', '공인 생분해 시험성적서', '포장재 실물 사진'],
    directInquiryPrefill: {
      parentCategory: 'other',
      subCategory: 'esg_green_partner',
      title: '[ESG 파트너십] 친환경 포장재 전환 인증 서류 제출 및 전용 엠블럼 신청',
      contentTemplate: '1. 파트너사명 및 브랜드명: \n2. 도입한 친환경 포장재 종류: (사탕수수 종이 / 생분해 완충재 / 무라벨 용기 등)\n3. 보유 친환경 인증서 명칭: \n4. 친환경 전환 적용 품목군: \n5. ESG 공식 엠블럼 및 기획전 참여 요청'
    }
  },
  {
    id: 'oth-15',
    category: 'other',
    categoryLabel: '기타/미디어홍보',
    iconName: 'FileText',
    subCategory: '보도자료/촬영협조',
    rankBadge: '홍보PR TOP 1 🎬',
    resolutionRate: 99.3,
    avgResolutionTime: '홍보팀 직통 당일 회신',
    title: '언론 홍보(보도자료 배포) 및 방송/미디어 콘텐츠 공식 촬영 협조 요청 공문 접수',
    questionScenario: '지상파/종편 방송 프로그램 또는 대형 유튜브 웹예능 채널에서 인콰이어허브 제휴 매장 및 서비스를 배경으로 한 촬영을 희망합니다. 촬영 협조 공문 접수와 장소 대관 및 홍보 보도자료 배포 창구는 어디인가요?',
    officialAnswer: {
      summary: '브랜드 가치를 높이고 파트너사의 홍보 기회를 창출하는 미디어 촬영 협조 및 언론 보도를 적극 지원합니다. 제작 기획안과 공문을 접수해 주시면 PR/홍보팀이 영업장 일정 조율, 출연자 초상권 협의, 홍보 보도자료 공동 배포를 원스톱으로 지원합니다.',
      steps: [
        {
          stepNumber: 1,
          title: '방송/유튜브 제작 기획안 및 촬영 협조 공문 접수',
          desc: '방송사/제작사 직인이 날인된 촬영 협조 공문, 대본(또는 촬영 구성안), 희망 일시 및 장소를 전달받습니다.'
        },
        {
          stepNumber: 2,
          title: '제휴 매장 점주님 동의 및 현장 안전/소음 통제 협의',
          desc: '촬영 시간대 일반 고객의 이용 불편을 최소화하기 위한 동선 통제와 매장 안전 가이드를 수립합니다.'
        },
        {
          stepNumber: 3,
          title: '방영 시점에 맞춘 언론 보도자료 배포 및 본방 이벤트',
          desc: '방송 송출 일자에 맞춰 주요 일간지 및 온라인 포털에 보도자료를 동시 배포하고 본방 사수 이벤트를 진행합니다.'
        }
      ],
      checklist: [
        '촬영 중 발생할 수 있는 집기 파손에 대비하여 방송사/제작사 측의 영업배상책임보험 가입 증빙이 요구될 수 있습니다.',
        'PPL(간접광고) 및 브랜드 로고 노출 조건은 사전 서면 협의를 원칙으로 합니다.'
      ],
      proTip: '공익적 목적(다큐멘터리, 청년 창업, 지역 상권 살리기 프로그램)의 촬영 요청은 우선 배정되며 공간 사용료가 100% 전액 면제됩니다.'
    },
    tags: ['#미디어촬영협조', '#방송공문접수', '#보도자료배포', '#유튜브촬영대관', '#브랜드PR홍보'],
    requiredDocs: ['촬영 협조 공식 공문(직인 포함)', '프로그램 제작 기획안/대본', '사업자등록증'],
    directInquiryPrefill: {
      parentCategory: 'other',
      subCategory: 'pr_media_request',
      title: '[미디어 PR] 방송/유튜브 촬영 협조 공식 공문 접수 및 보도자료 배포 협의',
      contentTemplate: '1. 방송사/제작사명: \n2. 프로그램/채널명: (구독자수/시청률)\n3. 촬영 희망 일시: (202O.OO.OO OO시~OO시)\n4. 촬영 희망 장소/제휴처: \n5. 주요 촬영 내용 및 출연진: \n6. 공문 및 기획서 파일 첨부 확인'
    }
  },
  {
    id: 'gen-tving',
    category: 'general',
    categoryLabel: '일반/보안/인증',
    iconName: 'ShieldAlert',
    subCategory: '개인정보유출/피해보상',
    rankBadge: '보안 긴급 TOP 1 🔥',
    resolutionRate: 99.8,
    avgResolutionTime: '즉시 조회 지원 및 실시간 민원 접수',
    title: '티빙(TVING) 개인정보 대규모 유출 사고에 따른 피해보상 확인 및 1:1 민원 접수',
    questionScenario: '티빙 공지사항에서 개인정보가 노출되었다는 안내를 받았습니다. 제 이메일, 휴대폰 번호, 아이디가 유출되었다고 하는데, 어떤 피해 보상을 받을 수 있나요? 피해 보상금 청구나 크레딧 보상 신청 양식은 어디에 있나요?',
    officialAnswer: {
      summary: '티빙 회원 정보 유출 사실이 고지됨에 따라 모든 피해 회원들에게 공식 보상안(구독 쿠폰 또는 소정의 피해 크레딧 등)이 순차적으로 배포되고 있습니다. 당사 플랫폼을 통해 유출 항목을 정밀 대조하고 보상 미지급 건에 대해 1:1 보상 간편 청구를 즉각 제기하십시오.',
      steps: [
        {
          stepNumber: 1,
          title: '티빙 개인정보 유출 확인 조회',
          desc: '티빙 공식 페이지 또는 고객 고지 이메일을 통해 유출 대상 여부 및 상세 노출 항목(ID/이메일/연락처 등)을 조회하고 캡처합니다.'
        },
        {
          stepNumber: 2,
          title: '당사 1:1 피해 보상 간편 청구서 접수',
          desc: '하단 [이 유형으로 1:1 문의하기]를 누르시면 유출 보상 신청 양식이 즉시 활성화되며, 피해 사실 및 보상 신청 정보를 입력해 접수합니다.'
        },
        {
          stepNumber: 3,
          title: '정부 위원회 합동 구제 조율 및 완료',
          desc: '접수된 신청서는 당사 분쟁 조정팀과 개인정보보호위원회를 통해 티빙 측 고객 보상 전담 부서로 다이렉트 이첩되며, 보상 조치 결과가 1~3일 내 완료 고지됩니다.'
        }
      ],
      checklist: [
        '티빙 유출 사고를 사칭한 출처 불명의 2차 스미싱 문자(예: "티빙 유출 합의금 지급 링크 클릭")는 절대로 클릭하지 마십시오.',
        '비밀번호가 다른 포털이나 사이트와 동일한 경우 개인정보 다중 도용을 방지하기 위해 즉시 타 사이트의 비밀번호를 다르게 교체해 주십시오.'
      ],
      proTip: '실제 스팸 수신 급증이나 무단 로그인 등 2차 구체적 피해 사실이 있는 경우, 통신사 스팸 내역 캡처나 접속 기록을 첨부해 주시면 관계 법령에 의거 법정 손해배상 조율 및 위자료 제소 대행 조치까지 원스톱 연계해 드립니다.'
    },
    tags: ['#티빙개인정보유출', '#유출피해보상', '#합동분쟁조정', '#스미싱2차방지', '#보상크레딧'],
    requiredDocs: ['티빙 정보유출 사실 안내 메일 또는 조회 화면 캡처', '2차 피해 증빙 내역(스팸 유입 등, 해당 시)'],
    directInquiryPrefill: {
      parentCategory: 'other',
      subCategory: 'privacy_leak_compensation',
      title: '[긴급 피해보상 청구] 티빙(TVING) 개인정보 유출 확인 및 보상안 미지급 이의 제기',
      contentTemplate: '1. 티빙 가입 계정 ID (또는 이메일): \n2. 본인 인증된 휴대폰 번호: \n3. 유출 확인된 구체적 항목: (예: ID, 이메일, 전화번호, 구독 유형)\n4. 현재 겪으신 2차 피해 유무: (예: 광고성 스팸 급증 / 보이스피싱 시도 등)\n5. 희망 보상 방식: (공식 보상 이용권 수령 / 추가 물질 피해 보상 심의 요청)\n※ 티빙 유출 사실 조회 화면 캡처본을 파일 첨부 영역에 등록해 주시면 더욱 신속한 합동 정산 보상이 진행됩니다.'
    }
  }
];
