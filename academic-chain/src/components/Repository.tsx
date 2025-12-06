import { useState } from 'react';
import { Search, Filter, Upload, Download, ExternalLink, FileText, Calendar, User, Hash, Award, Heart, MessageSquare, Users, Shield, Lock, Globe, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner@2.0.3';

interface Paper {
  id: string;
  title: string;
  author: string;
  university: string;
  department: string;
  date: string;
  abstract: string;
  tags: string[];
  category: string;
  txHash: string;
  ipfsHash: string;
  citations: number;
  downloads: number;
  likes: number;
  comments: number;
  verified: boolean;
  accessType?: 'open' | 'restricted';
}

export function Repository() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [newPaper, setNewPaper] = useState({
    title: '',
    authors: '',
    university: '',
    department: '',
    abstract: '',
    category: '',
    tags: '',
    doi: '',
    accessType: 'open',
    fileName: '',
  });

  const [papers, setPapers] = useState<Paper[]>([
    {
      id: '1',
      title: '深層学習を用いた医療画像診断の高精度化',
      author: '山田 花子',
      university: '東京大学',
      department: '情報理工学系研究科',
      date: '2025-10-20',
      abstract: '本研究では、深層学習技術を応用した医療画像診断システムの精度向上手法を提案する。CNNアーキテクチャの最適化により、既存手法と比較して15%の精度改善を実現した。',
      tags: ['深層学習', '医療AI', 'CNN', '画像診断'],
      category: 'コンピュータサイエンス',
      txHash: '0xabcd...1234',
      ipfsHash: 'QmX7Y8Z9...',
      citations: 8,
      downloads: 156,
      likes: 42,
      comments: 12,
      verified: true,
    },
    {
      id: '2',
      title: '再生可能エネルギーの効率的な蓄電システムの開発',
      author: '佐藤 健',
      university: '京都大学',
      department: 'エネルギー科学研究科',
      date: '2025-10-18',
      abstract: '太陽光・風力発電の変動性に対応する新型蓄電システムを開発。リチウムイオン電池の改良により、エネルギー密度を30%向上させることに成功した。',
      tags: ['再生可能エネルギー', '蓄電技術', 'リチウムイオン電池'],
      category: 'エネルギー工学',
      txHash: '0xefgh...5678',
      ipfsHash: 'QmA1B2C3...',
      citations: 15,
      downloads: 234,
      likes: 67,
      comments: 23,
      verified: true,
    },
    {
      id: '3',
      title: 'ブロックチェーンベースの学術論文査読システムの設計',
      author: '鈴木 美咲',
      university: '慶應義塾大学',
      department: '理工学部',
      date: '2025-10-15',
      abstract: 'スマートコントラクトを活用した透明性の高い査読プロセスを提案。分散型識別子（DID）により査読者の匿名性とトレーサビリティを両立させる。',
      tags: ['ブロックチェーン', 'ピアレビュー', 'DID', 'スマートコントラクト'],
      category: '情報システム',
      txHash: '0xijkl...9012',
      ipfsHash: 'QmD4E5F6...',
      citations: 5,
      downloads: 98,
      likes: 38,
      comments: 9,
      verified: true,
    },
    {
      id: '4',
      title: '量子暗号通信の実用化に向けた研究',
      author: '高橋 正',
      university: '大阪大学',
      department: '基礎工学研究科',
      date: '2025-10-12',
      abstract: '量子鍵配送（QKD）プロトコルの改良により、長距離での安全な通信を実現。実験により100km以上での安定した鍵配送に成功した。',
      tags: ['量子暗号', 'QKD', 'セキュリティ'],
      category: '量子情報科学',
      txHash: '0xmnop...3456',
      ipfsHash: 'QmG7H8I9...',
      citations: 22,
      downloads: 187,
      likes: 54,
      comments: 18,
      verified: true,
    },
    {
      id: '5',
      title: '都市計画におけるAIシミュレーションの応用',
      author: '伊藤 あゆみ',
      university: '早稲田大学',
      department: '創造理工学部',
      date: '2025-10-10',
      abstract: '機械学習とエージェントベースモデリングを組み合わせ、都市の交通流動や人口分布を予測。持続可能な都市設計に貢献する。',
      tags: ['都市計画', 'AI', 'シミュレーション', 'サステナビリティ'],
      category: '都市工学',
      txHash: '0xqrst...7890',
      ipfsHash: 'QmJ1K2L3...',
      citations: 11,
      downloads: 143,
      likes: 29,
      comments: 7,
      verified: true,
      accessType: 'open' as 'open' | 'restricted',
    },
  ]);

  const categories = [
    'コンピュータサイエンス',
    'エネルギー工学',
    '量子情報科学',
    '都市工学',
    'バイオテクノロジー',
    '材料科学',
    '医療・ヘルスケア',
    '環境科学',
    '数学',
    '物理学',
    '化学',
    'その他',
  ];

  const generateBlockchainHash = () => {
    return '0x' + Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  };

  const generateIPFSHash = () => {
    return 'Qm' + Array.from({ length: 44 }, () => 
      'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(
        Math.floor(Math.random() * 62)
      )
    ).join('');
  };

  const simulateFileUpload = () => {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          resolve(true);
        }
      }, 200);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        toast.error('PDFファイルを選択してください');
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        toast.error('ファイルサイズは50MB以下にしてください');
        return;
      }
      setNewPaper({ ...newPaper, fileName: file.name });
      toast.success(`${file.name} を選択しました`);
    }
  };

  const handlePublishPaper = async () => {
    // Validation
    if (!newPaper.title.trim()) {
      toast.error('論文タイトルを入力してください');
      return;
    }
    if (newPaper.title.length < 10) {
      toast.error('論文タイトルは10文字以上で入力してください');
      return;
    }
    if (!newPaper.authors.trim()) {
      toast.error('著者名を入力してください');
      return;
    }
    if (!newPaper.university.trim()) {
      toast.error('所属機関を入力してください');
      return;
    }
    if (!newPaper.department.trim()) {
      toast.error('所属部署を入力してください');
      return;
    }
    if (!newPaper.abstract.trim()) {
      toast.error('アブストラクトを入力してください');
      return;
    }
    if (newPaper.abstract.length < 100) {
      toast.error('アブストラクトは100文字以上で入力してください');
      return;
    }
    if (!newPaper.category) {
      toast.error('研究分野を選択してください');
      return;
    }
    if (!newPaper.tags.trim()) {
      toast.error('キーワードを入力してください（カンマ区切りで1つ以上）');
      return;
    }
    if (!newPaper.fileName) {
      toast.error('論文ファイル（PDF）をアップロードしてください');
      return;
    }

    // Simulate file upload to IPFS
    toast.info('IPFSへアップロード中...');
    await simulateFileUpload();

    // Generate blockchain identifiers
    const txHash = generateBlockchainHash();
    const ipfsHash = generateIPFSHash();

    // Parse authors and tags
    const authorsList = newPaper.authors.split(',').map(a => a.trim());
    const tagsList = newPaper.tags.split(',').map(t => t.trim()).filter(t => t.length > 0);

    // Create new paper
    const paper: Paper = {
      id: String(papers.length + 1),
      title: newPaper.title.trim(),
      author: authorsList[0], // Main author
      university: newPaper.university.trim(),
      department: newPaper.department.trim(),
      date: new Date().toISOString().split('T')[0],
      abstract: newPaper.abstract.trim(),
      tags: tagsList,
      category: newPaper.category,
      txHash: txHash.slice(0, 10) + '...' + txHash.slice(-4),
      ipfsHash: ipfsHash.slice(0, 10) + '...',
      citations: 0,
      downloads: 0,
      likes: 0,
      comments: 0,
      verified: true,
      accessType: newPaper.accessType as 'open' | 'restricted',
    };

    setPapers([paper, ...papers]);
    setIsPublishDialogOpen(false);
    setUploadProgress(0);

    // Reset form
    setNewPaper({
      title: '',
      authors: '',
      university: '',
      department: '',
      abstract: '',
      category: '',
      tags: '',
      doi: '',
      accessType: 'open',
      fileName: '',
    });

    // Show success message with blockchain info
    toast.success(
      <div className="space-y-2">
        <div>論文を公開しました</div>
        <div className="text-xs space-y-1 pt-2 border-t border-gray-200">
          <div className="flex items-center gap-1">
            <Hash className="w-3 h-3" />
            <span className="opacity-80">TX: {txHash.slice(0, 24)}...</span>
          </div>
          <div className="flex items-center gap-1">
            <FileText className="w-3 h-3" />
            <span className="opacity-80">IPFS: {ipfsHash.slice(0, 24)}...</span>
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
          <h1 className="text-gray-900 mb-2">研究レポジトリ</h1>
          <p className="text-gray-600">ブロックチェーンで永続的に記録された学術論文</p>
        </div>
        <Button 
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          onClick={() => setIsPublishDialogOpen(true)}
        >
          <Upload className="w-4 h-4 mr-2" />
          論文を公開
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="論文タイトル、著者、キーワードで検索..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="カテゴリ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="cs">コンピュータサイエンス</SelectItem>
                <SelectItem value="energy">エネルギー工学</SelectItem>
                <SelectItem value="quantum">量子情報科学</SelectItem>
                <SelectItem value="urban">都市工学</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="latest">
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="並び替え" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">最新順</SelectItem>
                <SelectItem value="popular">人気順</SelectItem>
                <SelectItem value="citations">引用数順</SelectItem>
                <SelectItem value="downloads">ダウンロード数順</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Papers List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">すべて ({papers.length})</TabsTrigger>
          <TabsTrigger value="following">フォロー中</TabsTrigger>
          <TabsTrigger value="mypapers">自分の論文</TabsTrigger>
          <TabsTrigger value="saved">保存済み</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {papers.map((paper) => (
            <Card key={paper.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <Avatar className="mt-1">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                      {paper.author.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-gray-900">{paper.title}</h3>
                          {paper.verified && (
                            <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                              検証済
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <User className="w-4 h-4" />
                          <span>{paper.author}</span>
                          <span>•</span>
                          <span>{paper.university}</span>
                          <span>•</span>
                          <span>{paper.department}</span>
                        </div>
                      </div>
                      <Badge variant="outline">{paper.category}</Badge>
                    </div>

                    <p className="text-gray-700 mb-4 leading-relaxed">
                      {paper.abstract}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      {paper.tags.map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{paper.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Award className="w-4 h-4" />
                        <span>{paper.citations} 引用</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="w-4 h-4" />
                        <span>{paper.downloads} DL</span>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <Hash className="w-3 h-3 text-gray-500" />
                          <span className="text-gray-600">TX:</span>
                          <span className="text-gray-900 font-mono">{paper.txHash}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="w-3 h-3 text-gray-500" />
                          <span className="text-gray-600">IPFS:</span>
                          <span className="text-gray-900 font-mono">{paper.ipfsHash}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 transition-colors">
                          <Heart className="w-4 h-4" />
                          <span>{paper.likes}</span>
                        </button>
                        <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                          <MessageSquare className="w-4 h-4" />
                          <span>{paper.comments}</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          ダウンロード
                        </Button>
                        <Button size="sm">
                          詳細を見る
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="following">
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">フォローしている研究者の論文がここに表示されます</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mypapers">
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">まだ論文を公開していません</p>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
                <Upload className="w-4 h-4 mr-2" />
                最初の論文を公開
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="saved">
          <Card>
            <CardContent className="p-12 text-center">
              <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">保存した論文がここに表示されます</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Publish Paper Dialog */}
      <Dialog open={isPublishDialogOpen} onOpenChange={setIsPublishDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>論文を公開</DialogTitle>
            <DialogDescription>
              ブロックチェーン上に永続的に記録される学術論文を公開します。
              論文はIPFSに保存され、改ざん不可能な形で記録されます。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Blockchain Notice */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-blue-900 mb-2">ブロックチェーン記録の特徴</div>
                  <div className="text-xs text-blue-700 space-y-1">
                    <div>✓ 論文ファイルはIPFSに分散保存されます</div>
                    <div>✓ メタデータはブロックチェーンに永続記録されます</div>
                    <div>✓ タイムスタンプにより研究の優先権を証明できます</div>
                    <div>✓ 透明性の高い引用・評価システムで管理されます</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Paper Title */}
            <div>
              <Label htmlFor="paper-title">論文タイトル *</Label>
              <Input
                id="paper-title"
                value={newPaper.title}
                onChange={(e) => setNewPaper({ ...newPaper, title: e.target.value })}
                placeholder="例: 深層学習を用いた医療画像診断の高精度化"
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-1">
                {newPaper.title.length} / 200文字（最低10文字）
              </p>
            </div>

            {/* Authors */}
            <div>
              <Label htmlFor="authors">著者 *</Label>
              <Input
                id="authors"
                value={newPaper.authors}
                onChange={(e) => setNewPaper({ ...newPaper, authors: e.target.value })}
                placeholder="山田 花子, 佐藤 太郎（カンマ区切り、筆頭著者を最初に）"
              />
              <p className="text-xs text-gray-500 mt-1">
                複数の著者がいる場合はカンマで区切ってください
              </p>
            </div>

            {/* Institution */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="university">所属機関 *</Label>
                <Input
                  id="university"
                  value={newPaper.university}
                  onChange={(e) => setNewPaper({ ...newPaper, university: e.target.value })}
                  placeholder="東京大学"
                />
              </div>
              <div>
                <Label htmlFor="department">所属部署 *</Label>
                <Input
                  id="department"
                  value={newPaper.department}
                  onChange={(e) => setNewPaper({ ...newPaper, department: e.target.value })}
                  placeholder="情報理工学系研究科"
                />
              </div>
            </div>

            {/* Abstract */}
            <div>
              <Label htmlFor="abstract">アブストラクト *</Label>
              <Textarea
                id="abstract"
                value={newPaper.abstract}
                onChange={(e) => setNewPaper({ ...newPaper, abstract: e.target.value })}
                placeholder="研究の背景、目的、方法、結果、結論を簡潔に記述してください。"
                rows={8}
                maxLength={2000}
              />
              <p className="text-xs text-gray-500 mt-1">
                {newPaper.abstract.length} / 2000文字（最低100文字）
              </p>
            </div>

            {/* Category & Access Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">研究分野 *</Label>
                <Select value={newPaper.category} onValueChange={(value) => setNewPaper({ ...newPaper, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="研究分野を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="access-type">公開設定 *</Label>
                <Select value={newPaper.accessType} onValueChange={(value) => setNewPaper({ ...newPaper, accessType: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="公開設定を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-green-600" />
                        <span>オープンアクセス（推奨）</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="restricted">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-orange-600" />
                        <span>制限付きアクセス</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tags */}
            <div>
              <Label htmlFor="tags">キーワード *</Label>
              <Input
                id="tags"
                value={newPaper.tags}
                onChange={(e) => setNewPaper({ ...newPaper, tags: e.target.value })}
                placeholder="深層学習, 医療AI, CNN, 画像診断（カンマ区切り）"
              />
              <p className="text-xs text-gray-500 mt-1">
                論文の内容を表すキーワードをカンマ区切りで入力してください（3〜7個推奨）
              </p>
            </div>

            {/* DOI (Optional) */}
            <div>
              <Label htmlFor="doi">DOI（オプション）</Label>
              <Input
                id="doi"
                value={newPaper.doi}
                onChange={(e) => setNewPaper({ ...newPaper, doi: e.target.value })}
                placeholder="10.1000/xyz123"
              />
              <p className="text-xs text-gray-500 mt-1">
                既存のDOIがある場合は入力してください
              </p>
            </div>

            {/* File Upload */}
            <div>
              <Label htmlFor="paper-file">論文ファイル（PDF） *</Label>
              <div className="mt-2">
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('paper-file')?.click()}
                    className="w-full justify-start"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {newPaper.fileName || 'PDFファイルを選択'}
                  </Button>
                  <input
                    id="paper-file"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>IPFSへアップロード中...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  PDFファイルのみ対応（最大50MB）
                </p>
              </div>
            </div>

            {/* Info Boxes */}
            <div className="space-y-3">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-green-800">
                    <div className="mb-1">オープンアクセス論文の特典</div>
                    <div className="space-y-0.5 text-green-700">
                      <div>• DAOトークン報酬が付与されます</div>
                      <div>• より多くの研究者にリーチできます</div>
                      <div>• 引用数・インパクトの向上が期待できます</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800">
                  ⚠️ ブロックチェーンに記録された論文は削除できません。公開前に内容を十分に確認してください。
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsPublishDialogOpen(false);
                setUploadProgress(0);
                setNewPaper({
                  title: '',
                  authors: '',
                  university: '',
                  department: '',
                  abstract: '',
                  category: '',
                  tags: '',
                  doi: '',
                  accessType: 'open',
                  fileName: '',
                });
              }}
            >
              キャンセル
            </Button>
            <Button
              onClick={handlePublishPaper}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              disabled={uploadProgress > 0 && uploadProgress < 100}
            >
              <Upload className="w-4 h-4 mr-2" />
              論文を公開
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
