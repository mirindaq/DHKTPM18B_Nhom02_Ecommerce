package iuh.fit.ecommerce.services;

import java.time.YearMonth;
import java.util.List;
import java.util.Map;

public interface OverviewService {
    Map<String, Object> getDashboardStats();

    Map<String, Object> compareStats(YearMonth current, YearMonth previous, String type);

    Double getValue(YearMonth month, String type);

    List<Map<String, Object>> getMonthlyRevenue();
}
