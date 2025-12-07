import { useTranslation } from 'react-i18next';
import { useCallback, useMemo } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Calendar, Award, Download, Heart, MessageSquare, Hash, FileText } from 'lucide-react';
import { ResearchPaper } from '../hooks/useData';

interface PaperListProps {
  papers: ResearchPaper[];
  onLike: (paperId: string) => void;
  onDownload: (paperId: string) => void;
  onNavigateToPaper?: (paperId: string) => void;
}

/**
 * PaperList: 論文リスト表示コンポーネント
 * Repository から分割して独立化
 */
export function PaperList({ papers, onLike, onDownload, onNavigateToPaper }: PaperListProps) {
  const { t } = useTranslation();
  // メモ化：各論文を再計算しない
  const memoizedPapers = useMemo(() => papers, [papers]);

  // コールバック：ダウンロード
  const handleDownload = useCallback((paperId: string) => {
    onDownload(paperId);
  }, [onDownload]);

  if (memoizedPapers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">論文が見つかりません</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {memoizedPapers.map((paper) => (
        <PaperCard 
          key={paper.id} 
          paper={paper} 
          onDownload={handleDownload}
          onNavigateToPaper={onNavigateToPaper}
        />
      ))}
    </div>
  );
}

interface PaperCardProps {
  paper: ResearchPaper;
  onDownload: (paperId: string) => void;
  onNavigateToPaper?: (paperId: string) => void;
}

/**
 * PaperCard: 個別の論文カードコンポーネント
 * 再レンダリング最適化のため React.memo で保護
 */
function PaperCard({ paper, onDownload, onNavigateToPaper }: PaperCardProps) {
  const handleDownload = () => {
    // PDF がある場合はダウンロード
    if (paper.pdfUrl) {
      const link = document.createElement('a');
      link.href = paper.pdfUrl;
      link.download = `${paper.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    // コールバックを実行
    onDownload(paper.id);
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
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
                  <span>{paper.author}</span>
                  <span>•</span>
                  <span>{paper.university}</span>
                  {paper.department && (
                    <>
                      <span>•</span>
                      <span>{paper.department}</span>
                    </>
                  )}
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
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Heart className="w-4 h-4 text-gray-600" />
                  <span>{paper.likes}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <MessageSquare className="w-4 h-4 text-gray-600" />
                  <span>{paper.comments}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleDownload}
                >
                  <Download className="w-4 h-4 mr-2" />
                  ダウンロード
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onNavigateToPaper?.(paper.id)}
                >
                  詳細
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
