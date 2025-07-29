import path from "path";
import dotenv from "dotenv";
import { getOsEnv } from "./utils/env-utils";

const envPath = path.join(
  process.cwd(),
  `.env${process.env.NODE_ENV === "test" ? ".test" : ""}`,
);
if (process.env.NODE_ENV !== "production") {
  dotenv.config({
    path: envPath,
  });
}

const data = {
  PORT: getOsEnv("PORT"),
};

export default data;
