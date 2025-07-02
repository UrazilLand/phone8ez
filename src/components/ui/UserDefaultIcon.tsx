import React from 'react';

export default function UserDefaultIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
    >
      <circle cx="12" cy="12" r="12" fill="#E5E7EB" />
      <circle cx="12" cy="9" r="4" fill="#A3A3A3" />
      <ellipse cx="12" cy="17" rx="6" ry="4" fill="#A3A3A3" />
    </svg>
  );
} 