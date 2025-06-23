import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function SubscriptionCard() {
  return (
    <div className="bg-card border-border border rounded-lg p-4 flex flex-col gap-2 h-full w-full">
      <div className="text-sm text-muted-foreground flex items-center gap-2">
        구독 상태 <ShieldCheck className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="text-2xl font-bold text-blue-600 dark:text-blue-500">무료 플랜</div>
      <div className="text-xs text-muted-foreground">구독 만료일 없음</div>
      <Button asChild className="w-full mt-auto">
        <Link href="/#pricing">
          구독하기
        </Link>
      </Button>
    </div>
  );
} 