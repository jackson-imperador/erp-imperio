const fs = require('fs');
const path = require('path');

const rootDir = 'C:\\Users\\IMPERADOR e REI DAVI\\Desktop\\ERP IMPERIO\\backend';
const schemaPath = path.join(rootDir, 'prisma', 'schema.prisma');

// 1. Prisma Models for Enterprise Platform (Phase 26A)
const enterpriseModels = `
// ─────────────────────────────────────────────────────────────
// FASE 26A: PLATAFORMA ENTERPRISE (Public API, Plugins, White Label)
// ─────────────────────────────────────────────────────────────

// --- SDK ---

model SdkMetadata {
  id               String            @id @default(uuid())
  language         String            // node, python, go, java
  version          String
  publishUrl       String
  hash             String
  createdAt        DateTime          @default(now())

  @@map("ent_sdk_metadata")
}

// --- PLUGIN MARKETPLACE ---

model Plugin {
  id               String            @id @default(uuid())
  name             String            @unique
  developer        String
  description      String            @db.Text
  category         String            // PAYMENT, FISCAL, CRM, ECOMMERCE
  isActive         Boolean           @default(true)
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt

  versions         PluginVersion[]
  installations    PluginInstallation[]

  @@map("ent_plugins")
}

model PluginVersion {
  id               String            @id @default(uuid())
  pluginId         String
  version          String
  codeUrl          String            // ZIP location or Docker Image
  signature        String            // For Digital Signature
  isPublished      Boolean           @default(false)
  createdAt        DateTime          @default(now())

  plugin           Plugin            @relation(fields: [pluginId], references: [id], onDelete: Cascade)
  permissions      PluginPermission[]

  @@map("ent_plugin_versions")
}

model PluginPermission {
  id               String            @id @default(uuid())
  versionId        String
  resource         String            // E.g. 'sales', 'customers'
  action           String            // READ, WRITE, DELETE
  
  version          PluginVersion     @relation(fields: [versionId], references: [id], onDelete: Cascade)

  @@map("ent_plugin_permissions")
}

model PluginInstallation {
  id               String            @id @default(uuid())
  pluginId         String
  companyId        String
  version          String
  status           String            // INSTALLED, SANDBOX, ERROR, DISABLED
  configuration    String?           @db.Text // JSON config
  installedAt      DateTime          @default(now())

  plugin           Plugin            @relation(fields: [pluginId], references: [id], onDelete: Cascade)
  company          Company           @relation(fields: [companyId], references: [id], onDelete: Cascade)

  @@map("ent_plugin_installations")
}

// --- WHITE LABEL ---

model WhiteLabelConfig {
  id               String            @id @default(uuid())
  companyId        String            @unique
  customDomain     String?           @unique
  brandName        String?
  logoUrl          String?
  faviconUrl       String?
  primaryColor     String?
  secondaryColor   String?
  language         String            @default("pt-BR")
  emailTemplate    String?           @db.Text
  
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt

  company          Company           @relation(fields: [companyId], references: [id], onDelete: Cascade)

  @@map("ent_white_label_configs")
}
`;

// Append models to schema.prisma
let schema = fs.readFileSync(schemaPath, 'utf8');

const companyRelationsEnterprise = `
  pluginInstallations PluginInstallation[]
  whiteLabelConfig   WhiteLabelConfig?
`;

if (!schema.includes('pluginInstallations PluginInstallation[]')) {
  schema = schema.replace('@@map("companies")', companyRelationsEnterprise + '\n  @@map("companies")');
}

if (!schema.includes('FASE 26A: PLATAFORMA ENTERPRISE')) {
  schema = schema + '\n' + enterpriseModels;
  fs.writeFileSync(schemaPath, schema);
  console.log('Enterprise Platform models added to schema.');
}
