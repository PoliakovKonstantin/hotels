import { Module } from '@nestjs/common';
import { SupportController } from './support.controller';
import { SupportRequestService, SupportRequestClientService, SupportRequestEmployeeService } from './support.service';

@Module({
  providers: [SupportRequestService,SupportRequestClientService,SupportRequestEmployeeService],
  controllers: [SupportController]
})
export class SupportModule {}
