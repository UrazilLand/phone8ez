import { supabase } from './supabaseClient';

// Supabase를 사용하는 db 인터페이스
export const db = {
  execute: async ({ sql, args }: { sql: string; args: any[] }) => {
    // SQL 쿼리를 Supabase RPC로 변환하거나 직접 쿼리 실행
    // 간단한 예시 - 실제로는 더 복잡한 변환 로직이 필요
    const { data, error } = await supabase.rpc('execute_sql', { 
      query: sql, 
      params: args 
    });
    
    if (error) throw error;
    
    return {
      rows: data || []
    };
  }
}; 