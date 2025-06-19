export interface SupportAmount {
  modelName: string;    // 모델명
  carrier: string;      // 통신사
  supportAmount: number; // 지원금 금액
  conditions: string[]; // 지원금 조건
  additionalInfo?: string; // 추가 정보
  monthlyFee?: string; // 월요금 (원본 데이터의 요금제 정보)
}

export interface SupportAmountData {
  date: string;         // 데이터 날짜
  models: SupportAmount[]; // 모델별 지원금 목록
  fileName?: string;    // 파일 이름
  publicFeeSummary?: any; // 통신사별_월요금제_요약
  allModelCodes?: string[]; // 모든_모델코드
}

// 캐시된 데이터를 저장할 객체
const cache: {
  dates: string[] | null;
  data: { [date: string]: SupportAmountData };
} = {
  dates: null,
  data: {}
};

/**
 * 특정 날짜의 공시지원금 데이터를 가져옵니다.
 * @param date YYYYMMDD 형식의 날짜 문자열
 */
export async function getSupportAmountsByDate(date: string): Promise<SupportAmountData> {
  // 캐시에 데이터가 있으면 캐시된 데이터 반환
  if (cache.data[date]) {
    return cache.data[date];
  }

  try {
    // GitHub raw content URL을 사용하여 데이터를 가져옵니다
    const response = await fetch(`https://raw.githubusercontent.com/UrazilLand/phone8ez-crawler/main/data/smartchoice_results_${date}.json`);
    if (!response.ok) {
      throw new Error(`데이터를 가져오는데 실패했습니다. (${response.status})`);
    }
    const raw = await response.json();
    // 크롤링_데이터 배열 사용
    let models: any[] = [];
    let dateValue = '';
    if (Array.isArray(raw.크롤링_데이터)) {
      models = raw.크롤링_데이터;
      dateValue = raw.공시일자 || raw.date || '';
    } else {
      throw new Error('지원하지 않는 데이터 형식입니다.');
    }
    const data: SupportAmountData & { fileName?: string } = {
      date: dateValue,
      models: models.map((item: any) => ({
        modelName: item.모델명,
        carrier: item.통신사,
        supportAmount: item.공시지원금 ?? item.기기변경지원금 ?? item.번호이동지원금 ?? 0,
        conditions: [item.요금제명, item.출고가 ? `출고가:${item.출고가}` : ''].filter(Boolean),
        additionalInfo: item.제조사,
        monthlyFee: item.월요금제,
      })),
      fileName: date,
      publicFeeSummary: raw.통신사별_월요금제_요약,
      allModelCodes: raw.모든_모델코드,
    };
    // 데이터를 캐시에 저장
    cache.data[date] = data;
    return data;
  } catch (error) {
    console.error('공시지원금 데이터 조회 실패:', error);
    throw error;
  }
}

/**
 * 사용 가능한 날짜 목록을 가져옵니다.
 */
export async function getAvailableDates(): Promise<string[]> {
  // 캐시된 날짜 목록이 있으면 반환
  if (cache.dates) {
    return cache.dates;
  }

  try {
    // GitHub API를 사용하여 저장소의 contents를 가져옵니다
    const response = await fetch('https://api.github.com/repos/UrazilLand/phone8ez-crawler/contents/data');
    if (!response.ok) {
      throw new Error('날짜 목록을 가져오는데 실패했습니다.');
    }
    const data = await response.json();
    const dates = data
      .filter((item: any) => item.name.startsWith('smartchoice_results_') && item.name.endsWith('.json'))
      .map((item: any) => item.name.replace('smartchoice_results_', '').replace('.json', ''))
      .sort((a: string, b: string) => b.localeCompare(a)); // 문자열 기준 내림차순 정렬
    // 날짜 목록을 캐시에 저장
    cache.dates = dates;
    return dates;
  } catch (error) {
    console.error('날짜 목록 조회 실패:', error);
    throw error;
  }
}

/**
 * 특정 모델의 공시지원금 데이터를 가져옵니다.
 * @param date YYYYMMDD 형식의 날짜 문자열
 * @param modelName 모델명
 */
export async function getModelSupportAmount(date: string, modelName: string): Promise<SupportAmount | null> {
  try {
    const data = await getSupportAmountsByDate(date);
    return data.models.find(model => model.modelName === modelName) || null;
  } catch (error) {
    console.error('모델 공시지원금 조회 실패:', error);
    throw error;
  }
}

/**
 * 특정 통신사의 공시지원금 데이터를 가져옵니다.
 * @param date YYYYMMDD 형식의 날짜 문자열
 * @param carrier 통신사명
 */
export async function getCarrierSupportAmounts(date: string, carrier: string): Promise<SupportAmount[]> {
  try {
    const data = await getSupportAmountsByDate(date);
    return data.models.filter(model => model.carrier === carrier);
  } catch (error) {
    console.error('통신사 공시지원금 조회 실패:', error);
    throw error;
  }
}

/**
 * 캐시를 초기화합니다.
 */
export function clearCache() {
  cache.dates = null;
  cache.data = {};
} 