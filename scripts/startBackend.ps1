$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$envPath = Join-Path $root '.env'
if (-not (Test-Path $envPath)) {
  throw 'No existe .env. Ejecuta primero .\scripts\initLocalEnv.ps1'
}
$values = @{}
foreach ($line in Get-Content $envPath) {
  if ($line.Trim() -eq '' -or $line.Trim().StartsWith('#')) { continue }
  $parts = $line.Split('=', 2)
  if ($parts.Length -eq 2) { $values[$parts[0].Trim()] = $parts[1].Trim() }
}
if (-not $values.ContainsKey('DB_USERNAME') -or -not $values.ContainsKey('DB_PASSWORD')) {
  throw 'El .env debe contener DB_USERNAME y DB_PASSWORD'
}
$env:DB_URL = 'jdbc:postgresql://127.0.0.1:5433/hvac_local'
$env:DB_USERNAME = $values['DB_USERNAME']
$env:DB_PASSWORD = $values['DB_PASSWORD']
foreach ($name in @('BOOTSTRAP_ADMIN_EMAIL','BOOTSTRAP_ADMIN_PASSWORD','BOOTSTRAP_DEVELOPER_EMAIL','BOOTSTRAP_DEVELOPER_PASSWORD')) {
  if ($values.ContainsKey($name)) { [Environment]::SetEnvironmentVariable($name, $values[$name], 'Process') }
}
Write-Host 'Iniciando Spring Boot en localhost:8080 con la BD local...'
Push-Location (Join-Path $root 'backend')
try { & mvn spring-boot:run } finally { Pop-Location }
