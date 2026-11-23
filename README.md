# HVAC Solutions V1.4 (en desarrollo)

Estamos construyendo un sistema web para ordenar las cotizaciones de productos y servicios tecnicos de HVAC. Nuestro primer cliente de referencia es HVAC Controls.

En la V1.3 avanzamos el frontend y un modo demo. Ahora en la V1.4 queremos conectar React con Spring Boot y guardar solicitudes en PostgreSQL. Por el momento, el proyecto no esta listo para recibir datos reales de clientes.

## Que usamos

- React, JavaScript y Vite en el frontend
- Java y Spring Boot en el backend
- PostgreSQL y Flyway para los datos
- Docker Compose para iniciar la base local
- Maven y npm para compilar y ejecutar

## Primero revisamos las herramientas

Abre PowerShell en la carpeta principal del proyecto:

```powershell
.\scripts\checkEnvironment.ps1
```

Si falta Docker Desktop, instalalo y comprueba que WSL 2 este disponible. No continuamos con el modo real hasta que Docker Engine este iniciado.

## Iniciamos PostgreSQL

```powershell
.\scripts\initLocalEnv.ps1
docker compose up -d db
docker compose ps
```

El primer comando crea nuestro archivo .env con una contrasena local aleatoria. No subimos ese archivo a GitHub.

## Ejecutamos el backend

En otra terminal, desde la carpeta principal:

```powershell
.\scripts\startBackend.ps1
```

Ese script lee las credenciales de .env e inicia Java en el puerto 8080. Flyway aplica las migraciones cuando la BD esta disponible. Si la BD tarda en iniciar, revisa `docker compose ps` antes de volver a ejecutar Java.

## Probamos la API

En una tercera terminal, desde la raiz:

```powershell
.\scripts\verifyApi.ps1
```

Esta prueba crea un registro ficticio en la base local, comprueba el seguimiento y prueba que un reintento no duplique la solicitud. Nunca uses datos reales en estas pruebas.

## Encendemos React

```powershell
cd frontend
npm.cmd install
npm.cmd run testAll
npm.cmd run dev
```

Abrimos http://127.0.0.1:5173. El comando `dev` usa la API de Java mediante el proxy de Vite. En cambio, `devDemo` usa las respuestas de `demoApi.js` y no necesita base de datos.

Para compilar el frontend:

```powershell
npm.cmd run build
```

Para compilar el backend sin omitir pruebas:

```powershell
cd ..\backend
mvn clean verify
```

## Lo que cambiamos en esta primera etapa de V1.4

Separamos la comunicacion con la API en `apiClient.js`, agregamos pruebas de errores de red, distinguimos el carrito demo del carrito real y ampliamos los registros ficticios de PostgreSQL con una nueva migracion.

Tambien dejamos scripts para iniciar el entorno y verificar el flujo completo. Todavia debemos probarlos en Windows 11 con Docker, Maven y PostgreSQL instalados. No damos por validada la integracion hasta que esas pruebas pasen en nuestra PC.

## Que sigue

- comprobar todo el flujo React -> API -> PostgreSQL
- mejorar los mensajes de error y la persistencia real
- incorporar control de acceso y gestion interna de forma gradual
- revisar seguridad, permisos y aislamiento antes de publicar el servicio
