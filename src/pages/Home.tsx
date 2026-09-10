import styled from '@emotion/styled';
import { applyTypography } from '../styles/typography';
import { grayscale } from '../styles/colors/grayscale';
import { primary } from '../styles/colors/primary';
import { useNavigate } from 'react-router-dom';
import { button } from '../styles/button';
import { isMockMode, enterDemo } from '../mock';

const Home = () => {
  const navigate = useNavigate();
  return (
    <Container>
      <Heading>어디서 만날지 고민 될 땐?</Heading>
      <LogoRow>
        <svg width="136" height="32" viewBox="0 0 136 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M57.5266 0H65.4424V32H57.5266V0ZM43.8424 24.4211H54.7056V30.7368H35.9688V0.421053H53.8635V6.73684H43.8424V24.4211Z" fill="#5E52FF" />
          <path d="M29.4737 0V32H21.5579V18.4842H18.9474V22.1053C18.9474 25.2211 18.1474 27.5789 16.5474 29.1789C14.9474 30.7789 12.5895 31.5789 9.47369 31.5789C6.3579 31.5789 4 30.7789 2.4 29.1789C0.8 27.5789 0 25.2211 0 22.1053V9.47369C0 6.3579 0.8 4 2.4 2.4C4 0.800001 6.3579 0 9.47369 0C12.5895 0 14.9474 0.800001 16.5474 2.4C18.1474 4 18.9474 6.3579 18.9474 9.47369V12.1684H21.5579V0H29.4737ZM10.9474 7.78947C10.9474 6.80702 10.4561 6.31579 9.47369 6.31579C8.49123 6.31579 8 6.80702 8 7.78947V23.7895C8 24.7719 8.49123 25.2632 9.47369 25.2632C10.4561 25.2632 10.9474 24.7719 10.9474 23.7895V7.78947Z" fill="#5E52FF" />
          <path d="M119.803 1.55078C123.877 1.57578 127.502 2.95055 130.676 5.67509C133.851 8.37464 135.438 11.8616 135.438 16.1359C135.438 20.7101 133.963 24.447 131.014 27.3465C128.089 30.246 124.352 31.6958 119.803 31.6958C115.279 31.6958 111.542 30.246 108.592 27.3465C105.643 24.447 104.168 20.7101 104.168 16.1359C104.168 11.8616 105.755 8.37464 108.93 5.67509C112.104 2.95055 115.729 1.58827 119.803 1.58827V1.55078ZM119.803 8.67459C117.603 8.69959 115.716 9.47446 114.141 10.9992C112.592 12.499 111.817 14.2237 111.817 16.1733C111.817 18.5979 112.592 20.6101 114.141 22.2098C115.716 23.8096 117.603 24.6094 119.803 24.6094C122.003 24.6094 123.877 23.8096 125.427 22.2098C127.002 20.6101 127.789 18.5979 127.789 16.1733C127.789 14.2237 127.002 12.499 125.427 10.9992C123.877 9.47446 122.003 8.71209 119.803 8.71209V8.67459Z" fill="#5E52FF" />
          <path d="M87.6405 14.9829H102.226C102.201 17.0576 102.026 19.0073 101.701 20.832C101.376 22.6317 100.588 24.4189 99.3385 26.1936C97.9637 28.1182 96.264 29.518 94.2394 30.3929C92.2397 31.2677 90.0526 31.7051 87.678 31.7051C83.2287 31.7051 79.6043 30.3429 76.8048 27.6183C74.0052 24.8688 72.6055 21.2694 72.6055 16.8201C72.6055 12.2209 74.0177 8.534 76.8423 5.75946C79.6918 2.98493 83.3912 1.59766 87.9404 1.59766C90.8399 1.59766 93.377 2.26005 95.5516 3.58483C97.7513 4.88461 99.4635 6.85928 100.688 9.50884L93.7145 12.3959C93.2145 11.0711 92.4397 9.99626 91.3898 9.1714C90.34 8.34653 89.0777 7.9341 87.603 7.9341C85.3284 7.9341 83.5661 8.78396 82.3164 10.4837C81.0916 12.1834 80.4167 14.0456 80.2917 16.0702C80.2667 16.1952 80.2542 16.3327 80.2542 16.4827C80.2542 16.6077 80.2542 16.7326 80.2542 16.8576C80.2542 16.8826 80.2542 16.9201 80.2542 16.9701C80.2542 16.9951 80.2542 17.0326 80.2542 17.0826C80.3042 19.2322 80.9666 21.2069 82.2414 23.0066C83.5162 24.8063 85.3408 25.7061 87.7155 25.7061C89.3152 25.7061 90.665 25.2937 91.7648 24.4689C92.8646 23.644 93.4895 22.4192 93.6395 20.7945L87.6405 20.757V14.9829Z" fill="#5E52FF" />
        </svg>
      </LogoRow>
      <CharacterImg src="/logo_v2.webp" alt="캐릭터" />
      <ShadowBox></ShadowBox>
      <Description>
        초대장을 만들어서<br />
        친구들에게 공유해보세요
      </Description>
      <Button onClick={() => navigate('/make')}>초대장 만들기</Button>
      {isMockMode && (
        <DemoBox>
          <DemoButton onClick={() => navigate(`/map/${enterDemo()}`)}>
            데모 모임 둘러보기
          </DemoButton>
          <DemoNote>
            백엔드 없이 동작하는 데모 버전이에요.<br />
            모든 데이터는 브라우저에만 저장됩니다.
          </DemoNote>
        </DemoBox>
      )}
    </Container>
  );
};

export default Home;

const Container = styled.div`
  min-height: 100dvh;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 24px;
  justify-content: center;
`;

const Heading = styled.div`
  margin-top: 48px;
  margin-bottom: 20px;
  color: ${primary[30]};
  ${applyTypography('title.large')}
  text-align: center;
`;

const LogoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CharacterImg = styled.img`
  width: 150px;
  margin: 70px 0 0px;
`;

const ShadowBox = styled.div`
  width: 91px;
  height: 14px;
  background-color: #CEC8FF;
  opacity: 0.4;
  border-radius: 50%;
  margin: 22px auto;
`;

const Description = styled.div`
  color: ${grayscale[50]};
  ${applyTypography('body.large')}
  text-align: center;
  margin-bottom: 40px;
`;

const Button = styled.button`
  width: 260px;
  height: 55px;
  margin-bottom: 16px;
  ${button.Primary}
  ${applyTypography('label.large')}
`;

const DemoBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 48px;
`;

const DemoButton = styled.button`
  width: 260px;
  height: 50px;
  ${button.Tertiary}
  ${applyTypography('label.large')}
`;

const DemoNote = styled.div`
  color: ${grayscale[50]};
  ${applyTypography('body.small')}
  text-align: center;
`;