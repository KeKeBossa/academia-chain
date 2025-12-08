import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Combobox } from './ui/combobox';
import { toast } from 'sonner';
import { X, Plus } from 'lucide-react';
import { useUserProfile, type UserProfile } from '../hooks/useUserProfile';
import { UNIVERSITY_NAMES, getDepartmentsByUniversity } from '../data/universities';
import { ACADEMIC_LEVELS } from '../data/academic-levels';

// DID生成関数
function generateDID(): string {
  const randomHex = () => Math.floor(Math.random() * 16).toString(16);
  const generateAddress = () => {
    let address = '0x';
    for (let i = 0; i < 40; i++) {
      address += randomHex();
    }
    return address;
  };
  return `did:ethr:${generateAddress()}`;
}

interface ProfileSetupProps {
  onComplete?: () => void;
}

export function ProfileSetup({ onComplete }: ProfileSetupProps) {
  const { profile, saveProfile, markProfileCompleted } = useUserProfile();
  const [formData, setFormData] = useState<UserProfile>(
    profile || {
      name: '',
      did: generateDID(),
      email: '',
      university: '',
      department: '',
      academicLevel: '',
      position: '',
      researchFields: [],
      bio: '',
      reputation: 0,
      papers: 0,
      seminars: 0,
      projects: 0,
      daoTokens: 0,
      joinDate: new Date().toISOString().split('T')[0],
    }
  );

  const [newField, setNewField] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '名前を入力してください';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'メールアドレスを入力してください';
    } else if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }

    if (!formData.university.trim()) {
      newErrors.university = '大学を入力してください';
    }

    if (!formData.department.trim()) {
      newErrors.department = '学部・専攻を入力してください';
    }

    if (!formData.academicLevel.trim()) {
      newErrors.academicLevel = '学年を選択してください';
    }

    if (!formData.position.trim()) {
      newErrors.position = '職位を入力してください';
    }

    if (formData.researchFields.length === 0) {
      newErrors.researchFields = '最低1つの研究分野を追加してください';
    }

    if (!formData.bio.trim()) {
      newErrors.bio = '自己紹介を入力してください';
    } else if (formData.bio.length < 20) {
      newErrors.bio = '自己紹介は20文字以上で入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddResearchField = () => {
    if (!newField.trim()) {
      toast.error('研究分野を入力してください');
      return;
    }

    if (formData.researchFields.includes(newField)) {
      toast.error('既に追加されている研究分野です');
      return;
    }

    setFormData({
      ...formData,
      researchFields: [...formData.researchFields, newField],
    });
    setNewField('');
    toast.success(`「${newField}」を追加しました`);
  };

  const handleRemoveResearchField = (field: string) => {
    setFormData({
      ...formData,
      researchFields: formData.researchFields.filter(f => f !== field),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('必須項目を入力してください');
      return;
    }

    // プロフィール保存
    saveProfile(formData, true);
    toast.success('プロフィールを作成しました！');

    // コールバック実行
    if (onComplete) {
      setTimeout(onComplete, 500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">プロフィール設定</h1>
          <p className="text-gray-600">
            あなたの研究活動を紹介するプロフィールを作成してください
          </p>
        </div>

        {/* Form Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>基本情報</CardTitle>
            <CardDescription>
              後ほどいつでも編集できます
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <Label htmlFor="name">名前 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="例: 山田 太郎"
                  maxLength={50}
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email">メールアドレス *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="例: user@example.ac.jp"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* University & Department */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="university">大学 *</Label>
                  <Select value={formData.university} onValueChange={(value: string) => {
                    setFormData({ ...formData, university: value, department: '' });
                  }}>
                    <SelectTrigger id="university" className={errors.university ? 'border-red-500' : ''}>
                      <SelectValue placeholder="大学を選択..." />
                    </SelectTrigger>
                    <SelectContent>
                      {UNIVERSITY_NAMES.map((name) => (
                        <SelectItem key={name} value={name}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.university && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.university}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="department">学部・専攻 *</Label>
                  <Combobox
                    options={formData.university 
                      ? getDepartmentsByUniversity(formData.university).map(dept => ({
                          label: dept.name,
                          value: dept.name
                        }))
                      : []
                    }
                    value={formData.department}
                    onValueChange={(value: string) => {
                      setFormData({ ...formData, department: value });
                    }}
                    onCustomValue={(customValue: string) => {
                      setFormData({ ...formData, department: customValue });
                    }}
                    placeholder={formData.university ? '学部を選択または入力...' : '大学を先に選択してください'}
                    searchPlaceholder="学部・専攻を検索..."
                    allowCustom={true}
                  />
                  {errors.department && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.department}
                    </p>
                  )}
                </div>
              </div>

              {/* Academic Level & Position */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="academicLevel">学年 *</Label>
                  <Select value={formData.academicLevel} onValueChange={(value: string) => {
                    setFormData({ ...formData, academicLevel: value });
                  }}>
                    <SelectTrigger id="academicLevel" className={errors.academicLevel ? 'border-red-500' : ''}>
                      <SelectValue placeholder="学年を選択..." />
                    </SelectTrigger>
                    <SelectContent>
                      {ACADEMIC_LEVELS.map((level) => (
                        <SelectItem key={level.id} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.academicLevel && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.academicLevel}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="position">職位 *</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) =>
                      setFormData({ ...formData, position: e.target.value })
                    }
                    placeholder="例: 研究員"
                    maxLength={50}
                    className={errors.position ? 'border-red-500' : ''}
                  />
                  {errors.position && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.position}
                    </p>
                  )}
                </div>
              </div>

              {/* Research Fields */}
              <div>
                <Label>研究分野 *</Label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      value={newField}
                      onChange={(e) => setNewField(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddResearchField();
                        }
                      }}
                      placeholder="例: 量子コンピューティング"
                      maxLength={50}
                    />
                    <Button
                      type="button"
                      onClick={handleAddResearchField}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="w-4 h-4" />
                      追加
                    </Button>
                  </div>

                  {formData.researchFields.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.researchFields.map((field) => (
                        <Badge
                          key={field}
                          variant="secondary"
                          className="flex items-center gap-2 pl-3 pr-2 py-1.5"
                        >
                          {field}
                          <button
                            type="button"
                            onClick={() => handleRemoveResearchField(field)}
                            className="hover:text-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  {errors.researchFields && (
                    <p className="text-red-500 text-sm">{errors.researchFields}</p>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div>
                <Label htmlFor="bio">自己紹介 *</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  placeholder="あなたの研究内容や興味分野について教えてください"
                  rows={5}
                  maxLength={500}
                  className={errors.bio ? 'border-red-500' : ''}
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500">
                    {formData.bio.length} / 500文字
                  </p>
                  {errors.bio && (
                    <p className="text-red-500 text-sm">{errors.bio}</p>
                  )}
                </div>
              </div>

              {/* ID (Read-only) */}
              <div>
                <Label htmlFor="did">ID</Label>
                <Input
                  id="did"
                  value={formData.did || 'ログイン時に自動生成されます'}
                  disabled
                  className="bg-gray-100"
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  size="lg"
                >
                  プロフィールを作成
                </Button>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  💡 プロフィール情報はあなたの研究活動を管理するために使用されます。
                  プロフィール作成後も「プロフィール」タブから編集できます。
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
