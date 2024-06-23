import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MeasurementsModule } from './measurements/measurements.module';

@Module({
  imports: [MeasurementsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
