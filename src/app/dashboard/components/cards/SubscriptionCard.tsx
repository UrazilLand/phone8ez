import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';

export default function SubscriptionCard() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<{
    plan: string;
    ends_at: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      setSubscription(null);
      return;
    }
    let ignore = false;
    (async () => {
      console.log('[SubscriptionCard] user.id:', user.id);
      const { data, error } = await supabase
        .from('subscriptions')
        .select('plan, ends_at')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      console.log('[SubscriptionCard] subscriptions select result:', data, error);
      setLoading(false);
      if (!ignore) setSubscription(data ?? null);
    })();
    return () => { ignore = true; };
  }, [user?.id]);

  // 구독 상태 및 만료일 계산
  let planLabel = '무료 플랜';
  let endsLabel = '구독 만료일 없음';
  let isPro = false;
  if (subscription && subscription.plan === 'pro' && subscription.ends_at) {
    const now = dayjs();
    const ends = dayjs(subscription.ends_at);
    if (ends.isAfter(now)) {
      planLabel = '프로 플랜';
      endsLabel = `만료일: ${ends.format('YYYY-MM-DD 00:00')}`;
      isPro = true;
    }
  }

  const hasSubscription = !!subscription;

  return (
    <div className="bg-card border-border border rounded-lg p-4 flex flex-col gap-2 h-full w-full">
      <div className="text-sm text-muted-foreground flex items-center gap-2">
        구독 상태 <ShieldCheck className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="text-2xl font-bold text-blue-600 dark:text-blue-500">{planLabel}</div>
      <div className="text-xs text-muted-foreground">{endsLabel}</div>
      {!hasSubscription && !loading && (
        <Button asChild className="w-full mt-auto">
          <Link href="/intro#plans">
            7일 무료체험 등록
          </Link>
        </Button>
      )}
      {hasSubscription && !loading && (
        <Button asChild className="w-full mt-auto">
          <Link href="/intro#plans">
            구독하기
          </Link>
        </Button>
      )}
      {loading && (
        <Button className="w-full mt-auto" disabled>
          로딩 중...
        </Button>
      )}
    </div>
  );
} 