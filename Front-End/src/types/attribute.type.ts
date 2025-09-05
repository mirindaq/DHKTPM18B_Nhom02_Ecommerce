import type { ResponseApi } from "./responseApi.type";

export type Attribute = {
  id: number;
  name: string;
  categoryName: string;
  status: boolean;
};

export type AttributeListResponse = ResponseApi<Attribute[]>;
