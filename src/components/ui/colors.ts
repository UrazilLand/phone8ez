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

export const PLAN_BG_COLORS = [
  "bg-blue-300",
  "bg-indigo-300",
  "bg-purple-300",
  "bg-pink-300",
  "bg-red-300",
  "bg-orange-300",
  "bg-amber-300",
  "bg-yellow-300",
  "bg-lime-300",
  "bg-green-300",
  "bg-emerald-300",
  "bg-teal-300",
  "bg-cyan-300",
  "bg-sky-300"
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
  primary: "bg-blue-600 border-2 border-blue-600 text-white font-extrabold rounded hover:bg-blue-700 transition-colors",
  secondary: "bg-card border-2 border-blue-600 text-blue-600 font-extrabold rounded hover:bg-blue-100 transition-colors",
  danger: "bg-card border-2 border-red-600 text-red-600 font-extrabold rounded hover:bg-red-100 transition-colors",
  danger_fill: "bg-red-600 border-2 border-red-600 text-white font-extrabold rounded hover:bg-red-700 transition-colors",
  disabled: "bg-gray-100 border-2 border-gray-300 text-gray-400 font-extrabold rounded cursor-not-allowed",
  gray: "bg-gray-100 border-2 border-gray-300 text-gray-600 font-extrabold rounded hover:bg-gray-200 transition-colors"
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
    return 'text-muted-foreground'; // 기본 텍스트 색상
  }
  
  const value = cellValue.trim();

  switch (rowIndex) {
    // 통신사
    case 0:
      return CARRIER_OPTIONS.find(opt => opt.variants.includes(value))?.style || 'text-foreground font-bold';
    
    // 지원 구분 (계약 유형)
    case 1:
      return CONTRACT_OPTIONS.find(opt => opt.value === value)?.style || 'text-foreground font-medium';
      
    // 요금제
    case 2:
      // 열 인덱스 기반 색상 순환 적용
      if (typeof colIndex === 'number' && colIndex > 0) {
        const planColorIndex = (colIndex - 1) % PLAN_BG_COLORS.length;
        return `${PLAN_BG_COLORS[planColorIndex]} text-black font-medium`;
      } else {
        // fallback: 기존 해시 방식
        const planColorIndex = getColorIndex(value, PLAN_BG_COLORS);
        return `${PLAN_BG_COLORS[planColorIndex]} text-black font-medium`;
      }

    // 가입 유형
    case 3:
      return JOIN_TYPE_OPTIONS.find(opt => opt.value === value)?.style || 'text-foreground bg-muted/30';

    // 업체명
    case 4:
      // 업체명 이름을 기반으로 텍스트 색상 적용
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

  // 교차 색상 적용 (6행부터)
  if (rowIndex >= 5) {
    if (rowIndex % 2 === 0) {
      // 짝수 행: 더 진한 색상
      if (carrier) {
        switch (carrier) {
          case 'SK':
            styleClasses = 'bg-red-200 ';
            break;
          case 'KT':
            styleClasses = 'bg-gray-200 ';
            break;
          case 'LG':
            styleClasses = 'bg-purple-200 ';
            break;
        }
      } else {
        styleClasses = 'bg-gray-200 ';
      }
    } else {
      // 홀수 행: 더 연한 색상
      if (carrier) {
        switch (carrier) {
          case 'SK':
            styleClasses = 'bg-red-50 ';
            break;
          case 'KT':
            styleClasses = 'bg-gray-50 ';
            break;
          case 'LG':
            styleClasses = 'bg-purple-50 ';
            break;
        }
      } else {
        styleClasses = 'bg-gray-50 ';
      }
    }
  }

  return styleClasses;
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
    const planIndex = Math.abs(cellValue.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % PLAN_BG_COLORS.length;
    return `${PLAN_BG_COLORS[planIndex]} text-foreground font-medium rounded`;
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