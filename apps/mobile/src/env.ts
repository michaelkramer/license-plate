import { getOsEnv } from "./utilities/env-utils";

const data = {
  NODE_ENV: getOsEnv("NODE_ENV"),
  API_URL: getOsEnv("EXPO_PUBLIC_API_URL"),
};

export default data;
