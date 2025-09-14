import React, { createContext, useContext, useEffect, useState } from 'react';
import StatPercentileCalculator from '../utils/statPercentiles';

interface StatsContextType {
  calculator: StatPercentileCalculator | null;
  isLoading: boolean;
}

const StatsContext = createContext<StatsContextType>({
  calculator: null,
  isLoading: true
});

export const useStatsContext = () => useContext(StatsContext);

export const StatsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [calculator, setCalculator] = useState<StatPercentileCalculator | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load all players data and create calculator
    fetch('/data/all_players.json')
      .then(res => res.json())
      .then(players => {
        const calc = new StatPercentileCalculator(players);
        setCalculator(calc);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to load players data:', err);
        setIsLoading(false);
      });
  }, []);

  return (
    <StatsContext.Provider value={{ calculator, isLoading }}>
      {children}
    </StatsContext.Provider>
  );
};

export default StatsContext;