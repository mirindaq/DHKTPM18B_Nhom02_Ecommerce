package iuh.fit.ecommerce.services;

import iuh.fit.ecommerce.entities.Chat;
import iuh.fit.ecommerce.entities.User;

public interface UserService {
    User getUserEntityById(Long userId);
}
