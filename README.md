# 📍 어디GO

**어디GO**는 여러 명이 모일 때 "어디서 만날지"를 정해주는 약속 장소 추천 서비스입니다.  
참여자들의 출발지와 교통수단을 바탕으로 **이동 시간이 가장 공평한 중간지점(지하철역)** 을 찾고,  
그 주변 맛집·놀거리를 추천한 뒤 **투표로 최종 장소를 결정**할 수 있도록 구성되었습니다.

---

## 🔗 데모 링크

**https://eodigo.netlify.app/**

프로젝트 종료 후 백엔드 서버가 더 이상 운영되지 않아, 프론트엔드가 단독으로 동작하도록 API 호출부를 `src/api` · `src/mock` 레이어로 분리하고 Mock 데이터로 전체 흐름을 재현했습니다.  
홈 화면의 **데모 모임 둘러보기** 버튼을 누르면 참여자 4명이 투표 중인 모임에 바로 입장할 수 있으며, 초대장 만들기 → 링크 공유 → 참여 → 투표 → 결과 확인까지 실제 서버 없이 체험할 수 있습니다.

---

## 🚀 주요 기능

- ✉️ **초대장 만들기**
  - 모임 목적(친목 / 프로젝트) 선택
  - 도로명주소 검색으로 출발지 입력, 교통수단(대중교통 / 자동차) 선택
  - 단계별 진행 상태 저장 및 이어서 작성하기
- 🔗 **초대 링크 공유**
  - 링크 복사 및 카카오톡 공유 (커스텀 템플릿)
  - 초대 링크로 접속한 참여자가 출발지·교통수단을 입력해 모임에 참여
- 🧭 **중간지점 계산**
  - 참여자 전원의 이동 시간을 고려한 최적 지하철역 추천
  - 환승 노선(호선) 배지와 평균 이동 시간 표시
- 🗺️ **네이버 지도 시각화**
  - 참여자 출발지와 추천 장소를 마커로 표시
  - 맛집 / 놀거리 카테고리별 바텀시트 목록과 지도 연동 포커스
- 🗳️ **장소 투표 및 결과**
  - 추천 장소에 다중 투표(토글) 및 실시간 반영
  - 득표순 랭킹, 참여자별 투표 현황 확인
- 👤 **참여자 관리**
  - 참여자별 발급 토큰(JWT) 기반 인증
  - 내 정보(이름 / 출발지 / 교통수단) 수정 및 모임 나가기

---

## 🛠️ 사용 기술 스택

### 📚 Frontend

- ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
- ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
- ![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
- ![TanStack Query](https://img.shields.io/badge/TanStack_Query-FF4154?style=for-the-badge)
- ![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge)

### 💄 스타일링 & 애니메이션

- ![Emotion](https://img.shields.io/badge/Emotion-DB7093?style=for-the-badge)
- ![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)
- ![Lottie](https://img.shields.io/badge/Lottie-00DDB3?style=for-the-badge)

### 📦 번들링

- ![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=FFD62E)

### 🗺 지도 및 API

- ![Naver Map](https://img.shields.io/badge/Naver%20Map-2DB400?style=for-the-badge&logoColor=white): **지도 시각화 및 마커**
- ![Kakao SDK](https://img.shields.io/badge/Kakao%20SDK-FFCD00?style=for-the-badge&logo=kakaotalk&logoColor=000000): **카카오톡 초대장 공유**
- ![Juso API](https://img.shields.io/badge/도로명주소%20API-1E6FBA?style=for-the-badge): **출발지 주소 검색**
- ![Seoul Open Data](https://img.shields.io/badge/서울%20열린데이터광장-E8412C?style=for-the-badge): **지하철역 호선 정보**

---

## 📁 프로젝트 구조

```
src
├── api        # axios 인스턴스 및 도메인별 API 함수 (meeting, participant, place, vote)
├── mock       # 데모 모드용 mock 어댑터·DB·정적 데이터
├── pages      # 라우트 단위 페이지 (Home, MakeInvitation, ReplyInvitation, Map, Result)
├── feature    # 페이지를 구성하는 기능 단위 컴포넌트
│   ├── makeInvitation   # 초대장 생성 단계별 폼
│   ├── replyInvitation  # 초대 응답 폼
│   ├── map              # 네이버 지도, 마커, 지도 훅
│   ├── mapHeader        # 중간지점·호선·이동시간 헤더
│   ├── bottomSheet      # 추천 장소 목록 바텀시트
│   └── result           # 투표 결과, 참여자 현황, 내 정보 수정
├── interface  # 공용 UI 컴포넌트 (주소 검색 입력, 토스트, 모달 등)
├── context    # 초대 코드 전역 상태
├── styles     # 컬러·타이포그래피·버튼 디자인 토큰
└── utils      # 지오코딩, 주소 검색, 지하철 호선 유틸
```

---