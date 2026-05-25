/**
 * @deprecated Games are stored via gameStorage.ts. Legacy key is migrated on first loadGames().
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TrackedPlate } from "../interfaces/License-Plate";
import { states } from "../utilities/constants";

const STORAGE_KEY = "@licenseplate/tracked-plates";

type StoredTrackedPlate = {
  abbreviation: string;
  plate_title: string | null;
};

/** @deprecated Use gameStorage.loadGames() */
export async function loadTrackedPlates(): Promise<TrackedPlate[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as StoredTrackedPlate[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
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
  } catch (error) {
    console.error("Failed to load tracked plates:", error);
    return [];
  }
}

/** @deprecated Use gameStorage.saveGames() */
export async function saveTrackedPlates(plates: TrackedPlate[]): Promise<void> {
  const payload: StoredTrackedPlate[] = plates.map((plate) => ({
    abbreviation: plate.state.abbreviation,
    plate_title: plate.plate_title,
  }));
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.error("Failed to save tracked plates:", error);
  }
}
