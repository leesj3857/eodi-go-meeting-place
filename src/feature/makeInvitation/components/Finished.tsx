import styled from '@emotion/styled';
import { grayscale } from '../../../styles/colors/grayscale';
import { secondary } from '../../../styles/colors/secondary';
import { typography } from '../../../styles/typography';
import { mdiContentCopy } from '@mdi/js';
import { Icon } from '@mdi/react';
import { useState } from 'react';
import SuccessToastUI from '../../../interface/SucessToastUI';
import Emoji from '../../../interface/Emoji';
import FetchingAnimation from '../interface/fetchingAnimation';  
import { button } from '../../../styles/button';
import { useEffect } from 'react';
import { createMeeting, CreateMeetingResponse, Meeting, Participant, registerParticipant } from '../../../api';
import { getLatLngByAddress } from '../../../utils/getLng';

interface UserInfo {
  purpose?: string;
  name?: string;
  address?: string;
  hostName?: string;
  transport?: string;
  step3Step?: number;
}

export default function Finished({ onComplete, userInfo }: { onComplete?: () => void, userInfo: UserInfo }) {
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [meeting, setMeeting] = useState<CreateMeetingResponse | null>(null);

  useEffect(() => {
    if (userInfo.purpose && userInfo.name && userInfo.address) {
      (async () => {
        const coords = await getLatLngByAddress(userInfo.address as string);
        if (!coords) return;
        const { lat, lng } = coords;
        createMeeting({
          name: userInfo.name!,
          purpose: userInfo.purpose!
        }).then(async (res) => {
          if (res && typeof res === 'object' && 'linkCode' in res) {
            setMeeting(res as CreateMeetingResponse);
            const participant = await registerParticipant(res.linkCode as string, {
              name: userInfo.hostName!,
              address: userInfo.address!,
              transportType: userInfo.transport!,
              lat,
              lng,
            } as Participant);
            if (participant && participant.participantId) {
              localStorage.setItem(res.linkCode as string, JSON.stringify(participant));
            }
            setIsLoading(false);
          }
        });
      })();
    }
  }, [userInfo]);

  // 완료 시 onComplete 호출
  useEffect(() => {
    if (!isLoading && onComplete) {
      onComplete();
    }
  }, [isLoading, onComplete]);

  const shareKakaoWithTemplate = (templateId: number) => {
    if (window.Kakao) {
      window.Kakao.Link.sendCustom({
        templateId: templateId, // 빌더에서 복사한 템플릿ID (숫자)
        templateArgs: {
          invitationId: meeting?.linkCode,
        }
      });
    }
  }

  const handleCopy = () => {
    setShowToast(true);
    navigator.clipboard.writeText(`${window.location.origin}/reply/${meeting?.linkCode}`);
  }

  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <Container>
      {isLoading ? (
        <FetchingAnimation text="초대장을 만들고 있어요..." />
      ) : (
        <>
      <HeaderRow>
        <Title>
          초대장이 발급되었어요 ! <Emoji>🥳</Emoji>
        </Title>
        <SubTitle>
          친구들에게 공유하고 약속 장소를 정해보세요 !
        </SubTitle>
      </HeaderRow>
      <CenterImg src="/make_invitation/finished_v1.webp" alt="완료 캐릭터" />
      <ButtonList>
        <CopyButton onClick={handleCopy}>
          <Icon path={mdiContentCopy} size={0.9} color={secondary[70]} />
          <CopyText>링크 복사하기</CopyText>
        </CopyButton>
        <KakaoButton onClick={() => shareKakaoWithTemplate(120740)}>
          <KakaoIcon src="/make_invitation/kakaotalk_v1.webp" alt="카카오톡" />
          <KakaoText>카카오톡으로 공유하기</KakaoText>
        </KakaoButton>
      </ButtonList>
      <SuccessToastUI
        text="링크 복사가 완료되었어요!"
        show={showToast}
          onClose={() => setShowToast(false)}
        />
      </>
      )}
    </Container>
  );
}

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const HeaderRow = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  margin-bottom: 16px;
`;

const Title = styled.div`
  color: ${grayscale[90]};
  font-size: ${typography.title.medium.fontSize}px;
  font-weight: ${typography.title.medium.fontWeight};
  line-height: ${typography.title.medium.lineHeight};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PartyIcon = styled.img`
  width: 20px;
  height: 20px;
`;

const SubTitle = styled.div`
  color: ${grayscale[100]};
  font-size: ${typography.body.small.fontSize}px;
  font-weight: 400;
  line-height: ${typography.body.small.lineHeight};
  margin-top: 27px;
  margin-bottom: 24px;
`;

const CenterImg = styled.img`
  width: 180px;
  height: 175px;
  margin: 0 auto 40px auto;
  display: block;
`;

const ButtonList = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const CopyButton = styled.button`
  width: 100%;
  height: 50px;
  padding: 13px 0;
  ${button.Tertiary}
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;


const CopyText = styled.span`
  color: ${secondary[70]};
  font-size: ${typography.title.small.fontSize}px;
  font-weight: ${typography.title.small.fontWeight};
`;

const KakaoButton = styled.button`
  width: 100%;
  height: 50px;
  padding: 13px 0;
  border-radius: 8px;
  border: none;
  background: #FFEB3B;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
`;

const KakaoIcon = styled.img`
  width: 30px;
`;

const KakaoText = styled.span`
  color: ${grayscale[100]};
  font-size: ${typography.title.small.fontSize}px;
  font-weight: ${typography.title.small.fontWeight};
  position: relative;
  bottom: 1px;
`;
