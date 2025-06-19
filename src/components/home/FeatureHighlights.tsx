import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Combine, BarChart3, MessageCircle, ShieldQuestion, DatabaseBackup } from 'lucide-react';
import type React from 'react';

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: Combine,
    title: '자동 데이터 통합',
    description: '제각기 다른 엑셀 정책표를 자동으로 통합합니다. 서식을 맞추거나 정리할 필요 없이 바로 업로드!',
  },
  {
    icon: BarChart3,
    title: '분석에 최적화된 대시보드',
    description: '업로드된 데이터를 다양한 기준으로 시각화하여 비교할 수 있는 직관적인 대시보드 제공!',
  },
  {
    icon: MessageCircle,
    title: '전문가 커뮤니티',
    description: '동료 판매 전문가들과 정보를 공유, 질문하면서 업계 동향을 파악할 수 있는 공간!',
  },
  {
    icon: DatabaseBackup,
    title: '안전한 데이터 백업',
    description: '중요한 데이터 안전하게 클라우드에 저장하거나, 직접 다운로드 가능!',
  },
  {
    icon: Zap,
    title: '구독자 전용 기능',
    description: '피벗 분석, 고급 필터링, 데이터 백업 및 복원 등 구독자만 사용할 수 있는 고급 기능 제공!',
  },
  {
    icon: ShieldQuestion,
    title: '고객 제안 발전',
    description: '사용자 제안과 피드백을 바탕으로 사용자 경험을 최우선으로 반영하여, 지속적으로 기능 확장!',
  },
];

const FeatureHighlights = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="font-headline text-3xl md:text-4xl font-bold text-center text-blue-700 mb-12">
          주요 기능
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 bg-card">
              <CardHeader className="flex flex-row items-center space-x-4 pb-2">
                <feature.icon className="w-10 h-10 text-blue-600" />
                <CardTitle className="font-headline text-xl text-blue-600">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureHighlights;
