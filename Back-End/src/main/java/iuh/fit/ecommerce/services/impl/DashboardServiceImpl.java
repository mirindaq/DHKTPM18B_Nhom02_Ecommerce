package iuh.fit.ecommerce.services.impl;

import iuh.fit.ecommerce.dtos.response.dashboard.RevenueByDayResponse;
import iuh.fit.ecommerce.dtos.response.dashboard.RevenueByMonthResponse;
import iuh.fit.ecommerce.dtos.response.dashboard.RevenueByYearResponse;
import iuh.fit.ecommerce.dtos.response.dashboard.TopProductResponse;
import iuh.fit.ecommerce.repositories.OrderDetailRepository;
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
    private final OrderDetailRepository orderDetailRepository;

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
        
        return orderRepository.getRevenueByDay(start, end).stream()
                .map(projection -> RevenueByDayResponse.builder()
                        .date(projection.getOrderDate())
                        .revenue(projection.getRevenue())
                        .orderCount(projection.getOrderCount())
                        .build())
                .toList();
    }

    @Override
    public List<RevenueByYearResponse> getRevenueByYear(Integer year) {
        return orderRepository.getRevenueByYear(year).stream()
                .map(projection -> RevenueByYearResponse.builder()
                        .year(projection.getYear())
                        .revenue(projection.getRevenue())
                        .orderCount(projection.getOrderCount())
                        .build())
                .toList();
    }

    @Override
    public List<TopProductResponse> getTopProductsByDay(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);
        
        return orderDetailRepository.getTopProductsByDay(start, end).stream()
                .map(this::mapToTopProductResponse)
                .toList();
    }

    @Override
    public List<TopProductResponse> getTopProductsByMonth(Integer year, Integer month) {
        return orderDetailRepository.getTopProductsByMonth(year, month).stream()
                .map(this::mapToTopProductResponse)
                .toList();
    }

    @Override
    public List<TopProductResponse> getTopProductsByYear(Integer year) {
        return orderDetailRepository.getTopProductsByYear(year).stream()
                .map(this::mapToTopProductResponse)
                .toList();
    }
    
    private TopProductResponse mapToTopProductResponse(iuh.fit.ecommerce.dtos.projection.TopProductProjection projection) {
        return TopProductResponse.builder()
                .productId(projection.getProductId())
                .productName(projection.getProductName())
                .productImage(projection.getProductImage())
                .totalQuantitySold(projection.getTotalQuantitySold())
                .totalRevenue(projection.getTotalRevenue())
                .build();
    }
}
