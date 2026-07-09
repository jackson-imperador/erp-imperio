import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { TerminusModule } from "@nestjs/terminus";

import appConfig from "./config/app.config";
import databaseConfig from "./config/database.config";
import jwtConfig from "./config/jwt.config";
import redisConfig from "./config/redis.config";
import storageConfig from "./config/storage.config";
import queueConfig from "./config/queue.config";

import { LoggerModule } from "./common/logger/logger.module";
import { PrismaModule } from "./infrastructure/database/prisma.module";
import { RedisModule } from "./infrastructure/cache/redis.module";
import { QueueModule } from "./infrastructure/queue/queue.module";
import { HealthModule } from "./common/health/health.module";

import { AuthModule } from "./modules/auth/auth.module";
import { CompanyModule } from "./modules/company/company.module";
import { UserModule } from "./modules/user/user.module";
import { CustomerModule } from "./modules/customer/customer.module";
import { ProductModule } from "./modules/product/product.module";
import { InventoryModule } from "./modules/inventory/inventory.module";
import { SalesModule } from "./modules/sales/sales.module";
import { PurchasingModule } from "./modules/purchasing/purchasing.module";
import { FinancialModule } from "./modules/financial/financial.module";
import { OrganizationModule } from "./modules/organization/organization.module";
import { NotificationModule } from "./modules/notification/notification.module";
import { AuditModule } from "./modules/audit/audit.module";
import { ReportModule } from "./modules/report/report.module";
import { IntegrationModule } from "./modules/integration/integration.module";
import { WorkflowModule } from "./modules/workflow/workflow.module";
import { BiModule } from "./modules/bi/bi.module";
import { AiModule } from "./modules/ai/ai.module";
import { MobileModule } from "./modules/mobile/mobile.module";
import { PortalModule } from "./modules/portal/portal.module";
import { SaasModule } from "./modules/saas/saas.module";
import { ObservabilityModule } from "./modules/observability/observability.module";
import { FiscalModule } from "./modules/fiscal/fiscal.module";
import { NfeModule } from "./modules/nfe/nfe.module";
import { NfceModule } from "./modules/nfce/nfce.module";
import { CteModule } from "./modules/cte/cte.module";
import { MdfeModule } from "./modules/mdfe/mdfe.module";
import { NfseModule } from "./modules/nfse/nfse.module";
import { SpedModule } from "./modules/sped/sped.module";
import { FederalComplianceModule } from "./modules/federal-compliance/federal-compliance.module";
import { BrazilianFinanceModule } from "./modules/brazilian-finance/brazilian-finance.module";
import { EnterpriseIntelligenceModule } from "./modules/enterprise-intelligence/enterprise-intelligence.module";
import { EnterprisePlatformModule } from "./modules/enterprise-platform/enterprise-platform.module";
import { GlobalEnterpriseModule } from "./modules/global-enterprise/global-enterprise.module";
import { OpenEcosystemModule } from "./modules/open-ecosystem/open-ecosystem.module";
import { GlobalOperationModule } from "./modules/global-operation/global-operation.module";
import { DataPrivacyModule } from "./modules/data-privacy/data-privacy.module";

import { SharedInfrastructureModule } from "./shared/infrastructure/shared-infrastructure.module";
import { BankingModule } from "./modules/integrations/banking/banking.module";
import { PaymentModule } from "./modules/integrations/payment/payment.module";
import { FiscalIntegrationModule } from "./modules/integrations/fiscal/fiscal.module";
import { ShippingModule } from "./modules/integrations/shipping/shipping.module";
import { CommunicationsModule } from "./modules/integrations/communications/communications.module";
import { StorageModule } from "./modules/integrations/storage/storage.module";
import { SignaturesModule } from "./modules/integrations/signatures/signatures.module";
import { AiIntegrationModule } from "./modules/integrations/ai/ai.module";

@Module({
  imports: [
    // ── Configuration ────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        databaseConfig,
        jwtConfig,
        redisConfig,
        storageConfig,
        queueConfig,
      ],
      envFilePath: [".env.local", ".env"],
      expandVariables: true,
    }),

    // ── Rate Limiting ────────────────────────────────────────
    ThrottlerModule.forRootAsync({
      useFactory: (/* configService */) => ({
        throttlers: [{ ttl: 60000, limit: 100 }],
      }),
    }),

    // ── Event Emitter (Domain Events) ────────────────────────
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: ".",
      maxListeners: 20,
      verboseMemoryLeak: true,
    }),

    // ── Health Checks ────────────────────────────────────────
    TerminusModule,

    // ── Infrastructure ───────────────────────────────────────
    LoggerModule,
    PrismaModule,
    RedisModule,
    QueueModule,
    HealthModule,

    // ── Business Modules ─────────────────────────────────────
    AuthModule,
    CompanyModule,
    UserModule,
    CustomerModule,
    ProductModule,
    InventoryModule,
    SalesModule,
    PurchasingModule,
    FinancialModule,
    OrganizationModule,
    NotificationModule,
    AuditModule,
    ReportModule,
    IntegrationModule,
    WorkflowModule,
    BiModule,
    AiModule,
    MobileModule,
    PortalModule,
    SaasModule,
    ObservabilityModule,
    FiscalModule,
    NfeModule,
    NfceModule,
    CteModule,
    MdfeModule,
    NfseModule,
    SpedModule,
    FederalComplianceModule,
    BrazilianFinanceModule,
    EnterpriseIntelligenceModule,
    EnterprisePlatformModule,
    GlobalEnterpriseModule,
    OpenEcosystemModule,
    GlobalOperationModule,
    DataPrivacyModule,
    SharedInfrastructureModule,
    BankingModule,
    PaymentModule,
    FiscalIntegrationModule,
    ShippingModule,
    CommunicationsModule,
    StorageModule,
    SignaturesModule,
    AiIntegrationModule,
  ],
})
export class AppModule {}
