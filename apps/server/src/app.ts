import cors from "cors";
import express, { urlencoded, json } from "express";
import swaggerUi from "swagger-ui-express";
import { RegisterRoutes } from "../build/routes";
import swaggerDocument from "../build/swagger.json";

export const app = express();

// Use body parser to read sent json payloads
app.use(
  urlencoded({
    extended: true,
  }),
);
app.use(json());

// Allow CORS for all origins
app.use(cors());

// Serve Swagger UI
app.use(
  "/api/v1/api-docs",
  (
    req: { originalUrl: string },
    res: { redirect: (arg0: string) => any },
    next: () => void,
  ) => {
    if (req.originalUrl === "/api/v1/api-docs")
      return res.redirect("/api/v1/api-docs/");
    next();
  },
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, { explorer: true }),
);

// Mount the router with the desired prefix
// app.use("/api/v1", router); // All TSOA endpoints will now be prefixed with /api/v1

// [END routes]

console.log("API routes initialized.");
app.get("/api/v1", async (_req: any, res: any) => {
  res.send("Hello, this is a test response from the root endpoint.");
});

// Register TSOA-generated routes with the router
RegisterRoutes(app);
