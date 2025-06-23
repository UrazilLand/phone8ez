import { DataSet } from '@/types/dashboard';

/**
 * 통합 시트에서 매칭되는 값을 찾는 함수
 */
export const findMatchingValue = (
  rowIndex: number, 
  colIndex: number, 
  sheetHeaders: string[][], 
  aColumnData: string[], 
  dataSets: DataSet[]
): string => {
  const carrier = sheetHeaders[0]?.[colIndex]?.trim();
  const supportType = sheetHeaders[1]?.[colIndex]?.trim();
  const planName = (sheetHeaders[2]?.[colIndex]?.trim() || '').split('|')[0];
  const joinType = sheetHeaders[3]?.[colIndex]?.trim();
  const company = sheetHeaders[4]?.[colIndex]?.trim();

  if (!carrier || !supportType || !planName || !joinType || !company) return '';

  const modelCellData = aColumnData[rowIndex] || '';
  if (!modelCellData.includes('codes:')) return '';
  
  const codesPart = modelCellData.split('|').find(p => p.startsWith('codes:'));
  if (!codesPart) return '';
  const targetModelCodes = codesPart.replace('codes:', '').split(',');

  const foundValues: string[] = [];
  const searchDataSets = dataSets.filter(ds => ds.type !== 'integrated');

  for (const ds of searchDataSets) {
    const sourceSheet = ds.data.sheetData;
    if (!sourceSheet || sourceSheet.length < 5) continue;

    for (let sourceCol = 1; sourceCol < sourceSheet[0].length; sourceCol++) {
      if (
        carrier === sourceSheet[0]?.[sourceCol]?.trim() &&
        supportType === sourceSheet[1]?.[sourceCol]?.trim() &&
        planName === (sourceSheet[2]?.[sourceCol]?.trim() || '').split('|')[0] &&
        joinType === sourceSheet[3]?.[sourceCol]?.trim() &&
        company === sourceSheet[4]?.[sourceCol]?.trim()
      ) {
        for (let sourceRow = 5; sourceRow < sourceSheet.length; sourceRow++) {
          const sourceModelCode = sourceSheet[sourceRow]?.[0]?.trim();
          if (sourceModelCode && targetModelCodes.includes(sourceModelCode)) {
            const cellValue = sourceSheet[sourceRow]?.[sourceCol] || '';
            // 숫자만 추출 (음수 부호 포함)
            const numericValue = cellValue.replace(/[^\d-]/g, '');
            if (numericValue) {
              foundValues.push(numericValue);
            }
          }
        }
      }
    }
  }

  const uniqueFoundValues = [...new Set(foundValues.filter(v => v))];
  if (uniqueFoundValues.length === 0) return '';
  if (uniqueFoundValues.length > 1) return `${uniqueFoundValues.join(';')}|WARN_MULTI`;
  return uniqueFoundValues[0];
};

/**
 * 하이라이트할 셀들을 계산하는 함수
 */
export const calculateHighlightedCells = (
  currentSheetData: string[][], 
  sheetHeaders: string[][]
): Set<string> => {
  const highlightSet = new Set<string>();
  if (currentSheetData.length < 5) return highlightSet;

  // 6행부터(rowIndex=5) 각 행을 순회
  for (let r = 5; r < currentSheetData.length; r++) {
    const row = currentSheetData[r];
    if (!row) continue;

    const minValues: Record<string, number> = {};

    // Pass 1: Find minimum value for each carrier-joinType combination in the row
    for (let c = 1; c < row.length; c++) {
      const carrier = sheetHeaders[0]?.[c]?.trim();
      const joinType = sheetHeaders[3]?.[c]?.trim();
      const cellValue = row[c]?.split('|')[0].split(';')[0].trim();

      if (carrier && joinType && cellValue && !isNaN(Number(cellValue))) {
        const key = `${carrier}-${joinType}`;
        const numValue = Number(cellValue);

        if (minValues[key] === undefined || numValue < minValues[key]) {
          minValues[key] = numValue;
        }
      }
    }

    // Pass 2: Highlight all cells that match the minimum value
    for (let c = 1; c < row.length; c++) {
      const carrier = sheetHeaders[0]?.[c]?.trim();
      const joinType = sheetHeaders[3]?.[c]?.trim();
      const cellValue = row[c]?.split('|')[0].split(';')[0].trim();

      if (carrier && joinType && cellValue && !isNaN(Number(cellValue))) {
        const key = `${carrier}-${joinType}`;
        const numValue = Number(cellValue);

        if (minValues[key] === numValue) {
          highlightSet.add(`${r}-${c}`);
        }
      }
    }
  }
  return highlightSet;
};

/**
 * A열에서 출고가를 추출하는 함수
 */
export const getPriceFromAColumn = (rowIndex: number, aColumnData: string[]): number => {
  const aColumnValue = aColumnData[rowIndex] || '';
  if (aColumnValue.includes('price:')) {
    const priceMatch = aColumnValue.match(/price:(\d+)/);
    if (priceMatch) {
      return Number(priceMatch[1]) || 0;
    }
  }
  return 0;
};

/**
 * 공시지원금을 계산하는 함수
 */
export const getPublicSupportAmount = (
  rowIndex: number, 
  colIndex: number, 
  sheetHeaders: string[][], 
  aColumnData: string[], 
  publicData: any
): number => {
  const standardModel = aColumnData[rowIndex]?.split('|').find(p => p.startsWith('standard:'))?.replace('standard:', '') || '';
  const joinType = sheetHeaders[3]?.[colIndex]?.trim() || '';
  const carrier = sheetHeaders[0]?.[colIndex]?.trim() || '';
  
  // 3열에서 월 요금 추출
  const planCell = sheetHeaders[2]?.[colIndex] || '';
  const planParts = planCell.split('|');
  const monthlyFee1 = planParts[1] ? Number(planParts[1]) : null;
  const monthlyFee2 = planParts[2] ? Number(planParts[2]) : null;
  
  if (!standardModel || (monthlyFee1 === null && monthlyFee2 === null) || !carrier) {
    return 0;
  }

  if (!publicData) {
    return 0;
  }
  
  for (const [manufacturerName, manufacturer] of Object.entries(publicData.manufacturers)) {
    const typedManufacturer = manufacturer as any;
    if (typedManufacturer.models) {
      for (const model of typedManufacturer.models) {
        if (model.model_number === standardModel) {
          for (const section of model.support_info.sections) {
            for (const [carrierName, carrierInfo] of Object.entries(section.carriers)) {
              if (carrierInfo && typeof carrierInfo === 'object' && carrierName === carrier) {
                const carrierMonthlyFee = (carrierInfo as any).monthly_fee;
                const isMonthlyFeeMatch = (monthlyFee1 !== null && carrierMonthlyFee === monthlyFee1) || 
                                        (monthlyFee2 !== null && carrierMonthlyFee === monthlyFee2);
                
                if (isMonthlyFeeMatch) {
                  let supportAmount = 0;
                  if (joinType === '번호이동') {
                    supportAmount = (carrierInfo as any).number_port_support || 0;
                  } else {
                    supportAmount = (carrierInfo as any).device_support || 0;
                  }
                  
                  if (supportAmount > 0) {
                    return Number(supportAmount);
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  
  return 0;
};

/**
 * 부가서비스 금액을 계산하는 함수
 */
export const getAdditionalServiceAmount = (
  rowIndex: number, 
  colIndex: number, 
  sheetHeaders: string[][], 
  dataSets: DataSet[]
): number => {
  const carrier = sheetHeaders[0]?.[colIndex]?.trim() || '';
  const company = sheetHeaders[4]?.[colIndex]?.trim() || '';
  const serviceKey = `${company}-${carrier}`;
  
  if (!carrier || !company) {
    return 0;
  }

  const additionalDataSet = dataSets.find(ds => ds.type === 'additional');
  if (!additionalDataSet?.data.additionalServices) {
      return 0;
  }

  const additionalServices = additionalDataSet.data.additionalServices;
  const companyServices = additionalServices[serviceKey];

  if (!companyServices) {
      return 0;
  }

  let totalAmount = 0;
  companyServices.forEach(service => {
    const discount = Number(service.discount) || 0;
    totalAmount += discount;
  });

  return totalAmount;
};

/**
 * 최종 금액을 계산하는 함수
 */
export const calculateFinalAmount = (
  rowIndex: number, 
  colIndex: number, 
  sheetHeaders: string[][], 
  aColumnData: string[], 
  dataSets: DataSet[], 
  publicData: any,
  currentSheetData?: string[][] // 현재 시트 데이터 추가
): { 
  finalAmount: number; 
  price: number; 
  policySupport: number; 
  publicSupport: number; 
  additionalService: number; 
} => {
  const price = getPriceFromAColumn(rowIndex, aColumnData);
  
  // 통합 시트에서는 정책지원금을 셀 데이터에서 직접 읽어옴
  let policySupport = 0;
  if (currentSheetData && currentSheetData[rowIndex] && currentSheetData[rowIndex][colIndex]) {
    const cellValue = currentSheetData[rowIndex][colIndex];
    const numericValue = cellValue.split('|')[0].split(';')[0].trim();
    policySupport = Number(numericValue) || 0;
  }
  
  const publicSupport = getPublicSupportAmount(rowIndex, colIndex, sheetHeaders, aColumnData, publicData);
  const additionalService = getAdditionalServiceAmount(rowIndex, colIndex, sheetHeaders, dataSets);
  
  // 정책지원금이 0인 경우 빈칸으로 표시
  if (policySupport === 0) {
    return {
      finalAmount: 0,
      price,
      policySupport: 0,
      publicSupport,
      additionalService
    };
  }
  
  // 계산: (출고가 - 정책지원금*10000 - 공시지원금 - 부가서비스) / 10000
  const finalAmount = Math.floor((price - policySupport * 10000 - publicSupport - additionalService) / 10000);
  
  return {
    finalAmount,
    price,
    policySupport,
    publicSupport,
    additionalService
  };
}; 