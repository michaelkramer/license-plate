export interface LicensePlate {
  plate_title: string; // The title or name of the license plate
  state: string; // The state abbreviation (e.g., "CA" for California)
  plate_img: string;
  category: string; // The category of the license plate (e.g., "Standard", "Specialty")
  source_img?: string;
  source?: string;
}

export interface TrackedPlate {
  state: StateData; // The state abbreviation of the tracked plate
  plate_title: string | null; // The title or name of the license plate
}

export interface StateData {
  state: string; // The full name of the state (e.g., "California")
  abbreviation: string; // The state abbreviation (e.g., "CA" for California)
}
