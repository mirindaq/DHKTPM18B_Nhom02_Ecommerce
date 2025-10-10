package iuh.fit.ecommerce.repositories;

import iuh.fit.ecommerce.entities.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
    List<RefreshToken> findAllByUserId(Long userId);
//    void deleteByToken(String token);
//    void deleteAllByUserId(Long userId);
}