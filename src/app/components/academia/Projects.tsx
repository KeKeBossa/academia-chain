'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Users, Calendar, Clock, AlertCircle, MessageSquare, Hash, Link2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { fetchDaos, fetchMemberships } from '@/lib/assets/api';
import { createCollaborationPost, fetchCollaborationPosts } from '@/lib/collaboration/api';

type CollaborationStatus = 'OPEN' | 'FILLED' | 'CLOSED' | 'ARCHIVED';

const statusMeta: Record<CollaborationStatus, { label: string; tone: string }> = {
  OPEN: { label: '募集中', tone: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  FILLED: { label: '充足', tone: 'bg-violet-50 text-violet-700 border-violet-200' },
  CLOSED: { label: 'クローズ', tone: 'bg-slate-50 text-slate-700 border-slate-200' },
  ARCHIVED: { label: 'アーカイブ', tone: 'bg-amber-50 text-amber-700 border-amber-200' }
};

const tabConfig = [
  { value: 'ALL', label: 'すべて' },
  { value: 'OPEN', label: '募集中' },
  { value: 'FILLED', label: '充足' },
  { value: 'CLOSED', label: 'クローズ' },
  { value: 'ARCHIVED', label: 'アーカイブ' }
] as const;

type TabValue = (typeof tabConfig)[number]['value'];

type CollaborationPostRecord = {
  id: string;
  title: string;
  body: string;
  requiredSkills: string[];
  status: CollaborationStatus;
  dao: { id: string; name: string };
  author: { id: string; displayName: string | null; walletAddress: string };
  createdAt: string;
  updatedAt: string;
};

export function Projects() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedDaoId, setSelectedDaoId] = useState('');
  const [selectedAuthorId, setSelectedAuthorId] = useState('');
  const [statusTab, setStatusTab] = useState<TabValue>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    body: '',
    requiredSkills: 'quantum,typescript',
    status: 'OPEN' as CollaborationStatus
  });

  const { data: daoData } = useQuery({
    queryKey: ['project-daos'],
    queryFn: fetchDaos
  });

  const daoOptions = useMemo(() => daoData?.daos ?? [], [daoData]);

  useEffect(() => {
    if (!selectedDaoId && daoOptions.length > 0) {
      setSelectedDaoId(daoOptions[0].id);
    }
  }, [daoOptions, selectedDaoId]);

  const { data: membershipData, isLoading: isLoadingMembers } = useQuery({
    queryKey: ['project-memberships', selectedDaoId],
    queryFn: () => fetchMemberships({ daoId: selectedDaoId }),
    enabled: !!selectedDaoId
  });

  const memberOptions = useMemo(() => membershipData?.memberships ?? [], [membershipData]);

  useEffect(() => {
    if (memberOptions.length > 0 && !selectedAuthorId) {
      setSelectedAuthorId(memberOptions[0].user.id);
    }
    if (memberOptions.length === 0) {
      setSelectedAuthorId('');
    }
  }, [memberOptions, selectedAuthorId]);

  const postsQuery = useQuery({
    queryKey: ['collaboration-posts', selectedDaoId],
    queryFn: () => fetchCollaborationPosts({ daoId: selectedDaoId }),
    enabled: !!selectedDaoId
  });

  const posts: CollaborationPostRecord[] = useMemo(
    () => postsQuery.data?.posts ?? [],
    [postsQuery.data]
  );

  const filteredPosts = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    const skill = skillFilter.trim().toLowerCase();
    return posts
      .filter((post) => (statusTab === 'ALL' ? true : post.status === statusTab))
      .filter((post) =>
        search
          ? post.title.toLowerCase().includes(search) || post.body.toLowerCase().includes(search)
          : true
      )
      .filter((post) =>
        skill ? post.requiredSkills.some((tag) => tag.toLowerCase().includes(skill)) : true
      );
  }, [posts, statusTab, searchTerm, skillFilter]);

  const stats = useMemo(() => {
    const total = posts.length;
    const open = posts.filter((post) => post.status === 'OPEN').length;
    const filled = posts.filter((post) => post.status === 'FILLED').length;
    const filledRatio = total === 0 ? 0 : Math.round((filled / total) * 100);
    return { total, open, filled, filledRatio };
  }, [posts]);

  const createMutation = useMutation({
    mutationFn: createCollaborationPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaboration-posts'] });
      setIsCreateDialogOpen(false);
      setNewPost({ title: '', body: '', requiredSkills: 'quantum,typescript', status: 'OPEN' });
      toast.success('募集投稿を作成しました');
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : '募集投稿の作成に失敗しました');
    }
  });

  const handleCreatePost = () => {
    if (!selectedDaoId) {
      toast.error('DAO を選択してください');
      return;
    }
    if (!selectedAuthorId) {
      toast.error('投稿者となるメンバーを選択してください');
      return;
    }
    if (!newPost.title.trim() || !newPost.body.trim()) {
      toast.error('タイトルと詳細を入力してください');
      return;
    }

    const requiredSkills = newPost.requiredSkills
      .split(',')
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0);

    createMutation.mutate({
      daoId: selectedDaoId,
      authorId: selectedAuthorId,
      title: newPost.title.trim(),
      body: newPost.body.trim(),
      requiredSkills,
      status: newPost.status
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:flex-1">
              <Input
                placeholder="募集タイトル・本文を検索"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
              <Input
                placeholder="スキルフィルター (例: rust)"
                value={skillFilter}
                onChange={(event) => setSkillFilter(event.target.value)}
              />
              <Select value={selectedDaoId} onValueChange={setSelectedDaoId}>
                <SelectTrigger className="w-full lg:w-64">
                  <SelectValue placeholder="DAO を選択" />
                </SelectTrigger>
                <SelectContent>
                  {daoOptions.map((dao) => (
                    <SelectItem key={dao.id} value={dao.id}>
                      {dao.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              募集を投稿
            </Button>
          </div>
          <Tabs value={statusTab} onValueChange={(value) => setStatusTab(value as TabValue)}>
            <TabsList className="flex-wrap">
              {tabConfig.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">募集総数</div>
            <div className="text-3xl font-semibold text-gray-900">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">募集中</div>
            <div className="text-3xl font-semibold text-gray-900">{stats.open}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">充足済み</div>
            <div className="text-3xl font-semibold text-gray-900">{stats.filled}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>充足率</span>
              <span className="font-semibold text-gray-900">{stats.filledRatio}%</span>
            </div>
            <Progress value={stats.filledRatio} />
          </CardContent>
        </Card>
      </div>

      {postsQuery.isLoading ? (
        <Card>
          <CardContent className="p-6 text-sm text-gray-500">募集を読み込み中...</CardContent>
        </Card>
      ) : postsQuery.isError ? (
        <Card>
          <CardContent className="p-6 text-sm text-red-600">
            募集データを取得できませんでした。
          </CardContent>
        </Card>
      ) : filteredPosts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center text-gray-500">
            <AlertCircle className="h-10 w-10 text-gray-300" />
            <p>条件に一致する共同研究募集はありません。</p>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(true)}>
              募集を作成
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => {
            const meta = statusMeta[post.status];
            return (
              <Card key={post.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">{post.dao.name}</Badge>
                      <Badge className={meta.tone}>{meta.label}</Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/projects/${post.id}`)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      詳細を見る
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                  <div
                    onClick={() => router.push(`/projects/${post.id}`)}
                    className="space-y-2"
                  >
                    <CardTitle className="hover:text-blue-600 transition-colors">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="text-gray-700">
                      {post.body.length > 240 ? `${post.body.slice(0, 240)}…` : post.body}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                    <span className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {post.author.displayName ?? post.author.walletAddress}
                    </span>
                    <span className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(post.createdAt).toLocaleString('ja-JP')}
                    </span>
                    <span className="flex items-center gap-2 font-mono text-xs">
                      <Hash className="h-4 w-4" />
                      {post.id.slice(0, 6)}…
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {post.requiredSkills.length === 0 ? (
                      <Badge variant="outline" className="text-xs text-gray-500">
                        スキル指定なし
                      </Badge>
                    ) : (
                      post.requiredSkills.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          #{skill}
                        </Badge>
                      ))
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                    <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4" /> 更新 {new Date(post.updatedAt).toLocaleDateString('ja-JP')}
                    </span>
                    <span className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" /> 応募希望は DAO 内チャットで受付
                    </span>
                    <span className="flex items-center gap-2">
                      <Link2 className="h-4 w-4" /> DAO ID {post.dao.id.slice(0, 5)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>新しい共同研究募集</DialogTitle>
            <DialogDescription>参加者に求める役割やスキルセットを記載してください。</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Label className="text-sm font-medium text-gray-700">
              DAO
              <Select value={selectedDaoId} onValueChange={setSelectedDaoId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="DAO を選択" />
                </SelectTrigger>
                <SelectContent>
                  {daoOptions.map((dao) => (
                    <SelectItem key={dao.id} value={dao.id}>
                      {dao.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Label>

            <Label className="text-sm font-medium text-gray-700">
              投稿者
              <Select
                value={selectedAuthorId}
                onValueChange={setSelectedAuthorId}
                disabled={memberOptions.length === 0 || isLoadingMembers}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="メンバーを選択" />
                </SelectTrigger>
                <SelectContent>
                  {memberOptions.map((member) => (
                    <SelectItem key={member.user.id} value={member.user.id}>
                      {member.user.displayName ?? member.user.walletAddress}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {memberOptions.length === 0 && (
                <p className="mt-1 text-xs text-amber-600">DAO メンバーが見つかりません。</p>
              )}
            </Label>

            <div className="grid gap-4 md:grid-cols-2">
              <Label className="text-sm font-medium text-gray-700">
                タイトル
                <Input
                  className="mt-1"
                  value={newPost.title}
                  onChange={(event) => setNewPost((prev) => ({ ...prev, title: event.target.value }))}
                  placeholder="QKD 実験サポートメンバー募集"
                />
              </Label>
              <Label className="text-sm font-medium text-gray-700">
                ステータス
                <Select
                  value={newPost.status}
                  onValueChange={(value) => setNewPost((prev) => ({ ...prev, status: value as CollaborationStatus }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPEN">募集中</SelectItem>
                    <SelectItem value="FILLED">充足</SelectItem>
                    <SelectItem value="CLOSED">クローズ</SelectItem>
                    <SelectItem value="ARCHIVED">アーカイブ</SelectItem>
                  </SelectContent>
                </Select>
              </Label>
            </div>

            <Label className="text-sm font-medium text-gray-700">
              詳細
              <Textarea
                className="mt-1"
                rows={5}
                value={newPost.body}
                onChange={(event) => setNewPost((prev) => ({ ...prev, body: event.target.value }))}
                placeholder="研究内容、期待する役割、期間などを記載してください。"
              />
            </Label>

            <Label className="text-sm font-medium text-gray-700">
              必要スキル (カンマ区切り)
              <Input
                className="mt-1"
                value={newPost.requiredSkills}
                onChange={(event) =>
                  setNewPost((prev) => ({ ...prev, requiredSkills: event.target.value }))
                }
              />
            </Label>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="ghost" onClick={() => setIsCreateDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleCreatePost} disabled={createMutation.isPending}>
              {createMutation.isPending ? '投稿中...' : '投稿する'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
