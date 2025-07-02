import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from 'lucide-react';

export default function UserProfilePage() {
  return (
    <div className="flex justify-center items-center py-12">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center">
          <User className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-3xl font-headline">프로필 관리</CardTitle>
          <CardDescription>계정 정보를 관리하고 보안 설정을 변경하세요.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Clerk 관련 코드 삭제 */}
        </CardContent>
      </Card>
    </div>
  );
} 