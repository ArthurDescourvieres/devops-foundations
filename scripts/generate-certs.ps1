$ErrorActionPreference = "Stop"
$certDir = Join-Path (Split-Path $PSScriptRoot -Parent) "traefik\certs"
if (-not (Get-Command mkcert -ErrorAction SilentlyContinue)) {
    Write-Error "Installe mkcert (https://github.com/FiloSottile/mkcert) puis relance."
}
New-Item -ItemType Directory -Force -Path $certDir | Out-Null
Push-Location $certDir
try {
    $prev = $ErrorActionPreference
    $ErrorActionPreference = "SilentlyContinue"
    mkcert -install 2>&1 | Out-Null
    $ErrorActionPreference = $prev
    mkcert -cert-file local.crt -key-file local.key "*.localhost" localhost 127.0.0.1 ::1
    Write-Host "OK : $certDir\local.crt et local.key"
}
finally {
    Pop-Location
}