import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { cardStyles, flexColGap2, BUTTON_THEME } from '@/styles/common';

export default function SubscriptionCard() {
  return (
    <div className={`${cardStyles} ${flexColGap2} h-full w-full py-4 px-4`}>
      <div className="text-sm text-gray-500 flex items-center gap-2">
        구독 상태 <ShieldCheck className="w-4 h-4 text-gray-400" />
      </div>
      <div className="text-2xl font-bold text-blue-700">무료 플랜</div>
      <div className="text-xs text-gray-400">구독 만료일 없음</div>
      <Link
        href="/#pricing"
        className={`${BUTTON_THEME.primary} w-full mt-auto text-center flex items-center justify-center h-8`}
        aria-label="구독 플랜 변경"
      >
        구독하기
      </Link>
    </div>
  );
} 