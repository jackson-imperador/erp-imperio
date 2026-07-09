const fs = require('fs');
const path = require('path');

const modules = ['bi', 'ai', 'mobile', 'portal', 'saas', 'observability'];
const basePath = 'src/modules';

modules.forEach(mod => {
  const dir = path.join(basePath, mod);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  
  const dtoDir = path.join(dir, 'dto');
  if (!fs.existsSync(dtoDir)) fs.mkdirSync(dtoDir, { recursive: true });
  
  // DTO
  const dtoContent = `import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Create${mod.charAt(0).toUpperCase() + mod.slice(1)}Dto {
  @ApiProperty()
  @IsString()
  name: string;
}
`;
  fs.writeFileSync(path.join(dtoDir, `${mod}.dto.ts`), dtoContent);

  // Service
  const serviceName = mod.charAt(0).toUpperCase() + mod.slice(1) + 'Service';
  const serviceContent = `import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ${serviceName} {
  private readonly logger = new Logger(${serviceName}.name);

  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async initialize() {
    this.logger.log('${serviceName} initialized');
  }
}
`;
  fs.writeFileSync(path.join(dir, `${mod}.service.ts`), serviceContent);

  // Controller
  const controllerName = mod.charAt(0).toUpperCase() + mod.slice(1) + 'Controller';
  const controllerContent = `import { Controller, Post, Body, Param, UseGuards, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ${serviceName} } from './${mod}.service';
import { Create${mod.charAt(0).toUpperCase() + mod.slice(1)}Dto } from './dto/${mod}.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('${mod.toUpperCase()} Module')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/companies/:companyId/${mod}')
export class ${controllerName} {
  constructor(private readonly service: ${serviceName}) {}

  @Get('status')
  @Roles('COMPANY_OWNER', 'COMPANY_ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get ${mod} status' })
  async getStatus(@Param('companyId') companyId: string) {
    return { status: 'OK', module: '${mod}', companyId };
  }
}
`;
  fs.writeFileSync(path.join(dir, `${mod}.controller.ts`), controllerContent);

  // Module
  const moduleName = mod.charAt(0).toUpperCase() + mod.slice(1) + 'Module';
  const moduleContent = `import { Module } from '@nestjs/common';
import { ${serviceName} } from './${mod}.service';
import { ${controllerName} } from './${mod}.controller';
import { PrismaModule } from '../../infrastructure/database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [${controllerName}],
  providers: [${serviceName}],
  exports: [${serviceName}],
})
export class ${moduleName} {}
`;
  fs.writeFileSync(path.join(dir, `${mod}.module.ts`), moduleContent);

  console.log(`Scaffolded ${mod}`);
});
