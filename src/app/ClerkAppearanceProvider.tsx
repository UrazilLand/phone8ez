'use client';

import { ClerkProvider } from '@clerk/nextjs';

const customKoKR = {
  locale: 'ko-KR',
  socialButtonsBlockButton: '구글 계정으로 로그인',
  dividerText: '또는',
  formFieldLabel__emailAddress: '이메일',
  formFieldLabel__password: '비밀번호',
  formFieldLabel__newPassword: '새 비밀번호',
  formFieldLabel__confirmPassword: '비밀번호 확인',
  formFieldLabel__username: '아이디',
  formFieldLabel__identifier: '이메일 또는 아이디',
  formFieldLabel__firstName: '이름',
  formFieldLabel__lastName: '성',
  formFieldLabel__phoneNumber: '휴대폰 번호',
  formFieldLabel__verificationCode: '인증 코드',
  formFieldInputPlaceholder__emailAddress: '이메일을 입력하세요',
  formFieldInputPlaceholder__password: '비밀번호를 입력하세요',
  formFieldInputPlaceholder__newPassword: '새 비밀번호를 입력하세요',
  formFieldInputPlaceholder__confirmPassword: '비밀번호를 다시 입력하세요',
  formFieldInputPlaceholder__username: '아이디를 입력하세요',
  formFieldInputPlaceholder__identifier: '이메일 또는 아이디를 입력하세요',
  formFieldInputPlaceholder__firstName: '이름을 입력하세요',
  formFieldInputPlaceholder__lastName: '성을 입력하세요',
  formFieldInputPlaceholder__phoneNumber: '휴대폰 번호를 입력하세요',
  formFieldInputPlaceholder__verificationCode: '인증 코드를 입력하세요',
  formButtonPrimary: '계속',
  formButtonReset: '초기화',
  formButtonResend: '코드 재전송',
  signIn: {
    start: {
      title: '로그인',
      subtitle: 'Phone8ez에 로그인하세요',
      actionText: '로그인',
      actionLink: '아직 계정이 없으신가요? 회원가입',
    },
    password: {
      title: '비밀번호로 로그인',
      subtitle: '비밀번호를 입력하세요',
      actionText: '로그인',
      actionLink: '다른 방법으로 로그인',
    },
    alternativeMethods: {
      title: '다른 방법으로 로그인',
      actionLink: '돌아가기',
    },
    emailCode: {
      title: '이메일 인증 코드로 로그인',
      subtitle: '이메일로 전송된 인증 코드를 입력하세요',
      formTitle: '인증 코드 입력',
      formSubtitle: '이메일로 전송된 6자리 코드를 입력하세요',
      resendButton: '코드 재전송',
    },
    phoneCode: {
      title: '휴대폰 인증 코드로 로그인',
      subtitle: '휴대폰으로 전송된 인증 코드를 입력하세요',
      formTitle: '인증 코드 입력',
      formSubtitle: '휴대폰으로 전송된 6자리 코드를 입력하세요',
      resendButton: '코드 재전송',
    },
    resetPassword: {
      title: '비밀번호 재설정',
      subtitle: '이메일로 비밀번호 재설정 링크를 받으세요',
      formTitle: '비밀번호 재설정 요청',
      formSubtitle: '이메일을 입력하면 재설정 링크가 전송됩니다',
      actionText: '비밀번호 재설정 링크 보내기',
      backLink: '로그인으로 돌아가기',
    },
    success: {
      title: '로그인 성공',
      subtitle: '환영합니다!',
      actionText: '대시보드로 이동',
    },
  },
  signUp: {
    start: {
      title: '회원가입',
      subtitle: 'Phone8ez에 오신 것을 환영합니다!',
      actionText: '회원가입',
      actionLink: '이미 계정이 있으신가요? 로그인',
    },
    emailCode: {
      title: '이메일 인증 코드로 회원가입',
      subtitle: '이메일로 전송된 인증 코드를 입력하세요',
      formTitle: '인증 코드 입력',
      formSubtitle: '이메일로 전송된 6자리 코드를 입력하세요',
      resendButton: '코드 재전송',
    },
    phoneCode: {
      title: '휴대폰 인증 코드로 회원가입',
      subtitle: '휴대폰으로 전송된 인증 코드를 입력하세요',
      formTitle: '인증 코드 입력',
      formSubtitle: '휴대폰으로 전송된 6자리 코드를 입력하세요',
      resendButton: '코드 재전송',
    },
    continue: {
      title: '회원가입 계속',
      subtitle: '필수 정보를 입력하세요',
      actionText: '계속',
    },
    success: {
      title: '회원가입 완료',
      subtitle: '환영합니다!',
      actionText: '대시보드로 이동',
    },
  },
  errors: {
    formFieldRequired: '필수 입력 항목입니다.',
    formFieldInvalidEmail: '유효한 이메일 주소를 입력하세요.',
    formFieldInvalidPhone: '유효한 휴대폰 번호를 입력하세요.',
    formFieldPasswordTooShort: '비밀번호는 최소 8자 이상이어야 합니다.',
    formFieldPasswordMismatch: '비밀번호가 일치하지 않습니다.',
    formFieldInvalidVerificationCode: '유효한 인증 코드를 입력하세요.',
    formFieldInvalidUsername: '유효한 아이디를 입력하세요.',
    formFieldInvalidFirstName: '이름을 입력하세요.',
    formFieldInvalidLastName: '성을 입력하세요.',
    formFieldInvalid: '입력값이 올바르지 않습니다.',
    formFieldUnknownError: '알 수 없는 오류가 발생했습니다.',
    signInFailed: '로그인에 실패했습니다. 다시 시도하세요.',
    signUpFailed: '회원가입에 실패했습니다. 다시 시도하세요.',
    resetPasswordFailed: '비밀번호 재설정에 실패했습니다. 다시 시도하세요.',
    tooManyAttempts: '시도 횟수가 너무 많습니다. 잠시 후 다시 시도하세요.',
    expiredCode: '인증 코드가 만료되었습니다. 다시 요청하세요.',
    invalidCode: '인증 코드가 올바르지 않습니다.',
    userNotFound: '사용자를 찾을 수 없습니다.',
    emailAlreadyInUse: '이미 사용 중인 이메일입니다.',
    usernameAlreadyInUse: '이미 사용 중인 아이디입니다.',
    phoneNumberAlreadyInUse: '이미 사용 중인 휴대폰 번호입니다.',
    unknown: '알 수 없는 오류가 발생했습니다.',
  },
};

export default function ClerkAppearanceProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider localization={customKoKR}>
      {children}
    </ClerkProvider>
  );
} 