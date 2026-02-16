import { Module, forwardRef } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CronController } from './cron.controller';
import { PayrollProcessorService } from './payroll-processor.service';
import { IntentsModule } from '../intents/intents.module';
import { PayrollModule } from '../payroll/payroll.module';
import { DatabaseModule } from '@/database/database.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    IntentsModule,
    forwardRef(() => PayrollModule),
    DatabaseModule,
  ],
  controllers: [CronController],
  providers: [PayrollProcessorService],
  exports: [PayrollProcessorService],
})
export class CronModule {}
