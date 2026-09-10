import axios from "axios";
import { isMockMode, mockAdapter } from "../mock";

// API 기본 설정
const API_BASE_URL = "https://o-digo.com";

// axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: isMockMode ? "http://mock.invalid" : API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  ...(isMockMode ? { adapter: mockAdapter } : {}),
});

// 요청 인터셉터: /meetings/{code}/* 형태의 요청에 대해
// 로컬스토리지에 {code} 키로 저장된 JWT(accessToken)를 Bearer로 설정
// 단, 참가자 등록(/participants/register)은 제외
apiClient.interceptors.request.use((config) => {
  try {
    const url = config.url ?? "";

    if (url.includes("/participants/register")) {
      return config;
    }

    const match = url.match(/\/meetings\/([^/]+)/);
    const code = match?.[1];

    if (code) {
      const stored = localStorage.getItem(code);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const token = parsed?.accessToken;
          if (token) {
            config.headers = config.headers ?? {};
            (config.headers as any).Authorization = `Bearer ${token}`;
          }
        } catch {
          // ignore JSON parse error
        }
      }
    }
  } catch {
    // ignore
  }
  return config;
});

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API 요청 오류:", error);
    return Promise.reject(error);
  }
);


