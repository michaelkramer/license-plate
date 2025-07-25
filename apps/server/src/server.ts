// src/server.ts
import { app } from "./app";

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}/api`);
  console.log(`Swagger UI available at http://localhost:${port}/api/api-docs`);
});
