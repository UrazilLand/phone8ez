import { DataSet, SheetData } from '@/types/dashboard';

export function createEmptySheet(): SheetData {
  return {
    sheetData: [],
    carrier: '',
    contract: '',
    planOptions: [],
    companyOptions: [],
    joinTypeOrder: [],
    contractTypeOrder: [],
    planInput: '',
    planFields: [],
    planRepeatCount: '',
    companyInput: '',
    companyFields: [],
    policyInput: '',
    joinTypeRepeatCounts: {},
    contractTypeRepeatCounts: {},
  };
}

export function validateSheetData(data: SheetData): boolean {
  // 시트 데이터 검증 로직
  return true;
}

export function processSheetData(data: SheetData): DataSet {
  // 시트 데이터 처리 로직
  return {
    id: Date.now().toString(),
    name: '새 데이터셋',
    type: 'normal',
    createdAt: new Date().toISOString(),
    data: data,
  };
} 