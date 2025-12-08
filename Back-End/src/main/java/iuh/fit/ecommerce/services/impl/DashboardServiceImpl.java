package iuh.fit.ecommerce.services.impl;

import iuh.fit.ecommerce.dtos.response.dashboard.*;
import iuh.fit.ecommerce.repositories.OrderDetailRepository;
import iuh.fit.ecommerce.repositories.OrderRepository;
import iuh.fit.ecommerce.services.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardServiceImpl implements DashboardService {
    
    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;

    @Override
    public List<RevenueByMonthResponse> getRevenueByMonth(Integer year, Integer month) {
        List<RevenueByMonthResponse> result = new ArrayList<>();
        
        // Nếu có month cụ thể, chỉ lấy tháng đó
        if (month != null) {
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
        } else {
            // Nếu không có month, lấy tất cả 12 tháng
            for (int m = 1; m <= 12; m++) {
                YearMonth yearMonth = YearMonth.of(year, m);
                LocalDate startDate = yearMonth.atDay(1);
                LocalDate endDate = yearMonth.atEndOfMonth();
                
                LocalDateTime start = startDate.atStartOfDay();
                LocalDateTime end = endDate.atTime(23, 59, 59);
                
                Double revenue = orderRepository.sumRevenueByDateRange(start, end);
                Long orderCount = orderRepository.countByDateRange(start, end);
                
                result.add(RevenueByMonthResponse.builder()
                        .month(m)
                        .year(year)
                        .revenue(revenue != null ? revenue : 0.0)
                        .orderCount(orderCount)
                        .build());
            }
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

    @Override
    public ComparisonResponse compareRevenue(
            String timeType,
            LocalDate startDate1, LocalDate endDate1,
            LocalDate startDate2, LocalDate endDate2) {
        
        LocalDateTime start1 = startDate1.atStartOfDay();
        LocalDateTime end1 = endDate1.atTime(23, 59, 59);
        LocalDateTime start2 = startDate2.atStartOfDay();
        LocalDateTime end2 = endDate2.atTime(23, 59, 59);
        
        // Lấy dữ liệu kỳ 1
        Double revenue1 = orderRepository.sumRevenueByDateRange(start1, end1);
        Long orderCount1 = orderRepository.countByDateRange(start1, end1);
        
        // Lấy dữ liệu kỳ 2
        Double revenue2 = orderRepository.sumRevenueByDateRange(start2, end2);
        Long orderCount2 = orderRepository.countByDateRange(start2, end2);
        
        // Xử lý null
        revenue1 = revenue1 != null ? revenue1 : 0.0;
        revenue2 = revenue2 != null ? revenue2 : 0.0;
        orderCount1 = orderCount1 != null ? orderCount1 : 0L;
        orderCount2 = orderCount2 != null ? orderCount2 : 0L;
        
        // Tính chênh lệch
        Double revenueDiff = revenue1 - revenue2;
        Long orderDiff = orderCount1 - orderCount2;
        
        // Tính % tăng trưởng
        Double revenueGrowth = revenue2 > 0 ? (revenueDiff / revenue2) * 100 : 0.0;
        Double orderGrowth = orderCount2 > 0 ? ((double) orderDiff / orderCount2) * 100 : 0.0;
        
        // Format label
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        String label1 = formatPeriodLabel(timeType, startDate1, endDate1, formatter);
        String label2 = formatPeriodLabel(timeType, startDate2, endDate2, formatter);
        
        return ComparisonResponse.builder()
                .period1Label(label1)
                .period2Label(label2)
                .revenue1(revenue1)
                .revenue2(revenue2)
                .orderCount1(orderCount1)
                .orderCount2(orderCount2)
                .revenueDifference(revenueDiff)
                .revenueGrowthPercent(revenueGrowth)
                .orderDifference(orderDiff)
                .orderGrowthPercent(orderGrowth)
                .build();
    }
    
    private String formatPeriodLabel(String timeType, LocalDate start, LocalDate end, DateTimeFormatter formatter) {
        switch (timeType) {
            case "day":
                return start.format(formatter) + " - " + end.format(formatter);
            case "month":
                return "Tháng " + start.getMonthValue() + "/" + start.getYear();
            case "year":
                return "Năm " + start.getYear();
            default:
                return start.format(formatter) + " - " + end.format(formatter);
        }
    }
}
