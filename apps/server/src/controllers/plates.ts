import fs from "fs";
import path from "path";
import express from "express";
import { Controller, Get, Path, Request, Route, Tags } from "tsoa";

const mimeTypes: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".bmp": "image/bmp",
  ".svg": "image/svg+xml",
};

@Route("plates")
@Tags("default")
export class PlateController extends Controller {
  @Get("{state}/{name}")
  public async plateHandler(
    @Path() state: string,
    @Path() name: string,
    @Request() request: express.Request,
  ): Promise<void> {
    const imagePath = path.join(__dirname, `../assets/plates/${state}/${name}`);
    const ext = path.extname(name).toLowerCase();
    const contentType = mimeTypes[ext] || "application/octet-stream";

    request.res?.setHeader("Content-Type", contentType);

    const read = fs.readFileSync(imagePath);
    if (!read) {
      request.res?.status(404).json({ error: "Image not found" });
      return;
    }
    request.res?.status(200).send(read);
    return;
  }

  @Get("data")
  public async getPlatesData(): Promise<any> {
    const dataPath = path.join(__dirname, "../assets/us-license-plates.json");
    if (!fs.existsSync(dataPath)) {
      return { error: "Data not found" };
    }

    const data = fs.readFileSync(dataPath, "utf-8");
    return JSON.parse(data);
  }
}
