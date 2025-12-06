/**
 * Form utilities for Seminars component
 * Centralizes form validation, initialization, and transformation logic
 */

/**
 * Default seminar form values
 */
export const SEMINAR_FORM_DEFAULTS = {
  name: '',
  university: '',
  department: '',
  professor: '',
  members: '5',
  field: '',
  description: '',
  tags: '',
  website: '',
  email: '',
  openForCollaboration: true,
};

export type SeminarFormData = {
  name: string;
  university: string;
  department: string;
  professor: string;
  members: string;
  field: string;
  description: string;
  tags: string;
  website: string;
  email: string;
  openForCollaboration: boolean;
};

/**
 * Validate seminar form data
 */
export function validateSeminarForm(data: Partial<Record<string, any>>): {
  isValid: boolean;
  error?: string;
} {
  // Name validation
  if (!data.name?.trim()) {
    return { isValid: false, error: '研究室名を入力してください' };
  }
  if (data.name.length < 5) {
    return { isValid: false, error: '研究室名は5文字以上で入力してください' };
  }

  // University validation
  if (!data.university?.trim()) {
    return { isValid: false, error: '大学名を入力してください' };
  }

  // Department validation
  if (!data.department?.trim()) {
    return { isValid: false, error: '学部・研究科を入力してください' };
  }

  // Professor validation
  if (!data.professor?.trim()) {
    return { isValid: false, error: '指導教員名を入力してください' };
  }

  // Field validation
  if (!data.field) {
    return { isValid: false, error: '研究分野を選択してください' };
  }

  // Description validation
  if (!data.description?.trim()) {
    return { isValid: false, error: '研究室紹介文を入力してください' };
  }
  if (data.description.length < 50) {
    return { isValid: false, error: '研究室紹介文は50文字以上で入力してください' };
  }

  // Members validation
  const members = parseInt(data.members || '0');
  if (isNaN(members) || members < 1 || members > 200) {
    return { isValid: false, error: 'メンバー数は1〜200の範囲で入力してください' };
  }

  // Tags validation
  if (!data.tags?.trim()) {
    return { isValid: false, error: '研究キーワードを入力してください（カンマ区切りで1つ以上）' };
  }

  // Website validation
  if (data.website && typeof data.website === 'string' && !data.website.match(/^https?:\/\/.+/)) {
    return { isValid: false, error: 'ウェブサイトURLは http:// または https:// で始まる必要があります' };
  }

  // Email validation
  if (data.email && typeof data.email === 'string' && !data.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    return { isValid: false, error: '有効なメールアドレスを入力してください' };
  }

  return { isValid: true };
}

/**
 * Generate random DID address
 */
export function generateDIDAddress(): string {
  return (
    'did:ethr:0x' +
    Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
  );
}

/**
 * Generate random blockchain hash
 */
export function generateBlockchainHash(): string {
  return (
    '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
  );
}

/**
 * Parse comma-separated tags string into array
 */
export function parseTags(tagsString: string): string[] {
  return tagsString
    .split(',')
    .map(t => t.trim())
    .filter(t => t.length > 0);
}

/**
 * Get research fields list
 */
export function getResearchFields(): string[] {
  return [
    '量子情報科学',
    '情報学',
    'コンピュータサイエンス',
    'エネルギー工学',
    '情報システム',
    '生命科学',
    '都市工学',
    'バイオテクノロジー',
    '材料科学',
    '医療・ヘルスケア',
    '環境科学',
    '数学',
    '物理学',
    '化学',
    '機械工学',
    '電気電子工学',
    '経済学',
    '社会学',
    'その他',
  ];
}
