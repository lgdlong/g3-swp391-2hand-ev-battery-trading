// Constants cho các options trong dropdown filters
export const CYCLES_OPTIONS = [
  { value: '<1000', label: 'Dưới 1,000 chu kỳ' },
  { value: '1000-2000', label: '1,000 - 2,000 chu kỳ' },
  { value: '2000-3000', label: '2,000 - 3,000 chu kỳ' },
  { value: '3000-4000', label: '3,000 - 4,000 chu kỳ' },
  { value: '>4000', label: 'Trên 4,000 chu kỳ' }
] as const;

export const CAPACITY_OPTIONS = [
  { value: '<30', label: 'Dưới 30kWh' },
  { value: '30-50', label: '30kWh - 50kWh' },
  { value: '50-70', label: '50kWh - 70kWh' },
  { value: '70-100', label: '70kWh - 100kWh' },
  { value: '>100', label: 'Trên 100kWh' }
] as const;

export const RANGE_OPTIONS = [
  { value: '<300', label: 'Dưới 300km/lần sạc' },
  { value: '300-600', label: '300km - 600km/lần sạc' },
  { value: '>600', label: 'Trên 600km/lần sạc' }
] as const;

export const HEALTH_OPTIONS = [
  { value: 'excellent', label: 'Xuất sắc (90-100%)' },
  { value: 'very-good', label: 'Rất tốt (80-89%)' },
  { value: 'good', label: 'Tốt (70-79%)' },
  { value: 'fair', label: 'Khá (60-69%)' },
  { value: 'poor', label: 'Kém (dưới 60%)' }
] as const;

export const BATTERY_BRAND_OPTIONS = [
  { value: 'panasonic', label: 'Panasonic' },
  { value: 'lg-chem', label: 'LG Chem' },
  { value: 'samsung-sdi', label: 'Samsung SDI' },
  { value: 'catl', label: 'CATL' },
  { value: 'tesla', label: 'Tesla' },
  { value: 'byd', label: 'BYD' },
  { value: 'sk-innovation', label: 'SK Innovation' },
  { value: 'northvolt', label: 'Northvolt' },
  { value: 'calb', label: 'CALB' },
  { value: 'eve-energy', label: 'EVE Energy' }
] as const;

// Constants cho price range
export const PRICE_CONSTANTS = {
  MIN_PRICE: 0,
  MAX_PRICE: 1500000000,
  DEFAULT_MAX_PRICE: 150000000000,
  STEP: 10000000
} as const;

// Constants cho button labels
export const BUTTON_LABELS = {
  CLEAR_FILTER: 'Xóa bộ lọc',
  CANCEL: 'Hủy',
  APPLY: 'Áp dụng'
} as const;

// Constants cho dropdown titles
export const DROPDOWN_TITLES = {
  CYCLES: 'Số chu kỳ',
  CAPACITY: 'Dung lượng pin',
  RANGE: 'Quãng đường di chuyển trên 1 lần sạc',
  HEALTH: 'Tình trạng pin',
  PRICE: 'Chọn khoảng giá',
  BRAND: 'Hãng xe điện',
  BATTERY_BRAND: 'Thương hiệu pin'
} as const;
