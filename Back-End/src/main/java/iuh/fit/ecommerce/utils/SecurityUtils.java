package iuh.fit.ecommerce.utils;

import iuh.fit.ecommerce.entities.Customer;
import iuh.fit.ecommerce.entities.Staff;
import iuh.fit.ecommerce.entities.User;
import iuh.fit.ecommerce.exceptions.custom.ResourceNotFoundException;
import iuh.fit.ecommerce.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.security.core.AuthenticationException;

@Component
@RequiredArgsConstructor
public class SecurityUtils {
    private final UserRepository userRepository;

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null ||
                !authentication.isAuthenticated() ||
                authentication.getPrincipal().equals("anonymousUser")) {
            throw new AuthenticationException("Unauthorized. User must be logged in.") {};
        }

        if (authentication.getPrincipal() instanceof UserDetails userDetails) {
            return userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new ResourceNotFoundException("Account not found with username: " + userDetails.getUsername()));
        }
        throw new AccessDeniedException("Access denied: Invalid principal type.");
    }

    public Staff getCurrentStaff() {
        User user = getCurrentUser();
        if (!(user instanceof Staff staff)) {
            throw new ResourceNotFoundException("Current user is not a Staff. User ID: " + user.getId());
        }
        return staff;
    }

    public Customer getCurrentCustomer() {
        User user = getCurrentUser();
        if (!(user instanceof Customer customer)) {
            throw new ResourceNotFoundException("Current user is not a Customer. User ID: " + user.getId());
        }
        return customer;
    }

}



