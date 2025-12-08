'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Plus,
  Loader2,
  AlertCircle,
  Calendar,
  Users,
  Hash,
  MessageSquare,
  Clock,
  Link2,
  ArrowRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { fetchCollaborationPosts } from '@/lib/collaboration/api';
import { fetchDaos } from '@/lib/assets/api';

type CollaborationStatus = 'OPEN' | 'FILLED' | 'CLOSED' | 'ARCHIVED';

const statusMeta: Record<CollaborationStatus, { label: string; tone: string }> = {
  OPEN: { label: '募集中', tone: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  FILLED: { label: '充足', tone: 'bg-violet-50 text-violet-700 border-violet-200' },
  CLOSED: { label: 'クローズ', tone: 'bg-slate-50 text-slate-700 border-slate-200' },
  ARCHIVED: { label: 'アーカイブ', tone: 'bg-amber-50 text-amber-700 border-amber-200' }
};

export default function ProjectsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDao, setSelectedDao] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<CollaborationStatus | 'ALL'>('ALL');

  // DAO データを取得
  const { data: daoData } = useQuery({
    queryKey: ['projects-page-daos'],
    queryFn: fetchDaos
  });

  const daoOptions = useMemo(() => daoData?.daos ?? [], [daoData]);

  // プロジェクト一覧を取得
  const {
    data: projectsData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['projects-page-posts', selectedDao],
    queryFn: () => fetchCollaborationPosts({ daoId: selectedDao || undefined })
  });

  const allPosts = useMemo(() => projectsData?.posts ?? [], [projectsData]);

  // フィルタリング
  const filteredPosts = useMemo(() => {
    return allPosts
      .filter((post) => (selectedStatus === 'ALL' ? true : post.status === selectedStatus))
      .filter((post) => {
        const search = searchTerm.toLowerCase();
        return (
          post.title.toLowerCase().includes(search) || post.body.toLowerCase().includes(search)
        );
      });
  }, [allPosts, searchTerm, selectedStatus]);

  // 統計情報
  const stats = useMemo(() => {
    return {
      total: allPosts.length,
      open: allPosts.filter((p) => p.status === 'OPEN').length,
      filled: allPosts.filter((p) => p.status === 'FILLED').length,
      closed: allPosts.filter((p) => p.status === 'CLOSED').length
    };
  }, [allPosts]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">共同研究プロジェクト</h1>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              新しいプロジェクトを作成
            </Button>
          </div>
          <p className="text-gray-600">研究チームのメンバーを募集しているプロジェクト一覧</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search & Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-gray-400" />
              <Input
                placeholder="プロジェクト名またはスキルで検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">DAO</label>
                <select
                  value={selectedDao}
                  onChange={(e) => setSelectedDao(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">すべての DAO</option>
                  {daoOptions.map((dao) => (
                    <option key={dao.id} value={dao.id}>
                      {dao.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">ステータス</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="ALL">すべて</option>
                  <option value="OPEN">募集中</option>
                  <option value="FILLED">充足</option>
                  <option value="CLOSED">クローズ</option>
                  <option value="ARCHIVED">アーカイブ</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <p className="text-sm text-gray-600">全プロジェクト</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-emerald-600">{stats.open}</div>
              <p className="text-sm text-gray-600">募集中</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-violet-600">{stats.filled}</div>
              <p className="text-sm text-gray-600">充足</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-slate-600">{stats.closed}</div>
              <p className="text-sm text-gray-600">クローズ</p>
            </CardContent>
          </Card>
        </div>

        {/* Projects List */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="p-6 flex items-center gap-3 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <span>プロジェクトの読み込みに失敗しました</span>
            </CardContent>
          </Card>
        ) : filteredPosts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">条件に一致するプロジェクトが見つかりません</p>
              <Button variant="outline">検索条件をリセット</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => {
              const meta = statusMeta[post.status];
              return (
                <Card
                  key={post.id}
                  className="hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => router.push(`/projects/${post.id}`)}
                >
                  <CardHeader className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Badge variant="secondary">{post.dao.name}</Badge>
                          <Badge className={meta.tone}>{meta.label}</Badge>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors mb-2">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 line-clamp-2">
                          {post.body.length > 240 ? `${post.body.slice(0, 240)}…` : post.body}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        詳細
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Required Skills */}
                    {post.requiredSkills && post.requiredSkills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {post.requiredSkills.map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 pt-2 border-t">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {post.author.displayName || 'Unknown'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(post.createdAt).toLocaleDateString('ja-JP')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        更新: {new Date(post.updatedAt).toLocaleDateString('ja-JP')}
                      </span>
                      <span className="flex items-center gap-1 font-mono text-xs">
                        <Hash className="w-4 h-4" />
                        {post.id.slice(0, 6)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
