export const cardStyles = "bg-white rounded-xl shadow pt-5 pr-5 pl-5 pb-0";
export const flexColGap2 = "flex flex-col gap-2";
export const flexRowGap2 = "flex flex-row gap-2";
export const buttonStyles = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded px-3 py-2 transition",
  secondary: "bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded px-3 py-2 transition",
  disabled: "bg-gray-100 text-gray-400 rounded px-3 py-2 cursor-not-allowed"
};

// 레이아웃 관련 상수
export const DEFAULT_ROW_COUNT = 20;
export const DEFAULT_COLUMN_COUNT = 15;
export const SHEET_HEADER_ROWS = 5;
export const SHEET_HEADER_LABELS = ['통신사', '지원 구분', '요금제', '가입 유형', '업체명'];

// 통신사 관련 상수
export const CARRIER_OPTIONS = [
  { value: 'SK', label: 'SK', style: 'text-red-600 font-bold' },
  { value: 'KT', label: 'KT', style: 'text-black font-bold' },
  { value: 'LG', label: 'LG', style: 'text-pink-700 font-bold' },
];

// 계약 유형 관련 상수
export const CONTRACT_OPTIONS = [
  { value: '공시', label: '공시', style: 'text-green-700 font-bold' },
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
  "bg-green-300",
  "bg-teal-300"
];

// 업체명 색상 관련 상수
export const COMPANY_TEXT_COLORS = [
  "text-blue-800",
  "text-pink-800",
  "text-indigo-800",
  "text-red-800",
  "text-purple-800",
  "text-teal-800",
  "text-orange-800",
  "text-green-800",
  "text-amber-800",
  "text-cyan-800"
];

// 버튼 스타일 테마
export const BUTTON_THEME_1 = "bg-blue-600 border-2 border-blue-600 text-white font-extrabold rounded px-2 py-2 hover:bg-blue-700 transition-colors";
export const BUTTON_THEME_1_RED = "bg-red-600 border-2 border-red-600 text-white font-extrabold rounded px-2 py-2 hover:bg-red-700 transition-colors";
export const BUTTON_THEME_2 = "bg-white border-2 border-blue-600 text-blue-600 font-extrabold rounded px-2 py-2 hover:bg-blue-100 transition-colors";
export const BUTTON_THEME_2_RED = "bg-red-0 border-2 border-red-600 text-red-600 font-extrabold rounded px-2 py-2 hover:bg-red-100 transition-colors";
export const BUTTON_THEME_3 = "bg-white border-2 border-blue-600 text-blue-600 font-extrabold rounded hover:bg-blue-600 hover:text-white transition-colors"; 