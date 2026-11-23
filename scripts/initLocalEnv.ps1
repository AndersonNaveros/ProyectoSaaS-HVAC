$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$path = Join-Path $root '.env'
if (Test-Path $path) {
  Write-Host 'Ya existe .env. Lo mantenemos sin sobrescribir.'
  exit 0
}
$bytes = New-Object byte[] 24
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
try { $rng.GetBytes($bytes) } finally { $rng.Dispose() }
$password = ([BitConverter]::ToString($bytes)).Replace('-', '')
@(
  'DB_USERNAME=hvac_local',
  "DB_PASSWORD=$password"
) | Set-Content -Path $path -Encoding ASCII
Write-Host 'Archivo .env creado con credenciales locales. Nunca lo subas a Git.'
