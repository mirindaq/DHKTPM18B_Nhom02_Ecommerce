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
    
    // Top 5 vouchers
    List<TopVoucherResponse> getTopVouchersByDay(LocalDate startDate, LocalDate endDate);
    List<TopVoucherResponse> getTopVouchersByMonth(Integer year, Integer month);
    List<TopVoucherResponse> getTopVouchersByYear(Integer year);
    
    // Top 5 promotions
    List<TopPromotionResponse> getTopPromotionsByDay(LocalDate startDate, LocalDate endDate);
    List<TopPromotionResponse> getTopPromotionsByMonth(Integer year, Integer month);
    List<TopPromotionResponse> getTopPromotionsByYear(Integer year);
    
    // So sánh voucher
    VoucherComparisonResponse compareVoucher(
        String timeType,
        LocalDate startDate1, LocalDate endDate1,
        LocalDate startDate2, LocalDate endDate2
    );
    
    // So sánh promotion
    PromotionComparisonResponse comparePromotion(
        String timeType,
        LocalDate startDate1, LocalDate endDate1,
        LocalDate startDate2, LocalDate endDate2
    );
    
    // So sánh voucher vs promotion (tổng hợp)
    VoucherPromotionComparisonResponse compareVoucherPromotion(
        String timeType,
        LocalDate startDate1, LocalDate endDate1,
        LocalDate startDate2, LocalDate endDate2
    );
    
    // Thống kê tổng quan dashboard
    DashboardStatsResponse getDashboardStats(LocalDate startDate, LocalDate endDate);
}
