import { useState } from 'react';
import { Plus, Users, Calendar, Clock, CheckCircle2, AlertCircle, TrendingUp, FileText, MessageSquare, Hash, Link, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Skeleton } from './ui/skeleton';
import { toast } from 'sonner';
import { useProjects } from '../hooks/useData';

interface Project {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'planning' | 'completed';
  progress: number;
  startDate: string;
  endDate: string;
  universities: string[];
  members: number;
  tasks: { total: number; completed: number };
  papers: number;
  meetings: number;
  tags: string[];
  leader: string;
  funding: string;
}

const researchCategories = [
  'AI・機械学習', '気候科学・環境', '量子技術', 'ブロックチェーン・Web3',
  'スマートシティ・IoT', 'バイオテクノロジー', '材料科学', 'エネルギー',
  '医療・ヘルスケア', '教育工学', 'その他',
];

const fundingSources = [
  '科研費', '民間企業', '大学助成金', '自治体委託',
  'DAO資金', '国際共同研究', '財団助成', '自己資金',
];

const statusConfig = {
  active: { label: '進行中', color: 'bg-green-50 text-green-700 border-green-200' },
  planning: { label: '計画中', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  completed: { label: '完了', color: 'bg-gray-50 text-gray-700 border-gray-200' },
};

const initialFormState = {
  title: '', description: '', category: '', startDate: '', endDate: '',
  universities: '', funding: '', expectedMembers: '5', tags: '',
};

const getStoredProjects = (): Project[] => {
  try {
    const stored = localStorage.getItem('academic-chain:projects');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.warn('Failed to parse projects from localStorage:', error);
    return [];
  }
};

export function Projects() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState(initialFormState);
  const { projects: fetchedProjects, loading: loadingProjects } = useProjects();
  const [projects, setProjects] = useState<Project[]>(getStoredProjects());

  const myDAOTokens = 1250;

  const generateBlockchainHash = () => 
    '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

  const generateIPFSHash = () => 
    'Qm' + Array.from({ length: 44 }, () => 'abcdefghijklmnopqrstuvwxyz0123456789'.charAt(Math.floor(Math.random() * 36))).join('');

  const handleCreateProject = () => {
    // Validation
    const validations = [
      { condition: !newProject.title.trim(), message: 'プロジェクトタイトルを入力してください' },
      { condition: newProject.title.length < 10, message: 'プロジェクトタイトルは10文字以上で入力してください' },
      { condition: !newProject.description.trim(), message: 'プロジェクト説明を入力してください' },
      { condition: newProject.description.length < 30, message: 'プロジェクト説明は30文字以上で入力してください' },
      { condition: !newProject.category, message: '研究分野を選択してください' },
      { condition: !newProject.startDate, message: '開始日を選択してください' },
      { condition: !newProject.endDate, message: '終了日を選択してください' },
      { condition: !newProject.universities.trim(), message: '参加予定大学を入力してください' },
      { condition: !newProject.funding, message: '資金源を選択してください' },
      { condition: !newProject.tags.trim(), message: 'タグを入力してください（カンマ区切りで1つ以上）' },
    ];

    for (const { condition, message } of validations) {
      if (condition) {
        toast.error(message);
        return;
      }
    }

    const start = new Date(newProject.startDate);
    const end = new Date(newProject.endDate);
    if (end <= start) {
      toast.error('終了日は開始日より後の日付を選択してください');
      return;
    }

    const expectedMembers = parseInt(newProject.expectedMembers);
    if (isNaN(expectedMembers) || expectedMembers < 2 || expectedMembers > 100) {
      toast.error('予定メンバー数は2〜100の範囲で入力してください');
      return;
    }

    // Generate blockchain identifiers
    const txHash = generateBlockchainHash();
    const ipfsHash = generateIPFSHash();

    // Create new project
    const project: Project = {
      id: String(projects.length + 1),
      title: newProject.title.trim(),
      description: newProject.description.trim(),
      status: 'planning',
      progress: 0,
      startDate: newProject.startDate,
      endDate: newProject.endDate,
      universities: newProject.universities.split(',').map(u => u.trim()).filter(u => u.length > 0),
      members: expectedMembers,
      tasks: { total: 0, completed: 0 },
      papers: 0,
      meetings: 0,
      tags: newProject.tags.split(',').map(t => t.trim()).filter(t => t.length > 0),
      leader: '田中 太郎',
      funding: newProject.funding,
    };

    setProjects([project, ...projects]);
    setIsCreateDialogOpen(false);
    setNewProject(initialFormState);

    // Show success message with blockchain info
    toast.success(
      <div className="space-y-2">
        <div>プロジェクトを作成しました</div>
        <div className="text-xs space-y-1 pt-2 border-t border-gray-200">
          <div className="flex items-center gap-1">
            <Hash className="w-3 h-3" />
            <span className="opacity-80">TX: {txHash.slice(0, 20)}...</span>
          </div>
          <div className="flex items-center gap-1">
            <Link className="w-3 h-3" />
            <span className="opacity-80">IPFS: {ipfsHash.slice(0, 20)}...</span>
          </div>
        </div>
      </div>,
      { duration: 5000 }
    );
  };

  const statsCards = [
    { icon: CheckCircle2, color: 'green', label: '進行中', value: projects.filter(p => p.status === 'active').length },
    { icon: Clock, color: 'blue', label: '計画中', value: projects.filter(p => p.status === 'planning').length },
    { icon: Users, color: 'purple', label: '総参加者', value: projects.reduce((sum, p) => sum + p.members, 0) },
    { icon: FileText, color: 'orange', label: '論文発表', value: projects.reduce((sum, p) => sum + p.papers, 0) },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">共同研究プロジェクト</h1>
          <p className="text-gray-600">大学・研究室の枠を超えた共同研究</p>
        </div>
        <Button 
          className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          新規プロジェクト
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statsCards.map(({ icon: Icon, color, label, value }, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 bg-${color}-50 text-${color}-600 rounded-lg flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl">{value}</div>
                  <p className="text-gray-600 text-sm">{label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Projects */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">すべて</TabsTrigger>
          <TabsTrigger value="active">進行中</TabsTrigger>
          <TabsTrigger value="planning">計画中</TabsTrigger>
          <TabsTrigger value="completed">完了</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle>{project.title}</CardTitle>
                      <Badge variant="secondary" className={statusConfig[project.status].color}>
                        {statusConfig[project.status].label}
                      </Badge>
                    </div>
                    <CardDescription>{project.description}</CardDescription>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {project.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">進捗状況</span>
                    <span className="text-gray-900">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-gray-600 text-xs mb-1">
                      <Calendar className="w-3 h-3" />
                      期間
                    </div>
                    <div className="text-sm">
                      {new Date(project.startDate).toLocaleDateString('ja-JP')} -
                      {new Date(project.endDate).toLocaleDateString('ja-JP')}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-gray-600 text-xs mb-1">
                      <Users className="w-3 h-3" />
                      メンバー
                    </div>
                    <div className="text-sm">{project.members}名</div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-gray-600 text-xs mb-1">
                      <CheckCircle2 className="w-3 h-3" />
                      タスク
                    </div>
                    <div className="text-sm">
                      {project.tasks.completed}/{project.tasks.total}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-gray-600 text-xs mb-1">
                      <FileText className="w-3 h-3" />
                      論文
                    </div>
                    <div className="text-sm">{project.papers}本</div>
                  </div>
                </div>

                {/* Universities and Leader */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div>
                    <div className="text-xs text-gray-600 mb-1">参加大学</div>
                    <div className="flex flex-wrap gap-1">
                      {project.universities.map((uni, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {uni}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-gray-600 mb-1">リーダー</div>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="bg-gradient-to-br from-green-500 to-teal-600 text-white text-xs">
                          {project.leader.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{project.leader}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3">
                  <Button variant="outline" className="flex-1" size="sm">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    ディスカッション
                  </Button>
                  <Button variant="outline" className="flex-1" size="sm">
                    <FileText className="w-4 h-4 mr-2" />
                    資料
                  </Button>
                  <Button className="flex-1" size="sm">
                    詳細を見る
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="active">
          <div className="space-y-4">
            {projects.filter(p => p.status === 'active').map((project) => (
              <Card key={project.id}>
                <CardHeader>
                  <CardTitle>{project.title}</CardTitle>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress value={project.progress} className="h-2" />
                  <p className="text-sm text-gray-600 mt-2">{project.progress}% 完了</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="planning">
          <div className="space-y-4">
            {projects.filter(p => p.status === 'planning').map((project) => (
              <Card key={project.id}>
                <CardHeader>
                  <CardTitle>{project.title}</CardTitle>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardContent className="p-12 text-center">
              <CheckCircle2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">完了したプロジェクトがありません</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Project Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>新規プロジェクトを作成</DialogTitle>
            <DialogDescription>
              ブロックチェーンに記録される共同研究プロジェクトを立ち上げます。
              プロジェクト情報はIPFSに保存され、スマートコントラクトで管理されます。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Blockchain Notice */}
            <div className="bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-green-900 mb-2">ブロックチェーン記録</div>
                  <div className="text-xs text-green-700 space-y-1">
                    <div>✓ プロジェクト情報はIPFSに分散保存されます</div>
                    <div>✓ スマートコントラクトで透明性の高い管理が可能です</div>
                    <div>✓ 改ざん不可能な研究履歴として記録されます</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-green-600">保有トークン</div>
                  <div className="text-xl text-green-700">{myDAOTokens}</div>
                </div>
              </div>
            </div>

            {/* Project Title */}
            <div>
              <Label htmlFor="project-title">プロジェクトタイトル *</Label>
              <Input
                id="project-title"
                value={newProject.title}
                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                placeholder="例: AIを活用した気候変動予測モデルの開発"
                maxLength={120}
              />
              <p className="text-xs text-gray-500 mt-1">
                {newProject.title.length} / 120文字（最低10文字）
              </p>
            </div>

            {/* Category & Funding */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">研究分野 *</Label>
                <Select value={newProject.category} onValueChange={(value: string) => setNewProject({ ...newProject, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="研究分野を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {researchCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="funding">資金源 *</Label>
                <Select value={newProject.funding} onValueChange={(value: string) => setNewProject({ ...newProject, funding: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="資金源を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {fundingSources.map((source) => (
                      <SelectItem key={source} value={source}>
                        {source}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="project-description">プロジェクト説明 *</Label>
              <Textarea
                id="project-description"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                placeholder="研究の背景、目的、期待される成果などを具体的に記述してください。"
                rows={6}
                maxLength={1500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {newProject.description.length} / 1500文字（最低30文字）
              </p>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-date">開始日 *</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={newProject.startDate}
                  onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="end-date">終了日 *</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={newProject.endDate}
                  onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
                />
              </div>
            </div>

            {/* Universities */}
            <div>
              <Label htmlFor="universities">参加予定大学 *</Label>
              <Input
                id="universities"
                value={newProject.universities}
                onChange={(e) => setNewProject({ ...newProject, universities: e.target.value })}
                placeholder="東京大学, 京都大学, 早稲田大学（カンマ区切り）"
              />
              <p className="text-xs text-gray-500 mt-1">
                参加予定の大学名をカンマ区切りで入力してください
              </p>
            </div>

            {/* Expected Members */}
            <div>
              <Label htmlFor="members">予定メンバー数 *</Label>
              <Input
                id="members"
                type="number"
                min="2"
                max="100"
                value={newProject.expectedMembers}
                onChange={(e) => setNewProject({ ...newProject, expectedMembers: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">
                2〜100名の範囲で設定してください
              </p>
            </div>

            {/* Tags */}
            <div>
              <Label htmlFor="tags">タグ *</Label>
              <Input
                id="tags"
                value={newProject.tags}
                onChange={(e) => setNewProject({ ...newProject, tags: e.target.value })}
                placeholder="AI, 気候科学, 機械学習（カンマ区切り）"
              />
              <p className="text-xs text-gray-500 mt-1">
                プロジェクトのキーワードをカンマ区切りで入力してください（3〜5個推奨）
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Hash className="w-4 h-4 text-blue-600" />
                <span className="text-blue-900">
                  プロジェクトIDはブロックチェーン上で自動生成されます
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Link className="w-4 h-4 text-blue-600" />
                <span className="text-blue-900">
                  プロジェクトドキュメントはIPFSに保存されます
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span className="text-blue-900">
                  進捗はスマートコントラクトで透明に管理されます
                </span>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                ⚠️ プロジェクト作成後、基本情報の変更にはDAOガバナンスの承認が必要になります。
                内容を十分に確認してから作成してください。
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                setNewProject(initialFormState);
              }}
            >
              キャンセル
            </Button>
            <Button
              onClick={handleCreateProject}
              className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              プロジェクトを作成
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
