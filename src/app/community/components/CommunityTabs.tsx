import React from 'react';

const TABS = [
  { key: 'free', label: '자유게시판' },
  { key: 'humor', label: '유머게시판' },
  { key: 'mobile', label: '모바일정보' },
  { key: 'review', label: '후기 및 건의' },
];

interface CommunityTabsProps {
  current: string;
  onChange: (tab: string) => void;
}

const CommunityTabs: React.FC<CommunityTabsProps> = ({ current, onChange }) => {
  return (
    <div className="w-full flex justify-center sm:justify-start gap-2 sm:gap-4 mb-4 sm:mb-6 sticky top-0 z-10 bg-white dark:bg-[#020817] border-b border-blue-100 dark:border-blue-800">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          className={`px-3 py-2 sm:px-6 sm:py-3 rounded-t font-semibold transition-colors
            ${current === tab.key
              ? 'bg-blue-600 text-white dark:bg-blue-400 dark:text-blue-900 shadow'
              : 'text-blue-700 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-800'}
          `}
          onClick={() => onChange(tab.key)}
          aria-current={current === tab.key ? 'page' : undefined}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default CommunityTabs; 