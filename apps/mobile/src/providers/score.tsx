import React, { createContext } from "react";
import { TrackedPlate } from "../interfaces/License-Plate";
import {
  loadTrackedPlates,
  saveTrackedPlates,
} from "../services/trackedPlatesStorage";

interface ScoreContextType {
  score: number;
  setScore: (score: number) => void;
  highScore: number;
  setHighScore: (highScore: number) => void;
  lastUpdated: Date;
  setLastUpdated: (date: Date) => void;
  trackedPlates: TrackedPlate[];
  setTrackedPlates: (plates: TrackedPlate[]) => void;
  resetTracking: () => void;
  isHydrated: boolean;
}

export const ScoreContext = createContext<ScoreContextType | null>(null);

export function ScoreProvider({ children }: { children: React.ReactNode }) {
  const [score, setScore] = React.useState(0);
  const [highScore, setHighScore] = React.useState(0);
  const [lastUpdated, setLastUpdated] = React.useState(new Date());
  const [trackedPlates, setTrackedPlates] = React.useState<TrackedPlate[]>([]);
  const [isHydrated, setIsHydrated] = React.useState(false);

  React.useEffect(() => {
    loadTrackedPlates().then((plates) => {
      setTrackedPlates(plates);
      setIsHydrated(true);
    });
  }, []);

  React.useEffect(() => {
    setScore(trackedPlates.length);
  }, [trackedPlates]);

  React.useEffect(() => {
    if (!isHydrated) {
      return;
    }
    saveTrackedPlates(trackedPlates);
    setLastUpdated(new Date());
  }, [trackedPlates, isHydrated]);

  const resetTracking = React.useCallback(() => {
    setTrackedPlates([]);
    setScore(0);
    setLastUpdated(new Date());
  }, []);

  return (
    <ScoreContext.Provider
      value={{
        score,
        setScore,
        highScore,
        setHighScore,
        lastUpdated,
        setLastUpdated,
        trackedPlates,
        setTrackedPlates,
        resetTracking,
        isHydrated,
      }}
    >
      {children}
    </ScoreContext.Provider>
  );
}

export const useScoreContext = () => {
  const context = React.useContext(ScoreContext);
  if (!context) {
    throw new Error("useScoreContext must be used within a ScoreProvider");
  }
  return context;
};
