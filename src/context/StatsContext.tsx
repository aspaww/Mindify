import React, { createContext, useContext } from 'react';
import useUserStats from '../hooks/useUserStats';

// UserStats arayüzünü buraya da alalım ki her yerden erişebilelim
import { Timestamp } from 'firebase/firestore';
export interface UserStats {
  streak: number;
  xpToday: number;
  weeklyXp: number;
  totalXp: number;
  weeklyLog: boolean[];
  lastActive: Timestamp | null;
  completedToday: string[];
}

const StatsContext = createContext<{ stats: UserStats | null, loading: boolean } | null>(null);

export const useStats = () => {
  return useContext(StatsContext);
};

export const StatsProvider = ({ children }) => {
  // --- DEĞİŞİKLİK: isFocused mantığı kaldırıldı ---
  const { stats, loading } = useUserStats();

  return (
    <StatsContext.Provider value={{ stats, loading }}>
      {children}
    </StatsContext.Provider>
  );
};