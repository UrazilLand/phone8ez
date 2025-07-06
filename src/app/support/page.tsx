"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, MessageSquare, Phone, Send, HelpCircle, ChevronDown, Plus } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient';
import dayjs from 'dayjs';

const faqItems = [
  {
    question: 'Phone8ez는 어떤 서비스인가요?',
    answer: 'Phone8ez는 모바일 판매 전문가를 위한 데이터 분석 및 관리 플랫폼입니다. 엑셀 정책표를 자동으로 정리하고, 직관적인 대시보드를 통해 데이터를 쉽게 분석할 수 있습니다.'
  },
  {
    question: '서비스 이용 방법은 어떻게 되나요?',
    answer: '엑셀 정책표를 붙여넣기하면 데이터가 정리하여 대시보드에 통합 할 수 있습니다. 통합된 데이터를 한눈에 확인할 수 있습니다.'
  },
  {
    question: '결제는 어떻게 하나요?',
    answer: '신용카드, 계좌이체 등 다양한 결제 방식을 지원합니다. 결제 관련 문의는 고객센터로 연락해 주세요.'
  },
  {
    question: '무료 체험 기간이 있나요?',
    answer: '네, 7일 무료 체험 기간을 제공합니다. 신용카드 정보 없이도 서비스를 체험해보실 수 있습니다.'
  },
  {
    question: '데이터는 안전하게 보관되나요?',
    answer: '데이터는 사용자 선택에 따라 직접 다운로드 하여 관리할 수 있습니다. 또한 Cloud 서비스를 통해 데이터를 안전하게 보관할 수 있습니다.'
  },
  {
    question: '구독 혜택은 어떻게 되나요?',
    answer: '구독 시 데이터를 무제한 등록할 수 있으며, 다운로드 및 업로드로 더 빠르게 이용하실 수 있습니다.'
  },
  {
    question: '환불 정책은 어떻게 되나요?',
    answer: '구독 시작 후 미 사용시 7일 이내 100% 환불이 가능합니다. 그 이후에는 남은 기간에 대해 일할 계산하여 환불해 드립니다.'
  }
];

// 문의 게시판 더미 데이터
const inquiryItems = [
  {
    title: '서비스 이용 중 오류가 발생했어요.',
    content: '이메일로 오류 내용을 보내주시면 빠르게 처리 해드립니다.'
  },
  {
    title: '결제했는데 어떻게 사용하나요?',
    content: '대시보드로 들어가시면 상단 구독 카드에 프로 플랜으로 표기되며, 즉시 모든 서비스를 이용할 수 있습니다.'
  },
  {
    title: '비밀번호를 잊어버렸어요.',
    content: '저희 사이트는 소셜로그인을 사용하고 있습니다. 비밀번호를 잊어버리셨다면 소셜 로그인 화면에서 비밀번호 찾기를 이용해 주세요.'
  },
  {
    title: '회원 탈퇴는 어떻게 하나요?',
    content: '회원 탈퇴는 마이페이지 > 회원정보에서 탈퇴하실 수 있습니다.'
  },
  {
    title: '데이터 백업은 어떻게 하나요?',
    content: '데이터 백업은 구독 전용 기능입니다. 구독 후 데이터 백업을 이용하실 수 있습니다.'
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
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<{ plan: string; ends_at: string | null } | null>(null);
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<{ plan: string; email: string; nickname: string } | null>(null);

  // 구독 정보 및 사용자 정보 로드
  useEffect(() => {
    if (!user?.id) {
      setUserInfo(null);
      setSubscription(null);
      return;
    }
    let ignore = false;
    (async () => {
      // subscriptions에서 plan, email, nickname 조회
      const { data } = await supabase
        .from('subscriptions')
        .select('plan, email, nickname, ends_at')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!ignore) {
        setUserInfo(data ? { plan: data.plan, email: data.email, nickname: data.nickname } : null);
        setSubscription(data ? { plan: data.plan, ends_at: data.ends_at } : null);
      }
    })();
    return () => { ignore = true; };
  }, [user?.id]);

  useEffect(() => {
    if (userInfo) {
      setFormData(prev => ({
        ...prev,
        email: userInfo.email ?? '',
        name: userInfo.nickname ?? '',
      }));
    }
  }, [userInfo]);

  let isPro = false;
  if (subscription && subscription.plan === 'pro' && subscription.ends_at) {
    const now = dayjs();
    const ends = dayjs(subscription.ends_at);
    if (ends.isAfter(now)) {
      isPro = true;
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      let subject = formData.subject;
      if (userInfo?.plan) {
        subject = `[${userInfo.plan}] ${subject}`;
      }
      const res = await fetch('/api/send-support-mail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, subject }),
      });
      if (res.ok) {
        alert('문의가 정상적으로 접수되었습니다.');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        alert('메일 전송에 실패했습니다.');
      }
    } catch (err) {
      alert('메일 전송 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
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

      {/* FAQ + 이메일 문의 2단 배치 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-16">
        <div className="md:col-span-3">
          <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 border-blue-100 dark:border-gray-700 shadow min-h-[500px] h-full overflow-hidden flex flex-col justify-start">
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
        <div className="md:col-span-2">
          <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 border-blue-100 dark:border-gray-700 shadow h-full flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="text-2xl font-headline text-blue-700 dark:text-blue-400">이메일 문의</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-gray-900 dark:text-gray-100">닉네임 또는 이름</label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="border-blue-100 dark:border-gray-600 focus:border-blue-400 dark:focus:border-blue-400 focus:ring-blue-400 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    required
                    readOnly={!!userInfo?.nickname}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-900 dark:text-gray-100">소셜 이메일 주소</label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="border-blue-100 dark:border-gray-600 focus:border-blue-400 dark:focus:border-blue-400 focus:ring-blue-400 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    required
                    readOnly={!!userInfo?.email}
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
                  <label htmlFor="message" className="text-sm font-medium text-gray-900 dark:text-gray-100">문의 내용</label>
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
                  disabled={loading}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {loading ? '전송 중...' : '이메일 문의'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
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
