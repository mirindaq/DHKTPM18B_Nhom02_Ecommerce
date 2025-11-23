import axiosClient from '@/configurations/axios.config'
import type {
  WishListRequest,
  WishListListResponse,
} from '@/types/wishlist.type'

export const wishlistService = {
  getMyWishList: async () => {
    const response = await axiosClient.get<WishListListResponse>('/wishlist')
    return response.data
  },

  addProductToWishList: async (request: WishListRequest) => {
    const response = await axiosClient.post<WishListListResponse>(
      '/wishlist/add',
      request
    )
    return response.data
  },

  removeProductFromWishList: async (request: WishListRequest) => {
    const response = await axiosClient.delete<WishListListResponse>(
      '/wishlist/remove',
      { data: request }
    )
    return response.data
  },
}

