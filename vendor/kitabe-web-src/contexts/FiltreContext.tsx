import { createContext, useContext, useState, type ReactNode } from 'react';

interface FiltreState {
  searchQuery: string;
  selectedCity: string;
  selectedDistrict: string;
}

interface FiltreContextType {
  filtre: FiltreState;
  setFiltre: React.Dispatch<React.SetStateAction<FiltreState>>;
}

const defaultFiltre: FiltreState = {
  searchQuery: '',
  selectedCity: '',
  selectedDistrict: ''
};

const FiltreContext = createContext<FiltreContextType | undefined>(undefined);

export const FiltreProvider = ({ children }: { children: ReactNode }) => {
  const [filtre, setFiltre] = useState<FiltreState>(defaultFiltre);
  return (
    <FiltreContext.Provider value={{ filtre, setFiltre }}>
      {children}
    </FiltreContext.Provider>
  );
};

export const useFiltre = () => {
  const context = useContext(FiltreContext);
  if (!context) throw new Error('useFiltre must be used within FiltreProvider');
  return context;
};

