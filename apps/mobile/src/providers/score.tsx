import React, { createContext } from "react";
import { StoredGame } from "../interfaces/Game";
import { TrackedPlate } from "../interfaces/License-Plate";
import {
  addActiveGame,
  completeActiveGameInList,
  deleteGameById,
  getActiveGame,
  getCompletedGames,
  getTrackedPlatesFromGame,
  loadGames,
  saveGames,
  updateActiveGamePlates,
} from "../services/gameStorage";

interface ScoreContextType {
  score: number;
  highScore: number;
  setHighScore: (highScore: number) => void;
  lastUpdated: Date;
  trackedPlates: TrackedPlate[];
  setTrackedPlates: (plates: TrackedPlate[]) => void;
  activeGame: StoredGame | null;
  completedGames: StoredGame[];
  plateDisplaySeed: number;
  isHydrated: boolean;
  hasActiveGame: boolean;
  startGame: () => void;
  ensureActiveGame: () => void;
  completeGame: () => void;
  deleteGame: (gameId: string) => void;
}

export const ScoreContext = createContext<ScoreContextType | null>(null);

export function ScoreProvider({ children }: { children: React.ReactNode }) {
  const [games, setGames] = React.useState<StoredGame[]>([]);
  const [highScore, setHighScore] = React.useState(0);
  const [lastUpdated, setLastUpdated] = React.useState(new Date());
  const [plateDisplaySeed, setPlateDisplaySeed] = React.useState(1);
  const [isHydrated, setIsHydrated] = React.useState(false);

  const activeGame = React.useMemo(() => getActiveGame(games), [games]);
  const completedGames = React.useMemo(() => getCompletedGames(games), [games]);
  const trackedPlates = React.useMemo(
    () => getTrackedPlatesFromGame(activeGame),
    [activeGame],
  );
  const score = trackedPlates.length;
  const hasActiveGame = activeGame !== null;

  const mutateGames = React.useCallback(
    (updater: (current: StoredGame[]) => StoredGame[]) => {
      setGames((current) => {
        const next = updater(current);
        saveGames(next);
        setLastUpdated(new Date());
        return next;
      });
    },
    [],
  );

  React.useEffect(() => {
    loadGames().then((loaded) => {
      setGames(loaded);
      const active = getActiveGame(loaded);
      if (active) {
        setPlateDisplaySeed(active.plateDisplaySeed);
      }
      setIsHydrated(true);
    });
  }, []);

  const setTrackedPlates = React.useCallback(
    (plates: TrackedPlate[]) => {
      mutateGames((current) => {
        let working = current;
        if (!getActiveGame(working)) {
          working = addActiveGame(working, plateDisplaySeed);
        }
        return updateActiveGamePlates(working, plates);
      });
    },
    [mutateGames, plateDisplaySeed],
  );

  const startGame = React.useCallback(() => {
    mutateGames((current) => {
      if (getActiveGame(current)) {
        return current;
      }
      return addActiveGame(current, plateDisplaySeed);
    });
  }, [mutateGames, plateDisplaySeed]);

  const ensureActiveGame = React.useCallback(() => {
    mutateGames((current) => {
      if (getActiveGame(current)) {
        return current;
      }
      return addActiveGame(current, plateDisplaySeed);
    });
  }, [mutateGames, plateDisplaySeed]);

  const completeGame = React.useCallback(() => {
    mutateGames((current) => {
      const active = getActiveGame(current);
      if (!active) {
        return current;
      }
      const { games: nextGames, nextSeed } = completeActiveGameInList(current);
      setPlateDisplaySeed(nextSeed);
      return nextGames;
    });
  }, [mutateGames]);

  const deleteGame = React.useCallback(
    (gameId: string) => {
      mutateGames((current) => deleteGameById(current, gameId));
    },
    [mutateGames],
  );

  return (
    <ScoreContext.Provider
      value={{
        score,
        highScore,
        setHighScore,
        lastUpdated,
        trackedPlates,
        setTrackedPlates,
        activeGame,
        completedGames,
        plateDisplaySeed,
        isHydrated,
        hasActiveGame,
        startGame,
        ensureActiveGame,
        completeGame,
        deleteGame,
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
