import dynamic from 'next/dynamic';
const HowToUseClientSection = dynamic(() => import('./HowToUseClientSection'), { ssr: false });

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

export default function HowToUsePage() {
  return <HowToUseClientSection />;
}
