import { TabType, Tab } from '@/types/dashboard';
import { DASHBOARD_TABS } from '../../utils/dashboardUtils';

interface DashboardTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isPro?: boolean;
}

export default function DashboardTabs({ activeTab, onTabChange, isPro }: DashboardTabsProps) {
  return (
    <div className="max-w-[61rem] mx-auto px-4">
      <div className="flex space-x-2 border-b border-border">
        {DASHBOARD_TABS.filter(tab => isPro !== false || tab.id !== 'model').map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors whitespace-pre-wrap min-w-[80px] text-center ${
              activeTab === tab.id
                ? 'bg-background text-blue-600 dark:text-blue-500 border-b-2 border-blue-600 dark:border-blue-500'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
            aria-label={`${tab.label} 탭으로 전환`}
          >
            {tab.label.split(' ').map((word, index, array) => (
              <span key={index} className="inline-block">
                {word}
                {index < array.length - 1 && (
                  <>
                    <span className="hidden max-md:inline">&nbsp;</span>
                    <span className="md:inline max-md:hidden">&nbsp;</span>
                  </>
                )}
              </span>
            ))}
          </button>
        ))}
      </div>
    </div>
  );
} 