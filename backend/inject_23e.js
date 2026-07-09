const fs = require('fs');

const schemaPath = 'prisma/schema.prisma';
let schema = fs.readFileSync(schemaPath, 'utf8');

// 1. Add fields to Company
const companyRelations = `
  analyticCubes           AnalyticCube[]
  dashboards              Dashboard[]
  kpiMetrics              KpiMetric[]
  materializedViewLogs    MaterializedViewLog[]
  aiProviderConfigs       AiProviderConfig[]
  promptTemplates         PromptTemplate[]
  aiAuditTrails           AiAuditTrail[]
  aiPolicies              AiPolicy[]
  mobileDevices           MobileDevice[]
  syncStates              SyncState[]
  pushNotificationTokens  PushNotificationToken[]
  externalUsers           ExternalUser[]
  featureFlags            FeatureFlag[]
  usageQuotas             UsageQuota[]
  billingInvoices         BillingInvoice[]
`;

// Insert into Company model before @@map("companies")
schema = schema.replace('@@map("companies")', companyRelations + '\n  @@map("companies")');

// 2. Add Enums
const newEnums = `
enum AiProviderType {
  OPENAI
  ANTHROPIC
  CUSTOM
}

enum SyncStatus {
  PENDING
  SYNCING
  COMPLETED
  FAILED
}

enum InvoiceStatus {
  DRAFT
  OPEN
  PAID
  VOID
  UNCOLLECTIBLE
}

enum ExternalUserType {
  CUSTOMER
  SUPPLIER
  PARTNER
}
`;

// 3. Add Models
const newModels = `
// ─────────────────────────────────────────────────────────────
// BUSINESS INTELLIGENCE (PHASE 23E)
// ─────────────────────────────────────────────────────────────

model AnalyticCube {
  id          String   @id @default(uuid())
  companyId   String
  name        String
  description String?
  tableName   String
  refreshCron String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  company Company @relation(fields: [companyId], references: [id])

  @@unique([companyId, name])
  @@map("analytic_cubes")
}

model Dashboard {
  id          String   @id @default(uuid())
  companyId   String
  name        String
  description String?
  layoutJson  Json     @default("{}")
  isDefault   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  company Company           @relation(fields: [companyId], references: [id])
  widgets DashboardWidget[]

  @@map("dashboards")
}

model DashboardWidget {
  id          String   @id @default(uuid())
  dashboardId String
  title       String
  type        String
  configJson  Json     @default("{}")
  position    Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  dashboard Dashboard @relation(fields: [dashboardId], references: [id], onDelete: Cascade)

  @@map("dashboard_widgets")
}

model KpiMetric {
  id          String   @id @default(uuid())
  companyId   String
  code        String
  name        String
  description String?
  queryMap    Json
  threshold   Decimal? @db.Decimal(15, 2)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  company Company @relation(fields: [companyId], references: [id])

  @@unique([companyId, code])
  @@map("kpi_metrics")
}

model MaterializedViewLog {
  id           String    @id @default(uuid())
  companyId    String
  viewName     String
  refreshedAt  DateTime  @default(now())
  durationMs   Int
  rowsAffected Int?
  status       String    @default("SUCCESS")
  errorMessage String?

  company Company @relation(fields: [companyId], references: [id])

  @@map("materialized_view_logs")
}

// ─────────────────────────────────────────────────────────────
// ARTIFICIAL INTELLIGENCE (PHASE 23E)
// ─────────────────────────────────────────────────────────────

model AiProviderConfig {
  id        String         @id @default(uuid())
  companyId String
  provider  AiProviderType
  apiKey    String?
  baseUrl   String?
  isActive  Boolean        @default(true)
  createdAt DateTime       @default(now())
  updatedAt DateTime       @updatedAt

  company Company @relation(fields: [companyId], references: [id])

  @@unique([companyId, provider])
  @@map("ai_provider_configs")
}

model PromptTemplate {
  id          String   @id @default(uuid())
  companyId   String
  code        String
  description String?
  systemPrompt String
  userPrompt   String
  version      Int      @default(1)
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  company Company @relation(fields: [companyId], references: [id])

  @@unique([companyId, code])
  @@map("prompt_templates")
}

model AiAuditTrail {
  id           String   @id @default(uuid())
  companyId    String
  userId       String?
  provider     String
  modelUsed    String
  promptTokens Int      @default(0)
  completionTokens Int  @default(0)
  totalCost    Decimal? @db.Decimal(10, 6)
  contextType  String?
  contextId    String?
  createdAt    DateTime @default(now())

  company Company @relation(fields: [companyId], references: [id])

  @@map("ai_audit_trails")
}

model AiPolicy {
  id               String   @id @default(uuid())
  companyId        String
  maxTokensPerMonth Int      @default(100000)
  requestsPerMinute Int      @default(60)
  allowedModels    String[]
  isActive         Boolean  @default(true)
  updatedAt        DateTime @updatedAt

  company Company @relation(fields: [companyId], references: [id])

  @@unique([companyId])
  @@map("ai_policies")
}

// ─────────────────────────────────────────────────────────────
// MOBILE BACKEND & SYNC (PHASE 23E)
// ─────────────────────────────────────────────────────────────

model MobileDevice {
  id           String   @id @default(uuid())
  companyId    String
  userId       String?
  deviceId     String
  deviceModel  String?
  osVersion    String?
  appVersion   String?
  lastSyncAt   DateTime?
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())

  company Company @relation(fields: [companyId], references: [id])

  @@unique([companyId, deviceId])
  @@map("mobile_devices")
}

model SyncState {
  id           String     @id @default(uuid())
  companyId    String
  deviceId     String
  entityName   String
  lastWatermark DateTime
  status       SyncStatus @default(COMPLETED)
  updatedAt    DateTime   @updatedAt

  company Company @relation(fields: [companyId], references: [id])

  @@unique([companyId, deviceId, entityName])
  @@map("sync_states")
}

model PushNotificationToken {
  id        String   @id @default(uuid())
  companyId String
  userId    String?
  deviceId  String
  token     String
  platform  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  company Company @relation(fields: [companyId], references: [id])

  @@unique([companyId, deviceId])
  @@map("push_notification_tokens")
}

// ─────────────────────────────────────────────────────────────
// EXTERNAL PORTAL (PHASE 23E)
// ─────────────────────────────────────────────────────────────

model ExternalUser {
  id           String           @id @default(uuid())
  companyId    String
  email        String
  passwordHash String
  type         ExternalUserType
  referenceId  String           // CustomerId or SupplierId
  isActive     Boolean          @default(true)
  lastLoginAt  DateTime?
  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt

  company Company @relation(fields: [companyId], references: [id])

  @@unique([companyId, email])
  @@map("external_users")
}

model PortalSession {
  id             String   @id @default(uuid())
  externalUserId String
  token          String   @unique
  expiresAt      DateTime
  createdAt      DateTime @default(now())

  @@map("portal_sessions")
}

// ─────────────────────────────────────────────────────────────
// SAAS PLATFORM (PHASE 23E)
// ─────────────────────────────────────────────────────────────

model FeatureFlag {
  id          String   @id @default(uuid())
  companyId   String?
  code        String
  description String?
  isEnabled   Boolean  @default(false)
  updatedAt   DateTime @updatedAt

  company Company? @relation(fields: [companyId], references: [id])

  @@map("feature_flags")
}

model UsageQuota {
  id          String   @id @default(uuid())
  companyId   String
  metric      String
  limit       Int
  currentValue Int     @default(0)
  resetAt     DateTime?
  updatedAt   DateTime @updatedAt

  company Company @relation(fields: [companyId], references: [id])

  @@unique([companyId, metric])
  @@map("usage_quotas")
}

model BillingInvoice {
  id             String        @id @default(uuid())
  companyId      String
  subscriptionId String
  invoiceNumber  String
  amount         Decimal       @db.Decimal(15, 2)
  status         InvoiceStatus @default(DRAFT)
  dueDate        DateTime
  paidAt         DateTime?
  invoicePdfUrl  String?
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  company Company @relation(fields: [companyId], references: [id])

  @@unique([companyId, invoiceNumber])
  @@map("billing_invoices")
}
`;

// Insert Enums before the first model (Plan)
schema = schema.replace('// ─────────────────────────────────────────────────────────────\n// SAAS PLATFORM ENTITIES', newEnums + '\n// ─────────────────────────────────────────────────────────────\n// SAAS PLATFORM ENTITIES');

schema = schema + '\n' + newModels;

fs.writeFileSync(schemaPath, schema, 'utf8');
console.log('Phase 23E schema injected successfully!');
