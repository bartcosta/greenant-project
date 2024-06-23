import { get, omit } from 'lodash';
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import { CreateMeasurementDto } from './dto/create-measurement.dto';
import { UpdateMeasurementDto } from './dto/update-measurement.dto';

import {
  MeasurementsByDay,
  MeasurementsByHour,
} from 'src/interfaces/measurements.interface';
import { ResolutionTypes } from 'src/constants/resolution.constants';

@Injectable()
export class MeasurementsService {
  constructor(private prisma: PrismaClient) {}

  /**
   * @api {post} /api/measurements/create Create a new measurement
   * @apiName create
   * @apiGroup Measurement
   * @apiBody {Object} createMeasurementDto
   * @apiSuccess {Object} measurement
   */

  async create(createMeasurementDto: CreateMeasurementDto) {
    try {
      return this.prisma.measurement.create({ data: createMeasurementDto });
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   * @api {get} /api/measurements Get all measurements
   * @apiName findAll
   * @apiGroup Measurement
   * @apiSuccess {Object[]} measurements
   */

  async findAll() {
    try {
      return this.prisma.measurement.findMany();
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   * @api {get} /api/measurements/:id Get a measurement by id
   * @apiName findOne
   * @apiGroup Measurement
   * @apiParam {Number} id
   * @apiSuccess {Object} measurement
   */

  async findOne(id: number) {
    try {
      return this.prisma.measurement.findUnique({ where: { id: id } });
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   * @api {get} /api/measurements/find/device/:deviceId Get a measurement by device id
   * @apiName findOneDevice
   * @apiGroup Measurement
   * @apiParam {String} deviceId
   * @apiSuccess {Object[]} measurements
   */

  async findOneDevice(deviceId: string) {
    try {
      const result = await this.prisma.measurement.findMany({
        where: { deviceId: deviceId },
      });
      return result;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   * @api {put} /api/measurements/:id Update a measurement
   * @apiName update
   * @apiGroup Measurement
   * @apiParam {Number} id
   * @apiBody {Object} updateMeasurementDto
   * @apiSuccess {Object} measurement
   */

  async update(id: number, updateMeasurementDto: UpdateMeasurementDto) {
    try {
      return this.prisma.measurement.update({
        where: { id },
        data: updateMeasurementDto,
      });
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   * @api {delete} /api/measurements/:id Delete a measurement
   * @apiName remove
   * @apiGroup Measurement
   * @apiParam {Number} id
   * @apiSuccess {Object} measurement
   */

  async remove(id: number) {
    try {
      return this.prisma.measurement.delete({ where: { id } });
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   * @api {delete} /api/measurements Remove all measurements
   * @apiName removeAll
   * @apiGroup Measurement
   * @apiSuccess {Object} message
   */

  async removeAll() {
    try {
      return this.prisma.measurement.deleteMany();
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   * @api {post} /api/measurements/import Import measurements
   * @apiName measurementImport
   * @apiGroup Measurement
   * @apiParam {File} file
   * @apiSuccess {String} message
   */
  async importMeasurements(file: Express.Multer.File) {
    try {
      const fileContent = JSON.parse(file.buffer.toString('utf8'));
      for (let measurement of fileContent) {
        const deviceId = get(
          measurement,
          'id-dispositivo',
          get(measurement, 'uid'),
        );

        if (measurement && deviceId) {
          measurement.deviceId = deviceId;
          measurement = get(measurement, 'id-dispositivo')
            ? omit(measurement, 'id-dispositivo')
            : omit(measurement, 'uid');
        }

        if (measurement.timestamp) {
          measurement.timestamp = new Date(measurement.timestamp);
        }

        await this.prisma.measurement.create({ data: measurement });
      }
      return { message: 'Measurements imported successfully' };
    } catch (error) {
      return { message: error.message };
    }
  }

  /**
   * @api {get} /api/measurements/device/:deviceId Get measurements by device
   * @apiName getMeasurements
   * @apiGroup Measurement
   * @apiParam {String} deviceId
   * @apiParam {ResolutionTypes} resolution
   * @apiParam {Date} startDate
   * @apiParam {Date} endDate
   * @apiSuccess {Object[]} MeasurementsByDay | MeasurementsByHour
   */
  async getMeasurementsByDevice(
    deviceId: string,
    resolution: ResolutionTypes,
    startDate: Date,
    endDate: Date,
  ) {
    switch (resolution) {
      case ResolutionTypes.DAY:
        return this.getMeasurementsByDay(deviceId, startDate, endDate);
      case ResolutionTypes.HOUR:
        return this.getMeasurementsByHour(deviceId, startDate, endDate);
      case ResolutionTypes.RAW:
        return this.findOneDevice(deviceId);
      default:
        return this.getMeasurementsByDay(deviceId, startDate, endDate);
    }
  }

  async getMeasurementsByDay(deviceId: string, startDate: Date, endDate: Date) {
    const result: MeasurementsByDay[] = await this.prisma.$queryRaw`
      SELECT
        date_trunc('day', "timestamp") AS date,
        SUM("activeEnergy") AS "accumulatedEnergy"
      FROM
        "measurements"
      WHERE
        "deviceId" = ${deviceId}
        AND "timestamp" >= ${startDate}
        AND "timestamp" <= ${endDate}
      GROUP BY
        date
      ORDER BY
        date ASC;
    `;

    result.map((item: MeasurementsByDay) => {
      item.date = new Date(item.date)
        .toISOString()
        .replace('T', ' ')
        .replace('Z', '');
    });
    return { measurements: result };
  }

  async getMeasurementsByHour(
    deviceId: string,
    startDate: Date,
    endDate: Date,
  ) {
    const result: MeasurementsByHour[] = await this.prisma.$queryRaw`
      SELECT
        date_trunc('hour', "timestamp") AS hour,
        SUM("activeEnergy") AS "accumulatedEnergy"
      FROM
        "measurements"
      WHERE
        "deviceId" = ${deviceId}
        AND "timestamp" >= ${startDate}
        AND "timestamp" <= ${endDate}
      GROUP BY
        hour
      ORDER BY
        hour ASC;
    `;

    result.map((item: MeasurementsByHour) => {
      item.hour = new Date(item.hour)
        .toISOString()
        .replace('T', ' ')
        .replace('Z', '');
    });

    return { measurements: result };
  }
}
