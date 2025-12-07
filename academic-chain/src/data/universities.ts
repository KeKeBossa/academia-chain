/**
 * Japanese Universities Database
 * 日本の主要大学と学部データ（拡張可能な構造）
 * 
 * 構造:
 * - id: 大学の一意識別子
 * - name: 大学名
 * - nameEn: 英語名
 * - region: 地域（関東、関西、東北など）
 * - type: 国立/私立
 * - departments: 学部・研究科の配列
 */

export interface Department {
  id: string;
  name: string;
  nameEn?: string;
}

export interface University {
  id: string;
  name: string;
  nameEn: string;
  region: string;
  type: 'national' | 'private' | 'public';
  departments: Department[];
  website?: string;
}

export const UNIVERSITIES: University[] = [
  // 関東 - 国立
  {
    id: 'todai',
    name: '東京大学',
    nameEn: 'University of Tokyo',
    region: '関東',
    type: 'national',
    website: 'https://www.u-tokyo.ac.jp/',
    departments: [
      { id: 'todai-eng', name: '工学部', nameEn: 'Faculty of Engineering' },
      { id: 'todai-sci', name: '理学部', nameEn: 'Faculty of Science' },
      { id: 'todai-let', name: '文学部', nameEn: 'Faculty of Letters' },
      { id: 'todai-econ', name: '経済学部', nameEn: 'Faculty of Economics' },
      { id: 'todai-law', name: '法学部', nameEn: 'Faculty of Law' },
      { id: 'todai-med', name: '医学部', nameEn: 'Faculty of Medicine' },
      { id: 'todai-ag', name: '農学部', nameEn: 'Faculty of Agriculture' },
      { id: 'todai-grad-eng', name: '情報理工学系研究科', nameEn: 'Graduate School of Information Science and Technology' },
      { id: 'todai-grad-sci', name: '理学系研究科', nameEn: 'Graduate School of Science' },
    ],
  },
  {
    id: 'tit',
    name: '東京工業大学',
    nameEn: 'Tokyo Institute of Technology',
    region: '関東',
    type: 'national',
    website: 'https://www.titech.ac.jp/',
    departments: [
      { id: 'tit-eng', name: '工学部', nameEn: 'School of Engineering' },
      { id: 'tit-sci', name: '理学部', nameEn: 'School of Science' },
      { id: 'tit-arch', name: '建築学部', nameEn: 'School of Architecture' },
      { id: 'tit-grad', name: '工学院', nameEn: 'School of Engineering' },
    ],
  },
  {
    id: 'hitotsubashi',
    name: '一橋大学',
    nameEn: 'Hitotsubashi University',
    region: '関東',
    type: 'national',
    website: 'https://www.hit-u.ac.jp/',
    departments: [
      { id: 'hitotsubashi-econ', name: '経済学部', nameEn: 'Faculty of Economics' },
      { id: 'hitotsubashi-law', name: '法学部', nameEn: 'Faculty of Law' },
      { id: 'hitotsubashi-comm', name: '商学部', nameEn: 'Faculty of Commerce' },
      { id: 'hitotsubashi-soc', name: '社会学部', nameEn: 'Faculty of Social Sciences' },
    ],
  },

  // 関東 - 私立
  {
    id: 'waseda',
    name: '早稲田大学',
    nameEn: 'Waseda University',
    region: '関東',
    type: 'private',
    website: 'https://www.waseda.jp/',
    departments: [
      { id: 'waseda-pol', name: '政治経済学部', nameEn: 'Faculty of Political Science and Economics' },
      { id: 'waseda-law', name: '法学部', nameEn: 'Faculty of Law' },
      { id: 'waseda-lit', name: '文学部', nameEn: 'Faculty of Letters' },
      { id: 'waseda-sci', name: '理工学部', nameEn: 'Faculty of Science and Engineering' },
      { id: 'waseda-coe', name: '基幹理工学部', nameEn: 'Faculty of Fundamental Science and Engineering' },
      { id: 'waseda-ase', name: '創造理工学部', nameEn: 'Faculty of Creative Science and Engineering' },
      { id: 'waseda-soc', name: '社会科学部', nameEn: 'Faculty of Social Sciences' },
      { id: 'waseda-intl', name: '国際教養学部', nameEn: 'Faculty of International Liberal Arts' },
    ],
  },
  {
    id: 'keio',
    name: '慶應義塾大学',
    nameEn: 'Keio University',
    region: '関東',
    type: 'private',
    website: 'https://www.keio.ac.jp/',
    departments: [
      { id: 'keio-law', name: '法学部', nameEn: 'Faculty of Law' },
      { id: 'keio-econ', name: '経済学部', nameEn: 'Faculty of Economics' },
      { id: 'keio-biz', name: '商学部', nameEn: 'Faculty of Commerce' },
      { id: 'keio-lit', name: '文学部', nameEn: 'Faculty of Letters' },
      { id: 'keio-med', name: '医学部', nameEn: 'Faculty of Medicine' },
      { id: 'keio-eng', name: '理工学部', nameEn: 'Faculty of Science and Technology' },
      { id: 'keio-env', name: '環境情報学部', nameEn: 'Faculty of Environment and Information Studies' },
    ],
  },
  {
    id: 'chuo',
    name: '中央大学',
    nameEn: 'Chuo University',
    region: '関東',
    type: 'private',
    website: 'https://www.chuo-u.ac.jp/',
    departments: [
      { id: 'chuo-law', name: '法学部', nameEn: 'Faculty of Law' },
      { id: 'chuo-econ', name: '経済学部', nameEn: 'Faculty of Economics' },
      { id: 'chuo-biz', name: '商学部', nameEn: 'Faculty of Commerce' },
      { id: 'chuo-lib', name: '文学部', nameEn: 'Faculty of Letters' },
      { id: 'chuo-sci', name: '理工学部', nameEn: 'Faculty of Science and Engineering' },
    ],
  },

  // 関西 - 国立
  {
    id: 'kyotodai',
    name: '京都大学',
    nameEn: 'Kyoto University',
    region: '関西',
    type: 'national',
    website: 'https://www.kyoto-u.ac.jp/',
    departments: [
      { id: 'kyoto-eng', name: '工学部', nameEn: 'Faculty of Engineering' },
      { id: 'kyoto-sci', name: '理学部', nameEn: 'Faculty of Science' },
      { id: 'kyoto-let', name: '文学部', nameEn: 'Faculty of Letters' },
      { id: 'kyoto-econ', name: '経済学部', nameEn: 'Faculty of Economics' },
      { id: 'kyoto-law', name: '法学部', nameEn: 'Faculty of Law' },
      { id: 'kyoto-ag', name: '農学部', nameEn: 'Faculty of Agriculture' },
      { id: 'kyoto-med', name: '医学部', nameEn: 'Faculty of Medicine' },
    ],
  },
  {
    id: 'osaka',
    name: '大阪大学',
    nameEn: 'Osaka University',
    region: '関西',
    type: 'national',
    website: 'https://www.osaka-u.ac.jp/',
    departments: [
      { id: 'osaka-eng', name: '工学部', nameEn: 'Faculty of Engineering' },
      { id: 'osaka-sci', name: '理学部', nameEn: 'Faculty of Science' },
      { id: 'osaka-let', name: '文学部', nameEn: 'Faculty of Letters' },
      { id: 'osaka-econ', name: '経済学部', nameEn: 'Faculty of Economics' },
      { id: 'osaka-law', name: '法学部', nameEn: 'Faculty of Law' },
      { id: 'osaka-med', name: '医学部', nameEn: 'Faculty of Medicine' },
    ],
  },
  {
    id: 'kobe',
    name: '神戸大学',
    nameEn: 'Kobe University',
    region: '関西',
    type: 'national',
    website: 'https://www.kobe-u.ac.jp/',
    departments: [
      { id: 'kobe-eng', name: '工学部', nameEn: 'Faculty of Engineering' },
      { id: 'kobe-sci', name: '理学部', nameEn: 'Faculty of Science' },
      { id: 'kobe-let', name: '文学部', nameEn: 'Faculty of Letters' },
      { id: 'kobe-econ', name: '経済学部', nameEn: 'Faculty of Economics' },
      { id: 'kobe-law', name: '法学部', nameEn: 'Faculty of Law' },
    ],
  },

  // 関西 - 私立
  {
    id: 'kansai-gaidai',
    name: '関西外国語大学',
    nameEn: 'Kansai Gaidai University',
    region: '関西',
    type: 'private',
    website: 'https://www.kansai-gaidai.ac.jp/',
    departments: [
      { id: 'kg-foreign', name: '外国語学部', nameEn: 'Faculty of Foreign Languages' },
      { id: 'kg-intl', name: '国際文化学部', nameEn: 'Faculty of International Culture' },
    ],
  },

  // 東北 - 国立
  {
    id: 'tohoku',
    name: '東北大学',
    nameEn: 'Tohoku University',
    region: '東北',
    type: 'national',
    website: 'https://www.tohoku.ac.jp/',
    departments: [
      { id: 'tohoku-eng', name: '工学部', nameEn: 'Faculty of Engineering' },
      { id: 'tohoku-sci', name: '理学部', nameEn: 'Faculty of Science' },
      { id: 'tohoku-let', name: '文学部', nameEn: 'Faculty of Letters' },
      { id: 'tohoku-econ', name: '経済学部', nameEn: 'Faculty of Economics' },
      { id: 'tohoku-law', name: '法学部', nameEn: 'Faculty of Law' },
      { id: 'tohoku-med', name: '医学部', nameEn: 'Faculty of Medicine' },
      { id: 'tohoku-ag', name: '農学部', nameEn: 'Faculty of Agriculture' },
    ],
  },

  // 北海道 - 国立
  {
    id: 'hokudai',
    name: '北海道大学',
    nameEn: 'Hokkaido University',
    region: '北海道',
    type: 'national',
    website: 'https://www.hokudai.ac.jp/',
    departments: [
      { id: 'hokudai-eng', name: '工学部', nameEn: 'Faculty of Engineering' },
      { id: 'hokudai-sci', name: '理学部', nameEn: 'Faculty of Science' },
      { id: 'hokudai-let', name: '文学部', nameEn: 'Faculty of Letters' },
      { id: 'hokudai-econ', name: '経済学部', nameEn: 'Faculty of Economics' },
      { id: 'hokudai-law', name: '法学部', nameEn: 'Faculty of Law' },
      { id: 'hokudai-ag', name: '農学部', nameEn: 'Faculty of Agriculture' },
      { id: 'hokudai-med', name: '医学部', nameEn: 'Faculty of Medicine' },
    ],
  },

  // 中部 - 国立
  {
    id: 'nagoya',
    name: '名古屋大学',
    nameEn: 'Nagoya University',
    region: '中部',
    type: 'national',
    website: 'https://www.nagoya-u.ac.jp/',
    departments: [
      { id: 'nagoya-eng', name: '工学部', nameEn: 'Faculty of Engineering' },
      { id: 'nagoya-sci', name: '理学部', nameEn: 'Faculty of Science' },
      { id: 'nagoya-let', name: '文学部', nameEn: 'Faculty of Letters' },
      { id: 'nagoya-econ', name: '経済学部', nameEn: 'Faculty of Economics' },
      { id: 'nagoya-law', name: '法学部', nameEn: 'Faculty of Law' },
      { id: 'nagoya-ag', name: '農学部', nameEn: 'Faculty of Agriculture' },
      { id: 'nagoya-med', name: '医学部', nameEn: 'Faculty of Medicine' },
    ],
  },

  // 九州 - 国立
  {
    id: 'kyushu',
    name: '九州大学',
    nameEn: 'Kyushu University',
    region: '九州',
    type: 'national',
    website: 'https://www.kyushu-u.ac.jp/',
    departments: [
      { id: 'kyushu-eng', name: '工学部', nameEn: 'Faculty of Engineering' },
      { id: 'kyushu-sci', name: '理学部', nameEn: 'Faculty of Science' },
      { id: 'kyushu-let', name: '文学部', nameEn: 'Faculty of Letters' },
      { id: 'kyushu-econ', name: '経済学部', nameEn: 'Faculty of Economics' },
      { id: 'kyushu-law', name: '法学部', nameEn: 'Faculty of Law' },
      { id: 'kyushu-ag', name: '農学部', nameEn: 'Faculty of Agriculture' },
      { id: 'kyushu-med', name: '医学部', nameEn: 'Faculty of Medicine' },
    ],
  },
];

/**
 * ユーティリティ関数
 */

/** 大学名から大学オブジェクトを取得 */
export const getUniversityByName = (name: string): University | undefined => {
  return UNIVERSITIES.find(uni => uni.name === name);
};

/** 大学IDから大学オブジェクトを取得 */
export const getUniversityById = (id: string): University | undefined => {
  return UNIVERSITIES.find(uni => uni.id === id);
};

/** 大学名から学部リストを取得 */
export const getDepartmentsByUniversity = (universityName: string): Department[] => {
  const university = getUniversityByName(universityName);
  return university?.departments ?? [];
};

/** 地域から大学リストを取得 */
export const getUniversitiesByRegion = (region: string): University[] => {
  return UNIVERSITIES.filter(uni => uni.region === region);
};

/** 大学タイプから大学リストを取得 */
export const getUniversitiesByType = (type: 'national' | 'private' | 'public'): University[] => {
  return UNIVERSITIES.filter(uni => uni.type === type);
};

/** 大学名リスト（ソート済み） */
export const UNIVERSITY_NAMES = UNIVERSITIES.map(uni => uni.name).sort();

/** 地域リスト */
export const REGIONS = Array.from(new Set(UNIVERSITIES.map(uni => uni.region))).sort();

/** 大学タイプリスト */
export const UNIVERSITY_TYPES = [
  { value: 'national', label: '国立大学' },
  { value: 'private', label: '私立大学' },
  { value: 'public', label: '公立大学' },
] as const;
