package pe.hvacsolutions.request;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuotationRequestRepository extends JpaRepository<QuotationRequest, UUID> {
    Optional<QuotationRequest> findByIdempotencyKey(UUID key);
    Optional<QuotationRequest> findByTrackingHash(String hash);
}
