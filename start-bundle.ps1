param(
  [int]$Port = 8001
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$dist = Join-Path $root "dist"
$url = "http://localhost:$Port/"

node (Join-Path $root "build.js")
$listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if($listener){
  Start-Process $url
  Write-Host "Bundled Mathcourse already running at $url"
  exit 0
}

Start-Process $url
Write-Host "Bundled Mathcourse running at $url"
Write-Host "Press Ctrl+C in this terminal to stop the server."
Push-Location $dist
try {
  python -m http.server $Port --bind ::
}
finally {
  Pop-Location
}
