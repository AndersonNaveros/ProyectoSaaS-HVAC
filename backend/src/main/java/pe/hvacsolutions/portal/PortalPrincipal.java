package pe.hvacsolutions.portal;
import java.util.UUID;
public record PortalPrincipal(UUID id, long companyId, String role, String name, String email) {}
