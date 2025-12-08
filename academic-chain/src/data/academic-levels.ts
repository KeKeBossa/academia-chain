/**
 * Academic Levels Database
 * 学部1年から博士6年までの学年選択肢
 */

export interface AcademicLevel {
  id: string;
  label: string;
  value: string;
  type: 'bachelor' | 'master' | 'phd';
  year: number;
}

export const ACADEMIC_LEVELS: AcademicLevel[] = [
  // 学部
  { id: 'b1', label: '学部1年', value: 'bachelor-1', type: 'bachelor', year: 1 },
  { id: 'b2', label: '学部2年', value: 'bachelor-2', type: 'bachelor', year: 2 },
  { id: 'b3', label: '学部3年', value: 'bachelor-3', type: 'bachelor', year: 3 },
  { id: 'b4', label: '学部4年', value: 'bachelor-4', type: 'bachelor', year: 4 },

  // 修士
  { id: 'm1', label: '修士1年', value: 'master-1', type: 'master', year: 1 },
  { id: 'm2', label: '修士2年', value: 'master-2', type: 'master', year: 2 },

  // 博士
  { id: 'p1', label: '博士1年', value: 'phd-1', type: 'phd', year: 1 },
  { id: 'p2', label: '博士2年', value: 'phd-2', type: 'phd', year: 2 },
  { id: 'p3', label: '博士3年', value: 'phd-3', type: 'phd', year: 3 },
  { id: 'p4', label: '博士4年', value: 'phd-4', type: 'phd', year: 4 },
  { id: 'p5', label: '博士5年', value: 'phd-5', type: 'phd', year: 5 },
  { id: 'p6', label: '博士6年', value: 'phd-6', type: 'phd', year: 6 }
];

export const ACADEMIC_LEVEL_LABELS: Record<string, string> = ACADEMIC_LEVELS.reduce(
  (acc, level) => {
    acc[level.value] = level.label;
    return acc;
  },
  {} as Record<string, string>
);

export function getAcademicLevelLabel(value: string): string {
  return ACADEMIC_LEVEL_LABELS[value] || value;
}
