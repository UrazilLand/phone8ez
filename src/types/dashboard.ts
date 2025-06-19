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
}

export interface DataSet {
  id: string;
  name: string;
  type?: 'integrated' | 'normal';
  createdAt: string;
  data: SheetData & {
    filters?: {
      modelFilters: { [key: string]: any };
      planFilters: { [key: string]: any };
    };
  };
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