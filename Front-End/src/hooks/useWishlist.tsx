import { useQuery } from "@/hooks/useQuery";
import { useMutation } from "@/hooks/useMutation";
import { wishlistService } from "@/services/wishlist.service";
import type { WishListResponse, WishListRequest } from "@/types/wishlist.type";
import { toast } from "sonner";
import { useUser } from "@/context/UserContext";

export function useWishlist() {
  const { isAuthenticated } = useUser();

  // Fetch wishlist
  const {
    data: wishlistData,
    isLoading: loading,
    refetch: refetchWishlist,
  } = useQuery<{ data: WishListResponse[] }>(
    () => wishlistService.getMyWishList(),
    {
      queryKey: ["wishlist"],
      enabled: isAuthenticated,
      onError: (err) => {
        console.error("Lỗi khi tải wishlist:", err);
      },
    }
  );

  const wishlistItems = wishlistData?.data || [];

  // Check if product is in wishlist
  const isInWishlist = (productId: number): boolean => {
    return wishlistItems.some(
      (item) => item.productId === productId
    );
  };

  // Mutation để thêm vào wishlist
  const addToWishlistMutation = useMutation(
    (request: WishListRequest) =>
      wishlistService.addProductToWishList(request),
    {
      onSuccess: () => {
        toast.success("Đã thêm vào danh sách yêu thích!");
        refetchWishlist();
      },
      onError: (error: any) => {
        console.error("Lỗi khi thêm vào wishlist:", error);
        const errorMsg =
          error.response?.data?.message || "Không thể thêm vào danh sách yêu thích!";
        toast.error(errorMsg);
      },
    }
  );

  // Mutation để xóa khỏi wishlist
  const removeFromWishlistMutation = useMutation(
    (request: WishListRequest) =>
      wishlistService.removeProductFromWishList(request),
    {
      onSuccess: () => {
        toast.success("Đã xóa khỏi danh sách yêu thích!");
        refetchWishlist();
      },
      onError: (error: any) => {
        console.error("Lỗi khi xóa khỏi wishlist:", error);
        const errorMsg =
          error.response?.data?.message || "Không thể xóa khỏi danh sách yêu thích!";
        toast.error(errorMsg);
      },
    }
  );

  // Toggle wishlist (thêm nếu chưa có, xóa nếu đã có)
  const toggleWishlist = (productId: number) => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để sử dụng tính năng này");
      return;
    }

    if (isInWishlist(productId)) {
      removeFromWishlistMutation.mutate({ productId });
    } else {
      addToWishlistMutation.mutate({ productId });
    }
  };

  return {
    wishlistItems,
    loading,
    isInWishlist,
    toggleWishlist,
    addToWishlist: addToWishlistMutation.mutate,
    removeFromWishlist: removeFromWishlistMutation.mutate,
    isAdding: addToWishlistMutation.isLoading,
    isRemoving: removeFromWishlistMutation.isLoading,
    refetch: refetchWishlist,
  };
}

