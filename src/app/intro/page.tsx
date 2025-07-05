import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Users, BarChartBig, MessageSquareHeart, ShieldCheck } from 'lucide-react';
import MainVisualSlider from '@/components/home/MainVisualSlider';

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

export default function IntroPage() {
  return (
    <div className="space-y-12">
      <section className="text-center py-12 bg-card rounded-lg shadow-md">
        <h1 className="text-3xl md:text-4xl font-suit font-bold text-blue-600 dark:text-blue-500 mb-4">휴대폰 판매 데이터를 가장 쉽게 다루는 방법</h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto font-pretendard">
          <br/>Phone8ez는 전국 대리점에서 제공되는 다양한 형식의 정책표를 자동으로 정리하고, <br/>직관적인 대시보드와 고급 필터링 기능을 통해 누구나 빠르게 분석할 수 있도록 지원합니다.
        </p>
      </section>

      <section>
        <h2 className="text-3xl font-suit font-semibold text-center text-blue-600 dark:text-blue-500 mb-8">왜 Phone8ez를 선택해야 할까요?</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="text-center shadow-lg hover:shadow-xl transition-shadow bg-card">
            <CardHeader>
              <BarChartBig className="h-12 w-12 mx-auto text-blue-600 dark:text-blue-500 mb-2" />
              <CardTitle className="font-suit text-xl text-blue-600 dark:text-blue-500">정책표 자동 정리</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground font-pretendard">붙여넣기만 하면 다양한 엑셀 양식을 자동으로 통합합니다. 포맷 맞춤 작업은 이제 그만.</p>
            </CardContent>
          </Card>
          <Card className="text-center shadow-lg hover:shadow-xl transition-shadow bg-card">
            <CardHeader>
              <Users className="h-12 w-12 mx-auto text-blue-600 dark:text-blue-500 mb-2" />
              <CardTitle className="font-suit text-xl text-blue-600 dark:text-blue-500">직관적인 시각화</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground font-pretendard">KPI 기반의 시각화 대시보드로 데이터를 쉽게 비교하고 해석할 수 있습니다.</p>
            </CardContent>
          </Card>
          <Card className="text-center shadow-lg hover:shadow-xl transition-shadow bg-card">
            <CardHeader>
              <MessageSquareHeart className="h-12 w-12 mx-auto text-blue-600 dark:text-blue-500 mb-2" />
              <CardTitle className="font-suit text-xl text-blue-600 dark:text-blue-500">클라우드 백업 & 복원</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground font-pretendard">중요한 데이터는 클라우드에 안전하게 저장하고, 언제든 불러와서 재사용할 수 있습니다.</p>
            </CardContent>
          </Card>
          <Card className="text-center shadow-lg hover:shadow-xl transition-shadow bg-card">
            <CardHeader>
              <ShieldCheck className="h-12 w-12 mx-auto text-blue-600 dark:text-blue-500 mb-2" />
              <CardTitle className="font-suit text-xl text-blue-600 dark:text-blue-500">현장 피드백 기반 개선</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground font-pretendard">사용자 제안이 실제 기능으로 반영됩니다. Phone8ez는 함께 성장하는 서비스입니다.</p>
            </CardContent>
          </Card>
        </div>
      </section>
      
      <section className="bg-card p-8 rounded-lg shadow-md">
          <h2 className="text-3xl font-suit font-semibold text-center text-blue-600 dark:text-blue-500 mb-8">Phone8ez가 지키는 핵심 가치</h2>
          <div className="flex flex-row items-center gap-8">
              <div className="w-1/2 flex justify-end">
                  <Image src="/why_phone8ez.png" alt="Phone8ez 소개 이미지" width={600} height={400} className="rounded-lg shadow-lg ring-2 ring-border" data-ai-hint="team collaboration" />
              </div>
              <div className="w-1/2 space-y-4">
                  <p className="text-lg text-muted-foreground font-pretendard">우리는 복잡한 정책표 작업을 단순화하는 것을 넘어서,<br/>
                        현장에서 일하는 사람들의 시간을 아껴주는 것을 가장 큰 가치로 삼습니다.<br/><br/>
                        데이터를 빠르게 정리하고, 누구나 이해할 수 있도록 보여주는 것. <br/>
                        그 과정에서 사용자의 경험이 불편하지 않도록 꾸준히 개선해 나가는 것.<br/>
                        Phone8ez는 기능보다 실용성, 기술보다 사람을 먼저 생각하며,<br/>
                        사용자와 함께 성장하는 플랫폼이 되고자 합니다.<br/><br/>
                        기능보다 실용성을, 기술보다 사용자 경험을 우선시하며,<br/>
                        사용자의 피드백을 서비스 개선의 중심에 둡니다.<br/>
                        언제나 현장의 목소리를 먼저 듣고, 거기서부터 시작합니다.</p>
              </div>
          </div>
      </section>

      {/* 구독 플랜(가격 정책) 카드 */}
      <section className="py-20 bg-transparent">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-blue-600 dark:text-blue-500">구독 플랜 및 가격 정책</h2>
        <div id="plans" className="flex flex-col md:flex-row justify-center items-stretch gap-8 max-w-4xl mx-auto">
          {plans.map((plan, idx) => (
            <div
              key={plan.name}
              className="flex-1 bg-card rounded-2xl shadow-lg p-8 flex flex-col items-center transition-transform duration-300 hover:scale-[1.02] hover:shadow-2xl border min-w-[260px] max-w-[350px]"
              style={{ minHeight: 440 }}
            >
              <div className="text-2xl font-bold mb-1 text-blue-600 dark:text-blue-500">{plan.name}</div>
              <div className="text-sm text-muted-foreground mb-4">{plan.desc}</div>
              <div className="text-3xl font-extrabold mb-1 text-foreground">
                {plan.name === '프로페셔널' && plan.price.startsWith('월/') ? (
                  <>
                    <span className="align-baseline text-base mr-1">월/</span>
                    {plan.price.replace('월/', '')}
                  </>
                ) : plan.price}
              </div>
              <div className="text-base text-muted-foreground/80 mb-4">{plan.period}</div>
              <ul className="mb-8 space-y-2 w-full text-left flex-1">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center text-foreground font-medium">
                    <span className="mr-2 text-blue-600 dark:text-blue-500 font-bold">✓</span> {f}
                  </li>
                ))}
              </ul>
              <button
                className={
                  (plan.buttonType === 'primary'
                    ? 'w-full py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors'
                    : 'w-full py-2 rounded-lg border-2 border-blue-600 text-blue-600 font-bold hover:bg-blue-600/10 dark:border-blue-500 dark:text-blue-500 dark:hover:bg-blue-500/10 transition-colors') +
                  ' mt-auto'
                }
              >
                {plan.button}
              </button>
            </div>
          ))}
        </div>
        {/* 결제/환불/취소 정책 안내 */}
        <div className="mt-12 max-w-2xl mx-auto bg-blue-50 dark:bg-blue-950/30 rounded-xl p-6 text-blue-900 dark:text-blue-100 shadow">
          <h3 className="text-xl font-bold mb-2 text-blue-700 dark:text-blue-300">결제/환불/취소 정책 안내</h3>
          <ul className="list-disc pl-5 space-y-1 text-base">
            <li>결제 완료 후 7일 이내에는 전액 환불이 가능합니다.</li>
            <li>서비스 이용 시작(데이터 다운로드, 구독 혜택 사용 등) 이후에는 환불이 불가합니다.</li>
            <li>환불 요청은 고객센터(이메일/전화)로 접수해 주시기 바랍니다.</li>
            <li>결제 취소 및 환불은 영업일 기준 3일 이내 처리됩니다.</li>
          </ul>
        </div>
      </section>

    </div>
  );
}
