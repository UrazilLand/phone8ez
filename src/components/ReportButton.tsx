'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Flag } from 'lucide-react';

interface ReportButtonProps {
  targetType: 'post' | 'comment';
  targetId: number;
  className?: string;
}

const REPORT_REASONS = [
  { value: 'spam', label: '스팸/광고성 내용' },
  { value: 'inappropriate', label: '부적절한 내용' },
  { value: 'harassment', label: '괴롭힘/폭력' },
  { value: 'copyright', label: '저작권 침해' },
  { value: 'other', label: '기타' },
];

export default function ReportButton({ targetType, targetId, className }: ReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!reason) {
      toast({
        title: '오류',
        description: '신고 사유를 선택해주세요.',
        variant: 'destructive'
      });
      return;
    }

    if (reason === 'other' && !customReason.trim()) {
      toast({
        title: '오류',
        description: '신고 사유를 입력해주세요.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target_type: targetType,
          target_id: targetId,
          reason: reason === 'other' ? customReason : reason,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '신고 처리에 실패했습니다.');
      }

      toast({
        title: '성공',
        description: '신고가 성공적으로 접수되었습니다.',
      });

      setOpen(false);
      setReason('');
      setCustomReason('');
    } catch (error) {
      toast({
        title: '오류',
        description: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className={className}>
          <Flag className="h-4 w-4" />
          <span className="sr-only">신고</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {targetType === 'post' ? '게시글' : '댓글'} 신고
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">신고 사유</label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="신고 사유를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_REASONS.map((reportReason) => (
                  <SelectItem key={reportReason.value} value={reportReason.value}>
                    {reportReason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {reason === 'other' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">신고 사유 상세</label>
              <Textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="신고 사유를 자세히 입력해주세요..."
                rows={3}
              />
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setOpen(false);
                setReason('');
                setCustomReason('');
              }}
            >
              취소
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || !reason || (reason === 'other' && !customReason.trim())}
            >
              {submitting ? '신고 중...' : '신고하기'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 