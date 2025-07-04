import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY);
console.log('SUPABASE_STORAGE_BUCKET:', process.env.SUPABASE_STORAGE_BUCKET);

// 실제 게시글 크롤링 및 업로드 자동화 스크립트

import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { Faker, ko } from '@faker-js/faker';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const faker = new Faker({ locale: [ko] });

// 환경 변수에서 Supabase 정보 불러오기
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'public';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface FakeUser {
  id: string;
  nickname: string;
}

interface FakePost {
  id: string;
  user_id: string;
  nickname: string;
  title: string;
  content: string;
  board_type: string;
  image_urls: string[];
  video_url: string | null;
  views: number;
  likes: number;
  is_notice: boolean;
  created_at: string;
}

// 자유게시판 샘플 데이터 (30개, 각 글마다 문맥에 맞는 댓글 2~3개 포함, 댓글 스타일 다양화)
const freeBoardSamples = [
  {
    "title": "오늘 너무 더워서 카페에 피신했어요",
    "content": "오늘 진짜 더워서 아무것도 하기 싫었어요. 결국 근처 카페 가서 아이스라떼 마시며 멍 때렸어요. 이런 날엔 시원한 데서 쉬는 게 최고인 듯!",
    "comments": [
      "오늘 하늘 레전드였음",
      "사진 찍었어요?"
    ]
  },
  {
    "title": "퇴근하고 뭐 먹을지 고민돼요",
    "content": "퇴근하고 뭘 먹어야 할지 한참 고민했는데 결국 라면 끓여먹었네요. 근데 또 맛있음 ㅋㅋ 여러분 저녁 뭐 드셨나요?",
    "comments": [
      "저도 MBTI 믿는 편이에요!",
      "뭔가 신기하죠?"
    ]
  },
  {
    "title": "인생 첫 코딩 수업 들었어요!",
    "content": "코딩 수업 듣는데 어려운데 재밌네요! if문이 뭐지 했는데 조금은 이해되는 것 같아요. 다들 처음엔 어떻게 배우셨어요?",
    "comments": [
      "사진 찍었어요?",
      "오늘 하늘 레전드였음"
    ]
  },
  {
    "title": "요즘 이상하게 잠이 안 와요",
    "content": "요즘 밤에 누우면 머릿속이 너무 복잡해져서 잠이 안 와요. 명상이나 ASMR 같은 거 들어보는 중인데 잘 안 되네요ㅠ",
    "comments": [
      "뭔가 감성 터지네요",
      "오늘 하늘 레전드였음"
    ]
  },
  {
    "title": "토요일에 친구랑 대판 싸웠어요",
    "content": "토요일에 친구랑 말다툼 했는데 아직도 화해 못 했어요. 먼저 연락해야 할까요...? 괜히 마음만 무거워요.",
    "comments": [
      "운동은 꾸준히가 답입니다",
      "근육통은 곧 성장입니다",
      "화이팅!"
    ]
  },
  {
    "title": "새 폰 샀는데 색깔 너무 예뻐요",
    "content": "새로 산 폰이 너무 예뻐서 자꾸 꺼냈다 켰다 하게 돼요. 여러분은 어떤 색 좋아하세요?",
    "comments": [
      "화이팅!",
      "근육통은 곧 성장입니다"
    ]
  },
  {
    "title": "여러분 타자 연습 어떻게 하세요?",
    "content": "타자 연습할 때 손가락이 자꾸 꼬여요ㅋㅋ 나만 그런 거 아니죠? 잘 치는 팁 있으면 공유 부탁해요!",
    "comments": [
      "오늘 하늘 레전드였음",
      "뭔가 감성 터지네요"
    ]
  },
  {
    "title": "오늘 하늘 너무 예쁘지 않았나요?",
    "content": "오늘 하늘이 진짜 그림 같았어요. 괜히 혼자 사진 찍고 감성에 젖었네요 ㅎㅎ",
    "comments": [
      "ㅋㅋㅋㅋ 저도요",
      "힘내세요!",
      "진짜 공감이요ㅠ"
    ]
  },
  {
    "title": "가을 되면 뭔가 센치해지는 듯",
    "content": "가을 되니까 괜히 옛 생각나고 쓸쓸해지는 느낌... 이런 거 저만 그런가요?",
    "comments": [
      "저는 치킨 시켰어요 ㅋㅋ",
      "라면은 진리죠",
      "먹고 운동 꼭 하세요!"
    ]
  },
  {
    "title": "저만 주말에 혼자인가요?",
    "content": "주말에 약속도 없고 친구들도 바쁘대서 혼자 있었어요. 혼자서도 잘 노는 법 있나요?",
    "comments": [
      "진짜 공감이요ㅠ",
      "ㅋㅋㅋㅋ 저도요"
    ]
  },
  {
    "title": "시험기간엔 왜 갑자기 방 청소가 하고 싶을까요?",
    "content": "시험 공부 하려는데 갑자기 방이 너무 더럽게 느껴져서 청소부터 했어요. 이거 진짜 시험병인가요?ㅋㅋ",
    "comments": [
      "라면은 진리죠",
      "먹고 운동 꼭 하세요!"
    ]
  },
  {
    "title": "편의점 삼각김밥 추천해요",
    "content": "편의점에서 참치마요 삼각김밥 샀는데 진짜 맛있었어요! 요즘 삼각김밥 퀄리티 미쳤네요.",
    "comments": [
      "ㅋㅋㅋㅋ 저도요",
      "힘내세요!"
    ]
  },
  {
    "title": "지하철에서 만난 인연",
    "content": "출근길 지하철에서 우연히 중학교 친구 만났어요. 몇 년 만이라 너무 반가웠어요!",
    "comments": [
      "저도 MBTI 믿는 편이에요!",
      "ISFP 친구 있는데 진짜 착해요"
    ]
  },
  {
    "title": "아침에 일어나기 너무 힘들어요",
    "content": "아침마다 알람 끄고 다시 자는 게 습관이 됐어요... 어떻게 해야 아침형 인간 될 수 있을까요?",
    "comments": [
      "근육통은 곧 성장입니다",
      "운동은 꾸준히가 답입니다",
      "화이팅!"
    ]
  },
  {
    "title": "갑자기 비 오니까 기분이 이상해요",
    "content": "갑자기 비가 쏟아졌는데 우산이 없어서 뛰었어요. 근데 또 그게 재밌었어요 ㅋㅋㅋ",
    "comments": [
      "뭔가 신기하죠?",
      "저도 MBTI 믿는 편이에요!",
      "ISFP 친구 있는데 진짜 착해요"
    ]
  },
  {
    "title": "자취 요리 꿀팁 공유해요",
    "content": "혼자 자취하는데 요리 잘하는 법 있나요? 맨날 계란이랑 김치밖에 안 먹어요...",
    "comments": [
      "화이팅!",
      "운동은 꾸준히가 답입니다"
    ]
  },
  {
    "title": "이 앱 진짜 신기해요",
    "content": "이 앱 처음 써보는데 진짜 신기하네요. 이런 공간이 있다니 반가워요!",
    "comments": [
      "화이팅!",
      "근육통은 곧 성장입니다",
      "운동은 꾸준히가 답입니다"
    ]
  },
  {
    "title": "모임에서 말 실수한 것 같아요",
    "content": "모임에서 실수로 말을 헛나왔는데 괜히 찝찝하네요. 다들 잊었겠죠?",
    "comments": [
      "ISFP 친구 있는데 진짜 착해요",
      "저도 MBTI 믿는 편이에요!",
      "뭔가 신기하죠?"
    ]
  },
  {
    "title": "운동 시작한 지 일주일 됐어요!",
    "content": "운동 시작한 지 일주일인데 벌써 근육통이 장난 아니에요. 꾸준히 하면 나아지겠죠?",
    "comments": [
      "ㅋㅋㅋㅋ 저도요",
      "힘내세요!",
      "진짜 공감이요ㅠ"
    ]
  },
  {
    "title": "누가 나한테 용돈 좀 줬으면",
    "content": "용돈 받는 나이는 지났지만 가끔 진심으로 누가 돈 줬으면 좋겠어요ㅠㅠ",
    "comments": [
      "라면은 진리죠",
      "저는 치킨 시켰어요 ㅋㅋ",
      "먹고 운동 꼭 하세요!"
    ]
  },
  {
    "title": "오늘 하루 망한 사람?",
    "content": "오늘 지갑 잃어버리고, 비 맞고, 엘리베이터 고장... 재난영화 한 편 찍었네요.",
    "comments": [
      "진짜 공감이요ㅠ",
      "힘내세요!"
    ]
  },
  {
    "title": "MBTI 진짜 맞는 걸까요?",
    "content": "MBTI가 ISFP인데 진짜 설명 보니까 저 같아요. 다들 MBTI 믿으시나요?",
    "comments": [
      "사진 찍었어요?",
      "뭔가 감성 터지네요"
    ]
  },
  {
    "title": "요즘 유튜브 끊기가 너무 힘들어요",
    "content": "요즘 유튜브 보느라 새벽 3시에 자요. 진짜 끊어야 하는데 잘 안 돼요ㅠ",
    "comments": [
      "힘내세요!",
      "ㅋㅋㅋㅋ 저도요",
      "진짜 공감이요ㅠ"
    ]
  },
  {
    "title": "낮잠 자고 일어났더니 밤이네요",
    "content": "잠깐 눈 붙이려고 했는데 밤 10시 됐네요... 나만 이래요?",
    "comments": [
      "힘내세요!",
      "진짜 공감이요ㅠ",
      "ㅋㅋㅋㅋ 저도요"
    ]
  },
  {
    "title": "지금 과자 먹고 있는 사람 ㅋㅋ",
    "content": "과자 한 봉지만 먹으려 했는데 다 먹어버림... 후회는 없다!",
    "comments": [
      "ㅋㅋㅋㅋ 저도요",
      "진짜 공감이요ㅠ"
    ]
  },
  {
    "title": "카톡 답장 기다리는 중...",
    "content": "카톡 읽씹 당한 건가요...? 괜히 마음 쓰이네요",
    "comments": [
      "뭔가 신기하죠?",
      "저도 MBTI 믿는 편이에요!"
    ]
  },
  {
    "title": "혼밥 잘하는 사람 존경해요",
    "content": "혼밥도 잘하는 사람이 진짜 멋있는 거 같아요. 전 아직 어렵네요ㅠ",
    "comments": [
      "ㅋㅋㅋㅋ 저도요",
      "진짜 공감이요ㅠ"
    ]
  },
  {
    "title": "비 오는 날엔 왜 라면이 땡길까요?",
    "content": "비 오는 날엔 무조건 라면이 국룰 아닌가요? 김치랑 딱!",
    "comments": [
      "저는 치킨 시켰어요 ㅋㅋ",
      "라면은 진리죠",
      "먹고 운동 꼭 하세요!"
    ]
  },
  {
    "title": "가성비 좋은 이어폰 추천해주세요",
    "content": "블루투스 이어폰 추천 좀 해주세요. 통화 품질 괜찮고 저렴한 거요!",
    "comments": [
      "진심 웃겼다",
      "ㅋㅋㅋㅋㅋ"
    ]
  },
  {
    "title": "지금 뭐 하고 계세요?",
    "content": "다들 지금 뭐 하고 계세요? 저는 멍하니 누워 있어요ㅎㅎ",
    "comments": [
      "운동은 꾸준히가 답입니다",
      "화이팅!"
    ]
  }
];

// 후기 및 건의 샘플 데이터 (30개, type: '후기' 20개, '건의' 10개, 각 글 2~5문장)
const reviewBoardSamples = [
  {
    "title": "여러 시트를 한 번에 볼 수 있어 편리합니다.",
    "content": "예전에는 각 통신사 정책을 따로따로 엑셀로 받아서 비교하느라 시간이 정말 오래 걸렸어요. 그런데 이 사이트 덕분에 한 번에 모든 정책을 볼 수 있어서 업무 효율이 엄청나게 올라갔습니다. 7일 무료체험도 써보고 바로 결제했어요. 월 2만원이 전혀 아깝지 않네요.",
    "type": "후기"
  },
  {
    "title": "검색 기능이 빨라서 만족합니다.",
    "content": "정책 검색할 때 키워드 몇 개만 입력해도 관련된 내용이 쭉 나오는 게 정말 좋습니다. 예전엔 자료 찾는 데 하루가 걸렸는데 지금은 10분이면 돼요.",
    "type": "후기"
  },
  {
    "title": "모바일에서도 잘 작동해서 좋아요.",
    "content": "외근이 많아서 주로 휴대폰으로 조회하는데, 반응형으로 잘 만들어져서 크게 불편함 없네요. UI도 간단해서 좋습니다.",
    "type": "후기"
  },
  {
    "title": "무료체험 기간이 넉넉해서 좋았어요.",
    "content": "처음에 7일 체험하고 마음에 들어서 정식으로 결제했습니다. 기간 내 충분히 기능 테스트 해볼 수 있었어요.",
    "type": "후기"
  },
  {
    "title": "PDF 다운로드 기능이 최고예요.",
    "content": "필요한 정책을 바로 PDF로 저장해서 팀원들과 공유할 수 있으니까 너무 편리하네요. 보고서 만들기에도 딱이에요.",
    "type": "후기"
  },
  {
    "title": "복잡한 조건 검색이 편해졌어요.",
    "content": "이전엔 필터 기능이 부족했는데 최근 업데이트로 상세 검색이 가능해져서 만족합니다.",
    "type": "후기"
  },
  {
    "title": "광고 없이 깔끔한 UI가 마음에 들어요.",
    "content": "화면도 단정하고 정돈되어 있어서 오래 봐도 피로하지 않아요. 광고가 없다는 점도 너무 좋네요.",
    "type": "후기"
  },
  {
    "title": "가격 대비 기능이 훌륭합니다.",
    "content": "매달 2만원이라는 가격이 처음엔 비싸게 느껴졌는데, 써보니까 기능이 탄탄해서 충분히 그럴 만하다고 생각돼요.",
    "type": "후기"
  },
  {
    "title": "문의 대응이 빠릅니다.",
    "content": "고객센터에 문의했더니 1시간 만에 답변이 와서 놀랐습니다. 운영팀 칭찬합니다.",
    "type": "후기"
  },
  {
    "title": "업데이트가 자주 이루어져서 좋아요.",
    "content": "기능 개선이 빠르게 반영돼서 믿고 사용할 수 있어요. 의견 반영도 해주시고요.",
    "type": "후기"
  },
  {
    "title": "모바일 앱도 지원해주세요.",
    "content": "외부 미팅이 많아서 모바일로 정책을 확인할 일이 많은데, 아직 앱이 없는 게 아쉽네요. 모바일 웹도 괜찮지만 앱으로 알림도 받고 싶어요. 혹시 개발 계획 있으신가요?",
    "type": "건의"
  },
  {
    "title": "다크모드 추가 요청합니다.",
    "content": "야간에 사용할 일이 많아서 눈이 피로하네요. 다크모드 있으면 더 오래 사용할 수 있을 것 같아요.",
    "type": "건의"
  },
  {
    "title": "정책 즐겨찾기 기능 있으면 좋겠어요.",
    "content": "자주 찾는 항목을 따로 저장할 수 있으면 업무할 때 더 빠르게 접근할 수 있을 것 같아요.",
    "type": "건의"
  },
  {
    "title": "검색 결과에서 강조 표시 기능 추가해주세요.",
    "content": "검색한 키워드가 결과 내에서 하이라이트로 표시되면 한눈에 보기 쉬울 것 같아요.",
    "type": "건의"
  },
  {
    "title": "알림 설정 기능이 필요해요.",
    "content": "새로운 정책이 올라왔을 때 메일이나 푸시 알림으로 알려주면 좋겠어요.",
    "type": "건의"
  },
  {
    "title": "엑셀 내보내기 형식 개선 부탁드려요.",
    "content": "다운로드한 엑셀 파일이 보기 어려워서 직접 손질하고 있어요. 컬럼 정렬이나 스타일 조금만 손봐주시면 좋겠습니다.",
    "type": "건의"
  },
  {
    "title": "다국어 지원은 예정 없을까요?",
    "content": "외국인 동료도 사용하는데 영어 버전이 있으면 정말 편리할 것 같아요.",
    "type": "건의"
  },
  {
    "title": "기능 소개 페이지가 있었으면 합니다.",
    "content": "처음 접하는 사람에겐 기능이 많은 만큼 안내 페이지가 있으면 좋겠어요. 간단한 튜토리얼도 있으면 좋을 것 같아요.",
    "type": "건의"
  },
  {
    "title": "파일 첨부 기능이 있었으면 좋겠어요.",
    "content": "정책 관련 문서 첨부할 일이 많은데, 내부 자료도 함께 저장할 수 있었으면 합니다.",
    "type": "건의"
  },
  {
    "title": "사용자 커뮤니티가 있으면 좋겠어요.",
    "content": "다른 사람들의 사용 노하우나 팁을 공유할 수 있는 공간이 생기면 더 풍부하게 활용할 수 있을 것 같아요.",
    "type": "건의"
  }
];

// 샘플 이미지 URL 배열
const sampleImages = [
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
  'https://images.unsplash.com/photo-1519125323398-675f0ddb6308',
  'https://images.unsplash.com/photo-1465101046530-73398c7f28ca',
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429',
  'https://images.unsplash.com/photo-1519985176271-adb1088fa94c',
];

// 0~2개 랜덤 이미지 url 반환
function getRandomImages(): string[] {
  const count = Math.random() < 0.5 ? 0 : Math.floor(Math.random() * 2) + 1; // 0~2개
  return Array.from({ length: count }, () => sampleImages[Math.floor(Math.random() * sampleImages.length)]);
}

async function createAndInsertFakeUsers(count: number): Promise<FakeUser[]> {
  const users: FakeUser[] = [];
  for (let i = 0; i < count; i++) {
    const id = uuidv4();
    const nickname = faker.internet.username();
    users.push({
      id,
      nickname,
    });
  }
  // Supabase users 테이블에 일괄 삽입
  const { data, error } = await supabase.from('users').insert(users);
  if (error) {
    console.error('가상 유저 삽입 실패:', error);
    throw error;
  }
  console.log(`가상 유저 ${count}명 생성 및 삽입 완료`);
  return users;
}

function getRandomUserId(users: { id: string }[]): string {
  return users[Math.floor(Math.random() * users.length)].id;
}

// 날짜 분포 함수: 게시글 생성 시 1월~현재까지 균등 분포
function getDistributedDate(index: number, total: number): string {
  const start = new Date(new Date().getFullYear(), 0, 1); // 1월 1일
  const end = new Date();
  const diff = end.getTime() - start.getTime();
  const step = diff / total;
  const date = new Date(start.getTime() + step * index + Math.random() * step * 0.7); // 약간 랜덤
  return date.toISOString();
}

// 댓글 날짜: 게시글 이후~현재 사이 랜덤
function getRandomDateBetween(startDate: string, endDate: string): string {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const date = new Date(start + Math.random() * (end - start));
  return date.toISOString();
}

// 자유게시판 댓글 생성 함수: 각 글의 comments 배열을 순서대로 모두 입력, 랜덤/섞기 없이 일관성 보장
async function createAndInsertConsistentComments(postId: string, users: { id: string, nickname: string }[], comments: string[], postCreatedAt: string) {
  const now = new Date().toISOString();
  const commentObjs = comments.map(content => {
    const user = users[Math.floor(Math.random() * users.length)];
    const created_at = getRandomDateBetween(postCreatedAt, now);
    return {
      id: uuidv4(),
      post_id: postId,
      user_id: user.id,
      nickname: user.nickname, // 닉네임 복사 저장
      content,
      created_at,
      updated_at: created_at,
    };
  });
  const { error } = await supabase.from('comments').insert(commentObjs);
  if (error) {
    console.error('자유게시판 댓글 삽입 실패:', error);
    throw error;
  }
}

// 유머게시판 샘플 데이터 (30개, 1~3문장, 일부는 이미지 포함)
// const humorBoardSamples = [ ... ];

// 모바일 정보 샘플 데이터 (30개, 3~6문장, 정보성/꿀팁/비교/트렌드/실사용/정책 등, 이미지 없음)
const mobileInfoBoardSamples = [
  {
    "title": "갤럭시 S24 울트라 실사용 후기",
    "content": "갤럭시 S24 울트라를 2주간 사용해봤습니다. 카메라 성능이 확실히 좋아졌고, 야간 촬영도 노이즈가 적어요. 배터리도 하루 종일 충분히 가고, S펜 활용도가 높아서 업무에 정말 유용합니다. 무게는 조금 있지만 그립감이 좋아서 오래 써도 부담이 적네요.",
    "image_urls": []
  },
  {
    "title": "iOS 18 새로운 기능 요약",
    "content": "iOS 18에서 추가된 맞춤형 잠금화면, 앱 숨기기, 개선된 메시지 검색 기능이 인상적입니다. 특히 키보드 자동완성 정확도가 눈에 띄게 좋아졌습니다. 업데이트 후 발열이나 배터리 이슈는 따로 느껴지지 않았어요.",
    "image_urls": []
  },
  {
    "title": "안드로이드 15 베타 설치 후기",
    "content": "안드로이드 15 베타를 설치해보니 UI가 좀 더 깔끔해졌고, 알림 설정이 직관적입니다. 다만 베타라 그런지 앱 몇 개는 튕기는 문제가 있네요. 참고해서 설치하세요!",
    "image_urls": []
  },
  {
    "title": "2025년 통신비 지원 정책 정리",
    "content": "2025년부터 저소득층 가구를 대상으로 월 통신비 1만원 추가 지원이 시작됩니다. 만 24세 이하 청년 대상 무제한 요금제 50% 할인도 확대 적용된다고 하니 꼭 확인해보세요.",
    "image_urls": []
  },
  {
    "title": "노트북 vs 태블릿, 어떤 게 나을까?",
    "content": "노트북은 작업 위주, 태블릿은 콘텐츠 소비나 필기 중심입니다. 영상 편집이나 코딩 등 고사양 작업이 필요하다면 노트북이 낫고, 필기나 간단한 문서 작업은 태블릿으로도 충분해요.",
    "image_urls": []
  },
  {
    "title": "스마트폰 발열 줄이는 꿀팁",
    "content": "스마트폰 발열을 줄이려면 밝기 자동 조절, 불필요한 앱 종료, 배터리 최적화 기능을 켜는 것이 좋습니다. 충전 중 사용은 피하는 것도 중요해요.",
    "image_urls": []
  },
  {
    "title": "유튜브 프리미엄 해지 후 느낀 점",
    "content": "유튜브 프리미엄을 해지하니 광고가 너무 많이 나와서 다시 구독할까 고민 중입니다. 광고차단 앱도 써봤지만 완벽하진 않네요.",
    "image_urls": []
  },
  {
    "title": "갤럭시 vs 아이폰 카메라 비교",
    "content": "갤럭시는 선명하고 색감이 쨍한 느낌이고, 아이폰은 자연스럽고 디테일이 좋아요. 인물 사진은 아이폰, 풍경은 갤럭시가 나은 듯합니다.",
    "image_urls": []
  },
  {
    "title": "5G 요금제 너무 비싸요",
    "content": "5G 요금제는 속도 대비 가격이 너무 높다고 느껴집니다. 특히 자급제 사용자라면 LTE 무제한 요금제도 충분해 보여요.",
    "image_urls": []
  },
  {
    "title": "중고폰 살 때 주의할 점",
    "content": "중고폰 살 땐 직거래보단 검수된 중고 쇼핑몰을 추천합니다. 특히 배터리 성능 확인과 잠금 상태 꼭 체크하세요.",
    "image_urls": []
  },
  {
    "title": "eSIM 개통 후기",
    "content": "eSIM 개통은 생각보다 간단했어요. 앱에서 QR만 찍으면 바로 개통됐고, 물리 SIM 없이도 듀얼 번호가 되니 편리하네요.",
    "image_urls": []
  },
  {
    "title": "카카오톡 백업 잘 하는 법",
    "content": "카카오톡 백업은 대화 내용과 사진, 동영상 모두 별도로 설정해두는 게 좋습니다. 특히 iPhone과 안드로이드 간에는 복원이 다르게 작동하니 유의하세요.",
    "image_urls": []
  },
  {
    "title": "2025 스마트폰 트렌드 예측",
    "content": "2025년에는 폴더블폰이 더 대중화될 것으로 보입니다. AI 보조 기능 탑재와 더불어 배터리 수명 향상도 기대되고 있어요.",
    "image_urls": []
  },
  {
    "title": "배터리 오래 쓰는 습관",
    "content": "배터리를 오래 쓰려면 완충/완방을 피하고, 20~80% 구간에서 충전하는 습관을 들이세요. 배터리 수명이 훨씬 오래 갑니다.",
    "image_urls": []
  },
  {
    "title": "구글 픽셀8 사용기",
    "content": "구글 픽셀8은 사진 처리 속도가 매우 빠르고, 실시간 번역 기능이 좋아졌습니다. 다만 국내에서는 AS가 약한 점이 단점이에요.",
    "image_urls": []
  },
  {
    "title": "앱스토어 추천 앱 Top5",
    "content": "앱스토어 기준 무료이면서 유용한 앱들 중, Notion, Forest, Habitica, Goodnotes Lite, Mindly를 추천합니다.",
    "image_urls": []
  },
  {
    "title": "iCloud 용량 부족 시 대처법",
    "content": "iCloud 용량 부족하면, 사진 백업을 Google Photos로 이관하거나, 저용량 앱 데이터 정리를 추천드립니다.",
    "image_urls": []
  },
  {
    "title": "저가형 스마트폰 추천",
    "content": "30만원 이하 모델 중 샤오미, 모토로라 등 브랜드에서 괜찮은 스펙을 제공하는 스마트폰이 많아요. 가성비도 우수합니다.",
    "image_urls": []
  },
  {
    "title": "사진 잘 나오는 카메라 앱 추천",
    "content": "사진 잘 나오는 앱으로는 푸디(Foodie), B612, 스노우 등이 있고, 필터도 다양해서 SNS용으로 좋아요.",
    "image_urls": []
  },
  {
    "title": "Toss 앱 새로워졌어요",
    "content": "Toss 앱 인터페이스가 최근에 확 바뀌었어요. 간편송금 외에도 투자, 보험, 신용관리까지 종합 금융앱 느낌이에요.",
    "image_urls": []
  },
  {
    "title": "무료 메모 앱 비교",
    "content": "무료 메모앱 중 Microsoft To Do, Google Keep, ColorNote가 직관적이고 동기화가 편리합니다.",
    "image_urls": []
  },
  {
    "title": "갤럭시 One UI 7 체험 후기",
    "content": "갤럭시 One UI 7 베타를 써보니 디자인이 더 미니멀해지고 애니메이션이 부드러워졌어요. 아직은 몇몇 앱에서 호환성 이슈는 있어요.",
    "image_urls": []
  },
  {
    "title": "카카오페이 vs 토스 비교",
    "content": "토스는 UI가 직관적이고 빠르며, 카카오페이는 다양한 온/오프라인 가맹점에서의 접근성이 뛰어납니다. 각각의 장단이 확실하네요.",
    "image_urls": []
  },
  {
    "title": "휴대폰 액정 깨졌을 때 대처법",
    "content": "액정이 깨졌다면 먼저 백업부터 하세요. 이후 서비스센터보다 보험 또는 사설 수리 비교도 추천드려요.",
    "image_urls": []
  },
  {
    "title": "삼성 헬스 앱 활용법",
    "content": "삼성 헬스는 수면 기록, 걸음 수, 체중 관리 등 다양한 기능을 제공합니다. 특히 갤럭시 워치와 연동하면 운동 측정이 편해요.",
    "image_urls": []
  },
  {
    "title": "카메라 렌즈 먼지 제거 팁",
    "content": "렌즈 안쪽 먼지는 블로워로 불어주고, 마이크로섬유 천으로 닦는 게 안전합니다. 손으로 직접 건드리면 흠집 날 수 있어요.",
    "image_urls": []
  },
  {
    "title": "문자 메시지 자동 분류 설정법",
    "content": "안드로이드는 '문자 분류함' 기능을 켜면 자동으로 스팸, 광고, 인증번호 등을 정리해줘요. 설정에서 간단히 켤 수 있어요.",
    "image_urls": []
  },
  {
    "title": "스마트워치 입문자 추천 모델",
    "content": "스마트워치 처음 사는 분께는 갤럭시 워치 FE, 샤오미 워치2 프로, 애플워치 SE 추천드려요. 기능은 충분하고 가격도 적당합니다.",
    "image_urls": []
  },
  {
    "title": "블루투스 끊김 현상 해결법",
    "content": "블루투스가 끊길 땐, 주변에 2.4GHz 간섭이 있는지 확인하거나, 블루투스 재연결/초기화가 효과적입니다.",
    "image_urls": []
  },
  {
    "title": "갤럭시 플립6 루머 모음",
    "content": "갤럭시 플립6에는 힌지 내구성 향상, 카메라 개선, 배터리 용량 증가 등이 탑재될 것으로 예상되고 있어요.",
    "image_urls": []
  }
];

// 게시글 생성 함수 개선 (유머/모바일 정보 게시판도 샘플 활용)
async function createAndInsertRandomPosts(users: { id: string, nickname: string }[], boardType: string, count: number) {
  const posts: FakePost[] = [];
  let samples: { title: string; content: string; comments?: string[]; type?: string; image_urls?: string[] }[];
  if (boardType === 'free') {
    samples = freeBoardSamples;
  } else if (boardType === 'review') {
    samples = reviewBoardSamples;
  } else if (boardType === 'mobile') {
    samples = mobileInfoBoardSamples;
  } else {
    samples = [];
  }
  for (let i = 0; i < count; i++) {
    const id = uuidv4();
    const user = users[Math.floor(Math.random() * users.length)];
    let title = '', content = '', comments: string[] = [], image_urls: string[] = [];
    let created_at = getDistributedDate(i, count);
    if (boardType === 'free') {
      const sample = samples[i % samples.length];
      title = sample.title;
      content = sample.content;
      comments = sample.comments || [];
      image_urls = getRandomImages();
    } else if (boardType === 'review') {
      const sample = samples[i % samples.length];
      title = sample.title;
      content = sample.content;
      image_urls = getRandomImages();
    } else if (boardType === 'mobile') {
      const sample = samples[i % samples.length];
      title = sample.title;
      content = sample.content;
      image_urls = sample.image_urls || [];
    } else {
      title = '테스트 게시글';
      content = '테스트 내용';
      image_urls = getRandomImages();
    }
    const video_url = null;
    const views = faker.number.int({ min: 0, max: 100 });
    const likes = faker.number.int({ min: 0, max: 30 });
    const is_notice = false;
    posts.push({
      id,
      user_id: user.id,
      nickname: user.nickname,
      title,
      content,
      board_type: boardType,
      image_urls,
      video_url,
      views,
      likes,
      is_notice,
      created_at,
    });
  }
  const { data, error } = await supabase.from('posts').insert(posts);
  if (error) {
    console.error(`${boardType} 게시글 삽입 실패:`, error);
    throw error;
  }
  console.log(`${boardType} 게시글 ${count}개 생성 및 삽입 완료`);

  // 자유게시판만 댓글 생성 (일관성 있게)
  if (boardType === 'free') {
    const insertedPosts = (data && typeof data === 'object' && 'length' in data && Array.isArray(data)) ? data : posts;
    for (let i = 0; i < insertedPosts.length; i++) {
      const post = insertedPosts[i];
      const sample = freeBoardSamples[i % freeBoardSamples.length];
      await createAndInsertConsistentComments(post.id, users, sample.comments || [], post.created_at);
    }
    console.log('자유게시판 댓글 자동 생성 완료');
  }
}

async function main() {
  // 1. users 테이블에서 email이 yahoo를 포함하는 유저만 불러오기 (id, nickname만)
  const { data: users, error } = await supabase.from('users').select('id, nickname').ilike('email', '%yahoo%');
  if (error || !users || users.length === 0) {
    throw new Error('Yahoo 이메일을 가진 유저가 없습니다. 먼저 유저를 생성해 주세요.');
  }
  // 2. 자유게시판/후기 및 건의/모바일 정보: 30개씩 랜덤 게시글 생성 및 삽입 (유머 게시판 제외)
  await createAndInsertRandomPosts(users, 'free', 30);
  await createAndInsertRandomPosts(users, 'review', 30);
  await createAndInsertRandomPosts(users, 'mobile', 30);
  // TODO: 다음 단계 함수 호출
}

main().catch(console.error); 