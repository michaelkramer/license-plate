import { getOsEnv } from "./utilities/env-utils";

const env = {
  NODE_ENV: getOsEnv("NODE_ENV"),
};

export { env };
