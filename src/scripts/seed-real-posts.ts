import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY);
console.log('SUPABASE_STORAGE_BUCKET:', process.env.SUPABASE_STORAGE_BUCKET);
// 실제 게시글 크롤링 및 업로드 자동화 스크립트
// 1. 가상 유저 10명 생성 및 Supabase users 테이블에 삽입
// 2. 자유게시판/사용후기: faker로 랜덤 게시글 생성
// 3. 모바일 정보: BBC 기사 크롤링
// 4. 유머 게시판: 이토랜드 유머글 크롤링, 이미지 1장 다운로드→Storage 업로드→URL 저장
// 5. 모든 게시글 posts 테이블에 삽입

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
  email: string;
  nickname: string;
  role: 'user' | 'admin';
  created_at: string;
}

interface FakePost {
  id: string;
  user_id: string;
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

// 자유게시판 샘플 데이터 확장 (일상/잡담/공감/고민 등)
const freeBoardSamples = [
  { title: "오늘 날씨가 너무 덥네요", content: "에어컨 없이 버티기 힘든 여름입니다. 다들 더위 어떻게 이기고 계신가요?" },
  { title: "퇴근길에 지하철에서 있었던 일", content: "오늘 퇴근길에 지하철에서 우연히 친구를 만났어요. 신기하네요!" },
  { title: "아침에 일어나기 너무 힘들다", content: "요즘 왜 이렇게 아침에 일어나기 힘든지 모르겠어요. 다들 기상 팁 있나요?" },
  { title: "동네 산책하다가 강아지랑 놀았어요", content: "산책하다가 귀여운 강아지를 만났는데 기분이 좋아졌어요." },
  { title: "오늘 점심 뭐 드셨나요?", content: "저는 김치찌개 먹었는데 너무 맛있었어요. 다들 점심 뭐 드셨나요?" },
  { title: "휴대폰 바꿀 때 꿀팁 공유해요", content: "최근에 휴대폰 바꿨는데, 온라인으로 사면 훨씬 저렴하더라고요. 다들 참고하세요!" },
  { title: "동네 맛집 추천 좀 해주세요", content: "근처에 괜찮은 식당 있으면 추천 부탁드려요!" },
  { title: "요즘 볼만한 드라마 뭐 있나요?", content: "재밌게 본 드라마 있으면 추천 좀 해주세요." },
  { title: "휴대폰 액정 필름 직접 붙이시나요?", content: "셀프로 붙이려다 망했어요... 다들 어떻게 하시나요?" },
  { title: "데이터 무제한 요금제 쓰시는 분?", content: "실제로 데이터 얼마나 쓰시나요? 무제한 요금제 만족하시나요?" },
  { title: "중고폰 거래할 때 주의할 점", content: "사기 안 당하려면 어떤 점을 꼭 확인해야 할까요?" },
  { title: "통신사 멤버십 혜택 뭐가 제일 쓸만한가요?", content: "실제로 써보신 분들 후기 궁금합니다." },
  { title: "휴대폰 배터리 오래 쓰는 팁", content: "충전 습관이나 설정 팁 있으면 공유해 주세요!" },
  { title: "폰케이스 어디서 사세요?", content: "저렴하고 예쁜 곳 있으면 추천 부탁드려요." },
  { title: "오늘 운동하신 분?", content: "저는 오늘 만보 걷기 성공했습니다! 다들 운동 하시나요?" },
  { title: "주말에 뭐 하실 계획이신가요?", content: "저는 집에서 넷플릭스 볼 예정입니다. 추천작 있으면 알려주세요!" },
  { title: "요즘 취미로 뭐 하세요?", content: "저는 요즘 퍼즐 맞추기에 빠졌어요. 다들 취미 뭐 있으신가요?" },
  { title: "아침에 커피 꼭 드시나요?", content: "저는 커피 없으면 하루가 안 시작돼요. 다들 어떠신가요?" },
  { title: "휴대폰 사진 정리 어떻게 하세요?", content: "사진이 너무 많아서 정리가 힘드네요. 좋은 방법 있나요?" },
  { title: "오늘 하루 어땠나요?", content: "저는 평범했지만 소소하게 행복한 하루였어요. 다들 오늘 어땠나요?" },
  // ... 더 다양한 샘플 추가 가능 ...
];

// 자유게시판 댓글 샘플 데이터
const freeBoardCommentSamples = [
  "저도 오늘 너무 더웠어요!",
  "공감합니다 ㅠㅠ",
  "저는 아침에 알람 여러 개 맞춰요.",
  "강아지 너무 귀엽네요!",
  "저도 김치찌개 좋아해요!",
  "좋은 정보 감사합니다.",
  "저도 비슷한 경험 있어요.",
  "넷플릭스 추천: 슬기로운 의사생활!",
  "저는 요즘 독서에 빠졌어요.",
  "운동은 역시 걷기가 최고죠.",
  "저는 필름 붙이는 거 포기했어요.",
  "저도 멤버십 혜택 궁금했는데 참고할게요.",
  "사진 정리 앱 추천해요!",
  "오늘 하루도 수고 많으셨어요.",
  "저는 커피 대신 차 마셔요.",
  "맛집 정보 감사합니다!",
  "저도 중고폰 거래할 때 조심해요.",
  "저는 주말에 등산 갈 예정입니다.",
  "취미 공유해주셔서 감사해요.",
  "다들 힘내세요!",
];

// 이용후기 게시판 샘플 데이터 (사이트 이용후기 스타일)
const reviewBoardSamples = [
  { title: "폰8이지 덕분에 중고폰 판매가 쉬웠어요!", content: "빠른 상담과 친절한 안내 덕분에 걱정 없이 거래했습니다. 추천합니다!" },
  { title: "처음엔 반신반의했는데, 정말 편리하네요.", content: "실제로 입금도 빠르고 과정도 투명해서 만족합니다." },
  { title: "사이트 UI가 직관적이라 초보자도 쉽게 이용할 수 있었어요.", content: "다른 곳보다 시세가 높게 나와서 좋았습니다. 다음에도 또 이용할게요." },
  { title: "상담원 답변이 빨라서 믿음이 갔어요.", content: "친구에게도 추천했습니다. 앞으로도 자주 이용할 것 같아요." },
  { title: "입금이 빨라서 놀랐어요.", content: "판매 후 바로 입금되어서 너무 편리했습니다." },
  { title: "친구 추천으로 가입했는데, 정말 만족합니다.", content: "처음 이용해봤는데 기대 이상이었어요." },
  { title: "시세 비교가 쉬워서 결정이 빨랐어요.", content: "여러 업체 비교할 필요 없이 한 번에 끝나서 좋았습니다." },
  { title: "믿고 맡길 수 있는 서비스, 추천합니다.", content: "다음에도 또 이용할 예정입니다." },
  { title: "상담원이 친절하게 안내해줘서 좋았습니다.", content: "모르는 부분도 자세히 설명해주셔서 안심하고 거래했어요." },
  { title: "사이트 이용이 간편해서 좋았어요.", content: "복잡한 절차 없이 쉽게 판매할 수 있었습니다." },
  // ... 더 다양한 후기 샘플 추가 가능 ...
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
    const email = faker.internet.email();
    const nickname = faker.internet.username();
    const role = faker.helpers.arrayElement(['user', 'admin']) as 'user' | 'admin';
    const now = new Date().toISOString();
    users.push({
      id,
      email,
      nickname,
      role,
      created_at: now,
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

// 자유게시판 댓글 생성 함수
async function createAndInsertRandomComments(postId: string, users: { id: string }[]) {
  const commentCount = Math.floor(Math.random() * 2) + 2; // 2~3개
  const comments = [];
  for (let i = 0; i < commentCount; i++) {
    const id = uuidv4();
    const user_id = getRandomUserId(users);
    const content = freeBoardCommentSamples[Math.floor(Math.random() * freeBoardCommentSamples.length)];
    const created_at = new Date().toISOString();
    comments.push({
      id,
      post_id: postId,
      user_id,
      content,
      created_at,
      updated_at: created_at,
    });
  }
  const { error } = await supabase.from('comments').insert(comments);
  if (error) {
    console.error('자유게시판 댓글 삽입 실패:', error);
    throw error;
  }
}

// 게시글 생성 함수 개선 (자유게시판이면 댓글도 생성)
async function createAndInsertRandomPosts(users: { id: string }[], boardType: string, count: number) {
  const posts: FakePost[] = [];
  for (let i = 0; i < count; i++) {
    const id = uuidv4();
    const user_id = getRandomUserId(users);
    let title = '', content = '';
    if (boardType === 'free') {
      const sample = freeBoardSamples[Math.floor(Math.random() * freeBoardSamples.length)];
      title = sample.title;
      content = sample.content;
    } else if (boardType === 'review') {
      const sample = reviewBoardSamples[Math.floor(Math.random() * reviewBoardSamples.length)];
      title = sample.title;
      content = sample.content;
    } else {
      title = '테스트 게시글';
      content = '테스트 내용';
    }
    const image_urls: string[] = getRandomImages();
    const video_url = null;
    const views = faker.number.int({ min: 0, max: 100 });
    const likes = faker.number.int({ min: 0, max: 30 });
    const is_notice = false;
    const created_at = new Date().toISOString();
    posts.push({
      id,
      user_id,
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

  // 자유게시판이면 각 게시글마다 댓글 2~3개 생성
  if (boardType === 'free') {
    const insertedPosts = (data && typeof data === 'object' && 'length' in data && Array.isArray(data)) ? data : posts;
    for (const post of insertedPosts) {
      await createAndInsertRandomComments(post.id, users);
    }
    console.log('자유게시판 댓글 자동 생성 완료');
  }
}

async function main() {
  // 1. users 테이블에서 email이 yahoo를 포함하는 유저만 불러오기
  const { data: users, error } = await supabase.from('users').select('id, email').ilike('email', '%yahoo%');
  if (error || !users || users.length === 0) {
    throw new Error('Yahoo 이메일을 가진 유저가 없습니다. 먼저 유저를 생성해 주세요.');
  }
  // 2. 자유게시판/사용후기: faker로 20개씩 랜덤 게시글 생성 및 삽입
  await createAndInsertRandomPosts(users, 'free', 20);
  await createAndInsertRandomPosts(users, 'review', 20);
  // TODO: 다음 단계 함수 호출
}

main().catch(console.error); 