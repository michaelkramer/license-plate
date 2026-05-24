import { ImageSourcePropType } from "react-native";
import { LicensePlate } from "../../interfaces/License-Plate";
import { getBundledImageSource } from "../../bundledPlateImages";

export type PlateImageInput = Pick<
  LicensePlate,
  "source_img" | "plate_img" | "plate_title" | "state" | "source"
>;

export type PlateImageSource = ImageSourcePropType;

/** Encode path segments so spaces and special characters load correctly. */
export function encodeImageUri(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.pathname = parsed.pathname
      .split("/")
      .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
      .join("/");
    return parsed.toString();
  } catch {
    return encodeURI(url);
  }
}

function getRefererHeaders(
  plate: PlateImageInput,
): Record<string, string> | undefined {
  const referer =
    plate.source ||
    (plate.source_img ? `${new URL(plate.source_img).origin}/` : undefined);
  return referer ? { Referer: referer } : undefined;
}

function getLocalApiImageUri(plate: PlateImageInput): string | null {
  const apiBase = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "");
  if (!apiBase || !plate.state || !plate.plate_img) {
    return null;
  }
  const state = encodeURIComponent(plate.state);
  const name = encodeURIComponent(plate.plate_img);
  return `${apiBase}/plates/${state}/${name}`;
}

/**
 * Resolves an image URI for a plate.
 * 1. Local API (when EXPO_PUBLIC_API_URL + server running) — reliable for web and simulators.
 * 2. source_img from bundled data — works on device for some DMV sites; often blocked on web (CORS).
 */
export function getPlateImageSource(
  plate: PlateImageInput,
): PlateImageSource | null {
  if (plate.state && plate.plate_img) {
    const bundled = getBundledImageSource(plate.state, plate.plate_img);
    if (bundled) {
      return bundled;
    }
  }

  const apiUri = getLocalApiImageUri(plate);
  if (apiUri) {
    return { uri: apiUri };
  }

  if (!plate.source_img) {
    return null;
  }

  return {
    uri: encodeImageUri(plate.source_img),
    headers: getRefererHeaders(plate),
  };
}
