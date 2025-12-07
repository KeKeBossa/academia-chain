import { useState } from 'react';
import { Users, MapPin, Calendar, TrendingUp, MessageSquare, UserPlus, ExternalLink, Plus, Shield, Hash, Globe, Mail, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Skeleton } from './ui/skeleton';
import { toast } from 'sonner';
import { useSeminars } from '../hooks/useData';
import {
  SEMINAR_FORM_DEFAULTS,
  validateSeminarForm,
  generateDIDAddress,
  generateBlockchainHash,
  parseTags,
  getResearchFields,
} from '../utils/forms';
import { calculateSeminarStats } from '../utils/stats';

interface Seminar {
  id: string;
  name: string;
  university: string;
  department?: string;
  professor: string;
  members: number;
  field: string;
  description: string;
  tags: string[];
  activeProjects: number;
  publications: number;
  openForCollaboration: boolean;
  website?: string;
  email?: string;
  didAddress?: string;
}

export function Seminars() {
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const [newSeminar, setNewSeminar] = useState({
    name: '',
    university: '',
    department: '',
    professor: '',
    members: '5',
    field: '',
    description: '',
    tags: '',
    website: '',
    email: '',
    openForCollaboration: true,
  });
  
  // 実データからゼミを取得
  const { seminars: fetchedSeminars, loading: loadingSeminars } = useSeminars();
  const [seminars, setSeminars] = useState<Seminar[]>(() => {
    if (!fetchedSeminars || fetchedSeminars.length === 0) {
      return [];
    }
    return fetchedSeminars.map(s => ({
      ...s,
      activeProjects: 0,
      publications: 0,
      website: s.website || '',
      email: s.email || '',
      didAddress: '',
    }));
  });

  const researchFields = getResearchFields();

  const handleRegisterSeminar = () => {
    // Validate form
    const validation = validateSeminarForm(newSeminar);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    // Generate blockchain identifiers
    const didAddress = generateDIDAddress();
    const txHash = generateBlockchainHash();

    // Parse tags
    const tagsList = parseTags(newSeminar.tags);

    // Create new seminar
    const members = parseInt(newSeminar.members);
    const seminar: Seminar = {
      id: String(seminars.length + 1),
      name: newSeminar.name.trim(),
      university: newSeminar.university.trim(),
      department: newSeminar.department.trim(),
      professor: newSeminar.professor.trim(),
      members: members,
      field: newSeminar.field,
      description: newSeminar.description.trim(),
      tags: tagsList,
      activeProjects: 0,
      publications: 0,
      openForCollaboration: newSeminar.openForCollaboration,
      website: newSeminar.website.trim() || undefined,
      email: newSeminar.email.trim() || undefined,
      didAddress: didAddress,
    };

    setSeminars([seminar, ...seminars]);
    setIsRegisterDialogOpen(false);

    // Reset form
    setNewSeminar({
      name: '',
      university: '',
      department: '',
      professor: '',
      members: '5',
      field: '',
      description: '',
      tags: '',
      website: '',
      email: '',
      openForCollaboration: true,
    });

    // Show success message with blockchain info
    toast.success(
      <div className="space-y-2">
        <div>研究室を登録しました</div>
        <div className="text-xs space-y-1 pt-2 border-t border-gray-200">
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            <span className="opacity-80">DID: {didAddress.slice(0, 30)}...</span>
          </div>
          <div className="flex items-center gap-1">
            <Hash className="w-3 h-3" />
            <span className="opacity-80">TX: {txHash.slice(0, 20)}...</span>
          </div>
        </div>
      </div>,
      { duration: 6000 }
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">ゼミ・研究室</h1>
          <p className="text-gray-600">全国の大学の研究グループと交流しよう</p>
        </div>
        <Button 
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          onClick={() => setIsRegisterDialogOpen(true)}
        >
          <Users className="w-4 h-4 mr-2" />
          研究室を登録
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl mb-1">{seminars.length}</div>
            <p className="text-gray-600 text-sm">登録研究室</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl mb-1">{seminars.reduce((acc, s) => acc + s.members, 0)}</div>
            <p className="text-gray-600 text-sm">総メンバー数</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl mb-1">{new Set(seminars.map(s => s.university)).size}</div>
            <p className="text-gray-600 text-sm">大学</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl mb-1">{seminars.reduce((acc, s) => acc + s.activeProjects, 0)}</div>
            <p className="text-gray-600 text-sm">共同研究進行中</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">すべて</TabsTrigger>
          <TabsTrigger value="joined">参加中</TabsTrigger>
          <TabsTrigger value="open">共同研究募集中</TabsTrigger>
          <TabsTrigger value="recommended">おすすめ</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {seminars.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">登録されている研究室がありません</p>
                <p className="text-gray-500 text-sm">研究室を登録して、共同研究の機会を広げましょう</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {seminars.map((seminar) => (
              <Card key={seminar.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                          {seminar.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="mb-1">{seminar.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <MapPin className="w-3 h-3" />
                          {seminar.university}
                        </CardDescription>
                      </div>
                    </div>
                    {seminar.openForCollaboration && (
                      <Badge className="bg-green-50 text-green-700 border-green-200">
                        募集中
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>{seminar.professor}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {seminar.members}名
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline" className="mb-3">{seminar.field}</Badge>
                  
                  <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                    {seminar.description}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {seminar.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="text-gray-600 text-xs mb-1">進行中プロジェクト</div>
                      <div className="text-lg">{seminar.activeProjects}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 text-xs mb-1">論文数</div>
                      <div className="text-lg">{seminar.publications}</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" size="sm">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      詳細
                    </Button>
                    <Button className="flex-1" size="sm">
                      <UserPlus className="w-4 h-4 mr-2" />
                      参加申請
                    </Button>
                  </div>
                </CardContent>
              </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="joined">
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">参加中の研究室</p>
              <p className="text-gray-500 text-sm">研究室に参加して、共同研究を始めましょう</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="open">
          {seminars.filter(s => s.openForCollaboration).length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">共同研究募集中の研究室がありません</p>
                <p className="text-gray-500 text-sm">他の研究室を探すか、新しい研究室を登録してください</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {seminars.filter(s => s.openForCollaboration).map((seminar) => (
              <Card key={seminar.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                          {seminar.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="mb-1">{seminar.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <MapPin className="w-3 h-3" />
                          {seminar.university}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className="bg-green-50 text-green-700 border-green-200">
                      募集中
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 text-sm mb-4">{seminar.description}</p>
                  <Button className="w-full" size="sm">
                    <UserPlus className="w-4 h-4 mr-2" />
                    共同研究を申し込む
                  </Button>
                </CardContent>
              </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recommended">
          <Card>
            <CardContent className="p-12 text-center">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">おすすめの研究室</p>
              <p className="text-gray-500 text-sm">
                あなたの研究分野や興味に基づいておすすめを表示します
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Register Seminar Dialog */}
      <Dialog open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>研究室を登録</DialogTitle>
            <DialogDescription>
              ブロックチェーンベースの分散ID（DID）を使用して研究室を登録します。
              全国の研究者との交流と共同研究の機会が広がります。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* DID Notice */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-purple-900 mb-2">分散ID（DID）による認証</div>
                  <div className="text-xs text-purple-700 space-y-1">
                    <div>✓ 研究室の信頼性を証明する固有のDIDが発行されます</div>
                    <div>✓ ブロックチェーンで改ざん不可能な記録として保存</div>
                    <div>✓ 他大学との共同研究履歴が透明に管理されます</div>
                    <div>✓ レピュテーションスコアで研究活動が評価されます</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Seminar Name */}
            <div>
              <Label htmlFor="seminar-name">研究室名 *</Label>
              <Input
                id="seminar-name"
                value={newSeminar.name}
                onChange={(e) => setNewSeminar({ ...newSeminar, name: e.target.value })}
                placeholder="例: 量子コンピューティング研究会"
                maxLength={100}
              />
              <p className="text-xs text-gray-500 mt-1">
                {newSeminar.name.length} / 100文字（最低5文字）
              </p>
            </div>

            {/* University & Department */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="university">大学名 *</Label>
                <Input
                  id="university"
                  value={newSeminar.university}
                  onChange={(e) => setNewSeminar({ ...newSeminar, university: e.target.value })}
                  placeholder="東京大学"
                />
              </div>
              <div>
                <Label htmlFor="department">学部・研究科 *</Label>
                <Input
                  id="department"
                  value={newSeminar.department}
                  onChange={(e) => setNewSeminar({ ...newSeminar, department: e.target.value })}
                  placeholder="情報理工学系研究科"
                />
              </div>
            </div>

            {/* Professor & Members */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="professor">指導教員名 *</Label>
                <Input
                  id="professor"
                  value={newSeminar.professor}
                  onChange={(e) => setNewSeminar({ ...newSeminar, professor: e.target.value })}
                  placeholder="山田 太郎 教授"
                />
              </div>
              <div>
                <Label htmlFor="members">メンバー数 *</Label>
                <Input
                  id="members"
                  type="number"
                  min="1"
                  max="200"
                  value={newSeminar.members}
                  onChange={(e) => setNewSeminar({ ...newSeminar, members: e.target.value })}
                />
              </div>
            </div>

            {/* Research Field */}
            <div>
              <Label htmlFor="field">研究分野 *</Label>
              <Select value={newSeminar.field} onValueChange={(value: string) => setNewSeminar({ ...newSeminar, field: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="研究分野を選択" />
                </SelectTrigger>
                <SelectContent>
                  {researchFields.map((field) => (
                    <SelectItem key={field} value={field}>
                      {field}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">研究室紹介文 *</Label>
              <Textarea
                id="description"
                value={newSeminar.description}
                onChange={(e) => setNewSeminar({ ...newSeminar, description: e.target.value })}
                placeholder="研究室の特徴、研究テーマ、活動内容などを具体的に記述してください。"
                rows={6}
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-1">
                {newSeminar.description.length} / 1000文字（最低50文字）
              </p>
            </div>

            {/* Tags */}
            <div>
              <Label htmlFor="tags">研究キーワード *</Label>
              <Input
                id="tags"
                value={newSeminar.tags}
                onChange={(e) => setNewSeminar({ ...newSeminar, tags: e.target.value })}
                placeholder="量子計算, 量子アルゴリズム, 量子誤り訂正（カンマ区切り）"
              />
              <p className="text-xs text-gray-500 mt-1">
                研究のキーワードをカンマ区切りで入力してください（3〜5個推奨）
              </p>
            </div>

            {/* Website & Email */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="website">研究室ウェブサイト（オプション）</Label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    id="website"
                    value={newSeminar.website}
                    onChange={(e) => setNewSeminar({ ...newSeminar, website: e.target.value })}
                    placeholder="https://lab.university.ac.jp"
                    className="pl-9"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">連絡先メール（オプション）</Label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    id="email"
                    type="email"
                    value={newSeminar.email}
                    onChange={(e) => setNewSeminar({ ...newSeminar, email: e.target.value })}
                    placeholder="contact@lab.ac.jp"
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            {/* Open for Collaboration */}
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <Checkbox
                id="collaboration"
                checked={newSeminar.openForCollaboration}
                onCheckedChange={(checked: boolean) => 
                  setNewSeminar({ ...newSeminar, openForCollaboration: checked })
                }
              />
              <div className="flex-1">
                <Label 
                  htmlFor="collaboration" 
                  className="cursor-pointer text-sm text-green-900"
                >
                  共同研究を募集する
                </Label>
                <p className="text-xs text-green-700 mt-1">
                  他大学の研究室と共同研究を行いたい場合はチェックしてください。
                  プラットフォーム上で共同研究募集中として表示されます。
                </p>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-blue-600" />
                <span className="text-blue-900">
                  分散ID（DID）が自動的に発行されます
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Hash className="w-4 h-4 text-blue-600" />
                <span className="text-blue-900">
                  研究室情報はブロックチェーンに記録されます
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span className="text-blue-900">
                  研究活動に応じてレピュテーションスコアが付与されます
                </span>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                ⚠️ 登録後、基本情報の変更にはDAO承認が必要になる場合があります。
                内容を十分に確認してから登録してください。
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsRegisterDialogOpen(false);
                setNewSeminar({
                  name: '',
                  university: '',
                  department: '',
                  professor: '',
                  members: '5',
                  field: '',
                  description: '',
                  tags: '',
                  website: '',
                  email: '',
                  openForCollaboration: true,
                });
              }}
            >
              キャンセル
            </Button>
            <Button
              onClick={handleRegisterSeminar}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              研究室を登録
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
