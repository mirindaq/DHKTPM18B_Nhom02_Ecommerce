package iuh.fit.ecommerce.configurations;

import iuh.fit.ecommerce.repositories.ProvinceRepository;
import iuh.fit.ecommerce.repositories.WardRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer {

    private final ProvinceRepository provinceRepository;
    private final WardRepository wardRepository;
    private final DataSource dataSource;

    private static final int EXPECTED_PROVINCES_COUNT = 34;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void initProvinceData() {
        try {
            long provinceCount = provinceRepository.count();
            log.info("Current province count: {}", provinceCount);

            if (provinceCount != EXPECTED_PROVINCES_COUNT) {
                log.warn("Province count is not {}. Starting data reset...", EXPECTED_PROVINCES_COUNT);

                // Xóa tất cả dữ liệu (Ward trước vì có foreign key)
                log.info("Deleting all wards...");
                wardRepository.deleteAll();

                log.info("Deleting all provinces...");
                provinceRepository.deleteAll();

                // Chạy file SQL
                log.info("Executing SQL script: dvhc_2025.sql");
                ClassPathResource resource = new ClassPathResource("db/dvhc_2025.sql");
                ResourceDatabasePopulator populator = new ResourceDatabasePopulator(resource);
                populator.setContinueOnError(false); // Dừng nếu có lỗi
                populator.execute(dataSource);

                log.info("✅ Province and Ward data initialized successfully!");
                log.info("Total provinces: {}", provinceRepository.count());
                log.info("Total wards: {}", wardRepository.count());
            } else {
                log.info("✅ Province data already initialized. Skipping...");
            }
        } catch (Exception e) {
            log.error("❌ Failed to initialize province data", e);
            throw new RuntimeException("Failed to initialize province data", e);
        }
    }
}
