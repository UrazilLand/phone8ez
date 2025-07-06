"use client";
import { useAuth } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import dayjs from 'dayjs';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';

const plans = [
  {
    name: '기본 플랜',
    desc: '기본 시트 데이터 통합 기능',
    price: '무료',
    period: '',
    features: [
      '데이터 입력 및 통합',
      '데이터셋 3개 이용 가능',
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
      '모든 무료 기능',
      '모델별 데이터 상세보기',
      '무제한 데이터셋',
      '로컬 및 Cloud 저장',
      '다크 모드 지원',
      '우선 고객 지원',
    ],
    button: '7일 무료체험 등록',
    buttonType: 'primary',
  },
];

export default function IntroClientSection() {
  const { user } = useAuth();
  const [hasSubscription, setHasSubscription] = useState<boolean|null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      setHasSubscription(null);
      return;
    }
    let ignore = false;
    (async () => {
      const { data } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (!ignore) setHasSubscription(!!data?.id);
    })();
    return () => { ignore = true; };
  }, [user?.id]);

  const handleTrial = async () => {
    if (!user?.id) {
      toast({
        title: '로그인이 필요합니다.',
        description: '무료체험을 이용하려면 먼저 로그인해 주세요.',
      });
      return;
    }
    setLoading(true);
    const { data: userInfo } = await supabase
      .from('users')
      .select('email, nickname, provider')
      .eq('id', user.id)
      .maybeSingle();
    const now = dayjs();
    const ends = now.add(7, 'day').add(1, 'day').startOf('day');
    const { error } = await supabase.from('subscriptions').insert({
      user_id: user.id,
      plan: 'pro',
      status: 'active',
      started_at: now.toISOString(),
      ends_at: ends.toISOString(),
      email: userInfo?.email ?? null,
      nickname: userInfo?.nickname ?? null,
      provider: userInfo?.provider ?? null,
    });
    setLoading(false);
    if (!error) {
      setHasSubscription(true);
      toast({
        title: '7일 무료체험이 시작되었습니다!',
        description: `오늘부터 7일간 모든 프로 기능을 사용할 수 있습니다.\n만료일: ${ends.format('YYYY-MM-DD 00:00')}까지`,
      });
    } else {
      toast({
        title: '무료체험 등록에 실패했습니다.',
        description: '이미 무료체험을 사용하셨거나, 네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
      });
    }
  };

  const handleSubscribe = () => {
    alert('포트원 결제 연동 예정!');
  };

  return (
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
            {plan.name === '프로페셔널' && (
              hasSubscription === false ? (
                <button
                  className="w-full py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors mt-auto"
                  onClick={handleTrial}
                  disabled={loading}
                >
                  7일 무료체험 등록
                </button>
              ) : hasSubscription === true ? (
                <button
                  className="w-full py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors mt-auto"
                  onClick={handleSubscribe}
                >
                  구독하기
                </button>
              ) : (
                <button
                  className="w-full py-2 rounded-lg bg-blue-400 text-white font-bold opacity-60 cursor-not-allowed mt-auto"
                  disabled
                >
                  로딩 중...
                </button>
              )
            )}
            {plan.name !== '프로페셔널' && (
              <Link href="/auth/signup" className="w-full">
                <button
                  className="w-full py-2 rounded-lg border-2 border-blue-600 text-blue-600 font-bold hover:bg-blue-600/10 dark:border-blue-500 dark:text-blue-500 dark:hover:bg-blue-500/10 transition-colors mt-auto"
                >
                  시작하기
                </button>
              </Link>
            )}
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
  );
} 