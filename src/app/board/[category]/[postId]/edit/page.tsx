'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, X } from 'lucide-react';
import { Post, BOARD_CATEGORIES } from '@/types/board';
import { useToast } from '@/hooks/use-toast';
import { use } from 'react';
import { useAuth } from '@/lib/auth';

interface EditPageProps {
  params: Promise<{
    category: string;
    postId: string;
  }>;
}

export default function EditPage({ params }: EditPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const { category, postId } = use(params);
  
  const [post, setPost] = useState<Post | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [boardType, setBoardType] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getCategoryName = (categoryId: string) => {
    return BOARD_CATEGORIES.find(cat => cat.id === categoryId)?.name || categoryId;
  };

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/posts/${postId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          toast({
            title: "게시글을 찾을 수 없습니다",
            description: "삭제되었거나 존재하지 않는 게시글입니다.",
            variant: "destructive",
          });
          router.push(`/board/${category}`);
          return;
        }
        throw new Error('게시글을 불러오는데 실패했습니다.');
      }
      
      const data = await response.json();
      setPost(data);
      setTitle(data.title);
      setContent(data.content);
      setBoardType(data.board_type);
      setImageUrl(data.image_url || '');
      setVideoUrl(data.video_url || '');
    } catch (error) {
      console.error('게시글 조회 오류:', error);
      toast({
        title: "오류 발생",
        description: "게시글을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [postId]);

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
      
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          board_type: boardType,
          image_url: imageUrl.trim() || undefined,
          video_url: videoUrl.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '게시글 수정에 실패했습니다.');
      }

      toast({
        title: "수정 완료",
        description: "게시글이 성공적으로 수정되었습니다.",
      });

      // 수정된 게시글로 이동
      router.push(`/board/${boardType}/${postId}`);
    } catch (error) {
      console.error('게시글 수정 오류:', error);
      toast({
        title: "수정 실패",
        description: error instanceof Error ? error.message : '게시글 수정에 실패했습니다.',
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (title !== post?.title || content !== post?.content || 
        boardType !== post?.board_type || imageUrl !== (post?.image_url || '') || 
        videoUrl !== (post?.video_url || '')) {
      if (confirm('수정 중인 내용이 있습니다. 정말 나가시겠습니까?')) {
        router.back();
      }
    } else {
      router.back();
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">게시글을 불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">게시글을 찾을 수 없습니다</h2>
          <p className="text-muted-foreground mb-4">
            삭제되었거나 존재하지 않는 게시글입니다.
          </p>
          <Button onClick={() => router.push(`/board/${category}`)}>
            목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  // 권한 확인
  if (user?.email !== post.user?.email) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">권한이 없습니다</h2>
          <p className="text-muted-foreground mb-4">
            본인이 작성한 게시글만 수정할 수 있습니다.
          </p>
          <Button onClick={() => router.push(`/board/${category}/${postId}`)}>
            게시글로 돌아가기
          </Button>
        </div>
      </div>
    );
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
            <h1 className="text-2xl font-bold">게시글 수정</h1>
            <p className="text-muted-foreground">
              {getCategoryName(boardType)}의 게시글을 수정합니다.
            </p>
          </div>
        </div>

        {/* 수정 폼 */}
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
                    {BOARD_CATEGORIES.map((category) => (
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

              {/* 이미지 URL */}
              <div className="space-y-2">
                <Label htmlFor="image-url">이미지 URL (선택사항)</Label>
                <Input
                  id="image-url"
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
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
                  {isSubmitting ? '수정 중...' : '게시글 수정'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
} 