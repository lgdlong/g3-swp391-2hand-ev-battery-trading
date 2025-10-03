export interface Province {
  province_id: number;
  code: string;
  name: string;
  type: string;
}

export interface District {
  district_id: number;
  code: string;
  name: string;
  type: string;
  province_code: string;
}

export interface Ward {
  ward_id: number;
  code: string;
  name: string;
  type: string;
  district_code: string;
  province_code: string;
  district: District;
  province: Province;
}

export interface AddressApiResponse {
  success: boolean;
  message: string;
  data: {
    province: Province;
    district: District;
    ward: Ward;
  };
}
