import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  const { imp_uid, merchant_uid, user_id } = await req.json();

  // 1. 아임포트 REST API로 결제 검증
  const getTokenRes = await fetch('https://api.iamport.kr/users/getToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imp_key: process.env.IAMPORT_API_KEY,
      imp_secret: process.env.IAMPORT_API_SECRET,
    }),
  });
  const tokenJson = await getTokenRes.json();
  const access_token = tokenJson.response?.access_token;
  if (!access_token) {
    return NextResponse.json({ success: false, error: '아임포트 토큰 발급 실패' });
  }

  const paymentRes = await fetch(`https://api.iamport.kr/payments/${imp_uid}`, {
    headers: { Authorization: access_token },
  });
  const paymentJson = await paymentRes.json();
  const payment = paymentJson.response;

  // 2. 결제 검증(금액, 상태 등)
  if (payment.status !== 'paid' || payment.amount !== 19900) {
    return NextResponse.json({ success: false, error: '결제 검증 실패' });
  }

  // 3. Supabase DB 업데이트
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

  // 기존 구독 정보 조회
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('id, ends_at')
    .eq('user_id', user_id)
    .maybeSingle();

  const now = new Date();
  let newEndsAt: Date;
  if (sub && sub.ends_at && new Date(sub.ends_at) > now) {
    // 남은 기간이 있으면 1개월 연장
    newEndsAt = new Date(sub.ends_at);
    newEndsAt.setMonth(newEndsAt.getMonth() + 1);
  } else {
    // 없으면 오늘부터 1개월
    newEndsAt = new Date();
    newEndsAt.setMonth(newEndsAt.getMonth() + 1);
  }

  // upsert(있으면 갱신, 없으면 추가)
  const { error } = await supabase.from('subscriptions').upsert({
    user_id,
    plan: 'pro',
    status: 'active',
    started_at: now.toISOString(),
    ends_at: newEndsAt.toISOString(),
    // 기타 필요한 정보 추가 가능
  }, { onConflict: 'user_id' });

  if (error) {
    return NextResponse.json({ success: false, error: error.message });
  }

  return NextResponse.json({ success: true });
} 