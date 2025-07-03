import { supabase } from '../lib/supabaseClient';

const samplePosts = [
  {
    title: '안녕하세요! 처음 방문했습니다',
    content: '안녕하세요! 이 커뮤니티에 처음 방문하게 되었습니다. 앞으로 좋은 정보 많이 나누고 싶습니다. 잘 부탁드려요!',
    board_type: 'free',
    is_notice: false
  },
  {
    title: '중요 공지사항: 커뮤니티 이용 규칙',
    content: '모든 회원분들께서는 다음 규칙을 준수해주시기 바랍니다.\n\n1. 서로를 존중하는 마음으로 대화해주세요\n2. 비방이나 욕설은 삼가해주세요\n3. 스팸이나 광고성 글은 금지됩니다\n4. 개인정보 보호에 유의해주세요\n\n함께 좋은 커뮤니티를 만들어가요!',
    board_type: 'free',
    is_notice: true
  },
  {
    title: '최신 스마트폰 추천해주세요',
    content: '현재 사용 중인 폰이 3년이 되어서 교체를 고려하고 있습니다. 예산은 100만원 정도이고, 카메라 성능이 좋은 것을 원합니다. 추천해주실 수 있나요?',
    board_type: 'mobile-info',
    is_notice: false
  },
  {
    title: '갤럭시 S24 울트라 사용 후기',
    content: '갤럭시 S24 울트라를 2주 정도 사용해보니 정말 만족스럽습니다.\n\n장점:\n- 카메라 성능이 정말 뛰어남\n- 배터리 수명이 길어짐\n- AI 기능들이 유용함\n\n단점:\n- 가격이 비쌈\n- 크기가 너무 큼\n\n전반적으로 추천합니다!',
    board_type: 'review',
    is_notice: false
  },
  {
    title: '재미있는 폰 관련 밈 모음',
    content: '폰 관련해서 재미있는 밈들을 모아봤습니다. 공유해드려요! 😄\n\n- 아이폰 사용자들의 충전기 공유 문화\n- 안드로이드 사용자들의 설정 탐험\n- 갤럭시 사용자들의 원페이 사용법\n\n여러분도 재미있는 경험 있으시면 공유해주세요!',
    board_type: 'funny',
    is_notice: false
  },
  {
    title: '5G 요금제 비교 분석',
    content: '현재 시중에 나와있는 5G 요금제들을 비교 분석해봤습니다.\n\nSKT:\n- 5GX 슬림: 월 55,000원\n- 5GX 스탠다드: 월 77,000원\n\nKT:\n- 5G 슬림: 월 55,000원\n- 5G 스탠다드: 월 77,000원\n\nLG U+:\n- 5G 베이직: 월 55,000원\n- 5G 스탠다드: 월 77,000원\n\n개인적으로는 데이터 사용량에 따라 선택하시는 것을 추천합니다.',
    board_type: 'mobile-info',
    is_notice: false
  },
  {
    title: '아이폰 15 프로 맥스 리뷰',
    content: '아이폰 15 프로 맥스를 1개월 사용한 후기입니다.\n\n디자인: 티타늄 소재가 정말 고급스럽고 가벼워졌습니다.\n카메라: 5배 망원 카메라가 정말 유용합니다.\n성능: A17 Pro 칩이 정말 빠릅니다.\n배터리: 하루 종일 사용해도 충분합니다.\n\n단점은 가격이 너무 비싸다는 점입니다. 하지만 만족도는 높습니다.',
    board_type: 'review',
    is_notice: false
  },
  {
    title: '폰 케이스 추천해주세요',
    content: '갤럭시 S24를 구매했는데 케이스를 찾고 있습니다. 보호력이 좋으면서도 예쁜 케이스 추천해주실 수 있나요? 예산은 5만원 이하로 생각하고 있습니다.',
    board_type: 'mobile-info',
    is_notice: false
  },
  {
    title: '폰 배터리 수명 연장 팁',
    content: '폰 배터리 수명을 연장하는 방법들을 정리해봤습니다.\n\n1. 배터리 최적화 설정 활용\n2. 불필요한 앱 백그라운드 실행 제한\n3. 화면 밝기 조절\n4. 위치 서비스 필요시에만 사용\n5. 배터리 온도 관리\n\n이런 방법들로 배터리 수명을 크게 연장할 수 있습니다.',
    board_type: 'mobile-info',
    is_notice: false
  },
  {
    title: '폰 사진 촬영 팁 공유',
    content: '폰으로 더 좋은 사진을 찍는 팁들을 공유합니다.\n\n1. 구도법 활용 (3분법, 대각선 구도 등)\n2. 조명 활용 (자연광이 가장 좋음)\n3. HDR 모드 활용\n4. 매크로 모드로 근접 촬영\n5. 인물 모드로 배경 흐림 효과\n\n이런 팁들을 활용하면 훨씬 좋은 사진을 찍을 수 있습니다!',
    board_type: 'mobile-info',
    is_notice: false
  }
];

const sampleComments = [
  '정말 유용한 정보네요! 감사합니다.',
  '저도 같은 고민이었는데 도움이 되었어요.',
  '추천해주신 제품 사용해보고 후기 남기겠습니다.',
  '이런 정보가 정말 필요했는데 감사합니다!',
  '추가로 궁금한 점이 있는데 답변 부탁드려요.',
  '정말 재미있게 읽었습니다. 공유 감사해요!',
  '저도 비슷한 경험이 있어서 공감이 됩니다.',
  '이런 팁들이 정말 유용하네요. 실천해보겠습니다.',
  '추천해주신 방법으로 시도해보겠습니다.',
  '정말 도움이 되는 정보였습니다. 감사합니다!'
];

async function createSampleUser() {
  // 샘플 사용자 생성 (실제로는 인증된 사용자가 필요)
  const { data: user, error } = await supabase
    .from('users')
    .insert({
      email: 'sample@example.com',
      nickname: '샘플사용자',
      provider: 'email',
      role: 'user',
      plan: 'free',
      is_verified: true,
      post_count: 0,
      comment_count: 0
    })
    .select()
    .single();

  if (error) {
    console.error('사용자 생성 오류:', error);
    return null;
  }

  return user;
}

async function seedPosts() {
  console.log('게시글 샘플 데이터 생성 시작...');

  // 샘플 사용자 생성 또는 조회
  let user = await createSampleUser();
  if (!user) {
    // 기존 사용자 조회
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'sample@example.com')
      .single();
    
    if (existingUser) {
      user = existingUser;
    } else {
      console.error('사용자를 찾을 수 없습니다.');
      return;
    }
  }

  // 게시글 생성
  for (const postData of samplePosts) {
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        ...postData,
        user_id: user.id,
        views: Math.floor(Math.random() * 1000) + 10,
        likes: Math.floor(Math.random() * 100) + 1
      })
      .select()
      .single();

    if (postError) {
      console.error('게시글 생성 오류:', postError);
      continue;
    }

    console.log(`게시글 생성 완료: ${post.title}`);

    // 각 게시글에 댓글 추가
    const commentCount = Math.floor(Math.random() * 5) + 1;
    for (let i = 0; i < commentCount; i++) {
      const commentContent = sampleComments[Math.floor(Math.random() * sampleComments.length)];
      
      const { error: commentError } = await supabase
        .from('comments')
        .insert({
          post_id: post.id,
          user_id: user.id,
          content: commentContent
        });

      if (commentError) {
        console.error('댓글 생성 오류:', commentError);
      }
    }

    console.log(`댓글 ${commentCount}개 생성 완료`);
  }

  console.log('샘플 데이터 생성 완료!');
}

// 스크립트 실행
if (require.main === module) {
  seedPosts()
    .then(() => {
      console.log('모든 작업이 완료되었습니다.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('오류 발생:', error);
      process.exit(1);
    });
}

export { seedPosts }; 