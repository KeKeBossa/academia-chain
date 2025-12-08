import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, FileText, Users, Briefcase, Calendar, ExternalLink, Heart, MessageSquare, Share2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { usePapers, useEvents, useSeminars, useProjects, calculateVotingPower } from '../hooks/useData';
import { Skeleton } from './ui/skeleton';

interface DashboardProps {
  onNavigateToPaper?: (paperId: string) => void;
  onNavigateToRepository?: () => void;
}

export function Dashboard({ onNavigateToPaper, onNavigateToRepository }: DashboardProps) {
  const { t } = useTranslation();
  const { papers: recentPapers, loading: loadingPapers } = usePapers();
  const { events: upcomingEvents, loading: loadingEvents } = useEvents();
  const { seminars } = useSeminars();
  const { projects } = useProjects();

  const votingPower = useMemo(() => Math.round(calculateVotingPower() * 10) / 10, []);

  const stats = useMemo(() => [
    { 
      label: t('dashboard.publishedPapers'), 
      value: recentPapers.length, 
      icon: FileText, 
      change: `+0 ${t('dashboard.thisMonth')}`, 
      color: 'blue' as const
    },
    { 
      label: t('seminars.title'), 
      value: seminars.length, 
      icon: Users, 
      change: '+1 今学期', 
      color: 'purple' as const
    },
    { 
      label: t('projects.title'), 
      value: projects.length, 
      icon: Briefcase, 
      change: '0 進行中', 
      color: 'green' as const
    },
    { 
      label: t('governance.title'), 
      value: votingPower.toFixed(0), 
      icon: TrendingUp, 
      change: '+0 今週', 
      color: 'orange' as const
    },
  ], [recentPapers.length, seminars.length, projects.length, votingPower, t]);

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl ${colorClasses[stat.color]} flex items-center justify-center`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
                <div className="text-3xl mb-1">{stat.value}</div>
                <div className="text-gray-600 mb-2">{stat.label}</div>
                <p className="text-green-600 text-sm">{stat.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.latestPapers')}</CardTitle>
              <CardDescription>{t('dashboard.latestPapers')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingPapers ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-32 rounded-lg" />
                  ))}
                </>
              ) : recentPapers.length === 0 ? (
                <p className="text-center text-gray-500 py-8">{t('dashboard.noPapersRegistered')}</p>
              ) : (
                recentPapers.slice(0, 3).map((paper) => (
                  <div key={paper.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-shadow cursor-pointer">
                    <div className="flex items-start gap-3">
                      <Avatar className="mt-1">
                        <AvatarFallback>{paper.author.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="text-gray-900">{paper.title}</h3>
                          {paper.verified && (
                            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 whitespace-nowrap">
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
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4 text-gray-600" />
                            <span>{paper.likes}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4 text-gray-600" />
                            <span>{paper.comments}</span>
                          </div>
                          <button className="flex items-center gap-1 hover:text-green-600 transition-colors">
                            <Share2 className="w-4 h-4" />
                            <span>共有</span>
                          </button>
                          <Button 
                            variant="link" 
                            className="ml-auto" 
                            size="sm"
                            onClick={() => onNavigateToPaper?.(paper.id)}
                          >
                            詳細を見る
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}

              <Button 
                variant="outline" 
                className="w-full"
                onClick={onNavigateToRepository}
              >
                {t('dashboard.viewAllPapers')}
              </Button>
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
              {loadingEvents ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24 rounded-lg" />
                  ))}
                </>
              ) : upcomingEvents.length === 0 ? (
                <p className="text-center text-gray-500 py-8">予定されたイベントはありません</p>
              ) : (
                upcomingEvents.slice(0, 3).map((event, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <Badge variant="secondary" className="mb-2">{event.type}</Badge>
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
                      <Button size="sm" variant="outline">参加</Button>
                    </div>
                  </div>
                ))
              )}

              <Button variant="outline" className="w-full">
                イベント一覧
              </Button>
            </CardContent>
          </Card>

          {/* Activity Feed */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>アクティビティ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentPapers.length > 0 && (
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm text-gray-900">新しい論文「{recentPapers[0].title}」を公開しました</p>
                    <p className="text-xs text-gray-500">{recentPapers[0].date}</p>
                  </div>
                </div>
              )}
              {upcomingEvents.length > 0 && (
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm text-gray-900">イベント「{upcomingEvents[0].title}」に参加予定</p>
                    <p className="text-xs text-gray-500">{upcomingEvents[0].date}</p>
                  </div>
                </div>
              )}
              {recentPapers.length === 0 && upcomingEvents.length === 0 && (
                <p className="text-center text-gray-500 py-4">アクティビティはまだありません</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
