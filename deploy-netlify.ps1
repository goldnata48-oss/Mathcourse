param(
  [string]$Site = "roaring-melba-8c60da",
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$dist = Join-Path $root "dist"

Push-Location $root
try {
  Write-Host "=== 1/2  Build ===" -ForegroundColor Cyan
  node (Join-Path $root "build.js")
  if ($LASTEXITCODE -ne 0) { throw "build.js failed with code $LASTEXITCODE" }

  Write-Host "`n=== dist contents ===" -ForegroundColor DarkGray
  Get-ChildItem $dist | Sort-Object Name | ForEach-Object {
    "  {0,-24} {1,9:N0} bytes" -f $_.Name, $_.Length
  }

  if ($DryRun) {
    Write-Host "`nDry run: deploy skipped." -ForegroundColor Yellow
    exit 0
  }

  Write-Host "`n=== 2/2  Netlify deploy (production) ===" -ForegroundColor Cyan
  Write-Host "Site:   $Site" -ForegroundColor DarkGray
  Write-Host "Folder: $dist" -ForegroundColor DarkGray
  Write-Host "If you are not authorised yet, run:  npx netlify-cli login`n" -ForegroundColor Yellow

  npx --yes netlify-cli@latest deploy --prod --dir="$dist" --site="$Site"
  if ($LASTEXITCODE -ne 0) { throw "netlify deploy failed with code $LASTEXITCODE" }

  Write-Host "`nDeployed: https://$Site.netlify.app/" -ForegroundColor Green
}
finally {
  Pop-Location
}
