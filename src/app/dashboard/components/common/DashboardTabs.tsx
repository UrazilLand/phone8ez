import { TabType, Tab } from '@/types/dashboard';
import { DASHBOARD_TABS } from '../../utils/dashboardUtils';

interface DashboardTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export default function DashboardTabs({ activeTab, onTabChange }: DashboardTabsProps) {
  return (
    <div className="max-w-[61rem] mx-auto px-4">
      <div className="flex space-x-2 border-b border-gray-200">
        {DASHBOARD_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors whitespace-pre-wrap min-w-[80px] text-center ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
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