import React from 'react';

interface DarkModeToggleProps {
  dark: boolean;
  onToggle: () => void;
}

const DarkModeToggle: React.FC<DarkModeToggleProps> = ({ dark, onToggle }) => {
  return (
    <button
      className={`px-3 py-1 rounded font-semibold border border-blue-200 dark:border-blue-700 transition-colors
        ${dark ? 'bg-blue-900 text-blue-100' : 'bg-blue-100 text-blue-700'}
      `}
      onClick={onToggle}
      aria-label="다크모드 토글"
    >
      {dark ? '🌙 다크' : '☀️ 라이트'}
    </button>
  );
};

export default DarkModeToggle; 