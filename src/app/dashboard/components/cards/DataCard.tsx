"use client";
import { useState, useEffect, useRef, Dispatch, SetStateAction } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DataSet } from '@/types/dashboard';
import { getAvailableDates, getSupportAmountsByDate, type SupportAmountData } from '../../utils/support-amounts';
import { savePublicDataToStorage } from '../../utils/dashboardUtils';
import DataCardBody from './DataCardBody';

interface DataCardProps {
  dataSets: DataSet[];
  setDataSets: Dispatch<SetStateAction<DataSet[]>>;
  onLoadData: (data: DataSet['data'] | DataSet['data'][]) => void;
  onTabChange?: (tab: 'data' | 'integrated') => void;
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

export default function DataCard({ dataSets, setDataSets, onLoadData, onTabChange, onReloadIntegrated }: DataCardProps) {
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
      console.log('데이터셋 로드:', dataSet);
      if (dataSet.type === 'integrated') {
        console.log('통합 데이터 로드 시도');
        if (onTabChange) {
          console.log('통합 데이터 탭으로 전환');
          onTabChange('integrated');
        }
        if (onReloadIntegrated) onReloadIntegrated();
      } else {
        console.log('일반 데이터 로드');
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
    setDataSets((prev: DataSet[]) => prev.filter((d: DataSet) => d.id !== dataSet.id));
    setPreviewModalOpen(false);
    setError(null);
  };

  // 토글 스위치 핸들러
  const handleToggle = () => setIsCloudMode((prev) => !prev);

  // 다운로드 버튼 핸들러 (JSON)
  const handleDownload = () => {
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
    try {
      console.log('공시 데이터 로드 시작');
      setIsLoading(true);
      setError(null);
      
      const dates = await getAvailableDates();
      console.log('사용 가능한 날짜:', dates);
      
      if (!dates || dates.length === 0) {
        throw new Error('사용 가능한 공시 데이터가 없습니다.');
      }
      
      const latestDate = dates[0];
      console.log('최신 날짜 데이터 요청:', latestDate);
      const data = await getSupportAmountsByDate(latestDate);
      console.log('받아온 데이터:', data);
      
      setSupportData(data);
      savePublicDataToStorage(data);
      console.log('publicData 저장됨:', data);
      setSupportModalOpen(true);
    } catch (error) {
      console.error('공시 데이터 로드 실패:', error);
      setError(error instanceof Error ? error.message : '공시 데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
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

      {/* 미리보기 모달 */}
      <Dialog open={previewModalOpen} onOpenChange={setPreviewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>데이터셋 상세 정보</DialogTitle>
          </DialogHeader>
          {selectedDataSet && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{selectedDataSet.name}</h3>
                  <p className="text-sm text-gray-500">타입: {selectedDataSet.type}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleLoadDataSet(selectedDataSet)}
                  >
                    불러오기
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteDataSet(selectedDataSet)}
                  >
                    삭제
                  </Button>
                </div>
              </div>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
                {JSON.stringify(selectedDataSet.data, null, 2)}
              </pre>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 공시 데이터 모달 */}
      <Dialog open={supportModalOpen} onOpenChange={setSupportModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>공시 지원금 데이터</DialogTitle>
          </DialogHeader>
          {supportData && (
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                데이터 업데이트: {(() => {
                  if (!supportData.fileName) return '-';
                  const base = supportData.fileName.split('_')[0];
                  const match = base.match(/^(\d{4})(\d{2})(\d{2})$/);
                  if (!match) return supportData.fileName;
                  return `${match[1]}. ${match[2]}. ${match[3]}`;
                })()}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from(new Set(supportData.models.map(m => m.modelName))).map((modelName, index) => (
                  <div key={index} className="bg-white p-3 rounded-lg border border-gray-200 flex items-center justify-center h-8">
                    <div className="font-normal text-black text-center w-full text-nowrap truncate">
                      {modelName}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 에러 메시지 */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          {error}
        </div>
      )}
    </>
  );
}
