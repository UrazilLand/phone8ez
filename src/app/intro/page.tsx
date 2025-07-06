import IntroClientSection from './IntroClientSection';

export const metadata = {
  title: 'Phone8ez - 서비스 소개',
  description: 'Phone8ez 서비스의 주요 기능과 가치를 소개합니다.',
  openGraph: {
    title: 'Phone8ez - 서비스 소개',
    description: 'Phone8ez 서비스의 주요 기능과 가치를 소개합니다.',
    url: 'https://phone8ez.com/intro',
    images: ['/og-image.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Phone8ez - 서비스 소개',
    description: 'Phone8ez 서비스의 주요 기능과 가치를 소개합니다.',
    images: ['/og-image.png'],
  },
};

export default function IntroPage() {
  return <IntroClientSection />;
}
