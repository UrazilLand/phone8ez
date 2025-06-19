"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';

const slides = [
  {
    title: '다양한 엑셀 정책표!',
    desc: '자동으로 정리하고 하나로 쉽게 보여드립니다.',
    img: '/slide1.png',
    alt: '엑셀 정책표 슬라이드',
  },
  {
    title: '붙여넣기만 하면 끝!',
    desc: '자동 통합 · 시각화 · 백업까지 단 한 번의 업로드로.',
    img: '/slide2.png',
    alt: '자동화 슬라이드',
  },
  {
    title: '서로 다른 양식을 하나로!',
    desc: '엑셀 양식 걱정 없이, 손쉽게 데이터를 정리합니다.',
    img: '/slide3.png',
    alt: '데이터 통합 슬라이드',
  },
  {
    title: '업무 효율 UP!',
    desc: '1시간 걸리던 작업을 10분 만에 끝내세요.',
    img: '/slide4.png',
    alt: '업무 효율화 슬라이드',
  },
  {
    title: '전략적 판매!',
    desc: '정책 데이터를 정확히 파악하고 비교하세요.',
    img: '/slide5.png',
    alt: '판매 전략 슬라이드',
  },
  {
    title: '누구나 쉽게, 전문가처럼!',
    desc: '복잡한 데이터도 직관적으로 다룰 수 있습니다.',
    img: '/slide6.png',
    alt: '사용자 경험 슬라이드',
  },
  {
    title: '이제는 자동화 시대!',
    desc: '서식 정리 없이 바로 분석 가능한 환경 제공.',
    img: '/slide7.png',
    alt: '자동화 시대 슬라이드',
  },
];

export default function MainVisualSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full max-w-7xl h-[450px] mx-auto overflow-hidden select-none">
      <div className="w-full h-full relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="flex transition-transform duration-500 h-full" style={{ transform: `translateX(-${current * 100}%)` }}>
            {slides.map((slide, idx) => (
              <div
                key={idx}
                className="pl-20 w-full flex-shrink-0 flex flex-col md:flex-row items-center rounded-2xl shadow-xl overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 h-full"
              >
                <div className="flex-1 flex flex-col justify-center items-start px-8 py-10 md:py-16 text-left text-white select-none min-h-[220px] h-full">
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">{slide.title}</h2>
                  <p className="text-base md:text-lg lg:text-xl font-medium opacity-90 mb-6">{slide.desc}</p>
                </div>
                <div className="flex-1 flex justify-center items-center p-6 md:p-10 min-w-[220px] min-h-[220px] h-full">
                  <div className="w-full h-0 pb-[56.25%] relative flex items-center justify-center">
                    <Image
                      src={slide.img}
                      alt={slide.alt}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* 인디케이터 */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 border-2 ${
              current === idx ? 'bg-white border-blue-700' : 'bg-blue-300 border-blue-200'
            }`}
            onClick={() => setCurrent(idx)}
            aria-label={`슬라이드 ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
