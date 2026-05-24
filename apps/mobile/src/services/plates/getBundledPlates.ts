import bundledManifest from "../../../assets/data/bundled-plates.json";
import { LicensePlate } from "../../interfaces/License-Plate";

type BundledManifest = {
  states: Record<string, LicensePlate[]>;
};

const manifest = bundledManifest as BundledManifest;

let flatCache: LicensePlate[] | null = null;

export function getBundledPlatesByState(stateAbbr: string): LicensePlate[] {
  return manifest.states[stateAbbr.toUpperCase()] ?? [];
}

/** Deterministic “sample” plate per state (stable across re-renders). */
export function getSampleBundledPlateForState(
  stateAbbr: string,
): LicensePlate | null {
  const plates = getBundledPlatesByState(stateAbbr);
  if (plates.length === 0) {
    return null;
  }
  const key = stateAbbr.toUpperCase();
  let index = 0;
  for (let i = 0; i < key.length; i += 1) {
    index = (index + key.charCodeAt(i) * (i + 1)) % plates.length;
  }
  return plates[index];
}

/** Prefer tracked plate image when it exists in the bundled set. */
export function getDisplayPlateForState(
  stateAbbr: string,
  trackedTitle?: string | null,
): LicensePlate | null {
  const plates = getBundledPlatesByState(stateAbbr);
  if (plates.length === 0) {
    return null;
  }
  if (trackedTitle) {
    const match = plates.find((p) => p.plate_title === trackedTitle);
    if (match) {
      return match;
    }
  }
  return getSampleBundledPlateForState(stateAbbr);
}

export async function getAllBundledPlates(): Promise<LicensePlate[]> {
  if (!flatCache) {
    flatCache = Object.values(manifest.states).flat();
  }
  return flatCache;
}
