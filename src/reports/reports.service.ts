import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  ActivePower,
  ConsumptionAnlysis,
  EnergyPerHour,
} from 'src/interfaces/reports.interface';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaClient) {}

  /**
   * @api {get} /api/reports/devices-months Get all devices and months
   * @apiName reportGetAllDevicesAndMonths
   * @apiGroup Report
   * @apiSuccess {Object[], Object[]} devices, months
   */

  async reportGetAllDevicesAndMonths() {
    const result: any = await this.prisma.$queryRaw`
      SELECT
        DISTINCT "deviceId",
        TO_CHAR(date_trunc('month', "timestamp"), 'YYYY-MM') AS "month"
      FROM
        "measurements"
      ORDER BY
        "deviceId" ASC,
        "month" ASC;
    `;

    if (!result) {
      return null;
    }

    const deviceIds: string[] = [];
    const monthsUnique: string[] = [];

    result.map((item: any) => {
      if (!deviceIds.includes(item.deviceId)) {
        deviceIds.push(item.deviceId);
      }
    });
    result.map((item: any) => {
      if (!monthsUnique.includes(item.month)) {
        monthsUnique.push(item.month);
      }
    });

    return { devices: deviceIds, months: monthsUnique };
  }

  /**
   * @api {get} /api/reports/active-power Report Active Power
   * @apiName reportActivePower
   * @apiGroup Report
   * @apiParam {Date} startDate
   * @apiParam {Date} endDate
   * @apiSuccess {Object[]} ActivePower
   */
  async reportActivePower(startDate: Date, endDate: Date) {
    const result: ActivePower[] = await this.prisma.$queryRaw`
          SELECT
            date_trunc('hour', "timestamp") AS hour,
            AVG("activePower") AS "activePowerPerHour",
            "deviceId"
          FROM
            "measurements"
          WHERE
            "timestamp" >= ${startDate}
            AND "timestamp" <= ${endDate}
          GROUP BY
            hour,
            "deviceId"
          ORDER BY
            hour ASC;
        `;

    if (!result) {
      return null;
    }

    return result;
  }

  /**
   * @api {get} /api/reports/consumption-patterns Report Consumption Patterns
   * @apiName reportConsumptionPatterns
   * @apiGroup Report
   * @apiParam {Date} startDate
   * @apiParam {Date} endDate
   * @apiSuccess {Number, Number, Object[], Object[]} totalConsumption, averageConsumption, peakHours, lowestHours
   */

  async reportConsumptionPatterns(startDate: Date, endDate: Date) {
    const result: EnergyPerHour[] = await this.prisma.$queryRaw`
    SELECT
      date_trunc('hour', "timestamp") AS hour,
      SUM("activeEnergy") AS "energyPerHour",
      "deviceId"
    FROM
      "measurements"
    WHERE
      "timestamp" >= ${startDate}
      AND "timestamp" <= ${endDate}
    GROUP BY
      hour,
      "deviceId"
    ORDER BY
      hour ASC;
  `;

    if (!result) {
      return null;
    }

    const totalConsumption = result.reduce(
      (sum, item) => sum + item.energyPerHour,
      0,
    );

    const avg = totalConsumption / result.length;

    const peakHours: EnergyPerHour[] = [];
    const lowestHours: EnergyPerHour[] = [];

    result.forEach((consumption: EnergyPerHour) => {
      if (consumption.energyPerHour > avg) {
        peakHours.push(consumption);
      } else if (consumption.energyPerHour < avg) {
        lowestHours.push(consumption);
      }
    });

    return {
      totalConsumption,
      averageConsumption: avg,
      peakHours: peakHours,
      lowestHours: lowestHours,
    };
  }

  /**
   * @api {get} /api/reports/consumption-analysis Report Consumption Analysis
   * @apiName reportConsumptionAnalysis
   * @apiGroup Report
   * @apiSuccess {Object[], Object[]} avgPowerPerDay, activeEnergyPerDay
   */

  async reportConsumptionAnalysis() {
    const result: ConsumptionAnlysis[] = await this.prisma.$queryRaw`
    SELECT
      date_trunc('day', "timestamp") AS date,
      SUM("activeEnergy") AS "activeEnergyPerDay",
      SUM("activePower") AS "activePowerPerDay",
      "deviceId"
    FROM
      "measurements"
    GROUP BY
      date,
      "deviceId"
    ORDER BY
      date ASC;
  `;

    if (!result) {
      return null;
    }

    const avgPowerPerDay = result.map((item: ConsumptionAnlysis) => {
      return {
        date: item.date,
        avgPowerPerDay: item.activePowerPerDay / 24,
        deviceId: item.deviceId,
      };
    });
    const activeEnergyPerDay = result.map((item: ConsumptionAnlysis) => {
      return {
        date: item.date,
        activeEnergyPerDay: item.activeEnergyPerDay,
        deviceId: item.deviceId,
      };
    });

    return {
      avgPowerPerDay: avgPowerPerDay,
      activeEnergyPerDay: activeEnergyPerDay,
    };
  }
}
