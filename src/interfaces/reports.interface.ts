export interface EnergyPerHour {
  deviceId: string;
  hour: string;
  energyPerHour: number;
}

export interface ConsumptionAnlysis {
  activeEnergyPerDay: number;
  activePowerPerDay: number;
  deviceId: string;
  date: Date;
}

export interface ActivePower {
  activePower: number;
  deviceId: string;
  hour: string;
}
