'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, X, Upload, Image as ImageIcon } from 'lucide-react';
import { BOARD_CATEGORIES } from '@/types/board';
import { useToast } from '@/hooks/use-toast';
import { use } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface WritePageProps {
  params: Promise<{
    category: string;
  }>;
}

export default function WritePage({ params }: WritePageProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  const { category } = use(params);
  
  // DB에서 허용하는 카테고리만 사용
  const allowedCategories = [
    { id: 'free', name: '자유게시판' },
    { id: 'funny', name: '유머게시판' },
    { id: 'mobile-info', name: '모바일정보' },
    { id: 'review', name: '사용후기' },
  ];
  const initialCategory = allowedCategories.map(c => c.id).includes(category) ? category : 'free';

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [boardType, setBoardType] = useState(initialCategory);
  const [videoUrl, setVideoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 로그인 상태 확인
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setIsLoggedIn(true);
          setUser(user);
        } else {
          // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
          toast({
            title: "로그인 필요",
            description: "게시글을 작성하려면 로그인이 필요합니다.",
            variant: "destructive",
          });
          router.push('/auth/login?redirectTo=' + encodeURIComponent(window.location.pathname));
          return;
        }
      } catch (error) {
        console.error('인증 확인 오류:', error);
        router.push('/auth/login?redirectTo=' + encodeURIComponent(window.location.pathname));
        return;
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, toast]);

  const getCategoryName = (categoryId: string) => {
    return BOARD_CATEGORIES.find(cat => cat.id === categoryId)?.name || categoryId;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "제목 입력 필요",
        description: "제목을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: "내용 입력 필요",
        description: "내용을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          board_type: boardType,
          image_urls: JSON.stringify(imageUrls),
          video_url: videoUrl.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '게시글 작성에 실패했습니다.');
      }

      const result = await response.json();
      
      toast({
        title: "게시글 작성 완료",
        description: "게시글이 성공적으로 작성되었습니다.",
      });

      // 작성된 게시글로 이동
      router.push(`/board/${boardType}/${result.id}`);
    } catch (error) {
      console.error('게시글 작성 오류:', error);
      toast({
        title: "작성 실패",
        description: error instanceof Error ? error.message : '게시글 작성에 실패했습니다.',
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (title.trim() || content.trim()) {
      if (confirm('작성 중인 내용이 있습니다. 정말 나가시겠습니까?')) {
        router.back();
      }
    } else {
      router.back();
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // 파일 크기 및 형식 검증
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (file.size > maxSize) {
        toast({
          title: "파일 크기 초과",
          description: `${file.name}의 크기가 5MB를 초과합니다.`,
          variant: "destructive",
        });
        continue;
      }

      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "지원하지 않는 파일 형식",
          description: `${file.name}은 지원하지 않는 파일 형식입니다.`,
          variant: "destructive",
        });
        continue;
      }
    }

    // 이미지 개수 제한 (최대 5개)
    if (imageUrls.length + files.length > 5) {
      toast({
        title: "이미지 개수 초과",
        description: "이미지는 최대 5개까지 첨부할 수 있습니다.",
        variant: "destructive",
      });
      return;
    }

    try {
      // 실제 업로드 로직은 Cloudflare R2 연동 시 구현
      // 현재는 임시로 로컬 URL 사용
      const newUrls = Array.from(files).map(file => URL.createObjectURL(file));
      setImageUrls(prev => [...prev, ...newUrls]);
      
      toast({
        title: "이미지 추가 완료",
        description: `${files.length}개의 이미지가 추가되었습니다.`,
      });
    } catch (error) {
      console.error('이미지 업로드 오류:', error);
      toast({
        title: "이미지 업로드 실패",
        description: "이미지 업로드에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveImage = (idx: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== idx));
  };

  // 로딩 중이거나 로그인하지 않은 경우
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null; // 리다이렉트 중이므로 아무것도 렌더링하지 않음
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            뒤로가기
          </Button>
          <div>
            <h1 className="text-2xl font-bold">게시글 작성</h1>
            <p className="text-muted-foreground">
              {getCategoryName(boardType)}에 새로운 게시글을 작성합니다.
            </p>
          </div>
        </div>

        {/* 작성 폼 */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>게시글 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 게시판 선택 */}
              <div className="space-y-2">
                <Label htmlFor="board-type">게시판</Label>
                <Select value={boardType} onValueChange={setBoardType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allowedCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 제목 */}
              <div className="space-y-2">
                <Label htmlFor="title">제목 *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="제목을 입력하세요"
                  maxLength={100}
                  required
                />
                <div className="text-sm text-muted-foreground text-right">
                  {title.length}/100
                </div>
              </div>

              {/* 내용 */}
              <div className="space-y-2">
                <Label htmlFor="content">내용 *</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="내용을 입력하세요"
                  rows={15}
                  required
                />
              </div>

              {/* 동영상 URL */}
              <div className="space-y-2">
                <Label htmlFor="video-url">동영상 URL (선택사항)</Label>
                <Input
                  id="video-url"
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                <p className="text-sm text-muted-foreground">
                  YouTube, Vimeo 등의 동영상 URL을 입력하세요.
                </p>
              </div>

              {/* 이미지 업로드 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>이미지 첨부 (최대 5개)</Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={imageUrls.length >= 5}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    이미지 선택
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageChange}
                />
                <p className="text-sm text-muted-foreground">
                  JPG, PNG, GIF, WebP 형식, 최대 5MB까지 업로드 가능합니다.
                </p>
                
                {/* 이미지 미리보기 */}
                {imageUrls.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {imageUrls.map((url, idx) => (
                      <div key={idx} className="relative w-24 h-24 border rounded overflow-hidden">
                        <img src={url} alt={`첨부 이미지 ${idx + 1}`} className="object-cover w-full h-full" />
                        <button
                          type="button"
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600"
                          onClick={() => handleRemoveImage(idx)}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 버튼 */}
              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  <X className="w-4 h-4 mr-2" />
                  취소
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !title.trim() || !content.trim()}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSubmitting ? '작성 중...' : '게시글 작성'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
} 