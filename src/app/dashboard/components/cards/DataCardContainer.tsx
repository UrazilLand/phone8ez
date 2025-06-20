"use client";
import { useState, useEffect, useRef } from 'react';
import { DataSet, TabType } from '@/types/dashboard';
import { getAvailableDates, getSupportAmountsByDate, type SupportAmountData } from '../../utils/support-amounts';
import { savePublicDataToStorage } from '../../utils/dashboardUtils';
import DataCardBody from './DataCardBody';
import DataCardModal from './DataCardModal';
import PreviewModal from './PreviewModal';
import { useToast } from "@/hooks/use-toast";

interface DataCardProps {
  dataSets: DataSet[];
  setDataSets: React.Dispatch<React.SetStateAction<DataSet[]>>;
  onLoadData: (data: DataSet['data'] | DataSet['data'][]) => void;
  onTabChange?: (tab: TabType) => void;
  onReloadIntegrated?: () => void;
}

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

export default function DataCardContainer({ dataSets, setDataSets, onLoadData, onTabChange, onReloadIntegrated }: DataCardProps) {
  const { toast } = useToast();
  const [selectedDataSet, setSelectedDataSet] = useState<DataSet | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCloudMode, setIsCloudMode] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [supportData, setSupportData] = useState<SupportAmountData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 마우스 드래그 스크롤 구현
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isDragging.current = true;
    startX.current = e.pageX - (scrollRef.current?.offsetLeft || 0);
    scrollLeft.current = scrollRef.current?.scrollLeft || 0;
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging.current || !scrollRef.current) return;
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = x - startX.current;
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    document.body.style.userSelect = '';
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
    document.body.style.userSelect = '';
  };

  useEffect(() => {
    if (supportModalOpen) {
      const raw = localStorage.getItem('publicData');
      if (raw) setSupportData(JSON.parse(raw));
    }
  }, [supportModalOpen]);

  const handleLoadDataSet = (dataSet: DataSet) => {
    try {
      if (dataSet.type === 'integrated') {
        if (onTabChange) {
          onTabChange('integrated');
        }
        if (onReloadIntegrated) onReloadIntegrated();
      } else {
        if (onTabChange) {
          onTabChange('local');
        }
        onLoadData(dataSet.data);
      }
      setError(null);
      setPreviewModalOpen(false);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
      setError('데이터를 불러오는데 실패했습니다.');
    }
  };

  const handlePreviewDataSet = (dataSet: DataSet) => {
    setSelectedDataSet(dataSet);
    setPreviewModalOpen(true);
  };

  const handleDeleteDataSet = (dataSet: DataSet) => {
    // 삭제 확인
    if (window.confirm(`"${dataSet.name}" 데이터셋을 삭제하시겠습니까?`)) {
      setDataSets((prev: DataSet[]) => {
        const filtered = prev.filter((d: DataSet) => d.id !== dataSet.id);
        return filtered;
      });
      
      setPreviewModalOpen(false);
      setError(null);
      
      // 삭제 완료 알림
      toast({
        title: "삭제 완료",
        description: `"${dataSet.name}" 데이터셋이 성공적으로 삭제되었습니다.`,
      });
    }
  };

  // 토글 스위치 핸들러
  const handleToggle = () => {
    // TODO: Cloud 모드 전환 시 구독 상태 확인
    // - 구독자가 아닌 경우 알림 표시
    // - 구독자인 경우 Cloud 모드로 전환
    setIsCloudMode((prev) => !prev);
  };

  // 다운로드 버튼 핸들러 (JSON)
  const handleDownload = () => {
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
  };

  // 업로드 버튼 핸들러
  const handleUpload = () => {
    if (isCloudMode) {
      // TODO: Cloud 불러오기 기능 구현
      // - DB 연결 후 구현 예정
      // - 구독자 전용 기능
      return;
    }

    // 로컬 파일 업로드 기능
    if (fileInputRef.current) fileInputRef.current.value = '';
    fileInputRef.current?.click();
  };

  // 파일 선택 시 처리 (JSON)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };

  const handleSupportDataLoad = async () => {
    // 바로 모달 열기
    setSupportModalOpen(true);
    
    // 기존 데이터가 있으면 먼저 표시
    const raw = localStorage.getItem('publicData');
    if (raw) {
      setSupportData(JSON.parse(raw));
    }
  };

  const handleRefreshSupportData = async () => {
    // 이미 로딩 중이면 중복 호출 방지
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const dates = await getAvailableDates();
      
      if (!dates || dates.length === 0) {
        throw new Error('사용 가능한 공시 데이터가 없습니다.');
      }
      
      const latestDate = dates[0];
      const data = await getSupportAmountsByDate(latestDate);
      
      setSupportData(data);
      savePublicDataToStorage(data);
    } catch (error) {
      console.error('공시 데이터 로드 실패:', error);
      setError(error instanceof Error ? error.message : '공시 데이터를 불러오는데 실패했습니다.');
    } finally {
      // 약간의 지연을 두어 상태 변경을 안정화
      setTimeout(() => {
        setIsLoading(false);
      }, 100);
    }
  };

  return (
    <>
      <DataCardBody
        dataSets={dataSets}
        onLoadDataSet={handleLoadDataSet}
        onPreviewDataSet={handlePreviewDataSet}
        onDeleteDataSet={handleDeleteDataSet}
        onSupportDataLoad={handleSupportDataLoad}
        onDownload={handleDownload}
        onUpload={handleUpload}
        isLoading={isLoading}
        isCloudMode={isCloudMode}
        onToggle={handleToggle}
        scrollRef={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />

      {/* 숨겨진 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <DataCardModal
        supportModalOpen={supportModalOpen}
        setSupportModalOpen={setSupportModalOpen}
        supportData={supportData}
        onRefreshSupportData={handleRefreshSupportData}
        isLoading={isLoading}
        error={error}
      />

      <PreviewModal
        previewModalOpen={previewModalOpen}
        setPreviewModalOpen={setPreviewModalOpen}
        selectedDataSet={selectedDataSet}
        onLoadDataSet={handleLoadDataSet}
        onDeleteDataSet={handleDeleteDataSet}
      />
    </>
  );
} 