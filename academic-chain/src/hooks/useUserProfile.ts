import { useState, useEffect, useCallback } from 'react';

export interface UserProfile {
  name: string;
  did: string;
  email: string;
  university: string;
  department: string;
  academicLevel: string;
  position: string;
  researchFields: string[];
  bio: string;
  reputation: number;
  papers: number;
  seminars: number;
  projects: number;
  daoTokens: number;
  joinDate: string;
  profileCompletedAt?: string;
}

const STORAGE_KEY = 'user_profile';
const PROFILE_COMPLETED_KEY = 'profile_completed';

const DEFAULT_PROFILE: UserProfile = {
  name: 'ユーザー',
  did: 'did:ethr:0x0000000000000000000000000000000000000000',
  email: 'user@example.ac.jp',
  university: '未設定',
  department: '未設定',
  academicLevel: '',
  position: '研究者',
  researchFields: [],
  bio: 'プロフィールを編集してください',
  reputation: 0,
  papers: 0,
  seminars: 0,
  projects: 0,
  daoTokens: 0,
  joinDate: new Date().toISOString().split('T')[0],
};

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileCompleted, setIsProfileCompleted] = useState(false);

  // LocalStorage から初期化
  useEffect(() => {
    const storedProfile = localStorage.getItem(STORAGE_KEY);
    const isCompleted = localStorage.getItem(PROFILE_COMPLETED_KEY) === 'true';

    if (storedProfile) {
      try {
        setProfile(JSON.parse(storedProfile));
        setIsProfileCompleted(isCompleted);
      } catch (error) {
        console.warn('Failed to parse stored profile:', error);
        setProfile({ ...DEFAULT_PROFILE });
      }
    } else {
      setProfile({ ...DEFAULT_PROFILE });
      setIsProfileCompleted(false);
    }

    setIsLoading(false);
  }, []);

  // プロフィールを保存
  const saveProfile = useCallback((updatedProfile: UserProfile, markCompleted: boolean = false) => {
    setProfile(updatedProfile);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProfile));

    if (markCompleted) {
      setIsProfileCompleted(true);
      localStorage.setItem(PROFILE_COMPLETED_KEY, 'true');
      // プロフィール完成時刻を記録
      const completedProfile = {
        ...updatedProfile,
        profileCompletedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(completedProfile));
      setProfile(completedProfile);
    }
  }, []);

  // プロフィール完成フラグをセット
  const markProfileCompleted = useCallback(() => {
    if (profile) {
      saveProfile(profile, true);
    }
  }, [profile, saveProfile]);

  // プロフィールをリセット（デバッグ用）
  const resetProfile = useCallback(() => {
    setProfile({ ...DEFAULT_PROFILE });
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PROFILE_COMPLETED_KEY);
    setIsProfileCompleted(false);
  }, []);

  // 統計情報を更新（useData フックから）
  const updateStats = useCallback((stats: {
    papers?: number;
    seminars?: number;
    projects?: number;
    reputation?: number;
    daoTokens?: number;
  }) => {
    if (profile) {
      const updatedProfile = { ...profile, ...stats };
      setProfile(updatedProfile);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProfile));
    }
  }, [profile]);

  return {
    profile,
    isLoading,
    isProfileCompleted,
    saveProfile,
    markProfileCompleted,
    resetProfile,
    updateStats,
  };
}
