import React, { useState } from 'react';

interface ReportButtonProps {
  onReport: (reason: string) => void;
  label?: string;
}

const ReportButton: React.FC<ReportButtonProps> = ({ onReport, label = '신고' }) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    if (reason.trim()) {
      onReport(reason.trim());
      setReason('');
      setOpen(false);
    }
  };

  return (
    <>
      <button
        className="px-2 py-1 rounded bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-200 text-xs"
        onClick={() => setOpen(true)}
      >
        {label}
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white dark:bg-blue-950 rounded shadow-lg p-6 w-full max-w-xs flex flex-col gap-3">
            <h4 className="font-bold text-blue-700 dark:text-blue-200 mb-2">신고 사유</h4>
            <textarea
              className="w-full h-24 p-2 rounded border border-blue-200 dark:border-blue-700 bg-white dark:bg-blue-950 text-gray-900 dark:text-gray-100"
              value={reason}
              onChange={e => setReason(e.target.value)}
              maxLength={200}
              placeholder="신고 사유를 입력하세요"
            />
            <div className="flex gap-2 justify-end">
              <button className="px-3 py-1 rounded bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200" onClick={() => setOpen(false)}>취소</button>
              <button className="px-3 py-1 rounded bg-red-600 text-white font-semibold disabled:opacity-50" onClick={handleSubmit} disabled={!reason.trim()}>등록</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReportButton; 