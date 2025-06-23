import { DataSet, TabType } from '@/types/dashboard';

// 최적화된 DataCard Props 인터페이스
export interface OptimizedDataCardProps {
  dataSets: DataSet[];
  setDataSets: React.Dispatch<React.SetStateAction<DataSet[]>>;
  onLoadData: (data: DataSet['data'] | DataSet['data'][]) => void;
  onTabChange?: (tab: TabType) => void;
  onReloadIntegrated?: () => void;
  onOpenAdditionalServiceModal?: () => void;
}

// 더 구체적인 타입 정의
export type DataSetType = 'integrated' | 'additional' | 'local';
export type CloudMode = 'local' | 'cloud';

// 드래그 스크롤 관련 타입
export interface DragScrollHandlers {
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
}

// 파일 작업 관련 타입
export interface FileOperationHandlers {
  handleDownload: () => void;
  handleUpload: () => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// 모달 상태 관련 타입
export interface ModalState {
  selectedDataSet: DataSet | null;
  previewModalOpen: boolean;
  supportModalOpen: boolean;
  supportData: any | null;
  isLoading: boolean;
  error: string | null;
}

// Cloud 모드 관련 타입
export interface CloudModeState {
  isCloudMode: boolean;
  toggleCloudMode: () => void;
  setLocalMode: () => void;
  setCloudMode: () => void;
} 