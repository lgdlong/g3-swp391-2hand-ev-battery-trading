import { FeeTier } from '@/types/api/fee-tier';

export function calculatePostingFee(postPrice: number, feeTiers: FeeTier[] | undefined): number {
  if (!feeTiers || feeTiers.length === 0) return 0;

  // Find applicable fee tier
  const applicableTier = feeTiers.find((tier) => {
    const minPrice =
      typeof tier.minPrice === 'string' ? Number.parseFloat(tier.minPrice) : tier.minPrice;
    const maxPrice = tier.maxPrice
      ? typeof tier.maxPrice === 'string'
        ? Number.parseFloat(tier.maxPrice)
        : tier.maxPrice
      : Infinity;
    return postPrice >= minPrice && postPrice <= maxPrice;
  });

  if (!applicableTier) return 0;

  // Get fixed posting fee from tier
  const postingFee =
    typeof applicableTier.postingFee === 'string'
      ? Number.parseFloat(applicableTier.postingFee)
      : applicableTier.postingFee;

  return postingFee;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount);
}
