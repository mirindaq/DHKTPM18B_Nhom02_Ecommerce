package iuh.fit.ecommerce.controllers;

import iuh.fit.ecommerce.dtos.response.base.ResponseSuccess;
import iuh.fit.ecommerce.dtos.response.dashboard.RevenueByDayResponse;
import iuh.fit.ecommerce.dtos.response.dashboard.RevenueByMonthResponse;
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
    
    /**
     * Lấy doanh thu theo từng tháng trong năm
     * @param year Năm cần xem (mặc định: năm hiện tại)
     */
    @GetMapping("/revenue-by-month")
    public ResponseEntity<ResponseSuccess<List<RevenueByMonthResponse>>> getRevenueByMonth(
            @RequestParam(required = false) Integer year) {
        
        if (year == null) {
            year = LocalDate.now().getYear();
        }
        
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get revenue by month success",
                dashboardService.getRevenueByMonth(year)));
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
}
