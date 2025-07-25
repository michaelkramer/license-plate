import { Controller, Get, Route, Tags } from "tsoa";
interface PingResponse {
  message: string;
}

@Route("ping")
@Tags("default")
export class PingController extends Controller {
  @Get()
  public async pingHandler(): Promise<PingResponse> {
    const message: PingResponse = {
      message: "pong",
    };
    return message;
  }
}
