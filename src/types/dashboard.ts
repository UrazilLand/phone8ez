export interface SheetData {
  sheetData: string[][];
  carrier: string;
  contract: string;
  planOptions: string[];
  companyOptions: string[];
  joinTypeOrder: string[];
  contractTypeOrder: string[];
  planInput: string;
  planFields: string[];
  planRepeatCount: string;
  companyInput: string;
  companyFields: string[];
  policyInput: string;
  joinTypeRepeatCounts: { [key: string]: string };
  contractTypeRepeatCounts: { [key: string]: string };
  additionalServices?: Record<string, Array<{service: string, discount: string}>>;
}

export interface DataSet {
  id: string;
  name: string;
  type?: 'integrated' | 'normal' | 'additional';
  createdAt: string;
  data: SheetData & {
    filters?: {
      modelFilters: { [key: string]: any };
      planFilters: { [key: string]: any };
    };
  };
}

// 데이터 선택 모달 관련 타입들
export interface SelectedData {
  carrier: string;
  companies: string[];
  plans: string[];
  monthlyFees: number[];
}

export interface DataSelectionState {
  selectedCarrier: string;
  selectedCompanies: string[];
  selectedPlans: string[];
  selectedMonthlyFee1: number | null;
  selectedMonthlyFee2: number | null;
}

export interface ExtractedData {
  companies: string[];
  plans: string[];
  monthlyFees: number[];
}

export interface CellData {
  value: string;
  monthlyFee?: number;
}

export type TabType = 'local' | 'integrated' | 'model' | 'visualization';

export interface Tab {
  id: TabType;
  label: string;
}

// UI 컴포넌트 타입들
export interface Option {
  value: string;
  label: string;
  style?: string;
  optionStyle?: string;
}

export interface TabProps {
  title: string;
  children: React.ReactNode;
}

export interface ButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  className?: string;
  disabled?: boolean;
}

export interface TableProps {
  headers: string[];
  children: React.ReactNode;
  className?: string;
}

// 공시지원금 데이터 관련 타입 (신규)
export interface ModelInfo {
  manufacturer: string;
  model_number: string;
  model_name: string;
  max_price: number;
}

export interface CarrierSupportInfo {
  carrier_name: string;
  price: string;
  plan_name: string;
  device_support: number;
  number_port_support: number;
  announcement_date: string;
  monthly_fee: number;
}

export interface Section {
  section: string;
  carriers: {
    SK?: CarrierSupportInfo;
    KT?: CarrierSupportInfo;
    LG?: CarrierSupportInfo;
  };
}

export interface ManufacturerModel {
  index: number;
  model_name: string;
  model_number: string;
  release_date: string;
  support_info: {
    carriers: Record<string, unknown>;
    sections: Section[];
  };
}

export interface Manufacturer {
  name: string;
  models: ManufacturerModel[];
}

export interface PublicSupportData {
  collection_date: string;
  total_models: number;
  model_info: ModelInfo[];
  carrier_monthly_fees: {
    SK: number[];
    KT: number[];
    LG: number[];
  };
  manufacturers: {
    [key: string]: Manufacturer;
  };
  fileName?: string;
} 