'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { koKR } from '@clerk/localizations';

const patchedKoKR = {
  ...koKR,
  socialButtonsBlockButton: '소셜 계정으로 계속하기',
  socialButtonsBlockButtonManyInView: '소셜 계정으로 계속하기',
  signIn: {
    ...koKR.signIn,
    alternativeMethods: {
      ...koKR.signIn?.alternativeMethods,
      blockButton__emailLink: '이메일로 계속하기',
      blockButton__emailCode: '이메일 코드로 계속하기',
      blockButton__phoneCode: '휴대폰 코드로 계속하기',
      blockButton__password: '비밀번호로 계속하기',
      blockButton__passkey: '패스키로 계속하기',
      blockButton__totp: 'OTP로 계속하기',
      blockButton__backupCode: '백업 코드로 계속하기',
    },
  },
};

export default function ClerkAppearanceProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      localization={patchedKoKR as any}
      appearance={{
        elements: {
          card: 'rounded-xl shadow-lg bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700',
          headerTitle: 'text-lg font-bold text-gray-900 dark:text-white',
          headerSubtitle: 'text-sm text-gray-600 dark:text-gray-300',
          formFieldLabel: 'text-sm text-gray-700 dark:text-gray-200',
          formFieldInput: 'bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500',
          formButtonPrimary: 'bg-blue-500 text-white hover:bg-blue-600 font-semibold',
          socialButtonsBlockButton: 'bg-gray-100 dark:bg-neutral-600 border border-gray-300 dark:border-neutral-400 text-gray-900 dark:text-gray-200 hover:bg-white dark:hover:bg-neutral-100',
          footerActionText: 'text-sm text-gray-600 dark:text-gray-300',
          footerActionLink: 'text-blue-500 hover:text-blue-600 font-semibold',
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
} 