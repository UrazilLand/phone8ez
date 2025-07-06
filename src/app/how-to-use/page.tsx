"use client";

import { useState } from 'react';
import Image from 'next/image';

const howToUseSteps = [
  {
    title: '1. Phone8ez 사용 가이드',
    images: [
      '/img/howto1-1.png',
      '/img/howto1-2.png',
      '/img/howto1-3.png',
      '/img/howto1-4.png',
    ],
    descriptions: [
      '서로 다른 양식의 정책표 때문에 복잡하시죠?',
      '모델번호가 제각각이라도 상관없습니다.',
      '정책 데이터의 기본 규격만 맞춰주세요.',
      '모든 정책을 한눈에 보여드립니다. 지금 바로 시작해 보세요.',
    ],
  },
  {
    title: '2. 데이터 입력 가이드',
    images: [
      '/img/howto2-1.png',
      '/img/howto2-2.png',
      '/img/howto2-3.png',
      '/img/howto2-4.png',
      '/img/howto2-5.png',
      '/img/howto2-6.png',
      '/img/howto2-7.png',
      '/img/howto2-8.png',
      '/img/howto2-9.png',
      '/img/howto2-10.png',
      '/img/howto2-11.png',
      '/img/howto2-12.png',
      '/img/howto2-13.png',
      '/img/howto2-14.png',
      '/img/howto2-15.png',
      '/img/howto2-16.png',
      '/img/howto2-17.png'
    ],
    descriptions: [
      '정책 데이터의 본 규격을 맞추기 위해 엑셀의 간단한 기능을 알고 있으면 좋습니다.',
      '불필요한 라인의 상단을 오른쪽 클릭한 뒤 메뉴에서 숨기기를 통해 데이터를 정리해주세요.',
      '홈페이지 상단에서 Dashboard 버튼을 클릭하여 대시보드 데이터 입력 탭으로 들어갑니다.',
      '엑셀 데이터에서 1열 모델번호, 2열부터 정책데이터를 한번에 복사해 주세요.',
      '대시보드 - 데이터 입력 페이지) 업체명 아래 셀을 클릭 후 붙여넣기 해주세요.',
      '시트 오른쪽 상단에 데이터 입력 버튼을 클릭하여 데이터 입력 창을 열어주세요.',
      '다시 엑셀 정책표로 돌아가서 요금제 라인을 선택 후 복사합니다.',
      '요금제 분류 라인에 붙여넣기하면, 자동 분류됩니다. 분류된 요금제를 수정해 주세요.(짧게 만드세요.)',
      '요금제와 업체명은 동일한 방식을 지원하며, 직접 입력하거나 수정할 수 있습니다.',
      '항목마다 반복되는 열만큼 반복횟수를 입력해주세요. (순서변경 가능)',
      '적용버튼을 누르면 데이터가 입력됩니다. 반복된 데이터가 남아있다면 지워도 됩니다.(안지워도 무관)',
      '시트 상단에 저장하기 버튼을 누르고, 저장합니다. 이름은 구분을 위해 통신사+업체명이 좋습니다.',
      '저장된 데이터는 홈페이지 상단에 있는 데이터 목록에서 확인할 수 있습니다.',
      '시트초기화 버튼을 통해 시트를 비워줍니다.',
      '다양한 형식의 데이터를 설정할 수 있습니다. 추가 정책을 입력하세요.',
      '데이터는 해당 이름으로 된 버튼을 더블클릭하면 확인할 수 있습니다.',
      '미리보기 창을 통해 입력된 데이터를 확인할 수 있습니다.',
    ],
  },
  {
    title: '3. 통합 데이터 검색 가이드',
    images: [
      '/img/howto3-1.png',
      '/img/howto3-2.png',
      '/img/howto3-3.png',
      '/img/howto3-4.png',
      '/img/howto3-5.png',
      '/img/howto3-6.png',
      '/img/howto3-7.png',
      '/img/howto3-8.png',
      '/img/howto3-9.png',
      '/img/howto3-10.png',
      '/img/howto3-11.png',
      '/img/howto3-12.png',
      '/img/howto3-13.png',
      '/img/howto3-14.png',
      '/img/howto3-15.png',
      '/img/howto3-16.png',
      '/img/howto3-17.png',
      '/img/howto3-18.png',
      '/img/howto3-19.png',
      '/img/howto3-20.png',
      '/img/howto3-21.png'
    ],
    descriptions: [
      '통합데이터를 입력하기 전 공시데이터를 가져오기 위해 공시 버튼을 클릭합니다.',
      '최신 데이터 불러오기 버튼을 클릭해 공시지원금 정보를 가져옵니다. (최근 2년 내의 정보를 불러옵니다.)',
      '통합 데이터 탭을 클릭 후 데이터 선택 버튼을 눌러주세요.',
      '1열에서 업체명을 선택하면 데이터 입력 탭에서 저장한 데이터의 요금제가 보여집니다.',
      '보고싶은 요금제를 선택하고 표준 월 요금제를 선택해주세요. 월 요금제는 공시 지원금을 가져오는 기준이 됩니다.',
      '상단에서 통신사를 변경할 수 있고, 업체명 마다 요금제를 설정해 주세요. (5G 월 요금제는 필수, LTE 월 요금제는 선택.)',
      '선택 완료를 누르면, 선택된 업체의 선택된 모든 정보를 자동으로 불러옵니다.',
      '1열의 빈 공간을 더블클릭하면 휴대폰 모델을 선택할 수 있는 창이 나옵니다.',
      '휴대폰 모델번호는 업체마다 다르게 설정되더라도 검색을 통해 통합할 수 있습니다.',
      '검색할 주요 모델번호 부분과 띄어쓰기 후 용량을 입력할 수 있습니다. (예: F941)',
      '정책 데이터 입력 탭에서 저장한 모델번호 중 해당되는 모든 모델번호를 선택해야 합니다.',
      '검색 결과에 따라 표준 모델번호도 자동 분류되며, 표준 모델번호는 공시지원금을 불러오는 기준이 됩니다.',
      '표준 모델번호 선택 시 모델명과 출고가가 자동으로 불러와 지며, 직접 수정할 수 있습니다.',
      '저장 버튼을 누르면 통합 데이터 시트에 분류된 정보를 불러옵니다.',
      '나열할 모델명을 입력합니다. 또한 모델명을 클릭하면 자세한 정보를 볼 수 있습니다.',
      '사용자 선택에 따라 부가서비스 정보를 입력할 수 있습니다.',
      '업체명을 선택 후 부가서비스 명, 할인금액을 입력해주세요. 자동 합산되어 반영됩니다.',
      '저장 버튼 클릭 시 상단의 카드에 부가서비스 정보가 저장됩니다.',
      '금액을 클릭하면 자세한 정보를 볼 수 있으며, 통신사마다 가입유형 별 최저가를 표시해 줍니다.',
      '해당 열의 통신사 부분을 클릭하여 불필요한 열을 삭제할 수 있습니다.',
      '저장하기 버튼을 눌러 통합 데이터를 저장하고, 저장된 정보를 확인해 주세요.'
    ],
  },
  {
    title: '4. 구독 모델 기능 가이드',
    images: [
      '/img/howto4-1.png',
      '/img/howto4-2.png',
      '/img/howto4-3.png',
      '/img/howto4-4.png',
      '/img/howto4-5.png',
      '/img/howto4-6.png',
      '/img/howto4-7.png',
      '/img/howto4-8.png',
      '/img/howto4-9.png',
      '/img/howto4-10.png',
      '/img/howto4-11.png',
      '/img/howto4-12.png',
      '/img/howto4-13.png',
      '/img/howto4-14.png',
      '/img/howto4-15.png'
    ],
    descriptions: [
      '모델별 데이터 탭을 클릭하고, 모델 선택 드롭박스를 클릭하여 모델을 선택합니다.',
      '모델 목록은 통합 데이터에서 지정된 모델번호를 통해 자동으로 불러옵니다.',
      '선택한 모델별로 세부 내용을 한눈에 확인할 수 있습니다.',
      '모델을 선택한 상태로 공시 지원금 버튼을 눌러 공시지원금 정보를 불러옵니다.',
      '공시 지원금 창에서 해당 모델의 모든 지원금 내용과 선택약정 금액을 비교할 수 있습니다.',
      '데이터는 사이트 내부에 저장되지 않습니다. 구독 시 데이터 다운로드 및 Cloud 업로드를 통해 데이터를 저장할 수 있습니다.',
      '다운로드 폴더에 phone8ez_저장일시.json파일을 확인하세요.',
      '데이터 업로드 버튼을 눌러 저장한 데이터를 불러올 수 있습니다.',
      '다운로드 받았던 파일을 선택하여 업로드 해주세요.',
      '데이터 업로드가 완료되면 통합 버튼을 더블클릭해서 미리보기를 열어주세요.',
      '불러오기 버튼을 통해 선택했던 데이터를 한번에 불러올 수 있습니다.',
      '데이터를 수정하면 반드시 저장 버튼을 눌러 데이터를 저장해주세요.',
      '구독 이용자는 페이지 오른쪽 상단에서 다크모드를 선택할 수 있습니다.',
      '다크모드를 통해 눈의 피로를 줄일 수 있습니다.',
      '모든 페이지에 커스텀 다크모드를 적용할 수 있습니다.'
    ],
  },
  {
    title: '5. 동영상 가이드',
    videos: [
      'https://www.youtube.com/embed/GLs7U2jrITg',
      'https://www.youtube.com/embed/UuaoCJgtErk',
    ],
    descriptions: [
      '데이터를 입력하는 방법을 영상으로 확인하세요.',
      '통합 데이터를 설정하는 방법을 영상으로 확인하세요.'
    ],
  },
];

export default function HowToUsePage() {
  const [openIdx, setOpenIdx] = useState(-1);
  const [imgIdx, setImgIdx] = useState(Array(howToUseSteps.length).fill(0));

  const handleAccordion = (idx: number) => {
    setOpenIdx(idx === openIdx ? -1 : idx);
  };

  const handleImgNav = (stepIdx: number, dir: number) => {
    setImgIdx((prev) => {
      const arr = [...prev];
      const imgs = howToUseSteps[stepIdx].images || [];
      const videos = howToUseSteps[stepIdx].videos || [];
      const totalItems = imgs.length > 0 ? imgs.length : videos.length;
      if (totalItems === 0) return arr;
      arr[stepIdx] = (arr[stepIdx] + dir + totalItems) % totalItems;
      return arr;
    });
  };

  return (
    <div className="max-w-6xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-blue-500 mb-4">
          Phone8ez 사용 방법
        </h1>
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
                    <div className="relative w-full max-w-5xl h-[500px] bg-white rounded-xl flex items-center justify-center overflow-hidden shadow-inner">
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
                  <div className="flex flex-col items-center mb-8">
                    <div className="relative w-full max-w-5xl aspect-video bg-background rounded-xl flex items-center justify-center overflow-hidden shadow-inner">
                      <div className="w-full h-full">
                        <iframe
                          src={step.videos[imgIdx[idx]]}
                          title={`사용법 동영상 ${imgIdx[idx] + 1}`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full"
                        />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-center space-x-4">
                      <button
                        className="bg-card/80 rounded-full p-3 shadow-lg hover:bg-muted transition-colors duration-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImgNav(idx, -1);
                        }}
                        aria-label="이전 동영상"
                        type="button"
                      >
                        ◀
                      </button>
                      <div className="text-sm font-medium text-muted-foreground">
                        {imgIdx[idx] + 1} / {step.videos.length}
                      </div>
                      <button
                        className="bg-card/80 rounded-full p-3 shadow-lg hover:bg-muted transition-colors duration-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImgNav(idx, 1);
                        }}
                        aria-label="다음 동영상"
                        type="button"
                      >
                        ▶
                      </button>
                    </div>
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

export const metadata = {
  title: 'Phone8ez - 사용 방법',
  description: 'Phone8ez 서비스의 사용 방법을 단계별로 안내합니다.',
  openGraph: {
    title: 'Phone8ez - 사용 방법',
    description: 'Phone8ez 서비스의 사용 방법을 단계별로 안내합니다.',
    url: 'https://phone8ez.com/how-to-use',
    images: ['/og-image.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Phone8ez - 사용 방법',
    description: 'Phone8ez 서비스의 사용 방법을 단계별로 안내합니다.',
    images: ['/og-image.png'],
  },
};
