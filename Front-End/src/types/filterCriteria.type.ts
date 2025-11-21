import type { ResponseApi } from "./responseApi.type";

export type FilterValue = {
  id: number;
  value: string;
  filterCriteriaId: number;
};

export type FilterCriteria = {
  id: number;
  name: string;
  categoryId: number;
  filterValues?: FilterValue[];
};

export type CreateFilterCriteriaRequest = {
  name: string;
  categoryId: number;
  values?: string[];
};

export type SetFilterValuesForCriteriaRequest = {
  filterCriteriaId: number;
  values: string[];
};

export type FilterCriteriaResponse = ResponseApi<FilterCriteria>;

export type FilterCriteriaListResponse = ResponseApi<FilterCriteria[]>;

export type FilterValueResponse = ResponseApi<FilterValue>;

export type FilterValueListResponse = ResponseApi<FilterValue[]>;

