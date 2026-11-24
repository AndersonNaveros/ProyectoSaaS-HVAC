package pe.hvacsolutions.portal;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/portal")
public class PortalController {
    private final JdbcTemplate jdbc;
    private final PasswordEncoder passwords;
    private final AuthController auth;
    private static final Set<String> PERMISSIONS=Set.of("PRODUCTS_READ","PRODUCTS_WRITE","BRANDS_READ","BRANDS_WRITE",
        "SUPPLIERS_READ","SUPPLIERS_WRITE","CLIENTS_READ","APPOINTMENTS_READ","APPOINTMENTS_WRITE",
        "JOBS_READ","JOBS_WRITE","ORDERS_READ","ORDERS_WRITE","REQUESTS_READ","REQUESTS_WRITE");
    private static final Set<String> STATUSES=Set.of("PENDING","SCHEDULED","IN_PROGRESS","COMPLETED","CANCELLED");
    public PortalController(JdbcTemplate jdbc,PasswordEncoder passwords,AuthController auth) {this.jdbc=jdbc;this.passwords=passwords;this.auth=auth;}
    private PortalPrincipal user(Authentication a) {return (PortalPrincipal)a.getPrincipal();}
    private static ResponseStatusException bad(String message) {return new ResponseStatusException(HttpStatus.BAD_REQUEST,message);}
    private static String string(Map<String,Object> m,String name,int max,boolean required) {
        Object value=m.get(name);
        String s=value==null?"":String.valueOf(value).trim();
        if ((required && s.isEmpty()) || s.length()>max) throw bad("Campo invalido: "+name);
        return s;
    }
    private static String opt(Map<String,Object> m,String field,int max) {
        var s=string(m,field,max,false); return s.isBlank()?null:s;
    }
    private static long number(Map<String,Object> m,String field,long min,long max) {
        try {
            long value=Long.parseLong(String.valueOf(m.get(field)));
            if (value<min || value>max) throw new IllegalArgumentException();
            return value;
        } catch(Exception e) {throw bad("Numero invalido: "+field);}
    }
    private static Long nullableId(Map<String,Object> m,String field) {
        Object o=m.get(field);
        return o==null || String.valueOf(o).isBlank()?null:number(m,field,1,Long.MAX_VALUE);
    }
    private static UUID uuid(Map<String,Object> m,String field, boolean required) {
        var s=string(m,field,50,required);
        try {return s.isEmpty()?null:UUID.fromString(s);} catch(IllegalArgumentException e){throw bad("Identificador invalido: "+field);}
    }
    private static Instant instant(Map<String,Object> m,String field) {
        try {return Instant.parse(string(m,field,50,true));}
        catch(DateTimeParseException e){throw bad("Fecha invalida: "+field);}
    }
    private static BigDecimal money(Map<String,Object> m,String field) {
        try {
            BigDecimal d=new BigDecimal(String.valueOf(m.get(field)));
            if(d.signum()<0 || d.scale()>2 || d.precision()>12) throw new NumberFormatException();
            return d;
        } catch(Exception e){throw bad("Importe invalido: "+field);}
    }
    private static boolean bool(Map<String,Object> m,String field,boolean fallback) {
        return m.containsKey(field)?Boolean.parseBoolean(String.valueOf(m.get(field))):fallback;
    }
    private void affected(int count) {if(count==0)throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Registro no encontrado en tu empresa");}
    private void check(PortalPrincipal u,String area,boolean write) {
        if (area.equals("companies")) {
            if(!u.role().equals("DEVELOPER")) throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Acceso restringido");
            return;
        }
        if (u.role().equals("ADMIN")) return;
        if(u.role().equals("WORKER") && !Set.of("users","audit","company","subroles").contains(area)) {
            String permission=(area.equals("stock")?"PRODUCTS":area.toUpperCase())+"_"+(write?"WRITE":"READ");
            if(PERMISSIONS.contains(permission)) {
                Integer count=jdbc.queryForObject("SELECT count(*) FROM worker_permissions WHERE user_id=? AND permission=?",Integer.class,u.id(),permission);
                if(count!=null && count>0) return;
            }
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN,"No tienes permiso para esta accion");
    }
    private void validatePerson(UUID id,long company,Set<String> roles) {
        if(id==null)return;
        var rows=jdbc.queryForList("SELECT role FROM app_users WHERE id=? AND company_id=? AND active=true",id,company);
        if(rows.isEmpty() || !roles.contains(rows.get(0).get("role"))) throw bad("Usuario no valido para la empresa o rol seleccionado");
    }
    private void audit(PortalPrincipal u,String action,String detail) {auth.audit(u.companyId(),u.id(),action,detail);}
    private String validBrand(Map<String,Object> body,long cid){
        String brand=opt(body,"brandName",140);
        if(brand!=null && value("SELECT count(*) FROM brands WHERE company_id=? AND name=?",cid,brand)==0)
            throw bad("Selecciona una marca registrada en el panel Marcas");
        return brand;
    }
    @GetMapping("/overview")
    public Map<String,Object> overview(Authentication a) {
        var u=user(a); long cid=u.companyId();
        if(u.role().equals("CLIENT")) return Map.of(
            "orders",value("SELECT count(*) FROM sales_orders WHERE company_id=? AND customer_id=?",cid,u.id()),
            "jobs",value("SELECT count(*) FROM work_orders WHERE company_id=? AND customer_id=?",cid,u.id()),
            "requests",value("SELECT count(*) FROM quotation_requests WHERE company_id=? AND customer_id=?",cid,u.id()));
        if(u.role().equals("DEVELOPER"))return Map.of("companies",value("SELECT count(*) FROM companies"),
            "users",value("SELECT count(*) FROM app_users"));
        if(u.role().equals("WORKER"))return Map.of("myAppointments",value("SELECT count(*) FROM appointments WHERE company_id=? AND worker_id=?",cid,u.id()),
            "myJobs",value("SELECT count(*) FROM work_orders WHERE company_id=? AND worker_id=?",cid,u.id()));
        check(u,"company",false);
        return Map.of("lowStock",value("SELECT count(*) FROM catalog_items WHERE company_id=? AND type='PRODUCT' AND active=true AND stock<5",cid),"clients",value("SELECT count(*) FROM app_users WHERE company_id=? AND role='CLIENT'",cid),
            "products",value("SELECT count(*) FROM catalog_items WHERE company_id=?",cid),
            "jobs",value("SELECT count(*) FROM work_orders WHERE company_id=?",cid),
            "appointments",value("SELECT count(*) FROM appointments WHERE company_id=?",cid),
            "orders",value("SELECT count(*) FROM sales_orders WHERE company_id=?",cid),
            "requests",value("SELECT count(*) FROM quotation_requests WHERE company_id=?",cid));
    }
    private int value(String sql,Object... args) {return jdbc.queryForObject(sql,Integer.class,args);}
    @GetMapping("/my/{area}")
    public List<Map<String,Object>> mine(@PathVariable String area,Authentication a) {
        var u=user(a); long cid=u.companyId();
        if(!u.role().equals("CLIENT") && !u.role().equals("ADMIN") && !u.role().equals("WORKER"))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        return switch(area) {
            case "jobs" -> jdbc.queryForList("SELECT id,title,description,status,quoted_amount,created_at FROM work_orders WHERE company_id=? AND customer_id=? ORDER BY created_at DESC",cid,u.id());
            case "orders" -> jdbc.queryForList("SELECT o.id,o.quantity,o.unit_price,o.total,o.status,o.created_at,i.name AS product FROM sales_orders o JOIN catalog_items i ON i.id=o.item_id WHERE o.company_id=? AND o.customer_id=? ORDER BY o.created_at DESC",cid,u.id());
            case "requests" -> jdbc.queryForList("SELECT code,status,created_at FROM quotation_requests WHERE company_id=? AND customer_id=? ORDER BY created_at DESC",cid,u.id());
            default -> throw bad("Area no disponible");
        };
    }
    @GetMapping("/{area}")
    public List<Map<String,Object>> list(@PathVariable String area,Authentication a) {
        var u=user(a);check(u,area,false); long id=u.companyId();
        return switch(area) {
            case "brands" -> jdbc.queryForList("SELECT id,name FROM brands WHERE company_id=? ORDER BY name",id);
            case "subroles" -> jdbc.queryForList("SELECT r.id,r.name,COALESCE((SELECT string_agg(p.permission,', ' ORDER BY p.permission) FROM subrole_permissions p WHERE p.subrole_id=r.id),'') AS permissions FROM worker_subroles r WHERE r.company_id=? ORDER BY r.name",id);
            case "products" -> jdbc.queryForList("SELECT id,name,sku,type,category,summary,brand_name,stock,active FROM catalog_items WHERE company_id=? ORDER BY id DESC",id);
            case "suppliers" -> jdbc.queryForList("SELECT id,name,phone,email,contact,notes FROM suppliers WHERE company_id=? ORDER BY name",id);
            case "stock" -> jdbc.queryForList("SELECT m.id,i.name AS product,m.delta,m.reason,m.created_at,u.name AS actor FROM stock_movements m JOIN catalog_items i ON i.id=m.item_id LEFT JOIN app_users u ON u.id=m.actor_id WHERE m.company_id=? ORDER BY m.id DESC LIMIT 150",id);
            case "clients" -> jdbc.queryForList("SELECT id,name,email,phone,organization,active,created_at FROM app_users WHERE company_id=? AND role='CLIENT' ORDER BY created_at DESC",id);
            case "users" -> jdbc.queryForList("SELECT u.id,u.name,u.email,u.role,u.active,COALESCE((SELECT string_agg(p.permission,', ' ORDER BY p.permission) FROM worker_permissions p WHERE p.user_id=u.id),'') AS permissions,u.subrole_id,r.name AS subrole_name FROM app_users u LEFT JOIN worker_subroles r ON r.id=u.subrole_id WHERE u.company_id=? AND u.role<>'DEVELOPER' ORDER BY u.created_at DESC",id);
            case "appointments" -> u.role().equals("WORKER") ? jdbc.queryForList("SELECT id,title,address,starts_at,status,notes,customer_id,worker_id FROM appointments WHERE company_id=? AND worker_id=? ORDER BY starts_at DESC",id,u.id()) : jdbc.queryForList("SELECT id,title,address,starts_at,status,notes,customer_id,worker_id FROM appointments WHERE company_id=? ORDER BY starts_at DESC",id);
            case "jobs" -> u.role().equals("WORKER") ? jdbc.queryForList("SELECT id,title,description,status,quoted_amount,customer_id,worker_id,created_at FROM work_orders WHERE company_id=? AND worker_id=? ORDER BY created_at DESC",id,u.id()) : jdbc.queryForList("SELECT id,title,description,status,quoted_amount,customer_id,worker_id,created_at FROM work_orders WHERE company_id=? ORDER BY created_at DESC",id);
            case "orders" -> jdbc.queryForList("SELECT o.id,o.customer_id,o.item_id,o.quantity,o.unit_price,o.total,o.status,o.created_at,i.name AS product FROM sales_orders o JOIN catalog_items i ON i.id=o.item_id WHERE o.company_id=? ORDER BY o.created_at DESC",id);
            case "requests" -> jdbc.queryForList("SELECT id,code,contact_name,contact_phone,contact_email,status,created_at FROM quotation_requests WHERE company_id=? ORDER BY created_at DESC LIMIT 150",id);
            case "audit" -> jdbc.queryForList("SELECT l.id,l.action,l.detail,l.created_at,u.name AS actor FROM audit_events l LEFT JOIN app_users u ON u.id=l.actor_id WHERE l.company_id=? ORDER BY l.id DESC LIMIT 150",id);
            case "company" -> jdbc.queryForList("SELECT id,name,slug,active,created_at FROM companies WHERE id=?",id);
            case "companies" -> jdbc.queryForList("SELECT c.id,c.name,c.slug,c.active,c.created_at,COUNT(u.id) AS users FROM companies c LEFT JOIN app_users u ON u.company_id=c.id GROUP BY c.id ORDER BY c.id");
            default -> throw bad("Modulo desconocido");
        };
    }
    @PostMapping("/{area}")
    @Transactional
    public Map<String,Object> create(@PathVariable String area,@RequestBody Map<String,Object> body,Authentication a) {
        var u=user(a);check(u,area,true);long cid=u.companyId();
        long id;
        switch(area) {
            case "brands" -> id=jdbc.queryForObject("INSERT INTO brands(company_id,name) VALUES(?,?) RETURNING id",Long.class,cid,string(body,"name",140,true));
            case "subroles" -> {
                id=jdbc.queryForObject("INSERT INTO worker_subroles(company_id,name) VALUES(?,?) RETURNING id",Long.class,cid,string(body,"name",100,true));
                updateSubrolePermissions(id,body);
            }
            case "products" -> {
                String type=string(body,"type",10,true);
                if(!Set.of("PRODUCT","SERVICE").contains(type))throw bad("Tipo invalido");
                long stock=number(body,"stock",0,1000000);
                id=jdbc.queryForObject("INSERT INTO catalog_items(company_id,type,name,sku,summary,category,brand_name,stock,active) VALUES(?,?,?,?,?,?,?,?,?) RETURNING id",Long.class,
                    cid,type,string(body,"name",180,true),opt(body,"sku",80),string(body,"summary",500,true),string(body,"category",100,true),validBrand(body,cid),stock,bool(body,"active",true));
                if(stock>0)jdbc.update("INSERT INTO stock_movements(company_id,item_id,actor_id,delta,reason) VALUES(?,?,?,?,'INITIAL')",cid,id,u.id(),stock);
            }
            case "suppliers" -> id=jdbc.queryForObject("INSERT INTO suppliers(company_id,name,phone,email,contact,notes) VALUES(?,?,?,?,?,?) RETURNING id",Long.class,
                cid,string(body,"name",160,true),opt(body,"phone",30),opt(body,"email",180),opt(body,"contact",140),opt(body,"notes",500));
            case "clients","users" -> {
                String role=area.equals("clients")?"CLIENT":string(body,"role",12,true);
                if(!Set.of("CLIENT","WORKER","ADMIN").contains(role))throw bad("Rol invalido");
                String name=string(body,"name",120,true), email=AuthController.email(string(body,"email",180,true));
                String pass=string(body,"password",72,true);AuthController.validatePassword(pass);
                if(value("SELECT count(*) FROM app_users WHERE email=?",email)>0)
                    throw new ResponseStatusException(HttpStatus.CONFLICT,"El correo ya esta registrado");
                UUID uid=UUID.randomUUID();
                jdbc.update("INSERT INTO app_users(id,company_id,name,email,password_hash,role,phone) VALUES(?,?,?,?,?,?,?)",
                    uid,cid,name,email,passwords.encode(pass),role,opt(body,"phone",30));
                updatePermissions(uid,role,body,cid);
                audit(u,"ACCOUNT_CREATED",email+" / "+role);
                return Map.of("id",uid.toString(),"message","Cuenta creada. Entrega la clave al usuario por un canal seguro");
            }
            case "appointments" -> {
                UUID customer=uuid(body,"customerId",false),worker=uuid(body,"workerId",false);
                validatePerson(customer,cid,Set.of("CLIENT")); validatePerson(worker,cid,Set.of("WORKER","ADMIN"));
                if(u.role().equals("WORKER") && (worker==null || !worker.equals(u.id()))) throw new ResponseStatusException(HttpStatus.FORBIDDEN);
                id=jdbc.queryForObject("INSERT INTO appointments(company_id,title,address,starts_at,status,customer_id,worker_id,notes) VALUES(?,?,?,?,?,?,?,?) RETURNING id",Long.class,
                    cid,string(body,"title",160,true),opt(body,"address",240),java.sql.Timestamp.from(instant(body,"startsAt")),status(body),customer,worker,opt(body,"notes",700));
            }
            case "jobs" -> {
                UUID customer=uuid(body,"customerId",false),worker=uuid(body,"workerId",false);
                validatePerson(customer,cid,Set.of("CLIENT"));validatePerson(worker,cid,Set.of("WORKER","ADMIN"));
                if(u.role().equals("WORKER") && (worker==null || !worker.equals(u.id())))throw new ResponseStatusException(HttpStatus.FORBIDDEN);
                id=jdbc.queryForObject("INSERT INTO work_orders(company_id,title,description,status,customer_id,worker_id,quoted_amount) VALUES(?,?,?,?,?,?,?) RETURNING id",Long.class,
                    cid,string(body,"title",180,true),opt(body,"description",1000),status(body),customer,worker,money(body,"quotedAmount"));
            }
            case "orders" -> {
                UUID customer=uuid(body,"customerId",true);
                validatePerson(customer,cid,Set.of("CLIENT"));
                long item=number(body,"itemId",1,Long.MAX_VALUE),qty=number(body,"quantity",1,999);
                BigDecimal price=money(body,"unitPrice");
                int updated=jdbc.update("UPDATE catalog_items SET stock=stock-? WHERE id=? AND company_id=? AND type='PRODUCT' AND active=true AND stock>=?",qty,item,cid,qty);
                if(updated==0)throw new ResponseStatusException(HttpStatus.CONFLICT,"Producto inactivo, inexistente o sin existencias suficientes");
                jdbc.update("INSERT INTO stock_movements(company_id,item_id,actor_id,delta,reason) VALUES(?,?,?,?,'SALE')",cid,item,u.id(),-qty);
                id=jdbc.queryForObject("INSERT INTO sales_orders(company_id,customer_id,item_id,quantity,unit_price,total) VALUES(?,?,?,?,?,?) RETURNING id",Long.class,
                    cid,customer,item,qty,price,price.multiply(BigDecimal.valueOf(qty)));
            }
            case "companies" -> {
                String name=string(body,"name",160,true),slug=string(body,"slug",100,true);
                if(!slug.matches("[a-z0-9]+(?:-[a-z0-9]+)*"))throw bad("Usa un slug minusculo con guiones");
                String email=AuthController.email(string(body,"adminEmail",180,true));
                String pass=string(body,"password",72,true);AuthController.validatePassword(pass);
                if(value("SELECT count(*) FROM app_users WHERE email=?",email)>0)throw bad("El correo ya tiene cuenta");
                id=jdbc.queryForObject("INSERT INTO companies(name,slug) VALUES(?,?) RETURNING id",Long.class,name,slug);
                jdbc.update("INSERT INTO app_users(id,company_id,name,email,password_hash,role) VALUES(?,?,?,?,?,'ADMIN')",
                    UUID.randomUUID(),id,string(body,"adminName",120,true),email,passwords.encode(pass));
                audit(u,"COMPANY_CREATED",slug);
                return Map.of("id",id,"message","Empresa y administrador inicial creados");
            }
            default -> throw bad("No es posible crear registros aqui");
        }
        audit(u,area.toUpperCase()+"_CREATED","Registro #"+id);
        return Map.of("id",id,"message","Registro guardado");
    }
    private static String status(Map<String,Object> body) {
        String s=string(body,"status",20,false);
        if(s.isEmpty())return "PENDING";
        if(!STATUSES.contains(s))throw bad("Estado invalido");
        return s;
    }
    private void updateSubrolePermissions(long id,Map<String,Object> body){
        jdbc.update("DELETE FROM subrole_permissions WHERE subrole_id=?",id);
        Object obj=body.get("permissions");
        if(!(obj instanceof List<?> permissions))return;
        for(Object permission:permissions){
            String p=String.valueOf(permission);
            if(!PERMISSIONS.contains(p))throw bad("Permiso no reconocido: "+p);
            jdbc.update("INSERT INTO subrole_permissions(subrole_id,permission) VALUES(?,?) ON CONFLICT DO NOTHING",id,p);
        }
    }
    private void updatePermissions(UUID id,String role,Map<String,Object> body,long cid) {
        jdbc.update("DELETE FROM worker_permissions WHERE user_id=?",id);
        if(!role.equals("WORKER")){
            jdbc.update("UPDATE app_users SET subrole_id=NULL WHERE id=? AND company_id=?",id,cid);return;
        }
        Long template=nullableId(body,"subroleId");
        if(template!=null){
            if(value("SELECT count(*) FROM worker_subroles WHERE id=? AND company_id=?",template,cid)==0)
                throw bad("Subrol no pertenece a la empresa");
            jdbc.update("UPDATE app_users SET subrole_id=? WHERE id=? AND company_id=?",template,id,cid);
        }else jdbc.update("UPDATE app_users SET subrole_id=NULL WHERE id=? AND company_id=?",id,cid);
        Object obj=body.get("permissions");
        if(obj instanceof List<?> values){
            for(Object item:values){
                String p=String.valueOf(item);
                if(!PERMISSIONS.contains(p))throw bad("Permiso no reconocido: "+p);
                jdbc.update("INSERT INTO worker_permissions(user_id,permission) VALUES(?,?) ON CONFLICT DO NOTHING",id,p);
            }
        }else if(template!=null){
            jdbc.update("INSERT INTO worker_permissions(user_id,permission) SELECT ?,permission FROM subrole_permissions WHERE subrole_id=?",id,template);
        }
    }
    @PatchMapping("/{area}/{id}")
    @Transactional
    public Map<String,Object> update(@PathVariable String area,@PathVariable String id,@RequestBody Map<String,Object> body,Authentication a) {
        var u=user(a);check(u,area,true);long cid=u.companyId();
        long key=0;
        if(!Set.of("users","clients","company","requests","companies").contains(area)) {
            try{key=Long.parseLong(id);}catch(Exception e){throw bad("Identificador invalido");}
        }
        int count;
        switch(area) {
            case "brands" -> {
                var existing=jdbc.queryForList("SELECT name FROM brands WHERE id=? AND company_id=?",key,cid);
                if(existing.isEmpty())throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Marca no encontrada");
                String next=string(body,"name",140,true);
                count=jdbc.update("UPDATE brands SET name=? WHERE id=? AND company_id=?",next,key,cid);
                if(count>0)jdbc.update("UPDATE catalog_items SET brand_name=? WHERE company_id=? AND brand_name=?",next,cid,existing.get(0).get("name"));
            }
            case "subroles" -> {
                count=jdbc.update("UPDATE worker_subroles SET name=? WHERE id=? AND company_id=?",string(body,"name",100,true),key,cid);
                if(count>0){
                    updateSubrolePermissions(key,body);
                    jdbc.update("DELETE FROM worker_permissions WHERE user_id IN (SELECT id FROM app_users WHERE subrole_id=? AND company_id=?)",key,cid);
                    jdbc.update("INSERT INTO worker_permissions(user_id,permission) SELECT u.id,p.permission FROM app_users u JOIN subrole_permissions p ON p.subrole_id=u.subrole_id WHERE u.subrole_id=? AND u.company_id=?",key,cid);
                }
            }
            case "products" -> {
                var old=jdbc.queryForList("SELECT stock FROM catalog_items WHERE id=? AND company_id=?",key,cid);
                if(old.isEmpty())throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Producto no encontrado");
                long stock=number(body,"stock",0,1000000);
                long delta=stock-((Number)old.get(0).get("stock")).longValue();
                count=jdbc.update("UPDATE catalog_items SET name=?,sku=?,summary=?,category=?,brand_name=?,stock=?,active=? WHERE id=? AND company_id=?",
                    string(body,"name",180,true),opt(body,"sku",80),string(body,"summary",500,true),string(body,"category",100,true),validBrand(body,cid),stock,bool(body,"active",true),key,cid);
                if(delta!=0)jdbc.update("INSERT INTO stock_movements(company_id,item_id,actor_id,delta,reason) VALUES(?,?,?,?,'ADJUSTMENT')",cid,key,u.id(),delta);
            }
            case "suppliers" -> count=jdbc.update("UPDATE suppliers SET name=?,phone=?,email=?,contact=?,notes=? WHERE id=? AND company_id=?",
                string(body,"name",160,true),opt(body,"phone",30),opt(body,"email",180),opt(body,"contact",140),opt(body,"notes",500),key,cid);
            case "appointments" -> {
                UUID customer=uuid(body,"customerId",false),worker=uuid(body,"workerId",false);
                validatePerson(customer,cid,Set.of("CLIENT"));validatePerson(worker,cid,Set.of("WORKER","ADMIN"));
                if(u.role().equals("WORKER") && (worker==null || !worker.equals(u.id()))) throw new ResponseStatusException(HttpStatus.FORBIDDEN);
                count=jdbc.update("UPDATE appointments SET title=?,address=?,starts_at=?,status=?,customer_id=?,worker_id=?,notes=? WHERE id=? AND company_id=?"+(u.role().equals("WORKER")?" AND worker_id=?":""),
                    args(new Object[]{string(body,"title",160,true),opt(body,"address",240),java.sql.Timestamp.from(instant(body,"startsAt")),status(body),customer,worker,opt(body,"notes",700),key,cid},u.role().equals("WORKER")?u.id():null));
            }
            case "jobs" -> {
                UUID customer=uuid(body,"customerId",false),worker=uuid(body,"workerId",false);
                validatePerson(customer,cid,Set.of("CLIENT")); validatePerson(worker,cid,Set.of("WORKER","ADMIN"));
                if(u.role().equals("WORKER") && (worker==null || !worker.equals(u.id())))throw new ResponseStatusException(HttpStatus.FORBIDDEN);
                count=jdbc.update("UPDATE work_orders SET title=?,description=?,status=?,customer_id=?,worker_id=?,quoted_amount=? WHERE id=? AND company_id=?"+(u.role().equals("WORKER")?" AND worker_id=?":""),
                    args(new Object[]{string(body,"title",180,true),opt(body,"description",1000),status(body),customer,worker,money(body,"quotedAmount"),key,cid},u.role().equals("WORKER")?u.id():null));
            }
            case "users","clients" -> {
                UUID target;try{target=UUID.fromString(id);}catch(Exception e){throw bad("Usuario invalido");}
                if(target.equals(u.id()))throw bad("No puedes cambiar tu propio rol o desactivar tu cuenta aqui");
                String role=area.equals("clients")?"CLIENT":string(body,"role",12,true);
                if(!Set.of("CLIENT","WORKER","ADMIN").contains(role))throw bad("Rol invalido");
                count=jdbc.update("UPDATE app_users SET name=?,role=?,active=?,phone=? WHERE id=? AND company_id=? AND role<>'DEVELOPER'",
                    string(body,"name",120,true),role,bool(body,"active",true),opt(body,"phone",30),target,cid);
                if(count>0){updatePermissions(target,role,body,cid);jdbc.update("DELETE FROM auth_sessions WHERE user_id=?",target);}
            }
            case "requests" -> {
                String status=string(body,"status",32,true);
                if(!Set.of("REGISTERED","IN_REVIEW","QUOTED","CLOSED","CANCELLED").contains(status))throw bad("Estado invalido");
                UUID target;try{target=UUID.fromString(id);}catch(Exception e){throw bad("Solicitud invalida");}
                count=jdbc.update("UPDATE quotation_requests SET status=? WHERE id=? AND company_id=?",status,target,cid);
            }
            case "company" -> count=jdbc.update("UPDATE companies SET name=? WHERE id=?",string(body,"name",160,true),cid);
            case "companies" -> {
                if(u.role().equals("DEVELOPER") && Long.parseLong(id)==u.companyId() && !bool(body,"active",true))throw bad("No puedes desactivar tu propia empresa de acceso");
                count=jdbc.update("UPDATE companies SET active=? WHERE id=?",bool(body,"active",true),Long.parseLong(id));
            }
            default -> throw bad("Edicion no disponible");
        }
        affected(count);audit(u,area.toUpperCase()+"_UPDATED","Registro "+id);
        return Map.of("message","Cambios guardados");
    }
    private static Object[] args(Object[] base,Object extra) {
        if(extra==null)return base;
        Object[] result=java.util.Arrays.copyOf(base,base.length+1);result[base.length]=extra;return result;
    }
}
