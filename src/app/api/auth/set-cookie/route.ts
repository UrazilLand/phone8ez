import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { access_token, refresh_token } = await req.json();
  const response = NextResponse.json({ ok: true });
  response.cookies.set('sb-access-token', access_token, {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
  });
  response.cookies.set('sb-refresh-token', refresh_token, {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
} 