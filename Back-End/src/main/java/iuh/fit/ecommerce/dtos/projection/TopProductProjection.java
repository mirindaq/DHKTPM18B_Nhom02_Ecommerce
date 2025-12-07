package iuh.fit.ecommerce.dtos.projection;

public interface TopProductProjection {
    Long getProductId();
    String getProductName();
    String getProductImage();
    Long getTotalQuantitySold();
    Double getTotalRevenue();
}
