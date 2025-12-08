import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Upload, Hash, FileText, Shield, Globe, Lock, Users, Heart } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { usePapers, savePaperToStorage } from '../hooks/useData';
import { Skeleton } from './ui/skeleton';
import { PaperList } from './PaperList';

const CATEGORIES = [
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
  'その他'
];

const initialFormState = {
  title: '',
  authors: '',
  university: '',
  department: '',
  abstract: '',
  category: '',
  tags: '',
  doi: '',
  accessType: 'open' as 'open' | 'restricted',
  fileName: ''
};

interface RepositoryProps {
  onNavigateToPaper?: (paperId: string) => void;
}

export function Repository({ onNavigateToPaper }: RepositoryProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [newPaper, setNewPaper] = useState(initialFormState);

  const filters = useMemo(
    () => ({
      category: selectedCategory === 'all' ? undefined : selectedCategory
    }),
    [selectedCategory]
  );

  // refreshTrigger が変わるたびにデータを再読み込み
  const { papers: fetchedPapers, loading: loadingPapers } = usePapers(
    searchQuery,
    filters,
    refreshTrigger
  );

  const sortedPapers = useMemo(() => {
    if (!fetchedPapers) return [];
    const sorted = [...fetchedPapers];
    switch (sortBy) {
      case 'popular':
        return sorted.sort((a, b) => b.likes - a.likes);
      case 'citations':
        return sorted.sort((a, b) => b.citations - a.citations);
      case 'downloads':
        return sorted.sort((a, b) => b.downloads - a.downloads);
      default:
        return sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
  }, [fetchedPapers, sortBy]);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setPdfFile(file);
        setNewPaper({ ...newPaper, fileName: file.name });
        toast.success(`${file.name} を選択しました`);
      }
    },
    [newPaper]
  );

  const validateForm = useCallback((): boolean => {
    if (!newPaper.title.trim() || newPaper.title.length < 10) {
      toast.error('論文タイトルは10文字以上で入力してください');
      return false;
    }
    if (!newPaper.authors.trim()) {
      toast.error('著者名を入力してください');
      return false;
    }
    if (!newPaper.university.trim() || !newPaper.department.trim()) {
      toast.error('所属機関・部署を入力してください');
      return false;
    }
    if (!newPaper.abstract.trim() || newPaper.abstract.length < 100) {
      toast.error('アブストラクトは100文字以上で入力してください');
      return false;
    }
    if (!newPaper.category || !newPaper.tags.trim() || !newPaper.fileName) {
      toast.error('必須項目を入力してください');
      return false;
    }
    return true;
  }, [newPaper]);

  const handlePublishPaper = useCallback(async () => {
    if (!validateForm()) return;

    toast.info('IPFSへアップロード中...');
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Generate mock IPFS hash and transaction hash
    const ipfsHash =
      'QmVYBU-' +
      Array.from({ length: 40 }, () => Math.random().toString(36)[2])
        .join('')
        .substring(0, 40);

    const txHash =
      '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    // PDF ファイルを Base64 にエンコード
    let pdfUrl: string | undefined;
    if (pdfFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        pdfUrl = event.target?.result as string;

        // Add paper to storage using the utility function
        const paper = savePaperToStorage({
          title: newPaper.title,
          author: newPaper.authors,
          university: newPaper.university,
          department: newPaper.department,
          abstract: newPaper.abstract,
          category: newPaper.category,
          tags: newPaper.tags
            .split(',')
            .map((t) => t.trim())
            .filter((t) => t),
          date: new Date().toISOString(),
          ipfsHash,
          txHash,
          accessType: newPaper.accessType as 'open' | 'restricted',
          pdfUrl
        });

        showSuccessToast(txHash, ipfsHash);
      };
      reader.readAsDataURL(pdfFile);
    } else {
      // Add paper to storage without PDF
      const paper = savePaperToStorage({
        title: newPaper.title,
        author: newPaper.authors,
        university: newPaper.university,
        department: newPaper.department,
        abstract: newPaper.abstract,
        category: newPaper.category,
        tags: newPaper.tags
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t),
        date: new Date().toISOString(),
        ipfsHash,
        txHash,
        accessType: newPaper.accessType as 'open' | 'restricted'
      });

      showSuccessToast(txHash, ipfsHash);
    }

    // Trigger data refresh in usePapers hook
    setRefreshTrigger((prev) => prev + 1);

    setIsPublishDialogOpen(false);
    setNewPaper(initialFormState);
    setPdfFile(null);
  }, [validateForm, newPaper, pdfFile]);

  const showSuccessToast = (txHash: string, ipfsHash: string) => {
    toast.success(
      <div className="space-y-2">
        <div>論文を公開しました</div>
        <div className="text-xs space-y-1 pt-2 border-t border-gray-200">
          <div className="flex items-center gap-1">
            <Hash className="w-3 h-3" />
            <span>TX: {txHash.slice(0, 24)}...</span>
          </div>
          <div className="flex items-center gap-1">
            <FileText className="w-3 h-3" />
            <span>IPFS: {ipfsHash.slice(0, 20)}...</span>
          </div>
        </div>
      </div>,
      { duration: 6000 }
    );
  };

  const handleLike = useCallback((paperId: string) => {
    toast.success('いいねしました');
    // UI を再レンダリングして最新のいいね数を表示
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const handleDownload = useCallback((paperId: string) => {
    toast.success('ダウンロード開始');
    // UI を再レンダリングしてダウンロード数を更新
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">研究レポジトリ</h1>
          <p className="text-gray-600">ブロックチェーンで永続的に記録された学術論文</p>
        </div>
        <Button
          className="bg-gradient-to-r from-blue-600 to-indigo-600"
          onClick={() => setIsPublishDialogOpen(true)}
        >
          <Upload className="w-4 h-4 mr-2" />
          論文を公開
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="検索..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">最新順</SelectItem>
                <SelectItem value="popular">人気順</SelectItem>
                <SelectItem value="citations">引用数順</SelectItem>
                <SelectItem value="downloads">ダウンロード順</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">すべて ({sortedPapers.length})</TabsTrigger>
          <TabsTrigger value="following">フォロー中</TabsTrigger>
          <TabsTrigger value="mypapers">自分の論文</TabsTrigger>
          <TabsTrigger value="saved">保存済み</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {loadingPapers ? (
            <>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </>
          ) : sortedPapers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">論文が見つかりません</div>
          ) : (
            <PaperList
              papers={sortedPapers}
              onLike={handleLike}
              onDownload={handleDownload}
              onNavigateToPaper={onNavigateToPaper}
            />
          )}
        </TabsContent>

        <TabsContent value="following">
          <Card>
            <CardContent className="p-12 text-center text-gray-600">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              フォロー中の論文がありません
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mypapers">
          <Card>
            <CardContent className="p-12 text-center text-gray-600">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              公開した論文がありません
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="saved">
          <Card>
            <CardContent className="p-12 text-center text-gray-600">
              <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              保存した論文がありません
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isPublishDialogOpen} onOpenChange={setIsPublishDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>論文を公開</DialogTitle>
            <DialogDescription>
              ブロックチェーン上に永続的に記録される学術論文を公開します
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-900">
                  <div className="mb-2 font-medium">ブロックチェーン記録</div>
                  <div className="text-xs text-blue-700 space-y-1">
                    <div>✓ IPFSに分散保存</div>
                    <div>✓ ブロックチェーンに永続記録</div>
                    <div>✓ 改ざん不可能</div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Label>論文タイトル *</Label>
              <Input
                value={newPaper.title}
                onChange={(e) => setNewPaper({ ...newPaper, title: e.target.value })}
                maxLength={200}
              />
            </div>

            <div>
              <Label>著者（カンマ区切り） *</Label>
              <Input
                value={newPaper.authors}
                onChange={(e) => setNewPaper({ ...newPaper, authors: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>所属機関 *</Label>
                <Input
                  value={newPaper.university}
                  onChange={(e) => setNewPaper({ ...newPaper, university: e.target.value })}
                />
              </div>
              <div>
                <Label>所属部署 *</Label>
                <Input
                  value={newPaper.department}
                  onChange={(e) => setNewPaper({ ...newPaper, department: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>アブストラクト（100文字以上） *</Label>
              <Textarea
                value={newPaper.abstract}
                onChange={(e) => setNewPaper({ ...newPaper, abstract: e.target.value })}
                rows={5}
                maxLength={2000}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>研究分野 *</Label>
                <Select
                  value={newPaper.category}
                  onValueChange={(value: string) => setNewPaper({ ...newPaper, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>公開設定 *</Label>
                <Select
                  value={newPaper.accessType}
                  onValueChange={(value: string) =>
                    setNewPaper({ ...newPaper, accessType: value as 'open' | 'restricted' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">オープン</SelectItem>
                    <SelectItem value="restricted">制限付き</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>キーワード（カンマ区切り） *</Label>
              <Input
                value={newPaper.tags}
                onChange={(e) => setNewPaper({ ...newPaper, tags: e.target.value })}
              />
            </div>

            <div>
              <Label>DOI（オプション）</Label>
              <Input
                value={newPaper.doi}
                onChange={(e) => setNewPaper({ ...newPaper, doi: e.target.value })}
              />
            </div>

            <div>
              <Label>論文ファイル（PDF） *</Label>
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('paper-file')?.click()}
                className="w-full justify-start"
              >
                <Upload className="w-4 h-4 mr-2" />
                {newPaper.fileName || 'ファイルを選択'}
              </Button>
              <input
                id="paper-file"
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPublishDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handlePublishPaper} className="bg-blue-600">
              <Upload className="w-4 h-4 mr-2" />
              公開
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
