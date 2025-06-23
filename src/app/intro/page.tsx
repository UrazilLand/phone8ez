import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Users, BarChartBig, MessageSquareHeart, ShieldCheck } from 'lucide-react';

export default function IntroPage() {
  return (
    <div className="space-y-12">
      <section className="text-center py-12 bg-gradient-to-b from-blue-50 to-background rounded-lg shadow-md">
        <h1 className="text-3xl md:text-4xl font-suit font-bold text-blue-700 mb-4">휴대폰 판매 데이터를 가장 쉽게 다루는 방법</h1>
        <p className="text-lg md:text-xl text-foreground max-w-3xl mx-auto font-pretendard">
          <br/>Phone8ez는 전국 대리점에서 제공되는 다양한 형식의 정책표를 자동으로 정리하고, <br/>직관적인 대시보드와 고급 필터링 기능을 통해 누구나 빠르게 분석할 수 있도록 지원합니다.
        </p>
      </section>

      <section>
        <h2 className="text-3xl font-suit font-semibold text-center text-blue-700 mb-8">왜 Phone8ez를 선택해야 할까요?</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="text-center shadow-lg hover:shadow-xl transition-shadow border-blue-100">
            <CardHeader>
              <BarChartBig className="h-12 w-12 mx-auto text-blue-600 mb-2" />
              <CardTitle className="font-suit text-xl text-blue-600">정책표 자동 정리</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground font-pretendard">붙여넣기만 하면 다양한 엑셀 양식을 자동으로 통합합니다. 포맷 맞춤 작업은 이제 그만.</p>
            </CardContent>
          </Card>
          <Card className="text-center shadow-lg hover:shadow-xl transition-shadow border-blue-100">
            <CardHeader>
              <Users className="h-12 w-12 mx-auto text-blue-600 mb-2" />
              <CardTitle className="font-suit text-xl text-blue-600">직관적인 시각화</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground font-pretendard">KPI 기반의 시각화 대시보드로 데이터를 쉽게 비교하고 해석할 수 있습니다.</p>
            </CardContent>
          </Card>
          <Card className="text-center shadow-lg hover:shadow-xl transition-shadow border-blue-100">
            <CardHeader>
              <MessageSquareHeart className="h-12 w-12 mx-auto text-blue-600 mb-2" />
              <CardTitle className="font-suit text-xl text-blue-600">클라우드 백업 & 복원</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground font-pretendard">중요한 데이터는 클라우드에 안전하게 저장하고, 언제든 불러와서 재사용할 수 있습니다.</p>
            </CardContent>
          </Card>
          <Card className="text-center shadow-lg hover:shadow-xl transition-shadow border-blue-100">
            <CardHeader>
              <ShieldCheck className="h-12 w-12 mx-auto text-blue-600 mb-2" />
              <CardTitle className="font-suit text-xl text-blue-600">현장 피드백 기반 개선</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground font-pretendard">사용자 제안이 실제 기능으로 반영됩니다. Phone8ez는 함께 성장하는 서비스입니다.</p>
            </CardContent>
          </Card>
        </div>
      </section>
      
      <section className="bg-card p-8 rounded-lg shadow-md">
          <h2 className="text-3xl font-suit font-semibold text-center text-blue-700 mb-8">Phone8ez가 지키는 핵심 가치</h2>
          <div className="flex flex-row items-center gap-8">
              <div className="w-1/2 flex justify-end">
                  <Image src="/why_phone8ez.png" alt="Phone8ez 소개 이미지" width={600} height={400} className="rounded-lg shadow-lg ring-2 ring-blue-200" data-ai-hint="team collaboration" />
              </div>
              <div className="w-1/2 space-y-4">
                  <p className="text-lg text-foreground font-pretendard">우리는 복잡한 정책표 작업을 단순화하는 것을 넘어서,<br/>
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

    </div>
  );
}
