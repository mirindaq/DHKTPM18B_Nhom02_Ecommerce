package iuh.fit.ecommerce.configurations;


import iuh.fit.ecommerce.entities.Ranking;
import iuh.fit.ecommerce.entities.Role;
import iuh.fit.ecommerce.entities.Staff;
import iuh.fit.ecommerce.entities.UserRole;
import iuh.fit.ecommerce.enums.WorkStatus;
import iuh.fit.ecommerce.repositories.RankingRepository;
import iuh.fit.ecommerce.repositories.RoleRepository;
import iuh.fit.ecommerce.repositories.StaffRepository;
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


    @Bean
    @Transactional
    ApplicationRunner initApplication(StaffRepository staffRepository){
        return args -> {
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


        };
    }
}
