export interface CreateLeaseFormData {
  assetId: string;
  renterId: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  baseChargeAmount: string;
  chargePeriod: string;
  customChargePeriod?: {
    minutes?: number;
    hours?: number;
    days?: number;
  };
}

export interface ChargePeriodOption {
  value: string;
  label: string;
  isCustom?: boolean;
}

export interface AssetOption {
  id: number;
  name: string;
  status: string;
  details?: Array<{ type: string; value: string }>;
}

export interface RenterOption {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  status: string;
  rating: number;
  totalRentals: number;
}

export interface LeaseInterval {
  id: string;
  startDateTime: Date;
  endDateTime: Date;
  duration: string;
  chargeAmount: number;
  intervalNumber: number;
}