// 색상 관련 상수들
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
    style: 'text-foreground font-bold',
    variants: ['KT', 'kt', 'Kt', 'kT']
  },
  { 
    value: 'LG', 
    label: 'LG', 
    style: 'text-pink-700 font-bold',
    variants: ['LG', 'lg', 'Lg', 'lG', 'LGU+', 'lgu+', 'Lgu+', 'LG U+', 'lg u+', 'LG U', 'lg u']
  },
];

export const CONTRACT_OPTIONS = [
  { value: '공시', label: '공시', style: 'text-sky-600 font-bold' },
  { value: '선약', label: '선약', style: 'text-green-600 font-bold' },
];

export const JOIN_TYPE_OPTIONS = [
  { value: '번호이동', label: '번호이동', style: 'bg-blue-500 text-white'},
  { value: '기기변경', label: '기기변경', style: 'bg-green-600 text-white'},
  { value: '신규가입', label: '신규가입', style: 'bg-red-500 text-white',}
];

export const PLAN_BG_COLORS_400 = [
  "bg-blue-400",
  "bg-indigo-400",
  "bg-purple-400",
  "bg-pink-400",
  "bg-red-400",
  "bg-orange-400",
  "bg-amber-400",
  "bg-yellow-400",
  "bg-lime-400",
  "bg-green-400",
  "bg-emerald-400",
  "bg-teal-400",
  "bg-cyan-400",
  "bg-sky-400"
];

export const COMPANY_TEXT_COLORS = [
  "text-blue-500",
  "text-red-500", 
  "text-green-500",
  "text-purple-500",
  "text-orange-500",
  "text-teal-500",
  "text-pink-500",
  "text-indigo-500",
  "text-amber-500",
  "text-cyan-500"
];

export const BUTTON_THEME = {
  primary: "h-10 py-2 min-w-0 min-h-0 leading-none text-base flex items-center justify-center bg-blue-600 border-2 border-blue-600 text-white font-extrabold rounded hover:bg-blue-700 transition-colors",
  secondary: "h-10 py-2 min-w-0 min-h-0 leading-none text-base flex items-center justify-center bg-card border-2 border-blue-600 text-blue-600 font-extrabold rounded hover:bg-blue-100 transition-colors",
  danger: "h-10 py-2 min-w-0 min-h-0 leading-none text-base flex items-center justify-center bg-card border-2 border-red-600 text-red-600 font-extrabold rounded hover:bg-red-100 transition-colors",
  danger_fill: "h-10 py-2 min-w-0 min-h-0 leading-none text-base flex items-center justify-center bg-red-600 border-2 border-red-600 text-white font-extrabold rounded hover:bg-red-700 transition-colors",
  disabled: "h-10 py-2 min-w-0 min-h-0 leading-none text-base flex items-center justify-center bg-gray-100 border-2 border-gray-300 text-gray-400 font-extrabold rounded cursor-not-allowed",
  gray: "h-10 py-2 min-w-0 min-h-0 leading-none text-base flex items-center justify-center bg-gray-100 border-2 border-gray-300 text-gray-600 font-extrabold rounded hover:bg-gray-200 transition-colors"
};

export const SUPPORT_TYPE_STYLES = [
  { value: '선택약정', label: '선택약정', style: 'text-blue-700 font-bold' },
  { value: '공시', label: '공시', style: 'text-blue-700 font-bold' },
  { value: '미해당', label: '미해당', style: 'text-muted-foreground' },
];

export const JOIN_TYPE_STYLES = [
  { value: '신규', label: '신규', style: 'bg-blue-600 text-white' },
  { value: '번호이동', label: '번호이동', style: 'bg-orange-500 text-white'},
  { value: '기기변경', label: '기기변경', style: 'bg-blue-600 text-white'},
];

export const SUPPORT_TEXT_COLORS = [
  "text-red-700",
  "text-orange-700",
  "text-yellow-700",
  "text-blue-700",
  "text-indigo-700",
  "text-purple-700",
  "text-pink-700",
  "text-muted-foreground",
];

// 색상 유틸리티 함수들
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
 * @param colIndex - 셀의 열 인덱스 (0부터 시작)
 * @returns Tailwind CSS 클래스 문자열
 */
export function getDynamicCellStyle(rowIndex: number, cellValue: string, colIndex?: number): string {
  if (!cellValue) {
    return 'text-muted-foreground';
  }
  const value = cellValue.trim();
  switch (rowIndex) {
    // 통신사
    case 0:
      return CARRIER_OPTIONS.find(opt => opt.variants.includes(value))?.style || 'text-foreground font-bold';
    // 지원 구분 (계약 유형)
    case 1:
      return CONTRACT_OPTIONS.find(opt => opt.value === value)?.style || 'text-foreground font-medium';
    // 요금제 (3행)
    case 2: {
      // 같은 값은 같은 색상, 400계열, 글자색은 항상 검정
      const planColorIndex = getColorIndex(value, PLAN_BG_COLORS_400);
      return `${PLAN_BG_COLORS_400[planColorIndex]} text-black font-medium`;
    }
    // 가입 유형 (4행)
    case 3: {
      const joinType = JOIN_TYPE_OPTIONS.find(opt => opt.value === value);
      return joinType ? joinType.style : 'bg-muted/30 text-black';
    }
    // 업체명
    case 4:
      const companyColorIndex = getColorIndex(value, COMPANY_TEXT_COLORS);
      return `${COMPANY_TEXT_COLORS[companyColorIndex]} font-bold`;
    default:
      return 'text-muted-foreground';
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
  if (rowIndex >= 5) {
    // 데이터가 없으면 라이트모드: 흰색, 다크모드: #3B3B3B
    if (!sheetData[rowIndex]?.[colIndex]) {
      return 'bg-white dark:bg-[#3B3B3B]';
    }
    const carrier = sheetData[0]?.[colIndex]?.trim();
    const isEven = rowIndex % 2 === 0;
    if (carrier === 'SK') {
      return isEven
        ? 'bg-red-100 dark:bg-red-800'
        : 'bg-red-200 dark:bg-red-900';
    }
    if (carrier === 'KT') {
      return isEven
        ? 'bg-gray-100 dark:bg-gray-700'
        : 'bg-gray-200 dark:bg-gray-800';
    }
    if (carrier === 'LG') {
      return isEven
        ? 'bg-purple-100 dark:bg-fuchsia-800'
        : 'bg-purple-200 dark:bg-fuchsia-900';
    }
    // 기타: 기본 교차색상
    return isEven
      ? 'bg-white dark:bg-[#232323]'
      : 'bg-gray-100 dark:bg-[#353535]';
  }
  // 1~5행 헤더
  return 'bg-white dark:bg-[#3B3B3B]';
}

/**
 * ModelSheet용 셀 스타일을 결정하는 함수
 * @param colIndex - 열 인덱스
 * @param cellValue - 셀 값
 * @param rowIndex - 행 인덱스
 * @param sheetData - 전체 시트 데이터
 * @returns Tailwind CSS 클래스 문자열
 */
export function getModelSheetCellStyle(
  colIndex: number, 
  cellValue: string, 
  rowIndex: number, 
  sheetData: string[][]
): string {
  if (colIndex === 0) {
    // 1열: 통신사 색상
    const carrier = CARRIER_OPTIONS.find(option => 
      option.variants.includes(cellValue.trim())
    );
    return carrier ? carrier.style : 'text-foreground';
  } else if (colIndex === 1) {
    // 2열: 지원구분 색상
    const contract = CONTRACT_OPTIONS.find(option => 
      option.value === cellValue.trim()
    );
    return contract ? contract.style : 'text-foreground';
  } else if (colIndex === 2) {
    // 3열: 요금제 배경색 (순환) - 전체 문자열로 색상 결정
    const planIndex = Math.abs(cellValue.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % PLAN_BG_COLORS_400.length;
    return `${PLAN_BG_COLORS_400[planIndex]} text-foreground font-medium rounded`;
  } else if (colIndex === 3) {
    // 4열: 가입유형 색상
    const joinType = JOIN_TYPE_OPTIONS.find(option => 
      option.value === cellValue.trim()
    );
    return joinType ? joinType.style : 'text-foreground';
  } else if (colIndex === 4) {
    // 5열: 업체명 색상 (순환) + 통신사별 교차 배경색
    const companyIndex = Math.abs(cellValue.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % COMPANY_TEXT_COLORS.length;
    const textColor = `${COMPANY_TEXT_COLORS[companyIndex]} font-medium`;
    
    // 통신사별 교차 배경색 적용 (출고가 열과 동일)
    const carrier = sheetData[rowIndex]?.[0]?.trim();
    let bgColor = '';
    
    if (carrier) {
      const isEvenRow = rowIndex % 2 === 0;
      if (isEvenRow) {
        // 짝수 행: 더 진한 색상
        switch (carrier) {
          case 'SK':
            bgColor = 'bg-red-200';
            break;
          case 'KT':
            bgColor = 'bg-gray-200';
            break;
          case 'LG':
            bgColor = 'bg-purple-200';
            break;
        }
      } else {
        // 홀수 행: 더 연한 색상
        switch (carrier) {
          case 'SK':
            bgColor = 'bg-red-50';
            break;
          case 'KT':
            bgColor = 'bg-gray-50';
            break;
          case 'LG':
            bgColor = 'bg-purple-50';
            break;
        }
      }
    } else {
      // 통신사 정보가 없는 경우 기본 교차색상
      const isEvenRow = rowIndex % 2 === 0;
      bgColor = isEvenRow ? 'bg-gray-200' : 'bg-gray-100';
    }
    
    return `${textColor} ${bgColor}`;
  } else if (colIndex >= 5) {
    // 6열(출고가열)부터: 통신사에 따른 배경색 적용 + 교차 색상
    // 해당 행의 1열(통신사)을 참조하여 배경색 결정
    const carrier = sheetData[rowIndex]?.[0]?.trim();
    
    if (carrier) {
      const isEvenRow = rowIndex % 2 === 0;
      if (isEvenRow) {
        // 짝수 행: 더 진한 색상
        switch (carrier) {
          case 'SK':
            return 'bg-red-200';
          case 'KT':
            return 'bg-gray-200';
          case 'LG':
            return 'bg-purple-200';
        }
      } else {
        // 홀수 행: 더 연한 색상
        switch (carrier) {
          case 'SK':
            return 'bg-red-50';
          case 'KT':
            return 'bg-gray-50';
          case 'LG':
            return 'bg-purple-50';
        }
      }
    }
    return 'bg-gray-50';
  }
  return 'text-foreground';
}

/**
 * 통신사별 배경색을 반환하는 함수
 * @param carrier - 통신사명
 * @param isEvenRow - 짝수 행 여부
 * @returns Tailwind CSS 클래스 문자열
 */
export function getCarrierBackgroundColor(carrier: string, isEvenRow: boolean): string {
  if (!carrier) {
    return isEvenRow ? 'bg-gray-200' : 'bg-gray-100';
  }

  if (isEvenRow) {
    // 짝수 행: 더 진한 색상
    switch (carrier) {
      case 'SK':
        return 'bg-red-200';
      case 'KT':
        return 'bg-gray-200';
      case 'LG':
        return 'bg-purple-200';
      default:
        return 'bg-gray-200';
    }
  } else {
    // 홀수 행: 더 연한 색상
    switch (carrier) {
      case 'SK':
        return 'bg-red-50';
      case 'KT':
        return 'bg-gray-50';
      case 'LG':
        return 'bg-purple-50';
      default:
        return 'bg-gray-50';
    }
  }
} 