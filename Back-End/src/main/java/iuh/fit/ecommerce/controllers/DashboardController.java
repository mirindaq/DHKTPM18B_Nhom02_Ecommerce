package iuh.fit.ecommerce.controllers;

import iuh.fit.ecommerce.dtos.response.base.ResponseSuccess;
import iuh.fit.ecommerce.dtos.response.dashboard.*;
import iuh.fit.ecommerce.services.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

import static org.springframework.http.HttpStatus.OK;

@RestController
@RequestMapping("${api.prefix}/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class DashboardController {
    
    private final DashboardService dashboardService;
    private final iuh.fit.ecommerce.services.excel.DashboardExcelService dashboardExcelService;
    
    /**
     * Lấy doanh thu theo từng tháng trong năm
     * @param year Năm cần xem (mặc định: năm hiện tại)
     * @param month Tháng cụ thể (optional, null = tất cả 12 tháng)
     */
    @GetMapping("/revenue-by-month")
    public ResponseEntity<ResponseSuccess<List<RevenueByMonthResponse>>> getRevenueByMonth(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        
        if (year == null) {
            year = LocalDate.now().getYear();
        }
        
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get revenue by month success",
                dashboardService.getRevenueByMonth(year, month)));
    }
    
    /**
     * Doanh thu theo ngày (cho biểu đồ line chart)
     * @param startDate Ngày bắt đầu
     * @param endDate Ngày kết thúc
     */
    @GetMapping("/revenue-by-day")
    public ResponseEntity<ResponseSuccess<List<RevenueByDayResponse>>> getRevenueByDay(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        if (startDate == null) {
            startDate = LocalDate.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get revenue by day success",
                dashboardService.getRevenueByDay(startDate, endDate)));
    }
    
    /**
     * Doanh thu theo năm
     * @param year Năm cụ thể (optional, null = tất cả các năm)
     */
    @GetMapping("/revenue-by-year")
    public ResponseEntity<ResponseSuccess<List<RevenueByYearResponse>>> getRevenueByYear(
            @RequestParam(required = false) Integer year) {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get revenue by year success",
                dashboardService.getRevenueByYear(year)));
    }
    
    /**
     * Top 5 sản phẩm bán chạy theo ngày
     * @param startDate Ngày bắt đầu
     * @param endDate Ngày kết thúc
     */
    @GetMapping("/top-products-by-day")
    public ResponseEntity<ResponseSuccess<List<TopProductResponse>>> getTopProductsByDay(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        if (startDate == null) {
            startDate = LocalDate.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get top products by day success",
                dashboardService.getTopProductsByDay(startDate, endDate)));
    }
    
    /**
     * Top 5 sản phẩm bán chạy theo tháng
     * @param year Năm
     * @param month Tháng
     */
    @GetMapping("/top-products-by-month")
    public ResponseEntity<ResponseSuccess<List<TopProductResponse>>> getTopProductsByMonth(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        
        if (year == null) {
            year = LocalDate.now().getYear();
        }
        if (month == null) {
            month = LocalDate.now().getMonthValue();
        }
        
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get top products by month success",
                dashboardService.getTopProductsByMonth(year, month)));
    }
    
    /**
     * Top 5 sản phẩm bán chạy theo năm
     * @param year Năm
     */
    @GetMapping("/top-products-by-year")
    public ResponseEntity<ResponseSuccess<List<TopProductResponse>>> getTopProductsByYear(
            @RequestParam(required = false) Integer year) {
        
        if (year == null) {
            year = LocalDate.now().getYear();
        }
        
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get top products by year success",
                dashboardService.getTopProductsByYear(year)));
    }
    
    /**
     * So sánh doanh thu giữa 2 kỳ
     * @param timeType Loại thời gian: day, month, year
     * @param startDate1 Ngày bắt đầu kỳ 1
     * @param endDate1 Ngày kết thúc kỳ 1
     * @param startDate2 Ngày bắt đầu kỳ 2
     * @param endDate2 Ngày kết thúc kỳ 2
     */
    @GetMapping("/compare-revenue")
    public ResponseEntity<ResponseSuccess<ComparisonResponse>> compareRevenue(
            @RequestParam String timeType,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate1,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate1,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate2,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate2) {
        
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Compare revenue success",
                dashboardService.compareRevenue(timeType, startDate1, endDate1, startDate2, endDate2)));
    }
    
    /**
     * Top 5 voucher được sử dụng nhiều nhất theo ngày
     * @param startDate Ngày bắt đầu
     * @param endDate Ngày kết thúc
     */
    @GetMapping("/top-vouchers-by-day")
    public ResponseEntity<ResponseSuccess<List<TopVoucherResponse>>> getTopVouchersByDay(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        if (startDate == null) {
            startDate = LocalDate.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get top vouchers by day success",
                dashboardService.getTopVouchersByDay(startDate, endDate)));
    }
    
    /**
     * Top 5 voucher được sử dụng nhiều nhất theo tháng
     * @param year Năm
     * @param month Tháng
     */
    @GetMapping("/top-vouchers-by-month")
    public ResponseEntity<ResponseSuccess<List<TopVoucherResponse>>> getTopVouchersByMonth(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        
        if (year == null) {
            year = LocalDate.now().getYear();
        }
        if (month == null) {
            month = LocalDate.now().getMonthValue();
        }
        
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get top vouchers by month success",
                dashboardService.getTopVouchersByMonth(year, month)));
    }
    
    /**
     * Top 5 voucher được sử dụng nhiều nhất theo năm
     * @param year Năm
     */
    @GetMapping("/top-vouchers-by-year")
    public ResponseEntity<ResponseSuccess<List<TopVoucherResponse>>> getTopVouchersByYear(
            @RequestParam(required = false) Integer year) {
        
        if (year == null) {
            year = LocalDate.now().getYear();
        }
        
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get top vouchers by year success",
                dashboardService.getTopVouchersByYear(year)));
    }
    
    /**
     * Top 5 promotion được sử dụng nhiều nhất theo ngày
     * @param startDate Ngày bắt đầu
     * @param endDate Ngày kết thúc
     */
    @GetMapping("/top-promotions-by-day")
    public ResponseEntity<ResponseSuccess<List<TopPromotionResponse>>> getTopPromotionsByDay(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        if (startDate == null) {
            startDate = LocalDate.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get top promotions by day success",
                dashboardService.getTopPromotionsByDay(startDate, endDate)));
    }
    
    /**
     * Top 5 promotion được sử dụng nhiều nhất theo tháng
     * @param year Năm
     * @param month Tháng
     */
    @GetMapping("/top-promotions-by-month")
    public ResponseEntity<ResponseSuccess<List<TopPromotionResponse>>> getTopPromotionsByMonth(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        
        if (year == null) {
            year = LocalDate.now().getYear();
        }
        if (month == null) {
            month = LocalDate.now().getMonthValue();
        }
        
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get top promotions by month success",
                dashboardService.getTopPromotionsByMonth(year, month)));
    }
    
    /**
     * Top 5 promotion được sử dụng nhiều nhất theo năm
     * @param year Năm
     */
    @GetMapping("/top-promotions-by-year")
    public ResponseEntity<ResponseSuccess<List<TopPromotionResponse>>> getTopPromotionsByYear(
            @RequestParam(required = false) Integer year) {
        
        if (year == null) {
            year = LocalDate.now().getYear();
        }
        
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get top promotions by year success",
                dashboardService.getTopPromotionsByYear(year)));
    }
    
    /**
     * So sánh voucher giữa 2 kỳ
     * @param timeType Loại thời gian: day, month, year
     * @param startDate1 Ngày bắt đầu kỳ 1
     * @param endDate1 Ngày kết thúc kỳ 1
     * @param startDate2 Ngày bắt đầu kỳ 2
     * @param endDate2 Ngày kết thúc kỳ 2
     */
    @GetMapping("/compare-voucher")
    public ResponseEntity<ResponseSuccess<VoucherComparisonResponse>> compareVoucher(
            @RequestParam String timeType,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate1,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate1,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate2,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate2) {
        
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Compare voucher success",
                dashboardService.compareVoucher(timeType, startDate1, endDate1, startDate2, endDate2)));
    }
    
    /**
     * So sánh promotion giữa 2 kỳ
     * @param timeType Loại thời gian: day, month, year
     * @param startDate1 Ngày bắt đầu kỳ 1
     * @param endDate1 Ngày kết thúc kỳ 1
     * @param startDate2 Ngày bắt đầu kỳ 2
     * @param endDate2 Ngày kết thúc kỳ 2
     */
    @GetMapping("/compare-promotion")
    public ResponseEntity<ResponseSuccess<PromotionComparisonResponse>> comparePromotion(
            @RequestParam String timeType,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate1,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate1,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate2,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate2) {
        
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Compare promotion success",
                dashboardService.comparePromotion(timeType, startDate1, endDate1, startDate2, endDate2)));
    }
    
    /**
     * So sánh tổng hợp voucher vs promotion giữa 2 kỳ
     * @param timeType Loại thời gian: day, month, year
     * @param startDate1 Ngày bắt đầu kỳ 1
     * @param endDate1 Ngày kết thúc kỳ 1
     * @param startDate2 Ngày bắt đầu kỳ 2
     * @param endDate2 Ngày kết thúc kỳ 2
     */
    @GetMapping("/compare-voucher-promotion")
    public ResponseEntity<ResponseSuccess<VoucherPromotionComparisonResponse>> compareVoucherPromotion(
            @RequestParam String timeType,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate1,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate1,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate2,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate2) {
        
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Compare voucher vs promotion success",
                dashboardService.compareVoucherPromotion(timeType, startDate1, endDate1, startDate2, endDate2)));
    }
    
    /**
     * Thống kê tổng quan dashboard
     * @param startDate Ngày bắt đầu
     * @param endDate Ngày kết thúc
     */
    @GetMapping("/stats")
    public ResponseEntity<ResponseSuccess<DashboardStatsResponse>> getDashboardStats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        if (startDate == null) {
            startDate = LocalDate.now().withDayOfMonth(1); // Đầu tháng
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get dashboard stats success",
                dashboardService.getDashboardStats(startDate, endDate)));
    }
    
    /**
     * Export dashboard to Excel (5 sheets: Summary, Revenue, Voucher, Promotion, Products)
     * @param timeType Loại thời gian: day (mặc định), month, year
     * @param startDate Ngày bắt đầu (cho day)
     * @param endDate Ngày kết thúc (cho day)
     * @param year Năm (cho month và year)
     * @param month Tháng (cho month, optional)
     */
    @GetMapping("/export-excel")
    public ResponseEntity<org.springframework.core.io.Resource> exportDashboardExcel(
            @RequestParam(required = false, defaultValue = "day") String timeType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        
        try {
            LocalDate start;
            LocalDate end;
            String filename;
            
            switch (timeType.toLowerCase()) {
                case "month":
                    // Export theo tháng
                    if (year == null) year = LocalDate.now().getYear();
                    if (month == null) month = LocalDate.now().getMonthValue();
                    
                    start = LocalDate.of(year, month, 1);
                    end = start.withDayOfMonth(start.lengthOfMonth());
                    filename = String.format("Dashboard_Report_%d_Thang_%d.xlsx", year, month);
                    break;
                    
                case "year":
                    // Export theo năm
                    if (year == null) year = LocalDate.now().getYear();
                    
                    start = LocalDate.of(year, 1, 1);
                    end = LocalDate.of(year, 12, 31);
                    filename = String.format("Dashboard_Report_Nam_%d.xlsx", year);
                    break;
                    
                default: // "day"
                    // Export theo khoảng ngày
                    if (startDate == null) {
                        startDate = LocalDate.now().minusDays(30);
                    }
                    if (endDate == null) {
                        endDate = LocalDate.now();
                    }
                    start = startDate;
                    end = endDate;
                    filename = String.format("Dashboard_Report_%s_to_%s.xlsx", 
                            start.toString(), end.toString());
                    break;
            }
            
            byte[] excelData = dashboardExcelService.exportDashboard(start, end);
            
            org.springframework.core.io.ByteArrayResource resource = 
                    new org.springframework.core.io.ByteArrayResource(excelData);
            
            return ResponseEntity.ok()
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, 
                            "attachment; filename=\"" + filename + "\"")
                    .contentType(org.springframework.http.MediaType.parseMediaType(
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(resource);
                    
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
