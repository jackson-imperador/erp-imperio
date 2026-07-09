import { Controller, Get } from "@nestjs/common";
import {
  HealthCheck,
  HealthCheckService,
  PrismaHealthIndicator,
  MemoryHealthIndicator,
} from "@nestjs/terminus";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { Public } from "../decorators/public.decorator";

@ApiTags("Health")
@Controller("health")
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaHealth: PrismaHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @Public()
  @HealthCheck()
  @ApiOperation({ summary: "Full system health check" })
  async check() {
    return this.health.check([
      () => this.prismaHealth.pingCheck("database", this.prisma),
      () => this.memory.checkHeap("memory_heap", 512 * 1024 * 1024), // 512 MB
      () => this.memory.checkRSS("memory_rss", 1024 * 1024 * 1024), // 1 GB
    ]);
  }

  @Get("live")
  @Public()
  @ApiOperation({ summary: "Liveness probe — is the app running?" })
  live() {
    return { status: "ok", timestamp: new Date().toISOString() };
  }

  @Get("ready")
  @Public()
  @HealthCheck()
  @ApiOperation({ summary: "Readiness probe — is the app ready for traffic?" })
  async ready() {
    return this.health.check([
      () => this.prismaHealth.pingCheck("database", this.prisma),
    ]);
  }
}
