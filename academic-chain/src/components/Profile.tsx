import { useState } from 'react';
import { Edit, Mail, MapPin, GraduationCap, Award, FileText, Users, Briefcase, ExternalLink, Shield, Hash, X, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Skeleton } from './ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { usePapers } from '../hooks/useData';

export function Profile() {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: '田中 太郎',
    did: 'did:ethr:0x1234567890abcdef',
    email: 'tanaka@example.ac.jp',
    university: '東京大学',
    department: '情報理工学系研究科',
    position: '博士課程3年',
    researchFields: ['量子コンピューティング', '機械学習', 'ブロックチェーン'],
    bio: '量子コンピューティングと機械学習の融合に興味を持っています。特に量子機械学習アルゴリズムの開発と応用に取り組んでいます。',
    reputation: 1247,
    papers: 12,
    seminars: 3,
    projects: 5,
    daoTokens: 850,
    joinDate: '2024-04-01',
  });

  const [editForm, setEditForm] = useState(userProfile);
  const [newResearchField, setNewResearchField] = useState('');

  // 実データから論文を取得
  const { papers: fetchedPapers, loading: loadingPapers } = usePapers();
  const recentPapers = fetchedPapers.slice(0, 3).map(p => ({
    title: p.title,
    date: p.date,
    citations: p.citations,
    downloads: p.downloads,
  }));

  const achievements = [
    { title: '初論文公開', icon: FileText, date: '2024-05-10', color: 'blue' },
    { title: '10論文公開達成', icon: Award, date: '2025-08-15', color: 'gold' },
    { title: '共同研究開始', icon: Users, date: '2024-06-20', color: 'green' },
    { title: 'DAOトークン500達成', icon: Award, date: '2025-07-01', color: 'purple' },
  ];

  const skills = [
    { name: '量子アルゴリズム', level: 85 },
    { name: '機械学習', level: 90 },
    { name: 'Python', level: 95 },
    { name: 'Qiskit', level: 80 },
    { name: 'ブロックチェーン', level: 70 },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="w-24 h-24">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-3xl">
                田中
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-gray-900 mb-2">{userProfile.name}</h1>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" />
                      <span>{userProfile.university} - {userProfile.department}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{userProfile.position}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>{userProfile.email}</span>
                    </div>
                  </div>
                </div>
                <Button onClick={() => {
                  setEditForm(userProfile);
                  setIsEditDialogOpen(true);
                }}>
                  <Edit className="w-4 h-4 mr-2" />
                  編集
                </Button>
              </div>

              <p className="text-gray-700 mb-4">{userProfile.bio}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {userProfile.researchFields.map((field, index) => (
                  <Badge key={index} variant="secondary">
                    {field}
                  </Badge>
                ))}
              </div>

              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-600">分散ID:</span>
                  <span className="text-gray-900 font-mono">{userProfile.did}</span>
                  <Button variant="ghost" size="sm" className="ml-auto">
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Award className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl mb-1">{userProfile.reputation}</div>
            <p className="text-gray-600 text-sm">レピュテーション</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <FileText className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl mb-1">{userProfile.papers}</div>
            <p className="text-gray-600 text-sm">公開論文</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl mb-1">{userProfile.seminars}</div>
            <p className="text-gray-600 text-sm">参加ゼミ</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Briefcase className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl mb-1">{userProfile.projects}</div>
            <p className="text-gray-600 text-sm">共同研究</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Hash className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
            <div className="text-2xl mb-1">{userProfile.daoTokens}</div>
            <p className="text-gray-600 text-sm">DAOトークン</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information */}
      <Tabs defaultValue="papers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="papers">論文</TabsTrigger>
          <TabsTrigger value="achievements">実績</TabsTrigger>
          <TabsTrigger value="skills">スキル</TabsTrigger>
          <TabsTrigger value="activity">アクティビティ</TabsTrigger>
        </TabsList>

        <TabsContent value="papers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>公開論文</CardTitle>
              <CardDescription>ブロックチェーンに記録された研究成果</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentPapers.map((paper, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-gray-900">{paper.title}</h3>
                    <Badge variant="secondary">検証済</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{new Date(paper.date).toLocaleDateString('ja-JP')}</span>
                    <span>•</span>
                    <span>{paper.citations} 引用</span>
                    <span>•</span>
                    <span>{paper.downloads} ダウンロード</span>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full">
                すべての論文を見る
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>実績バッジ</CardTitle>
              <CardDescription>研究活動で獲得したバッジ</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement, index) => {
                  const Icon = achievement.icon;
                  const colorClasses = {
                    blue: 'bg-blue-50 text-blue-600',
                    gold: 'bg-yellow-50 text-yellow-600',
                    green: 'bg-green-50 text-green-600',
                    purple: 'bg-purple-50 text-purple-600',
                  }[achievement.color];

                  return (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl ${colorClasses} flex items-center justify-center`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="text-gray-900 mb-1">{achievement.title}</div>
                          <div className="text-xs text-gray-600">
                            {new Date(achievement.date).toLocaleDateString('ja-JP')}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>スキル</CardTitle>
              <CardDescription>研究スキルと技術スタック</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {skills.map((skill, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-900">{skill.name}</span>
                    <span className="text-sm text-gray-600">{skill.level}%</span>
                  </div>
                  <Progress value={skill.level} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>最近のアクティビティ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm text-gray-900">新しい論文を公開しました</p>
                    <p className="text-xs text-gray-500">2日前</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm text-gray-900">共同研究プロジェクトに参加しました</p>
                    <p className="text-xs text-gray-500">5日前</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm text-gray-900">ガバナンス提案に投票しました</p>
                    <p className="text-xs text-gray-500">1週間前</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm text-gray-900">新しいゼミに参加しました</p>
                    <p className="text-xs text-gray-500">2週間前</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>プロフィール編集</DialogTitle>
            <DialogDescription>
              あなたの研究者プロフィールを更新してください
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">名前 *</Label>
                <Input
                  id="name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="山田 太郎"
                />
              </div>

              <div>
                <Label htmlFor="email">メールアドレス *</Label>
                <Input
                  id="email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  placeholder="email@university.ac.jp"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="university">大学 *</Label>
                  <Input
                    id="university"
                    value={editForm.university}
                    onChange={(e) => setEditForm({ ...editForm, university: e.target.value })}
                    placeholder="東京大学"
                  />
                </div>

                <div>
                  <Label htmlFor="department">学部・研究科 *</Label>
                  <Input
                    id="department"
                    value={editForm.department}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    placeholder="情報理工学系研究科"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="position">所属 *</Label>
                <Input
                  id="position"
                  value={editForm.position}
                  onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                  placeholder="博士課程3年"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <Label htmlFor="bio">自己紹介</Label>
              <Textarea
                id="bio"
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                placeholder="研究テーマや興味のある分野について..."
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-1">
                {editForm.bio.length} / 500文字
              </p>
            </div>

            {/* Research Fields */}
            <div>
              <Label>研究分野</Label>
              <div className="flex flex-wrap gap-2 mb-3 min-h-[40px] p-2 border border-gray-200 rounded-lg">
                {editForm.researchFields.length === 0 ? (
                  <p className="text-sm text-gray-400">研究分野を追加してください</p>
                ) : (
                  editForm.researchFields.map((field, index) => (
                    <Badge key={index} variant="secondary" className="pl-3 pr-1">
                      {field}
                      <button
                        onClick={() => {
                          const newFields = editForm.researchFields.filter((_, i) => i !== index);
                          setEditForm({ ...editForm, researchFields: newFields });
                        }}
                        className="ml-2 hover:bg-gray-300 rounded-full p-0.5 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))
                )}
              </div>
              
              <div className="flex gap-2">
                <Input
                  value={newResearchField}
                  onChange={(e) => setNewResearchField(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (newResearchField.trim() && !editForm.researchFields.includes(newResearchField.trim())) {
                        setEditForm({
                          ...editForm,
                          researchFields: [...editForm.researchFields, newResearchField.trim()]
                        });
                        setNewResearchField('');
                      }
                    }
                  }}
                  placeholder="研究分野を入力してEnter"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (newResearchField.trim() && !editForm.researchFields.includes(newResearchField.trim())) {
                      setEditForm({
                        ...editForm,
                        researchFields: [...editForm.researchFields, newResearchField.trim()]
                      });
                      setNewResearchField('');
                    }
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enterキーまたは追加ボタンで研究分野を追加
              </p>
            </div>

            {/* DID (Read-only) */}
            <div>
              <Label>分散ID（変更不可）</Label>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-900 font-mono">{editForm.did}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                分散IDはブロックチェーン上で管理されており変更できません
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setNewResearchField('');
              }}
            >
              キャンセル
            </Button>
            <Button
              onClick={() => {
                // Validation
                if (!editForm.name.trim() || !editForm.email.trim() || 
                    !editForm.university.trim() || !editForm.department.trim() || 
                    !editForm.position.trim()) {
                  toast.error('必須項目を入力してください');
                  return;
                }

                if (editForm.bio.length > 500) {
                  toast.error('自己紹介は500文字以内で入力してください');
                  return;
                }

                // Save profile
                setUserProfile(editForm);
                setIsEditDialogOpen(false);
                setNewResearchField('');
                toast.success('プロフィールを更新しました');
              }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
