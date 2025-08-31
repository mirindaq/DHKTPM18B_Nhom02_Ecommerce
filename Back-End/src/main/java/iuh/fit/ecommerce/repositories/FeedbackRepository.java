package vn.com.ecomstore.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.com.ecomstore.entities.Feedback;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
}