'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { AuthContextType, AuthState, LoginCredentials, SignUpCredentials, AuthUser } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // 초기 세션 확인
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setState(prev => ({
        ...prev,
        user: session?.user || null,
        loading: false,
      }));
    };

    getSession();

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setState(prev => ({
          ...prev,
          user: session?.user || null,
          loading: false,
          error: null,
        }));
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (credentials: LoginCredentials) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // 임시: Supabase 연결 비활성화
      console.log('로그인 시도:', credentials);
      
      // 더미 성공 응답
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          loading: false,
          error: null,
        }));
      }, 1000);
      
      // 실제 Supabase 연결은 주석 처리
      /*
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error('Supabase 설정이 완료되지 않았습니다. 환경 변수를 확인해주세요.');
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;
      */
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || '로그인에 실패했습니다.',
        loading: false,
      }));
      throw error;
    }
  };

  const signUp = async (credentials: SignUpCredentials) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // 임시: Supabase 연결 비활성화
      console.log('회원가입 시도:', credentials);
      
      // 더미 성공 응답
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          loading: false,
          error: null,
        }));
      }, 1000);
      
      // 실제 Supabase 연결은 주석 처리
      /*
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error('Supabase 설정이 완료되지 않았습니다. 환경 변수를 확인해주세요.');
      }

      const { error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            name: credentials.name,
          },
        },
      });

      if (error) throw error;
      */
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || '회원가입에 실패했습니다.',
        loading: false,
      }));
      throw error;
    }
  };

  const signOut = async () => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || '로그아웃에 실패했습니다.',
        loading: false,
      }));
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || '비밀번호 재설정 이메일 전송에 실패했습니다.',
        loading: false,
      }));
      throw error;
    }
  };

  const value: AuthContextType = {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 