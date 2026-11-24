HVAC Solutions V1.4 - Espacios de trabajo

Estamos desarrollando una plataforma web para HVAC Controls. Esta version mantiene el sitio publico de la V1.3 y agrega cuentas, paneles separados y datos persistentes con PostgreSQL.

Un visitante puede consultar el catalogo y solicitar una cotizacion sin cuenta. Si se registra desde Mi cuenta, obtiene automaticamente el rol Cliente. Los trabajadores y administradores ingresan con cuentas creadas por un administrador de la empresa. El responsable de plataforma usa una cuenta de desarrollador distinta.

Tecnologias

- React y Vite para la interfaz
- Java 21 y Spring Boot para la API
- PostgreSQL y Flyway para guardar la informacion
- Maven, npm y Docker Compose para el entorno local

Preparar en Windows

Abre VS Code en la carpeta raiz y ejecuta:

```powershell
.\scripts\checkEnvironment.ps1
.\scripts\initLocalEnv.ps1
docker compose up -d db
docker compose ps
```

El archivo .env contiene las contrasenas locales de PostgreSQL y las cuentas iniciales. El script crea dos cuentas con correos admin@hvac.local y desarrollador@hvac.local y contrasenas aleatorias. Puedes verlas con Get-Content .env, pero no compartas este archivo ni publiques capturas con sus contrasenas.

Si ya tenias .env, el script agrega solo las variables que falten. La primera vez que Spring Boot inicia crea las cuentas iniciales. No vuelve a cambiar sus contrasenas al reiniciar.

Iniciar backend

En una terminal distinta, desde la carpeta principal:

```powershell
.\scripts\startBackend.ps1
```

El proceso permanece abierto. Cuando aparezca Started HvacApplication y Tomcat started on port 8080, el backend esta listo. No cierres esa terminal.

Iniciar frontend

En otra terminal:

```powershell
cd frontend
npm.cmd install
npm.cmd run testAll
npm.cmd run dev
```

Abre http://127.0.0.1:5173

Usa npm.cmd run dev para que las cuentas y operaciones llamen al backend real. El comando devDemo conserva el simulador de catalogo y cotizaciones, pero no sirve para probar las cuentas empresariales.

Comprobar y compilar

```powershell
cd backend
mvn clean test
```

En el frontend:

```powershell
cd ..\frontend
npm.cmd run testAll
npm.cmd run build
```

Prueba automatica del recorrido

Con la API abierta, ejecuta desde la carpeta principal:

```powershell
.\scripts\smokePortal.ps1
```

La prueba registra un cliente, crea datos de ejemplo, registra una venta que descuenta stock, comprueba el historial privado y crea un trabajador con un subrol. ATENCION: crea registros reales en la base local, asi que no la ejecutes sobre una base empresarial.

Recorrido manual

1. En Mi cuenta, registrate. Tu rol sera Cliente.
2. Cierra sesion e ingresa con admin@hvac.local y la contrasena local de .env.
3. Registra una marca, un producto y asigna su stock.
4. Crea proveedores, clientes, trabajos y visitas desde el panel lateral.
5. Registra un pedido con un producto y comprueba que las unidades bajen.
6. En Subroles de trabajo crea un perfil y selecciona los permisos.
7. En Usuarios y permisos crea una cuenta de Trabajador y asigna ese subrol.
8. Inicia sesion como el trabajador y comprueba que no tenga acceso a secciones no autorizadas.
9. Con la cuenta del cliente, revisa Mis pedidos, Mis trabajos y Mis solicitudes.
10. Con la cuenta de desarrollador puedes crear espacios empresariales con administradores iniciales.

Cambios recientes

- Registro publico y acceso por cuentas
- Contraseñas cifradas y sesiones revocables
- Espacios separados para cliente, trabajador, administrador y desarrollador
- Permisos individuales y subroles de trabajadores
- Inventario y ventas con descuento de stock desde la API
- Marcas, clientes, proveedores, agenda, trabajos y pedidos persistentes
- Resumenes internos y registro de actividad
- Se conserva el sitio publico y footer compartido

Alcance actual

Este avance esta pensado para pruebas locales de procesos con informacion ficticia. El backend protege operaciones por cuenta y empresa, pero la experiencia multiempresa del sitio publico todavia se limita a HVAC Controls. Falta integrar archivos e informes reales, recuperacion de contrasenas por correo, verificacion de email, pruebas de seguridad, despliegue HTTPS, copias de respaldo y validaciones con la empresa antes de utilizar datos reales.

El administrador inicial se crea desde variables locales; no existe un formulario publico para hacerse administrador. Las claves de cuentas creadas por el administrador deben compartirse por canales seguros.
