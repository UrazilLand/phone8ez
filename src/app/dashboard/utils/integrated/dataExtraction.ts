import { DataSet } from '@/types/dashboard';
import { SupportAmountData } from '../support-amounts';

/**
 * 데이터셋에서 특정 통신사의 업체명을 추출합니다.
 * @param dataSets 데이터셋 배열
 * @param carrier 통신사 (SK, KT, LG)
 * @returns 중복 제거된 업체명 배열
 */
export function extractCompaniesByCarrier(dataSets: DataSet[], carrier: string): string[] {
  const companies = new Set<string>();
  
  dataSets.forEach(dataSet => {
    const sheetData = dataSet.data.sheetData;
    if (sheetData && sheetData.length >= 5 && sheetData[0].length > 1) {
      for (let col = 1; col < sheetData[0].length; col++) {
        const dataCarrier = sheetData[0]?.[col]?.trim();
        if (dataCarrier === carrier) {
          const company = sheetData[4]?.[col]?.trim();
          if (company) {
            companies.add(company);
          }
        }
      }
    }
  });
  
  return Array.from(companies).sort();
}

/**
 * 특정 통신사와 업체명에 해당하는 요금제를 추출합니다.
 * @param dataSets 데이터셋 배열
 * @param carrier 통신사
 * @param company 업체명
 * @returns 중복 제거된 요금제 배열 (원본 순서 유지)
 */
export function extractPlansByCarrierAndCompany(dataSets: DataSet[], carrier: string, company: string): string[] {
  const plans: string[] = [];
  const seenPlans = new Set<string>();
  
  dataSets.forEach(dataSet => {
    const sheetData = dataSet.data.sheetData;
    if (sheetData && sheetData.length >= 5 && sheetData[0].length > 1) {
      for (let col = 1; col < sheetData[0].length; col++) {
        const dataCarrier = sheetData[0]?.[col]?.trim();
        const dataCompany = sheetData[4]?.[col]?.trim();
        
        if (dataCarrier === carrier && dataCompany === company) {
          const plan = sheetData[2]?.[col]?.trim();
          if (plan && !seenPlans.has(plan)) {
            plans.push(plan);
            seenPlans.add(plan);
          }
        }
      }
    }
  });
  
  return plans;
}

/**
 * 공시 데이터에서 특정 통신사의 월 요금제를 추출합니다.
 * @param publicData 공시 데이터
 * @param carrier 통신사
 * @returns 중복 제거된 월 요금제 배열 (숫자 형식)
 */
export function extractMonthlyFeesByCarrier(publicData: SupportAmountData | null, carrier: string): number[] {
  if (!publicData?.publicFeeSummary?.[carrier]) {
    return [];
  }
  
  const monthlyFees = publicData.publicFeeSummary[carrier];
  return Array.isArray(monthlyFees) ? [...new Set(monthlyFees)].sort((a, b) => a - b) : [];
}

/**
 * 데이터셋에서 특정 조건에 맞는 데이터를 찾습니다.
 * @param dataSets 데이터셋 배열
 * @param carrier 통신사
 * @param company 업체명
 * @param plan 요금제
 * @returns 매칭되는 데이터셋의 1~5행 데이터
 */
export function findMatchingData(dataSets: DataSet[], carrier: string, company: string, plan: string): string[][] | null {
  for (const dataSet of dataSets) {
    const sheetData = dataSet.data.sheetData;
    if (sheetData && sheetData.length >= 5 && sheetData[0].length > 1) {
       for (let col = 1; col < sheetData[0].length; col++) {
          const dataCarrier = sheetData[0]?.[col]?.trim();
          const dataPlan = sheetData[2]?.[col]?.trim();
          const dataCompany = sheetData[4]?.[col]?.trim();
          
          if (dataCarrier === carrier && dataPlan === plan && dataCompany === company) {
            return [
              [sheetData[0]?.[col] || ''],
              [sheetData[1]?.[col] || ''],
              [sheetData[2]?.[col] || ''],
              [sheetData[3]?.[col] || ''],
              [sheetData[4]?.[col] || '']
            ];
          }
       }
    }
  }
  
  return null;
}

/**
 * 선택된 데이터를 통합시트에 적용할 수 있는 형태로 변환합니다.
 * @param selectedData 선택된 데이터
 * @param dataSets 데이터셋 배열
 * @returns 통합시트에 적용할 데이터
 */
export function prepareIntegratedData(selectedData: {
  carrier: string;
  companies: string[];
  plans: string[];
  monthlyFees: number[];
}, dataSets: DataSet[]): string[][] {
  const integratedData: string[][] = [];
  
  // SK, KT, LG 순서로 처리
  const carriers = ['SK', 'KT', 'LG'];
  
  carriers.forEach(carrier => {
    if (carrier === selectedData.carrier) {
      // 선택된 통신사의 데이터 처리
      selectedData.companies.forEach(company => {
        selectedData.plans.forEach(plan => {
          const matchingData = findMatchingData(dataSets, carrier, company, plan);
          if (matchingData) {
            integratedData.push(...matchingData);
          }
        });
      });
    }
  });
  
  return integratedData;
}

/**
 * 월 요금제 정보를 셀 데이터에 포함시킵니다.
 * @param cellValue 셀 값
 * @param monthlyFee 월 요금제
 * @returns 월 요금제 정보가 포함된 셀 데이터
 */
export function createCellWithMonthlyFee(cellValue: string, monthlyFee?: number): string {
  if (monthlyFee) {
    return `${cellValue}|${monthlyFee}`;
  }
  return cellValue;
}

/**
 * 셀 데이터에서 월 요금제 정보를 추출합니다.
 * @param cellValue 셀 값
 * @returns 월 요금제 정보
 */
export function extractMonthlyFeeFromCell(cellValue: string): number | null {
  const parts = cellValue.split('|');
  if (parts.length > 1) {
    const monthlyFee = parseInt(parts[1]);
    return isNaN(monthlyFee) ? null : monthlyFee;
  }
  return null;
}

/**
 * 공시 데이터에서 요금제와 월 요금에 맞는 지원금 정보를 찾아 반환합니다.
 * @param planName 요금제 이름
 * @param monthlyFee1 월 요금 1
 * @param monthlyFee2 월 요금 2
 * @param supportAmountData 공시 지원금 데이터
 * @returns 매칭되는 지원금 정보 객체의 배열
 */
export function findSupportData(
  planName: string, 
  monthlyFee1: number | null, 
  monthlyFee2: number | null, 
  supportAmountData: any[]
): { row: number; support: number; monthlyFee: number }[] {
  const results: { row: number; support: number; monthlyFee: number }[] = [];

  const processFee = (monthlyFee: number | null) => {
    if (monthlyFee === null) return;

    for (const model of supportAmountData) {
      if (model.plan === planName && model.monthlyFee === monthlyFee) {
        results.push({
          row: model.row,
          support: model.support,
          monthlyFee: model.monthlyFee
        });
        // 일치하는 첫 번째 모델만 사용하려면 여기서 break 가능
      }
    }
  };

  processFee(monthlyFee1);
  processFee(monthlyFee2);

  return results;
} 