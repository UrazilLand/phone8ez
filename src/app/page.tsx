import MainVisualSlider from '@/components/home/MainVisualSlider';
import FeatureHighlights from '@/components/home/FeatureHighlights';

const plans = [
  {
    name: '기본 플랜',
    desc: '기본 시트 데이터 통합 기능',
    price: '무료',
    period: '',
    features: [
      '데이터 입력 및 통합',
      '공시 지원금 자동 적용',
      '이메일 문의',
    ],
    button: '시작하기',
    buttonType: 'outline',
  },
  {
    name: '프로페셔널',
    desc: '전문적인 데이터 분석과 고급 기능',
    price: '월/19,900원',
    period: '',
    features: [
      '기본 통합 기능',
      '모델별 데이터 상세보기',
      '로컬 및 Cloud 저장',
      '다크 모드 지원',
      '우선 고객 지원',
    ],
    button: '7일 무료체험 등록',
    buttonType: 'primary',
  },
];

export default function HomePage() {
  return (
    <div className="space-y-12 md:space-y-16">
      <MainVisualSlider />
      <FeatureHighlights />
      {/* 가격 정책 카드 섹션 제거됨 */}
    </div>
  );
}

export const metadata = {
  title: 'Phone8ez - 휴대폰 정책 자동화 서비스',
  description: '휴대폰 정책표를 자동으로 정리하고, 대시보드로 쉽게 분석하세요. 전국 대리점 데이터 통합 서비스.',
  openGraph: {
    title: 'Phone8ez - 휴대폰 정책 자동화 서비스',
    description: '휴대폰 정책표를 자동으로 정리하고, 대시보드로 쉽게 분석하세요. 전국 대리점 데이터 통합 서비스.',
    url: 'https://phone8ez.com/',
    images: ['/og-image.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Phone8ez - 휴대폰 정책 자동화 서비스',
    description: '휴대폰 정책표를 자동으로 정리하고, 대시보드로 쉽게 분석하세요. 전국 대리점 데이터 통합 서비스.',
    images: ['/og-image.png'],
  },
};
