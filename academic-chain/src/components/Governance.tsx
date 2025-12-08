import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Vote,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Calendar,
  Hash
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';

type ProposalStatus = 'active' | 'pending' | 'passed' | 'rejected';

interface Proposal {
  id: string;
  title: string;
  description: string;
  proposer: string;
  proposerUniversity: string;
  status: ProposalStatus;
  votesFor: number;
  votesAgainst: number;
  totalVotes: number;
  quorum: number;
  endDate: string;
  createdDate: string;
  category: string;
  requiredTokens: number;
}

interface GovernanceProps {
  votingPower: number;
}

const statusConfig = {
  active: { label: '投票中', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Clock },
  pending: { label: '開始前', color: 'bg-gray-50 text-gray-700 border-gray-200', icon: Clock },
  passed: {
    label: '可決',
    color: 'bg-green-50 text-green-700 border-green-200',
    icon: CheckCircle2
  },
  rejected: { label: '否決', color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle }
};

const categories = [
  'プラットフォーム改善',
  '資金配分',
  '査読システム',
  'インセンティブ',
  'コミュニティ運営',
  'その他'
];

const initialFormState = {
  title: '',
  description: '',
  category: '',
  requiredTokens: '100',
  votingPeriod: '7'
};

const getStoredProposals = (): Proposal[] => {
  try {
    const stored = localStorage.getItem('academic-chain:proposals');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.warn('Failed to parse proposals from localStorage:', error);
    return [];
  }
};

export function Governance({ votingPower }: GovernanceProps) {
  const { t } = useTranslation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isVotingPowerInfoOpen, setIsVotingPowerInfoOpen] = useState(false);
  const [newProposal, setNewProposal] = useState(initialFormState);
  const [proposals, setProposals] = useState<Proposal[]>(getStoredProposals());

  const handleCreateProposal = () => {
    // Validation
    const validations = [
      { condition: !newProposal.title.trim(), message: '提案タイトルを入力してください' },
      {
        condition: newProposal.title.length < 10,
        message: '提案タイトルは10文字以上で入力してください'
      },
      { condition: !newProposal.description.trim(), message: '提案内容を入力してください' },
      {
        condition: newProposal.description.length < 50,
        message: '提案内容は50文字以上で入力してください'
      },
      { condition: !newProposal.category, message: 'カテゴリを選択してください' }
    ];

    for (const { condition, message } of validations) {
      if (condition) {
        toast.error(message);
        return;
      }
    }

    const tokensRequired = parseInt(newProposal.requiredTokens);
    if (isNaN(tokensRequired) || tokensRequired < 50 || tokensRequired > 1000) {
      toast.error('必要トークンは50〜1000の範囲で入力してください');
      return;
    }

    if (votingPower < tokensRequired) {
      toast.error(
        `提案に必要なトークンが不足しています（必要: ${tokensRequired}、保有: ${votingPower}）`
      );
      return;
    }

    const votingDays = parseInt(newProposal.votingPeriod);
    if (isNaN(votingDays) || votingDays < 3 || votingDays > 30) {
      toast.error('投票期間は3〜30日の範囲で入力してください');
      return;
    }

    // Create new proposal
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + votingDays);

    const proposal: Proposal = {
      id: String(proposals.length + 1),
      title: newProposal.title.trim(),
      description: newProposal.description.trim(),
      proposer: '田中 太郎',
      proposerUniversity: '東京大学',
      status: 'pending' as ProposalStatus,
      votesFor: 0,
      votesAgainst: 0,
      totalVotes: 0,
      quorum: 300,
      endDate: endDate.toISOString().split('T')[0],
      createdDate: today.toISOString().split('T')[0],
      category: newProposal.category,
      requiredTokens: tokensRequired
    };

    setProposals([proposal, ...proposals]);
    setIsCreateDialogOpen(false);
    setNewProposal(initialFormState);

    toast.success('提案を作成しました。投票開始まで審査が行われます。');
  };

  const statsCards = [
    {
      icon: Clock,
      color: 'blue',
      label: '進行中の投票',
      value: proposals.filter((p) => p.status === 'active').length
    },
    {
      icon: CheckCircle2,
      color: 'green',
      label: '参加した投票',
      value: proposals.filter((p) => p.status === 'passed').length
    },
    { icon: TrendingUp, color: 'purple', label: '提出した提案', value: proposals.length }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">DAOガバナンス</h1>
          <p className="text-gray-600">コミュニティの意思決定に参加しよう</p>
        </div>
        <Button
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          新規提案
        </Button>
      </div>

      {/* Your Voting Power Section */}
      <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-white">あなたの投票権</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-white hover:text-blue-300 hover:bg-transparent transition-colors duration-200 px-2 py-1 border-2 border-gray-200 rounded"
                  onClick={() => setIsVotingPowerInfoOpen(true)}
                >
                  HOW TO GET
                </Button>
              </div>
              <p className="text-indigo-100 mb-4">研究活動への貢献に応じて投票権が付与されます</p>
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-white/80 text-sm">総投票権</div>
                  <div className="text-3xl">{votingPower.toFixed(1)}</div>
                </div>
                <div>
                  <div className="text-white/80 text-sm">今月の獲得</div>
                  <div className="text-2xl">+50</div>
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center">
                <Vote className="w-12 h-12" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {statsCards.map(({ icon: Icon, color, label, value }, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 bg-${color}-50 text-${color}-600 rounded-xl flex items-center justify-center`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-3xl mb-1">{value}</div>
                  <p className="text-gray-600">{label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Proposals */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">投票中</TabsTrigger>
          <TabsTrigger value="pending">開始前</TabsTrigger>
          <TabsTrigger value="closed">終了</TabsTrigger>
          <TabsTrigger value="all">すべて</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {proposals
            .filter((p) => p.status === 'active')
            .map((proposal) => {
              const StatusIcon = statusConfig[proposal.status].icon;
              const votePercentage =
                proposal.quorum > 0 ? Math.round((proposal.totalVotes / proposal.quorum) * 100) : 0;
              const approvalRate =
                proposal.totalVotes > 0
                  ? Math.round((proposal.votesFor / proposal.totalVotes) * 100)
                  : 0;

              return (
                <Card
                  key={proposal.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle>{proposal.title}</CardTitle>
                          <Badge
                            variant="secondary"
                            className={statusConfig[proposal.status].color}
                          >
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig[proposal.status].label}
                          </Badge>
                        </div>
                        <CardDescription>{proposal.description}</CardDescription>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Badge variant="outline">{proposal.category}</Badge>
                      <div className="text-sm text-gray-600">
                        必要トークン: {proposal.requiredTokens}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Proposer */}
                    <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                      <Avatar>
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                          {proposal.proposer.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm text-gray-900">{proposal.proposer}</div>
                        <div className="text-xs text-gray-600">{proposal.proposerUniversity}</div>
                      </div>
                      <div className="ml-auto text-sm text-gray-600">
                        投票期限: {new Date(proposal.endDate).toLocaleDateString('ja-JP')}
                      </div>
                    </div>

                    {/* Voting Results */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">賛成率</span>
                        <span className="text-gray-900">{approvalRate}%</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <ThumbsUp className="w-4 h-4 text-green-600" />
                            <span>賛成</span>
                          </div>
                          <span>{proposal.votesFor} 票</span>
                        </div>
                        <Progress value={approvalRate} className="h-2 bg-red-100" />
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <ThumbsDown className="w-4 h-4 text-red-600" />
                            <span>反対</span>
                          </div>
                          <span>{proposal.votesAgainst} 票</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-600">定足数達成度</span>
                          <span className="text-gray-900">
                            {proposal.totalVotes} / {proposal.quorum} ({votePercentage}%)
                          </span>
                        </div>
                        <Progress value={votePercentage} className="h-2" />
                      </div>
                    </div>

                    {/* Voting Actions */}
                    <div className="flex gap-3 pt-4">
                      <Button className="flex-1 bg-green-600 hover:bg-green-700">
                        <ThumbsUp className="w-4 h-4 mr-2" />
                        賛成
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <ThumbsDown className="w-4 h-4 mr-2" />
                        反対
                      </Button>
                      <Button variant="outline">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        議論
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </TabsContent>

        <TabsContent value="pending">
          {proposals
            .filter((p) => p.status === 'pending')
            .map((proposal) => (
              <Card key={proposal.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="mb-2">{proposal.title}</CardTitle>
                      <CardDescription>{proposal.description}</CardDescription>
                    </div>
                    <Badge variant="secondary" className={statusConfig[proposal.status].color}>
                      開始前
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    投票開始: {new Date(proposal.createdDate).toLocaleDateString('ja-JP')}
                  </p>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="closed">
          {proposals
            .filter((p) => p.status === 'passed' || p.status === 'rejected')
            .map((proposal) => (
              <Card key={proposal.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="mb-2">{proposal.title}</CardTitle>
                      <CardDescription>{proposal.description}</CardDescription>
                    </div>
                    <Badge variant="secondary" className={statusConfig[proposal.status].color}>
                      {statusConfig[proposal.status].label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <ThumbsUp className="w-4 h-4 text-green-600" />
                      <span>{proposal.votesFor} 票</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ThumbsDown className="w-4 h-4 text-red-600" />
                      <span>{proposal.votesAgainst} 票</span>
                    </div>
                    <div className="text-gray-600">
                      投票率: {Math.round((proposal.totalVotes / proposal.quorum) * 100)}%
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="all">
          <div className="space-y-4">
            {proposals.map((proposal) => {
              const StatusIcon = statusConfig[proposal.status].icon;
              return (
                <Card key={proposal.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="mb-2">{proposal.title}</CardTitle>
                        <CardDescription>{proposal.description}</CardDescription>
                      </div>
                      <Badge variant="secondary" className={statusConfig[proposal.status].color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConfig[proposal.status].label}
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Proposal Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>新規提案を作成</DialogTitle>
            <DialogDescription>
              DAOコミュニティへの提案を作成します。提案には一定のトークンが必要です。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Voting Power Notice */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <Hash className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm text-indigo-900">あなたの投票権</div>
                  <div className="text-2xl text-indigo-700">{votingPower.toFixed(1)} トークン</div>
                </div>
              </div>
            </div>

            {/* Proposal Title */}
            <div>
              <Label htmlFor="title">提案タイトル *</Label>
              <Input
                id="title"
                value={newProposal.title}
                onChange={(e) => setNewProposal({ ...newProposal, title: e.target.value })}
                placeholder="例: 新しい研究分野カテゴリの追加提案"
                maxLength={100}
              />
              <p className="text-xs text-gray-500 mt-1">
                {newProposal.title.length} / 100文字（最低10文字）
              </p>
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category">カテゴリ *</Label>
              <Select
                value={newProposal.category}
                onValueChange={(value: string) =>
                  setNewProposal({ ...newProposal, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="提案のカテゴリを選択" />
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

            {/* Description */}
            <div>
              <Label htmlFor="description">提案内容 *</Label>
              <Textarea
                id="description"
                value={newProposal.description}
                onChange={(e) => setNewProposal({ ...newProposal, description: e.target.value })}
                placeholder="提案の詳細を具体的に記述してください。背景、目的、期待される効果などを含めてください。"
                rows={8}
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-1">
                {newProposal.description.length} / 1000文字（最低50文字）
              </p>
            </div>

            {/* Required Tokens */}
            <div>
              <Label htmlFor="requiredTokens">提案に必要なトークン *</Label>
              <Input
                id="requiredTokens"
                type="number"
                min="50"
                max="1000"
                value={newProposal.requiredTokens}
                onChange={(e) => setNewProposal({ ...newProposal, requiredTokens: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">
                50〜1000トークンの範囲で設定してください。重要な提案ほど多くのトークンが必要です。
              </p>
            </div>

            {/* Voting Period */}
            <div>
              <Label htmlFor="votingPeriod">投票期間（日数） *</Label>
              <Input
                id="votingPeriod"
                type="number"
                min="3"
                max="30"
                value={newProposal.votingPeriod}
                onChange={(e) => setNewProposal({ ...newProposal, votingPeriod: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">
                3〜30日の範囲で設定してください。標準は7日間です。
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-gray-700">定足数: 300票（投票総数の条件）</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="text-gray-700">投票開始: 審査後（通常1-2日）</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Vote className="w-4 h-4 text-indigo-600" />
                <span className="text-gray-700">可決条件: 定足数達成 + 賛成票が過半数</span>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                ⚠️
                提案作成時に設定した必要トークンが消費されます。提案が可決された場合、トークンは返還されます。
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                setNewProposal({
                  title: '',
                  description: '',
                  category: '',
                  requiredTokens: '100',
                  votingPeriod: '7'
                });
              }}
            >
              キャンセル
            </Button>
            <Button
              onClick={handleCreateProposal}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              提案を作成
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Voting Power Info Dialog */}
      <Dialog open={isVotingPowerInfoOpen} onOpenChange={setIsVotingPowerInfoOpen}>
        <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
          <DialogHeader>
            <DialogTitle>投票権（DAOトークン）獲得方法</DialogTitle>
            <DialogDescription>研究貢献度に応じてDAO投票権が付与されます</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <div className="text-sm font-semibold text-gray-900 mb-1">📄 論文公開</div>
              <p className="text-xs text-gray-600 mb-2">
                1件あたり <span className="font-bold text-blue-600">10トークン</span>
              </p>
              <p className="text-xs text-gray-500">研究成果を公開するたびにDAOトークン獲得</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
              <div className="text-sm font-semibold text-gray-900 mb-1">👍 いいね獲得</div>
              <p className="text-xs text-gray-600 mb-2">
                1件あたり <span className="font-bold text-purple-600">0.1トークン</span>
              </p>
              <p className="text-xs text-gray-500">論文が評価されるとトークン加算</p>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-4 border border-pink-200">
              <div className="text-sm font-semibold text-gray-900 mb-1">💬 コメント獲得</div>
              <p className="text-xs text-gray-600 mb-2">
                1件あたり <span className="font-bold text-pink-600">0.2トークン</span>
              </p>
              <p className="text-xs text-gray-500">コメント受け取り時にトークン加算</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
              <div className="text-sm font-semibold text-gray-900 mb-1">🎓 セミナー開催</div>
              <p className="text-xs text-gray-600 mb-2">
                1件あたり <span className="font-bold text-green-600">25トークン</span>
              </p>
              <p className="text-xs text-gray-500">学術イベント主催でトークン獲得</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
              <div className="text-sm font-semibold text-gray-900 mb-1">🤝 プロジェクト参加</div>
              <p className="text-xs text-gray-600 mb-2">
                1件あたり <span className="font-bold text-orange-600">15トークン</span>
              </p>
              <p className="text-xs text-gray-500">共同研究プロジェクト参加でトークン獲得</p>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 border border-indigo-200">
              <div className="text-sm font-semibold text-gray-900 mb-1">🏆 最大値</div>
              <p className="text-xs text-gray-600 mb-2">
                上限 <span className="font-bold text-indigo-600">5,000トークン</span>
              </p>
              <p className="text-xs text-gray-500">投票権は最大5,000トークンです</p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
            <p className="text-xs text-indigo-900">
              💡 <span className="font-semibold">ヒント:</span>{' '}
              更多的研究活動（論文公開、セミナー開催など）を行うことで、投票権が増加し、DAO内での発言力が高まります。
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsVotingPowerInfoOpen(false)}>
              閉じる
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
