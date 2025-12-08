'use client';

import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  FileText,
  Users,
  Briefcase,
  Calendar,
  ExternalLink,
  Heart,
  MessageSquare,
  Share2,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { fetchDashboardStats, fetchDashboardContent } from '@/lib/dashboard/api';

type StatColor = 'blue' | 'purple' | 'green' | 'orange';

interface DashboardStat {
  label: string;
  value: string;
  change: string;
  color: StatColor;
}

interface RecentPaper {
  id: string;
  title: string;
  author: string;
  university: string;
  date: string;
  tags: string[];
  likes: number;
  comments: number;
  verified: boolean;
}

interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: string;
  organization: string;
  participants?: number;
}

const iconMap = {
  '公開論文': FileText,
  '参加ゼミ': Users,
  '共同研究': Briefcase,
  'DAOトークン': TrendingUp
};

export function Dashboard() {
  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats
  });

  const { data: contentData, isLoading: isLoadingContent } = useQuery({
    queryKey: ['dashboard-content'],
    queryFn: fetchDashboardContent
  });

  const stats: DashboardStat[] = statsData?.stats ?? [];
  const recentPapers: RecentPaper[] = contentData?.recentPapers ?? [];
  const upcomingEvents: UpcomingEvent[] = contentData?.upcomingEvents ?? [];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoadingStats ? (
          <div className="col-span-full flex justify-center items-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : (
          stats.map((stat, index) => {
            const Icon = (iconMap as Record<string, typeof FileText>)[stat.label] || FileText;
            const colorClasses = {
              blue: 'bg-blue-50 text-blue-600',
              purple: 'bg-purple-50 text-purple-600',
              green: 'bg-green-50 text-green-600',
              orange: 'bg-orange-50 text-orange-600'
            }[stat.color];

            return (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl ${colorClasses} flex items-center justify-center`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="text-3xl mb-1">{stat.value}</div>
                  <div className="text-gray-600 mb-2">{stat.label}</div>
                  <p className="text-green-600 text-sm">{stat.change}</p>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Papers */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>最新の研究論文</CardTitle>
              <CardDescription>コミュニティで公開された最新の研究成果</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingContent ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
              ) : recentPapers.length > 0 ? (
                <>
                  {recentPapers.map((paper, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="mt-1">
                          <AvatarFallback>{paper.author.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="text-gray-900">{paper.title}</h3>
                            {paper.verified && (
                              <Badge
                                variant="secondary"
                                className="bg-blue-50 text-blue-700 border-blue-200 whitespace-nowrap"
                              >
                                検証済
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                            <span>{paper.author}</span>
                            <span>•</span>
                            <span>{paper.university}</span>
                            <span>•</span>
                            <span>{paper.date}</span>
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                            {paper.tags.map((tag, tagIndex) => (
                              <Badge key={tagIndex} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <button className="flex items-center gap-1 hover:text-red-600 transition-colors">
                              <Heart className="w-4 h-4" />
                              <span>{paper.likes}</span>
                            </button>
                            <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                              <MessageSquare className="w-4 h-4" />
                              <span>{paper.comments}</span>
                            </button>
                            <button className="flex items-center gap-1 hover:text-green-600 transition-colors">
                              <Share2 className="w-4 h-4" />
                              <span>共有</span>
                            </button>
                            <Button variant="link" className="ml-auto" size="sm">
                              詳細を見る
                              <ExternalLink className="w-3 h-3 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    すべての論文を見る
                  </Button>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>論文データが見つかりません</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>今後のイベント</CardTitle>
              <CardDescription>学術交流イベント</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingContent ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
              ) : upcomingEvents.length > 0 ? (
                <>
                  {upcomingEvents.map((event, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                    >
                      <Badge variant="secondary" className="mb-2">
                        {event.type}
                      </Badge>
                      <h4 className="text-gray-900 mb-2">{event.title}</h4>
                      <div className="space-y-1 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{event.date}</span>
                        </div>
                        <div className="pl-6">{event.time}</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{event.participants}名参加予定</span>
                        <Button size="sm" variant="outline">
                          参加
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    イベント一覧
                  </Button>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>イベントが見つかりません</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Feed */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>アクティビティ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-sm text-gray-900">新しい論文に「いいね」しました</p>
                  <p className="text-xs text-gray-500">2時間前</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-sm text-gray-900">共同研究プロジェクトに参加しました</p>
                  <p className="text-xs text-gray-500">5時間前</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-sm text-gray-900">ガバナンス提案に投票しました</p>
                  <p className="text-xs text-gray-500">1日前</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
