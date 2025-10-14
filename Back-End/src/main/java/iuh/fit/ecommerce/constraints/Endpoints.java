package iuh.fit.ecommerce.constraints;

public class Endpoints {
    public static final String[] PRIVATE_ENDPOINT = {
            "/api/v1/auth/profile",
            "/api/v1/auth/logout",
            "/api/v1/carts(?:/.*)?",
            "/api/v1/vouchers(?:/.*)?",

    };
}
