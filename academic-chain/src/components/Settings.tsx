import { useState } from 'react';
import { Settings as SettingsIcon, Wallet, Bell, Shield, Globe, Database, Monitor, ChevronRight, Check, Mail, Lock, Eye, EyeOff, Download, Trash2, LogOut, Key, Smartphone } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { toast } from 'sonner@2.0.3';

export function Settings() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [proposalNotifications, setProposalNotifications] = useState(true);
  const [projectUpdateNotifications, setProjectUpdateNotifications] = useState(true);
  const [commentNotifications, setCommentNotifications] = useState(true);
  const [citationNotifications, setCitationNotifications] = useState(true);
  const [profilePublic, setProfilePublic] = useState(true);
  const [researchActivityPublic, setResearchActivityPublic] = useState(true);
  const [showInSearch, setShowInSearch] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [language, setLanguage] = useState('ja');
  const [theme, setTheme] = useState('light');
  const [timezone, setTimezone] = useState('Asia/Tokyo');
  const [network, setNetwork] = useState('ethereum');
  const [notificationFrequency, setNotificationFrequency] = useState('instant');

  const connectedWallet = 'did:ethr:0x1234...5678';
  const emailAddress = 'tanaka@university.ac.jp';

  const handleSaveSettings = () => {
    toast.success('設定を保存しました');
  };

  const handleExportData = () => {
    toast.info('データをエクスポートしています...');
    setTimeout(() => {
      toast.success('データのエクスポートが完了しました');
    }, 2000);
  };

  const handleEnable2FA = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
    if (!twoFactorEnabled) {
      toast.success('2段階認証を有効化しました');
    } else {
      toast.info('2段階認証を無効化しました');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 mb-2">設定</h1>
        <p className="text-gray-600">アカウント、通知、プライバシーの設定</p>
      </div>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList>
          <TabsTrigger value="account">
            <Wallet className="w-4 h-4 mr-2" />
            アカウント
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            通知
          </TabsTrigger>
          <TabsTrigger value="privacy">
            <Shield className="w-4 h-4 mr-2" />
            プライバシー
          </TabsTrigger>
          <TabsTrigger value="blockchain">
            <Database className="w-4 h-4 mr-2" />
            ブロックチェーン
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="w-4 h-4 mr-2" />
            セキュリティ
          </TabsTrigger>
          <TabsTrigger value="display">
            <Monitor className="w-4 h-4 mr-2" />
            表示
          </TabsTrigger>
        </TabsList>

        {/* Account Settings */}
        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>接続中のウォレット</CardTitle>
              <CardDescription>
                ブロックチェーン上のアイデンティティとして使用されるウォレット
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-blue-900 mb-1">分散ID (DID)</div>
                    <div className="text-xs text-blue-700 font-mono">{connectedWallet}</div>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                  接続中
                </Badge>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Key className="w-4 h-4 mr-2" />
                  別のウォレットを接続
                </Button>
                <Button variant="outline" className="flex-1">
                  <LogOut className="w-4 h-4 mr-2" />
                  ウォレットを切断
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>メールアドレス</CardTitle>
              <CardDescription>
                通知の受信とアカウント復旧に使用されます
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <div className="text-sm text-gray-900">{emailAddress}</div>
                  <div className="text-xs text-gray-500">認証済み</div>
                </div>
                <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                  <Check className="w-3 h-3 mr-1" />
                  認証済
                </Badge>
              </div>
              <Button variant="outline">メールアドレスを変更</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>アカウント管理</CardTitle>
              <CardDescription>
                データのエクスポートやアカウントの削除
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-between" onClick={handleExportData}>
                <span className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  データをエクスポート
                </span>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Separator />
              <Button variant="outline" className="w-full justify-between text-red-600 hover:bg-red-50">
                <span className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  アカウントを削除
                </span>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <p className="text-xs text-gray-500">
                ⚠️ アカウント削除は永久的です。ブロックチェーン上の記録は削除できません。
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>通知設定</CardTitle>
              <CardDescription>
                受け取りたい通知の種類を選択してください
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label htmlFor="email-notifications" className="cursor-pointer">
                      メール通知
                    </Label>
                    <p className="text-sm text-gray-500">すべての通知をメールで受け取る</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label htmlFor="proposal-notifications" className="cursor-pointer">
                      DAO提案の通知
                    </Label>
                    <p className="text-sm text-gray-500">新しい提案や投票終了の通知</p>
                  </div>
                  <Switch
                    id="proposal-notifications"
                    checked={proposalNotifications}
                    onCheckedChange={setProposalNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label htmlFor="project-notifications" className="cursor-pointer">
                      プロジェクト更新
                    </Label>
                    <p className="text-sm text-gray-500">参加プロジェクトの進捗や更新</p>
                  </div>
                  <Switch
                    id="project-notifications"
                    checked={projectUpdateNotifications}
                    onCheckedChange={setProjectUpdateNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label htmlFor="comment-notifications" className="cursor-pointer">
                      コメント通知
                    </Label>
                    <p className="text-sm text-gray-500">論文やプロジェクトへのコメント</p>
                  </div>
                  <Switch
                    id="comment-notifications"
                    checked={commentNotifications}
                    onCheckedChange={setCommentNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label htmlFor="citation-notifications" className="cursor-pointer">
                      引用通知
                    </Label>
                    <p className="text-sm text-gray-500">あなたの論文が引用されたとき</p>
                  </div>
                  <Switch
                    id="citation-notifications"
                    checked={citationNotifications}
                    onCheckedChange={setCitationNotifications}
                  />
                </div>
              </div>

              <Separator />

              <div>
                <Label htmlFor="notification-frequency" className="mb-3 block">
                  通知頻度
                </Label>
                <Select value={notificationFrequency} onValueChange={setNotificationFrequency}>
                  <SelectTrigger id="notification-frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instant">即時通知</SelectItem>
                    <SelectItem value="daily">日次ダイジェスト（1日1回）</SelectItem>
                    <SelectItem value="weekly">週次ダイジェスト（週1回）</SelectItem>
                    <SelectItem value="never">通知しない</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSaveSettings} className="w-full">
                通知設定を保存
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Settings */}
        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>プライバシー設定</CardTitle>
              <CardDescription>
                プロフィールと研究活動の公開範囲を管理
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="profile-public" className="cursor-pointer flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    プロフィールを公開
                  </Label>
                  <p className="text-sm text-gray-500">他のユーザーがあなたのプロフィールを閲覧可能</p>
                </div>
                <Switch
                  id="profile-public"
                  checked={profilePublic}
                  onCheckedChange={setProfilePublic}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="research-public" className="cursor-pointer flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    研究活動を公開
                  </Label>
                  <p className="text-sm text-gray-500">論文、プロジェクト参加履歴を公開</p>
                </div>
                <Switch
                  id="research-public"
                  checked={researchActivityPublic}
                  onCheckedChange={setResearchActivityPublic}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="show-in-search" className="cursor-pointer flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    検索結果に表示
                  </Label>
                  <p className="text-sm text-gray-500">プラットフォーム内の検索結果に表示</p>
                </div>
                <Switch
                  id="show-in-search"
                  checked={showInSearch}
                  onCheckedChange={setShowInSearch}
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ ブロックチェーン上の公開データ（論文、投票履歴など）は非公開にできません。
                  これらは永続的な公開記録として保存されます。
                </p>
              </div>

              <Button onClick={handleSaveSettings} className="w-full">
                プライバシー設定を保存
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Blockchain Settings */}
        <TabsContent value="blockchain" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ブロックチェーン設定</CardTitle>
              <CardDescription>
                使用するネットワークとトランザクション設定
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="network" className="mb-3 block">
                  使用ネットワーク
                </Label>
                <Select value={network} onValueChange={setNetwork}>
                  <SelectTrigger id="network">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ethereum">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-600 rounded-full" />
                        Ethereum Mainnet
                      </div>
                    </SelectItem>
                    <SelectItem value="polygon">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-purple-600 rounded-full" />
                        Polygon
                      </div>
                    </SelectItem>
                    <SelectItem value="sepolia">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-600 rounded-full" />
                        Sepolia Testnet
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-2">
                  テストネットは開発・テスト用です
                </p>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>ガス料金設定</Label>
                <div className="grid grid-cols-3 gap-3">
                  <Button variant="outline" className="flex-col h-auto py-3">
                    <div className="text-lg mb-1">🐢</div>
                    <div className="text-sm">低速</div>
                    <div className="text-xs text-gray-500">~30分</div>
                  </Button>
                  <Button variant="outline" className="flex-col h-auto py-3 border-blue-600 bg-blue-50">
                    <div className="text-lg mb-1">🚗</div>
                    <div className="text-sm">標準</div>
                    <div className="text-xs text-gray-500">~3分</div>
                  </Button>
                  <Button variant="outline" className="flex-col h-auto py-3">
                    <div className="text-lg mb-1">🚀</div>
                    <div className="text-sm">高速</div>
                    <div className="text-xs text-gray-500">~30秒</div>
                  </Button>
                </div>
              </div>

              <Separator />

              <div>
                <Label htmlFor="ipfs-gateway" className="mb-3 block">
                  IPFSゲートウェイ
                </Label>
                <Input
                  id="ipfs-gateway"
                  value="https://ipfs.io/ipfs/"
                  readOnly
                  className="font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-2">
                  論文ファイルの取得に使用されるIPFSゲートウェイ
                </p>
              </div>

              <Button onClick={handleSaveSettings} className="w-full">
                ブロックチェーン設定を保存
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>セキュリティ設定</CardTitle>
              <CardDescription>
                アカウントのセキュリティを強化
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    twoFactorEnabled ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'
                  }`}>
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <Label className="cursor-pointer">2段階認証</Label>
                    <p className="text-sm text-gray-500">
                      認証アプリで追加のセキュリティ層を有効化
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {twoFactorEnabled && (
                    <Badge className="bg-green-50 text-green-700 border-green-200">
                      有効
                    </Badge>
                  )}
                  <Button
                    variant={twoFactorEnabled ? "outline" : "default"}
                    onClick={handleEnable2FA}
                  >
                    {twoFactorEnabled ? '無効化' : '有効化'}
                  </Button>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="mb-3 block">ログイン履歴</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Monitor className="w-4 h-4 text-gray-600" />
                      <div>
                        <div className="text-sm text-gray-900">Mac - Chrome</div>
                        <div className="text-xs text-gray-500">東京 • 2時間前</div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                      現在のセッション
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-4 h-4 text-gray-600" />
                      <div>
                        <div className="text-sm text-gray-900">iPhone - Safari</div>
                        <div className="text-xs text-gray-500">東京 • 1日前</div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      ログアウト
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="mb-3 block">信頼できるデバイス</Label>
                <p className="text-sm text-gray-500 mb-3">
                  このデバイスを信頼できるデバイスとして登録すると、2段階認証をスキップできます
                </p>
                <Button variant="outline" className="w-full">
                  このデバイスを信頼する
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Display Settings */}
        <TabsContent value="display" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>表示設定</CardTitle>
              <CardDescription>
                言語、テーマ、タイムゾーンの設定
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="language" className="mb-3 block">
                  言語
                </Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ja">日本語</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="zh">中文</SelectItem>
                    <SelectItem value="ko">한국어</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div>
                <Label htmlFor="theme" className="mb-3 block">
                  テーマ
                </Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger id="theme">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded" />
                        ライトモード
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-900 border-2 border-gray-600 rounded" />
                        ダークモード
                      </div>
                    </SelectItem>
                    <SelectItem value="auto">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gradient-to-r from-white to-gray-900 border-2 border-gray-300 rounded" />
                        システム設定に従う
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div>
                <Label htmlFor="timezone" className="mb-3 block">
                  タイムゾーン
                </Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger id="timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Tokyo">日本標準時 (JST) UTC+9</SelectItem>
                    <SelectItem value="America/New_York">東部標準時 (EST) UTC-5</SelectItem>
                    <SelectItem value="Europe/London">グリニッジ標準時 (GMT) UTC+0</SelectItem>
                    <SelectItem value="UTC">協定世界時 (UTC)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div>
                <Label className="mb-3 block">日付フォーマット</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="dateFormat" defaultChecked />
                    <span className="text-sm">2025年10月27日</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="dateFormat" />
                    <span className="text-sm">2025/10/27</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="dateFormat" />
                    <span className="text-sm">Oct 27, 2025</span>
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveSettings} className="w-full">
                表示設定を保存
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
