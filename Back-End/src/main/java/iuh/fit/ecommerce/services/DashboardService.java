package iuh.fit.ecommerce.services;

import iuh.fit.ecommerce.dtos.response.dashboard.RevenueByDayResponse;
import iuh.fit.ecommerce.dtos.response.dashboard.RevenueByMonthResponse;
import iuh.fit.ecommerce.dtos.response.dashboard.RevenueByYearResponse;
import iuh.fit.ecommerce.dtos.response.dashboard.TopProductResponse;

import java.time.LocalDate;
import java.util.List;

public interface DashboardService {
    List<RevenueByMonthResponse> getRevenueByMonth(Integer year);
    List<RevenueByDayResponse> getRevenueByDay(LocalDate startDate, LocalDate endDate);
    List<RevenueByYearResponse> getRevenueByYear(Integer year);
    List<TopProductResponse> getTopProductsByDay(LocalDate startDate, LocalDate endDate);
    List<TopProductResponse> getTopProductsByMonth(Integer year, Integer month);
    List<TopProductResponse> getTopProductsByYear(Integer year);
}
