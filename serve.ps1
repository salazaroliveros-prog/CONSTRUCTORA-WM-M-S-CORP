param(
  [int]$Port = 5500,
  [string]$Page = 'index.html'
)

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -LiteralPath $root

function Assert-Command($name) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    throw "No se encontró '$name' en PATH. Instala Python 3 o usa otro servidor local."
  }
}

Assert-Command 'python'

try {
  # Usa el servidor integrado de Python.
  $server = Start-Process -FilePath 'python' -ArgumentList @('-m','http.server',"$Port") -WorkingDirectory $root -PassThru -WindowStyle Hidden

  $url = "http://localhost:$Port/$Page"
  Write-Host "Servidor iniciado en $url" -ForegroundColor Green
  Start-Process $url | Out-Null

  Write-Host "Presiona ENTER para detener el servidor..." -ForegroundColor Yellow
  [void][Console]::ReadLine()
}
finally {
  if ($server -and -not $server.HasExited) {
    try { Stop-Process -Id $server.Id -Force -ErrorAction SilentlyContinue } catch {}
  }
}
