package pe.hvacsolutions.request;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashSet;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import pe.hvacsolutions.portal.PortalPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import pe.hvacsolutions.catalog.CatalogItem;
import pe.hvacsolutions.catalog.CatalogRepository;
import pe.hvacsolutions.request.RequestPayloads.*;
import pe.hvacsolutions.tracking.TokenService;

@Service
public class QuotationRequestService {
    private final QuotationRequestRepository requests;
    private final CatalogRepository catalog;
    private final TokenService tokens;
    private final JdbcTemplate jdbc;
    private final int ttlDays;

    public QuotationRequestService(QuotationRequestRepository requests, CatalogRepository catalog,
                                   TokenService tokens, JdbcTemplate jdbc, @Value("${app.tracking-ttl-days:30}") int ttlDays) {
        this.requests = requests;
        this.catalog = catalog;
        this.tokens = tokens;
        this.jdbc = jdbc;
        this.ttlDays = ttlDays;
    }

    @Transactional
    public CreatedRequest create(CreateRequest data) {
        var previous = requests.findByIdempotencyKey(data.idempotencyKey());
        if (previous.isPresent()) {
            // No se devuelve un secreto almacenado como hash. El navegador conserva el enlace creado.
            var old = previous.get();
            return new CreatedRequest(old.getCode(), null, old.getTrackingExpiresAt(), true, null);
        }
        if (data.lines() == null || data.lines().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El carrito está vacío");
        }
        var uniqueIds = new HashSet<Long>();
        for (var line : data.lines()) {
            if (!uniqueIds.add(line.catalogItemId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Hay elementos duplicados; acumula la cantidad");
            }
        }
        String trackingToken = tokens.newToken();
        String code = "HVAC-" + java.time.Year.now(java.time.ZoneOffset.UTC) + "-" +
            UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
        var saved = new QuotationRequest(
            code, data.idempotencyKey(), data.contactName().trim(), data.contactPhone().trim(),
            data.contactEmail(), data.companyName(), data.location(), data.notes(),
            data.preferredContact(), tokens.hash(trackingToken), Instant.now().plus(ttlDays, ChronoUnit.DAYS)
        );
        for (var line : data.lines()) {
            CatalogItem item = catalog.findById(line.catalogItemId())
                .filter(i -> i.isActive() && Long.valueOf(1).equals(i.getCompanyId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Producto o servicio no disponible"));
            saved.addLine(new QuotationRequestLine(item, line.quantity()));
        }
        requests.saveAndFlush(saved);
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof PortalPrincipal principal && principal.companyId()==1) {
            jdbc.update("UPDATE quotation_requests SET customer_id=?,company_id=? WHERE code=?",
                principal.id(), principal.companyId(), code);
        }
        return new CreatedRequest(code, trackingToken, saved.getTrackingExpiresAt(), false, whatsappText(saved));
    }

    @Transactional(readOnly = true)
    public TrackingView lookup(String token) {
        if (token == null || !token.matches("[A-Za-z0-9_-]{43}")) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Enlace inválido o caducado");
        }
        var request = requests.findByTrackingHash(tokens.hash(token))
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Enlace inválido o caducado"));
        if (!request.getTrackingExpiresAt().isAfter(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Enlace inválido o caducado");
        }
        List<LineView> lines = request.getLines().stream()
            .map(l -> new LineView(l.getType().name(), l.getItemName(), l.getQuantity()))
            .toList();
        return new TrackingView(request.getCode(), request.getStatus(), request.getCreatedAt(), lines);
    }

    private String whatsappText(QuotationRequest request) {
        StringBuilder text = new StringBuilder("Hola, HVAC Solutions. Quisiera consultar por la solicitud ")
            .append(request.getCode()).append(".\n\n");
        for (QuotationRequestLine line : request.getLines()) {
            text.append("• ").append(line.getQuantity()).append(" × ").append(line.getItemName()).append("\n");
        }
        text.append("\nAgradecería información sobre disponibilidad y condiciones. Gracias.");
        return text.toString();
    }
}
