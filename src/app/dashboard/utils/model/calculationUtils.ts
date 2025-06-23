import { DataSet } from '@/types/dashboard';

/**
 * 모델 컨텐츠에서 출고가를 추출합니다.
 */
export const getPriceFromModelContent = (modelContent: string): number => {
  if (modelContent && modelContent.includes('price:')) {
    const priceMatch = modelContent.match(/price:(\d+)/);
    if (priceMatch) {
      return Number(priceMatch[1]) || 0;
    }
  }
  return 0;
};

/**
 * 특정 행의 정책지원금을 계산합니다.
 */
export const getPolicySupportAmount = (
  rowIndex: number, 
  sheetData: string[][], 
  dataSets: DataSet[]
): number => {
  const integratedDataSet = dataSets.find(dataset => dataset.type === 'integrated');
  if (!integratedDataSet?.data.sheetData) return 0;

  const integratedData = integratedDataSet.data.sheetData;
  const carrier = sheetData[rowIndex]?.[0]?.trim();
  const supportType = sheetData[rowIndex]?.[1]?.trim();
  const planName = sheetData[rowIndex]?.[2]?.split('|')[0];
  const joinType = sheetData[rowIndex]?.[3]?.trim();
  const company = sheetData[rowIndex]?.[4]?.trim();

  if (!carrier || !supportType || !planName || !joinType || !company) return 0;

  // 통합 데이터에서 해당 조건에 맞는 데이터 찾기
  for (let col = 1; col < integratedData[0].length; col++) {
    const integratedCarrier = integratedData[0]?.[col]?.trim();
    const integratedSupportType = integratedData[1]?.[col]?.trim();
    const integratedPlanName = integratedData[2]?.[col]?.split('|')[0];
    const integratedJoinType = integratedData[3]?.[col]?.trim();
    const integratedCompany = integratedData[4]?.[col]?.trim();

    if (
      integratedCarrier === carrier &&
      integratedSupportType === supportType &&
      integratedPlanName === planName &&
      integratedJoinType === joinType &&
      integratedCompany === company
    ) {
      // 6행부터 모델 데이터 확인
      for (let row = 5; row < integratedData.length; row++) {
        const modelCellData = integratedData[row]?.[0] || '';
        if (modelCellData.includes('codes:')) {
          const codesPart = modelCellData.split('|').find(p => p.startsWith('codes:'));
          if (codesPart) {
            const targetModelCodes = codesPart.replace('codes:', '').split(',');
            
            // 다른 데이터셋에서 해당 모델 코드의 정책지원금 찾기
            for (const dataSet of dataSets) {
              if (dataSet.type === 'integrated') continue;
              
              const sourceSheet = dataSet.data.sheetData;
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
                      const numericValue = cellValue.replace(/[^\d-]/g, '');
                      if (numericValue) {
                        return Number(numericValue);
                      }
                    }
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
 * 특정 행의 공시지원금을 계산합니다.
 */
export const getPublicSupportAmount = (
  rowIndex: number, 
  sheetData: string[][], 
  selectedModelContent: string, 
  publicData: any
): number => {
  // 헤더의 선택된 드롭박스 내용에서 표준 모델번호 추출
  const standardModel = selectedModelContent?.split('|').find(p => p.startsWith('standard:'))?.replace('standard:', '') || '';
  const joinType = sheetData[rowIndex]?.[3]?.trim() || '';
  const carrier = sheetData[rowIndex]?.[0]?.trim() || '';
  
  // 3열에서 내부 저장된 월 요금 추출
  const planCell = sheetData[rowIndex]?.[2] || '';
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
 * 특정 행의 부가서비스 금액을 계산합니다.
 */
export const getAdditionalServiceAmount = (
  rowIndex: number, 
  sheetData: string[][], 
  dataSets: DataSet[]
): number => {
  const carrier = sheetData[rowIndex]?.[0]?.trim() || '';
  const company = sheetData[rowIndex]?.[4]?.trim() || '';
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
 * 최종 금액을 계산합니다.
 */
export const calculateFinalAmount = (
  rowIndex: number, 
  sheetData: string[][], 
  selectedModelContent: string, 
  dataSets: DataSet[], 
  publicData: any
): { 
  finalAmount: number; 
  price: number; 
  policySupport: number; 
  publicSupport: number; 
  additionalService: number; 
} => {
  const price = getPriceFromModelContent(selectedModelContent);
  const policySupport = getPolicySupportAmount(rowIndex, sheetData, dataSets);
  const publicSupport = getPublicSupportAmount(rowIndex, sheetData, selectedModelContent, publicData);
  const additionalService = getAdditionalServiceAmount(rowIndex, sheetData, dataSets);
  
  if (policySupport === 0) {
    return { finalAmount: 0, price, policySupport: 0, publicSupport, additionalService };
  }
  
  const finalAmount = Math.floor((price - policySupport * 10000 - publicSupport - additionalService) / 10000);
  return { finalAmount, price, policySupport, publicSupport, additionalService };
};

/**
 * 하이라이트할 총액 셀들을 계산합니다.
 */
export const calculateHighlightedTotalCells = (
  sheetData: string[][], 
  selectedModelContent: string, 
  dataSets: DataSet[], 
  publicData: any
): Set<number> => {
  const minTotals: Record<string, number> = {}; // key: `${carrier}-${joinType}`
  const finalAmounts: { rowIndex: number; carrier: string; joinType: string; total: number }[] = [];

  sheetData.forEach((row, rowIndex) => {
    const carrier = row[0]?.trim();
    const joinType = row[3]?.trim();
    if (carrier && joinType) {
      const calculation = calculateFinalAmount(rowIndex, sheetData, selectedModelContent, dataSets, publicData);
      if (calculation.policySupport > 0 || calculation.finalAmount !== 0) {
        finalAmounts.push({ rowIndex, carrier, joinType, total: calculation.finalAmount });
      }
    }
  });

  finalAmounts.forEach(({ carrier, joinType, total }) => {
    const key = `${carrier}-${joinType}`;
    if (minTotals[key] === undefined || total < minTotals[key]) {
      minTotals[key] = total;
    }
  });

  const highlightSet = new Set<number>();
  finalAmounts.forEach(({ rowIndex, carrier, joinType, total }) => {
    const key = `${carrier}-${joinType}`;
    if (minTotals[key] === total) {
      highlightSet.add(rowIndex);
    }
  });

  return highlightSet;
}; 