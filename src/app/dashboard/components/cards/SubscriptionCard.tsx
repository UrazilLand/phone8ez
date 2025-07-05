import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';

export default function SubscriptionCard() {
  const { user } = useAuth();
  const [hasSubscription, setHasSubscription] = useState<boolean|null>(null);

  useEffect(() => {
    if (!user?.id) {
      setHasSubscription(null);
      return;
    }
    let ignore = false;
    (async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (!ignore) setHasSubscription(!!data?.id);
    })();
    return () => { ignore = true; };
  }, [user?.id]);

  return (
    <div className="bg-card border-border border rounded-lg p-4 flex flex-col gap-2 h-full w-full">
      <div className="text-sm text-muted-foreground flex items-center gap-2">
        구독 상태 <ShieldCheck className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="text-2xl font-bold text-blue-600 dark:text-blue-500">무료 플랜</div>
      <div className="text-xs text-muted-foreground">구독 만료일 없음</div>
      {hasSubscription === false && (
        <Button asChild className="w-full mt-auto">
          <Link href="/intro#plans">
            7일 무료체험 등록
          </Link>
        </Button>
      )}
      {hasSubscription === true && (
        <Button asChild className="w-full mt-auto">
          <Link href="/intro#plans">
            구독하기
          </Link>
        </Button>
      )}
    </div>
  );
} 