package iuh.fit.ecommerce.mappers;

import iuh.fit.ecommerce.dtos.response.user.UserProfileResponse;
import iuh.fit.ecommerce.entities.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "roles", expression = "java(mapRolesToString(user.getUserRoles()))")
    UserProfileResponse toUserProfileResponse(User user);

    default List<String> mapRolesToString(java.util.List<iuh.fit.ecommerce.entities.UserRole> userRoles) {
        if (userRoles == null || userRoles.isEmpty()) {
            return List.of();
        }
        return userRoles.stream()
                .map(userRole -> userRole.getRole().getName())
                .toList();
    }
}
