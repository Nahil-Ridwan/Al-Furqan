import React, { createContext, useContext, useState } from 'react';

export type AppMode = 'view' | 'edit' | null;

type AppModeContextType = {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
};

const AppModeContext = createContext<AppModeContextType | undefined>(undefined);

export const AppModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<AppMode>(null);

  return (
    <AppModeContext.Provider value={{ mode, setMode }}>
      {children}
    </AppModeContext.Provider>
  );
};

export const useAppMode = () => {
  const context = useContext(AppModeContext);
  if (!context) {
    throw new Error('useAppMode must be used within an AppModeProvider');
  }
  return context;
};
