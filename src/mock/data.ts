// 데모(mock) 모드에서 사용하는 정적 데이터.
// 백엔드가 없는 상태에서 서비스 흐름을 재현하기 위한 용도이며,
// 장소·주소 정보는 실제와 다를 수 있습니다.

export interface MockStation {
  id: number;
  name: string;
  lines: string[]; // MainHeader의 lineColor 키와 맞춤 ('2', '경의', '공항' ...)
  lat: number;
  lng: number;
}

export interface MockPlaceSeed {
  name: string;
  category: 'FOOD' | 'FUN';
  address: string;
  dLat: number; // 역 기준 오프셋 (위도)
  dLng: number; // 역 기준 오프셋 (경도)
}

// 중간지점 후보 역. 참여자들의 중심 좌표와 가장 가까운 역이 선택됩니다.
export const STATIONS: MockStation[] = [
  { id: 1, name: '홍대입구', lines: ['2', '경의', '공항'], lat: 37.5571, lng: 126.9245 },
  { id: 2, name: '강남', lines: ['2', '신분당'], lat: 37.4979, lng: 127.0276 },
  { id: 3, name: '건대입구', lines: ['2', '7'], lat: 37.5403, lng: 127.0693 },
  { id: 4, name: '종로3가', lines: ['1', '3', '5'], lat: 37.5714, lng: 126.9918 },
  { id: 5, name: '여의도', lines: ['5', '9'], lat: 37.5216, lng: 126.9243 },
  { id: 6, name: '왕십리', lines: ['2', '5', '경의', '수인'], lat: 37.5612, lng: 127.0371 },
];

// 역별 추천 장소 (맛집 4 + 놀거리 3)
export const PLACES_BY_STATION: Record<number, MockPlaceSeed[]> = {
  1: [
    { name: '연남동 감나무집 기사식당', category: 'FOOD', address: '서울 마포구 동교로 41', dLat: 0.0042, dLng: -0.0038 },
    { name: '홍대 조폭떡볶이', category: 'FOOD', address: '서울 마포구 와우산로 21길', dLat: -0.0021, dLng: -0.0012 },
    { name: '연남 툭툭누들타이', category: 'FOOD', address: '서울 마포구 동교로 27', dLat: 0.0034, dLng: -0.0054 },
    { name: '홍대 하카타분코', category: 'FOOD', address: '서울 마포구 어울마당로 76', dLat: -0.0031, dLng: -0.0022 },
    { name: '홍대 레드버튼 보드게임카페', category: 'FUN', address: '서울 마포구 홍익로 5길', dLat: -0.0014, dLng: -0.0031 },
    { name: '경의선숲길 연남동 구간', category: 'FUN', address: '서울 마포구 연남동', dLat: 0.0038, dLng: -0.0026 },
    { name: '홍대 코인노래방 세븐스타', category: 'FUN', address: '서울 마포구 와우산로 29길', dLat: -0.0028, dLng: -0.0006 },
  ],
  2: [
    { name: '강남 마더린러베이글', category: 'FOOD', address: '서울 강남구 강남대로 102길', dLat: 0.0016, dLng: 0.0021 },
    { name: '역삼 봉은사 삼계탕', category: 'FOOD', address: '서울 강남구 테헤란로 8길', dLat: 0.0012, dLng: 0.0044 },
    { name: '강남 육쌈냉면', category: 'FOOD', address: '서울 강남구 강남대로 96길', dLat: 0.0029, dLng: 0.0013 },
    { name: '강남 파이브가이즈', category: 'FOOD', address: '서울 서초구 강남대로 435', dLat: -0.0018, dLng: -0.0009 },
    { name: '강남 VR스퀘어', category: 'FUN', address: '서울 강남구 강남대로 98길', dLat: 0.0024, dLng: 0.0026 },
    { name: '강남 방탈출 키이스케이프', category: 'FUN', address: '서울 강남구 강남대로 94길', dLat: 0.0031, dLng: 0.0019 },
    { name: '강남 CGV 씨네시티', category: 'FUN', address: '서울 강남구 강남대로 438', dLat: -0.0006, dLng: 0.0004 },
  ],
  3: [
    { name: '건대 양꼬치거리 만리성', category: 'FOOD', address: '서울 광진구 동일로 18길', dLat: -0.0019, dLng: 0.0011 },
    { name: '건대 히츠지야', category: 'FOOD', address: '서울 광진구 아차산로 33길', dLat: 0.0014, dLng: 0.0024 },
    { name: '건대 도스타코스', category: 'FOOD', address: '서울 광진구 능동로 13길', dLat: 0.0027, dLng: 0.0008 },
    { name: '건대 몽중헌', category: 'FOOD', address: '서울 광진구 동일로 22길', dLat: -0.0011, dLng: 0.0029 },
    { name: '커먼그라운드', category: 'FUN', address: '서울 광진구 아차산로 200', dLat: 0.0033, dLng: 0.0013 },
    { name: '건대 롯데시네마', category: 'FUN', address: '서울 광진구 능동로 92', dLat: -0.0003, dLng: 0.0018 },
    { name: '건대 다트펍 불릿', category: 'FUN', address: '서울 광진구 동일로 20길', dLat: -0.0016, dLng: 0.0021 },
  ],
  4: [
    { name: '익선동 열두달', category: 'FOOD', address: '서울 종로구 수표로 28길', dLat: 0.0016, dLng: -0.0021 },
    { name: '종로 광장시장 순희네 빈대떡', category: 'FOOD', address: '서울 종로구 창경궁로 88', dLat: -0.0006, dLng: 0.0063 },
    { name: '익선동 온천집', category: 'FOOD', address: '서울 종로구 돈화문로 11나길', dLat: 0.0019, dLng: -0.0009 },
    { name: '종로 토속촌 삼계탕', category: 'FOOD', address: '서울 종로구 자하문로 5길', dLat: 0.0054, dLng: -0.0187 },
    { name: '익선동 낙원상가 실버영화관', category: 'FUN', address: '서울 종로구 삼일대로 428', dLat: 0.0004, dLng: -0.0012 },
    { name: '종묘 산책', category: 'FUN', address: '서울 종로구 종로 157', dLat: 0.0028, dLng: 0.0041 },
    { name: '인사동 쌈지길', category: 'FUN', address: '서울 종로구 인사동길 44', dLat: 0.0027, dLng: -0.0064 },
  ],
  5: [
    { name: '여의도 진주집', category: 'FOOD', address: '서울 영등포구 국제금융로 6길', dLat: 0.0009, dLng: 0.0017 },
    { name: '여의도 정인면옥', category: 'FOOD', address: '서울 영등포구 국제금융로 6길', dLat: 0.0012, dLng: 0.0026 },
    { name: '더현대 서울 푸드코트', category: 'FOOD', address: '서울 영등포구 여의대로 108', dLat: 0.0041, dLng: 0.0041 },
    { name: '여의도 신길동 매운짬뽕', category: 'FOOD', address: '서울 영등포구 여의나루로 60', dLat: -0.0018, dLng: 0.0032 },
    { name: '여의도 한강공원', category: 'FUN', address: '서울 영등포구 여의동로 330', dLat: 0.0061, dLng: 0.0088 },
    { name: '더현대 서울 사운즈포레스트', category: 'FUN', address: '서울 영등포구 여의대로 108', dLat: 0.0044, dLng: 0.0045 },
    { name: 'IFC몰 CGV 여의도', category: 'FUN', address: '서울 영등포구 국제금융로 10', dLat: 0.0031, dLng: 0.0018 },
  ],
  6: [
    { name: '왕십리 곱창골목 대감집', category: 'FOOD', address: '서울 성동구 마조로 3길', dLat: 0.0033, dLng: 0.0004 },
    { name: '왕십리 엔터식스 무스쿠스', category: 'FOOD', address: '서울 성동구 왕십리광장로 17', dLat: 0.0005, dLng: 0.0004 },
    { name: '성수 소문난 성수감자탕', category: 'FOOD', address: '서울 성동구 연무장길 45', dLat: -0.0139, dLng: 0.0182 },
    { name: '한양대 앞 라멘 멘야하나비', category: 'FOOD', address: '서울 성동구 왕십리로 222', dLat: -0.0014, dLng: 0.0069 },
    { name: '왕십리 CGV', category: 'FUN', address: '서울 성동구 왕십리광장로 17', dLat: 0.0004, dLng: 0.0007 },
    { name: '서울숲', category: 'FUN', address: '서울 성동구 뚝섬로 273', dLat: -0.0166, dLng: 0.0004 },
    { name: '성수 볼링장 락볼링', category: 'FUN', address: '서울 성동구 아차산로 17', dLat: -0.0148, dLng: 0.0166 },
  ],
};

export const CATEGORY_LABEL: Record<'FOOD' | 'FUN', string> = {
  FOOD: '맛집',
  FUN: '놀거리',
};

// 주소 검색(도로명주소 API 대체) + 지오코딩(vWorld 대체)에 사용하는 테이블
export interface MockAddress {
  bdNm: string;        // 건물/장소명 (검색 드롭다운 표시용)
  roadAddrPart1: string;
  lat: number;
  lng: number;
}

export const ADDRESSES: MockAddress[] = [
  { bdNm: '홍대입구역', roadAddrPart1: '서울특별시 마포구 양화로 160', lat: 37.5571, lng: 126.9245 },
  { bdNm: '합정역', roadAddrPart1: '서울특별시 마포구 양화로 55', lat: 37.5496, lng: 126.9138 },
  { bdNm: '신촌역', roadAddrPart1: '서울특별시 서대문구 신촌로 90', lat: 37.5551, lng: 126.9368 },
  { bdNm: '이대역', roadAddrPart1: '서울특별시 마포구 신촌로 지하 180', lat: 37.5567, lng: 126.9459 },
  { bdNm: '서울역', roadAddrPart1: '서울특별시 용산구 한강대로 405', lat: 37.5547, lng: 126.9707 },
  { bdNm: '서울시청', roadAddrPart1: '서울특별시 중구 세종대로 110', lat: 37.5663, lng: 126.9779 },
  { bdNm: '종로3가역', roadAddrPart1: '서울특별시 종로구 종로 지하 129', lat: 37.5714, lng: 126.9918 },
  { bdNm: '혜화역', roadAddrPart1: '서울특별시 종로구 대학로 지하 120', lat: 37.5822, lng: 127.0019 },
  { bdNm: '성신여대입구역', roadAddrPart1: '서울특별시 성북구 동소문로 지하 102', lat: 37.5927, lng: 127.0165 },
  { bdNm: '수유역', roadAddrPart1: '서울특별시 강북구 도봉로 지하 338', lat: 37.6377, lng: 127.0255 },
  { bdNm: '노원역', roadAddrPart1: '서울특별시 노원구 상계로 지하 69', lat: 37.6553, lng: 127.0614 },
  { bdNm: '왕십리역', roadAddrPart1: '서울특별시 성동구 왕십리광장로 17', lat: 37.5612, lng: 127.0371 },
  { bdNm: '건대입구역', roadAddrPart1: '서울특별시 광진구 아차산로 지하 243', lat: 37.5403, lng: 127.0693 },
  { bdNm: '천호역', roadAddrPart1: '서울특별시 강동구 천호대로 지하 997', lat: 37.5386, lng: 127.1237 },
  { bdNm: '잠실역', roadAddrPart1: '서울특별시 송파구 올림픽로 지하 265', lat: 37.5133, lng: 127.1001 },
  { bdNm: '강남역', roadAddrPart1: '서울특별시 강남구 강남대로 지하 396', lat: 37.4979, lng: 127.0276 },
  { bdNm: '선릉역', roadAddrPart1: '서울특별시 강남구 테헤란로 지하 340', lat: 37.5045, lng: 127.0490 },
  { bdNm: '사당역', roadAddrPart1: '서울특별시 동작구 동작대로 지하 3', lat: 37.4766, lng: 126.9816 },
  { bdNm: '서울대입구역', roadAddrPart1: '서울특별시 관악구 남부순환로 지하 1822', lat: 37.4812, lng: 126.9527 },
  { bdNm: '구로디지털단지역', roadAddrPart1: '서울특별시 구로구 도림로 지하 1', lat: 37.4853, lng: 126.9015 },
  { bdNm: '신도림역', roadAddrPart1: '서울특별시 구로구 새말로 지하 117', lat: 37.5088, lng: 126.8912 },
  { bdNm: '목동역', roadAddrPart1: '서울특별시 양천구 목동로 지하 25', lat: 37.5260, lng: 126.8644 },
  { bdNm: '여의도역', roadAddrPart1: '서울특별시 영등포구 의사당대로 지하 44', lat: 37.5216, lng: 126.9243 },
  { bdNm: '김포공항역', roadAddrPart1: '서울특별시 강서구 하늘길 지하 77', lat: 37.5623, lng: 126.8012 },
  { bdNm: '연신내역', roadAddrPart1: '서울특별시 은평구 통일로 지하 849', lat: 37.6190, lng: 126.9210 },
  { bdNm: '정발산역', roadAddrPart1: '경기도 고양시 일산동구 중앙로 지하 1230', lat: 37.6594, lng: 126.7734 },
  { bdNm: '부평역', roadAddrPart1: '인천광역시 부평구 광장로 지하 16', lat: 37.4895, lng: 126.7243 },
  { bdNm: '판교역', roadAddrPart1: '경기도 성남시 분당구 판교역로 지하 160', lat: 37.3948, lng: 127.1112 },
  { bdNm: '서현역', roadAddrPart1: '경기도 성남시 분당구 분당로 지하 20', lat: 37.3849, lng: 127.1234 },
  { bdNm: '수원역', roadAddrPart1: '경기도 수원시 팔달구 덕영대로 924', lat: 37.2659, lng: 127.0001 },
  { bdNm: '안양역', roadAddrPart1: '경기도 안양시 만안구 만안로 232', lat: 37.4016, lng: 126.9226 },
  { bdNm: '구리역', roadAddrPart1: '경기도 구리시 건원대로 34번길 32', lat: 37.6033, lng: 127.1436 },
];

// 데모 모임 시드 (Home의 "데모 체험하기" 버튼으로 진입)
export const DEMO_CODE = 'DEMO2025';

export interface DemoParticipantSeed {
  name: string;
  addressKey: string; // ADDRESSES.bdNm
  transportType: 'PUBLIC' | 'CAR';
  votes: number[];    // slotNo 목록
}

export const DEMO_MEETING = {
  name: '텔레토B 종강 회식',
  purpose: 'SOCIAL',
  // 첫 번째가 호스트이며, 데모 진입 시 "나"로 로그인됩니다.
  participants: [
    { name: '승준', addressKey: '서울역', transportType: 'PUBLIC', votes: [] },
    { name: '민지', addressKey: '정발산역', transportType: 'PUBLIC', votes: [1, 5] },
    { name: '서연', addressKey: '성신여대입구역', transportType: 'PUBLIC', votes: [1, 6] },
    { name: '지훈', addressKey: '구로디지털단지역', transportType: 'CAR', votes: [3, 5] },
  ] as DemoParticipantSeed[],
};
