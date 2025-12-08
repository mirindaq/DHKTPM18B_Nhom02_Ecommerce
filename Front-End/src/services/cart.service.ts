import axiosClient from "@/configurations/axios.config";
import type {
  CartAddRequest,
  CartResponse,
  CartWithCustomerResponse,
} from "@/types/cart.type";

export const cartService = {
  getCart: async () => {
    const response = await axiosClient.get<CartResponse>(`/carts`);
    return response.data;
  },
  addProductToCart: async (request: CartAddRequest) => {
    const response = await axiosClient.post<CartResponse>(
      `/carts/add`,
      request
    );
    return response.data;
  },

  removeProductFromCart: async (productVariantId: number) => {
    const response = await axiosClient.delete<CartResponse>(
      `/carts/remove/${productVariantId}`
    );
    return response.data;
  },

  updateCartItemQuantity: async (
    productVariantId: number,
    quantity: number
  ) => {
    const response = await axiosClient.put<CartResponse>(
      `/carts/update-quantity`,
      {
        productVariantId,
        quantity,
      }
    );
    return response.data;
  },

  clearCart: async (userId: number) => {
    const response = await axiosClient.delete(`/carts/clear/${userId}`);
    return response.data;
  },

  // Admin/Staff methods
  getAllCarts: async (
    page: number = 0,
    size: number = 10,
    keyword?: string
  ) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    if (keyword) {
      params.append("keyword", keyword);
    }
    const response = await axiosClient.get<CartWithCustomerResponse>(
      `/carts/admin/all?${params.toString()}`
    );
    return response.data;
  },

  getCartByCustomerId: async (customerId: number) => {
    const response = await axiosClient.get(
      `/carts/admin/customer/${customerId}`
    );
    return response.data;
  },

  sendRemindersBatch: async (cartIds: number[]) => {
    const response = await axiosClient.post(
      `/carts/admin/send-reminders`,
      cartIds
    );
    return response.data;
  },
};
