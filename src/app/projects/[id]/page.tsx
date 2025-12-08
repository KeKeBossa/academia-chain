'use client';

import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Users,
  Calendar,
  User,
  Mail,
  Badge as BadgeIcon,
  Code,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  Share2,
  Heart,
  MessageCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { fetchCollaborationPostDetail } from '@/lib/collaboration/api';

interface ProjectDetailPageProps {
  params: {
    id: string;
  };
}

const statusMeta: Record<string, { label: string; color: string }> = {
  OPEN: { label: '募集中', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  FILLED: { label: '充足', color: 'bg-violet-50 text-violet-700 border-violet-200' },
  CLOSED: { label: 'クローズ', color: 'bg-slate-50 text-slate-700 border-slate-200' },
  ARCHIVED: { label: 'アーカイブ', color: 'bg-amber-50 text-amber-700 border-amber-200' }
};

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const router = useRouter();
  const { id } = params;

  const {
    data: project,
    isLoading,
    error
  } = useQuery({
    queryKey: ['collaboration-post', id],
    queryFn: () => fetchCollaborationPostDetail(id)
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <AlertCircle className="w-12 h-12 text-red-600 mb-4" />
        <h1 className="text-2xl font-bold mb-2">プロジェクトが見つかりません</h1>
        <p className="text-gray-600 mb-6">申し訳ありませんが、このプロジェクトは存在しません。</p>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          戻る
        </Button>
      </div>
    );
  }

  const statusInfo = statusMeta[project.status] || statusMeta.OPEN;
  const createdDate = new Date(project.createdAt).toLocaleDateString('ja-JP');
  const updatedDate = new Date(project.updatedAt).toLocaleDateString('ja-JP');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            戻る
          </Button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Project Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title Card */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.title}</h1>
                    <div className="flex items-center gap-2">
                      <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>プロジェクト説明</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{project.body}</p>
              </CardContent>
            </Card>

            {/* Required Skills */}
            {project.requiredSkills && project.requiredSkills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    必要なスキル
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {project.requiredSkills.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Project Info */}
            <Card>
              <CardHeader>
                <CardTitle>プロジェクト情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-600">作成日</p>
                      <p className="font-medium">{createdDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-600">更新日</p>
                      <p className="font-medium">{updatedDate}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interaction Section */}
            <Card>
              <CardHeader>
                <CardTitle>アクション</CardTitle>
              </CardHeader>
              <CardContent className="flex gap-3">
                <Button className="flex-1" size="lg" disabled={project.status !== 'OPEN'}>
                  {project.status === 'OPEN'
                    ? '参加を申し込む'
                    : 'このプロジェクトは募集中ではありません'}
                </Button>
                <Button variant="outline" size="lg">
                  <Share2 className="w-4 h-4 mr-2" />
                  共有
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Organization Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">組織</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{project.dao.name}</h3>
                  <p className="text-sm text-gray-600">
                    {project.dao.description || 'プロジェクトが登録されている組織'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Author Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5" />
                  プロジェクトマネージャー
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-blue-500 text-white">
                      {project.author.displayName?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 break-words">
                      {project.author.displayName || 'Unknown'}
                    </p>
                    {project.author.email && (
                      <a
                        href={`mailto:${project.author.email}`}
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1"
                      >
                        <Mail className="w-3 h-3" />
                        <span className="truncate">{project.author.email}</span>
                      </a>
                    )}
                    <div className="text-xs text-gray-600 mt-2 break-all">
                      <BadgeIcon className="w-3 h-3 inline mr-1" />
                      {project.author.walletAddress.slice(0, 10)}...
                      {project.author.walletAddress.slice(-8)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">ステータス</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {project.status === 'OPEN' && (
                      <>
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                        <span className="text-sm font-medium text-emerald-700">募集中</span>
                      </>
                    )}
                    {project.status === 'FILLED' && (
                      <>
                        <CheckCircle className="w-5 h-5 text-violet-600" />
                        <span className="text-sm font-medium text-violet-700">募集人員充足</span>
                      </>
                    )}
                    {project.status === 'CLOSED' && (
                      <>
                        <AlertCircle className="w-5 h-5 text-slate-600" />
                        <span className="text-sm font-medium text-slate-700">クローズ</span>
                      </>
                    )}
                    {project.status === 'ARCHIVED' && (
                      <>
                        <Clock className="w-5 h-5 text-amber-600" />
                        <span className="text-sm font-medium text-amber-700">アーカイブ</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    {project.status === 'OPEN' && 'このプロジェクトは新しいメンバーを募集中です。'}
                    {project.status === 'FILLED' && 'このプロジェクトの募集人員は充足しています。'}
                    {project.status === 'CLOSED' && 'このプロジェクトは終了しました。'}
                    {project.status === 'ARCHIVED' && 'このプロジェクトはアーカイブされています。'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">エンゲージメント</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Heart className="w-4 h-4" />
                    <span className="text-sm">興味</span>
                  </div>
                  <span className="font-bold text-gray-900">--</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">参加申し込み</span>
                  </div>
                  <span className="font-bold text-gray-900">--</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">コメント</span>
                  </div>
                  <span className="font-bold text-gray-900">--</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
