import React, { createContext, useContext, useState } from 'react';
import type { WizardPath, WizardState } from '../types';

interface WizardContextValue {
  state: WizardState;
  setPath: (path: WizardPath) => void;
  setProfileField: (
    field: keyof Omit<WizardState, 'path'>,
    value: string | string[] | File | null
  ) => void;
  reset: () => void;
}

const defaultState: WizardState = {
  path: null,
  username: '',
  email: '',
  password: '',
  profileName: '',
  profileRole: '',
  profileSkills: [],
  resumeFile: null,
  companyName: '',
  teamCode: '',
};

const WizardContext = createContext<WizardContextValue | null>(null);

export const WizardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<WizardState>(defaultState);

  const setPath = (path: WizardPath) => setState(s => ({ ...s, path }));

  const setProfileField = (
    field: keyof Omit<WizardState, 'path'>,
    value: string | string[] | File | null
  ) => setState(s => ({ ...s, [field]: value }));

  const reset = () => setState(defaultState);

  return (
    <WizardContext.Provider value={{ state, setPath, setProfileField, reset }}>
      {children}
    </WizardContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useWizard = () => {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error('useWizard must be used inside WizardProvider');
  return ctx;
};
