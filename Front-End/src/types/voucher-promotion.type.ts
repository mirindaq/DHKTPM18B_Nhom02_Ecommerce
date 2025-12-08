// Voucher & Promotion Analytics Types

export interface VoucherStatsResponse {
  totalUsage: number;
  totalDiscount: number;
  usageGrowth: number;
  discountGrowth: number;
}

export interface PromotionStatsResponse {
  totalUsage: number;
  totalDiscount: number;
  usageGrowth: number;
  discountGrowth: number;
}

export interface TopVoucherResponse {
  voucherId: number;
  voucherCode: string;
  voucherName: string;
  usageCount: number;
  totalDiscountAmount: number;
}

export interface TopPromotionResponse {
  promotionId: number;
  promotionName: string;
  promotionType: string;
  usageCount: number;
  totalDiscountAmount: number;
}

export interface VoucherComparisonResponse {
  period1Label: string;
  period2Label: string;
  usageCount1: number;
  usageCount2: number;
  totalDiscount1: number;
  totalDiscount2: number;
  usageDifference: number;
  usageGrowthPercent: number;
  discountDifference: number;
  discountGrowthPercent: number;
}

export interface PromotionComparisonResponse {
  period1Label: string;
  period2Label: string;
  usageCount1: number;
  usageCount2: number;
  totalDiscount1: number;
  totalDiscount2: number;
  usageDifference: number;
  usageGrowthPercent: number;
  discountDifference: number;
  discountGrowthPercent: number;
}

export interface VoucherUsageTrendResponse {
  date: string;
  usageCount: number;
  discountAmount: number;
}

export interface PromotionUsageTrendResponse {
  date: string;
  usageCount: number;
  discountAmount: number;
}

export interface VoucherTypeDistribution {
  type: string;
  count: number;
  percentage: number;
}

export interface PromotionTypeDistribution {
  type: string;
  count: number;
  percentage: number;
}

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}
