import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, Trash2, ExternalLink } from 'lucide-react';

interface Report {
  id: number;
  target_type: 'post' | 'comment';
  target_id: number;
  target_summary: string;
  reason: string;
  reporter: string;
  reported_at: string;
  status: 'pending' | 'resolved' | 'dismissed';
}

const mockReports: Report[] = [
  { id: 1, target_type: 'post', target_id: 101, target_summary: "광고성 스팸 게시물입니다.", reason: '스팸/홍보', reporter: 'UserA', reported_at: '2024-07-28 10:00', status: 'pending' },
  { id: 2, target_type: 'comment', target_id: 202, target_summary: "과도한 욕설 사용", reason: '욕설/비방', reporter: 'UserB', reported_at: '2024-07-28 11:30', status: 'pending' },
  { id: 3, target_type: 'post', target_id: 105, target_summary: "개인정보 노출 우려", reason: '개인정보 침해', reporter: 'UserC', reported_at: '2024-07-27 15:00', status: 'resolved' },
];

const ReportModerationView = () => {
  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-primary flex items-center">
          <AlertTriangle className="mr-2 h-6 w-6" /> 신고 관리
        </CardTitle>
        <CardDescription>사용자들이 신고한 게시물 및 댓글을 검토하고 조치합니다.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>유형</TableHead>
              <TableHead>대상 요약</TableHead>
              <TableHead>신고 사유</TableHead>
              <TableHead>신고자</TableHead>
              <TableHead>신고일</TableHead>
              <TableHead>상태</TableHead>
              <TableHead className="text-right">조치</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockReports.map((report) => (
              <TableRow key={report.id}>
                <TableCell>{report.id}</TableCell>
                <TableCell>
                  <Badge variant={report.target_type === 'post' ? 'secondary' : 'outline'}>
                    {report.target_type === 'post' ? '게시물' : '댓글'}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-[200px] truncate">{report.target_summary}</TableCell>
                <TableCell>{report.reason}</TableCell>
                <TableCell>{report.reporter}</TableCell>
                <TableCell>{report.reported_at}</TableCell>
                <TableCell>
                  <Badge variant={report.status === 'pending' ? 'destructive' : report.status === 'resolved' ? 'default' : 'outline'}
                    className={report.status === 'resolved' ? 'bg-green-500 hover:bg-green-600' : ''}
                  >
                    {report.status === 'pending' ? '대기 중' : report.status === 'resolved' ? '처리됨' : '기각됨'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="icon" title="대상 보기" disabled>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  {report.status === 'pending' && (
                    <>
                      <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700" title="신고 승인" disabled>
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                       <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700" title="대상 삭제" disabled>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
         {mockReports.length === 0 && (
            <p className="text-center text-muted-foreground py-4">새로운 신고 내역이 없습니다.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default ReportModerationView;
