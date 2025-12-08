package iuh.fit.ecommerce.controllers;

import iuh.fit.ecommerce.dtos.response.base.ResponseSuccess;
import iuh.fit.ecommerce.services.OverviewService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

import static org.springframework.http.HttpStatus.OK;

@RestController
@RequestMapping("${api.prefix}/statistics")
@RequiredArgsConstructor
@Tag(name = "Statistics Controller", description = "Dashboard analytics")
public class OverviewController {

    private final OverviewService overviewService;

    @GetMapping("/dashboard")
    public ResponseEntity<ResponseSuccess<Object>> getDashboardStats() {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get dashboard statistics success",
                overviewService.getDashboardStats()
        ));
    }

    @GetMapping("/monthly-revenue")
    public ResponseEntity<ResponseSuccess<List<Map<String, Object>>>> getMonthlyRevenue() {
        return ResponseEntity.ok(new ResponseSuccess<>(
                OK,
                "Get monthly revenue success",
                overviewService.getMonthlyRevenue()
        ));
    }
}