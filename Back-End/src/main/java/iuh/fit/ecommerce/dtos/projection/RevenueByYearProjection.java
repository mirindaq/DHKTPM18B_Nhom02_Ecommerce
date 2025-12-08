package iuh.fit.ecommerce.dtos.projection;

public interface RevenueByYearProjection {
    Integer getYear();
    Double getRevenue();
    Long getOrderCount();
}
