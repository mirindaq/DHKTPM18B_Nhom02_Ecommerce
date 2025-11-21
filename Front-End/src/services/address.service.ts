// src/services/address.service.ts
import axiosClient from '@/configurations/axios.config'
import type { AddressResponse, AddressListResponse, CreateAddressRequest } from '@/types/address.type'

export const addressService = {
  /**
   * Lấy danh sách địa chỉ của customer hiện tại
   */
  getAddresses: async () => {
    const res = await axiosClient.get('/addresses')
    // Backend trả về { status, message, data: [...] }
    return res.data?.data || []
  },

  /**
   * Lấy chi tiết một địa chỉ
   */
  getAddressById: async (addressId: number) => {
    const res = await axiosClient.get(`/addresses/${addressId}`)
    return res.data?.data
  },

  /**
   * Thêm địa chỉ mới
   */
  addAddress: async (request: CreateAddressRequest) => {
    const res = await axiosClient.post('/addresses', request)
    return res.data?.data
  },

  /**
   * Cập nhật địa chỉ
   */
  updateAddress: async (addressId: number, request: CreateAddressRequest) => {
    const res = await axiosClient.put(`/addresses/${addressId}`, request)
    return res.data?.data
  },

  /**
   * Xóa địa chỉ
   */
  deleteAddress: async (addressId: number) => {
    const res = await axiosClient.delete(`/addresses/${addressId}`)
    return res.data?.data
  },

  /**
   * Đặt địa chỉ làm mặc định
   */
  setDefaultAddress: async (addressId: number) => {
    const res = await axiosClient.patch(`/addresses/${addressId}/set-default`)
    return res.data?.data
  },
}
