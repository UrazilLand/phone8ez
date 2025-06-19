import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-headline text-primary">개인정보처리방침</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm sm:prose-base max-w-none text-foreground/90 space-y-4">
          <p>ProMobile Edge (이하 "회사")는 개인정보보호법에 따라 이용자의 개인정보 및 권익을 보호하고 개인정보와 관련한 이용자의 고충을 원활하게 처리할 수 있도록 다음과 같은 처리방침을 두고 있습니다.</p>

          <h2 className="font-semibold text-xl text-primary">제1조 (개인정보의 처리 목적)</h2>
          <p>회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.</p>
          <ol className="list-decimal pl-6 space-y-1">
            <li>홈페이지 회원 가입 및 관리: 회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증, 회원자격 유지·관리, 제한적 본인확인제 시행에 따른 본인확인, 서비스 부정이용 방지, 만 14세 미만 아동의 개인정보 처리 시 법정대리인의 동의여부 확인, 각종 고지·통지, 고충처리 등을 목적으로 개인정보를 처리합니다.</li>
            <li>서비스 제공: 콘텐츠 제공, 맞춤 서비스 제공, 요금결제·정산 등을 목적으로 개인정보를 처리합니다.</li>
            <li>마케팅 및 광고에의 활용: 신규 서비스(제품) 개발 및 맞춤 서비스 제공, 이벤트 및 광고성 정보 제공 및 참여기회 제공, 인구통계학적 특성에 따른 서비스 제공 및 광고 게재, 접속 빈도 파악 또는 회원의 서비스 이용에 대한 통계 등을 목적으로 개인정보를 처리합니다.</li>
          </ol>

          <h2 className="font-semibold text-xl text-primary">제2조 (처리하는 개인정보 항목)</h2>
          <p>회사는 다음의 개인정보 항목을 처리하고 있습니다.</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>필수항목: 이메일, 비밀번호, 닉네임</li>
            <li>선택항목: (구독 시) 결제 정보</li>
            <li>자동수집항목: IP주소, 쿠키, 서비스 이용 기록, 접속 로그</li>
          </ul>
          
          <p className="pt-4 text-sm text-muted-foreground">위 내용은 예시이며, 실제 서비스 운영 시 법률 전문가의 검토를 거쳐 완전한 개인정보처리방침을 마련해야 합니다.</p>
          <p className="font-semibold">최종 시행일: {new Date().toLocaleDateString('ko-KR')}</p>
        </CardContent>
      </Card>
    </div>
  );
}
