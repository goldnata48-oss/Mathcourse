param(
  [int]$Port = 8000
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$url = "http://localhost:$Port/"

$listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if($listener){
  Start-Process $url
  Write-Host "Mathcourse already running at $url"
  exit 0
}

Start-Process $url
Write-Host "Mathcourse running at $url"
Write-Host "Press Ctrl+C in this terminal to stop the server."
Push-Location $root
try {
  python -m http.server $Port --bind 127.0.0.1
}
finally {
  Pop-Location
}
