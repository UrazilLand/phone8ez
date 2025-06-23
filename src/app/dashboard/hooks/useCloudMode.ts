import { useState, useCallback } from 'react';

export const useCloudMode = () => {
  const [isCloudMode, setIsCloudMode] = useState(false);
  
  const toggleCloudMode = useCallback(() => {
    // TODO: Cloud 모드 전환 시 구독 상태 확인
    // - 구독자가 아닌 경우 알림 표시
    // - 구독자인 경우 Cloud 모드로 전환
    setIsCloudMode((prev) => !prev);
  }, []);

  const setLocalMode = useCallback(() => {
    setIsCloudMode(false);
  }, []);

  const setCloudMode = useCallback(() => {
    setIsCloudMode(true);
  }, []);

  return {
    isCloudMode,
    setIsCloudMode,
    toggleCloudMode,
    setLocalMode,
    setCloudMode
  };
}; 