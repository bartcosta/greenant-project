import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { MeasurementsService } from './measurements.service';
import { CreateMeasurementDto } from './dto/create-measurement.dto';
import { UpdateMeasurementDto } from './dto/update-measurement.dto';

import { FileInterceptor } from '@nestjs/platform-express';
import { ResolutionTypes } from 'src/constants/resolution.constants';

@Controller('/api/measurements')
export class MeasurementsController {
  constructor(private readonly measurementsService: MeasurementsService) {}

  @Post()
  create(@Body() createMeasurementDto: CreateMeasurementDto) {
    return this.measurementsService.create(createMeasurementDto);
  }

  @Post('/import')
  @UseInterceptors(FileInterceptor('file'))
  async importMeasurements(@UploadedFile() file: Express.Multer.File) {
    return this.measurementsService.importMeasurements(file);
  }

  @Get()
  findAll() {
    return this.measurementsService.findAll();
  }

  @Get('/find/device/:deviceId')
  findOne(@Param('deviceId') deviceId: string) {
    return this.measurementsService.findOneDevice(deviceId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMeasurementDto: UpdateMeasurementDto,
  ) {
    return this.measurementsService.update(+id, updateMeasurementDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.measurementsService.remove(+id);
  }

  @Delete()
  removeAll() {
    return this.measurementsService.removeAll();
  }

  @Get('/device/:deviceId/')
  getMeasurements(
    @Param('deviceId') deviceId: string,
    @Query('resolution') resolution: ResolutionTypes,
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ) {
    return this.measurementsService.getMeasurementsByDevice(
      deviceId,
      resolution,
      new Date(startDate),
      new Date(endDate),
    );
  }
}
