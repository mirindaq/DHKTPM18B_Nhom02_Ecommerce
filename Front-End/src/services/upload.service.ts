
import axiosClient from '@/configurations/axios.config';
import type { ResponseApi } from '@/types/responseApi.type';

export const uploadService = {
  uploadImage: async (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await axiosClient.post<ResponseApi<string[]>>('/uploads', formData
      ,{
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },
};
