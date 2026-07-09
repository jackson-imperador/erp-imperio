import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Cache } from "cache-manager";
import { Inject } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly configService: ConfigService,
  ) {}

  async get<T>(key: string): Promise<T | null> {
    return this.cacheManager.get<T>(key);
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const ttl = ttlSeconds ?? this.configService.get<number>("redis.ttl", 3600);
    await this.cacheManager.set(key, value, ttl * 1000);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async reset(): Promise<void> {
    await this.cacheManager.reset();
  }

  /**
   * Build a namespaced cache key
   */
  buildKey(namespace: string, ...parts: string[]): string {
    return [namespace, ...parts].join(":");
  }

  /**
   * Build a company-scoped cache key for multi-tenancy
   */
  companyKey(companyId: string, namespace: string, ...parts: string[]): string {
    return this.buildKey(`company:${companyId}`, namespace, ...parts);
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log("🔌 Redis connection closed");
  }
}
