import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class SdkService {
  private readonly logger = new Logger(SdkService.name);

  async generateOpenApiSpec() {
    this.logger.log(`Generating OpenAPI SDK specification`);
    return { status: "GENERATED", version: "1.0.0", url: "/docs/openapi.json" };
  }
}
