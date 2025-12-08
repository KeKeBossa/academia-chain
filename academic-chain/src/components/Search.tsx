import { useState, useEffect } from 'react';
import { Search as SearchIcon, Filter, X, Calendar, MapPin, Award, Hash, FileText, Users, Briefcase, Vote, TrendingUp, Download, Heart, MessageSquare, ExternalLink, UserPlus, ThumbsUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Skeleton } from './ui/skeleton';
import { usePapers, useSeminars, useProjects } from '../hooks/useData';
import { transformForSearch } from '../utils/transformers';

interface SearchProps {
  initialQuery?: string;
  onQueryChange?: (query: string) => void;
  onNavigateToPaper?: (paperId: string) => void;
}

export function Search({ initialQuery = '', onQueryChange, onNavigateToPaper }: SearchProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedUniversities, setSelectedUniversities] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState('all');

  // 実データを取得
  const { papers: fetchedPapers, loading: loadingPapers } = usePapers(searchQuery);
  const { seminars: fetchedSeminars, loading: loadingSeminars } = useSeminars();
  const { projects: fetchedProjects, loading: loadingProjects } = useProjects();

  // Sync searchQuery with initialQuery prop
  useEffect(() => {
    setSearchQuery(initialQuery);
  }, [initialQuery]);

  // Transform data using unified transformers
  const { papers, seminars, projects } = transformForSearch({
    papers: fetchedPapers,
    seminars: fetchedSeminars,
    projects: fetchedProjects,
  });

  const proposals: any[] = [];

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
    return searchFields.some(field => 
      field.toLowerCase().includes(query)
    );
  };

  // Apply search filter
  const filteredPapers = papers.filter(matchesSearchQuery);
  const filteredSeminars = seminars.filter(matchesSearchQuery);
  const filteredProjects = projects.filter(matchesSearchQuery);
  const filteredProposals = proposals.filter(matchesSearchQuery);
  
  const allResults = [...filteredPapers, ...filteredSeminars, ...filteredProjects, ...filteredProposals];

  const categories = [
    'コンピュータサイエンス',
    '情報システム',
    '量子情報科学',
    'エネルギー工学',
    '生命科学',
    '都市工学',
  ];

  const universities = [
    '東京大学',
    '京都大学',
    '大阪大学',
    '早稲田大学',
    '慶應義塾大学',
    '東京工業大学',
  ];

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleUniversity = (university: string) => {
    setSelectedUniversities(prev =>
      prev.includes(university)
        ? prev.filter(u => u !== university)
        : [...prev, university]
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
    completed: { label: '完了', color: 'bg-gray-50 text-gray-700 border-gray-200' },
    passed: { label: '可決', color: 'bg-green-50 text-green-700 border-green-200' },
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
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
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
            {(selectedCategories.length > 0 || selectedUniversities.length > 0 || dateRange !== 'all') && (
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
                      <Label
                        htmlFor={`cat-${category}`}
                        className="text-sm cursor-pointer flex-1"
                      >
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
              <TabsTrigger value="all">
                すべて ({allResults.length})
              </TabsTrigger>
              <TabsTrigger value="papers">
                論文 ({filteredPapers.length})
              </TabsTrigger>
              <TabsTrigger value="seminars">
                研究室 ({filteredSeminars.length})
              </TabsTrigger>
              <TabsTrigger value="projects">
                プロジェクト ({filteredProjects.length})
              </TabsTrigger>
              <TabsTrigger value="proposals">
                提案 ({filteredProposals.length})
              </TabsTrigger>
            </TabsList>

            {/* All Results */}
            <TabsContent value="all" className="space-y-4">
              {allResults.map((item) => {
                if (item.type === 'paper') {
                  const paper = item as typeof papers[0];
                  return (
                    <Card key={`${paper.type}-${paper.id}`} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline" className="text-xs">論文</Badge>
                                  <h3 className="text-gray-900">{paper.title}</h3>
                                  {paper.verified && (
                                    <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
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
                              <Button 
                                size="sm"
                                onClick={() => onNavigateToPaper?.(paper.id)}
                              >
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
                  const seminar = item as typeof seminars[0];
                  return (
                    <Card key={`${seminar.type}-${seminar.id}`} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Users className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline" className="text-xs">研究室</Badge>
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
                  const project = item as typeof projects[0];
                  return (
                    <Card key={`${project.type}-${project.id}`} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Briefcase className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline" className="text-xs">プロジェクト</Badge>
                                  <h3 className="text-gray-900">{project.title}</h3>
                                  <Badge variant="secondary" className={statusConfig[project.status]?.color}>
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
                  const proposal = item as typeof proposals[0];
                  return (
                    <Card key={`${proposal.type}-${proposal.id}`} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Vote className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline" className="text-xs">DAO提案</Badge>
                                  <h3 className="text-gray-900">{proposal.title}</h3>
                                  <Badge variant="secondary" className={statusConfig[proposal.status]?.color}>
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
