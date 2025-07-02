import 'dotenv/config';
import { db } from '@/lib/db';

async function migrateAuthSystem() {
  try {
    console.log('🔧 인증/권한 시스템 마이그레이션 시작...');

    // 1. users 테이블에 moderator 역할 추가
    console.log('📝 users 테이블 업데이트 중...');
    await db.execute({
      sql: `
        ALTER TABLE users 
        ADD COLUMN role TEXT CHECK(role IN ('user', 'moderator', 'admin')) DEFAULT 'user'
      `
    });
    console.log('✅ users 테이블 업데이트 완료');

    // 2. reports 테이블에 status, moderator_note, updated_at 필드 추가
    console.log('📝 reports 테이블 업데이트 중...');
    await db.execute({
      sql: `
        ALTER TABLE reports 
        ADD COLUMN status TEXT CHECK(status IN ('pending', 'resolved', 'rejected')) DEFAULT 'pending'
      `
    });
    
    await db.execute({
      sql: `
        ALTER TABLE reports 
        ADD COLUMN moderator_note TEXT
      `
    });
    
    await db.execute({
      sql: `
        ALTER TABLE reports 
        ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      `
    });
    console.log('✅ reports 테이블 업데이트 완료');

    // 3. 기본 관리자 사용자 생성 (이메일이 admin@example.com인 경우)
    console.log('👤 기본 관리자 설정 중...');
    await db.execute({
      sql: `
        UPDATE users 
        SET role = 'admin' 
        WHERE email = 'admin@example.com'
      `
    });
    console.log('✅ 기본 관리자 설정 완료');

    // 4. 인덱스 생성
    console.log('🔍 인덱스 생성 중...');
    await db.execute({
      sql: 'CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)'
    });
    
    await db.execute({
      sql: 'CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status)'
    });
    
    await db.execute({
      sql: 'CREATE INDEX IF NOT EXISTS idx_reports_updated_at ON reports(updated_at)'
    });
    console.log('✅ 인덱스 생성 완료');

    console.log('🎉 인증/권한 시스템 마이그레이션 완료!');
    console.log('');
    console.log('📋 다음 단계:');
    console.log('1. 관리자 계정으로 로그인');
    console.log('2. /admin 페이지에서 사용자 관리');
    console.log('3. 신고 시스템 테스트');
    
  } catch (error) {
    console.error('❌ 마이그레이션 오류:', error);
    
    // SQLite에서 ALTER TABLE 제한으로 인한 오류 처리
    if (error instanceof Error && error.message.includes('duplicate column')) {
      console.log('ℹ️ 일부 컬럼이 이미 존재합니다. 계속 진행합니다...');
    } else {
      throw error;
    }
  }
}

// 스크립트 실행
if (require.main === module) {
  migrateAuthSystem()
    .then(() => {
      console.log('✅ 마이그레이션 성공');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 마이그레이션 실패:', error);
      process.exit(1);
    });
}

export { migrateAuthSystem }; 