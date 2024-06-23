import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('/api/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('/devices-and-months')
  reportGetAllDevicesAndMonths() {
    return this.reportsService.reportGetAllDevicesAndMonths();
  }

  @Get('/consumption-patterns')
  reportConsumptionPatterns(
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ) {
    return this.reportsService.reportConsumptionPatterns(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('/active-power')
  reportActivePower(
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ) {
    return this.reportsService.reportActivePower(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('/consumption-analysis')
  reportConsumptionAnalysis() {
    return this.reportsService.reportConsumptionAnalysis();
  }
}
