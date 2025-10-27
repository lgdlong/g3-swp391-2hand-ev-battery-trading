export function buildAddressText(
  wardName?: string | null,
  districtName?: string | null,
  provinceName?: string | null,
): string | null {
  if (!wardName && !districtName && !provinceName) {
    return null;
  }
  const parts = [wardName, districtName, provinceName].filter(Boolean);
  return parts.length ? parts.join(', ') : null;
}
