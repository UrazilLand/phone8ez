import { useRef, useCallback } from 'react';
import { DataSet } from '@/types/dashboard';

// 파일명 생성 함수
function getDownloadFileName() {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const YY = pad(now.getFullYear() % 100);
  const MM = pad(now.getMonth() + 1);
  const DD = pad(now.getDate());
  const HH = pad(now.getHours());
  const mm = pad(now.getMinutes());
  return `phone8ez_${YY}${MM}${DD}_${HH}${mm}.json`;
}

export const useFileOperations = (
  setDataSets: React.Dispatch<React.SetStateAction<DataSet[]>>,
  isCloudMode: boolean,
  dataSets: DataSet[]
) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDownload = useCallback(() => {
    if (isCloudMode) {
      // TODO: Cloud 저장 기능 구현
      // - DB 연결 후 구현 예정
      // - 구독자 전용 기능
      return;
    }

    // 로컬 파일 다운로드 기능
    if (!dataSets.length) return alert('저장된 데이터가 없습니다.');
    const filename = getDownloadFileName();
    const blob = new Blob([JSON.stringify(dataSets)], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [isCloudMode, dataSets]);

  const handleUpload = useCallback(() => {
    if (isCloudMode) {
      // TODO: Cloud 불러오기 기능 구현
      // - DB 연결 후 구현 예정
      // - 구독자 전용 기능
      return;
    }

    // 로컬 파일 업로드 기능
    if (fileInputRef.current) fileInputRef.current.value = '';
    fileInputRef.current?.click();
  }, [isCloudMode]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) throw new Error('파일 내용이 비어있습니다.');
        
        const arr = JSON.parse(text);
        
        if (!Array.isArray(arr)) throw new Error('잘못된 파일 형식입니다. 배열 형태의 JSON이어야 합니다.');
        if (arr.length === 0) throw new Error('데이터가 비어있습니다.');
        
        // 각 데이터셋의 형식 검증
        arr.forEach((ds, idx) => {
          if (!ds || typeof ds !== 'object') throw new Error(`${idx + 1}번째 데이터셋이 올바르지 않습니다.`);
          if (!ds.data || typeof ds.data !== 'object') throw new Error(`${idx + 1}번째 데이터셋에 data 필드가 없습니다.`);
        });

        setDataSets(arr);
      } catch (err) {
        console.error('파일 처리 중 오류:', err);
        alert(err instanceof Error ? err.message : 'JSON 파일이 아니거나 잘못된 형식입니다.');
      }
    };
    reader.onerror = () => {
      alert('파일을 읽는 중 오류가 발생했습니다.');
    };
    reader.readAsText(file);
  }, [setDataSets]);

  return {
    fileInputRef,
    handleDownload,
    handleUpload,
    handleFileChange
  };
}; 