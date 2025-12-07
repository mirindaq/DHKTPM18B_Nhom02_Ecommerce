
import axiosClient from '@/configurations/axios.config';
import type { ResponseApi } from '@/types/responseApi.type';

export const uploadService = {
  uploadImage: async (files: File | File[]) => {
    const formData = new FormData();
    
    // Handle both single file and array of files
    const fileArray = Array.isArray(files) ? files : [files];
    fileArray.forEach(file => {
      formData.append('files', file);
    });

    const response = await axiosClient.post<ResponseApi<string[]>>('/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },
};
