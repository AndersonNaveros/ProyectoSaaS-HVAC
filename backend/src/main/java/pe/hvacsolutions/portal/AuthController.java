package pe.hvacsolutions.portal;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final JdbcTemplate jdbc;
    private final PasswordEncoder passwords;
    private static final SecureRandom SECURE = new SecureRandom();
    public AuthController(JdbcTemplate jdbc, PasswordEncoder passwords) { this.jdbc=jdbc; this.passwords=passwords; }
    public record Credentials(String email, String password) {}
    public record Signup(String name, String email, String password, String phone) {}
    public record ChangePassword(String currentPassword, String nextPassword) {}
    public record ProfileChange(String name, String phone, String organization) {}
    public static String email(String s) {
        if (s == null || !s.trim().toLowerCase(Locale.ROOT).matches("^[a-z0-9._%+\\-]{1,64}@[a-z0-9.-]{1,100}\\.[a-z]{2,20}$"))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Correo invalido");
        return s.trim().toLowerCase(Locale.ROOT);
    }
    public static String required(String s, int max, String name) {
        if (s==null || s.isBlank() || s.trim().length()>max)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,name+" es obligatorio (maximo "+max+" caracteres)");
        return s.trim();
    }
    public static void validatePassword(String password) {
        if (password==null || password.length()<10 || password.length()>72 || !password.matches(".*[A-Za-z].*") || !password.matches(".*[0-9].*"))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Usa una contrasena entre 10 y 72 caracteres con letras y numeros");
    }
    @Transactional
    @PostMapping("/register")
    public Map<String,Object> register(@RequestBody Signup s) {
        String name=required(s.name(),120,"Nombre");
        String mail=email(s.email());
        validatePassword(s.password());
        var exists=jdbc.queryForObject("SELECT count(*) FROM app_users WHERE email=?", Integer.class, mail);
        if (exists!=null && exists>0) throw new ResponseStatusException(HttpStatus.CONFLICT,"Ya hay una cuenta con ese correo");
        UUID id=UUID.randomUUID();
        jdbc.update("INSERT INTO app_users(id,company_id,name,email,password_hash,role,phone) VALUES(?,1,?,?,?,'CLIENT',?)",
            id,name,mail,passwords.encode(s.password()),s.phone()==null?null:s.phone().trim());
        audit(1L,id,"CLIENT_REGISTER","Cuenta creada mediante registro publico");
        return newSession(new PortalPrincipal(id,1,"CLIENT",name,mail));
    }
    @PostMapping("/login")
    public Map<String,Object> login(@RequestBody Credentials c) {
        String mail=email(c.email());
        List<Map<String,Object>> rows=jdbc.queryForList("""
            SELECT u.id,u.company_id,u.name,u.email,u.password_hash,u.role,u.active,u.failed_logins,u.locked_until,c.active AS company_active
            FROM app_users u JOIN companies c ON c.id=u.company_id WHERE u.email=?
            """,mail);
        if (rows.isEmpty()) throw invalid();
        Map<String,Object> u=rows.get(0);
        UUID id=(UUID)u.get("id");
        var locked=u.get("locked_until");
        Instant lockedUntil=locked instanceof java.sql.Timestamp t ? t.toInstant() :
            locked instanceof java.time.OffsetDateTime offset ? offset.toInstant() : null;
        if (lockedUntil!=null && lockedUntil.isAfter(Instant.now()))
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,"Demasiados intentos. Intenta nuevamente mas tarde");
        if (!Boolean.TRUE.equals(u.get("active")) || !Boolean.TRUE.equals(u.get("company_active"))) throw invalid();
        if (c.password()==null || !passwords.matches(c.password(), (String)u.get("password_hash"))) {
            jdbc.update("UPDATE app_users SET failed_logins=CASE WHEN failed_logins>=4 THEN 0 ELSE failed_logins+1 END, locked_until=CASE WHEN failed_logins>=4 THEN now()+interval '15 minutes' ELSE NULL END WHERE id=?",id);
            throw invalid();
        }
        jdbc.update("UPDATE app_users SET failed_logins=0,locked_until=NULL WHERE id=?",id);
        long cid=((Number)u.get("company_id")).longValue();
        audit(cid,id,"LOGIN","Inicio de sesion");
        return newSession(new PortalPrincipal(id,cid,(String)u.get("role"),(String)u.get("name"),mail));
    }
    private ResponseStatusException invalid() { return new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Credenciales incorrectas o cuenta inactiva"); }
    private Map<String,Object> newSession(PortalPrincipal user) {
        byte[] random=new byte[32]; SECURE.nextBytes(random);
        String token=Base64.getUrlEncoder().withoutPadding().encodeToString(random);
        jdbc.update("INSERT INTO auth_sessions(token_hash,user_id,expires_at) VALUES(?,?,now()+interval '12 hours')",PortalAuthFilter.hash(token),user.id());
        return Map.of("token",token,"user",profile(user),"expiresInSeconds",43200);
    }
    @GetMapping("/me")
    public Map<String,Object> me(Authentication a) { return profile((PortalPrincipal)a.getPrincipal()); }
    private Map<String,Object> profile(PortalPrincipal user) {
        var p=jdbc.queryForList("SELECT permission FROM worker_permissions WHERE user_id=? ORDER BY permission",String.class,user.id());
        var company=jdbc.queryForObject("SELECT name FROM companies WHERE id=?",String.class,user.companyId());
        var personal=jdbc.queryForMap("SELECT COALESCE(phone,'') AS phone,COALESCE(organization,'') AS organization FROM app_users WHERE id=?",user.id());
        Map<String,Object> result=new HashMap<>();
        result.put("id",user.id().toString());result.put("name",user.name());result.put("email",user.email());
        result.put("role",user.role());result.put("companyId",user.companyId());result.put("companyName",company);
        result.put("permissions",p);result.put("phone",personal.get("phone"));result.put("organization",personal.get("organization"));
        return result;
    }
    @PatchMapping("/profile")
    @Transactional
    public Map<String,Object> updateProfile(@RequestBody ProfileChange data,Authentication a) {
        var u=(PortalPrincipal)a.getPrincipal();
        String name=required(data.name(),120,"Nombre");
        String phone=data.phone()==null?"":data.phone().trim();
        String organization=data.organization()==null?"":data.organization().trim();
        if(phone.length()>30 || organization.length()>160)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Datos demasiado largos");
        jdbc.update("UPDATE app_users SET name=?,phone=?,organization=? WHERE id=?",name,phone,organization,u.id());
        audit(u.companyId(),u.id(),"PROFILE_UPDATED","Datos de contacto actualizados");
        return profile(new PortalPrincipal(u.id(),u.companyId(),u.role(),name,u.email()));
    }
    @PostMapping("/logout")
    public Map<String,Object> logout(@RequestHeader(value="Authorization",required=false) String token,Authentication a) {
        if(token!=null && token.startsWith("Bearer "))
            jdbc.update("DELETE FROM auth_sessions WHERE token_hash=?",PortalAuthFilter.hash(token.substring(7)));
        return Map.of("message","Sesion cerrada");
    }
    @Transactional
    @PostMapping("/change-password")
    public Map<String,Object> change(@RequestBody ChangePassword body,Authentication a) {
        PortalPrincipal u=(PortalPrincipal)a.getPrincipal();
        var hashed=jdbc.queryForObject("SELECT password_hash FROM app_users WHERE id=?",String.class,u.id());
        if (body.currentPassword()==null || !passwords.matches(body.currentPassword(),hashed)) throw invalid();
        validatePassword(body.nextPassword());
        jdbc.update("UPDATE app_users SET password_hash=? WHERE id=?",passwords.encode(body.nextPassword()),u.id());
        jdbc.update("DELETE FROM auth_sessions WHERE user_id=?",u.id());
        audit(u.companyId(),u.id(),"PASSWORD_CHANGED","Credenciales actualizadas; sesiones revocadas");
        return Map.of("message","Contrasena cambiada. Inicia sesion nuevamente");
    }
    void audit(long companyId,UUID actor,String action,String detail) {
        jdbc.update("INSERT INTO audit_events(company_id,actor_id,action,detail) VALUES(?,?,?,?)",companyId,actor,action,detail);
    }
}
