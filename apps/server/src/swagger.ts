// src/swagger.ts
import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    title: "ECHO API",
    description: "ECHO - Enhancing Care and Health Outcomes",
  },
  host: "localhost:3000", // Adjust host as needed
  basePath: "/api",
  schemes: ["http"],
  // Add other Swagger definitions like security, tags, etc.
  definitions: {
    ScreenAnalytic: {
      type: "object",
      required: ["screen", "durationSeconds"],
      properties: {
        screen: {
          type: "string",
          description: "Name of the screen being tracked",
          example: "Home",
          minLength: 1,
          maxLength: 100,
        },
        durationSeconds: {
          type: "string",
          description: "Duration in seconds as a decimal string",
          example: "39487.00",
          pattern: "^[0-9]+(\\.[0-9]{1,2})?$",
        },
      },
    },
    ScreenData: {
      type: "object",
      required: ["screen", "sessionCount"],
      properties: {
        screen: {
          type: "string",
          description: "Name of the screen",
          example: "Home",
          minLength: 1,
          maxLength: 100,
        },
        sessionCount: {
          type: "string",
          description: "Number of sessions on the screen",
          example: "1000",
          pattern: "^[0-9]+$",
        },
      },
    },
  },
};

const outputFile = "../public/swagger-output.json";
const endpointsFiles = ["./controllers/*.ts"]; // Point to your route files

swaggerAutogen()(outputFile, endpointsFiles, doc);
