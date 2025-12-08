import { useCallback, useState, useEffect } from 'react';
import { ArrowLeft, Heart, MessageSquare, Download, Hash, FileText, Calendar, Award, Share2, ExternalLink, Trash2, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Input } from './ui/input';
import { ResearchPaper, deletePaperFromStorage, togglePaperLike, getCommentsForPaper, addCommentToPaper, deleteComment, Comment } from '../hooks/useData';

interface PaperDetailProps {
  paper: ResearchPaper;
  onBack: () => void;
  onLike?: (paperId: string) => void;
  onDownload?: (paperId: string) => void;
  onDelete?: (paperId: string) => void;
}

export function PaperDetail({ paper, onBack, onLike, onDownload, onDelete }: PaperDetailProps) {
  // いいね数とダウンロード数の状態をローカルで管理して即座に UI を更新
  const [likes, setLikes] = useState(paper.likes);
  const [downloads, setDownloads] = useState(paper.downloads);
  const [comments, setComments] = useState(paper.comments);
  const [paperComments, setPaperComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // paper の変更を監視して state を同期
  useEffect(() => {
    setLikes(paper.likes);
    setDownloads(paper.downloads);
    setComments(paper.comments);
    // コメント一覧を再読み込み
    const loadedComments = getCommentsForPaper(paper.id);
    setPaperComments(loadedComments);
  }, [paper.id, paper.likes, paper.downloads, paper.comments]);

  const handleLike = useCallback(() => {
    const updatedPaper = togglePaperLike(paper.id);
    if (updatedPaper) {
      // UI を即座に更新
      setLikes(updatedPaper.likes);
      onLike?.(paper.id);
    }
  }, [paper.id, onLike]);

  const handleDownload = useCallback(() => {
    // PDF がある場合はダウンロード
    if (paper.pdfUrl) {
      const link = document.createElement('a');
      link.href = paper.pdfUrl;
      link.download = `${paper.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    // ダウンロード数をインクリメント
    setDownloads(prev => prev + 1);
    // コールバックがあれば実行
    onDownload?.(paper.id);
  }, [paper.id, paper.pdfUrl, paper.title, onDownload]);

  const handleDelete = useCallback(() => {
    if (confirm('この論文を削除してもよろしいですか？（ブロックチェーン上の記録は削除されません）')) {
      deletePaperFromStorage(paper.id);
      onDelete?.(paper.id);
      onBack();
    }
  }, [paper.id, onDelete, onBack]);

  const handleShareToTwitter = useCallback(() => {
    const text = `「${paper.title}」を読みました\n著者: ${paper.author}\n\n#学術論文 #研究 #AcademicChain`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }, [paper.title, paper.author]);

  const handleShareToFacebook = useCallback(() => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(paper.title)}`;
    window.open(url, '_blank');
  }, [paper.title]);

  const handleShareToLinkedIn = useCallback(() => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank');
  }, []);

  const handleViewOnline = useCallback(() => {
    // IPFS ゲートウェイで論文を表示
    const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${paper.ipfsHash}`;
    window.open(ipfsUrl, '_blank');
  }, [paper.ipfsHash]);

  const handleSubmitComment = useCallback(async () => {
    if (!commentText.trim()) return;
    
    setIsSubmittingComment(true);
    try {
      // コメント追加
      const newComment = addCommentToPaper(paper.id, 'ユーザー', commentText);
      // UI を更新
      setPaperComments(prev => [newComment, ...prev]);
      setComments(prev => prev + 1);
      setCommentText('');
      onLike?.(paper.id); // refreshTrigger を発火させるため
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  }, [commentText, paper.id, onLike]);

  const handleDeleteComment = useCallback((commentId: string) => {
    deleteComment(commentId, paper.id);
    setPaperComments(prev => prev.filter(c => c.id !== commentId));
    setComments(prev => Math.max(0, prev - 1));
  }, [paper.id]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onBack}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          戻る
        </Button>
        <div className="text-sm text-gray-500">
          {paper.category} • {paper.date}
        </div>
      </div>

      {/* Main Content Card */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8 space-y-6">
          {/* Title Section */}
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-3xl font-bold text-gray-900 flex-1">
                {paper.title}
              </h1>
              {paper.verified && (
                <Badge className="bg-green-50 text-green-700 border-green-200 whitespace-nowrap">
                  ✓ 検証済
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{paper.category}</Badge>
              {paper.accessType === 'open' && (
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                  オープン
                </Badge>
              )}
              {paper.accessType === 'restricted' && (
                <Badge variant="secondary" className="bg-gray-50 text-gray-700 border-gray-200">
                  制限付き
                </Badge>
              )}
            </div>
          </div>

          {/* Author Section */}
          <div className="border-t border-b border-gray-200 py-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-lg">
                  {paper.author.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{paper.author}</div>
                <div className="text-sm text-gray-600">
                  {paper.university}
                  {paper.department && ` • ${paper.department}`}
                </div>
              </div>
              <Button variant="outline" size="sm">
                フォロー
              </Button>
            </div>
          </div>

          {/* Abstract */}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-900">アブストラクト</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {paper.abstract}
            </p>
          </div>

          {/* Keywords */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900">キーワード</h3>
            <div className="flex flex-wrap gap-2">
              {paper.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="cursor-pointer hover:bg-gray-200">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Blockchain Info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-gray-900">ブロックチェーン情報</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-600">
                  <Hash className="w-4 h-4" />
                  <span>トランザクションハッシュ</span>
                </div>
                <div className="font-mono text-xs text-gray-900 break-all bg-white rounded p-2">
                  {paper.txHash}
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-600">
                  <FileText className="w-4 h-4" />
                  <span>IPFS ハッシュ</span>
                </div>
                <div className="font-mono text-xs text-gray-900 break-all bg-white rounded p-2">
                  {paper.ipfsHash}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-gray-200">
            <div>
              <div className="text-2xl font-bold text-gray-900">{paper.citations}</div>
              <div className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                <Award className="w-3 h-3" />
                引用数
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{downloads}</div>
              <div className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                <Download className="w-3 h-3" />
                ダウンロード
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{likes}</div>
              <div className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                <Heart className="w-3 h-3" />
                いいね
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{comments}</div>
              <div className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                <MessageSquare className="w-3 h-3" />
                コメント
              </div>
            </div>
          </div>

          {/* Publication Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-blue-900">
              <Calendar className="w-4 h-4" />
              <span className="font-semibold">公開日</span>
            </div>
            <div className="text-gray-700">{paper.date}</div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-3 pt-4">
            <Button 
              className="flex-1 bg-red-600 hover:bg-red-700"
              onClick={handleLike}
            >
              <Heart className="w-4 h-4 mr-2" />
              いいね ({likes})
            </Button>
            <Button 
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              onClick={handleDownload}
            >
              <Download className="w-4 h-4 mr-2" />
              ダウンロード
            </Button>
            
            {/* Share Dropdown */}
            <div className="relative group flex-1">
              <Button 
                variant="outline"
                className="w-full"
              >
                <Share2 className="w-4 h-4 mr-2" />
                共有
              </Button>
              <div className="hidden group-hover:flex absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 flex-col">
                <button
                  onClick={handleShareToTwitter}
                  className="px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-100 flex items-center gap-2 cursor-pointer"
                >
                  <span>𝕏 Twitter</span>
                </button>
                <button
                  onClick={handleShareToFacebook}
                  className="px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-100 flex items-center gap-2 cursor-pointer"
                >
                  <span>f Facebook</span>
                </button>
                <button
                  onClick={handleShareToLinkedIn}
                  className="px-4 py-2 text-left hover:bg-gray-50 cursor-pointer"
                >
                  <span>in LinkedIn</span>
                </button>
              </div>
            </div>
            
            <Button 
              variant="outline"
              className="flex-1"
              onClick={handleViewOnline}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              オンラインで表示
            </Button>

            <Button 
              variant="outline"
              className="flex-1 text-red-600 hover:bg-red-50"
              onClick={handleDelete}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              削除
            </Button>
          </div>

          {/* Comments Section */}
          <Card>
            <CardHeader>
              <CardTitle>コメント ({comments})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Comment Form */}
              <div className="flex gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-blue-500 text-white">U</AvatarFallback>
                </Avatar>
                <div className="flex-1 flex gap-2">
                  <Input 
                    placeholder="コメントを追加..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !isSubmittingComment) {
                        handleSubmitComment();
                      }
                    }}
                    disabled={isSubmittingComment}
                  />
                  <Button 
                    size="sm"
                    onClick={handleSubmitComment}
                    disabled={!commentText.trim() || isSubmittingComment}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-3 border-t pt-4">
                {paperComments.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">コメントはまだありません</p>
                ) : (
                  paperComments.map((comment) => (
                    <div key={comment.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-gray-500 text-white text-xs">
                              {comment.author.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{comment.author}</div>
                            <div className="text-xs text-gray-600">
                              {new Date(comment.timestamp).toLocaleDateString('ja-JP')}
                            </div>
                          </div>
                        </div>
                        <Button 
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{comment.content}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <button className="hover:text-red-600 flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          いいね ({comment.likes})
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Related Papers (Optional) */}
      <Card>
        <CardHeader>
          <CardTitle>同じ分野の論文</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            関連論文はまだロードされていません
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
