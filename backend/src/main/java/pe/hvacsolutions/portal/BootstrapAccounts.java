package pe.hvacsolutions.portal;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class BootstrapAccounts implements ApplicationRunner {
    private final JdbcTemplate jdbc;
    private final PasswordEncoder passwords;
    @Value("${app.bootstrap.admin-email:}") private String adminEmail;
    @Value("${app.bootstrap.admin-password:}") private String adminPassword;
    @Value("${app.bootstrap.developer-email:}") private String devEmail;
    @Value("${app.bootstrap.developer-password:}") private String devPassword;
    public BootstrapAccounts(JdbcTemplate jdbc, PasswordEncoder passwords) {this.jdbc=jdbc;this.passwords=passwords;}
    @Override public void run(ApplicationArguments args) {
        create(adminEmail,adminPassword,"ADMIN","Administrador HVAC");
        create(devEmail,devPassword,"DEVELOPER","Responsable de plataforma");
    }
    private void create(String mail,String pass,String role,String name) {
        if (mail==null || mail.isBlank() || pass==null || pass.isBlank()) return;
        var email=AuthController.email(mail);
        AuthController.validatePassword(pass);
        Integer exists=jdbc.queryForObject("SELECT count(*) FROM app_users WHERE email=?",Integer.class,email);
        if (exists==null || exists==0) {
            jdbc.update("INSERT INTO app_users(id,company_id,name,email,password_hash,role) VALUES(?,1,?,?,?,?)",
                UUID.randomUUID(),name,email,passwords.encode(pass),role);
            System.out.println("Cuenta de "+role+" inicializada desde variables de entorno (la clave no se imprime)");
        }
    }
}
