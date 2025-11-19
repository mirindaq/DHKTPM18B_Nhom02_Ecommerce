package iuh.fit.ecommerce.repositories;

import iuh.fit.ecommerce.entities.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
    List<Message> findByChatIdOrderByCreatedAtAsc(Long chatId);
    
    @Query("SELECT m FROM Message m LEFT JOIN FETCH m.sender WHERE m.chat.id = :chatId ORDER BY m.createdAt ASC")
    List<Message> findByChatIdWithSenderOrderByCreatedAtAsc(@Param("chatId") Long chatId);
    
    @Query("SELECT m FROM Message m WHERE m.chat.id = :chatId AND m.status = false")
    List<Message> findUnreadMessagesByChatId(@Param("chatId") Long chatId);
    
    @Modifying
    @Query("UPDATE Message m SET m.status = true WHERE m.chat.id = :chatId AND m.status = false")
    void markMessagesAsRead(@Param("chatId") Long chatId);
    
    @Query("SELECT COUNT(m) FROM Message m WHERE m.chat.id = :chatId AND m.status = false")
    Long countUnreadMessagesByChatId(@Param("chatId") Long chatId);
}

