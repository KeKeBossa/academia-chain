import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Upload, Hash, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface PublishPaperFormProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (paper: {
    title: string;
    authors: string;
    university: string;
    department: string;
    abstract: string;
    category: string;
    tags: string;
    doi: string;
    accessType: 'open' | 'restricted';
    fileName: string;
  }) => Promise<void>;
}

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
  'その他',
];

/**
 * PublishPaperForm: 論文発行フォームコンポーネント
 * Repository から分割して独立化
 */
export function PublishPaperForm({ isOpen, onClose, onPublish }: PublishPaperFormProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    authors: '',
    university: '',
    department: '',
    abstract: '',
    category: '',
    tags: '',
    doi: '',
    accessType: 'open' as 'open' | 'restricted',
    fileName: '',
  });

  // フォーム入力変更
  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // ファイル選択
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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
      handleInputChange('fileName', file.name);
      toast.success(`${file.name} を選択しました`);
    }
  }, [handleInputChange]);

  // バリデーション
  const validateForm = useCallback((): boolean => {
    if (!formData.title.trim()) {
      toast.error('論文タイトルを入力してください');
      return false;
    }
    if (formData.title.length < 10) {
      toast.error('論文タイトルは10文字以上で入力してください');
      return false;
    }
    if (!formData.authors.trim()) {
      toast.error('著者名を入力してください');
      return false;
    }
    if (!formData.university.trim()) {
      toast.error('所属機関を入力してください');
      return false;
    }
    if (!formData.department.trim()) {
      toast.error('所属部署を入力してください');
      return false;
    }
    if (!formData.abstract.trim()) {
      toast.error('アブストラクトを入力してください');
      return false;
    }
    if (formData.abstract.length < 100) {
      toast.error('アブストラクトは100文字以上で入力してください');
      return false;
    }
    if (!formData.category) {
      toast.error('研究分野を選択してください');
      return false;
    }
    if (!formData.tags.trim()) {
      toast.error('キーワードを入力してください（カンマ区切りで1つ以上）');
      return false;
    }
    if (!formData.fileName) {
      toast.error('論文ファイル（PDF）をアップロードしてください');
      return false;
    }
    return true;
  }, [formData]);

  // フォーム送信
  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onPublish(formData);
      
      // フォームリセット
      setFormData({
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
      setUploadProgress(0);
      onClose();
    } catch (error) {
      toast.error('論文の発行に失敗しました');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, onPublish, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>論文を公開</DialogTitle>
          <DialogDescription>
            研究成果をブロックチェーンで永続的に記録
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="title">論文タイトル *</Label>
            <Input
              id="title"
              placeholder="例：ブロックチェーンを活用した学術レポジトリの構築"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
            />
          </div>

          {/* Authors */}
          <div>
            <Label htmlFor="authors">著者名（カンマ区切り） *</Label>
            <Input
              id="authors"
              placeholder="例：太郎 学, 花子 学"
              value={formData.authors}
              onChange={(e) => handleInputChange('authors', e.target.value)}
            />
          </div>

          {/* University & Department */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="university">所属機関 *</Label>
              <Input
                id="university"
                placeholder="例：東京大学"
                value={formData.university}
                onChange={(e) => handleInputChange('university', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="department">所属部署 *</Label>
              <Input
                id="department"
                placeholder="例：工学部"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
              />
            </div>
          </div>

          {/* Abstract */}
          <div>
            <Label htmlFor="abstract">アブストラクト（100文字以上） *</Label>
            <Textarea
              id="abstract"
              placeholder="研究の概要を記入してください..."
              className="min-h-24"
              value={formData.abstract}
              onChange={(e) => handleInputChange('abstract', e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">{formData.abstract.length}/最小100文字</p>
          </div>

          {/* Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">研究分野 *</Label>
              <Select value={formData.category} onValueChange={(value: string) => handleInputChange('category', value)}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="access">アクセス権限</Label>
              <Select value={formData.accessType} onValueChange={(value: string) => handleInputChange('accessType', value)}>
                <SelectTrigger id="access">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">公開</SelectItem>
                  <SelectItem value="restricted">制限付き</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label htmlFor="tags">キーワード（カンマ区切り） *</Label>
            <Input
              id="tags"
              placeholder="例：ブロックチェーン, 学術論文, 分散型"
              value={formData.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags
                .split(',')
                .map((tag) => tag.trim())
                .filter((tag) => tag.length > 0)
                .map((tag, index) => (
                  <Badge key={index}>#{tag}</Badge>
                ))}
            </div>
          </div>

          {/* DOI */}
          <div>
            <Label htmlFor="doi">DOI（オプション）</Label>
            <Input
              id="doi"
              placeholder="例：10.1234/example.doi"
              value={formData.doi}
              onChange={(e) => handleInputChange('doi', e.target.value)}
            />
          </div>

          {/* File Upload */}
          <div>
            <Label htmlFor="file">論文ファイル（PDF） *</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                id="file"
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              <label
                htmlFor="file"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  {formData.fileName ? (
                    <span className="text-green-600">✓ {formData.fileName}</span>
                  ) : (
                    <>
                      PDFファイルをドラッグ＆ドロップ
                      <br />
                      またはクリックして選択
                    </>
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">最大50MB</p>
              </label>
            </div>
          </div>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            キャンセル
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-blue-600 to-indigo-600"
          >
            {isSubmitting ? '発行中...' : '公開'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
