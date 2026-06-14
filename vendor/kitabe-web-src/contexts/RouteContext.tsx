import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Place } from '../types/place';

interface RouteContextType {
  routePlaces: Place[];
  addToRoute: (place: Place) => void;
  removeFromRoute: (placeId: string) => void;
  clearRoute: () => void;
  isInRoute: (placeId: string) => boolean;
}

const RouteContext = createContext<RouteContextType | undefined>(undefined);

export const RouteProvider = ({ children }: { children: ReactNode }) => {
  const [routePlaces, setRoutePlaces] = useState<Place[]>(() => {
    const saved = localStorage.getItem('kitabe_route');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('kitabe_route', JSON.stringify(routePlaces));
  }, [routePlaces]);

  const addToRoute = (place: Place) => {
    setRoutePlaces(prev => {
      if (prev.some(p => p.id === place.id)) return prev;
      return [...prev, place];
    });
  };

  const removeFromRoute = (placeId: string) => {
    setRoutePlaces(prev => prev.filter(p => p.id !== placeId));
  };

  const clearRoute = () => {
    setRoutePlaces([]);
  };

  const isInRoute = (placeId: string) => {
    return routePlaces.some(p => p.id === placeId);
  };

  return (
    <RouteContext.Provider value={{ routePlaces, addToRoute, removeFromRoute, clearRoute, isInRoute }}>
      {children}
    </RouteContext.Provider>
  );
};

export const useRoute = () => {
  const context = useContext(RouteContext);
  if (!context) throw new Error('useRoute must be used within RouteProvider');
  return context;
};

