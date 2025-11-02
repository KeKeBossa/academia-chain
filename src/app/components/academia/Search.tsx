'use client';

import { useState, useEffect } from 'react';
import {
  Search as SearchIcon,
  Filter,
  X,
  Calendar,
  MapPin,
  Award,
  Hash,
  FileText,
  Users,
  Briefcase,
  Vote,
  TrendingUp,
  Download,
  Heart,
  MessageSquare,
  ExternalLink,
  UserPlus,
  ThumbsUp
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';

interface SearchProps {
  initialQuery?: string;
  onQueryChange?: (query: string) => void;
}

export function Search({ initialQuery = '', onQueryChange }: SearchProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedUniversities, setSelectedUniversities] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState('all');

  // Sync searchQuery with initialQuery prop
  useEffect(() => {
    setSearchQuery(initialQuery);
  }, [initialQuery]);

  // Mock search results data
  const papers = [
    {
      id: '1',
      type: 'paper',
      title: '深層学習を用いた医療画像診断の高精度化',
      author: '山田 花子',
      university: '東京大学',
      department: '情報理工学系研究科',
      date: '2025-10-20',
      abstract: '本研究では、深層学習技術を応用した医療画像診断システムの精度向上手法を提案する。',
      tags: ['深層学習', '医療AI', 'CNN'],
      category: 'コンピュータサイエンス',
      downloads: 156,
      likes: 42,
      comments: 12,
      verified: true
    },
    {
      id: '2',
      type: 'paper',
      title: 'ブロックチェーンベースの学術論文査読システムの設計',
      author: '鈴木 美咲',
      university: '慶應義塾大学',
      department: '理工学部',
      date: '2025-10-15',
      abstract: 'スマートコントラクトを活用した透明性の高い査読プロセスを提案。',
      tags: ['ブロックチェーン', 'ピアレビュー', 'DID'],
      category: '情報システム',
      downloads: 98,
      likes: 38,
      comments: 9,
      verified: true
    }
  ];

  const seminars = [
    {
      id: '1',
      type: 'seminar',
      name: '量子コンピューティング研究会',
      university: '東京大学',
      professor: '山田 太郎 教授',
      members: 24,
      field: '量子情報科学',
      description: '量子コンピューティングの理論から実装まで、幅広いテーマを研究しています。',
      tags: ['量子計算', '量子アルゴリズム', '量子誤り訂正'],
      activeProjects: 5,
      publications: 18,
      openForCollaboration: true
    },
    {
      id: '2',
      type: 'seminar',
      name: 'ブロックチェーン社会実装研究室',
      university: '慶應義塾大学',
      professor: '高橋 美咲 教授',
      members: 28,
      field: '情報システム',
      description:
        'ブロックチェーン技術の社会実装に焦点を当て、金融、医療、教育などの分野での応用研究を進めています。',
      tags: ['ブロックチェーン', 'DeFi', 'スマートコントラクト'],
      activeProjects: 6,
      publications: 15,
      openForCollaboration: true
    }
  ];

  const projects = [
    {
      id: '1',
      type: 'project',
      title: 'AIを活用した気候変動予測モデルの開発',
      description:
        '機械学習技術を用いて、より正確な気候変動予測モデルを構築する共同研究プロジェクト',
      status: 'active',
      progress: 65,
      universities: ['東京大学', '京都大学', '早稲田大学'],
      members: 12,
      leader: '佐藤 花子',
      tags: ['AI', '気候科学', '機械学習'],
      funding: '科研費'
    },
    {
      id: '2',
      type: 'project',
      title: 'ブロックチェーン基盤の学術出版プラットフォーム',
      description: '分散型技術を活用した透明性の高い査読・出版システムの設計',
      status: 'planning',
      progress: 15,
      universities: ['慶應義塾大学', '東京大学'],
      members: 6,
      leader: '鈴木 美咲',
      tags: ['ブロックチェーン', '学術出版', 'DID'],
      funding: '大学助成金'
    }
  ];

  const proposals = [
    {
      id: '1',
      type: 'proposal',
      title: '新しい研究分野カテゴリの追加提案',
      description:
        '量子機械学習（Quantum Machine Learning）を新しい研究分野カテゴリとして追加することを提案します。',
      proposer: '山田 花子',
      proposerUniversity: '東京大学',
      status: 'active',
      votesFor: 247,
      votesAgainst: 38,
      category: 'プラットフォーム改善',
      endDate: '2025-10-25'
    },
    {
      id: '2',
      type: 'proposal',
      title: 'オープンアクセス論文への報奨制度導入',
      description:
        'オープンアクセスで論文を公開した研究者に対して、DAOトークンによる報奨を与える制度を導入することを提案します。',
      proposer: '高橋 正',
      proposerUniversity: '大阪大学',
      status: 'passed',
      votesFor: 412,
      votesAgainst: 67,
      category: 'インセンティブ',
      endDate: '2025-10-20'
    }
  ];

  // Filter function for search query matching
  const matchesSearchQuery = (item: any): boolean => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    const searchFields: string[] = [];

    // Collect searchable fields based on item type
    if (item.type === 'paper') {
      searchFields.push(
        item.title || '',
        item.author || '',
        item.university || '',
        item.department || '',
        item.abstract || '',
        item.category || '',
        ...(item.tags || [])
      );
    } else if (item.type === 'seminar') {
      searchFields.push(
        item.name || '',
        item.university || '',
        item.professor || '',
        item.field || '',
        item.description || '',
        ...(item.tags || [])
      );
    } else if (item.type === 'project') {
      searchFields.push(
        item.title || '',
        item.description || '',
        item.leader || '',
        ...(item.universities || []),
        ...(item.tags || [])
      );
    } else if (item.type === 'proposal') {
      searchFields.push(
        item.title || '',
        item.description || '',
        item.proposer || '',
        item.proposerUniversity || '',
        item.category || ''
      );
    }

    // Check if any field contains the search query (partial match)
    return searchFields.some((field) => field.toLowerCase().includes(query));
  };

  // Apply search filter
  const filteredPapers = papers.filter(matchesSearchQuery);
  const filteredSeminars = seminars.filter(matchesSearchQuery);
  const filteredProjects = projects.filter(matchesSearchQuery);
  const filteredProposals = proposals.filter(matchesSearchQuery);

  const allResults = [
    ...filteredPapers,
    ...filteredSeminars,
    ...filteredProjects,
    ...filteredProposals
  ];

  const categories = [
    'コンピュータサイエンス',
    '情報システム',
    '量子情報科学',
    'エネルギー工学',
    '生命科学',
    '都市工学'
  ];

  const universities = [
    '東京大学',
    '京都大学',
    '大阪大学',
    '早稲田大学',
    '慶應義塾大学',
    '東京工業大学'
  ];

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const toggleUniversity = (university: string) => {
    setSelectedUniversities((prev) =>
      prev.includes(university) ? prev.filter((u) => u !== university) : [...prev, university]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedUniversities([]);
    setDateRange('all');
  };

  const statusConfig: Record<string, { label: string; color: string }> = {
    active: { label: '進行中', color: 'bg-green-50 text-green-700 border-green-200' },
    planning: { label: '計画中', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    passed: { label: '可決', color: 'bg-green-50 text-green-700 border-green-200' },
    completed: { label: '完了', color: 'bg-gray-50 text-gray-700 border-gray-200' }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Search Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-gray-900 mb-2">統合検索</h1>
          <p className="text-gray-600">論文、研究室、プロジェクト、提案を横断検索</p>
        </div>

        {/* Main Search Box */}
        <div className="relative">
          <SearchIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="キーワード、タイトル、著者、大学名で検索..."
            className="pl-12 pr-12 h-14 text-lg"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                onQueryChange?.('');
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Filter Toggle & Quick Stats */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2">
            <Filter className="w-4 h-4" />
            フィルター
            {(selectedCategories.length > 0 || selectedUniversities.length > 0) && (
              <Badge variant="secondary" className="ml-1">
                {selectedCategories.length + selectedUniversities.length}
              </Badge>
            )}
          </Button>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>{allResults.length}件の結果</span>
            {(selectedCategories.length > 0 ||
              selectedUniversities.length > 0 ||
              dateRange !== 'all') && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                フィルターをクリア
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Filters Sidebar */}
        {showFilters && (
          <Card className="w-80 h-fit sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>フィルター</span>
                <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Date Range */}
              <div>
                <Label className="mb-3 block">期間</Label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべて</SelectItem>
                    <SelectItem value="today">今日</SelectItem>
                    <SelectItem value="week">今週</SelectItem>
                    <SelectItem value="month">今月</SelectItem>
                    <SelectItem value="year">今年</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Categories */}
              <div>
                <Label className="mb-3 block">研究分野</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center gap-2">
                      <Checkbox
                        id={`cat-${category}`}
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={() => toggleCategory(category)}
                      />
                      <Label htmlFor={`cat-${category}`} className="text-sm cursor-pointer flex-1">
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Universities */}
              <div>
                <Label className="mb-3 block">大学</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {universities.map((university) => (
                    <div key={university} className="flex items-center gap-2">
                      <Checkbox
                        id={`uni-${university}`}
                        checked={selectedUniversities.includes(university)}
                        onCheckedChange={() => toggleUniversity(university)}
                      />
                      <Label
                        htmlFor={`uni-${university}`}
                        className="text-sm cursor-pointer flex-1"
                      >
                        {university}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search Results */}
        <div className="flex-1">
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">すべて ({allResults.length})</TabsTrigger>
              <TabsTrigger value="papers">論文 ({filteredPapers.length})</TabsTrigger>
              <TabsTrigger value="seminars">研究室 ({filteredSeminars.length})</TabsTrigger>
              <TabsTrigger value="projects">プロジェクト ({filteredProjects.length})</TabsTrigger>
              <TabsTrigger value="proposals">提案 ({filteredProposals.length})</TabsTrigger>
            </TabsList>

            {/* All Results */}
            <TabsContent value="all" className="space-y-4">
              {allResults.map((item) => {
                if (item.type === 'paper') {
                  const paper = item as (typeof papers)[0];
                  return (
                    <Card
                      key={`${paper.type}-${paper.id}`}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline" className="text-xs">
                                    論文
                                  </Badge>
                                  <h3 className="text-gray-900">{paper.title}</h3>
                                  {paper.verified && (
                                    <Badge
                                      variant="secondary"
                                      className="bg-green-50 text-green-700 border-green-200"
                                    >
                                      検証済
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mb-2">
                                  {paper.author} • {paper.university} • {paper.date}
                                </p>
                              </div>
                            </div>
                            <p className="text-gray-700 text-sm mb-3">{paper.abstract}</p>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {paper.tags.map((tag, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Download className="w-4 h-4" />
                                  {paper.downloads}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Heart className="w-4 h-4" />
                                  {paper.likes}
                                </div>
                                <div className="flex items-center gap-1">
                                  <MessageSquare className="w-4 h-4" />
                                  {paper.comments}
                                </div>
                              </div>
                              <Button size="sm">
                                詳細を見る
                                <ExternalLink className="w-4 h-4 ml-2" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                }

                if (item.type === 'seminar') {
                  const seminar = item as (typeof seminars)[0];
                  return (
                    <Card
                      key={`${seminar.type}-${seminar.id}`}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Users className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline" className="text-xs">
                                    研究室
                                  </Badge>
                                  <h3 className="text-gray-900">{seminar.name}</h3>
                                  {seminar.openForCollaboration && (
                                    <Badge className="bg-green-50 text-green-700 border-green-200">
                                      募集中
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mb-2">
                                  {seminar.professor} • {seminar.university} • {seminar.members}名
                                </p>
                              </div>
                            </div>
                            <p className="text-gray-700 text-sm mb-3">{seminar.description}</p>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {seminar.tags.map((tag, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <div>進行中: {seminar.activeProjects}</div>
                                <div>論文: {seminar.publications}</div>
                              </div>
                              <Button size="sm">
                                <UserPlus className="w-4 h-4 mr-2" />
                                参加申請
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                }

                if (item.type === 'project') {
                  const project = item as (typeof projects)[0];
                  return (
                    <Card
                      key={`${project.type}-${project.id}`}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Briefcase className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline" className="text-xs">
                                    プロジェクト
                                  </Badge>
                                  <h3 className="text-gray-900">{project.title}</h3>
                                  <Badge
                                    variant="secondary"
                                    className={statusConfig[project.status]?.color}
                                  >
                                    {statusConfig[project.status]?.label}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">
                                  {project.leader} • {project.members}名参加
                                </p>
                              </div>
                            </div>
                            <p className="text-gray-700 text-sm mb-3">{project.description}</p>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {project.tags.map((tag, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex flex-wrap gap-2">
                                {project.universities.map((uni, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {uni}
                                  </Badge>
                                ))}
                              </div>
                              <Button size="sm">詳細を見る</Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                }

                if (item.type === 'proposal') {
                  const proposal = item as (typeof proposals)[0];
                  return (
                    <Card
                      key={`${proposal.type}-${proposal.id}`}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Vote className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline" className="text-xs">
                                    DAO提案
                                  </Badge>
                                  <h3 className="text-gray-900">{proposal.title}</h3>
                                  <Badge
                                    variant="secondary"
                                    className={statusConfig[proposal.status]?.color}
                                  >
                                    {statusConfig[proposal.status]?.label}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">
                                  {proposal.proposer} • {proposal.proposerUniversity}
                                </p>
                              </div>
                            </div>
                            <p className="text-gray-700 text-sm mb-3">{proposal.description}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1 text-green-600">
                                  <ThumbsUp className="w-4 h-4" />
                                  {proposal.votesFor}
                                </div>
                                <div className="flex items-center gap-1 text-red-600">
                                  <ThumbsUp className="w-4 h-4 rotate-180" />
                                  {proposal.votesAgainst}
                                </div>
                              </div>
                              <Button size="sm">詳細を見る</Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                }

                return null;
              })}
            </TabsContent>

            {/* Papers Only */}
            <TabsContent value="papers" className="space-y-4">
              {filteredPapers.map((paper) => (
                <Card key={paper.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <Avatar>
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                          {paper.author.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="text-gray-900 mb-2">{paper.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {paper.author} • {paper.university} • {paper.date}
                        </p>
                        <p className="text-gray-700 text-sm mb-3">{paper.abstract}</p>
                        <div className="flex flex-wrap gap-2">
                          {paper.tags.map((tag, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Seminars Only */}
            <TabsContent value="seminars" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredSeminars.map((seminar) => (
                  <Card key={seminar.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="mb-2">{seminar.name}</CardTitle>
                          <CardDescription>{seminar.university}</CardDescription>
                        </div>
                        {seminar.openForCollaboration && (
                          <Badge className="bg-green-50 text-green-700 border-green-200">
                            募集中
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700 mb-3">{seminar.description}</p>
                      <Button className="w-full" size="sm">
                        <UserPlus className="w-4 h-4 mr-2" />
                        参加申請
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Projects Only */}
            <TabsContent value="projects" className="space-y-4">
              {filteredProjects.map((project) => (
                <Card key={project.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="mb-2">{project.title}</CardTitle>
                        <CardDescription>{project.description}</CardDescription>
                      </div>
                      <Badge variant="secondary" className={statusConfig[project.status]?.color}>
                        {statusConfig[project.status]?.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {project.universities.map((uni, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {uni}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Proposals Only */}
            <TabsContent value="proposals" className="space-y-4">
              {filteredProposals.map((proposal) => (
                <Card key={proposal.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="mb-2">{proposal.title}</CardTitle>
                        <CardDescription>
                          {proposal.proposer} • {proposal.proposerUniversity}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className={statusConfig[proposal.status]?.color}>
                        {statusConfig[proposal.status]?.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 mb-4">{proposal.description}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-green-600">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{proposal.votesFor}</span>
                      </div>
                      <div className="flex items-center gap-1 text-red-600">
                        <ThumbsUp className="w-4 h-4 rotate-180" />
                        <span>{proposal.votesAgainst}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
