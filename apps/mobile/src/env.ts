import { getOsEnv } from "./utilities/env-utils";

const env = {
  NODE_ENV: getOsEnv("NODE_ENV"),
  ADMOB_MAIN_BANNER_ID: getOsEnv("EXPO_ADMOB_MAIN_BANNER_ID"),
};

export { env };
