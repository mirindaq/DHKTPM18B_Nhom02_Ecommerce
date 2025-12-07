package iuh.fit.ecommerce.services.impl;

import iuh.fit.ecommerce.dtos.response.dashboard.RevenueByDayResponse;
import iuh.fit.ecommerce.dtos.response.dashboard.RevenueByMonthResponse;
import iuh.fit.ecommerce.repositories.OrderRepository;
import iuh.fit.ecommerce.services.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardServiceImpl implements DashboardService {
    
    private final OrderRepository orderRepository;

    @Override
    public List<RevenueByMonthResponse> getRevenueByMonth(Integer year) {
        List<RevenueByMonthResponse> result = new ArrayList<>();
        
        for (int month = 1; month <= 12; month++) {
            YearMonth yearMonth = YearMonth.of(year, month);
            LocalDate startDate = yearMonth.atDay(1);
            LocalDate endDate = yearMonth.atEndOfMonth();
            
            LocalDateTime start = startDate.atStartOfDay();
            LocalDateTime end = endDate.atTime(23, 59, 59);
            
            Double revenue = orderRepository.sumRevenueByDateRange(start, end);
            Long orderCount = orderRepository.countByDateRange(start, end);
            
            result.add(RevenueByMonthResponse.builder()
                    .month(month)
                    .year(year)
                    .revenue(revenue != null ? revenue : 0.0)
                    .orderCount(orderCount)
                    .build());
        }
        
        return result;
    }

    @Override
    public List<RevenueByDayResponse> getRevenueByDay(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);
        
        List<Object[]> results = orderRepository.getRevenueByDay(start, end);
        
        return results.stream()
                .map(row -> {
                    java.sql.Date sqlDate = (java.sql.Date) row[0];
                    LocalDate date = sqlDate.toLocalDate();
                    Double revenue = row[1] != null ? ((Number) row[1]).doubleValue() : 0.0;
                    Long orderCount = row[2] != null ? ((Number) row[2]).longValue() : 0L;
                    
                    return RevenueByDayResponse.builder()
                            .date(date)
                            .revenue(revenue)
                            .orderCount(orderCount)
                            .build();
                })
                .toList();
    }
}
