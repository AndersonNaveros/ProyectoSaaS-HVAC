package pe.hvacsolutions.request;

import jakarta.validation.Valid;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.hvacsolutions.request.RequestPayloads.*;

@RestController
public class RequestController {
    private final QuotationRequestService service;
    public RequestController(QuotationRequestService service) { this.service = service; }

    @PostMapping("/api/solicitudes")
    public ResponseEntity<CreatedRequest> create(@RequestBody @Valid CreateRequest data) {
        var result = service.create(data);
        return ResponseEntity.status(result.alreadyRegistered() ? HttpStatus.OK : HttpStatus.CREATED)
            .cacheControl(CacheControl.noStore()).body(result);
    }

    // POST evita exponer el token en URLs de logs del backend.
    @PostMapping("/api/tracking/lookup")
    public ResponseEntity<TrackingView> track(@RequestBody @Valid LookupRequest data) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(service.lookup(data.token()));
    }
}
