import type React from 'react';

interface UserBadgeProps {
  plan?: 'free' | 'pro';
  role?: 'user' | 'admin';
  nickname: string;
}

const UserBadge: React.FC<UserBadgeProps> = ({ plan, role, nickname }) => {
  if (role === 'admin') {
    return <span className="text-sm font-bold text-blue-700">{nickname}</span>;
  }
  return <span className="text-sm font-medium">{nickname}</span>;
};

export default UserBadge;
