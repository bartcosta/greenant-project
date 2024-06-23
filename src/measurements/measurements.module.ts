import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import { MeasurementsService } from './measurements.service';
import { MeasurementsController } from './measurements.controller';

@Module({
  controllers: [MeasurementsController],
  providers: [PrismaClient, MeasurementsService],
})
export class MeasurementsModule {}
