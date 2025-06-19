import { Tab } from '@/types/dashboard';

export const DASHBOARD_TABS: Tab[] = [
  { id: 'local', label: '데이터 입력' },
  { id: 'integrated', label: '통합 데이터' },
  { id: 'model', label: '모델별 데이터' },
  { id: 'visualization', label: '데이터 시각화' }
];

export const loadPublicDataFromStorage = () => {
  try {
    const raw = localStorage.getItem('publicData');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && 'models' in parsed && Array.isArray(parsed.models)) {
        return parsed;
      }
    }
    return null;
  } catch (error) {
    console.error('publicData 로드 중 오류:', error);
    return null;
  }
};

export const savePublicDataToStorage = (data: any) => {
  try {
    localStorage.setItem('publicData', JSON.stringify(data));
  } catch (error) {
    console.error('publicData 저장 중 오류:', error);
  }
}; 