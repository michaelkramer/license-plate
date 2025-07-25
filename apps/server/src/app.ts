import express, { urlencoded, json } from "express";
import swaggerUi from "swagger-ui-express";
import { RegisterRoutes } from "../build/routes";
import swaggerDocument from "../build/swagger.json";

export const app = express();

// export function swaggerDocument() {
//   const file = fs.readFileSync(
//     path.join(__dirname, "../public/swagger-output.json"),
//     "utf8",
//   );
//   return JSON.parse(file);
// }

// Use body parser to read sent json payloads
app.use(
  urlencoded({
    extended: true,
  }),
);
app.use(json());

console.log("API routes initialized.");
app.get("/api", async (_req: any, res: any) => {
  res.send("Hello, this is a test response from the root endpoint.");
});

// Serve Swagger UI
app.use(
  "/api/api-docs",
  (
    req: { originalUrl: string },
    res: { redirect: (arg0: string) => any },
    next: () => void,
  ) => {
    if (req.originalUrl === "/api/api-docs")
      return res.redirect("/api/api-docs/");
    next();
  },
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, { explorer: true }),
);
// [END routes]

RegisterRoutes(app);
