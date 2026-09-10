import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { useMap } from "../hooks/useMap";
import MapMarker from "../interface/MapMarker";
import styled from "@emotion/styled";
import BottomSheet from "../../bottomSheet";
import { type MapPlace } from "../types/marker";
import { votePlace } from "../../../api/vote";
import { useInviteCode } from "../../../context/inviteCodeContext";
import { useQueryClient } from "@tanstack/react-query";
import ParticipantMarker from "../interface/ParticipantMarker";
import { ParticipantGetResponse } from "../../../api/participant";
import { createRoot } from "react-dom/client";

const MapPage = ({mode, setMode, places, participants, refetchPlaces, refetchMidpoint, refetchMeeting, refetchParticipants, refetchLine, selectedPlaceId}: {
  mode: 'hide' | 'half' | 'full', 
  setMode: (mode: 'hide' | 'half' | 'full') => void,
  places: MapPlace[],
  participants: ParticipantGetResponse[],
  refetchPlaces: () => void,
  refetchMidpoint: () => void,
  refetchMeeting: () => void,
  refetchParticipants: () => void,
  refetchLine: () => void,
  selectedPlaceId?: string
}) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const { map } = useMap({ mapRef, places, participants });
  const { inviteCode } = useInviteCode();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState("맛집");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [hasAutoFocused, setHasAutoFocused] = useState(false);
  const [urlSelectedPlaceId, setUrlSelectedPlaceId] = useState<string | null>(selectedPlaceId || null);
  const filteredPlaces = useMemo(() => {
    return places.filter(p => p.label === selectedCategory);
  }, [places, selectedCategory]);
  
  const focusToIndex = useCallback(
    (idx: number, showOverlayOnSheet = false) => {
      setSelectedIndex(idx);

      // 마커 클릭에서 SelectedPlace 오버레이를 띄우고 싶다면 'hide'로 내리기
      // (리스트 클릭은 BottomSheet 내부에서 이미 처리함)
      // setMode(showOverlayOnSheet ? "hide" : "half");

      const api = markerApiRef.current[idx];
      if (!api || !map || !(window as any).naver?.maps) return;

      const { lat, lng } = api.getLatLng();
      const naver = (window as any).naver;
      
      // 지도 이동을 약간 지연시켜 마커 API가 준비될 시간을 줌
      setTimeout(() => {
        map.panTo(new naver.maps.LatLng(lat, lng));
        api.focus();
      }, 50);
    },
    [map, setMode]
  );

  // 카테고리가 바뀌었을 때(또는 최초 로드 시)만 지도 범위 업데이트.
  // 투표 후 places 재조회로 filteredPlaces 참조가 바뀌어도 지도 위치를 유지한다.
  const fittedCategoryRef = useRef<string | null>(null);
  useEffect(() => {
    if (!map || filteredPlaces.length === 0) return;
    if (fittedCategoryRef.current === selectedCategory) return;
    const naver = (window as any).naver;
    if (!naver?.maps) return;
    fittedCategoryRef.current = selectedCategory;

    // 필터링된 마커들의 좌표를 포함하는 영역 계산
    const bounds = new naver.maps.LatLngBounds();
    filteredPlaces.forEach(place => {
      bounds.extend(new naver.maps.LatLng(place.lat, place.lng));
    });

    // 지도를 해당 영역에 맞게 조정
    map.fitBounds(bounds, {
      top: 0,    // 상단 여백
      right: 0,   // 우측 여백
      bottom: 0, // 하단 여백
      left: 0     // 좌측 여백
    });

  }, [map, filteredPlaces, selectedCategory]);

  // ② 공통 포커스: 선택 → 맵 이동 → 마커 살짝 확대 → 시트 모드 변경
  
  // 선택된 장소로 자동 포커스 (처음 한 번만)
  useEffect(() => {
    if (!selectedPlaceId || hasAutoFocused || !map || places.length === 0) return;

    // 먼저 해당 장소가 전체 places에 있는지 확인하고 카테고리 변경
    const selectedPlace = places.find(place => place.id === selectedPlaceId);
    console.log("selectedPlace", selectedPlace);
    
    if (!selectedPlace) return;

    // 선택된 장소가 현재 카테고리에 없으면 카테고리 변경
    if (selectedPlace.label !== selectedCategory) {
      setSelectedCategory(selectedPlace.label || "");
      return; // 카테고리 변경 후 다음 렌더에서 포커스
    }

    // 현재 카테고리에서 선택된 장소 찾기
    const selectedPlaceIndex = filteredPlaces.findIndex(place => place.id === selectedPlaceId);
    if (selectedPlaceIndex === -1 || filteredPlaces.length === 0) return;

    // 마커 API가 준비될 때까지 대기
    const timer = setTimeout(() => {
      if (markerApiRef.current[selectedPlaceIndex]) {
        focusToIndex(selectedPlaceIndex, false);
        setHasAutoFocused(true);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [selectedPlaceId, hasAutoFocused, map, filteredPlaces, places, selectedCategory]);

  // 각 마커를 제어할 수 있는 작은 API 보관 (focus, 좌표)
  const markerApiRef = useRef<
    Array<null | {
      focus: () => void;
      getLatLng: () => { lat: number; lng: number };
    }>
  >([]);

  const registerMarkerApi = useCallback(
    (
      idx: number,
      api: {
        focus: () => void;
        getLatLng: () => { lat: number; lng: number };
      } | null
    ) => {
      markerApiRef.current[idx] = api;
    },
    []
  );





  // 마커 클릭 → 선택/포커스 + (오버레이 보이게) 시트 hide
  const handleMarkerClick = useCallback(
    (idx: number) => {
      focusToIndex(idx, true);
    },
    [focusToIndex]
  );

  // 바텀시트에서 장소 선택 → 같은 포커스 동작(시트는 내부에서 hide로 전환)
  const handlePlaceClickFromSheet = useCallback(
    (idx: number) => {
      focusToIndex(idx, false);
    },
    [focusToIndex]
  );

  // 선택 해제 함수
  const handleClearSelection = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  // 투표 처리 함수
  const handleVote = useCallback(async (placeIndex: number) => {
    if (!inviteCode || !filteredPlaces[placeIndex] || !filteredPlaces[placeIndex].slotNo) return;

    try {
      const place = filteredPlaces[placeIndex];
      const response = await votePlace(inviteCode, { slotNo: place.slotNo! });
      
      // 투표 결과에 따라 places 상태 업데이트
      const updatedPlaces = filteredPlaces.map((p, idx) => {
        // 현재 투표한 장소의 상태 업데이트
        if (idx === placeIndex) {
          const patch = response.patches.find(patch => patch.slotNo === p.slotNo);
          return { ...p, votedByMe: patch ? patch.votedByMe : p.votedByMe };
        }
        
        // 다른 장소들도 myVoteSlotNos에 따라 상태 업데이트
        const isVotedByMe = p.slotNo ? response.myVoteSlotNos.includes(p.slotNo) : false;
        return { ...p, votedByMe: isVotedByMe };
      });
      
      // places는 이제 props이므로 직접 수정할 수 없음
      // 대신 쿼리 캐시 무효화로 상위 컴포넌트에서 데이터 새로고침
      
      // 쿼리 캐시 무효화하여 최신 데이터 동기화
      queryClient.invalidateQueries({ queryKey: ['places', inviteCode] });
      
    } catch (error) {
      console.error('투표 처리 실패:', error);
    }
  }, [inviteCode, filteredPlaces, queryClient]);

  return (
    <Container>
      <MapContainer ref={mapRef} />

      {map &&
        filteredPlaces.map((p, i) => (
          <MapMarker
            key={p.id}
            id={p.id}
            map={map}
            lat={p.lat}
            lng={p.lng}
            iconUrl={p.iconUrl}
            selected={selectedIndex === i}
            onClick={() => handleMarkerClick(i)}
            onMount={(api) => registerMarkerApi(i, api)}
            onUnmount={() => registerMarkerApi(i, null)}
          />
        ))}

      {map &&
        participants.map((participant, i) => (
          <ParticipantMarkerWrapper
            key={`participant-${participant.participantId}`}
            map={map}
            lat={participant.lat}
            lng={participant.lng}
            participant={participant}
            colorIndex={i}
          />
        ))}

      <BottomSheet
        mode={mode}
        setMode={setMode}
        places={filteredPlaces}
        selectedIndex={selectedIndex}
        onSelectPlace={handlePlaceClickFromSheet}
        onVote={handleVote}
        onClearSelection={handleClearSelection}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />
    </Container>
  );
};

// 참가자 마커를 네이버 지도에 렌더링하는 컴포넌트
interface ParticipantMarkerWrapperProps {
  map: any;
  lat: number;
  lng: number;
  participant: ParticipantGetResponse;
  colorIndex: number;
}

const ParticipantMarkerWrapper = ({ map, lat, lng, participant, colorIndex }: ParticipantMarkerWrapperProps) => {
  const markerRef = useRef<any>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!map) return;

    const naver = (window as any).naver;
    if (!naver?.maps) return;

    // HTML 오버레이로 참가자 마커 생성
    const overlay = new naver.maps.OverlayView();
    
    overlay.onAdd = function() {
      const layer = this.getPanes().overlayLayer;
      
      // 마커 컨테이너 생성
      const markerContainer = document.createElement('div');
      markerContainer.style.position = 'absolute';
      markerContainer.style.transform = 'translate(-50%, -100%)';
      markerContainer.style.zIndex = '1000';
      
      // React 컴포넌트를 렌더링할 div 생성
      const markerDiv = document.createElement('div');
      markerContainer.appendChild(markerDiv);
      
      // React 컴포넌트 렌더링
      const root = createRoot(markerDiv);
      root.render(
        <ParticipantMarker 
          name={participant.name} 
          colorIndex={colorIndex}
          position={{ lat, lng }}
        />
      );
      
      layer.appendChild(markerContainer);
      overlayRef.current = markerContainer;
      markerRef.current = { overlay, root };
    };

    overlay.onRemove = function() {
      if (overlayRef.current) {
        overlayRef.current.remove();
      }
      if (markerRef.current?.root) {
        // React 렌더링 사이클과 충돌을 피하기 위해 비동기로 언마운트
        setTimeout(() => {
          markerRef.current?.root?.unmount();
        }, 0);
      }
    };

    overlay.draw = function() {
      if (!overlayRef.current) return;
      
      const projection = this.getProjection();
      const position = new naver.maps.LatLng(lat, lng);
      const pixelPosition = projection.fromCoordToOffset(position);
      
      overlayRef.current.style.left = pixelPosition.x + 'px';
      overlayRef.current.style.top = pixelPosition.y + 'px';
    };

    overlay.setMap(map);

    return () => {
      if (markerRef.current) {
        markerRef.current.overlay.setMap(null);
        if (markerRef.current.root) {
          // React 렌더링 사이클과 충돌을 피하기 위해 비동기로 언마운트
          setTimeout(() => {
            markerRef.current?.root?.unmount();
          }, 0);
        }
      }
    };
  }, [map, lat, lng, participant.name, colorIndex]);

  return null;
};

export default MapPage;

const Container = styled.div`
  width: 100%;
  flex: 1;
`;

const MapContainer = styled.div`
  width: 100%;
  height: 100%;
`;
