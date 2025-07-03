import React from 'react';

interface AuthGuardProps {
  isLoggedIn: boolean;
  onLoginClick?: () => void;
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ isLoggedIn, onLoginClick, children }) => {
  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-blue-950 rounded shadow-md">
        <div className="text-blue-700 dark:text-blue-200 font-semibold mb-4">로그인 후 이용 가능합니다.</div>
        <button
          className="px-4 py-2 rounded bg-blue-600 text-white font-semibold"
          onClick={onLoginClick}
        >
          로그인하기
        </button>
      </div>
    );
  }
  return <>{children}</>;
};

export default AuthGuard; 