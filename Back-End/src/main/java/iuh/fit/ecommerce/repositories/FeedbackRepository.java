package iuh.fit.ecommerce.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import iuh.fit.ecommerce.entities.Feedback;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
}