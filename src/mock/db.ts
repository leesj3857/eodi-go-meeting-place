// 데모(mock) 모드의 인메모리 DB. localStorage에 저장되어 새로고침 후에도 유지됩니다.
import {
  ADDRESSES,
  CATEGORY_LABEL,
  DEMO_CODE,
  DEMO_MEETING,
  PLACES_BY_STATION,
  STATIONS,
  MockStation,
} from './data';
import type { Meeting } from '../api/meeting';
import type {
  Participant,
  ParticipantGetResponse,
  ParticipantRegisterResponse,
} from '../api/participant';
import type { MidpointResponseDto, PlaceItem, PlaceResponseDto } from '../api/place';
import type { VoteResponse, VoteResultResponse } from '../api/vote';

const STORAGE_KEY = 'eodigo-mock-db-v1';

interface StoredParticipant extends Participant {
  participantId: number;
  accessToken: string;
  votes: number[]; // slotNo
}

interface StoredMeeting {
  linkCode: string;
  name: string;
  purpose: string;
  nextParticipantId: number;
  participants: StoredParticipant[];
}

interface DbState {
  meetings: Record<string, StoredMeeting>;
}

export class MockHttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// ---------- 저장/로드 ----------

let state: DbState | null = null;

const load = (): DbState => {
  if (state) return state;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      state = JSON.parse(raw) as DbState;
      if (!state.meetings) state = { meetings: {} };
    }
  } catch {
    state = null;
  }
  if (!state) state = { meetings: {} };
  if (!state.meetings[DEMO_CODE]) {
    state.meetings[DEMO_CODE] = buildDemoMeeting();
    save();
  }
  return state;
};

const save = () => {
  if (!state) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // 저장 실패는 무시 (시크릿 모드 등)
  }
};

// ---------- 유틸 ----------

const makeToken = (code: string, id: number) =>
  `mock-${code}-${id}-${Math.random().toString(36).slice(2, 10)}`;

const makeLinkCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 8; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
};

const distanceKm = (aLat: number, aLng: number, bLat: number, bLng: number) => {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

// 이동 시간(초) 추정: 대중교통 22km/h, 자동차 28km/h + 기본 대기 5분
const travelSeconds = (km: number, transportType: string) => {
  const speed = transportType === 'CAR' ? 28 : 22;
  return Math.round((km / speed) * 3600 + 300);
};

const getMeetingOrThrow = (code: string): StoredMeeting => {
  const meeting = load().meetings[code];
  if (!meeting) throw new MockHttpError(404, `모임을 찾을 수 없습니다: ${code}`);
  return meeting;
};

const getMeOrThrow = (meeting: StoredMeeting, token?: string): StoredParticipant => {
  if (!token) throw new MockHttpError(401, '인증 토큰이 없습니다.');
  const me = meeting.participants.find((p) => p.accessToken === token);
  if (!me) throw new MockHttpError(401, '유효하지 않은 토큰입니다.');
  return me;
};

const pickStation = (meeting: StoredMeeting): MockStation => {
  const ps = meeting.participants;
  if (ps.length === 0) return STATIONS[0];
  const cLat = ps.reduce((s, p) => s + p.lat, 0) / ps.length;
  const cLng = ps.reduce((s, p) => s + p.lng, 0) / ps.length;
  let best = STATIONS[0];
  let bestD = Infinity;
  for (const st of STATIONS) {
    const d = distanceKm(cLat, cLng, st.lat, st.lng);
    if (d < bestD) {
      bestD = d;
      best = st;
    }
  }
  return best;
};

const buildPlaceItems = (station: MockStation, votedSlots: number[]): PlaceItem[] =>
  PLACES_BY_STATION[station.id].map((seed, idx) => {
    const slotNo = idx + 1;
    return {
      placeId: `${station.id}-${slotNo}`,
      name: seed.name,
      category: seed.category,
      latitude: +(station.lat + seed.dLat).toFixed(6),
      longitude: +(station.lng + seed.dLng).toFixed(6),
      address: seed.address,
      slotNo,
      url: `https://map.naver.com/p/search/${encodeURIComponent(seed.name)}`,
      votedByMe: votedSlots.includes(slotNo),
    };
  });

const toParticipantGet = (p: StoredParticipant): ParticipantGetResponse => ({
  participantId: p.participantId,
  name: p.name,
  transportType: p.transportType,
  lat: p.lat,
  lng: p.lng,
  hasVoted: p.votes.length > 0,
  address: p.address,
});

const buildDemoMeeting = (): StoredMeeting => {
  const participants: StoredParticipant[] = DEMO_MEETING.participants.map((seed, i) => {
    const addr = ADDRESSES.find((a) => a.bdNm === seed.addressKey)!;
    const id = i + 1;
    return {
      participantId: id,
      name: seed.name,
      address: `${addr.bdNm} (${addr.roadAddrPart1})`,
      transportType: seed.transportType,
      lat: addr.lat,
      lng: addr.lng,
      votes: [...seed.votes],
      accessToken: `mock-${DEMO_CODE}-${id}-demo`,
    };
  });
  return {
    linkCode: DEMO_CODE,
    name: DEMO_MEETING.name,
    purpose: DEMO_MEETING.purpose,
    nextParticipantId: participants.length + 1,
    participants,
  };
};

// ---------- 공개 API (adapter에서 호출) ----------

export const db = {
  createMeeting(data: { name: string; purpose: string }) {
    const s = load();
    let code = makeLinkCode();
    while (s.meetings[code]) code = makeLinkCode();
    s.meetings[code] = {
      linkCode: code,
      name: data.name,
      purpose: data.purpose,
      nextParticipantId: 1,
      participants: [],
    };
    save();
    return { linkCode: code };
  },

  getMeeting(code: string): Meeting {
    const m = getMeetingOrThrow(code);
    return { name: m.name, purpose: m.purpose };
  },

  registerParticipant(code: string, data: Participant): ParticipantRegisterResponse {
    const m = getMeetingOrThrow(code);
    const id = m.nextParticipantId++;
    const p: StoredParticipant = {
      participantId: id,
      name: data.name,
      address: data.address,
      transportType: data.transportType,
      lat: data.lat,
      lng: data.lng,
      votes: [],
      accessToken: makeToken(code, id),
    };
    m.participants.push(p);
    save();
    return {
      participantId: id,
      accessToken: p.accessToken,
      expiresIn: 60 * 60 * 24 * 30,
      participantName: p.name,
    };
  },

  getParticipants(code: string): ParticipantGetResponse[] {
    return getMeetingOrThrow(code).participants.map(toParticipantGet);
  },

  getMyParticipant(code: string, token?: string): ParticipantGetResponse {
    return toParticipantGet(getMeOrThrow(getMeetingOrThrow(code), token));
  },

  updateParticipant(code: string, token: string | undefined, data: Participant) {
    const me = getMeOrThrow(getMeetingOrThrow(code), token);
    me.name = data.name;
    me.address = data.address;
    me.transportType = data.transportType;
    me.lat = data.lat;
    me.lng = data.lng;
    save();
    return {
      name: me.name,
      address: me.address,
      transportType: me.transportType,
      lat: me.lat,
      lng: me.lng,
    };
  },

  deleteParticipant(code: string, token?: string) {
    const m = getMeetingOrThrow(code);
    const me = getMeOrThrow(m, token);
    m.participants = m.participants.filter((p) => p.participantId !== me.participantId);
    save();
  },

  getMidpoint(code: string, token?: string): MidpointResponseDto {
    const m = getMeetingOrThrow(code);
    const station = pickStation(m);
    const times = m.participants.map((p) =>
      travelSeconds(distanceKm(p.lat, p.lng, station.lat, station.lng), p.transportType)
    );
    const avg = times.length ? times.reduce((a, b) => a + b, 0) / times.length : 0;
    const deviation = times.reduce((a, t) => a + Math.abs(t - avg), 0);
    const me = m.participants.find((p) => p.accessToken === token);
    const meIdx = me ? m.participants.indexOf(me) : -1;
    return {
      midpointId: station.id,
      name: station.name,
      latitude: station.lat,
      longitude: station.lng,
      line: `${station.lines[0]}호선`,
      avgTime: Math.round(avg),
      totalDeviation: Math.round(deviation),
      participantId: me?.participantId ?? 0,
      selfTimeSeconds: meIdx >= 0 ? times[meIdx] : 0,
      participantCount: m.participants.length,
    };
  },

  getSubwayLines(stationName: string): string[] {
    return STATIONS.find((s) => s.name === stationName)?.lines ?? [];
  },

  getPlaces(code: string, token?: string): PlaceResponseDto {
    const m = getMeetingOrThrow(code);
    const station = pickStation(m);
    const me = m.participants.find((p) => p.accessToken === token);
    const myVotes = me?.votes ?? [];
    const items = buildPlaceItems(station, myVotes);
    const sections = (['FOOD', 'FUN'] as const).map((key) => ({
      key,
      label: CATEGORY_LABEL[key],
      items: items.filter((it) => it.category === key),
    }));
    return { sections, myVoteSlotNos: [...myVotes], page: 0, hasMore: false };
  },

  vote(code: string, token: string | undefined, slotNo: number): VoteResponse {
    const me = getMeOrThrow(getMeetingOrThrow(code), token);
    const has = me.votes.includes(slotNo);
    me.votes = has ? me.votes.filter((s) => s !== slotNo) : [...me.votes, slotNo];
    save();
    return {
      myVoteSlotNos: [...me.votes],
      patches: [{ slotNo, votedByMe: !has }],
    };
  },

  getVoteResult(code: string, token?: string): VoteResultResponse {
    const m = getMeetingOrThrow(code);
    const station = pickStation(m);
    const me = m.participants.find((p) => p.accessToken === token);
    const counts = new Map<number, number>();
    for (const p of m.participants) for (const s of p.votes) counts.set(s, (counts.get(s) ?? 0) + 1);
    return buildPlaceItems(station, me?.votes ?? [])
      .map((item) => ({ ...item, voteCount: counts.get(item.slotNo) ?? 0 }))
      .filter((item) => item.voteCount > 0)
      .sort((a, b) => b.voteCount - a.voteCount || a.slotNo - b.slotNo)
      .slice(0, 5);
  },

  // 데모 모임을 초기 상태로 되돌리고, 호스트 로그인 정보를 반환합니다.
  resetDemo(): ParticipantRegisterResponse {
    const s = load();
    s.meetings[DEMO_CODE] = buildDemoMeeting();
    save();
    const host = s.meetings[DEMO_CODE].participants[0];
    return {
      participantId: host.participantId,
      accessToken: host.accessToken,
      expiresIn: 60 * 60 * 24 * 30,
      participantName: host.name,
    };
  },
};
