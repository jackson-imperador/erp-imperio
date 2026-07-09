import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bull";
import { ConfigModule, ConfigService } from "@nestjs/config";

export const QUEUE_NAMES = {
  NOTIFICATIONS: "notifications",
  EMAIL: "email",
  AUDIT: "audit",
  REPORTS: "reports",
  AI: "ai",
  SYNC: "sync",
} as const;

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get<string>("queue.redis.host", "localhost"),
          port: config.get<number>("queue.redis.port", 6379),
          password: config.get<string>("queue.redis.password"),
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: "exponential", delay: 1000 },
          removeOnComplete: 100,
          removeOnFail: 500,
        },
      }),
      inject: [ConfigService],
    }),

    // Register all queues
    BullModule.registerQueue(
      { name: QUEUE_NAMES.NOTIFICATIONS },
      { name: QUEUE_NAMES.EMAIL },
      { name: QUEUE_NAMES.AUDIT },
      { name: QUEUE_NAMES.REPORTS },
      { name: QUEUE_NAMES.AI },
      { name: QUEUE_NAMES.SYNC },
    ),
  ],
  exports: [BullModule],
})
export class QueueModule {}
