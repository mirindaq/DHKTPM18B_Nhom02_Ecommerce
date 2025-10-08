import axiosClient from "@/configurations/axios.config";
import type { CartAddRequest, CartResponse } from "@/types/cart.type";

export const cartService = {
  getCart: async () => {
    const response = await axiosClient.get<CartResponse>(`/carts`);
    return response.data;
  },
  addProductToCart: async (request: CartAddRequest) => {
    const response = await axiosClient.post<CartResponse>(`/carts/add`, request);
    return response.data;
  },

  removeProductFromCart: async (productVariantId: number) => {
    const response = await axiosClient.delete<CartResponse>(`/carts/remove/${productVariantId}`);
    return response.data;
  },

  updateCartItemQuantity: async (productVariantId: number, quantity: number) => {
    const response = await axiosClient.put<CartResponse>(`/carts/update-quantity`, {
      productVariantId,
      quantity
    });
    return response.data;
  },

  clearCart: async (userId: number) => {
    const response = await axiosClient.delete(`/carts/clear/${userId}`);
    return response.data;
  },
};
   