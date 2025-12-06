'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Vote, Clock, Plus, Hash, Shield, Link as LinkIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { fetchDaos, fetchMemberships } from '@/lib/assets/api';
import { castDaoVote, createDaoProposal, fetchDaoProposals, VoteChoice } from '@/lib/governance/api';

type ProposalStatusKey = 'ACTIVE' | 'SUCCEEDED' | 'DEFEATED' | 'EXECUTED' | 'CANCELED' | 'DRAFT';
type ProposalStatusFilter = 'all' | ProposalStatusKey;

type ProposalCardDraft = {
  choice: VoteChoice;
  weight: string;
};

const statusMeta: Record<ProposalStatusKey, { label: string; tone: string }> = {
  ACTIVE: { label: '投票中', tone: 'bg-blue-50 text-blue-700 border-blue-200' },
  SUCCEEDED: { label: '可決', tone: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  DEFEATED: { label: '否決', tone: 'bg-rose-50 text-rose-700 border-rose-200' },
  EXECUTED: { label: '実行済', tone: 'bg-purple-50 text-purple-700 border-purple-200' },
  CANCELED: { label: 'キャンセル', tone: 'bg-amber-50 text-amber-700 border-amber-200' },
  DRAFT: { label: 'ドラフト', tone: 'bg-slate-50 text-slate-600 border-slate-200' }
};

const tabConfig: { value: ProposalStatusFilter; label: string }[] = [
  { value: 'all', label: 'すべて' },
  { value: 'ACTIVE', label: '投票中' },
  { value: 'SUCCEEDED', label: '可決' },
  { value: 'DEFEATED', label: '否決' },
  { value: 'EXECUTED', label: '実行済' },
  { value: 'CANCELED', label: 'キャンセル' }
];

export function Governance() {
  const queryClient = useQueryClient();
  const [selectedDaoId, setSelectedDaoId] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProposalStatusFilter>('ACTIVE');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProposal, setNewProposal] = useState({
    title: '',
    description: '',
    ipfsCid: '',
    proposerId: '',
    votingWindowDays: '7'
  });
  const [selectedVoterId, setSelectedVoterId] = useState('');
  const [voteDrafts, setVoteDrafts] = useState<Record<string, ProposalCardDraft>>({});

  const { data: daoData } = useQuery({ queryKey: ['governance-daos'], queryFn: fetchDaos });
  const daoOptions = useMemo(() => daoData?.daos ?? [], [daoData]);

  useEffect(() => {
    if (!selectedDaoId && daoOptions.length > 0) {
      setSelectedDaoId(daoOptions[0].id);
    }
  }, [daoOptions, selectedDaoId]);

  const { data: membershipData, isLoading: isLoadingMembers } = useQuery({
    queryKey: ['governance-memberships', selectedDaoId],
    queryFn: () => fetchMemberships({ daoId: selectedDaoId }),
    enabled: !!selectedDaoId
  });

  const memberOptions = useMemo(() => membershipData?.memberships ?? [], [membershipData]);

  useEffect(() => {
    if (memberOptions.length > 0 && !newProposal.proposerId) {
      setNewProposal((prev) => ({ ...prev, proposerId: memberOptions[0].user.id }));
    }
    if (memberOptions.length > 0 && !selectedVoterId) {
      setSelectedVoterId(memberOptions[0].user.id);
    }
    if (memberOptions.length === 0) {
      setNewProposal((prev) => ({ ...prev, proposerId: '' }));
      setSelectedVoterId('');
    }
  }, [memberOptions, newProposal.proposerId, selectedVoterId]);

  const proposalsQuery = useQuery({
    queryKey: ['governance-proposals', selectedDaoId, statusFilter],
    queryFn: () =>
      fetchDaoProposals({
        daoId: selectedDaoId,
        status: statusFilter === 'all' ? undefined : statusFilter
      }),
    enabled: !!selectedDaoId
  });

  const proposals = useMemo(() => proposalsQuery.data?.proposals ?? [], [proposalsQuery.data]);

  const stats = useMemo(() => {
    const active = proposals.filter((proposal) => proposal.status === 'ACTIVE').length;
    const executed = proposals.filter((proposal) => proposal.status === 'EXECUTED').length;
    const participation = proposals.reduce((sum, proposal) => sum + proposal.votes.length, 0);
    return { total: proposals.length, active, executed, participation };
  }, [proposals]);

  const createMutation = useMutation({
    mutationFn: createDaoProposal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['governance-proposals'] });
      setIsCreateDialogOpen(false);
      setNewProposal({ title: '', description: '', ipfsCid: '', proposerId: newProposal.proposerId, votingWindowDays: '7' });
      toast.success('提案を作成しました');
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : '提案の作成に失敗しました');
    }
  });

  const voteMutation = useMutation({
    mutationFn: castDaoVote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['governance-proposals'] });
      toast.success('投票を記録しました');
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : '投票に失敗しました');
    }
  });

  const handleCreateProposal = () => {
    if (!selectedDaoId) {
      toast.error('DAO を選択してください');
      return;
    }
    if (!newProposal.title.trim()) {
      toast.error('タイトルを入力してください');
      return;
    }
    if (!newProposal.description.trim()) {
      toast.error('提案内容を入力してください');
      return;
    }
    const votingDays = Number(newProposal.votingWindowDays) || 0;
    const now = new Date();
    const votingWindowStart = now.toISOString();
    const votingWindowEnd = new Date(now.getTime() + votingDays * 24 * 60 * 60 * 1000).toISOString();

    createMutation.mutate({
      daoId: selectedDaoId,
      proposerId: newProposal.proposerId || undefined,
      title: newProposal.title.trim(),
      description: newProposal.description.trim(),
      ipfsCid: newProposal.ipfsCid.trim() || undefined,
      votingWindowStart,
      votingWindowEnd
    });
  };

  const handleVoteDraftChange = (proposalId: string, field: keyof ProposalCardDraft, value: string) => {
    setVoteDrafts((prev) => ({
      ...prev,
      [proposalId]: {
        choice: field === 'choice' ? (value as VoteChoice) : prev[proposalId]?.choice ?? 'FOR',
        weight: field === 'weight' ? value : prev[proposalId]?.weight ?? '1'
      }
    }));
  };

  const handleCastVote = (proposalId: string) => {
    if (!selectedVoterId) {
      toast.error('投票者を選択してください');
      return;
    }
    const draft = voteDrafts[proposalId] ?? { choice: 'FOR', weight: '1' };
    const weight = Number(draft.weight);
    if (!weight || weight < 1) {
      toast.error('投票重みには 1 以上の数値を入力してください');
      return;
    }
    voteMutation.mutate({ proposalId, voterId: selectedVoterId, choice: draft.choice, weight });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:flex-1">
              <Select value={selectedDaoId} onValueChange={setSelectedDaoId}>
                <SelectTrigger className="w-full lg:w-64">
                  <SelectValue placeholder="DAO を選択" />
                </SelectTrigger>
                <SelectContent>
                  {daoOptions.map((dao) => (
                    <SelectItem key={dao.id} value={dao.id}>
                      {dao.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ProposalStatusFilter)}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="ステータス" />
                </SelectTrigger>
                <SelectContent>
                  {tabConfig.map((tab) => (
                    <SelectItem key={tab.value} value={tab.value}>
                      {tab.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> 新規提案
            </Button>
          </div>
          <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as ProposalStatusFilter)}>
            <TabsList className="flex-wrap">
              {tabConfig.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">提案数</div>
            <div className="text-3xl font-semibold text-gray-900">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">投票中</div>
            <div className="text-3xl font-semibold text-gray-900">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">実行済</div>
            <div className="text-3xl font-semibold text-gray-900">{stats.executed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>投票参加 (過去 30 件)</span>
              <span className="font-semibold text-gray-900">{stats.participation}</span>
            </div>
            <Progress value={stats.total === 0 ? 0 : Math.min((stats.participation / (stats.total * 5)) * 100, 100)} />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {proposalsQuery.isLoading ? (
          <Card>
            <CardContent className="p-6 text-sm text-gray-500">提案を読み込み中...</CardContent>
          </Card>
        ) : proposalsQuery.isError ? (
          <Card>
            <CardContent className="p-6 text-sm text-red-600">提案を取得できませんでした。</CardContent>
          </Card>
        ) : proposals.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              表示できる提案がありません。
            </CardContent>
          </Card>
        ) : (
          proposals.map((proposal) => {
              const status = proposal.status as ProposalStatusKey;
              const badge = statusMeta[status] ?? { label: proposal.status, tone: 'bg-slate-50 text-slate-700 border-slate-200' };
              const tally = proposal.votes.reduce(
                (acc, vote) => {
                  acc[vote.choice] += vote.weight;
                  return acc;
                },
                { FOR: 0, AGAINST: 0, ABSTAIN: 0 }
              );
              const totalVotes = tally.FOR + tally.AGAINST + tally.ABSTAIN;
              const approvalRate = totalVotes === 0 ? 0 : Math.round((tally.FOR / totalVotes) * 100);
              const draft = voteDrafts[proposal.id] ?? { choice: 'FOR', weight: '1' };

              return (
                <Card key={proposal.id}>
                  <CardHeader className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">{proposal.dao.name}</Badge>
                      <Badge className={badge.tone}>{badge.label}</Badge>
                    </div>
                    <CardTitle>{proposal.title}</CardTitle>
                    <CardDescription className="text-gray-700">
                      {proposal.description ?? '説明が追加されていません。'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                      <span className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        {proposal.proposer?.displayName ?? proposal.proposer?.walletAddress ?? '提案者不明'}
                      </span>
                      <span className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {proposal.votingWindowEnd
                          ? `締切 ${new Date(proposal.votingWindowEnd).toLocaleString('ja-JP')}`
                          : '投票期間未設定'}
                      </span>
                      {proposal.ipfsCid && (
                        <span className="flex items-center gap-2 font-mono text-xs">
                          <LinkIcon className="h-4 w-4" />
                          {proposal.ipfsCid.slice(0, 10)}…
                        </span>
                      )}
                      <span className="flex items-center gap-2 font-mono text-xs">
                        <Hash className="h-4 w-4" /> {proposal.id.slice(0, 8)}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">賛成率</span>
                        <span className="font-semibold text-gray-900">{approvalRate}%</span>
                      </div>
                      <Progress value={approvalRate} />
                      <div className="grid grid-cols-3 text-xs text-gray-500">
                        <span>賛成 {tally.FOR}</span>
                        <span>反対 {tally.AGAINST}</span>
                        <span>棄権 {tally.ABSTAIN}</span>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                      <div className="flex flex-col gap-2 text-sm text-gray-600">
                        <Label className="text-xs text-gray-500">投票者</Label>
                        <Select
                          value={selectedVoterId}
                          onValueChange={setSelectedVoterId}
                          disabled={memberOptions.length === 0 || isLoadingMembers}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="メンバーを選択" />
                          </SelectTrigger>
                          <SelectContent>
                            {memberOptions.map((member) => (
                              <SelectItem key={member.user.id} value={member.user.id}>
                                {member.user.displayName ?? member.user.walletAddress}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Label className="text-xs text-gray-500">投票オプション</Label>
                        <div className="grid gap-2 md:grid-cols-2">
                          <Select
                            value={draft.choice}
                            onValueChange={(value) => handleVoteDraftChange(proposal.id, 'choice', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="FOR">賛成</SelectItem>
                              <SelectItem value="AGAINST">反対</SelectItem>
                              <SelectItem value="ABSTAIN">棄権</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder="重み"
                            value={draft.weight}
                            onChange={(event) => handleVoteDraftChange(proposal.id, 'weight', event.target.value)}
                          />
                        </div>
                      </div>
                      <div className="flex flex-col justify-end gap-2">
                        <Button
                          variant="outline"
                          asChild
                          disabled={!proposal.ipfsCid}
                        >
                          <a
                            href={proposal.ipfsCid ? `https://ipfs.io/ipfs/${proposal.ipfsCid}` : '#'}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <LinkIcon className="mr-2 h-4 w-4" /> IPFS を開く
                          </a>
                        </Button>
                        <Button
                          onClick={() => handleCastVote(proposal.id)}
                          disabled={voteMutation.isPending}
                        >
                          <Vote className="mr-2 h-4 w-4" />
                          {voteMutation.isPending ? '送信中...' : '投票する'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
          })
        )}
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>DAO 提案を作成</DialogTitle>
            <DialogDescription>投票開始から締め切りまでの期間を設定できます。</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Label className="text-sm font-medium text-gray-700">
              提案タイトル
              <Input
                className="mt-1"
                value={newProposal.title}
                onChange={(event) => setNewProposal((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="クロスラボ VC 標準の採用"
              />
            </Label>
            <Label className="text-sm font-medium text-gray-700">
              提案内容
              <Textarea
                className="mt-1"
                rows={5}
                value={newProposal.description}
                onChange={(event) => setNewProposal((prev) => ({ ...prev, description: event.target.value }))}
              />
            </Label>
            <div className="grid gap-4 md:grid-cols-2">
              <Label className="text-sm font-medium text-gray-700">
                提案者
                <Select
                  value={newProposal.proposerId}
                  onValueChange={(value) => setNewProposal((prev) => ({ ...prev, proposerId: value }))}
                  disabled={memberOptions.length === 0 || isLoadingMembers}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="メンバーを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {memberOptions.map((member) => (
                      <SelectItem key={member.user.id} value={member.user.id}>
                        {member.user.displayName ?? member.user.walletAddress}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Label>
              <Label className="text-sm font-medium text-gray-700">
                投票期間 (日)
                <Input
                  className="mt-1"
                  value={newProposal.votingWindowDays}
                  onChange={(event) => setNewProposal((prev) => ({ ...prev, votingWindowDays: event.target.value }))}
                />
              </Label>
            </div>
            <Label className="text-sm font-medium text-gray-700">
              IPFS CID (任意)
              <Input
                className="mt-1 font-mono"
                value={newProposal.ipfsCid}
                onChange={(event) => setNewProposal((prev) => ({ ...prev, ipfsCid: event.target.value }))}
                placeholder="bafy..."
              />
            </Label>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="ghost" onClick={() => setIsCreateDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleCreateProposal} disabled={createMutation.isPending}>
              {createMutation.isPending ? '作成中...' : '作成する'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
