import { useState, useEffect } from 'react';
import { ProgressBar } from './interface/ProgressBar';
import { ProcessStep, ProcessStepStatus } from './type/processStep';
import { handleNext as handleNextOrig, handlePrev as handlePrevOrig } from './utils/progress/handleProgress';
import Step1 from './components/Step1';
import Step2 from './components/Step2';
import Step3 from './components/Step3';
import Finished from './components/Finished';
import AlertModal from '../../interface/alertModal';
import { AnimatePresence, motion } from 'framer-motion';

const stepsInit: ProcessStep[] = [
  { status: 'active' },
  { status: 'todo' },
  { status: 'todo' },
  { status: 'todo' },
];

const slideVariants = {
  initial: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    position: 'relative' as const,
    width: '100%',
  }),
  animate: {
    x: 0,
    opacity: 1,
    position: 'relative' as const,
    width: '100%',
    transition: { type: 'tween' as const, duration: 0.2 },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    position: 'relative' as const,
    width: '100%',
    transition: { type: 'tween' as const, duration: 0.2 },
  }),
};

interface UserInfo {
  purpose?: string;
  name?: string;
  address?: string;
  hostName?: string;
  transport?: string;
  step3Step?: number;
}

const SESSION_STORAGE_KEY = 'makeInvitation_userInfo';

const MakeInvitation = () => {
  const [steps, setSteps] = useState<ProcessStep[]>(stepsInit);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo>({});

  useEffect(() => {
    const savedInfo = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (savedInfo) {
      try {
        const parsedInfo = JSON.parse(savedInfo);
        setUserInfo(parsedInfo.userInfo || {});
        
        if (parsedInfo.current !== undefined && parsedInfo.current > 0) {
          setShowModal(true);
        }
      } catch (error) {
        console.error('세션스토리지 파싱 오류:', error);
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      }
    }
  }, []);

  const updateUserInfo = (newInfo: Partial<UserInfo>) => {
    const updatedInfo = { ...userInfo, ...newInfo };
    setUserInfo(updatedInfo);
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
      userInfo: updatedInfo,
      current: current,
      steps: steps
    }));
  };

  const clearSessionStorage = () => {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  };

  const handleNext = () => {
    setDirection(1);
    handleNextOrig({ steps, current, setSteps, setCurrent });
    
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
      userInfo: userInfo,
      current: current + 1,
      steps:  steps.map((_, idx) => {
        if (idx < current) return { status: 'done' as ProcessStepStatus };
        if (idx === current) return { status: 'done' as ProcessStepStatus };
        return { status: 'todo' as ProcessStepStatus };
      })
    }));
  };

  const handlePrev = () => {
    setDirection(-1);
    handlePrevOrig({ steps, current, setSteps, setCurrent });
    
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
      userInfo: userInfo,
      current: current - 1,
      steps: steps
    }));
  };

  const handleContinue = () => {
    const savedInfo = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (savedInfo) {
      const parsedInfo = JSON.parse(savedInfo);
      setCurrent(parsedInfo.current);
      setSteps(parsedInfo.steps || stepsInit);
    }
    setShowModal(false);
  };

  const handleCancel = () => {
    setShowModal(false);
    clearSessionStorage();
    setUserInfo({});
    setCurrent(0);
    setSteps(stepsInit);
  };

  return (
    <div style={{ width: '100%', height: '100%', padding: '24px', background: '#fff', position: 'relative', minHeight: 500, overflow: 'hidden' }}>
      <ProgressBar steps={steps} />
      <AnimatePresence custom={direction} mode="wait">
        {current === 0 && (
          <motion.div
            key={0}
            custom={direction}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Step1 
              onNext={handleNext} 
              userInfo={userInfo}
              updateUserInfo={updateUserInfo}
            />
          </motion.div>
        )}
        {current === 1 && (
          <motion.div
            key={1}
            custom={direction}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Step2 
              onNext={handleNext} 
              onPrev={handlePrev}
              userInfo={userInfo}
              updateUserInfo={updateUserInfo}
            />
          </motion.div>
        )}

        {current === 2 && (
          <motion.div
            key={2}
            custom={direction}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Step3 
              onNext={handleNext} 
              onPrev={handlePrev}
              userInfo={userInfo}
              updateUserInfo={updateUserInfo}
            />
          </motion.div>
        )}

        {current === 3 && (
          <motion.div
            key={3}
            custom={direction}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Finished onComplete={clearSessionStorage} userInfo={userInfo} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showModal && (
          <AlertModal 
            onContinue={handleContinue}
            onCancel={handleCancel}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MakeInvitation;
