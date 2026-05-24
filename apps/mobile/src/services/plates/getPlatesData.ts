import platesJson from "../../../assets/data/us-license-plates-union.json";
import { LicensePlate } from "../../interfaces/License-Plate";

let cached: LicensePlate[] | null = null;

export async function getPlatesData(): Promise<LicensePlate[]> {
  if (!cached) {
    cached = platesJson as LicensePlate[];
  }
  return cached;
}
