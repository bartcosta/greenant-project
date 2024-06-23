import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';

@Module({
  controllers: [ReportsController],
  providers: [PrismaClient, ReportsService],
})
export class ReportsModule {}
