$ErrorActionPreference='Stop'
$root=(Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$path=Join-Path $root '.env'
function New-LocalSecret {
  $bytes=New-Object byte[] 24
  $rng=[System.Security.Cryptography.RandomNumberGenerator]::Create()
  try {$rng.GetBytes($bytes)} finally {$rng.Dispose()}
  return ([BitConverter]::ToString($bytes)).Replace('-','') + 'a1'
}
if (-not (Test-Path $path)) {
  @('DB_USERNAME=hvac_local',"DB_PASSWORD=$(New-LocalSecret)") | Set-Content -Path $path -Encoding ASCII
}
$values=Get-Content $path
if (-not ($values | Where-Object {$_ -match '^BOOTSTRAP_ADMIN_EMAIL='})) {
  Add-Content $path 'BOOTSTRAP_ADMIN_EMAIL=admin@hvac.local' -Encoding ASCII
}
if (-not ($values | Where-Object {$_ -match '^BOOTSTRAP_ADMIN_PASSWORD='})) {
  Add-Content $path "BOOTSTRAP_ADMIN_PASSWORD=$(New-LocalSecret)" -Encoding ASCII
}
if (-not ($values | Where-Object {$_ -match '^BOOTSTRAP_DEVELOPER_EMAIL='})) {
  Add-Content $path 'BOOTSTRAP_DEVELOPER_EMAIL=desarrollador@hvac.local' -Encoding ASCII
}
if (-not ($values | Where-Object {$_ -match '^BOOTSTRAP_DEVELOPER_PASSWORD='})) {
  Add-Content $path "BOOTSTRAP_DEVELOPER_PASSWORD=$(New-LocalSecret)" -Encoding ASCII
}
Write-Host 'Entorno local preparado. Las credenciales iniciales estan en .env (archivo privado).'
Write-Host 'No publiques el archivo .env ni lo incluyas en una captura.'
