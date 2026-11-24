# Inicio rapido de React desde la carpeta principal del repositorio.
param([switch]$Demo)
$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
$frontendRoot = Join-Path $repoRoot 'frontend'
if (-not (Test-Path (Join-Path $frontendRoot 'package.json'))) {
  throw 'No existe frontend/package.json. Ejecuta desde una copia completa del proyecto.'
}
Push-Location $frontendRoot
try {
  if (-not (Test-Path '.\node_modules\.bin\vite.cmd')) {
    Write-Host 'Instalando dependencias de React y Vite...' -ForegroundColor Cyan
    & npm.cmd install
    if ($LASTEXITCODE -ne 0) { throw 'npm install no termino correctamente.' }
  }
  if ($Demo) { & npm.cmd run devDemo } else { & npm.cmd run dev }
  if ($LASTEXITCODE -ne 0) { throw 'No se pudo iniciar el frontend.' }
} finally {
  Pop-Location
}
