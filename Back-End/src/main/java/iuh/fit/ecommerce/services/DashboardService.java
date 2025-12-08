package iuh.fit.ecommerce.services;

import iuh.fit.ecommerce.dtos.response.dashboard.*;

import java.time.LocalDate;
import java.util.List;

public interface DashboardService {
    List<RevenueByMonthResponse> getRevenueByMonth(Integer year, Integer month);
    List<RevenueByDayResponse> getRevenueByDay(LocalDate startDate, LocalDate endDate);
    List<RevenueByYearResponse> getRevenueByYear(Integer year);
    List<TopProductResponse> getTopProductsByDay(LocalDate startDate, LocalDate endDate);
    List<TopProductResponse> getTopProductsByMonth(Integer year, Integer month);
    List<TopProductResponse> getTopProductsByYear(Integer year);
    
    // So sánh doanh thu
    ComparisonResponse compareRevenue(
        String timeType,
        LocalDate startDate1, LocalDate endDate1,
        LocalDate startDate2, LocalDate endDate2
    );
}
