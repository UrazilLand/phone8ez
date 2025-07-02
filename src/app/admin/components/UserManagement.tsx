'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { UserProfile, UserRole } from '@/types/auth';

interface UserManagementProps {
  className?: string;
}

export default function UserManagement({ className }: UserManagementProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [newRole, setNewRole] = useState<UserRole>('user');
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search })
      });

      const response = await fetch(`/api/admin/users?${params}`);
      if (!response.ok) {
        throw new Error('사용자 목록을 불러오는데 실패했습니다.');
      }

      const data = await response.json();
      setUsers(data.users);
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

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const handleRoleUpdate = async () => {
    if (!selectedUser) return;

    try {
      setUpdating(true);
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetUserId: selectedUser.id,
          role: newRole,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '역할 업데이트에 실패했습니다.');
      }

      toast({
        title: '성공',
        description: '사용자 역할이 성공적으로 업데이트되었습니다.',
      });

      // 목록 새로고침
      fetchUsers();
      setSelectedUser(null);
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

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'moderator':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getPlanBadgeVariant = (plan: string) => {
    return plan === 'pro' ? 'default' : 'outline';
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>사용자 관리</span>
            <div className="flex items-center gap-2">
              <Input
                placeholder="이메일 또는 닉네임으로 검색..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-64"
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">로딩 중...</div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="font-medium">{user.nickname}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role === 'admin' ? '관리자' : 
                           user.role === 'moderator' ? '모더레이터' : '사용자'}
                        </Badge>
                        <Badge variant={getPlanBadgeVariant(user.plan)}>
                          {user.plan === 'pro' ? 'Pro' : 'Free'}
                        </Badge>
                        {user.is_verified && (
                          <Badge variant="outline">인증됨</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-muted-foreground">
                        게시글: {user.post_count} | 댓글: {user.comment_count}
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setNewRole(user.role);
                            }}
                          >
                            역할 변경
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>사용자 역할 변경</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <div className="font-medium">{user.nickname}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">새로운 역할</label>
                              <Select value={newRole} onValueChange={(value: UserRole) => setNewRole(value)}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="user">사용자</SelectItem>
                                  <SelectItem value="moderator">모더레이터</SelectItem>
                                  <SelectItem value="admin">관리자</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                onClick={() => setSelectedUser(null)}
                              >
                                취소
                              </Button>
                              <Button
                                onClick={handleRoleUpdate}
                                disabled={updating || newRole === user.role}
                              >
                                {updating ? '업데이트 중...' : '업데이트'}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
              
              {users.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  사용자가 없습니다.
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