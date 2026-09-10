// 데모(mock) 모드 진입점.
// VITE_USE_MOCK=true 이면 백엔드/지오코딩/주소검색/지하철 API를 모두 로컬 데이터로 대체합니다.
import { ADDRESSES, DEMO_CODE } from './data';
import { db } from './db';
import type { JusoResult } from '../utils/jusoApi';
import type { LatLng } from '../utils/getLng';

export const isMockMode = import.meta.env.VITE_USE_MOCK === 'true';

export { mockAdapter } from './adapter';
export { DEMO_CODE };

const norm = (s: string) => s.replace(/\s+/g, '').toLowerCase();

// 도로명주소 API 대체: 로컬 주소 테이블에서 부분 일치 검색
export const mockSearchAddress = async (keyword: string): Promise<JusoResult[]> => {
  const q = norm(keyword);
  if (!q) return [];
  const hits = ADDRESSES.filter(
    (a) => norm(a.bdNm).includes(q) || norm(a.roadAddrPart1).includes(q)
  ).slice(0, 10);
  if (hits.length > 0) {
    return hits.map((a) => ({ bdNm: a.bdNm, roadAddr: a.roadAddrPart1, roadAddrPart1: a.roadAddrPart1 }));
  }
  // 테이블에 없는 입력도 진행할 수 있도록 임의 위치 항목을 하나 제공
  return [{ bdNm: keyword.trim(), roadAddr: '데모 임의 위치', roadAddrPart1: '데모 임의 위치' }];
};

// 문자열 해시 → 서울 시내 임의 좌표 (같은 입력은 항상 같은 좌표)
const hashToLatLng = (s: string): LatLng => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
  const a = (h % 10000) / 10000;
  const b = ((h >>> 8) % 10000) / 10000;
  return { lat: +(37.48 + a * 0.14).toFixed(6), lng: +(126.85 + b * 0.27).toFixed(6) };
};

export const mockGeocode = async (input: string): Promise<LatLng | null> => {
  const raw = input.trim();
  if (!raw) return null;
  const inside = raw.match(/\(([^)]*)\)\s*$/)?.[1]?.trim();
  const name = inside ? raw.slice(0, raw.lastIndexOf('(')).trim() : raw;
  const hit =
    ADDRESSES.find((a) => a.roadAddrPart1 === inside) ??
    ADDRESSES.find((a) => a.bdNm === name) ??
    ADDRESSES.find((a) => norm(a.bdNm).includes(norm(name)));
  if (hit) return { lat: hit.lat, lng: hit.lng };
  return hashToLatLng(raw);
};

// 서울 열린데이터광장 지하철 호선 API 대체
export const mockSubwayLines = async (stationName: string): Promise<string[]> =>
  db.getSubwayLines(stationName);

// 데모 모임을 초기화하고 호스트로 로그인한 뒤 초대코드를 반환
export const enterDemo = (): string => {
  const host = db.resetDemo();
  localStorage.setItem(DEMO_CODE, JSON.stringify(host));
  return DEMO_CODE;
};
