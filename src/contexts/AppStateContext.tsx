import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AppStateContextType {
  // Scene cache
  scenesCache: Map<string, any>;
  setScenesCache: (key: string, value: any) => void;
  getScenesCache: (key: string) => any | null;
  clearScenesCache: () => void;

  // Image generation state
  isGenerating: boolean;
  setIsGenerating: (value: boolean) => void;
  generationProgress: number;
  setGenerationProgress: (value: number) => void;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

interface AppStateProviderProps {
  children: ReactNode;
}

export function AppStateProvider({ children }: AppStateProviderProps) {
  const [scenesCache] = useState<Map<string, any>>(new Map());
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  const setScenesCache = (key: string, value: any) => {
    scenesCache.set(key, value);
  };

  const getScenesCache = (key: string) => {
    return scenesCache.get(key) || null;
  };

  const clearScenesCache = () => {
    scenesCache.clear();
  };

  const value: AppStateContextType = {
    scenesCache,
    setScenesCache,
    getScenesCache,
    clearScenesCache,
    isGenerating,
    setIsGenerating,
    generationProgress,
    setGenerationProgress,
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateContextType {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}
