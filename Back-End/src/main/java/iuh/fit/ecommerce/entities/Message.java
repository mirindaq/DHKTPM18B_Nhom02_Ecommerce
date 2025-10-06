package iuh.fit.ecommerce.entities;

import iuh.fit.ecommerce.enums.MessageType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "messages")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Message extends BaseEntity  {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column
    private String content;

    @Column
    @Enumerated(EnumType.STRING)
    private MessageType messageType;

    @Column
    private Boolean status;

    @ManyToOne
    @JoinColumn(name = "chat_id")
    private Chat chat;
}
