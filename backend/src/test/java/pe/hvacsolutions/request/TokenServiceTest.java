package pe.hvacsolutions.request;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import pe.hvacsolutions.tracking.TokenService;

class TokenServiceTest {
    @Test
    void tokenHasExpectedEntropyAndOnlyHashIsStored() {
        TokenService service = new TokenService();
        String first = service.newToken();
        String second = service.newToken();
        assertEquals(43, first.length()); // 32 bytes Base64URL sin relleno
        assertNotEquals(first, second);
        assertEquals(64, service.hash(first).length()); // SHA-256 en hex
        assertNotEquals(first, service.hash(first));
        assertEquals(service.hash(first), service.hash(first));
    }
}
