// Filter constants để tránh hardcode labels
export const FILTER_LABELS = {
  NEW_ARRIVALS: 'Hàng mới về',
  PRICE: 'Xem theo giá',
  BRAND: 'Hãng xe',
  ODO_KM: 'Số km đã đi',
  CAPACITY: 'Dung lượng pin',
  CYCLES: 'Số chu kỳ',
  BATTERY_BRAND: 'Thương hiệu',
} as const;

export const FILTER_KEYS = {
  NEW_ARRIVALS: 'new-arrivals',
  PRICE: 'price',
  BRAND: 'brand',
  ODO_KM: 'odoKm',
  CAPACITY: 'capacity',
  CYCLES: 'cycles',
  BATTERY_BRAND: 'batteryBrand',
} as const;

// Mapping từ label sang filter key
export const LABEL_TO_FILTER_KEY: Record<string, string> = {
  [FILTER_LABELS.NEW_ARRIVALS]: FILTER_KEYS.NEW_ARRIVALS,
  [FILTER_LABELS.PRICE]: FILTER_KEYS.PRICE,
  [FILTER_LABELS.BRAND]: FILTER_KEYS.BRAND,
  [FILTER_LABELS.ODO_KM]: FILTER_KEYS.ODO_KM,
  [FILTER_LABELS.CAPACITY]: FILTER_KEYS.CAPACITY,
  [FILTER_LABELS.CYCLES]: FILTER_KEYS.CYCLES,
  [FILTER_LABELS.BATTERY_BRAND]: FILTER_KEYS.BATTERY_BRAND,
};
