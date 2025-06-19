import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { cardStyles, flexColGap2, buttonStyles } from '@/styles/common';

export default function SubscriptionCard() {
  return (
    <div className={`${cardStyles} ${flexColGap2} h-fit w-full md:w-[24rem] max-w-full md:max-w-[70vw] py-4 px-4`}>
      <div className="text-sm text-gray-500 flex items-center gap-2">
        구독 상태 <ShieldCheck className="w-4 h-4 text-gray-400" />
      </div>
      <div className="text-2xl font-bold text-blue-700">무료 플랜</div>
      <div className="text-xs text-gray-400">구독 만료일 없음</div>
      <Link
        href="/#pricing"
        className={`${buttonStyles.primary} w-full mt-2 text-center flex items-center justify-center`}
        aria-label="구독 플랜 변경"
      >
        구독하기
      </Link>
    </div>
  );
} 