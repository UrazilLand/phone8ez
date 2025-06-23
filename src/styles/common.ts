export const flexColGap2 = "flex flex-col gap-2";
export const flexRowGap2 = "flex flex-row gap-2";

// 레이아웃 관련 상수
export const DEFAULT_ROW_COUNT = 49;
export const DEFAULT_COLUMN_COUNT = 30;
export const SHEET_HEADER_ROWS = 5;
export const SHEET_HEADER_LABELS = ['통신사', '지원구분', '요금제', '가입유형', '업체명'];

// 통신사 관련 상수
export const CARRIER_OPTIONS = [
  { 
    value: 'SK', 
    label: 'SK', 
    style: 'text-red-600 font-bold',
    variants: ['SK', 'sk', 'SKT', 'skt', 'Skt', 'sKt']
  },
  { 
    value: 'KT', 
    label: 'KT', 
    style: 'text-black font-bold',
    variants: ['KT', 'kt', 'Kt', 'kT']
  },
  { 
    value: 'LG', 
    label: 'LG', 
    style: 'text-pink-700 font-bold',
    variants: ['LG', 'lg', 'Lg', 'lG', 'LGU+', 'lgu+', 'Lgu+', 'LG U+', 'lg u+', 'LG U', 'lg u']
  },
];

// 계약 유형 관련 상수
export const CONTRACT_OPTIONS = [
  { value: '공시', label: '공시', style: 'text-blue-700 font-bold' },
  { value: '선약', label: '선약', style: 'text-cyan-600 font-bold' },
];

// 가입 유형 관련 상수
export const JOIN_TYPE_OPTIONS = [
  { value: '번호이동', label: '번호이동', style: 'bg-blue-500 text-white'},
  { value: '기기변경', label: '기기변경', style: 'bg-green-600 text-white'},
  { value: '신규가입', label: '신규가입', style: 'bg-red-500 text-white',}
];

// 요금제 색상 관련 상수
export const PLAN_BG_COLORS = [
  "bg-blue-300",
  "bg-indigo-300",
  "bg-purple-300",
  "bg-pink-300",
  "bg-red-300",
  "bg-orange-300",
  "bg-blue-300",
  "bg-teal-300"
];

// 업체명 색상 관련 상수
export const COMPANY_TEXT_COLORS = [
  "text-blue-700",
  "text-red-700", 
  "text-green-700",
  "text-purple-700",
  "text-orange-700",
  "text-teal-700",
  "text-pink-700",
  "text-indigo-700",
  "text-amber-700",
  "text-cyan-700"
];

// 버튼 스타일 테마
export const BUTTON_THEME = {
  primary: "bg-blue-600 border-2 border-blue-600 text-white font-extrabold rounded hover:bg-blue-700 transition-colors",
  secondary: "bg-white border-2 border-blue-600 text-blue-600 font-extrabold rounded hover:bg-blue-100 transition-colors",
  danger: "bg-white border-2 border-red-600 text-red-600 font-extrabold rounded hover:bg-red-100 transition-colors",
  danger_fill: "bg-red-600 border-2 border-red-600 text-white font-extrabold rounded hover:bg-red-700 transition-colors",
  disabled: "bg-gray-100 border-2 border-gray-300 text-gray-400 font-extrabold rounded cursor-not-allowed",
  gray: "bg-gray-100 border-2 border-gray-300 text-gray-600 font-extrabold rounded hover:bg-gray-200 transition-colors"
};

export const SUPPORT_TYPE_STYLES = [
  { value: '선택약정', label: '선택약정', style: 'text-blue-700 font-bold' },
  { value: '공시', label: '공시', style: 'text-blue-700 font-bold' },
  { value: '미해당', label: '미해당', style: 'text-gray-500' },
];

export const JOIN_TYPE_STYLES = [
  { value: '신규', label: '신규', style: 'bg-blue-600 text-white' },
  { value: '번호이동', label: '번호이동', style: 'bg-orange-500 text-white'},
  { value: '기기변경', label: '기기변경', style: 'bg-blue-600 text-white'},
];

export const PLAN_STYLES = [
  "bg-blue-300",
  "bg-indigo-300",
  "bg-purple-300",
  "bg-pink-300",
  "bg-red-300",
  "bg-orange-300",
  "bg-blue-300",
  "bg-teal-300"
];

export const SUPPORT_TEXT_COLORS = [
  "text-red-700",
  "text-orange-700",
  "text-yellow-700",
  "text-blue-700",
  "text-indigo-700",
  "text-purple-700",
  "text-pink-700",
  "text-gray-700",
]; 