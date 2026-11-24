# Prueba de integracion que crea registros de prueba en la base de datos local.
# Usa credenciales de .env y NO muestra passwords ni tokens por pantalla.
$ErrorActionPreference='Stop'
$root=(Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$values=@{}
foreach ($line in Get-Content (Join-Path $root '.env')) {
  $parts=$line.Split('=',2)
  if ($parts.Length -eq 2 -and -not $parts[0].StartsWith('#')) {$values[$parts[0]]=$parts[1]}
}
if (-not $values['BOOTSTRAP_ADMIN_PASSWORD']) {throw 'Ejecuta .\scripts\initLocalEnv.ps1 y reinicia el backend.'}
$base='http://127.0.0.1:8080/api'
function Invoke-Portal($route,$method='GET',$data=$null,$token=$null) {
  $headers=@{}
  if ($token) {$headers['Authorization']="Bearer $token"}
  if ($data) {return Invoke-RestMethod -Uri "$base$route" -Method $method -Headers $headers -ContentType 'application/json' -Body ($data | ConvertTo-Json -Depth 10)}
  return Invoke-RestMethod -Uri "$base$route" -Method $method -Headers $headers
}
$admin=Invoke-Portal '/auth/login' 'POST' @{email=$values['BOOTSTRAP_ADMIN_EMAIL'];password=$values['BOOTSTRAP_ADMIN_PASSWORD']}
if ($admin.user.role -ne 'ADMIN') {throw 'El inicio de sesion admin no devolvio el rol esperado'}
$mark=[guid]::NewGuid().ToString('N').Substring(0,10)
$client=Invoke-Portal '/auth/register' 'POST' @{name='Cliente de prueba';email="cliente.$mark@hvac.local";password="PruebaCliente2026$mark"}
if ($client.user.role -ne 'CLIENT') {throw 'El registro publico no creo rol CLIENT'}
try {
  $null=Invoke-Portal '/portal/products' 'GET' $null $client.token
  throw 'ERROR: un cliente pudo entrar al inventario de administracion'
} catch {
  if ($_.Exception.Message -like 'ERROR:*') {throw}
  $code=[int]$_.Exception.Response.StatusCode
  if($code -ne 403 -and $code -ne 401) {throw "Respuesta inesperada al probar acceso prohibido: $code"}
}
$brand=Invoke-Portal '/portal/brands' 'POST' @{name="Marca Prueba $mark"} $admin.token
$product=Invoke-Portal '/portal/products' 'POST' @{name="Equipo prueba $mark";type='PRODUCT';sku="TEST-$mark";summary='Equipo para probar el proceso de inventario';category='Prueba';stock=5;brandName="Marca Prueba $mark";active=$true} $admin.token
$order=Invoke-Portal '/portal/orders' 'POST' @{customerId=$client.user.id;itemId=$product.id;quantity=2;unitPrice=120} $admin.token
$stock=(Invoke-Portal '/portal/products' 'GET' $null $admin.token | Where-Object {$_.id -eq $product.id}).stock
if ([int]$stock -ne 3) {throw "Stock incorrecto: $stock (se esperaba 3)"}
$orders=@(Invoke-Portal '/portal/my/orders' 'GET' $null $client.token)
if (-not ($orders | Where-Object {$_.id -eq $order.id})) {throw 'El cliente no puede ver su pedido'}
$supplier=Invoke-Portal '/portal/suppliers' 'POST' @{name="Proveedor Prueba $mark";phone='000000000';contact='Area comercial'} $admin.token
$visit=Invoke-Portal '/portal/appointments' 'POST' @{title="Evaluacion prueba $mark";startsAt=(Get-Date).AddDays(2).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ');address='Direccion de prueba';status='SCHEDULED';customerId=$client.user.id} $admin.token
$job=Invoke-Portal '/portal/jobs' 'POST' @{title="Mantenimiento prueba $mark";description='Trabajo registrado para comprobar historial';status='PENDING';customerId=$client.user.id;quotedAmount=150} $admin.token
$jobs=@(Invoke-Portal '/portal/my/jobs' 'GET' $null $client.token)
if (-not ($jobs | Where-Object {$_.id -eq $job.id})) {throw 'El cliente no puede ver su trabajo'}
$subrole=Invoke-Portal '/portal/subroles' 'POST' @{name="Tecnico $mark";permissions=@('APPOINTMENTS_READ','JOBS_READ','JOBS_WRITE')} $admin.token
$worker=Invoke-Portal '/portal/users' 'POST' @{name='Trabajador de prueba';email="trabajador.$mark@hvac.local";password="PruebaWorker2026$mark";role='WORKER';subroleId=$subrole.id;permissions=@('APPOINTMENTS_READ','JOBS_READ','JOBS_WRITE')} $admin.token
$logged=Invoke-Portal '/auth/login' 'POST' @{email="trabajador.$mark@hvac.local";password="PruebaWorker2026$mark"}
if($logged.user.role -ne 'WORKER') {throw 'Cuenta de trabajador sin rol esperado'}
Write-Host 'OK registro publico CLIENT'
Write-Host 'OK administracion protegida por rol'
Write-Host 'OK alta de marca, producto y proveedor'
Write-Host 'OK venta de 2 unidades: stock 5 -> 3'
Write-Host 'OK historial privado de pedidos y trabajos'
Write-Host 'OK agenda de visita y trabajo'
Write-Host 'OK subrol y usuario trabajador'
Write-Host "Prueba completada con registros $mark. Se guardaron en PostgreSQL local."
