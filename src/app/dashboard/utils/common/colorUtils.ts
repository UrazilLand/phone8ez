import {
  CARRIER_OPTIONS,
  CONTRACT_OPTIONS,
  JOIN_TYPE_OPTIONS,
  COMPANY_OPTIONS,
  PLAN_BG_COLORS,
} from '@/styles/common';

/**
 * 문자열을 기반으로 일관된 색상 인덱스를 반환합니다.
 * @param text - 색상을 결정할 텍스트
 * @returns 색상 배열의 인덱스
 */
function getColorIndex(text: string): number {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % PLAN_BG_COLORS.length;
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
      const colorIndex = getColorIndex(value);
      return `${PLAN_BG_COLORS[colorIndex]} text-gray-800 font-medium`;

    // 가입 유형
    case 3:
      return JOIN_TYPE_OPTIONS.find(opt => opt.value === value)?.style || 'text-white bg-gray-500';

    // 업체명
    case 4:
      return COMPANY_OPTIONS.find(opt => opt.value === value)?.style || 'text-gray-800 font-bold';
      
    default:
      return 'text-gray-600';
  }
} 