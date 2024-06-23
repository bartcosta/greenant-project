import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { PrismaClient } from '@prisma/client';

describe('ReportsService', () => {
  let service: ReportsService;
  let prismaMock: any;

  beforeEach(async () => {
    prismaMock = {
      $queryRaw: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: PrismaClient,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('reportActivePower should return average active power per hour', async () => {
    prismaMock.$queryRaw.mockResolvedValue([
      {
        hour: '2023-01-01T00:00:00.000Z',
        activePowerPerHour: 100,
        deviceId: 'device1',
      },
    ]);
    const startDate = new Date('2023-01-01');
    const endDate = new Date('2023-01-02');
    const result = await service.reportActivePower(startDate, endDate);
    expect(result).toEqual([
      {
        hour: '2023-01-01T00:00:00.000Z',
        activePowerPerHour: 100,
        deviceId: 'device1',
      },
    ]);
  });

  it('reportConsumptionPatterns should return consumption patterns', async () => {
    prismaMock.$queryRaw.mockResolvedValue([
      {
        hour: '2023-01-01T00:00:00.000Z',
        energyPerHour: 200,
        deviceId: 'device1',
      },
    ]);
    const startDate = new Date('2023-01-01');
    const endDate = new Date('2023-01-02');
    const result = await service.reportConsumptionPatterns(startDate, endDate);
    expect(result?.totalConsumption).toBe(200);
    expect(result?.averageConsumption).toBe(200);
    expect(result?.peakHours.length).toBeGreaterThanOrEqual(0);
    expect(result?.lowestHours.length).toBeGreaterThanOrEqual(0);
  });

  it('reportConsumptionAnalysis should return consumption analysis', async () => {
    prismaMock.$queryRaw.mockResolvedValue([
      {
        date: '2023-01-01',
        activeEnergyPerDay: 4800,
        activePowerPerDay: 200,
        deviceId: 'device1',
      },
    ]);
    const result = await service.reportConsumptionAnalysis();
    expect(result?.avgPowerPerDay[0].avgPowerPerDay).toBe(200 / 24);
    expect(result?.activeEnergyPerDay[0].activeEnergyPerDay).toBe(4800);
  });
});
