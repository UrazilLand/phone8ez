'use client';

import * as Clerk from '@clerk/elements/common';
import * as SignIn from '@clerk/elements/sign-in';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <SignIn.Root>
        <SignIn.Step name="start">
          <h1 className="mb-2 text-xl font-bold">로그인</h1>
          <p className="mb-4 text-sm text-muted-foreground">Phone8ez에 로그인하세요</p>

          <Clerk.Connection name="google">
            구글 계정으로 로그인
          </Clerk.Connection>

          <div className="my-4 text-center text-xs text-gray-400">또는</div>

          <Clerk.Field name="identifier">
            <Clerk.Label>이메일 또는 아이디</Clerk.Label>
            <Clerk.Input placeholder="이메일 또는 아이디를 입력하세요" />
            <Clerk.FieldError />
          </Clerk.Field>

          <Clerk.Field name="password">
            <Clerk.Label>비밀번호</Clerk.Label>
            <Clerk.Input type="password" placeholder="비밀번호를 입력하세요" />
            <Clerk.FieldError />
          </Clerk.Field>

          <SignIn.Action submit>
            로그인
          </SignIn.Action>
        </SignIn.Step>

        <SignIn.Step name="verifications">
          <SignIn.Strategy name="email_code">
            <h2>이메일 인증 코드 입력</h2>
            <Clerk.Field name="code">
              <Clerk.Label>인증 코드</Clerk.Label>
              <Clerk.Input />
              <Clerk.FieldError />
            </Clerk.Field>
            <SignIn.Action submit>확인</SignIn.Action>
          </SignIn.Strategy>
        </SignIn.Step>
      </SignIn.Root>
    </div>
  );
} 