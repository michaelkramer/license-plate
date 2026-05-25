export type GameStatus = "active" | "completed";

export type StoredTrackedPlate = {
  abbreviation: string;
  plate_title: string | null;
};

export type StoredGame = {
  id: string;
  startedAt: string;
  completedAt: string | null;
  status: GameStatus;
  plateDisplaySeed: number;
  trackedPlates: StoredTrackedPlate[];
};
