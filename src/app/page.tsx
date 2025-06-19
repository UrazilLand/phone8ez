import MainVisualSlider from '@/components/home/MainVisualSlider';
import FeatureHighlights from '@/components/home/FeatureHighlights';

const plans = [
  {
    name: '기본 플랜',
    desc: '기본 시트 데이터 통합 기능',
    price: '무료',
    period: '',
    features: [
      '대시보드 기본 통합 기능',
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
      '모든 기본 기능',
      '고급 데이터 분석',
      '맞춤형 대시보드',
      '다크 모드 지원',
      '로컬 및 Cloud 기능',
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
      {/* 가격 정책 카드 */}
      <section className="py-20 bg-transparent">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-blue-900">가격 정책</h2>
        <div className="flex flex-col md:flex-row justify-center items-stretch gap-8 max-w-4xl mx-auto">
          {plans.map((plan, idx) => (
            <div
              key={plan.name}
              className="flex-1 bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center transition-transform duration-300 hover:scale-[1.02] hover:shadow-2xl border border-blue-100 min-w-[260px] max-w-[350px]"
              style={{ minHeight: 440 }}
            >
              <div className="text-2xl font-bold mb-1 text-blue-600">{plan.name}</div>
              <div className="text-sm text-gray-500 mb-4">{plan.desc}</div>
              <div className="text-3xl font-extrabold mb-1 text-gray-900">
                {plan.name === '프로페셔널' && plan.price.startsWith('월/') ? (
                  <>
                    <span className="align-baseline text-base mr-1">월/</span>
                    {plan.price.replace('월/', '')}
                  </>
                ) : plan.price}
              </div>
              <div className="text-base text-gray-400 mb-4">{plan.period}</div>
              <ul className="mb-8 space-y-2 w-full text-left flex-1">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center text-gray-900 font-medium">
                    <span className="mr-2 text-green-600 font-bold">✓</span> {f}
                  </li>
                ))}
              </ul>
              <button
                className={
                  (plan.buttonType === 'primary'
                    ? 'w-full py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors'
                    : 'w-full py-2 rounded-lg border-2 border-blue-600 text-blue-600 font-bold hover:bg-blue-50 transition-colors') +
                  ' mt-auto'
                }
              >
                {plan.button}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
