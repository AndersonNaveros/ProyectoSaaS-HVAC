package pe.hvacsolutions.request;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import jakarta.persistence.*;

@Entity
@Table(name = "quotation_requests")
public class QuotationRequest {
    @Id private UUID id;
    @Column(nullable = false, unique = true) private String code;
    @Column(name = "idempotency_key", nullable = false, unique = true) private UUID idempotencyKey;
    @Column(name = "contact_name", nullable = false) private String contactName;
    @Column(name = "contact_phone", nullable = false) private String contactPhone;
    @Column(name = "contact_email") private String contactEmail;
    @Column(name = "company_name") private String companyName;
    private String location;
    @Column(length=2000) private String notes;
    @Column(name = "preferred_contact", nullable = false) private String preferredContact;
    @Column(nullable = false) private String status;
    @Column(name = "created_at", nullable = false) private Instant createdAt;
    @Column(name = "tracking_hash", nullable = false, unique = true) private String trackingHash;
    @Column(name = "tracking_expires_at", nullable = false) private Instant trackingExpiresAt;
    @OneToMany(mappedBy = "request", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<QuotationRequestLine> lines = new ArrayList<>();

    protected QuotationRequest() {}
    public QuotationRequest(String code, UUID idempotencyKey, String contactName, String contactPhone,
                            String contactEmail, String companyName, String location, String notes,
                            String preferredContact, String trackingHash, Instant trackingExpiresAt) {
        this.id = UUID.randomUUID();
        this.code = code;
        this.idempotencyKey = idempotencyKey;
        this.contactName = contactName;
        this.contactPhone = contactPhone;
        this.contactEmail = contactEmail;
        this.companyName = companyName;
        this.location = location;
        this.notes = notes;
        this.preferredContact = preferredContact;
        this.trackingHash = trackingHash;
        this.trackingExpiresAt = trackingExpiresAt;
        this.status = "REGISTERED";
        this.createdAt = Instant.now();
    }
    public void addLine(QuotationRequestLine line) { lines.add(line); line.setRequest(this); }
    public String getCode() { return code; }
    public String getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getTrackingExpiresAt() { return trackingExpiresAt; }
    public List<QuotationRequestLine> getLines() { return lines; }
}
