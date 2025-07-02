import { User as SupabaseUser } from '@supabase/supabase-js';

export type UserRole = 'user' | 'admin' | 'moderator';
export type UserPlan = 'free' | 'pro';

export interface User {
  id: string; // UUID
  email: string;
  nickname: string;
  avatar_url?: string | null;
  provider: string;
  role: UserRole;
  plan: UserPlan;
  is_verified: boolean;
  post_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: number;
  email: string;
  nickname: string;
  role: UserRole;
  plan: UserPlan;
  is_verified: boolean;
  post_count: number;
  comment_count: number;
  created_at: string;
}

export interface Permission {
  resource: 'posts' | 'comments' | 'users' | 'reports';
  action: 'create' | 'read' | 'update' | 'delete' | 'moderate';
  conditions?: {
    ownOnly?: boolean;
    roleRequired?: UserRole[];
  };
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  user: [
    { resource: 'posts', action: 'create' },
    { resource: 'posts', action: 'read' },
    { resource: 'posts', action: 'update', conditions: { ownOnly: true } },
    { resource: 'posts', action: 'delete', conditions: { ownOnly: true } },
    { resource: 'comments', action: 'create' },
    { resource: 'comments', action: 'read' },
    { resource: 'comments', action: 'update', conditions: { ownOnly: true } },
    { resource: 'comments', action: 'delete', conditions: { ownOnly: true } },
    { resource: 'reports', action: 'create' },
  ],
  moderator: [
    { resource: 'posts', action: 'create' },
    { resource: 'posts', action: 'read' },
    { resource: 'posts', action: 'update' },
    { resource: 'posts', action: 'delete' },
    { resource: 'posts', action: 'moderate' },
    { resource: 'comments', action: 'create' },
    { resource: 'comments', action: 'read' },
    { resource: 'comments', action: 'update' },
    { resource: 'comments', action: 'delete' },
    { resource: 'comments', action: 'moderate' },
    { resource: 'reports', action: 'create' },
    { resource: 'reports', action: 'read' },
    { resource: 'reports', action: 'moderate' },
  ],
  admin: [
    { resource: 'posts', action: 'create' },
    { resource: 'posts', action: 'read' },
    { resource: 'posts', action: 'update' },
    { resource: 'posts', action: 'delete' },
    { resource: 'posts', action: 'moderate' },
    { resource: 'comments', action: 'create' },
    { resource: 'comments', action: 'read' },
    { resource: 'comments', action: 'update' },
    { resource: 'comments', action: 'delete' },
    { resource: 'comments', action: 'moderate' },
    { resource: 'users', action: 'read' },
    { resource: 'users', action: 'update' },
    { resource: 'users', action: 'delete' },
    { resource: 'reports', action: 'create' },
    { resource: 'reports', action: 'read' },
    { resource: 'reports', action: 'moderate' },
  ],
};

export interface AuthUser extends SupabaseUser {
  // 추가 사용자 정보
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  name: string;
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signUp: (credentials: SignUpCredentials) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithKakao: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
} 