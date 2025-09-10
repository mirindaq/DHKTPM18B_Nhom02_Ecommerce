package iuh.fit.ecommerce.configurations;


import iuh.fit.ecommerce.entities.Role;
import iuh.fit.ecommerce.repositories.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Configuration
@RequiredArgsConstructor
@Slf4j(topic = "INIT-APPLICATION")
public class InitApp {
    private final RoleRepository roleRepository;


    @Bean
    @Transactional
    ApplicationRunner initApplication(){
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

        };
    }
}
