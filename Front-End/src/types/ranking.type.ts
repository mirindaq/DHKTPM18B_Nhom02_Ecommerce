import type { ResponseApi } from "./responseApi.type";

export type RankVoucher = {
  id: number;
  name: string;
  description: string;
};

export type RankVoucherResponse = {
  id: number;
  name: string;
};

export type Rank = {
  id: number;
  name: string;
  description: string;
  minSpending: number;
  maxSpending: number;
  discountRate: number;
};

export type RankResponse = ResponseApi<Rank[]>;
