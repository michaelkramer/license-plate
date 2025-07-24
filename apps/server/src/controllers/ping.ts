import { Request, Response, Router } from "express";

const server = Router();
/**
 * @swagger
 * /ping:
 *   get:
 *     summary: Ping
 *     responses:
 *       200:
 *         description: Pong.
 */
server.get("/ping", (_req: Request, res: Response) => {
  res.status(200).send("Pong");
});

export default server;
