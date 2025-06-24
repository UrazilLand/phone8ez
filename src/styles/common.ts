export const flexColGap2 = "flex flex-col gap-2";
export const flexRowGap2 = "flex flex-row gap-2";

// 레이아웃 관련 상수
export const DEFAULT_ROW_COUNT = 50;
export const DEFAULT_COLUMN_COUNT = 10;
export const SHEET_HEADER_ROWS = 5;
export const SHEET_HEADER_LABELS = [
  '통신사',
  '지원 구분', 
  '요금제',
  '가입 유형',
  '업체명'
];

// 버튼 스타일 테마 (colors.ts로 이동 예정이지만 호환성을 위해 유지)
export const BUTTON_THEME = {
  primary: "bg-blue-600 border-2 border-blue-600 text-white font-extrabold rounded hover:bg-blue-700 transition-colors",
  secondary: "bg-card border-2 border-blue-600 text-blue-600 font-extrabold rounded hover:bg-blue-100 transition-colors",
  danger: "bg-card border-2 border-red-600 text-red-600 font-extrabold rounded hover:bg-red-100 transition-colors",
  danger_fill: "bg-red-600 border-2 border-red-600 text-white font-extrabold rounded hover:bg-red-700 transition-colors",
  disabled: "bg-gray-100 border-2 border-gray-300 text-gray-400 font-extrabold rounded cursor-not-allowed",
  gray: "bg-gray-100 border-2 border-gray-300 text-gray-600 font-extrabold rounded hover:bg-gray-200 transition-colors"
}; 