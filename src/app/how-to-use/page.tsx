"use client";

import { useState } from 'react';
import Image from 'next/image';

const howToUseSteps = [
  {
    title: '1. 데이터 업로드',
    images: [
      '/img/howto1-1.png',
      '/img/howto1-2.png',
      '/img/howto1-3.png',
      '/img/howto1-4.png',
      '/img/howto1-5.png'
    ],
    descriptions: [
      '설명1: 엑셀 정책표를 그대로 업로드하세요.',
      '설명2: 다양한 양식도 자동으로 인식합니다.',
      '설명3: 업로드된 데이터는 자동으로 정리됩니다.',
      '설명4: 대시보드에 실시간으로 표시됩니다.',
      '설명5: 데이터 검증이 자동으로 이루어집니다.'
    ],
  },
  {
    title: '2. 대시보드 확인',
    images: [
      '/img/howto2-1.png',
      '/img/howto2-2.png',
      '/img/howto2-3.png',
      '/img/howto2-4.png',
      '/img/howto2-5.png'
    ],
    descriptions: [
      '설명1: 통합된 데이터를 한눈에 확인하세요.',
      '설명2: 필요한 정보를 빠르게 찾을 수 있습니다.',
      '설명3: 데이터 분석이 자동으로 이루어집니다.',
      '설명4: 시각화된 차트로 쉽게 이해할 수 있습니다.',
      '설명5: 실시간 업데이트로 최신 정보를 확인하세요.'
    ],
  },
  {
    title: '3. 결과 다운로드',
    images: [
      '/img/howto3-1.png',
      '/img/howto3-2.png',
      '/img/howto3-3.png',
      '/img/howto3-4.png',
      '/img/howto3-5.png'
    ],
    descriptions: [
      '설명1: 정리된 데이터를 엑셀로 다운로드하세요.',
      '설명2: 다양한 형식으로 내보내기가 가능합니다.',
      '설명3: 필요한 데이터만 선택하여 다운로드하세요.',
      '설명4: 자동 포맷팅으로 바로 사용할 수 있습니다.',
      '설명5: 대량 데이터도 빠르게 처리됩니다.'
    ],
  },
  {
    title: '4. 커뮤니티 활용',
    images: [
      '/img/howto4-1.png',
      '/img/howto4-2.png',
      '/img/howto4-3.png',
      '/img/howto4-4.png',
      '/img/howto4-5.png'
    ],
    descriptions: [
      '설명1: 전문가 커뮤니티에서 노하우를 공유하세요.',
      '설명2: 궁금한 점을 빠르게 해결할 수 있습니다.',
      '설명3: 다양한 사용자들의 경험을 배우세요.',
      '설명4: 실시간으로 도움을 받을 수 있습니다.',
      '설명5: 커뮤니티 활동으로 포인트를 적립하세요.'
    ],
  },
  {
    title: '5. 동영상 가이드',
    videos: [
      'https://www.youtube.com/embed/dQw4w9WgXcQ',
      'https://www.youtube.com/embed/ysz5S6PUM-U',
    ],
    descriptions: [
      '설명1: 기본 사용법을 영상으로 확인하세요.',
      '설명2: 고급 기능 활용법을 배우세요.'
    ],
  },
];

export default function HowToUsePage() {
  const [openIdx, setOpenIdx] = useState(0);
  const [imgIdx, setImgIdx] = useState(Array(howToUseSteps.length).fill(0));

  const handleAccordion = (idx: number) => {
    setOpenIdx(idx === openIdx ? -1 : idx);
  };

  const handleImgNav = (stepIdx: number, dir: number) => {
    setImgIdx((prev) => {
      const arr = [...prev];
      const imgs = howToUseSteps[stepIdx].images || [];
      if (imgs.length === 0) return arr;
      arr[stepIdx] = (arr[stepIdx] + dir + imgs.length) % imgs.length;
      return arr;
    });
  };

  return (
    <div className="max-w-6xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-4">
          Phone8ez 사용 방법
        </h1>
        <p className="text-lg md:text-xl text-primary/80 max-w-2xl mx-auto">
          단 5단계로 시작하는 Phone8ez!
        </p>
      </div>

      <div className="space-y-6">
        {howToUseSteps.map((step, idx) => (
          <div 
            key={idx} 
            className={`rounded-2xl shadow-lg border bg-card overflow-hidden transition-all duration-300 hover:shadow-xl ${
              openIdx === idx ? 'ring-2 ring-primary/50' : 'border-border'
            }`}
          >
            <button
              className={`w-full text-left px-12 py-8 flex items-center justify-between focus:outline-none transition-all duration-300 ${
                openIdx === idx ? 'bg-primary/10' : 'hover:bg-muted/50'
              }`}
              onClick={() => handleAccordion(idx)}
            >
              <div className="flex items-center space-x-4">
                <span className={`text-2xl font-bold text-primary`}>
                  {step.title}
                </span>
              </div>
              <span className={`text-xl transition-transform duration-300 ${
                openIdx === idx ? 'rotate-0 text-muted-foreground' : 'rotate-180 text-primary'
              }`}>
                ▼
              </span>
            </button>

            {openIdx === idx && (
              <div className="px-12 pb-12 pt-6 animate-fade-in">
                {/* 이미지 슬라이더 */}
                {step.images && step.images.length > 0 && (
                  <div className="flex flex-col items-center mb-8">
                    <div className="relative w-full max-w-5xl h-[500px] bg-background rounded-xl flex items-center justify-center overflow-hidden shadow-inner">
                      <button
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-card/80 rounded-full p-3 shadow-lg hover:bg-muted transition-colors duration-200 z-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImgNav(idx, -1);
                        }}
                        aria-label="이전 이미지"
                        type="button"
                      >
                        ◀
                      </button>
                      <Image
                        src={step.images[imgIdx[idx]]}
                        alt={step.title + ' 이미지'}
                        fill
                        className="object-contain p-4"
                        sizes="(max-width: 768px) 100vw, 800px"
                      />
                      <button
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-card/80 rounded-full p-3 shadow-lg hover:bg-muted transition-colors duration-200 z-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImgNav(idx, 1);
                        }}
                        aria-label="다음 이미지"
                        type="button"
                      >
                        ▶
                      </button>
                    </div>
                    <div className="mt-4 text-sm font-medium text-muted-foreground">
                      {imgIdx[idx] + 1} / {step.images.length}
                    </div>
                  </div>
                )}

                {/* 동영상 embed */}
                {step.videos && step.videos.length > 0 && (
                  <div className="space-y-6 mb-6">
                    {step.videos.map((url, vIdx) => (
                      <div key={vIdx} className="aspect-video w-full max-w-4xl mx-auto rounded-xl overflow-hidden shadow-lg border">
                        <iframe
                          src={url}
                          title={`사용법 동영상 ${vIdx + 1}`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* 설명 */}
                <div className="mt-6 text-lg text-center font-pretendard leading-relaxed text-foreground">
                  {step.descriptions[imgIdx[idx]]}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
