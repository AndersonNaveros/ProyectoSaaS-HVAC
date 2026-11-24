package pe.hvacsolutions.portal;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class PortalAuthFilter extends OncePerRequestFilter {
    private final JdbcTemplate jdbc;
    public PortalAuthFilter(JdbcTemplate jdbc) { this.jdbc = jdbc; }
    public static String hash(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (Exception e) { throw new IllegalStateException(e); }
    }
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
      throws ServletException, IOException {
        String auth = request.getHeader("Authorization");
        if (auth != null && auth.startsWith("Bearer ")) {
            String token = auth.substring(7);
            if (token.matches("[A-Za-z0-9_-]{43}")) {
                List<Map<String,Object>> rows = jdbc.queryForList("""
                    SELECT u.id,u.company_id,u.role,u.name,u.email
                    FROM auth_sessions s JOIN app_users u ON u.id=s.user_id
                    JOIN companies c ON c.id=u.company_id
                    WHERE s.token_hash=? AND s.expires_at>now() AND u.active=true AND c.active=true
                    """, hash(token));
                if (!rows.isEmpty()) {
                    var u = rows.get(0);
                    var principal = new PortalPrincipal((UUID)u.get("id"), ((Number)u.get("company_id")).longValue(),
                        (String)u.get("role"), (String)u.get("name"), (String)u.get("email"));
                    var authentication = new UsernamePasswordAuthenticationToken(principal, null,
                        List.of(new SimpleGrantedAuthority("ROLE_"+principal.role())));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        }
        try { chain.doFilter(request,response); } finally { SecurityContextHolder.clearContext(); }
    }
}
