// axios 커스텀 어댑터: 실제 네트워크 대신 mock DB로 응답합니다.
import {
  AxiosAdapter,
  AxiosError,
  AxiosHeaders,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { db, MockHttpError } from './db';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// 로딩 애니메이션이 보이도록 약간의 지연을 둡니다.
const LATENCY_MS: [number, number] = [250, 600];

const getToken = (config: InternalAxiosRequestConfig): string | undefined => {
  const raw =
    config.headers instanceof AxiosHeaders
      ? config.headers.get('Authorization')
      : (config.headers as Record<string, unknown> | undefined)?.Authorization;
  if (typeof raw !== 'string') return undefined;
  return raw.replace(/^Bearer\s+/i, '') || undefined;
};

const parseBody = (config: InternalAxiosRequestConfig): unknown => {
  const { data } = config;
  if (data == null) return undefined;
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  }
  return data;
};

const route = (config: InternalAxiosRequestConfig): unknown => {
  const method = (config.method ?? 'get').toUpperCase();
  const url = new URL(config.url ?? '/', 'http://mock.local');
  const path = url.pathname.replace(/\/+$/, '') || '/';
  const token = getToken(config);
  const body = parseBody(config) as never;

  if (method === 'POST' && path === '/meetings') return db.createMeeting(body);

  const m = path.match(/^\/meetings\/([^/]+)(?:\/(.*))?$/);
  if (!m) throw new MockHttpError(404, `알 수 없는 경로: ${path}`);
  const code = m[1];
  const rest = m[2] ?? '';
  const key = `${method} ${rest}`;

  switch (key) {
    case 'GET info':
      return db.getMeeting(code);
    case 'POST participants/register':
      return db.registerParticipant(code, body);
    case 'GET participants':
      return db.getParticipants(code);
    case 'GET participants/me':
      return db.getMyParticipant(code, token);
    case 'PUT participants/update':
      return db.updateParticipant(code, token, body);
    case 'DELETE participants/delete':
      db.deleteParticipant(code, token);
      return undefined;
    case 'GET places':
      return db.getPlaces(code, token);
    case 'GET midpoint':
      return db.getMidpoint(code, token);
    case 'POST vote':
      return db.vote(code, token, (body as { slotNo: number }).slotNo);
    case 'GET result':
      return db.getVoteResult(code, token);
    default:
      throw new MockHttpError(404, `알 수 없는 경로: ${key}`);
  }
};

export const mockAdapter: AxiosAdapter = async (config) => {
  const [min, max] = LATENCY_MS;
  await delay(min + Math.random() * (max - min));

  const base = { config, headers: {}, request: {} };
  try {
    const data = route(config);
    const response: AxiosResponse = { ...base, data, status: 200, statusText: 'OK' };
    return response;
  } catch (e) {
    const status = e instanceof MockHttpError ? e.status : 500;
    const message = e instanceof Error ? e.message : String(e);
    const response: AxiosResponse = { ...base, data: { message }, status, statusText: message };
    throw new AxiosError(message, String(status), config, base.request, response);
  }
};
