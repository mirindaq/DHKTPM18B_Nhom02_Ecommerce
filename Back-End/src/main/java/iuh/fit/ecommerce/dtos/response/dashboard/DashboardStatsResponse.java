package iuh.fit.ecommerce.dtos.response.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private Double totalRevenue;
    private Long totalOrders;
    private Long totalProducts;
    private Long totalCustomers;
    
    // So sánh với kỳ trước
    private Double revenueGrowth; // % tăng trưởng doanh thu
    private Double ordersGrowth; // % tăng trưởng đơn hàng
    private Double productsGrowth; // % tăng trưởng sản phẩm
    private Double customersGrowth; // % tăng trưởng khách hàng
}
