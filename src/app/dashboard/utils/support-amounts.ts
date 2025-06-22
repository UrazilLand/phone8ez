import { PublicSupportData } from '@/types/dashboard';

// 캐시된 데이터를 저장할 객체
const cache: {
  dates: string[] | null;
  data: { [date: string]: PublicSupportData };
} = {
  dates: null,
  data: {}
};

/**
 * 특정 파일의 공시지원금 데이터를 가져옵니다.
 * @param fileName 전체 파일명
 */
export async function getSupportAmountsByDate(fileName: string): Promise<PublicSupportData> {
  // 캐시에 데이터가 있으면 캐시된 데이터 반환
  if (cache.data[fileName]) {
    return cache.data[fileName];
  }

  try {
    // GitHub raw content URL을 사용하여 데이터를 가져옵니다
    const response = await fetch(`https://raw.githubusercontent.com/UrazilLand/phone8ez-crawler/main/data/${fileName}`);
    if (!response.ok) {
      throw new Error(`데이터를 가져오는데 실패했습니다. (${response.status})`);
    }
    const rawData = await response.json();
    
    const data: PublicSupportData = {
      ...rawData,
      fileName: fileName,
    };
    
    // 데이터를 캐시에 저장
    cache.data[fileName] = data;
    return data;
  } catch (error) {
    console.error('공시지원금 데이터 조회 실패:', error);
    throw error;
  }
}

/**
 * 사용 가능한 데이터 파일 목록을 가져옵니다.
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
      .filter((item: any) => item.name.startsWith('phone_support_data_') && item.name.endsWith('.json'))
      .map((item: any) => item.name)
      .sort((a: string, b: string) => b.localeCompare(a)); // 문자열 기준 내림차순 정렬 (최신 파일이 위로)
    // 날짜 목록을 캐시에 저장
    cache.dates = dates;
    return dates;
  } catch (error) {
    console.error('날짜 목록 조회 실패:', error);
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