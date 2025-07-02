import { db } from '@/lib/db';

const samplePosts = [
  {
    title: '안녕하세요! 커뮤니티에 오신 것을 환영합니다',
    content: `안녕하세요! Phone8ez 커뮤니티에 오신 것을 환영합니다.

이곳에서는 다양한 주제로 자유롭게 이야기를 나눌 수 있습니다.

- 모바일 관련 정보 공유
- 사용 후기 및 리뷰
- 질문과 답변
- 기타 자유로운 대화

많은 참여 부탁드립니다! 😊`,
    board_type: 'general',
    user_id: 1,
    is_notice: true
  },
  {
    title: 'Phone8ez 사용법에 대해 궁금한 점이 있습니다',
    content: `안녕하세요! Phone8ez를 처음 사용해보는데 몇 가지 궁금한 점이 있어서 질문드립니다.

1. 데이터 업로드 시 어떤 형식의 파일을 지원하나요?
2. 분석 결과는 어디서 확인할 수 있나요?
3. 무료 버전과 유료 버전의 차이점은 무엇인가요?

사용해보신 분들의 경험담도 들려주시면 감사하겠습니다!`,
    board_type: 'qna',
    user_id: 1
  },
  {
    title: 'Phone8ez 사용 후기 - 정말 유용한 서비스입니다!',
    content: `Phone8ez를 한 달 정도 사용해보니 정말 만족스럽습니다.

**장점:**
- 직관적인 인터페이스
- 빠른 분석 속도
- 정확한 결과 제공
- 다양한 데이터 형식 지원

**개선점:**
- 더 많은 템플릿이 있으면 좋겠어요
- 모바일 앱이 나오면 더 편할 것 같아요

전반적으로 매우 만족스러운 서비스입니다. 추천합니다! 👍`,
    board_type: 'review',
    user_id: 1
  },
  {
    title: '모바일 데이터 분석 팁 공유',
    content: `모바일 데이터 분석을 할 때 유용한 팁들을 공유해드립니다.

**1. 데이터 전처리**
- 결측값 처리
- 이상치 제거
- 데이터 정규화

**2. 시각화**
- 적절한 차트 선택
- 색상 활용
- 레이아웃 구성

**3. 인사이트 도출**
- 패턴 분석
- 트렌드 파악
- 예측 모델링

이런 과정을 Phone8ez로 쉽게 할 수 있어서 정말 좋습니다!`,
    board_type: 'general',
    user_id: 1
  },
  {
    title: '데이터 업로드 시 오류가 발생합니다',
    content: `CSV 파일을 업로드하려고 하는데 계속 오류가 발생합니다.

오류 메시지: "Invalid file format"

파일 형식:
- 파일명: data.csv
- 크기: 2.3MB
- 인코딩: UTF-8

혹시 비슷한 경험이 있으신 분 계신가요? 해결 방법을 알려주시면 감사하겠습니다.`,
    board_type: 'qna',
    user_id: 1
  }
];

async function seedPosts() {
  try {
    console.log('샘플 게시글 생성 시작...');
    
    for (const post of samplePosts) {
      const result = await db.execute({
        sql: `
          INSERT INTO posts (title, content, board_type, user_id, is_notice, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `,
        args: [
          post.title,
          post.content,
          post.board_type,
          post.user_id.toString(),
          post.is_notice ? '1' : '0'
        ]
      });
      
      console.log(`게시글 생성 완료: ${post.title}`);
    }
    
    console.log('모든 샘플 게시글 생성 완료!');
  } catch (error) {
    console.error('샘플 게시글 생성 중 오류:', error);
  }
}

// 스크립트 실행
seedPosts(); 