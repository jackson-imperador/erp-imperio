import { NestFactory } from "@nestjs/core";
import { ValidationPipe, VersioningType } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { WINSTON_MODULE_NEST_PROVIDER } from "nest-winston";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";
import { TransformInterceptor } from "./common/interceptors/transform.interceptor";
import { CorrelationIdInterceptor } from "./common/interceptors/correlation-id.interceptor";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // ── Logger ─────────────────────────────────────────────────
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);

  // ── Config ─────────────────────────────────────────────────
  const configService = app.get(ConfigService);
  const port = configService.get<number>("app.port", 4000);
  const apiPrefix = configService.get<string>("app.apiPrefix", "api/v1");
  const swaggerEnabled = configService.get<boolean>("app.swaggerEnabled", true);
  const corsOrigins = configService.get<string>(
    "app.corsOrigins",
    "http://localhost:3000",
  );

  // ── Security Middlewares ────────────────────────────────────
  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());

  // ── CORS ───────────────────────────────────────────────────
  app.enableCors({
    origin: corsOrigins.split(",").map((o) => o.trim()),
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Correlation-ID",
      "X-Company-ID",
    ],
  });

  // ── API Prefix & Versioning ─────────────────────────────────
  app.setGlobalPrefix(apiPrefix);
  app.enableVersioning({
    type: VersioningType.HEADER,
    header: "Accept-Version",
  });

  // ── Global Pipes ───────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ── Global Filters ─────────────────────────────────────────
  app.useGlobalFilters(
    new AllExceptionsFilter(logger),
    new HttpExceptionFilter(logger),
  );

  // ── Global Interceptors ────────────────────────────────────
  app.useGlobalInterceptors(
    new CorrelationIdInterceptor(),
    new LoggingInterceptor(logger),
    new TransformInterceptor(),
  );

  // ── Swagger ────────────────────────────────────────────────
  if (swaggerEnabled) {
    const swaggerPath = configService.get<string>("app.swaggerPath", "docs");
    const config = new DocumentBuilder()
      .setTitle("👑 Império ERP API")
      .setDescription("Multi-tenant SaaS ERP — Complete REST API Documentation")
      .setVersion("0.1.0")
      .addBearerAuth(
        { type: "http", scheme: "bearer", bearerFormat: "JWT" },
        "JWT",
      )
      .addServer(`http://localhost:${port}`, "Development")
      .addTag("Auth", "Authentication & Authorization endpoints")
      .addTag("Companies", "Company management endpoints")
      .addTag("Users", "User management endpoints")
      .addTag("Customers", "Customer management endpoints")
      .addTag("Products", "Product & Category endpoints")
      .addTag("Sales", "Sales order endpoints")
      .addTag("Inventory", "Inventory & Warehouse endpoints")
      .addTag("Purchasing", "Purchase order endpoints")
      .addTag("Financial", "Financial management endpoints")
      .addTag("Reports", "Business intelligence endpoints")
      .addTag("Health", "System health check endpoints")
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(swaggerPath, app, document, {
      swaggerOptions: { persistAuthorization: true },
    });

    logger.log(
      `📚 Swagger available at: http://localhost:${port}/${swaggerPath}`,
      "Bootstrap",
    );
  }

  // ── Graceful Shutdown ──────────────────────────────────────
  app.enableShutdownHooks();

  await app.listen(port);
  logger.log(
    `🚀 Imperio ERP API running at: http://localhost:${port}/${apiPrefix}`,
    "Bootstrap",
  );
}

bootstrap();
