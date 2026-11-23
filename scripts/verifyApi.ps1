param([string]$apiBase = 'http://127.0.0.1:8080')
$ErrorActionPreference = 'Stop'
$uri = [Uri]$apiBase
if ($uri.Scheme -ne 'http' -or $uri.Host -notin @('127.0.0.1', 'localhost')) {
  throw 'Esta prueba solo esta permitida contra la API LOCAL por seguridad.'
}
$base = $apiBase.TrimEnd('/')

Write-Host '1. Consultamos el catalogo real...'
$catalog = @(Invoke-RestMethod -Uri "$base/api/catalog" -Method Get -TimeoutSec 15)
$product = $catalog | Where-Object { $_.type -eq 'PRODUCT' } | Select-Object -First 1
$service = $catalog | Where-Object { $_.type -eq 'SERVICE' } | Select-Object -First 1
if ($null -eq $product -or $null -eq $service) { throw 'Faltan productos o servicios en la BD' }
Write-Host "[OK] Catalogo disponible: $($catalog.Count) elementos"

Write-Host '2. Registramos una solicitud con datos ficticios...'
$key = [guid]::NewGuid().ToString()
$payload = @{
  idempotencyKey = $key
  contactName = 'Prueba Local HVAC'
  contactPhone = '+51999900000'
  contactEmail = 'prueba@example.invalid'
  preferredContact = 'WHATSAPP'
  lines = @(
    @{ catalogItemId = $product.id; quantity = 2 },
    @{ catalogItemId = $service.id; quantity = 1 }
  )
} | ConvertTo-Json -Depth 6
$headers = @{ 'Cache-Control' = 'no-store' }
$created = Invoke-RestMethod -Uri "$base/api/solicitudes" -Method Post -ContentType 'application/json' -Headers $headers -Body $payload -TimeoutSec 15
if (-not $created.code -or -not $created.token -or $created.alreadyRegistered) {
  throw 'La respuesta de creacion no es valida'
}
Write-Host "[OK] Solicitud creada: $($created.code)"

Write-Host '3. Consultamos el seguimiento mediante el token privado...'
$lookup = @{ token = $created.token } | ConvertTo-Json
$tracked = Invoke-RestMethod -Uri "$base/api/tracking/lookup" -Method Post -ContentType 'application/json' -Body $lookup -TimeoutSec 15
if ($tracked.code -ne $created.code -or $tracked.status -ne 'REGISTERED' -or @($tracked.lines).Count -ne 2) {
  throw 'El seguimiento no coincide con la solicitud creada'
}
Write-Host '[OK] Seguimiento validado. El token privado NO se imprime.'

Write-Host '4. Repetimos el envio para comprobar idempotencia...'
$retry = Invoke-RestMethod -Uri "$base/api/solicitudes" -Method Post -ContentType 'application/json' -Body $payload -TimeoutSec 15
if (-not $retry.alreadyRegistered -or $retry.code -ne $created.code) {
  throw 'El control de idempotencia no produjo el resultado esperado'
}
Write-Host '[OK] El reintento no creo otra solicitud.'
Write-Host 'Integracion local completada: API, PostgreSQL, registro y seguimiento.'
