import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from 'next/link';
import { UserPlus } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

export default function SignupPage() {
  return (
    <div className="flex justify-center items-center py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <UserPlus className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-3xl font-headline">회원가입</CardTitle>
          <CardDescription>Phone8ez에 가입하고 다양한 혜택을 누리세요.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">이메일 주소</Label>
            <Input id="email" type="email" placeholder="your@email.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input id="password" type="password" placeholder="********" required />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="terms" />
            <Label htmlFor="terms" className="text-xs">이용약관 및 개인정보처리방침에 동의합니다.</Label>
          </div>
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
            회원가입
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
