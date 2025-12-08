package iuh.fit.ecommerce.services.impl;

import iuh.fit.ecommerce.repositories.CustomerRepository;
import iuh.fit.ecommerce.repositories.OrderRepository;
import iuh.fit.ecommerce.repositories.ProductRepository;
import iuh.fit.ecommerce.services.OverviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OverviewServiceImpl implements OverviewService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;

    public Map<String, Object> getDashboardStats() {
        YearMonth currentMonth = YearMonth.now();
        YearMonth previousMonth = currentMonth.minusMonths(1);

        Map<String, Object> response = new HashMap<>();

        response.put("revenue", compareStats(currentMonth, previousMonth, "revenue"));

        response.put("orders", compareStats(currentMonth, previousMonth, "orders"));

        response.put("products", compareStats(currentMonth, previousMonth, "products"));

        response.put("customers", compareStats(currentMonth, previousMonth, "customers"));

        return response;
    }

    public Map<String, Object> compareStats(YearMonth current, YearMonth previous, String type) {
        Double currentVal = getValue(current, type);
        Double previousVal = getValue(previous, type);

        double percentChange = 0.0;
        if (previousVal > 0) {
            percentChange = ((currentVal - previousVal) / previousVal) * 100;
        } else if (currentVal > 0) {
            percentChange = 100.0;
        }

        Map<String, Object> stat = new HashMap<>();
        stat.put("current", currentVal);
        stat.put("previous", previousVal);
        stat.put("percentChange", Math.round(percentChange * 10.0) / 10.0);
        stat.put("trend", percentChange >= 0 ? "up" : "down");

        return stat;
    }

    public Double getValue(YearMonth month, String type) {
        LocalDateTime start = month.atDay(1).atStartOfDay();
        LocalDateTime end = month.atEndOfMonth().atTime(23, 59, 59);

        switch (type) {
            case "revenue":
                Double revenue = orderRepository.sumRevenueByDateRange(start, end);
                return revenue != null ? revenue : 0.0;
            case "orders":
                return orderRepository.countCompletedOrdersByDateRange(start, end).doubleValue();
            case "products":
                return productRepository.countNewProductsByDateRange(start, end).doubleValue();
            case "customers":
                 return customerRepository.countNewCustomersByDateRange(start, end).doubleValue();
            default:
                return 0.0;
        }
    }

    @Override
    public List<Map<String, Object>> getMonthlyRevenue() {
        List<Map<String, Object>> result = new ArrayList<>();
        YearMonth currentMonth = YearMonth.now();

        for (int i = 11; i >= 0; i--) {
            YearMonth targetMonth = currentMonth.minusMonths(i);

            LocalDateTime start = targetMonth.atDay(1).atStartOfDay();
            LocalDateTime end = targetMonth.atEndOfMonth().atTime(23, 59, 59);

            Double revenue = orderRepository.sumRevenueByDateRange(start, end);
            if (revenue == null) revenue = 0.0;

            Map<String, Object> item = new HashMap<>();
            item.put("name", "Thg " + targetMonth.getMonthValue());
            item.put("revenue", revenue);
            result.add(item);
        }
        return result;
    }
}