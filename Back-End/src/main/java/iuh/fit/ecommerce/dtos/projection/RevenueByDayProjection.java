package iuh.fit.ecommerce.dtos.projection;

import java.time.LocalDate;

public interface RevenueByDayProjection {
    LocalDate getOrderDate();
    Double getRevenue();
    Long getOrderCount();
}
