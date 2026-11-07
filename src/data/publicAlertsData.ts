export type AlertCategory = 'urgent' | 'law' | 'benefit' | 'safety' | 'partner';

export interface PublicNoticeAlert {
  id: string;
  category: AlertCategory;
  categoryLabel: string;
  badgeText: string;
  urgency: 'high' | 'medium' | 'normal';
  title: string;
  summary: string;
  targetAudience: string;
  institution: string; // e.g., 공정거래위원회, 한국소비자원, 금융감독원, 식품의약품안전처
  effectiveDate: string; // 시행일 또는 고지일
  keyPoints: string[];
  actionGuide: string[]; // 행동 지침 3단계
  lawBasis?: string; // 관련 법령
  contactNumber?: string; // 신고/문의 대표전화 (1372, 1399, 1332 등)
  downloadFormName?: string; // 피해구제 신청 서식 등
  viewCount: number;
  shareCount: number;
  pinned?: boolean;
}

export const PUBLIC_ALERTS: PublicNoticeAlert[] = [
  {
    id: 'alert-01',
    category: 'urgent',
    categoryLabel: '긴급 피해주의보',
    badgeText: '긴급 경보',
    urgency: 'high',
    title: '해외 유명 호텔/항공 예약 플랫폼 "DCC 숨은 수수료 및 취소 거부" 소비자 경보',
    summary: '원화 결제(DCC) 설정 시 최대 5~8% 환전 수수료가 중복 청구되며, "환불 불가 특가"라 하더라도 예약 후 24시간 내 취소는 전액 반환 권리가 인정됩니다.',
    targetAudience: '해외여행, 호텔 예약, 항공권 구매 예정 전 국민',
    institution: '한국소비자원 & 공정거래위원회',
    effectiveDate: '2026.09.01 발령',
    keyPoints: [
      '결제 통화는 반드시 현지 통화(USD/EUR/JPY 등)로 지정해야 이중 환전 차단',
      '플랫폼 약관에 "환불 불가"가 명시되어 있어도 전자상거래법상 국내 대행사 연결 시 즉각 취소권 주장 가능',
      '부당 결제 거부 시 카드사 해외 이의제기(Chargeback) 서비스 즉시 신청'
    ],
    actionGuide: [
      '1단계: 예약 직후 카드 결제 문자에서 KRW(원화) 결제 여부 확인 (원화 승인 시 즉시 취소 후 재결제)',
      '2단계: 취소 거부 통보 시 해외 플랫폼 CS 채팅 내역 캡처 및 영문 환불 요청 메일 송부',
      '3단계: 결제 카드사 고객센터 해외분쟁팀에 "차지백(Chargeback) 분쟁 심의" 즉시 접수'
    ],
    lawBasis: '전자상거래법 제17조 및 여신전문금융업법 해외거래규정',
    contactNumber: '1372 (소비자상담센터)',
    viewCount: 18420,
    shareCount: 1420,
    pinned: true
  },
  {
    id: 'alert-02',
    category: 'law',
    categoryLabel: '법 개정/의무 시행',
    badgeText: '오늘부터 시행',
    urgency: 'high',
    title: '헬스장·필라테스 중도 해지 시 "정가 일할 공제 꼼수" 전면 금지 및 10% 위약금 상한제',
    summary: '사업자가 "할인 전 1회 정상가 10만원"을 기준으로 남은 돈이 없다고 억지 부리는 행위는 명백한 불법이며, 실제 결제 금액 기준으로 잔여일 공제 후 반환해야 합니다.',
    targetAudience: '체육시설(헬스, PT, 필라테스, 골프 등) 장기 회원권 이용자',
    institution: '공정거래위원회 계속거래고시',
    effectiveDate: '2026.08.15 개정 고시',
    keyPoints: [
      '소비자 귀책 사유로 해지하더라도 최대 위약금은 "총 결제금액의 10%" 초과 불가',
      '이용 일수 공제액은 "할인된 실제 계약 단가"로만 계산 (정상가 공제 약관은 원천 무효)',
      '자필 계약서에 "환불 불가 동의 서명"을 했더라도 강행법규 우선으로 효력 없음'
    ],
    actionGuide: [
      '1단계: 매장 방문 전 카카오톡 또는 문자로 "계약 해지 통보 일시"를 명확한 텍스트로 남겨 기준일 확정',
      '2단계: 위약금(결제액의 10%) + (실제 이용 횟수 × 실 결제 단가)를 제외한 잔액 계산서 요구',
      '3단계: 사업자 불응 시 한국소비자원(1372) 분쟁조정신청서 및 관할 구청 문화체육과 행정처분 민원 제기'
    ],
    lawBasis: '방문판매 등에 관한 법률 제31조 및 계속거래 해지 가이드라인',
    contactNumber: '1372 (한국소비자원)',
    viewCount: 29540,
    shareCount: 3180,
    pinned: true
  },
  {
    id: 'alert-03',
    category: 'benefit',
    categoryLabel: '전국민 알짜 혜택',
    badgeText: '숨은 돈 환급',
    urgency: 'medium',
    title: '유효기간 만료 모바일 상품권(기프티콘) 5년 이내 "결제액 90% 현금 환급" 의무제',
    summary: '유효기간이 지난 카카오톡, 기프티콘, 기프티쇼 등 모바일 쿠폰은 발행일로부터 5년 동안 발행사에 요청하면 언제든 결제 금액의 90%를 현금(계좌)으로 돌려받을 수 있습니다.',
    targetAudience: '모바일 메신저 선물 및 기프티콘 보유 전 국민',
    institution: '공정거래위원회 신유형 상품권 표준약관',
    effectiveDate: '연중 상시 적용',
    keyPoints: [
      '받은 사람(수신자) 본인 계좌로 즉시 90% 현금 입금 보장',
      '유효기간 연장 버튼이 사라졌어도 5년(소멸시효) 이내라면 무조건 환불 청구 가능',
      '금액형 상품권은 60%(1만원 이하는 80%) 이상 사용 시 남은 잔액 100% 현금 반환'
    ],
    actionGuide: [
      '1단계: 선물함 앱에서 [사용완료/만료] 탭 조회하여 기간 만료 쿠폰 번호 복사',
      '2단계: 발행사 고객센터(카카오커머스, 기프티쇼, 스마트콘 등) 앱의 "환불 접수" 메뉴 진입',
      '3단계: 본인 인증 및 계좌번호 입력 시 영업일 기준 1~3일 내 90% 현금 입금 완료'
    ],
    lawBasis: '소비자기본법 제16조 및 신유형 상품권 표준약관 제6조',
    contactNumber: '1372 (소비자상담센터)',
    viewCount: 34100,
    shareCount: 4120,
    pinned: false
  },
  {
    id: 'alert-04',
    category: 'safety',
    categoryLabel: '식품/제품 안전 긴급 회수',
    badgeText: '제품 리콜',
    urgency: 'high',
    title: '해외 직구 초저가 어린이 완구 및 장신구 중금속(카드뮴·납) 기준치 300배 초과 긴급 회수',
    summary: '해외 직구 플랫폼에서 판매된 특정 슬라임 및 금속 목걸이 제품에서 발암물질인 납과 카드뮴이 기준치의 수백 배 초과 검출되어 통관 차단 및 즉각 폐기 권고 조치되었습니다.',
    targetAudience: '영유아 및 어린이 자녀를 둔 학부모, 직구 이용자',
    institution: '국가기술표준원 & 관세청',
    effectiveDate: '2026.09.10 긴급 발표',
    keyPoints: [
      '어린이 완구류 KC 인증 미부착 제품은 피부 접촉 및 흡입 시 신경계 장애 유발 위험',
      '구매 내역 증빙 시 직구 플랫폼에 "위해 제품 리콜 환불" 전액 청구 가능',
      '소비자24(consumer.go.kr) 리콜정보에서 해당 시리얼 및 바코드 즉시 대조 가능'
    ],
    actionGuide: [
      '1단계: 가정 내 대상 제품 확인 즉시 사용 중단 및 어린이 손이 닿지 않도록 밀봉 격리',
      '2단계: 직구 앱 주문 내역에서 제품 사진 캡처 후 위해 공문 링크 첨부하여 전액 환불 접수',
      '3단계: 반품 절차 없이 폐기 처분 승인 확인 후 전액 취소 완료'
    ],
    lawBasis: '제품안전기본법 제11조 및 어린이제품 안전 특별법',
    contactNumber: '1600-1384 (제품안전정보센터)',
    viewCount: 15300,
    shareCount: 1980,
    pinned: false
  },
  {
    id: 'alert-05',
    category: 'law',
    categoryLabel: '법 개정/의무 시행',
    badgeText: '권리 고지',
    urgency: 'medium',
    title: '배달 플랫폼 라이더 배달 지연 및 음식 식음·파손 시 "플랫폼 책임 보상제" 가이드',
    summary: '라이더의 다중 묶음 배달로 음식이 식거나 변질되었을 경우, 음식점주가 아닌 배달 플랫폼이 직접 주문 취소 및 환불을 책임지는 공식 분쟁 처리 기준이 적용됩니다.',
    targetAudience: '배달앱(배민, 요기요, 쿠팡이츠 등) 정기 이용자',
    institution: '공정거래위원회 배달플랫폼 표준계약서',
    effectiveDate: '2026.07.01 시행',
    keyPoints: [
      '예상 배달 소요 시간을 20분 이상 초과하여 품질이 저하된 경우 즉시 수령 거부 가능',
      '국물 넘침, 용기 파손 시 사진 1장 첨부로 5분 내 전액 환불 또는 쿠폰 재발행',
      '가게 점주와 싸울 필요 없이 플랫폼 고객센터 [라이더 배달 과실] 전담 채널로 즉시 처리'
    ],
    actionGuide: [
      '1단계: 수령 즉시 포장 훼손 부위 및 음식 상태 사진 선명하게 촬영',
      '2단계: 배달앱 고객센터 1:1 실시간 상담톡에 "배달 지연 및 음식 파손 상태" 접수',
      '3단계: 즉시 승인 및 결제 취소 (점주 통화 불필요, 배달사 라이더 보험 처리)'
    ],
    lawBasis: '전자상거래법 제20조 및 배달플랫폼 사업자 자율규제 가이드라인',
    contactNumber: '1372 (소비자상담센터)',
    viewCount: 22100,
    shareCount: 1840,
    pinned: false
  },
  {
    id: 'alert-06',
    category: 'benefit',
    categoryLabel: '전국민 알짜 혜택',
    badgeText: '놓치면 손해',
    urgency: 'normal',
    title: '통신 3사(SKT·KT·LGU+) 휴대폰 "선택약정 25% 요금할인" 1년 주기 재신청 알림',
    summary: '스마트폰 24개월 약정이 끝났거나 자급제폰을 쓰는 국민이라면, 통신사에 25% 요금할인을 1년 단위로 재약정 신청하여 매달 1~2만 원의 통신비를 즉시 절약할 수 있습니다.',
    targetAudience: '스마트폰 2년 이상 사용자 및 자급제·알뜰 단말기 이용자',
    institution: '과학기술정보통신부 & 방송통신위원회',
    effectiveDate: '연중 상시 접수',
    keyPoints: [
      '약정 2년 종료 후 아무것도 안 하면 매달 25%의 기본요금을 그냥 통신사에 기부하는 셈',
      '약정 기간은 2년보다 "1년 단위"로 설정해야 중도 기기 변경 시 위약금 리스크 제로',
      '통신사 114 고객센터 전화 또는 스마트초이스(smartchoice.or.kr)에서 10초 만에 가입'
    ],
    actionGuide: [
      '1단계: 휴대폰에서 114 전화 후 "선택약정 요금할인 재가입 대상 확인" 요청',
      '2단계: 1년(12개월) 선택약정 가입 승인 (월 요금의 25% 매달 자동 차감 확인)',
      '3단계: 캘린더에 1년 뒤 만료 알림 등록해 두고 1년마다 무한 갱신'
    ],
    lawBasis: '이동통신단말장치 유통구조 개선에 관한 법률(단통법) 제6조',
    contactNumber: '국번없이 114 (통신사 전담)',
    viewCount: 45100,
    shareCount: 6540,
    pinned: false
  },
  {
    id: 'alert-07',
    category: 'urgent',
    categoryLabel: '긴급 피해주의보',
    badgeText: '금융 사기 경보',
    urgency: 'high',
    title: '모바일 부고장·모바일 청첩장 사칭 "스미싱 악성앱 설치" 피해 확산 긴급 주의보',
    summary: '지인의 이름으로 도착한 부고장/청첩장 URL을 누르는 순간 악성 APK가 설치되어 예금 탈취 및 지인들에게 동일 문자가 자동 대량 발송되는 피해가 급증하고 있습니다.',
    targetAudience: '스마트폰 이용 전 국민 (특히 40~60대 집중 타겟)',
    institution: '경찰청 국가수사본부 & 금융감독원',
    effectiveDate: '2026.09.12 발령',
    keyPoints: [
      '출처가 불분명한 문자 내 링크(.apk, .kr 등)는 어떠한 경우에도 클릭 금지',
      '실수로 링크를 누르고 앱을 설치했다면 즉시 비행기 탑승 모드(AirPlane)로 전환해 외부 통신 차단',
      '금융결제원 [계좌정보통합관리서비스(어카운트인포)]에서 본인 명의 전 계좌 일괄 지급정지 등록'
    ],
    actionGuide: [
      '1단계: 악성 앱 설치 의심 즉시 [비행기 탑승 모드] 켜서 데이터/와이파이 차단',
      '2단계: 다른 PC나 전화기로 금융감독원(1332) 또는 112 경찰청에 "본인 계좌 일괄 지급정지" 신청',
      '3단계: 통신사 고객센터에 명의도용방지서비스(M-Safer) 즉시 가입 및 서비스센터 방문 기기 초기화'
    ],
    lawBasis: '전기통신금융사기 피해 방지 및 피해금 환급에 관한 특별법',
    contactNumber: '112 (경찰청), 1332 (금융감독원)',
    viewCount: 52900,
    shareCount: 8870,
    pinned: true
  },
  {
    id: 'alert-08',
    category: 'safety',
    categoryLabel: '식품/제품 안전 긴급 회수',
    badgeText: '식품 안전',
    urgency: 'medium',
    title: '생수통·배달용기 직사광선 방치 시 "미세플라스틱 및 환경호르몬 용출" 주의 요령',
    summary: '여름철 야외 및 베란다에 장시간 보관된 페트병 생수와 뜨거운 음식을 담은 일회용 배달용기는 환경호르몬(비스페놀A) 용출 위험이 급증하므로 즉시 교체 및 폐기를 권고합니다.',
    targetAudience: '생수 정기배송 및 배달음식 자주 이용하는 1~2인 가구',
    institution: '식품의약품안전처',
    effectiveDate: '2026.08.20 고지',
    keyPoints: [
      '직사광선에 24시간 이상 노출된 페트병 생수는 음용을 중지하고 식물 주기 등으로 활용',
      '배달음식 전자레인지 재가열 시 용기 하단 [PP(폴리프로필렌)] 마크 확인 필수',
      '찌그러지거나 햇볕에 변색된 생수 배송 수령 시 택배사/생수사에 즉시 교환 요청 권리 발생'
    ],
    actionGuide: [
      '1단계: 베란다 및 복도 보관 생수를 즉시 서늘한 그늘(실내 펜트리 또는 냉장고)로 이동',
      '2단계: 뚜껑 변형이나 냄새 이상 시 사진 촬영 후 판매처에 1:1 무료 맞교환 접수',
      '3단계: 배달음식 수령 후 가열 시에는 반드시 가정용 사기/내열유리 그릇으로 옮겨 담기'
    ],
    lawBasis: '식품위생법 제9조 기구 및 용기·포장의 기준 및 규격',
    contactNumber: '1399 (부정·불량식품 신고센터)',
    viewCount: 19800,
    shareCount: 1650,
    pinned: false
  },
  {
    id: 'alert-09',
    category: 'partner',
    categoryLabel: '공식 제휴사 기업 알림',
    badgeText: '현대차 공식 리콜',
    urgency: 'high',
    title: '현대자동차 아이오닉 5·6 및 제네시스 GV60 "ICCU(통합충전제어장치) 무상 점검 및 소프트웨어 업데이트"',
    summary: '현대자동차 공식 서비스센터(블루핸즈)에서 주행 중 경고등 점등 및 12V 배터리 저전압 방전을 예방하기 위해 ICCU 소프트웨어 무상 업데이트 및 필요 부품 전액 무상 교체를 전국 실시합니다.',
    targetAudience: '현대차 전기차(아이오닉 5, 6), 제네시스(GV60, GV70/G80 전동화) 소유 차주 전원',
    institution: '현대자동차 & 국토교통부',
    effectiveDate: '2026.09.10 시행',
    keyPoints: [
      '전국 1,300여 개 현대차 블루핸즈 및 하이테크센터에서 전액 무상(공임비 무료) 작업 진행',
      '소프트웨어 업데이트 소요 시간 약 25분 (점검 후 부품 이상 시 ICCU 신품 무상 교체)',
      '마이현대(myHyundai) 앱 또는 현대차 고객센터 예약 후 방문 시 대기 없이 당일 처리'
    ],
    actionGuide: [
      '1단계: [마이현대] 앱 실행 > 차량 관리 > 리콜/무상수리 대상 여부 차대번호 조회',
      '2단계: 인근 블루핸즈 검색 후 "ICCU 무상점검 업데이트" 사전 정비 예약 접수',
      '3단계: 정비 완료 후 점검 명세서 수령 및 배터리 완충 테스트 진행'
    ],
    lawBasis: '자동차관리법 제31조(제작결함의 시정) 및 현대자동차 보증수리 특별약관',
    contactNumber: '080-600-6000 (현대자동차 고객센터)',
    viewCount: 42100,
    shareCount: 3950,
    pinned: true
  },
  {
    id: 'alert-10',
    category: 'partner',
    categoryLabel: '공식 제휴사 기업 알림',
    badgeText: '삼성전자 사전예약',
    urgency: 'normal',
    title: '삼성전자 갤럭시 Z 폴드8 & 플립8 "전국 공식 사전판매 개시 및 파손보상 2년 무상 혜택"',
    summary: '초슬림 티타늄 힌지와 AI 온디바이스 2.0이 탑재된 갤럭시 Z 폴드8·플립8 공식 런칭. 공식 사전예약 고객 전원 더블 스토리지(512GB 무료 업그레이드) 및 삼성케어플러스 파손보장 2년권을 무상 제공합니다.',
    targetAudience: '스마트폰 교체 예정 국민, 갤럭시 폴더블 신제품 구매 희망자',
    institution: '삼성전자 공식 파트너십',
    effectiveDate: '2026.09.15 시작',
    keyPoints: [
      '256GB 가격으로 512GB 모델 단말기를 제공하는 더블 스토리지 프로모션 적용',
      '삼성케어플러스 2년 파손보장권(자기부담금 80% 지원) 및 정품 케이스 무상 증정',
      '기존 중고 갤럭시 반납 시 시세 대비 최대 25만원 추가 보상(Galaxy Trade-In)'
    ],
    actionGuide: [
      '1단계: 삼성닷컴 또는 제휴 통신사 공식 사전예약 신청서 작성',
      '2단계: 단말 수령 후 삼성멤버스(Samsung Members) 앱에서 [사전구매 사은품 신청] 배너 클릭',
      '3단계: 개통 확인 완료 후 삼성케어플러스 2년권 자동 등록 상태 확인'
    ],
    lawBasis: '전자상거래법 및 삼성전자 공식 프로모션 소비자 권익 보호 규정',
    contactNumber: '1588-3366 (삼성전자 서비스/고객상담)',
    viewCount: 68500,
    shareCount: 6420,
    pinned: true
  },
  {
    id: 'alert-11',
    category: 'partner',
    categoryLabel: '공식 제휴사 기업 알림',
    badgeText: 'LG전자 무상케어',
    urgency: 'medium',
    title: 'LG전자 휘센 에어컨·오브제컬렉션 "환절기 분해 세척 사전 점검 및 필터 무상 클리닝 캠페인"',
    summary: '가을 환절기를 맞아 곰팡이 및 악취 예방을 위한 LG 휘센 공식 방문 클리닝 30% 할인 및 핵심 센서·냉매 무상 점검 캠페인을 실시합니다.',
    targetAudience: 'LG 에어컨, 공기청정기, 스타일러 보유 가정',
    institution: 'LG전자 고객서비스',
    effectiveDate: '2026.09.01~10.31',
    keyPoints: [
      'LG 전문 엔지니어가 직접 방문하여 냉매 압력, 컴프레서 이상 유무 무료 측정',
      '전문 고압 분해 세척 신청 시 제휴사 30% 즉시 할인 바우처 지원',
      'LG ThinQ 앱 연동 고객 대상 추가 에어로타워 필터 교환권 추첨 증정'
    ],
    actionGuide: [
      '1단계: [LG ThinQ] 앱 접속 후 마이페이지의 [가을맞이 사전점검 케어] 신청',
      '2단계: 방문 희망 일정 지정 및 방문 엔지니어 안전 확인',
      '3단계: 무상 진단 점검표 수령 및 필터 관리 팁 안내 수강'
    ],
    lawBasis: '소비자기본법 품질보증기준 및 LG전자 서비스 품질 가이드',
    contactNumber: '1544-7777 (LG전자 고객센터)',
    viewCount: 23400,
    shareCount: 1890,
    pinned: false
  },
  {
    id: 'alert-12',
    category: 'partner',
    categoryLabel: '공식 제휴사 기업 알림',
    badgeText: '쿠팡 로켓와우 안내',
    urgency: 'normal',
    title: '쿠팡 와우 멤버십 "단순 변심 30일 무료 반품 규정 준수 및 쿠팡플레이 4K 무료 전환 안내"',
    summary: '쿠팡이 와우 멤버십 회원을 위한 30일 무료 반품/교환 보장 원칙과 무료 로켓배송 혜택, 그리고 쿠팡플레이 4K HDR 전면 무료 업그레이드 내용을 공식 고지합니다.',
    targetAudience: '쿠팡 와우 멤버십 이용자 및 온라인 쇼핑 소비자',
    institution: '쿠팡(주) 고객감동팀',
    effectiveDate: '2026.09.01 개편',
    keyPoints: [
      '로켓배송 상품은 개봉 후에도 제품 하자가 없거나 단순 변심인 경우 30일 이내 무조건 무료 반품 보장',
      '쿠팡이츠 주문 시 매 주문 10% 자동 할인 또는 무료배달 상시 적용',
      '와우 회원 전용 쿠팡플레이 스포츠/오리지널 4K 화질 추가 요금 없이 전면 개방'
    ],
    actionGuide: [
      '1단계: 주문목록에서 [반품/교환 신청] 클릭 후 사유 선택',
      '2단계: 문 앞에 반품 상품 포장 후 두면 다음 날 쿠팡 기사님이 무상 수거',
      '3단계: 수거 완료 즉시 결제 수단으로 환불금 전액 자동 입금'
    ],
    lawBasis: '전자상거래법 및 쿠팡 이용약관 소비자 우대 규정',
    contactNumber: '1577-7011 (쿠팡 고객센터)',
    viewCount: 38900,
    shareCount: 3100,
    pinned: false
  }
];
