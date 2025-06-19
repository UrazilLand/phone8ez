import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Megaphone } from 'lucide-react';

const NoticeWriteForm = () => {
  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-primary flex items-center">
          <Megaphone className="mr-2 h-6 w-6" /> 공지사항 작성
        </CardTitle>
        <CardDescription>사이트 전체 또는 특정 게시판에 공지를 등록합니다.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="notice-title">제목</Label>
          <Input id="notice-title" placeholder="공지사항 제목을 입력하세요." className="text-base" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="notice-content">내용</Label>
          <Textarea id="notice-content" placeholder="공지사항 내용을 입력하세요." rows={10} className="text-base" />
        </div>
        <div className="items-top flex space-x-2">
            <Checkbox id="pin-notice" />
            <div className="grid gap-1.5 leading-none">
                <Label
                htmlFor="pin-notice"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                게시판 상단에 고정
                </Label>
                <p className="text-xs text-muted-foreground">
                체크 시 이 공지사항이 게시판 목록 최상단에 항상 표시됩니다.
                </p>
            </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
          공지 등록
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NoticeWriteForm;
