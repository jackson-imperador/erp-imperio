import { Module, Global } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { WinstonModule } from "nest-winston";
import * as winston from "winston";
import "winston-daily-rotate-file";

@Global()
@Module({
  imports: [
    WinstonModule.forRootAsync({
      useFactory: (config: ConfigService) => {
        const logLevel = config.get<string>("app.logLevel", "info");
        const logDir = config.get<string>("app.logDir", "./logs");
        const nodeEnv = config.get<string>("app.nodeEnv", "development");

        const formats = [
          winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
          winston.format.errors({ stack: true }),
          winston.format.json(),
        ];

        const transports: winston.transport[] = [
          // Console transport
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.colorize(),
              winston.format.timestamp({ format: "HH:mm:ss" }),
              winston.format.printf(
                ({ level, message, timestamp, context, trace }) => {
                  return `${timestamp} [${level}] ${context ? `[${context}] ` : ""}${message}${trace ? `\n${trace}` : ""}`;
                },
              ),
            ),
          }),
        ];

        // File transports for non-development
        if (nodeEnv !== "development") {
          transports.push(
            new winston.transports.DailyRotateFile({
              filename: `${logDir}/error-%DATE%.log`,
              datePattern: "YYYY-MM-DD",
              zippedArchive: true,
              maxSize: "20m",
              maxFiles: "30d",
              level: "error",
              format: winston.format.combine(...formats),
            }),
            new winston.transports.DailyRotateFile({
              filename: `${logDir}/combined-%DATE%.log`,
              datePattern: "YYYY-MM-DD",
              zippedArchive: true,
              maxSize: "20m",
              maxFiles: "14d",
              format: winston.format.combine(...formats),
            }),
          );
        }

        return { level: logLevel, transports };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [WinstonModule],
})
export class LoggerModule {}
