import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

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
      const { data, error } = await supabase
        .from('subscriptions')
        .select('plan, ends_at')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const nowKST = dayjs().tz('Asia/Seoul');
      if (data && data.plan === 'pro' && data.ends_at && dayjs(data.ends_at).tz('Asia/Seoul').isBefore(nowKST)) {
        // 만료된 경우 plan을 free로 업데이트
        await supabase
          .from('subscriptions')
          .update({ plan: 'free' })
          .eq('user_id', user.id)
          .eq('plan', 'pro')
          .eq('ends_at', data.ends_at);
        // 업데이트 후 다시 조회
        const { data: updated } = await supabase
          .from('subscriptions')
          .select('plan, ends_at')
          .eq('user_id', user.id)
          .order('started_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        setSubscription(updated ?? null);
      } else {
        setSubscription(data ?? null);
      }
      setLoading(false);
    })();
    return () => { ignore = true; };
  }, [user?.id]);

  // 구독 상태 및 만료일 계산
  let planLabel = '무료 플랜';
  let endsLabel = '구독 만료일 없음';
  let isPro = false;
  if (subscription && subscription.plan === 'pro' && subscription.ends_at) {
    const nowKST = dayjs().tz('Asia/Seoul');
    const ends = dayjs(subscription.ends_at).tz('Asia/Seoul');
    if (ends.isAfter(nowKST)) {
      planLabel = '프로 플랜';
      endsLabel = `만료일: ${ends.format('YYYY-MM-DD HH:mm')}`;
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
      {isPro && !loading && (
        <Button asChild className="w-full mt-auto">
          <Link href="/intro#plans">
            구독 연장
          </Link>
        </Button>
      )}
      {hasSubscription && !isPro && !loading && (
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