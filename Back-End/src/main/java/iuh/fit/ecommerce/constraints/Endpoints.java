package iuh.fit.ecommerce.constraints;

public class Endpoints {
    public static final String[] PRIVATE_ENDPOINT = {
            "/api/v1/auth/profile",
            "/api/v1/auth/logout",
            "/api/v1/carts(?:/.*)?",
            "/api/v1/vouchers(?:/.*)?",
            "/api/v1/articles(?:/.*)?",
            "/api/v1/product-questions(?:/.*)?",
            "/api/v1/admin/product-questions(?:/.*)?",
            "/api/v1/orders(?:/.*)?",
            "/api/v1/banners(?:/.*)?",
            "/api/v1/addresses(?:/.*)?",
            "/api/v1/chats(?:/.*)?",
            "/api/v1/wishlist(?:/.*)?",
            "/api/v1/shippers(?:/.*)?",
            "/api/v1/delivery-assignments(?:/.*)?",
            "/api/v1/feedbacks(?:/.*)?",
            "/api/v1/customers/update-push-token?",
            "/api/v1/purchase-orders(?:/.*)?"
    };
}

