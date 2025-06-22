import {
  CARRIER_OPTIONS,
  CONTRACT_OPTIONS,
  JOIN_TYPE_OPTIONS,
  COMPANY_TEXT_COLORS,
  PLAN_BG_COLORS,
} from '@/styles/common';

/**
 * 문자열을 기반으로 일관된 색상 인덱스를 반환합니다.
 * @param text - 색상을 결정할 텍스트
 * @param colorsArray - 색상 배열
 * @returns 색상 배열의 인덱스
 */
export function getColorIndex(text: string, colorsArray: string[]): number {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % colorsArray.length;
}

/**
 * 셀의 값과 행 인덱스를 기반으로 동적 스타일 클래스를 반환합니다.
 * @param rowIndex - 셀의 행 인덱스 (0부터 시작)
 * @param cellValue - 셀의 텍스트 값
 * @returns Tailwind CSS 클래스 문자열
 */
export function getDynamicCellStyle(rowIndex: number, cellValue: string): string {
  if (!cellValue) {
    return 'text-gray-600'; // 기본 텍스트 색상
  }
  
  const value = cellValue.trim();

  switch (rowIndex) {
    // 통신사
    case 0:
      return CARRIER_OPTIONS.find(opt => opt.variants.includes(value))?.style || 'text-black font-bold';
    
    // 지원 구분 (계약 유형)
    case 1:
      return CONTRACT_OPTIONS.find(opt => opt.value === value)?.style || 'text-gray-800 font-medium';
      
    // 요금제
    case 2:
      // 요금제 이름을 기반으로 배경색 적용
      const planColorIndex = getColorIndex(value, PLAN_BG_COLORS);
      return `${PLAN_BG_COLORS[planColorIndex]} text-gray-800 font-medium`;

    // 가입 유형
    case 3:
      return JOIN_TYPE_OPTIONS.find(opt => opt.value === value)?.style || 'text-white bg-gray-500';

    // 업체명
    case 4:
      // 업체명 이름을 기반으로 텍스트 색상 적용
      const companyColorIndex = getColorIndex(value, COMPANY_TEXT_COLORS);
      return `${COMPANY_TEXT_COLORS[companyColorIndex]} font-bold`;
      
    default:
      return 'text-gray-600';
  }
}

/**
 * B열 6행부터의 셀에 대한 배경색을 반환합니다.
 * @param rowIndex - 셀의 행 인덱스 (0부터 시작)
 * @param colIndex - 셀의 열 인덱스 (0부터 시작)
 * @param sheetData - 전체 시트 데이터
 * @returns Tailwind CSS 클래스 문자열
 */
export function getDataCellStyle(rowIndex: number, colIndex: number, sheetData: string[][]): string {
  // B열(인덱스 1)부터 6행(인덱스 5)부터만 적용
  if (colIndex === 0 || rowIndex < 5) {
    return '';
  }

  const carrier = sheetData[0]?.[colIndex]?.trim();
  
  let styleClasses = '';

  // 1행 데이터(통신사)에 따른 배경색
  if (carrier) {
    switch (carrier) {
      case 'SK':
        styleClasses += 'bg-red-100 ';
        break;
      case 'KT':
        styleClasses += 'bg-gray-100 ';
        break;
      case 'LG':
        styleClasses += 'bg-purple-100 ';
        break;
    }
  }

  return styleClasses;
} 