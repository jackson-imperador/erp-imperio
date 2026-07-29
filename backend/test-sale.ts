import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { PdvService } from './src/modules/pdv/pdv.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const pdvService = app.get(PdvService);
  
  try {
    const salePayload = {
      cashierId: 'default-drawer',
      operatorId: 'operator',
      items: [
        {
          productId: '7e2928aa-3dc5-4f66-b771-1902b5b86511', // Test product ID
          quantity: 1,
          unitPrice: 150,
          discount: 0,
          total: 150
        }
      ],
      subtotal: 150,
      discountTotal: 0,
      total: 150,
      payments: [{ method: 'CASH', amount: 150 }],
      status: 'COMPLETED'
    };

    console.log('Processing sale...');
    const result = await pdvService.processSale('company-demo', salePayload as any, 'user-id');
    console.log('SUCCESS:', result);
  } catch (error: any) {
    console.error('FAIL:', error.message);
    if (error.response) console.error('Response:', error.response);
    console.error('Stack:', error.stack);
  } finally {
    await app.close();
  }
}
bootstrap();
