'use client';

import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import {
  Search,
  Filter,
  Upload,
  Download,
  ExternalLink,
  FileText,
  Calendar,
  Hash,
  Award,
  MessageSquare,
  Shield,
  Globe,
  CheckCircle2
} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import {
  createResearchAsset,
  fetchDaos,
  fetchMemberships,
  fetchProposals,
  uploadAssetFile
} from '@/lib/assets/api';

type AssetVisibilityValue = 'PUBLIC' | 'INTERNAL' | 'LINK';

type ResearchAssetRecord = {
  id: string;
  title: string;
  abstract: string | null;
  ipfsCid: string;
  artifactHash: string | null;
  tags: string[];
  visibility: AssetVisibilityValue;
  createdAt: string;
  owner: { id: string; displayName: string | null; walletAddress: string };
  dao: { id: string; name: string };
  proposal: { id: string; title: string; status: string } | null;
  reviews: Array<{ id: string; status: string }>;
};

const visibilityLabels: Record<AssetVisibilityValue, { label: string; tone: string }> = {
  PUBLIC: { label: '公開', tone: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  INTERNAL: { label: '内部限定', tone: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  LINK: { label: 'リンク限定', tone: 'bg-amber-50 text-amber-700 border-amber-200' }
};

const tabFilters = [
  { value: 'all', label: 'すべて' },
  { value: 'linked', label: '提案リンク' },
  { value: 'internal', label: '内部限定' },
  { value: 'public', label: '公開' },
  { value: 'reviewed', label: 'レビュー済み' }
] as const;

type TabFilter = (typeof tabFilters)[number]['value'];

type MembershipOption = {
  id: string;
  user: {
    id: string;
    displayName: string | null;
    walletAddress: string;
  };
};

export function Repository() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [selectedDaoId, setSelectedDaoId] = useState('');
  const [selectedOwnerId, setSelectedOwnerId] = useState('');
  const [selectedProposalId, setSelectedProposalId] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState<'ALL' | AssetVisibilityValue>('ALL');
  const [ipfsUpload, setIpfsUpload] = useState<{ cid: string; artifactHash: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [newAsset, setNewAsset] = useState({
    title: '',
    abstract: '',
    tags: '',
    ipfsCid: '',
    labId: '',
    visibility: 'INTERNAL' as AssetVisibilityValue
  });

  const { data: daoData } = useQuery({
    queryKey: ['daos'],
    queryFn: fetchDaos
  });

  const daoOptions = useMemo(() => daoData?.daos ?? [], [daoData]);

  useEffect(() => {
    if (!selectedDaoId && daoOptions.length > 0) {
      setSelectedDaoId(daoOptions[0].id);
    }
  }, [daoOptions, selectedDaoId]);

  useEffect(() => {
    setSelectedProposalId('');
  }, [selectedDaoId]);

  const { data: membershipData, isLoading: isLoadingMembers } = useQuery({
    queryKey: ['repo-memberships', selectedDaoId],
    queryFn: () => fetchMemberships({ daoId: selectedDaoId }),
    enabled: !!selectedDaoId
  });

  const memberOptions = useMemo<MembershipOption[]>(
    () => membershipData?.memberships ?? [],
    [membershipData]
  );

  useEffect(() => {
    if (memberOptions.length > 0 && !selectedOwnerId) {
      setSelectedOwnerId(memberOptions[0].user.id);
    }
    if (memberOptions.length === 0) {
      setSelectedOwnerId('');
    }
  }, [memberOptions, selectedOwnerId]);

  const { data: proposalData, isLoading: isLoadingProposals } = useQuery({
    queryKey: ['repo-proposals', selectedDaoId],
    queryFn: () => fetchProposals({ daoId: selectedDaoId }),
    enabled: !!selectedDaoId
  });

  const assetQuery = useQuery({
    queryKey: ['repo-assets', selectedDaoId, visibilityFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedDaoId) {
        params.set('daoId', selectedDaoId);
      }
      if (visibilityFilter !== 'ALL') {
        params.set('visibility', visibilityFilter);
      }
      const response = await fetch(`/api/assets${params.toString() ? `?${params}` : ''}`);
      if (!response.ok) {
        throw new Error('Failed to load assets');
      }
      return (await response.json()) as { assets: ResearchAssetRecord[] };
    }
  });

  const assets = useMemo<ResearchAssetRecord[]>(
    () => assetQuery.data?.assets ?? [],
    [assetQuery.data]
  );

  const filteredAssets = useMemo(() => {
    const keywords = searchQuery.trim().toLowerCase();
    return assets
      .filter((asset) => {
        if (!keywords) return true;
        return (
          asset.title.toLowerCase().includes(keywords) ||
          asset.tags.some((tag) => tag.toLowerCase().includes(keywords)) ||
          (asset.owner.displayName?.toLowerCase().includes(keywords) ?? false) ||
          asset.dao.name.toLowerCase().includes(keywords)
        );
      })
      .filter((asset) => {
        switch (activeTab) {
          case 'linked':
            return Boolean(asset.proposal);
          case 'internal':
            return asset.visibility === 'INTERNAL';
          case 'public':
            return asset.visibility === 'PUBLIC';
          case 'reviewed':
            return asset.reviews.length > 0;
          default:
            return true;
        }
      });
  }, [assets, searchQuery, activeTab]);

  const summaryStats = useMemo(() => {
    const total = assets.length;
    const linked = assets.filter((asset) => asset.proposal).length;
    const reviewed = assets.reduce((sum, asset) => sum + asset.reviews.length, 0);
    const latest = assets[0]?.createdAt ? new Date(assets[0].createdAt) : null;
    return {
      total,
      linked,
      reviewed,
      latest: latest ? latest.toLocaleDateString('ja-JP') : '—'
    };
  }, [assets]);

  const assetMutation = useMutation({
    mutationFn: createResearchAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repo-assets'] });
      setIsPublishDialogOpen(false);
      setIpfsUpload(null);
      setNewAsset({ title: '', abstract: '', tags: '', ipfsCid: '', labId: '', visibility: 'INTERNAL' });
      toast.success('研究資産を登録しました');
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : '研究資産の登録に失敗しました');
    }
  });

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('ファイルサイズは50MB以下にしてください');
      return;
    }

    try {
      setIsUploading(true);
      const result = await uploadAssetFile(file);
      setIpfsUpload(result);
      setNewAsset((prev) => ({ ...prev, ipfsCid: result.cid }));
      toast.success('IPFS にアップロードしました');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'IPFS アップロードに失敗しました');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const handleCreateAsset = () => {
    if (!selectedDaoId) {
      toast.error('DAO を選択してください');
      return;
    }
    if (!selectedOwnerId) {
      toast.error('登録者となるメンバーを選択してください');
      return;
    }
    if (!newAsset.title.trim()) {
      toast.error('タイトルを入力してください');
      return;
    }
    if (!newAsset.ipfsCid.trim()) {
      toast.error('IPFS CID を入力するかファイルをアップロードしてください');
      return;
    }

    const tags = newAsset.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    assetMutation.mutate({
      daoId: selectedDaoId,
      ownerId: selectedOwnerId,
      title: newAsset.title.trim(),
      abstract: newAsset.abstract.trim() || undefined,
      ipfsCid: newAsset.ipfsCid.trim(),
      artifactHash: ipfsUpload?.artifactHash,
      tags,
      visibility: newAsset.visibility,
      proposalId: selectedProposalId || undefined,
      labId: newAsset.labId ? Number(newAsset.labId) : undefined
    });
  };

  const formatCid = (cid: string) => (cid.length > 18 ? `${cid.slice(0, 10)}…${cid.slice(-6)}` : cid);

  const ownerLabel = (owner: ResearchAssetRecord['owner']) =>
    owner.displayName ?? owner.walletAddress;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:flex-1">
              <div className="relative w-full max-w-lg">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  className="pl-10"
                  placeholder="タイトル・タグ・研究者で検索"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>
              <Select value={selectedDaoId} onValueChange={setSelectedDaoId}>
                <SelectTrigger className="w-full lg:w-56">
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
              <Select
                value={visibilityFilter}
                onValueChange={(value) => setVisibilityFilter(value as 'ALL' | AssetVisibilityValue)}
              >
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="公開範囲" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">すべての公開範囲</SelectItem>
                  <SelectItem value="PUBLIC">公開</SelectItem>
                  <SelectItem value="INTERNAL">内部限定</SelectItem>
                  <SelectItem value="LINK">リンク限定</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setIsPublishDialogOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                研究資産を登録
              </Button>
              <Button variant="outline" disabled={assets.length === 0}>
                <Download className="mr-2 h-4 w-4" />
                CSV エクスポート
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Filter className="h-4 w-4" />
            <span>
              {searchQuery ? '検索結果' : '最新の研究資産'}: {filteredAssets.length} 件
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">登録済み資産</div>
            <div className="text-3xl font-semibold text-gray-900">{summaryStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">提案と連携</div>
            <div className="text-3xl font-semibold text-gray-900">{summaryStats.linked}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">累計レビュー</div>
            <div className="text-3xl font-semibold text-gray-900">{summaryStats.reviewed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">最終更新</div>
            <div className="text-3xl font-semibold text-gray-900">{summaryStats.latest}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabFilter)}>
        <TabsList className="flex-wrap">
          {tabFilters.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="capitalize">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={activeTab} className="mt-6 space-y-4">
          {assetQuery.isLoading ? (
            <Card>
              <CardContent className="p-6 text-sm text-gray-500">研究資産を読み込み中...</CardContent>
            </Card>
          ) : assetQuery.isError ? (
            <Card>
              <CardContent className="p-6 text-sm text-red-600">
                研究資産を取得できませんでした。時間をおいて再試行してください。
              </CardContent>
            </Card>
          ) : filteredAssets.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 p-8 text-center text-gray-500">
                <FileText className="h-10 w-10 text-gray-300" />
                <p>表示できる研究資産がありません。</p>
                <Button variant="outline" onClick={() => setIsPublishDialogOpen(true)}>
                  新しい資産を登録
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredAssets.map((asset) => {
              const visibilityMeta = visibilityLabels[asset.visibility];
              return (
                <Card key={asset.id}>
                  <CardContent className="space-y-4 p-6">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <Badge variant="secondary">{asset.dao.name}</Badge>
                          <Badge className={visibilityMeta.tone}>{visibilityMeta.label}</Badge>
                          {asset.proposal && (
                            <Badge variant="outline" className="border-blue-200 text-blue-700">
                              <CheckCircle2 className="mr-1 h-3 w-3" /> 提案リンク済
                            </Badge>
                          )}
                        </div>
                        <h3 className="mt-3 text-xl font-semibold text-gray-900">{asset.title}</h3>
                        <p className="mt-2 text-sm text-gray-600">
                          {asset.abstract ?? 'アブストラクトは登録されていません。'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <a
                            href={`https://ipfs.io/ipfs/${asset.ipfsCid}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{ownerLabel(asset.owner).slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        {ownerLabel(asset.owner)}
                      </span>
                      <span className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(asset.createdAt).toLocaleDateString('ja-JP')}
                      </span>
                      <span className="flex items-center gap-2 font-mono">
                        <Hash className="h-4 w-4" />
                        {formatCid(asset.ipfsCid)}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {asset.tags.length === 0 ? (
                        <Badge variant="outline" className="text-xs text-gray-500">
                          タグ未設定
                        </Badge>
                      ) : (
                        asset.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))
                      )}
                    </div>

                    {asset.proposal && (
                      <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-900">
                        <div className="flex flex-wrap items-center gap-2">
                          <strong>提案:</strong>
                          <span>{asset.proposal.title}</span>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                            {asset.proposal.status}
                          </Badge>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Award className="h-4 w-4" /> レビュー {asset.reviews.length}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" /> タグ {asset.tags.length}
                      </span>
                      {asset.artifactHash && (
                        <span className="flex items-center gap-1 font-mono">
                          <Shield className="h-4 w-4" /> {formatCid(asset.artifactHash)}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Globe className="h-4 w-4" />
                        {asset.visibility === 'PUBLIC' ? 'オンチェーン同期対象' : 'DAO 内参照'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isPublishDialogOpen} onOpenChange={setIsPublishDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>研究資産を登録</DialogTitle>
            <DialogDescription>
              DAO メンバーが生成した成果物を IPFS CID とともに保存します。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <Label className="text-sm font-medium text-gray-700">
              登録者 (DAO メンバー)
              <Select
                value={selectedOwnerId}
                onValueChange={setSelectedOwnerId}
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
              {memberOptions.length === 0 && (
                <p className="mt-1 text-xs text-amber-600">
                  選択した DAO のメンバーシップが必要です。
                </p>
              )}
            </Label>

            <div className="grid gap-4 md:grid-cols-2">
              <Label className="text-sm font-medium text-gray-700">
                タイトル
                <Input
                  className="mt-1"
                  value={newAsset.title}
                  onChange={(event) => setNewAsset((prev) => ({ ...prev, title: event.target.value }))}
                  placeholder="量子鍵配送データセット"
                />
              </Label>
              <Label className="text-sm font-medium text-gray-700">
                ラボ ID (任意)
                <Input
                  className="mt-1"
                  value={newAsset.labId}
                  onChange={(event) => setNewAsset((prev) => ({ ...prev, labId: event.target.value }))}
                  placeholder="0"
                />
              </Label>
            </div>

            <Label className="text-sm font-medium text-gray-700">
              アブストラクト
              <Textarea
                className="mt-1"
                rows={4}
                value={newAsset.abstract}
                onChange={(event) => setNewAsset((prev) => ({ ...prev, abstract: event.target.value }))}
              />
            </Label>

            <div className="grid gap-4 md:grid-cols-2">
              <Label className="text-sm font-medium text-gray-700">
                タグ (カンマ区切り)
                <Input
                  className="mt-1"
                  value={newAsset.tags}
                  onChange={(event) => setNewAsset((prev) => ({ ...prev, tags: event.target.value }))}
                  placeholder="quantum, cryptography"
                />
              </Label>
              <Label className="text-sm font-medium text-gray-700">
                公開範囲
                <Select
                  value={newAsset.visibility}
                  onValueChange={(value) =>
                    setNewAsset((prev) => ({ ...prev, visibility: value as AssetVisibilityValue }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLIC">公開</SelectItem>
                    <SelectItem value="INTERNAL">内部限定</SelectItem>
                    <SelectItem value="LINK">リンク限定</SelectItem>
                  </SelectContent>
                </Select>
              </Label>
            </div>

            <Label className="text-sm font-medium text-gray-700">
              提案に関連付け (任意)
              <Select
                value={selectedProposalId}
                onValueChange={setSelectedProposalId}
                disabled={isLoadingProposals || !proposalData?.proposals?.length}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="提案を選択" />
                </SelectTrigger>
                <SelectContent>
                  {(proposalData?.proposals ?? []).map((proposal) => (
                    <SelectItem key={proposal.id} value={proposal.id}>
                      {proposal.title} ({proposal.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Label>

            <Label className="text-sm font-medium text-gray-700">
              IPFS CID
              <Input
                className="mt-1 font-mono"
                value={newAsset.ipfsCid}
                onChange={(event) => setNewAsset((prev) => ({ ...prev, ipfsCid: event.target.value }))}
                placeholder="bafy..."
              />
            </Label>

            <div className="grid gap-4 md:grid-cols-2">
              <Label className="text-sm font-medium text-gray-700">
                ファイルアップロード
                <Input
                  type="file"
                  accept=".pdf,.csv,.json,.zip"
                  className="mt-1"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
                {ipfsUpload && (
                  <p className="mt-1 text-xs text-emerald-600">CID: {ipfsUpload.cid}</p>
                )}
              </Label>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="ghost" onClick={() => setIsPublishDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleCreateAsset} disabled={assetMutation.isPending || isUploading}>
              {assetMutation.isPending ? '登録中...' : '登録する'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
