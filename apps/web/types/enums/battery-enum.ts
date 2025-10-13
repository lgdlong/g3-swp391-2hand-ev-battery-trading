import { Origin } from './post-enum';

export enum BatteryChemistry {
  LFP = 'LFP',
  NMC = 'NMC',
  NCA = 'NCA',
  LMO = 'LMO',
  LCO = 'LCO',
  OTHER = 'OTHER',
}

export const BATTERY_CHEMISTRY_LABELS: Record<BatteryChemistry, string> = {
  [BatteryChemistry.LFP]: 'LFP (Lithium Iron Phosphate)',
  [BatteryChemistry.NMC]: 'NMC (Nickel Manganese Cobalt)',
  [BatteryChemistry.NCA]: 'NCA (Nickel Cobalt Aluminum)',
  [BatteryChemistry.LMO]: 'LMO (Lithium Manganese Oxide)',
  [BatteryChemistry.LCO]: 'LCO (Lithium Cobalt Oxide)',
  [BatteryChemistry.OTHER]: 'Khác',
};

export const BATTERY_ORIGIN_LABELS: Record<Origin, string> = {
  [Origin.NOI_DIA]: 'Nội địa',
  [Origin.NHAP_KHAU]: 'Nhập khẩu',
};
