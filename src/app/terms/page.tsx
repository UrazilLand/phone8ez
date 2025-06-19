import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-primary">이용약관</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm sm:prose-base max-w-none text-foreground/90 space-y-4">
          <h2 className="font-semibold text-xl text-primary">제1조 (목적)</h2>
          <p>본 약관은 ProMobile Edge (이하 "회사")가 제공하는 Phone8ez 서비스 (이하 "서비스")의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.</p>

          <h2 className="font-semibold text-xl text-primary">제2조 (용어의 정의)</h2>
          <p>본 약관에서 사용하는 용어의 정의는 다음과 같습니다.</p>
          <ol className="list-decimal pl-6 space-y-1">
            <li>"서비스"라 함은 회사가 제공하는 Phone8ez 웹사이트 및 관련 제반 서비스를 의미합니다.</li>
            <li>"회원"이라 함은 본 약관에 따라 회사와 이용계약을 체결하고 회사가 제공하는 서비스를 이용하는 고객을 말합니다.</li>
            <li>"아이디(ID)"라 함은 회원의 식별과 서비스 이용을 위하여 회원이 정하고 회사가 승인하는 문자와 숫자의 조합을 의미합니다.</li>
            <li>"비밀번호"라 함은 회원이 부여 받은 아이디와 일치되는 회원임을 확인하고 비밀보호를 위해 회원 자신이 정한 문자 또는 숫자의 조합을 의미합니다.</li>
            <li>"게시물"이라 함은 회원이 서비스를 이용함에 있어 서비스상에 게시한 부호ㆍ문자ㆍ음성ㆍ화상ㆍ동영상 등의 정보 형태의 글, 사진, 동영상 및 각종 파일과 링크 등을 의미합니다.</li>
          </ol>
          
          <h2 className="font-semibold text-xl text-primary">제3조 (약관의 게시와 개정)</h2>
          <p>회사는 본 약관의 내용을 회원이 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다. 회사는 "약관의 규제에 관한 법률", "정보통신망 이용촉진 및 정보보호 등에 관한 법률(이하 "정보통신망법")" 등 관련법을 위배하지 않는 범위에서 본 약관을 개정할 수 있습니다. (이하 내용 생략)</p>
          
          <p className="pt-4 text-sm text-muted-foreground">위 내용은 예시이며, 실제 서비스 운영 시 법률 전문가의 검토를 거쳐 완전한 이용약관을 마련해야 합니다.</p>
          <p className="font-semibold">최종 수정일: {new Date().toLocaleDateString('ko-KR')}</p>
        </CardContent>
      </Card>
    </div>
  );
}
