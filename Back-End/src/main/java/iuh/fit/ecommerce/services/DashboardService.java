package iuh.fit.ecommerce.services;

import iuh.fit.ecommerce.dtos.response.dashboard.RevenueByDayResponse;
import iuh.fit.ecommerce.dtos.response.dashboard.RevenueByMonthResponse;

import java.time.LocalDate;
import java.util.List;

public interface DashboardService {
    List<RevenueByMonthResponse> getRevenueByMonth(Integer year);
    List<RevenueByDayResponse> getRevenueByDay(LocalDate startDate, LocalDate endDate);
}
