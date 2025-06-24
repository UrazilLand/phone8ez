"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, MessageSquare, Phone, Send, HelpCircle, ChevronDown, Plus } from 'lucide-react';

const faqItems = [
  {
    question: 'Phone8ez는 어떤 서비스인가요?',
    answer: 'Phone8ez는 모바일 판매 전문가를 위한 데이터 분석 및 관리 플랫폼입니다. 엑셀 정책표를 자동으로 정리하고, 직관적인 대시보드를 통해 데이터를 쉽게 분석할 수 있습니다.'
  },
  {
    question: '서비스 이용 방법은 어떻게 되나요?',
    answer: '엑셀 정책표를 업로드하면 자동으로 데이터가 정리되어 대시보드에 표시됩니다. 분석된 데이터는 엑셀로 다운로드하여 활용할 수 있습니다.'
  },
  {
    question: '결제는 어떻게 하나요?',
    answer: '신용카드, 계좌이체 등 다양한 결제 방식을 지원합니다. 결제 관련 문의는 고객센터로 연락해 주세요.'
  },
  {
    question: '무료 체험 기간이 있나요?',
    answer: '네, 14일 무료 체험 기간을 제공합니다. 신용카드 정보 없이도 서비스를 체험해보실 수 있습니다.'
  },
  {
    question: '데이터는 안전하게 보관되나요?',
    answer: '네, 모든 데이터는 암호화되어 안전하게 보관됩니다. AWS 클라우드 서버를 사용하여 최고 수준의 보안을 제공합니다.'
  },
  {
    question: '엑셀 파일 형식에 제한이 있나요?',
    answer: 'xlsx, xls, csv 등 대부분의 엑셀 파일 형식을 지원합니다. 특수한 형식의 경우 고객센터로 문의해 주세요.'
  },
  {
    question: '환불 정책은 어떻게 되나요?',
    answer: '구독 시작 후 7일 이내 100% 환불이 가능합니다. 그 이후에는 남은 기간에 대해 일할 계산하여 환불해 드립니다.'
  }
];

// 문의 게시판 더미 데이터
const inquiryItems = [
  {
    title: '서비스 이용 중 오류가 발생했어요.',
    content: '서비스 이용 중 오류가 발생할 경우 고객센터로 문의해 주세요.'
  },
  {
    title: '결제 영수증은 어디서 확인하나요?',
    content: '마이페이지 > 결제내역에서 영수증을 확인하실 수 있습니다.'
  },
  {
    title: '비밀번호를 잊어버렸어요.',
    content: '로그인 화면에서 비밀번호 찾기를 이용해 주세요.'
  },
  {
    title: '회원 탈퇴는 어떻게 하나요?',
    content: '마이페이지 > 회원정보에서 탈퇴하실 수 있습니다.'
  },
  {
    title: '데이터 백업은 어떻게 하나요?',
    content: '설정 > 데이터 관리에서 백업 기능을 이용해 주세요.'
  }
];

export default function SupportPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement form submission
    console.log('Form submitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="max-w-6xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-blue-700 dark:text-blue-400 mb-4">
          고객지원
        </h1>
      </div>

      {/* FAQ 섹션 */}
      <div className="mb-16">
        <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 border-blue-100 dark:border-gray-700 shadow min-h-[500px] h-[550px] overflow-hidden flex flex-col justify-start">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-blue-700 dark:text-blue-400 flex items-center">
              <HelpCircle className="w-6 h-6 mr-2" />
              자주 묻는 질문 (FAQ)
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-start">
            <div className="space-y-2">
              {faqItems.map((item, index) => (
                <div 
                  key={index} 
                  className="border border-blue-100 dark:border-gray-700 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-blue-50/50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                  >
                    <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">{item.question}</h3>
                    <ChevronDown 
                      className={`w-4 h-4 text-blue-600 dark:text-blue-400 transition-transform duration-200 ${
                        openFaq === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openFaq === index && (
                    <div className="px-4 pb-3 animate-fade-in">
                      <p className="text-sm text-gray-700 dark:text-gray-300">{item.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-16">
        {/* 문의 게시판 카드 (3/5) */}
        <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 border-blue-100 dark:border-gray-700 shadow h-full min-h-[300px] flex flex-col md:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-2xl font-headline text-blue-700 dark:text-blue-400">문의 게시판</CardTitle>
            <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 text-sm flex items-center">
              <Plus className="w-4 h-4 mr-1" /> 문의하기
            </Button>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between p-0">
            {/* 아코디언 문의 목록 */}
            <div className="space-y-2 px-6 pt-2 flex-1">
              {inquiryItems.map((item, idx) => (
                <div key={idx} className="border border-blue-100 dark:border-gray-700 rounded-lg overflow-hidden">
                  <AccordionItem idx={idx} title={item.title} content={item.content} />
                </div>
              ))}
            </div>
            {/* 페이지네이션 - 항상 하단 고정 */}
            <div className="w-full px-6 py-4 border-t border-blue-100 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 flex justify-center items-center sticky bottom-0 z-10">
              <Pagination currentPage={1} totalPages={5} />
            </div>
          </CardContent>
        </Card>
        {/* 이메일 문의 카드 (2/5) */}
        <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 border-blue-100 dark:border-gray-700 shadow md:col-span-2 h-full flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-blue-700 dark:text-blue-400">이메일 문의</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-gray-900 dark:text-gray-100">이름</label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="border-blue-100 dark:border-gray-600 focus:border-blue-400 dark:focus:border-blue-400 focus:ring-blue-400 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-900 dark:text-gray-100">이메일</label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="border-blue-100 dark:border-gray-600 focus:border-blue-400 dark:focus:border-blue-400 focus:ring-blue-400 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium text-gray-900 dark:text-gray-100">제목</label>
                <Input
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="border-blue-100 dark:border-gray-600 focus:border-blue-400 dark:focus:border-blue-400 focus:ring-blue-400 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium text-gray-900 dark:text-gray-100">메시지</label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="min-h-[150px] border-blue-100 dark:border-gray-600 focus:border-blue-400 dark:focus:border-blue-400 focus:ring-blue-400 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
              >
                <Send className="w-4 h-4 mr-2" />
                이메일 문의
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// 아코디언 아이템 컴포넌트
function AccordionItem({ idx, title, content }: { idx: number; title: string; content: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-blue-50/50 dark:hover:bg-gray-700/50 transition-colors duration-200"
      >
        <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">{title}</h3>
        <ChevronDown
          className={`w-4 h-4 text-blue-600 dark:text-blue-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="px-4 pb-3 animate-fade-in">
          <p className="text-sm text-gray-700 dark:text-gray-300">{content}</p>
        </div>
      )}
    </div>
  );
}

// 페이지네이션 컴포넌트 (기본형)
function Pagination({ currentPage, totalPages }: { currentPage: number; totalPages: number }) {
  return (
    <div className="flex space-x-2">
      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i}
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border transition-colors duration-150 ${
            currentPage === i + 1
              ? 'bg-blue-600 dark:bg-blue-500 text-white border-blue-600 dark:border-blue-500'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-gray-700'
          }`}
        >
          {i + 1}
        </button>
      ))}
    </div>
  );
}
