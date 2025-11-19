package iuh.fit.ecommerce.repositories;

import iuh.fit.ecommerce.entities.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

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

    @Query("SELECT COUNT(m) FROM Message m WHERE m.chat.id = :chatId AND m.status = false AND m.sender.id = :userId")
    Long countUnreadMessagesByChatIdAndUserId(@Param("chatId") Long chatId, @Param("userId") Long userId);

    // Count unread messages NOT from userId (messages received by userId that are unread)
    @Query("SELECT COUNT(m) FROM Message m WHERE m.chat.id = :chatId AND m.status = false AND m.sender.id != :userId")
    Long countUnreadMessagesByChatIdNotFromUserId(@Param("chatId") Long chatId, @Param("userId") Long userId);


    Optional<Message> findTopByChat_IdOrderByCreatedAtDesc(Long chatId);
}

