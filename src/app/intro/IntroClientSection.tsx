"use client";
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Users, BarChartBig, MessageSquareHeart, ShieldCheck } from 'lucide-react';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import PortOne from "@portone/browser-sdk/v2";
import { useRouter } from 'next/navigation';
dayjs.extend(utc);
dayjs.extend(timezone);

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
      '모든 기본 기능',
      '무제한 데이터셋',
      '로컬 및 Cloud 저장',
      '모델별 데이터 상세보기',
      '다크 모드 지원',
      '우선 고객 지원',
    ],
    button: '7일 무료체험 등록',
    buttonType: 'primary',
  },
];

// [아임포트 결제 연동] - 결제 라이브러리 동적 로드 함수
declare global {
  interface Window {
    IMP?: any;
  }
}
const loadIamportScript = () => {
  if (!window.IMP) {
    const script = document.createElement('script');
    script.src = 'https://cdn.iamport.kr/v1/iamport.js';
    document.head.appendChild(script);
  }
};

export default function IntroClientSection() {
  const { user } = useAuth();
  const [hasSubscription, setHasSubscription] = useState<boolean|null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [item, setItem] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<{ status: string; message?: string }>({ status: 'IDLE' });
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  useEffect(() => {
    async function loadItem() {
      const response = await fetch("/api/item");
      setItem(await response.json());
    }
    loadItem().catch(console.error);
  }, []);

  function randomId() {
    return [...crypto.getRandomValues(new Uint32Array(2))]
      .map((word) => word.toString(16).padStart(8, "0"))
      .join("");
  }

  function isValidPhoneNumber(phone: string) {
    return /^01[016789][0-9]{7,8}$/.test(phone);
  }

  const handlePayment = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (!item) {
      toast({ title: '상품 정보를 불러오지 못했습니다.' });
      return;
    }
    if (!isValidPhoneNumber(phoneNumber)) {
      toast({ title: '올바른 휴대폰 번호를 입력해 주세요.' });
      return;
    }
    setPaymentStatus({ status: 'PENDING' });
    const paymentId = randomId();
    const payment = await PortOne.requestPayment({
      storeId: "store-b26b3486-4703-42cb-ae30-565c0eca1d6f",
      channelKey: "channel-key-f09f5e87-d694-4bff-ba1e-d411390254ef",
      paymentId,
      orderName: item.name,
      totalAmount: item.price,
      currency: item.currency,
      payMethod: "CARD",
      customer: {
        fullName: (user && 'nickname' in user && (user as any).nickname) ? (user as any).nickname : "포트원",
        email: user?.email || "example@portone.io",
        phoneNumber,
      },
      customData: {
        item: item.id,
      },
    });
    if (!payment || payment.code !== undefined) {
      setPaymentStatus({
        status: "FAILED",
        message: payment?.message,
      });
      return;
    }
    const completeResponse = await fetch("/api/payment/complete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paymentId: payment.paymentId,
        phoneNumber,
      }),
    });
    if (completeResponse.ok) {
      const paymentComplete = await completeResponse.json();
      setPaymentStatus({
        status: paymentComplete.status,
      });
      setHasSubscription(true);
      toast({ title: '구독 결제가 정상적으로 완료되었습니다.' });
    } else {
      setPaymentStatus({
        status: "FAILED",
        message: await completeResponse.text(),
      });
    }
  };

  const isWaitingPayment = paymentStatus.status !== "IDLE";
  const handleClose = () => setPaymentStatus({ status: "IDLE" });

  const closeModal = () => {
    setIsModalOpen(false);
    setPhoneNumber("");
  };

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
          <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-full md:w-1/2 flex justify-center md:justify-end mb-6 md:mb-0">
                  <Image src="/why_phone8ez.png" alt="Phone8ez 소개 이미지" width={600} height={400} className="rounded-lg shadow-lg ring-2 ring-border max-w-xs md:max-w-lg w-full h-auto" data-ai-hint="team collaboration" />
              </div>
              <div className="w-full md:w-1/2 space-y-4 text-base md:text-lg leading-relaxed px-2 md:px-0 text-gray-800 dark:text-gray-100">
                  <p className="font-pretendard">
                    우리는 복잡한 정책표 작업을 단순화하는 것을 넘어서,<br/>
                    현장에서 일하는 사람들의 시간을 아껴주는 것을 가장 큰 가치로 삼습니다.<br/><br/>
                    데이터를 빠르게 정리하고, 누구나 이해할 수 있도록 보여주는 것.<br/>
                    그 과정에서 사용자의 경험이 불편하지 않도록 꾸준히 개선해 나가는 것.<br/>
                    Phone8ez는 기능보다 실용성, 기술보다 사람을 먼저 생각하며,<br/>
                    사용자와 함께 성장하는 플랫폼이 되고자 합니다.<br/><br/>
                    기능보다 실용성을, 기술보다 사용자 경험을 우선시하며,<br/>
                    사용자의 피드백을 서비스 개선의 중심에 둡니다.<br/>
                    언제나 현장의 목소리를 먼저 듣고, 거기서부터 시작합니다.
                  </p>
              </div>
          </div>
      </section>

      {/* 구독 플랜(가격 정책) 카드 */}
      <section className="py-20 bg-transparent">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-blue-600 dark:text-blue-500">구독 플랜 및 가격 정책</h2>
        <div id="plans" className="flex flex-col md:flex-row justify-center items-center md:items-stretch gap-8 max-w-4xl mx-auto">
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
                <button
                  className="w-full py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors mt-auto"
                  onClick={() => setIsModalOpen(true)}
                >
                  구독하기
                </button>
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
      {/* 결제 결과 다이얼로그 UI 추가 */}
      {paymentStatus.status === "FAILED" && (
        <dialog open>
          <header>
            <h1>결제 실패</h1>
          </header>
          <p>{paymentStatus.message}</p>
          <button type="button" onClick={handleClose}>
            닫기
          </button>
        </dialog>
      )}
      <dialog open={paymentStatus.status === "PAID"}>
        <header>
          <h1>결제 성공</h1>
        </header>
        <p>결제에 성공했습니다.</p>
        <button type="button" onClick={handleClose}>
          닫기
        </button>
      </dialog>
      {/* 결제 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-sm shadow-lg">
            <h2 className="text-xl font-bold mb-4">구독 결제</h2>
            <label className="block mb-2 font-medium">휴대폰 번호</label>
            <input
              type="tel"
              className="w-full mb-4 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="연락처를 입력하세요 (예: 01012345678)"
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
              maxLength={11}
              required
            />
            <button
              className="w-full py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors mb-2"
              onClick={async (e) => { await handlePayment(e); closeModal(); }}
              disabled={!isValidPhoneNumber(phoneNumber) || isWaitingPayment}
            >
              KG이니시스로 결제
            </button>
            <button
              className="w-full py-2 rounded-lg border mt-2"
              onClick={closeModal}
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 