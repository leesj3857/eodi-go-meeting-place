// JSONP를 이용해 CORS를 우회하여 vWorld API를 호출합니다.
import { isMockMode, mockGeocode } from '../mock';

export interface LatLng {
  lat: number;
  lng: number;
}

type VWorldAddressType = 'road' | 'parcel';

// 입력이 "이름 (도로명주소)" 형태일 때, 괄호 안의 도로명주소만 추출
export function extractRoadAddress(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  const open = trimmed.lastIndexOf('(');
  const close = trimmed.lastIndexOf(')');
  if (open !== -1 && close !== -1 && close > open) {
    const inside = trimmed.slice(open + 1, close).trim();
    if (inside.length > 0) return inside;
  }
  return trimmed;
}

async function requestVWorldCoord(address: string, type: VWorldAddressType, apiKey: string) {
  const url = 'https://api.vworld.kr/req/address';
  const params: Record<string, string> = {
    service: 'address',
    request: 'getcoord',
    version: '2.0',
    crs: 'epsg:4326',
    address,
    format: 'json',
    type,
    key: apiKey,
  };

  return jsonpRequest(url, params);
}

function jsonpRequest(url: string, params: Record<string, string>, callbackParam: string = 'callback', timeoutMs: number = 10000): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      const callbackName = `__vworld_cb_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      (window as any)[callbackName] = (data: any) => {
        cleanup();
        resolve(data);
      };

      const query = new URLSearchParams(params);
      query.append(callbackParam, callbackName);

      const script = document.createElement('script');
      script.src = `${url}?${query.toString()}`;
      script.async = true;
      script.onerror = () => {
        cleanup();
        reject(new Error('JSONP 요청 실패'));
      };

      const timer = window.setTimeout(() => {
        cleanup();
        reject(new Error('JSONP 요청 타임아웃'));
      }, timeoutMs);

      function cleanup() {
        try {
          delete (window as any)[callbackName];
        } catch {
          (window as any)[callbackName] = undefined;
        }
        window.clearTimeout(timer);
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      }

      document.head.appendChild(script);
    } catch (e) {
      reject(e);
    }
  });
}

export async function getLatLngByAddress(address: string): Promise<LatLng | null> {
  if (!address || !address.trim()) return null;
  if (isMockMode) return mockGeocode(address);
  const normalizedAddress = extractRoadAddress(address);

  const apiKey = '9B2F5B73-7970-38B2-8342-C3C170DC59B7';
  if (!apiKey) {
    console.error('VWorld API Key (VITE_VWORLD_API_KEY)가 설정되어 있지 않습니다.');
    return null;
  }

  try {
    // 1차: 도로명 주소 기준 조회
    const first = await requestVWorldCoord(normalizedAddress, 'road', apiKey);
    if (first?.response?.status === 'OK') {
      const point = first.response.result?.point;
      const x = parseFloat(point?.x);
      const y = parseFloat(point?.y);
      if (!Number.isNaN(x) && !Number.isNaN(y)) {
        return { lat: y, lng: x };
      }
    }

    // 2차: 지번 주소 기준 조회 (도로명으로 실패 시)
    const second = await requestVWorldCoord(normalizedAddress, 'parcel', apiKey);
    if (second?.response?.status === 'OK') {
      const point = second.response.result?.point;
      const x = parseFloat(point?.x);
      const y = parseFloat(point?.y);
      if (!Number.isNaN(x) && !Number.isNaN(y)) {
        return { lat: y, lng: x };
      }
    }

    return null;
  } catch (error) {
    console.error('vWorld 지오코더 호출 실패:', error);
    return null;
  }
}

export default getLatLngByAddress;


