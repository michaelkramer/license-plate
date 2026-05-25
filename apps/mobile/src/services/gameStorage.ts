import AsyncStorage from "@react-native-async-storage/async-storage";
import { StoredGame, StoredTrackedPlate } from "../interfaces/Game";
import { TrackedPlate } from "../interfaces/License-Plate";
import { states } from "../utilities/constants";

const GAMES_KEY = "@licenseplate/games";
const LEGACY_TRACKED_KEY = "@licenseplate/tracked-plates";

function createGameId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function storedPlatesToTracked(stored: StoredTrackedPlate[]): TrackedPlate[] {
  return stored
    .map((item) => {
      const state = states.find(
        (s) => s.abbreviation === item.abbreviation?.toUpperCase(),
      );
      if (!state) {
        return null;
      }
      return {
        state,
        plate_title:
          typeof item.plate_title === "string" ? item.plate_title : null,
      };
    })
    .filter((plate): plate is TrackedPlate => plate !== null);
}

function trackedToStored(plates: TrackedPlate[]): StoredTrackedPlate[] {
  return plates.map((plate) => ({
    abbreviation: plate.state.abbreviation,
    plate_title: plate.plate_title,
  }));
}

export function getTrackedPlatesFromGame(
  game: StoredGame | null,
): TrackedPlate[] {
  if (!game) {
    return [];
  }
  return storedPlatesToTracked(game.trackedPlates);
}

export async function loadGames(): Promise<StoredGame[]> {
  try {
    const raw = await AsyncStorage.getItem(GAMES_KEY);
    if (!raw) {
      return migrateLegacyIfNeeded([]);
    }
    const parsed = JSON.parse(raw) as StoredGame[];
    if (!Array.isArray(parsed)) {
      return migrateLegacyIfNeeded([]);
    }
    return parsed;
  } catch (error) {
    console.error("Failed to load games:", error);
    return [];
  }
}

async function migrateLegacyIfNeeded(
  existing: StoredGame[],
): Promise<StoredGame[]> {
  if (existing.length > 0) {
    return existing;
  }
  try {
    const legacyRaw = await AsyncStorage.getItem(LEGACY_TRACKED_KEY);
    if (!legacyRaw) {
      return [];
    }
    const legacy = JSON.parse(legacyRaw) as StoredTrackedPlate[];
    if (!Array.isArray(legacy) || legacy.length === 0) {
      await AsyncStorage.removeItem(LEGACY_TRACKED_KEY);
      return [];
    }
    const now = new Date().toISOString();
    const migrated: StoredGame = {
      id: createGameId(),
      startedAt: now,
      completedAt: null,
      status: "active",
      plateDisplaySeed: 1,
      trackedPlates: legacy,
    };
    await saveGames([migrated]);
    await AsyncStorage.removeItem(LEGACY_TRACKED_KEY);
    return [migrated];
  } catch (error) {
    console.error("Failed to migrate legacy tracked plates:", error);
    return [];
  }
}

export async function saveGames(games: StoredGame[]): Promise<void> {
  try {
    await AsyncStorage.setItem(GAMES_KEY, JSON.stringify(games));
  } catch (error) {
    console.error("Failed to save games:", error);
  }
}

export function getActiveGame(games: StoredGame[]): StoredGame | null {
  return games.find((g) => g.status === "active") ?? null;
}

export function getCompletedGames(games: StoredGame[]): StoredGame[] {
  return games
    .filter((g) => g.status === "completed")
    .sort(
      (a, b) =>
        new Date(b.completedAt ?? b.startedAt).getTime() -
        new Date(a.completedAt ?? a.startedAt).getTime(),
    );
}

export function createActiveGame(plateDisplaySeed: number): StoredGame {
  return {
    id: createGameId(),
    startedAt: new Date().toISOString(),
    completedAt: null,
    status: "active",
    plateDisplaySeed,
    trackedPlates: [],
  };
}

export function updateActiveGamePlates(
  games: StoredGame[],
  trackedPlates: TrackedPlate[],
): StoredGame[] {
  const active = getActiveGame(games);
  if (!active) {
    return games;
  }
  return games.map((g) =>
    g.id === active.id
      ? { ...g, trackedPlates: trackedToStored(trackedPlates) }
      : g,
  );
}

export function completeActiveGameInList(games: StoredGame[]): {
  games: StoredGame[];
  nextSeed: number;
} {
  const active = getActiveGame(games);
  if (!active) {
    return { games, nextSeed: 1 };
  }
  const nextSeed = active.plateDisplaySeed + 1;
  const completed: StoredGame = {
    ...active,
    status: "completed",
    completedAt: new Date().toISOString(),
  };
  return {
    games: games.map((g) => (g.id === active.id ? completed : g)),
    nextSeed,
  };
}

export function deleteGameById(
  games: StoredGame[],
  gameId: string,
): StoredGame[] {
  return games.filter((g) => g.id !== gameId);
}

export function addActiveGame(
  games: StoredGame[],
  plateDisplaySeed: number,
): StoredGame[] {
  const withoutStaleActive = games.filter((g) => g.status !== "active");
  return [...withoutStaleActive, createActiveGame(plateDisplaySeed)];
}
