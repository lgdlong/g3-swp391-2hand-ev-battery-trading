// Filter constants để tránh hardcode labels
export const FILTER_LABELS = {
  NEW_ARRIVALS: 'Hàng mới về',
  PRICE: 'Xem theo giá',
  BRAND: 'Hãng xe',
  RANGE: 'Quãng đường di chuyển',
  CAPACITY: 'Dung lượng pin',
  HEALTH: 'Tình trạng pin',
  CYCLES: 'Số chu kỳ',
  BATTERY_BRAND: 'Thương hiệu'
} as const;

export const FILTER_KEYS = {
  NEW_ARRIVALS: 'new-arrivals',
  PRICE: 'price',
  BRAND: 'brand',
  RANGE: 'range',
  CAPACITY: 'capacity',
  HEALTH: 'health',
  CYCLES: 'cycles',
  BATTERY_BRAND: 'batteryBrand'
} as const;

// Mapping từ label sang filter key
export const LABEL_TO_FILTER_KEY: Record<string, string> = {
  [FILTER_LABELS.NEW_ARRIVALS]: FILTER_KEYS.NEW_ARRIVALS,
  [FILTER_LABELS.PRICE]: FILTER_KEYS.PRICE,
  [FILTER_LABELS.BRAND]: FILTER_KEYS.BRAND,
  [FILTER_LABELS.RANGE]: FILTER_KEYS.RANGE,
  [FILTER_LABELS.CAPACITY]: FILTER_KEYS.CAPACITY,
  [FILTER_LABELS.HEALTH]: FILTER_KEYS.HEALTH,
  [FILTER_LABELS.CYCLES]: FILTER_KEYS.CYCLES,
  [FILTER_LABELS.BATTERY_BRAND]: FILTER_KEYS.BATTERY_BRAND
};
