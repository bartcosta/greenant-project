import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MeasurementsModule } from './measurements/measurements.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [MeasurementsModule, ReportsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
