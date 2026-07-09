import { Module, Global } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { CacheModule } from "@nestjs/cache-manager";
import { createClient } from "redis";
import { RedisService } from "./redis.service";

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => {
        const host = config.get<string>("redis.host", "localhost");
        const port = config.get<number>("redis.port", 6379);
        const password = config.get<string>("redis.password");
        const ttl = config.get<number>("redis.ttl", 3600);

        const url = password
          ? `redis://:${password}@${host}:${port}`
          : `redis://${host}:${port}`;

        return {
          store: await import("cache-manager-redis-yet").then(
            (m) => m.redisStore,
          ),
          url,
          ttl: ttl * 1000, // cache-manager v5 uses ms
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [RedisService],
  exports: [CacheModule, RedisService],
})
export class RedisModule {}
