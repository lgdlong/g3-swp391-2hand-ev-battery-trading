// shared/constants/vehicle.ts
export const SEAT_OPTIONS = [2, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16] as const;
export type SeatOption = (typeof SEAT_OPTIONS)[number];
