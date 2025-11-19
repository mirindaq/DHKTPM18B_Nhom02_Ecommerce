package iuh.fit.ecommerce.repositories;

import iuh.fit.ecommerce.entities.Chat;
import iuh.fit.ecommerce.entities.Customer;
import iuh.fit.ecommerce.entities.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRepository extends JpaRepository<Chat, Long> {
    
    Optional<Chat> findByCustomerId(Long customerId);
    
    List<Chat> findByStaffId(Long staffId);
    
    @Query("SELECT c FROM Chat c WHERE c.staff.id = :staffId OR c.customer.id = :userId")
    List<Chat> findChatsByUserId(@Param("userId") Long userId, @Param("staffId") Long staffId);
    
    @Query("SELECT c FROM Chat c WHERE c.staff IS NULL")
    List<Chat> findUnassignedChats();
    
    boolean existsByCustomerId(Long customerId);
}

