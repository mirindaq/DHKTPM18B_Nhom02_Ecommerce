package iuh.fit.ecommerce.services.impl;

import iuh.fit.ecommerce.dtos.projection.TopProductProjection;
import iuh.fit.ecommerce.dtos.projection.TopPromotionProjection;
import iuh.fit.ecommerce.dtos.projection.TopVoucherProjection;
import iuh.fit.ecommerce.dtos.response.dashboard.*;
import iuh.fit.ecommerce.entities.OrderDetail;
import iuh.fit.ecommerce.entities.PromotionUsage;
import iuh.fit.ecommerce.repositories.OrderDetailRepository;
import iuh.fit.ecommerce.repositories.OrderRepository;
import iuh.fit.ecommerce.repositories.PromotionUsageRepository;
import iuh.fit.ecommerce.repositories.VoucherUsageHistoryRepository;
import iuh.fit.ecommerce.services.DashboardService;
import iuh.fit.ecommerce.services.ProductService;
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
    private final VoucherUsageHistoryRepository voucherUsageHistoryRepository;
    private final PromotionUsageRepository promotionUsageRepository;
    private final ProductService productService;

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
    
    private TopProductResponse mapToTopProductResponse(TopProductProjection projection) {
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

    @Override
    public List<TopVoucherResponse> getTopVouchersByDay(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);
        
        return voucherUsageHistoryRepository.getTopVouchersByDay(start, end).stream()
                .map(this::mapToTopVoucherResponse)
                .toList();
    }

    @Override
    public List<TopVoucherResponse> getTopVouchersByMonth(Integer year, Integer month) {
        return voucherUsageHistoryRepository.getTopVouchersByMonth(year, month).stream()
                .map(this::mapToTopVoucherResponse)
                .toList();
    }

    @Override
    public List<TopVoucherResponse> getTopVouchersByYear(Integer year) {
        return voucherUsageHistoryRepository.getTopVouchersByYear(year).stream()
                .map(this::mapToTopVoucherResponse)
                .toList();
    }
    
    private TopVoucherResponse mapToTopVoucherResponse(TopVoucherProjection projection) {
        return TopVoucherResponse.builder()
                .voucherId(projection.getVoucherId())
                .voucherCode(projection.getVoucherCode())
                .voucherName(projection.getVoucherName())
                .usageCount(projection.getUsageCount())
                .totalDiscountAmount(projection.getTotalDiscountAmount())
                .build();
    }

    @Override
    public List<TopPromotionResponse> getTopPromotionsByDay(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);
        
        log.info("Getting top promotions by day from {} to {}", start, end);
        var projections = promotionUsageRepository.getTopPromotionsByDay(start, end);
        log.info("Found {} promotion projections", projections.size());
        
        return projections.stream()
                .map(this::mapToTopPromotionResponse)
                .toList();
    }

    @Override
    public List<TopPromotionResponse> getTopPromotionsByMonth(Integer year, Integer month) {
        log.info("Getting top promotions by month: {}/{}", month, year);
        var projections = promotionUsageRepository.getTopPromotionsByMonth(year, month);
        log.info("Found {} promotion projections", projections.size());
        
        return projections.stream()
                .map(this::mapToTopPromotionResponse)
                .toList();
    }

    @Override
    public List<TopPromotionResponse> getTopPromotionsByYear(Integer year) {
        log.info("Getting top promotions by year: {}", year);
        var projections = promotionUsageRepository.getTopPromotionsByYear(year);
        log.info("Found {} promotion projections", projections.size());
        
        return projections.stream()
                .map(this::mapToTopPromotionResponse)
                .toList();
    }
    
    private TopPromotionResponse mapToTopPromotionResponse(TopPromotionProjection projection) {
        return TopPromotionResponse.builder()
                .promotionId(projection.getPromotionId())
                .promotionName(projection.getPromotionName())
                .promotionType(projection.getPromotionType())
                .usageCount(projection.getUsageCount())
                .totalDiscountAmount(projection.getTotalDiscountAmount())
                .build();
    }

    @Override
    public VoucherComparisonResponse compareVoucher(
            String timeType,
            LocalDate startDate1, LocalDate endDate1,
            LocalDate startDate2, LocalDate endDate2) {
        
        LocalDateTime start1 = startDate1.atStartOfDay();
        LocalDateTime end1 = endDate1.atTime(23, 59, 59);
        LocalDateTime start2 = startDate2.atStartOfDay();
        LocalDateTime end2 = endDate2.atTime(23, 59, 59);
        
        log.info("Comparing voucher: Period1({} to {}) vs Period2({} to {})", 
                 start1, end1, start2, end2);
        
        // Lấy dữ liệu kỳ 1
        Long count1 = voucherUsageHistoryRepository.countVoucherUsageByDateRange(start1, end1);
        Double discount1 = voucherUsageHistoryRepository.sumVoucherDiscountByDateRange(start1, end1);
        
        // Lấy dữ liệu kỳ 2
        Long count2 = voucherUsageHistoryRepository.countVoucherUsageByDateRange(start2, end2);
        Double discount2 = voucherUsageHistoryRepository.sumVoucherDiscountByDateRange(start2, end2);
        
        // Xử lý null
        count1 = count1 != null ? count1 : 0L;
        count2 = count2 != null ? count2 : 0L;
        discount1 = discount1 != null ? discount1 : 0.0;
        discount2 = discount2 != null ? discount2 : 0.0;
        
        // Tính chênh lệch
        Long countDiff = count1 - count2;
        Double discountDiff = discount1 - discount2;
        Double countGrowth = count2 > 0 ? ((double) countDiff / count2) * 100 : 0.0;
        Double discountGrowth = discount2 > 0 ? (discountDiff / discount2) * 100 : 0.0;
        
        // Format label
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        String label1 = formatPeriodLabel(timeType, startDate1, endDate1, formatter);
        String label2 = formatPeriodLabel(timeType, startDate2, endDate2, formatter);
        
        return VoucherComparisonResponse.builder()
                .period1Label(label1)
                .period2Label(label2)
                .usageCount1(count1)
                .usageCount2(count2)
                .totalDiscount1(discount1)
                .totalDiscount2(discount2)
                .usageDifference(countDiff)
                .usageGrowthPercent(countGrowth)
                .discountDifference(discountDiff)
                .discountGrowthPercent(discountGrowth)
                .build();
    }

    @Override
    public PromotionComparisonResponse comparePromotion(
            String timeType,
            LocalDate startDate1, LocalDate endDate1,
            LocalDate startDate2, LocalDate endDate2) {
        
        LocalDateTime start1 = startDate1.atStartOfDay();
        LocalDateTime end1 = endDate1.atTime(23, 59, 59);
        LocalDateTime start2 = startDate2.atStartOfDay();
        LocalDateTime end2 = endDate2.atTime(23, 59, 59);
        
        log.info("Comparing promotion: Period1({} to {}) vs Period2({} to {})", 
                 start1, end1, start2, end2);
        
        // Lấy dữ liệu kỳ 1
        Long count1 = promotionUsageRepository.countPromotionUsageByDateRange(start1, end1);
        Double discount1 = promotionUsageRepository.sumPromotionDiscountByDateRange(start1, end1);
        
        // Lấy dữ liệu kỳ 2
        Long count2 = promotionUsageRepository.countPromotionUsageByDateRange(start2, end2);
        Double discount2 = promotionUsageRepository.sumPromotionDiscountByDateRange(start2, end2);
        
        // Xử lý null
        count1 = count1 != null ? count1 : 0L;
        count2 = count2 != null ? count2 : 0L;
        discount1 = discount1 != null ? discount1 : 0.0;
        discount2 = discount2 != null ? discount2 : 0.0;
        
        // Tính chênh lệch
        Long countDiff = count1 - count2;
        Double discountDiff = discount1 - discount2;
        Double countGrowth = count2 > 0 ? ((double) countDiff / count2) * 100 : 0.0;
        Double discountGrowth = discount2 > 0 ? (discountDiff / discount2) * 100 : 0.0;
        
        // Format label
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        String label1 = formatPeriodLabel(timeType, startDate1, endDate1, formatter);
        String label2 = formatPeriodLabel(timeType, startDate2, endDate2, formatter);
        
        return PromotionComparisonResponse.builder()
                .period1Label(label1)
                .period2Label(label2)
                .usageCount1(count1)
                .usageCount2(count2)
                .totalDiscount1(discount1)
                .totalDiscount2(discount2)
                .usageDifference(countDiff)
                .usageGrowthPercent(countGrowth)
                .discountDifference(discountDiff)
                .discountGrowthPercent(discountGrowth)
                .build();
    }

    @Override
    public VoucherPromotionComparisonResponse compareVoucherPromotion(
            String timeType,
            LocalDate startDate1, LocalDate endDate1,
            LocalDate startDate2, LocalDate endDate2) {
        
        LocalDateTime start1 = startDate1.atStartOfDay();
        LocalDateTime end1 = endDate1.atTime(23, 59, 59);
        LocalDateTime start2 = startDate2.atStartOfDay();
        LocalDateTime end2 = endDate2.atTime(23, 59, 59);
        
        log.info("Comparing voucher vs promotion: Period1({} to {}) vs Period2({} to {})", 
                 start1, end1, start2, end2);
        
        // Lấy dữ liệu voucher kỳ 1
        Long voucherCount1 = voucherUsageHistoryRepository.countVoucherUsageByDateRange(start1, end1);
        Double voucherDiscount1 = voucherUsageHistoryRepository.sumVoucherDiscountByDateRange(start1, end1);
        
        // Lấy dữ liệu voucher kỳ 2
        Long voucherCount2 = voucherUsageHistoryRepository.countVoucherUsageByDateRange(start2, end2);
        Double voucherDiscount2 = voucherUsageHistoryRepository.sumVoucherDiscountByDateRange(start2, end2);
        
        // Lấy dữ liệu promotion kỳ 1
        Long promotionCount1 = promotionUsageRepository.countPromotionUsageByDateRange(start1, end1);
        Double promotionDiscount1 = promotionUsageRepository.sumPromotionDiscountByDateRange(start1, end1);
        
        // Lấy dữ liệu promotion kỳ 2
        Long promotionCount2 = promotionUsageRepository.countPromotionUsageByDateRange(start2, end2);
        Double promotionDiscount2 = promotionUsageRepository.sumPromotionDiscountByDateRange(start2, end2);
        
        // Xử lý null
        voucherCount1 = voucherCount1 != null ? voucherCount1 : 0L;
        voucherCount2 = voucherCount2 != null ? voucherCount2 : 0L;
        voucherDiscount1 = voucherDiscount1 != null ? voucherDiscount1 : 0.0;
        voucherDiscount2 = voucherDiscount2 != null ? voucherDiscount2 : 0.0;
        
        promotionCount1 = promotionCount1 != null ? promotionCount1 : 0L;
        promotionCount2 = promotionCount2 != null ? promotionCount2 : 0L;
        promotionDiscount1 = promotionDiscount1 != null ? promotionDiscount1 : 0.0;
        promotionDiscount2 = promotionDiscount2 != null ? promotionDiscount2 : 0.0;
        
        // Tính chênh lệch voucher
        Long voucherCountDiff = voucherCount1 - voucherCount2;
        Double voucherDiscountDiff = voucherDiscount1 - voucherDiscount2;
        Double voucherCountGrowth = voucherCount2 > 0 ? ((double) voucherCountDiff / voucherCount2) * 100 : 0.0;
        Double voucherDiscountGrowth = voucherDiscount2 > 0 ? (voucherDiscountDiff / voucherDiscount2) * 100 : 0.0;
        
        // Tính chênh lệch promotion
        Long promotionCountDiff = promotionCount1 - promotionCount2;
        Double promotionDiscountDiff = promotionDiscount1 - promotionDiscount2;
        Double promotionCountGrowth = promotionCount2 > 0 ? ((double) promotionCountDiff / promotionCount2) * 100 : 0.0;
        Double promotionDiscountGrowth = promotionDiscount2 > 0 ? (promotionDiscountDiff / promotionDiscount2) * 100 : 0.0;
        
        // Tính tổng
        Double totalDiscount1 = voucherDiscount1 + promotionDiscount1;
        Double totalDiscount2 = voucherDiscount2 + promotionDiscount2;
        Double totalDiscountDiff = totalDiscount1 - totalDiscount2;
        Double totalDiscountGrowth = totalDiscount2 > 0 ? (totalDiscountDiff / totalDiscount2) * 100 : 0.0;
        
        // Format label
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        String label1 = formatPeriodLabel(timeType, startDate1, endDate1, formatter);
        String label2 = formatPeriodLabel(timeType, startDate2, endDate2, formatter);
        
        return VoucherPromotionComparisonResponse.builder()
                .period1Label(label1)
                .period2Label(label2)
                // Voucher stats
                .voucherUsageCount1(voucherCount1)
                .voucherUsageCount2(voucherCount2)
                .voucherTotalDiscount1(voucherDiscount1)
                .voucherTotalDiscount2(voucherDiscount2)
                .voucherUsageDifference(voucherCountDiff)
                .voucherUsageGrowthPercent(voucherCountGrowth)
                .voucherDiscountDifference(voucherDiscountDiff)
                .voucherDiscountGrowthPercent(voucherDiscountGrowth)
                // Promotion stats
                .promotionUsageCount1(promotionCount1)
                .promotionUsageCount2(promotionCount2)
                .promotionTotalDiscount1(promotionDiscount1)
                .promotionTotalDiscount2(promotionDiscount2)
                .promotionUsageDifference(promotionCountDiff)
                .promotionUsageGrowthPercent(promotionCountGrowth)
                .promotionDiscountDifference(promotionDiscountDiff)
                .promotionDiscountGrowthPercent(promotionDiscountGrowth)
                // Combined stats
                .totalDiscount1(totalDiscount1)
                .totalDiscount2(totalDiscount2)
                .totalDiscountDifference(totalDiscountDiff)
                .totalDiscountGrowthPercent(totalDiscountGrowth)
                .build();
    }
    
    @Override
    public DashboardStatsResponse getDashboardStats(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);
        
        // Tính toán kỳ trước (cùng độ dài thời gian)
        long daysBetween = java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate) + 1;
        LocalDate prevStartDate = startDate.minusDays(daysBetween);
        LocalDate prevEndDate = startDate.minusDays(1);
        LocalDateTime prevStart = prevStartDate.atStartOfDay();
        LocalDateTime prevEnd = prevEndDate.atTime(23, 59, 59);
        
        // Lấy dữ liệu kỳ hiện tại
        Double currentRevenue = orderRepository.sumRevenueByDateRange(start, end);
        Long currentOrders = orderRepository.countByDateRange(start, end);
        
        // Lấy dữ liệu kỳ trước
        Double prevRevenue = orderRepository.sumRevenueByDateRange(prevStart, prevEnd);
        Long prevOrders = orderRepository.countByDateRange(prevStart, prevEnd);
        
        // Tính % tăng trưởng
        double prevRev = prevRevenue != null ? prevRevenue : 0.0;
        double currRev = currentRevenue != null ? currentRevenue : 0.0;
        Double revenueGrowth = prevRev > 0 ? ((currRev - prevRev) / prevRev) * 100 : 0.0;
        
        double prevOrd = prevOrders != null ? prevOrders.doubleValue() : 0.0;
        double currOrd = currentOrders != null ? currentOrders.doubleValue() : 0.0;
        Double ordersGrowth = prevOrd > 0 ? ((currOrd - prevOrd) / prevOrd) * 100 : 0.0;
        
        // Đếm tổng sản phẩm và khách hàng (không phụ thuộc thời gian)
        Long totalProducts = orderDetailRepository.count(); // Hoặc productRepository.count() nếu có
        Long totalCustomers = orderRepository.count(); // Tạm thời dùng count orders, nên dùng customerRepository
        
        return DashboardStatsResponse.builder()
                .totalRevenue(currentRevenue != null ? currentRevenue : 0.0)
                .totalOrders(currentOrders != null ? currentOrders : 0L)
                .totalProducts(totalProducts)
                .totalCustomers(totalCustomers)
                .revenueGrowth(revenueGrowth)
                .ordersGrowth(ordersGrowth)
                .productsGrowth(0.0) // Tạm thời set 0, cần logic riêng
                .customersGrowth(0.0) // Tạm thời set 0, cần logic riêng
                .build();
    }

    @Override
    public VoucherDetailResponse getVoucherDetail(Long voucherId, LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);
        
        // Lấy danh sách usage history của voucher trong khoảng thời gian
        List<iuh.fit.ecommerce.entities.VoucherUsageHistory> usageHistories = 
                voucherUsageHistoryRepository.findByVoucherIdAndDateRange(voucherId, start, end);
        
        if (usageHistories.isEmpty()) {
            // Nếu không có usage, vẫn trả về thông tin voucher
            var voucher = voucherUsageHistoryRepository.findFirstByVoucherId(voucherId)
                    .map(iuh.fit.ecommerce.entities.VoucherUsageHistory::getVoucher)
                    .orElseThrow(() -> new RuntimeException("Voucher not found"));
            
            return VoucherDetailResponse.builder()
                    .voucherId(voucherId)
                    .voucherCode(voucher.getCode())
                    .voucherName(voucher.getName())
                    .totalUsage(0L)
                    .totalDiscountAmount(0.0)
                    .orders(List.of())
                    .build();
        }
        
        // Lấy thông tin voucher từ usage history đầu tiên
        var voucher = usageHistories.get(0).getVoucher();
        
        // Map sang response
        List<VoucherOrderDetailResponse> orders = usageHistories.stream()
                .map(usage -> {
                    var order = usage.getOrder();
                    return VoucherOrderDetailResponse.builder()
                            .orderId(order.getId())
                            .orderCode("ORD-" + order.getId()) // Tạo order code
                            .orderDate(order.getOrderDate())
                            .customerName(order.getCustomer().getFullName())
                            .orderTotal(order.getTotalPrice())
                            .discountAmount(usage.getDiscountAmount())
                            .build();
                })
                .toList();
        
        // Tính tổng
        Long totalUsage = (long) orders.size();
        Double totalDiscount = orders.stream()
                .mapToDouble(VoucherOrderDetailResponse::getDiscountAmount)
                .sum();
        
        return VoucherDetailResponse.builder()
                .voucherId(voucherId)
                .voucherCode(voucher.getCode())
                .voucherName(voucher.getName())
                .totalUsage(totalUsage)
                .totalDiscountAmount(totalDiscount)
                .orders(orders)
                .build();
    }

    @Override
    public List<TopVoucherResponse> getAllVouchersByDay(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);
        
        return voucherUsageHistoryRepository.getAllVouchersByDay(start, end).stream()
                .map(this::mapToTopVoucherResponse)
                .toList();
    }

    @Override
    public List<TopVoucherResponse> getAllVouchersByMonth(Integer year, Integer month) {
        return voucherUsageHistoryRepository.getAllVouchersByMonth(year, month).stream()
                .map(this::mapToTopVoucherResponse)
                .toList();
    }

    @Override
    public List<TopVoucherResponse> getAllVouchersByYear(Integer year) {
        return voucherUsageHistoryRepository.getAllVouchersByYear(year).stream()
                .map(this::mapToTopVoucherResponse)
                .toList();
    }

    @Override
    public List<TopPromotionResponse> getAllPromotionsByDay(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);
        
        log.info("Getting all promotions by day from {} to {}", start, end);
        var projections = promotionUsageRepository.getAllPromotionsByDay(start, end);
        log.info("Found {} promotion projections", projections.size());
        
        return projections.stream()
                .map(this::mapToTopPromotionResponse)
                .toList();
    }

    @Override
    public List<TopPromotionResponse> getAllPromotionsByMonth(Integer year, Integer month) {
        log.info("Getting all promotions by month: {}/{}", month, year);
        var projections = promotionUsageRepository.getAllPromotionsByMonth(year, month);
        log.info("Found {} promotion projections", projections.size());
        
        return projections.stream()
                .map(this::mapToTopPromotionResponse)
                .toList();
    }

    @Override
    public List<TopPromotionResponse> getAllPromotionsByYear(Integer year) {
        log.info("Getting all promotions by year: {}", year);
        var projections = promotionUsageRepository.getAllPromotionsByYear(year);
        log.info("Found {} promotion projections", projections.size());
        
        return projections.stream()
                .map(this::mapToTopPromotionResponse)
                .toList();
    }

    @Override
    public PromotionDetailResponse getPromotionDetail(Long promotionId, LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);
        
        log.info("Getting promotion detail for promotionId: {} from {} to {}", promotionId, start, end);
        
        // Lấy danh sách usage của promotion trong khoảng thời gian
        List<PromotionUsage> usages = 
                promotionUsageRepository.findByPromotionIdAndDateRange(promotionId, start, end);
        
        if (usages.isEmpty()) {
            // Nếu không có usage, vẫn trả về thông tin promotion
            var promotion = promotionUsageRepository.findFirstByPromotionId(promotionId)
                    .map(PromotionUsage::getPromotion)
                    .orElseThrow(() -> new RuntimeException("Promotion not found"));
            
            return PromotionDetailResponse.builder()
                    .promotionId(promotionId)
                    .promotionName(promotion.getName())
                    .promotionType(promotion.getPromotionType().name())
                    .totalUsage(0L)
                    .totalDiscountAmount(0.0)
                    .orders(List.of())
                    .build();
        }
        
        // Lấy thông tin promotion từ usage đầu tiên
        var promotion = usages.get(0).getPromotion();
        
        // Map sang response
        List<PromotionOrderDetailResponse> orders = usages.stream()
                .map(usage -> {
                    var orderDetail = usage.getOrderDetail();
                    var order = orderDetail.getOrder();
                    return PromotionOrderDetailResponse.builder()
                            .orderId(order.getId())
                            .orderDetailId(orderDetail.getId())
                            .orderCode("ORD-" + order.getId())
                            .orderDate(order.getOrderDate())
                            .customerName(order.getCustomer().getFullName())
                            .orderTotal(order.getTotalPrice())
                            .discountAmount(usage.getDiscountAmount())
                            .build();
                })
                .toList();
        
        // Tính tổng
        Long totalUsage = (long) orders.size();
        Double totalDiscount = orders.stream()
                .mapToDouble(PromotionOrderDetailResponse::getDiscountAmount)
                .sum();
        
        log.info("Found {} orders for promotion {}", totalUsage, promotionId);
        
        return PromotionDetailResponse.builder()
                .promotionId(promotionId)
                .promotionName(promotion.getName())
                .promotionType(promotion.getPromotionType().name())
                .totalUsage(totalUsage)
                .totalDiscountAmount(totalDiscount)
                .orders(orders)
                .build();
    }

    @Override
    public List<TopProductResponse> getAllProductsByDay(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);

        log.info("Getting all products by day from {} to {}", start, end);
        var projections = orderDetailRepository.getAllProductsByDay(start, end);
        log.info("Found {} product projections", projections.size());

        return projections.stream()
                .map(this::mapToTopProductResponse)
                .toList();
    }

    @Override
    public List<TopProductResponse> getAllProductsByMonth(Integer year, Integer month) {
        log.info("Getting all products by month: {}/{}", month, year);
        var projections = orderDetailRepository.getAllProductsByMonth(year, month);
        log.info("Found {} product projections", projections.size());

        return projections.stream()
                .map(this::mapToTopProductResponse)
                .toList();
    }

    @Override
    public List<TopProductResponse> getAllProductsByYear(Integer year) {
        log.info("Getting all products by year: {}", year);
        var projections = orderDetailRepository.getAllProductsByYear(year);
        log.info("Found {} product projections", projections.size());

        return projections.stream()
                .map(this::mapToTopProductResponse)
                .toList();
    }

    @Override
    public ProductDetailResponse getProductDetail(Long productId, LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);

        log.info("Getting product detail for productId: {} from {} to {}", productId, start, end);
        
        // Lấy danh sách order details của sản phẩm trong khoảng thời gian
        List<OrderDetail> orderDetails = 
                orderDetailRepository.findOrderDetailsByProductAndDateRange(productId, start, end);
        
        if (orderDetails.isEmpty()) {
            // Nếu không có order, vẫn trả về thông tin sản phẩm
            var product = productService.getProductById(productId);
            
            return ProductDetailResponse.builder()
                    .productId(productId)
                    .productName(product.getName())
                    .productImage(product.getThumbnail())
                    .totalQuantitySold(0L)
                    .totalRevenue(0.0)
                    .orders(List.of())
                    .build();
        }

        // Lấy thông tin sản phẩm từ order detail đầu tiên
        var product = orderDetails.get(0).getProductVariant().getProduct();

        // Map sang response
        List<ProductOrderDetailResponse> orders = orderDetails.stream()
                .map(od -> {
                    var order = od.getOrder();
                    return ProductOrderDetailResponse.builder()
                            .orderId(order.getId())
                            .orderCode("ORD-" + order.getId())
                            .orderDate(order.getOrderDate())
                            .customerName(order.getCustomer().getFullName())
                            .quantityOrdered(od.getQuantity())
                            .unitPrice(od.getPrice())
                            .totalPrice(od.getFinalPrice())
                            .build();
                })
                .toList();

        // Tính tổng
        Long totalQuantity = orders.stream()
                .mapToLong(ProductOrderDetailResponse::getQuantityOrdered)
                .sum();
        Double totalRevenue = orders.stream()
                .mapToDouble(ProductOrderDetailResponse::getTotalPrice)
                .sum();

        log.info("Found {} orders for product {}", orders.size(), productId);

        return ProductDetailResponse.builder()
                .productId(productId)
                .productName(product.getName())
                .productImage(product.getThumbnail())
                .totalQuantitySold(totalQuantity)
                .totalRevenue(totalRevenue)
                .orders(orders)
                .build();
    }

    @Override
    public List<OrderSummaryResponse> getOrdersByDateRange(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);

        log.info("Getting orders by date range from {} to {}", start, end);
        
        var orders = orderRepository.findByOrderDateBetweenAndStatus(
                start, 
                end, 
                iuh.fit.ecommerce.enums.OrderStatus.COMPLETED
        );
        
        log.info("Found {} orders", orders.size());

        return orders.stream()
                .map(order -> OrderSummaryResponse.builder()
                        .orderId(order.getId())
                        .orderCode("ORD-" + order.getId())
                        .orderDate(order.getOrderDate())
                        .customerName(order.getCustomer().getFullName())
                        .customerPhone(order.getCustomer().getPhone())
                        .totalPrice(order.getTotalPrice())
                        .finalTotalPrice(order.getFinalTotalPrice())
                        .paymentMethod(order.getPaymentMethod() != null ? order.getPaymentMethod().name() : "")
                        .status(order.getStatus() != null ? order.getStatus().name() : "")
                        .build())
                .toList();
    }

}
