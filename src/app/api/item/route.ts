import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    id: 'pro',
    name: '프로페셔널 구독',
    price: 19900,
    currency: 'KRW',
  });
} 