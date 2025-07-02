'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface Report {
  id: number;
  target_type: 'post' | 'comment';
  target_id: number;
  reason: string;
  status: 'pending' | 'resolved' | 'rejected';
  created_at: string;
  user?: {
    id: number;
    email: string;
    nickname: string;
  };
  target_info?: any;
  moderator_note?: string;
}

interface ReportManagementProps {
  className?: string;
}

export default function ReportManagement({ className }: ReportManagementProps) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reportDetail, setReportDetail] = useState<Report | null>(null);
  const [newStatus, setNewStatus] = useState<'pending' | 'resolved' | 'rejected'>('pending');
  const [moderatorNote, setModeratorNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(status && { status })
      });

      const response = await fetch(`/api/reports?${params}`);
      if (!response.ok) {
        throw new Error('신고 목록을 불러오는데 실패했습니다.');
      }

      const data = await response.json();
      setReports(data.reports);
      setTotal(data.total);
    } catch (error) {
      toast({
        title: '오류',
        description: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchReportDetail = async (reportId: number) => {
    try {
      const response = await fetch(`/api/reports/${reportId}`);
      if (!response.ok) {
        throw new Error('신고 상세 정보를 불러오는데 실패했습니다.');
      }

      const data = await response.json();
      setReportDetail(data);
    } catch (error) {
      toast({
        title: '오류',
        description: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    fetchReports();
  }, [page, status]);

  const handleStatusUpdate = async () => {
    if (!selectedReport) return;

    try {
      setUpdating(true);
      const response = await fetch(`/api/reports/${selectedReport.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          moderator_note: moderatorNote,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '신고 처리에 실패했습니다.');
      }

      toast({
        title: '성공',
        description: '신고가 성공적으로 처리되었습니다.',
      });

      // 목록 새로고침
      fetchReports();
      setSelectedReport(null);
      setReportDetail(null);
      setModeratorNote('');
    } catch (error) {
      toast({
        title: '오류',
        description: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
        variant: 'destructive'
      });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'resolved':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '대기중';
      case 'resolved':
        return '처리됨';
      case 'rejected':
        return '거부됨';
      default:
        return status;
    }
  };

  const getTargetTypeText = (type: string) => {
    return type === 'post' ? '게시글' : '댓글';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>신고 관리</span>
            <div className="flex items-center gap-2">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="상태" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">전체</SelectItem>
                  <SelectItem value="pending">대기중</SelectItem>
                  <SelectItem value="resolved">처리됨</SelectItem>
                  <SelectItem value="rejected">거부됨</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">로딩 중...</div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="font-medium">
                          {getTargetTypeText(report.target_type)} 신고 #{report.id}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {report.reason}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(report.created_at)}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={getStatusBadgeVariant(report.status)}>
                          {getStatusText(report.status)}
                        </Badge>
                        <Badge variant="outline">
                          {getTargetTypeText(report.target_type)}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {report.user && (
                        <div className="text-sm text-muted-foreground">
                          신고자: {report.user.nickname}
                        </div>
                      )}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedReport(report);
                              setNewStatus(report.status);
                              setModeratorNote(report.moderator_note || '');
                              fetchReportDetail(report.id);
                            }}
                          >
                            상세보기
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>신고 상세 정보</DialogTitle>
                          </DialogHeader>
                          {reportDetail && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <div className="font-medium">신고 정보</div>
                                  <div className="text-sm space-y-1">
                                    <div>신고 ID: {reportDetail.id}</div>
                                    <div>대상 타입: {getTargetTypeText(reportDetail.target_type)}</div>
                                    <div>대상 ID: {reportDetail.target_id}</div>
                                    <div>상태: {getStatusText(reportDetail.status)}</div>
                                    <div>신고일: {formatDate(reportDetail.created_at)}</div>
                                  </div>
                                </div>
                                <div>
                                  <div className="font-medium">신고자 정보</div>
                                  <div className="text-sm space-y-1">
                                    {reportDetail.user ? (
                                      <>
                                        <div>닉네임: {reportDetail.user.nickname}</div>
                                        <div>이메일: {reportDetail.user.email}</div>
                                      </>
                                    ) : (
                                      <div>익명 사용자</div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <div className="font-medium">신고 사유</div>
                                <div className="text-sm p-3 bg-muted rounded-md">
                                  {reportDetail.reason}
                                </div>
                              </div>

                              {reportDetail.target_info && (
                                <div>
                                  <div className="font-medium">신고 대상 내용</div>
                                  <div className="text-sm p-3 bg-muted rounded-md max-h-32 overflow-y-auto">
                                    {reportDetail.target_type === 'post' ? (
                                      <>
                                        <div className="font-medium">{reportDetail.target_info.title}</div>
                                        <div className="mt-2">{reportDetail.target_info.content}</div>
                                      </>
                                    ) : (
                                      <div>{reportDetail.target_info.content}</div>
                                    )}
                                  </div>
                                </div>
                              )}

                              <div className="space-y-2">
                                <label className="text-sm font-medium">처리 상태</label>
                                <Select value={newStatus} onValueChange={(value: any) => setNewStatus(value)}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">대기중</SelectItem>
                                    <SelectItem value="resolved">처리됨</SelectItem>
                                    <SelectItem value="rejected">거부됨</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <label className="text-sm font-medium">처리 메모</label>
                                <Textarea
                                  value={moderatorNote}
                                  onChange={(e) => setModeratorNote(e.target.value)}
                                  placeholder="처리 메모를 입력하세요..."
                                  rows={3}
                                />
                              </div>

                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedReport(null);
                                    setReportDetail(null);
                                    setModeratorNote('');
                                  }}
                                >
                                  취소
                                </Button>
                                <Button
                                  onClick={handleStatusUpdate}
                                  disabled={updating}
                                >
                                  {updating ? '처리 중...' : '처리 완료'}
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
              
              {reports.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  신고가 없습니다.
                </div>
              )}
              
              {total > 20 && (
                <div className="flex justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    이전
                  </Button>
                  <span className="flex items-center px-4 text-sm">
                    {page} / {Math.ceil(total / 20)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= Math.ceil(total / 20)}
                  >
                    다음
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 