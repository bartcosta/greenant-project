import { Test, TestingModule } from '@nestjs/testing';
import { MeasurementsService } from './measurements.service';
import { ResolutionTypes } from 'src/constants/resolution.constants';
import { PrismaClient } from '@prisma/client';

jest.mock('@prisma/client', () => {
  const actualPrisma = jest.requireActual('@prisma/client');
  return {
    ...actualPrisma,
    PrismaClient: jest.fn().mockImplementation(() => ({
      measurement: {
        create: jest
          .fn()
          .mockResolvedValueOnce({
            id: 1,
            deviceId: 'device1',
            activeEnergy: 100,
            timestamp: new Date('2020-01-01T00:00:00Z'),
          })
          .mockResolvedValueOnce({
            id: 2,
            deviceId: 'device2',
            activeEnergy: 200,
            timestamp: new Date('2020-01-02T00:00:00Z'),
          }),
        findMany: jest.fn().mockResolvedValue([{}]),
      },
    })),
  };
});

describe('MeasurementsService', () => {
  let service: MeasurementsService;
  let prisma: PrismaClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MeasurementsService, PrismaClient],
    }).compile();

    service = module.get<MeasurementsService>(MeasurementsService);
    prisma = module.get<PrismaClient>(PrismaClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a measurement', async () => {
    const createMeasurementDto = {
      id: 1,
      deviceId: '1',
      activeEnergy: 1,
      activePower: 1,
      timestamp: new Date(),
    };

    jest
      .spyOn(service, 'create')
      .mockImplementation(async () => createMeasurementDto);

    expect(await service.create(createMeasurementDto)).toBe(
      createMeasurementDto,
    );
  });

  it('should return all measurements', async () => {
    const mockMeasurements = [
      {
        id: 1,
        deviceId: '1',
        activeEnergy: 1,
        activePower: 1,
        timestamp: new Date(),
      },
    ];

    jest
      .spyOn(service, 'findAll')
      .mockImplementation(async () => mockMeasurements);

    const measurements = await service.findAll();
    expect(measurements).toEqual(expect.arrayContaining([expect.any(Object)]));
  });

  it('should return a measurement by id', async () => {
    const id = 1;
    const mockMeasurement = {
      id: 1,
      deviceId: 'test-device-id',
      activeEnergy: 1,
      activePower: 1,
      timestamp: new Date(),
    };

    jest
      .spyOn(service, 'findOne')
      .mockImplementation(async () => mockMeasurement);

    expect(await service.findOne(id)).toEqual(mockMeasurement);
  });

  it('should return a measurement by deviceId', async () => {
    const deviceId = '1';
    const mockMeasurement = [
      {
        id: 1,
        deviceId: 'device-id',
        activeEnergy: 1,
        activePower: 1,
        timestamp: new Date(),
      },
    ];
    jest.spyOn(service, 'findOneDevice').mockResolvedValue(mockMeasurement);

    const result = await service.findOneDevice(deviceId);

    expect(result).toEqual(
      expect.objectContaining([
        {
          id: 1,
          deviceId: 'device-id',
          activeEnergy: 1,
          activePower: 1,
          timestamp: expect.any(Date),
        },
      ]),
    );
    expect(service.findOneDevice).toHaveBeenCalledWith(deviceId);
  });

  it('should update a measurement and return the updated measurement', async () => {
    const id = 1;
    const updateMeasurementDto = {
      activeEnergy: 100,
      activePower: 50,
      deviceId: 'test-device-id',
    };
    const updatedMeasurement = {
      id,
      ...updateMeasurementDto,
      timestamp: new Date(),
    };

    jest.spyOn(service, 'update').mockResolvedValue(updatedMeasurement);

    expect(await service.update(id, updateMeasurementDto)).toEqual(
      updatedMeasurement,
    );
    expect(service.update).toHaveBeenCalledWith(id, updateMeasurementDto);
  });

  it('should delete a measurement and return the deleted measurement', async () => {
    const id = 1;
    const deletedMeasurement = {
      id,
      deviceId: 'test-device-id',
      activeEnergy: 100,
      activePower: 50,
      timestamp: new Date(),
    };

    jest.spyOn(service, 'remove').mockResolvedValue(deletedMeasurement);

    expect(await service.remove(id)).toEqual(deletedMeasurement);
    expect(service.remove).toHaveBeenCalledWith(id);
  });

  it('should delete all measurements', async () => {
    jest.spyOn(service, 'removeAll').mockResolvedValue({ count: 10 });

    const result = await service.removeAll();
    expect(result).toHaveProperty('count', 10);
  });

  it('should import measurements from a file', async () => {
    const mockFile = {
      buffer: Buffer.from(
        JSON.stringify([
          {
            'id-dispositivo': 'device1',
            activeEnergy: 100,
            timestamp: '2020-01-01T00:00:00Z',
          },
          {
            uid: 'device2',
            activeEnergy: 200,
            timestamp: '2020-01-02T00:00:00Z',
          },
        ]),
      ),
    };

    const prismaCreateSpy = jest.spyOn(prisma.measurement, 'create');
    const result = await service.importMeasurements(
      mockFile as Express.Multer.File,
    );

    expect(prismaCreateSpy).toHaveBeenCalledTimes(2);
    expect(prismaCreateSpy).toHaveBeenNthCalledWith(1, {
      data: {
        deviceId: 'device1',
        activeEnergy: 100,
        timestamp: new Date('2020-01-01T00:00:00Z'),
      },
    });
    expect(prismaCreateSpy).toHaveBeenNthCalledWith(2, {
      data: {
        deviceId: 'device2',
        activeEnergy: 200,
        timestamp: new Date('2020-01-02T00:00:00Z'),
      },
    });
    expect(result).toEqual({ message: 'Measurements imported successfully' });
  });

  describe('getMeasurementsByDevice', () => {
    it('should return measurements by day', async () => {
      const deviceId = 'device1';
      const resolution = ResolutionTypes.DAY;
      const startDate = new Date('2021-01-01');
      const endDate = new Date('2021-01-31');

      jest
        .spyOn(service, 'getMeasurementsByDay')
        .mockImplementation(async () => ({
          measurements: [],
        }));

      const result = await service.getMeasurementsByDevice(
        deviceId,
        resolution,
        startDate,
        endDate,
      );
      expect(result).toEqual({ measurements: [] });
      expect(service.getMeasurementsByDay).toHaveBeenCalledWith(
        deviceId,
        startDate,
        endDate,
      );
    });

    it('should return measurements by hour', async () => {
      const deviceId = 'device2';
      const resolution = ResolutionTypes.HOUR;
      const startDate = new Date('2021-02-01');
      const endDate = new Date('2021-02-28');

      jest
        .spyOn(service, 'getMeasurementsByHour')
        .mockImplementation(async () => ({
          measurements: [],
        }));

      const result = await service.getMeasurementsByDevice(
        deviceId,
        resolution,
        startDate,
        endDate,
      );
      expect(result).toEqual({ measurements: [] });
      expect(service.getMeasurementsByHour).toHaveBeenCalledWith(
        deviceId,
        startDate,
        endDate,
      );
    });

    it('should return raw measurements for RAW resolution', async () => {
      const deviceId = 'device3';
      const resolution = ResolutionTypes.RAW;
      const startDate = new Date();
      const endDate = new Date();

      jest.spyOn(service, 'findOneDevice').mockImplementation(async () => []);

      const result = await service.getMeasurementsByDevice(
        deviceId,
        resolution,
        startDate,
        endDate,
      );
      expect(result).toEqual([]);
      expect(service.findOneDevice).toHaveBeenCalledWith(deviceId);
    });
  });
});
