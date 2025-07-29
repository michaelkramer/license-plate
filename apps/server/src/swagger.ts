// src/swagger.ts
import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    title: "Licenseplate API",
    description: "",
  },
  host: "localhost:3000", // Adjust host as needed
  basePath: "/api/v1",
  schemes: ["http"],
  // Add other Swagger definitions like security, tags, etc.
  definitions: {
    PingResponse: {
      message: "pong",
    },
  },
};

const outputFile = "../public/swagger-output.json";
const endpointsFiles = ["./controllers/*.ts"]; // Point to your route files

swaggerAutogen()(outputFile, endpointsFiles, doc);
