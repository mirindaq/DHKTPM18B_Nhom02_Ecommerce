package iuh.fit.ecommerce.configurations;


import iuh.fit.ecommerce.entities.*;
import iuh.fit.ecommerce.enums.WorkStatus;
import iuh.fit.ecommerce.repositories.*;
import iuh.fit.ecommerce.repositories.ProductVariantRepository;
import iuh.fit.ecommerce.repositories.RankingRepository;
import iuh.fit.ecommerce.repositories.RoleRepository;
import iuh.fit.ecommerce.repositories.StaffRepository;
import iuh.fit.ecommerce.services.ProductSearchService;
import iuh.fit.ecommerce.services.VectorStoreService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Configuration
@RequiredArgsConstructor
@Slf4j(topic = "INIT-APPLICATION")
public class InitApp {
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final RankingRepository rankingRepository;
    private final ProductVariantRepository productVariantRepository;
    private final VectorStoreService vectorStoreService;
    private final CustomerRepository customerRepository;
    private final ProductSearchService productSearchService;


    @Bean
    @Transactional
    ApplicationRunner initApplication(StaffRepository staffRepository){
        return args -> {
            productSearchService.reindexAllProducts();
            List<Map<String, String>> roles = List.of(
                    Map.of( "ADMIN","Quản trị viên"),
                    Map.of( "STAFF", "Nhân viên"),
                    Map.of( "CUSTOMER", "Khách hàng"),
                    Map.of( "SHIPPER", "Người giao hàng")
            );

            List<Role> roleList = new ArrayList<>();


            for (Map<String, String> roleMap : roles) {
                String roleName = roleMap.keySet().iterator().next();
                String roleDesc = roleMap.get(roleName);

                if (!roleRepository.existsByName(roleName)) {
                    Role newRole = new Role();
                    newRole.setName(roleName);
                    newRole.setDescription(roleDesc);
                    roleList.add(newRole);
                }
            }

            if (!roleList.isEmpty()) {
                roleRepository.saveAll(roleList);
            }

            if ( !staffRepository.existsByEmail("admin@gmail.com")){
                Staff staff = Staff.builder()
                        .email("admin@gmail.com")
                        .fullName("Admin")
                        .password(passwordEncoder.encode("123456"))
                        .phone("0123456789")
                        .address("123 Admin St")
                        .active(true)
                        .workStatus(WorkStatus.ACTIVE)
                        .joinDate(LocalDate.now())
                        .build();

                staff.setUserRoles(new ArrayList<>());

                UserRole adminRole = UserRole.builder()
                        .role(roleRepository.findByName("ADMIN")
                                .orElseThrow(() -> new RuntimeException("Role ADMIN not exist")))
                        .user(staff)
                        .build();

                staff.getUserRoles().add(adminRole);

                staffRepository.save(staff);

            }

            if (!staffRepository.existsByEmail("staff@gmail.com")) {
                Staff staff = Staff.builder()
                        .email("staff@gmail.com")
                        .fullName("Staff Member")
                        .password(passwordEncoder.encode("123456"))
                        .phone("0987654321")
                        .address("456 Staff St")
                        .active(true)
                        .workStatus(WorkStatus.ACTIVE)
                        .leader(false)
                        .joinDate(LocalDate.now().minusMonths(1))
                        .build();

                staff.setUserRoles(new ArrayList<>());
                UserRole staffRole = UserRole.builder()
                        .role(roleRepository.findByName("STAFF")
                                .orElseThrow(() -> new RuntimeException("Role STAFF not exist")))
                        .user(staff)
                        .build();
                staff.getUserRoles().add(staffRole);
                staffRepository.save(staff);
            }

            if (!staffRepository.existsByEmail("leader@gmail.com")) {
                Staff leader = Staff.builder()
                        .email("leader@gmail.com")
                        .fullName("Team Leader")
                        .password(passwordEncoder.encode("123456"))
                        .phone("0912345678")
                        .address("789 Leader St")
                        .active(true)
                        .workStatus(WorkStatus.ACTIVE)
                        .leader(true)
                        .joinDate(LocalDate.now().minusMonths(2))
                        .build();

                leader.setUserRoles(new ArrayList<>());
                UserRole leaderRole = UserRole.builder()
                        .role(roleRepository.findByName("STAFF")
                                .orElseThrow(() -> new RuntimeException("Role STAFF not exist")))
                        .user(leader)
                        .build();
                leader.getUserRoles().add(leaderRole);
                staffRepository.save(leader);
            }

            if (!customerRepository.existsByEmail("customer@gmail.com")) {
                Customer customer = Customer.builder()
                        .email("customer@gmail.com")
                        .fullName("Regular Customer")
                        .password(passwordEncoder.encode("123456"))
                        .phone("0999888777")
                        .active(true)
                        .totalSpending(5000000.0)
                        .ranking(rankingRepository.findByName("S-SILVER"))
                        .build();

                customer.setUserRoles(new ArrayList<>());
                UserRole customerRole = UserRole.builder()
                        .role(roleRepository.findByName("CUSTOMER")
                                .orElseThrow(() -> new RuntimeException("Role CUSTOMER not exist")))
                        .user(customer)
                        .build();
                customer.getUserRoles().add(customerRole);
                customerRepository.save(customer);
            }

            if (!staffRepository.existsByEmail("shipper@gmail.com")) {
                Staff shipper = Staff.builder()
                        .email("shipper@gmail.com")
                        .fullName("Shipper")
                        .password(passwordEncoder.encode("123456"))
                        .phone("0977665544")
                        .address("321 Shipper St")
                        .active(true)
                        .workStatus(WorkStatus.ACTIVE)
                        .leader(false)
                        .joinDate(LocalDate.now().minusWeeks(1))
                        .build();

                shipper.setUserRoles(new ArrayList<>());
                UserRole shipperRole = UserRole.builder()
                        .role(roleRepository.findByName("SHIPPER")
                                .orElseThrow(() -> new RuntimeException("Role SHIPPER not exist")))
                        .user(shipper)
                        .build();
                shipper.getUserRoles().add(shipperRole);
                staffRepository.save(shipper);
            }

            List<Ranking> rankings = List.of(
                    Ranking.builder().name("S-NEW").description("New Membership")
                            .minSpending(0.0).maxSpending(3000000.0).discountRate(0.0).build(),
                    Ranking.builder().name("S-SILVER").description("Silver Membership")
                            .minSpending(3000000.0).maxSpending(10000000.0).discountRate(2.0).build(),
                    Ranking.builder().name("S-GOLD").description("Gold Membership")
                            .minSpending(10000000.0).maxSpending(50000000.0).discountRate(3.0).build(),
                    Ranking.builder().name("S-PLATINUM").description("Platinum Membership")
                            .minSpending(50000000.0).maxSpending(100000000.0).discountRate(5.0).build(),
                    Ranking.builder().name("S-DIAMOND").description("Diamond Membership")
                            .minSpending(200000000.0).maxSpending(Double.MAX_VALUE).discountRate(7.0).build()
            );

            for (Ranking r : rankings) {
                if (!rankingRepository.existsByName(r.getName())) {
                    rankingRepository.save(r);
                }
            }

            // Index toàn bộ product variants vào Qdrant
//            indexAllProductVariants();

//            generateFakeShippers(staffRepository);

        };
    }

    private void generateFakeShippers(StaffRepository staffRepository) {
        String shipperRoleName = "SHIPPER";

        Role shipperRole = roleRepository.findByName(shipperRoleName)
                .orElseThrow(() -> new RuntimeException("Role SHIPPER not exist"));

        for (int i = 1; i <= 10; i++) {
            String email = "shipper" + i + "@gmail.com";

            // Nếu email đã có rồi thì bỏ qua
            if (staffRepository.existsByEmail(email)) {
                continue;
            }

            Staff shipper = Staff.builder()
                    .email(email)
                    .fullName("Shipper " + i)
                    .password(passwordEncoder.encode("123456"))
                    .phone("090" + String.format("%07d", i))  // 0900000001 -> 0900000010
                    .address("Fake Address " + i)
                    .active(true)
                    .leader(false)
                    .workStatus(WorkStatus.ACTIVE)
                    .joinDate(LocalDate.now().minusDays(i)) // mỗi shipper join cách nhau 1 ngày
                    .build();

            // set role
            shipper.setUserRoles(new ArrayList<>());

            UserRole userRole = UserRole.builder()
                    .role(shipperRole)
                    .user(shipper)
                    .build();

            shipper.getUserRoles().add(userRole);

            staffRepository.save(shipper);
        }

        log.info("✔️ Generated 10 fake shippers successfully");
    }

    /**
     * Index toàn bộ product variants hiện có trong database vào Qdrant vector store
     */
//    private void indexAllProductVariants() {
//        try {
//            log.info("Starting to index all product variants to Qdrant...");
//
//            List<ProductVariant> allVariants = productVariantRepository.findAll();
//
//            if (allVariants.isEmpty()) {
//                log.info("No product variants found in database. Skipping indexing.");
//                return;
//            }
//
//            int total = allVariants.size();
//            int successCount = 0;
//            int errorCount = 0;
//
//            log.info("Found {} product variants to index", total);
//
//            for (ProductVariant variant : allVariants) {
//                try {
//                    // Index variant vào Qdrant
//                    vectorStoreService.indexProductVariant(variant);
//                    successCount++;
//
//                    // Log progress mỗi 100 variants
//                    if (successCount % 100 == 0) {
//                        log.info("Indexed {}/{} product variants...", successCount, total);
//                    }
//                } catch (Exception e) {
//                    errorCount++;
//                    log.error("Failed to index product variant ID: {} - Error: {}",
//                            variant.getId(), e.getMessage());
//                }
//            }
//
//            log.info("Completed indexing product variants. Success: {}, Failed: {}, Total: {}",
//                    successCount, errorCount, total);
//
//        } catch (Exception e) {
//            log.error("Error during product variant indexing: {}", e.getMessage(), e);
//        }
//    }
}
