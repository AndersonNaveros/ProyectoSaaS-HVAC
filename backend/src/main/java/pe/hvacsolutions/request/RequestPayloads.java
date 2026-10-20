package pe.hvacsolutions.request;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

public final class RequestPayloads {
    private RequestPayloads() {}
    public record LineInput(@NotNull Long catalogItemId, @Min(1) @Max(999) int quantity) {}
    public record CreateRequest(
        @NotNull UUID idempotencyKey,
        @NotBlank @Size(max=120) String contactName,
        @NotBlank @Pattern(regexp = "^[+]?[0-9 ()-]{7,20}$", message = "Teléfono inválido") String contactPhone,
        @Email @Size(max=160) String contactEmail,
        @Size(max=180) String companyName,
        @Size(max=240) String location,
        @Size(max=2000) String notes,
        @NotBlank @Pattern(regexp = "WHATSAPP|PHONE|EMAIL") String preferredContact,
        @NotEmpty @Size(max=50) List<@Valid LineInput> lines
    ) {}
    public record LineView(String type, String name, int quantity) {}
    public record CreatedRequest(String code, String token, Instant expiresAt, boolean alreadyRegistered, String whatsappSummary) {}
    public record LookupRequest(@NotBlank String token) {}
    public record TrackingView(String code, String status, Instant createdAt, List<LineView> lines) {}
}
