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
          <p>본 약관은 세컨드라이프 (이하 "회사")가 제공하는 Phone8ez 서비스 (이하 "서비스")의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.</p>

          <h2 className="font-semibold text-xl text-primary">제2조 (용어의 정의)</h2>
          <p>본 약관에서 사용하는 용어의 정의는 다음과 같습니다.</p>
          <ol className="list-decimal pl-6 space-y-1">
            <li>"서비스"라 함은 회사가 제공하는 Phone8ez 웹사이트 및 관련 제반 서비스를 의미합니다.</li>
            <li>"회원"이라 함은 본 약관에 따라 회사와 이용계약을 체결하고 회사가 제공하는 서비스를 이용하는 고객을 말합니다.</li>
            <li>"아이디(ID)"라 함은 회원의 식별과 서비스 이용을 위하여 회원이 정하고 회사가 승인하는 문자와 숫자의 조합을 의미합니다.</li>
            <li>"비밀번호"라 함은 회원이 부여 받은 아이디와 일치되는 회원임을 확인하고 비밀보호를 위해 회원 자신이 정한 문자 또는 숫자의 조합을 의미합니다.</li>
            <li>"게시물"이라 함은 회원이 서비스를 이용함에 있어 서비스상에 게시한 부호ㆍ문자ㆍ음성ㆍ화상ㆍ동영상 등의 정보 형태의 글, 사진, 동영상 및 각종 파일과 링크 등을 의미합니다.</li>
            <li>"구독 서비스"라 함은 회원이 월 이용료를 지불하고 이용하는 유료 서비스를 의미합니다.</li>
            <li>"무료 서비스"라 함은 회원이 이용료를 지불하지 않고 이용할 수 있는 기본 서비스를 의미합니다.</li>
          </ol>
          
          <h2 className="font-semibold text-xl text-primary">제3조 (약관의 게시와 개정)</h2>
          <p>회사는 본 약관의 내용을 회원이 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다. 회사는 "약관의 규제에 관한 법률", "정보통신망 이용촉진 및 정보보호 등에 관한 법률(이하 "정보통신망법")" 등 관련법을 위배하지 않는 범위에서 본 약관을 개정할 수 있습니다.</p>

          <h2 className="font-semibold text-xl text-primary">제4조 (서비스의 제공)</h2>
          <p>회사는 다음과 같은 서비스를 제공합니다.</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>무료 서비스:</strong> 데이터 입력 및 통합, 공시 지원금 자동 적용, 이메일 문의</li>
            <li><strong>구독 서비스:</strong> 모델별 데이터 상세보기, 로컬 및 Cloud 저장, 다크 모드 지원, 우선 고객 지원, 데이터 다운로드 기능</li>
          </ul>

          <h2 className="font-semibold text-xl text-primary">제5조 (서비스 이용)</h2>
          <p>서비스 이용은 회사의 업무상 또는 기술상 특별한 지장이 없는 한 연중무휴, 1일 24시간 운영을 원칙으로 합니다. 단, 회사는 서비스의 점검, 보수, 교체, 정기점검 등의 사유로 서비스의 제공을 일시적으로 중단할 수 있습니다.</p>

          <h2 className="font-semibold text-xl text-primary">제6조 (구독 서비스 및 결제)</h2>
          <p>구독 서비스 이용을 위해서는 회원이 회사가 제공하는 결제 수단을 통해 월 이용료를 지불해야 합니다.</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>구독 서비스 이용료는 월 19,900원입니다.</li>
            <li>결제는 PortOne(아임포트)을 통해 처리됩니다.</li>
            <li>구독은 결제일로부터 1개월간 유효하며, 자동으로 갱신됩니다.</li>
            <li>회원은 언제든지 구독을 해지할 수 있으며, 해지 시 다음 결제일부터 서비스가 중단됩니다.</li>
          </ul>

          <h2 className="font-semibold text-xl text-primary">제7조 (환불 및 취소)</h2>
          <p>구독 서비스의 환불 및 취소는 다음과 같이 처리됩니다.</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>결제 완료 후 7일 이내에는 전액 환불이 가능합니다.</li>
            <li>서비스 이용 시작(데이터 다운로드, 구독 혜택 사용 등) 이후에는 환불이 불가합니다.</li>
            <li>환불 요청은 고객센터(이메일/전화)로 접수해 주시기 바랍니다.</li>
            <li>결제 취소 및 환불은 영업일 기준 3일 이내 처리됩니다.</li>
          </ul>

          <h2 className="font-semibold text-xl text-primary">제8조 (데이터 저장 및 관리)</h2>
          <p>회원이 입력한 데이터의 저장 및 관리는 다음과 같이 처리됩니다.</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>무료 회원의 데이터는 브라우저 세션 동안만 저장되며, 브라우저 종료 시 자동 삭제됩니다.</li>
            <li>구독 회원의 데이터는 클라우드에 저장되며, 회원탈퇴 시까지 보관됩니다.</li>
            <li>회원은 언제든지 자신이 입력한 데이터를 삭제할 수 있습니다.</li>
            <li>회사는 서비스 개선을 위해 익명화된 데이터를 분석에 활용할 수 있습니다.</li>
          </ul>

          <h2 className="font-semibold text-xl text-primary">제9조 (회원의 의무)</h2>
          <p>회원은 다음 행위를 하여서는 안 됩니다.</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>신청 또는 변경 시 허위내용의 등록</li>
            <li>타인의 정보 도용</li>
            <li>회사가 게시한 정보의 변경</li>
            <li>회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
            <li>회사 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
            <li>회사 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
            <li>외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위</li>
          </ul>

          <h2 className="font-semibold text-xl text-primary">제10조 (회사의 의무)</h2>
          <p>회사는 관련법령과 이 약관이 금지하거나 공서양속에 반하는 행위를 하지 않으며 이 약관이 정하는 바에 따라 지속적이고, 안정적으로 서비스를 제공하기 위하여 노력합니다.</p>

          <h2 className="font-semibold text-xl text-primary">제11조 (개인정보보호)</h2>
          <p>회사는 관련법령이 정하는 바에 따라 회원의 개인정보를 보호하며, 개인정보의 보호 및 사용에 대해서는 관련법령 및 회사가 정하는 개인정보처리방침을 따릅니다.</p>

          <h2 className="font-semibold text-xl text-primary">제12조 (회원탈퇴 및 자격 상실)</h2>
          <p>회원은 회사에 언제든지 탈퇴를 요청할 수 있으며 회사는 즉시 회원탈퇴를 처리합니다. 회원이 다음 각호의 사유에 해당하는 경우, 회사는 회원자격을 제한 및 정지시킬 수 있습니다.</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>가입 신청 시에 허위 내용을 등록한 경우</li>
            <li>다른 사람의 서비스 이용을 방해하거나 그 정보를 도용하는 등 전자상거래 질서를 위협하는 경우</li>
            <li>서비스를 이용하여 법령 또는 이 약관이 금지하거나 공서양속에 반하는 행위를 하는 경우</li>
          </ul>

          <h2 className="font-semibold text-xl text-primary">제13조 (면책조항)</h2>
          <p>회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다. 회사는 회원의 귀책사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다.</p>

          <h2 className="font-semibold text-xl text-primary">제14조 (분쟁해결)</h2>
          <p>회사는 이용자가 제기하는 정당한 의견이나 불만을 반영하고 그 피해를 보상처리하기 위하여 피해보상처리기구를 설치·운영합니다. 회사와 이용자 간에 발생한 전자상거래 분쟁에 관하여는 소비자분쟁조정위원회의 조정에 따를 수 있습니다.</p>

          <h2 className="font-semibold text-xl text-primary">제15조 (재판권 및 준거법)</h2>
          <p>회사와 이용자 간에 발생한 분쟁에 관하여는 대한민국 법을 적용하며, 본 분쟁으로 인한 소는 회사의 주소지 관할법원에 제기합니다.</p>
          
          <p className="font-semibold">최종 수정일: {new Date().toLocaleDateString('ko-KR')}</p>
        </CardContent>
      </Card>
    </div>
  );
}
