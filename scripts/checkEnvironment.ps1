$checks = @(
  @{ Name = 'Java'; Command = 'java'; Args = @('-version') },
  @{ Name = 'Maven'; Command = 'mvn'; Args = @('-version') },
  @{ Name = 'Node.js'; Command = 'node'; Args = @('--version') },
  @{ Name = 'npm'; Command = 'npm.cmd'; Args = @('--version') },
  @{ Name = 'Docker'; Command = 'docker'; Args = @('--version') }
)
$missing = @()
foreach ($check in $checks) {
  if (Get-Command $check.Command -ErrorAction SilentlyContinue) {
    Write-Host "[OK] $($check.Name) disponible"
  } else {
    Write-Warning "Falta $($check.Name) ($($check.Command))"
    $missing += $check.Name
  }
}
if (Get-Command docker -ErrorAction SilentlyContinue) {
  try {
    docker compose version
    if ($LASTEXITCODE -ne 0) { throw 'compose no disponible' }
    docker info --format '{{.ServerVersion}}' | Out-Null
    if ($LASTEXITCODE -ne 0) { throw 'motor apagado' }
    Write-Host '[OK] Docker Engine activo'
  } catch {
    Write-Warning 'Docker esta instalado pero el motor o Compose no estan listos. Abre Docker Desktop.'
    $missing += 'Docker Engine / Compose'
  }
}
if ($missing.Count -gt 0) { exit 1 }
Write-Host 'Entorno local listo para iniciar las pruebas de integracion.'
