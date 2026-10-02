param(
  [string]$Site = "roaring-melba-8c60da",
  [string]$SiteId = "d974b04c-3fc0-4771-8817-2fcb19521a5c",
  [string]$Title,
  [string]$Message,
  [switch]$SkipBuild,
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$dist = Join-Path $root "dist"

Push-Location $root
try {
  if (-not $SkipBuild) {
    Write-Host "=== 1/2  Build ===" -ForegroundColor Cyan
    node (Join-Path $root "build.js")
    if ($LASTEXITCODE -ne 0) { throw "build.js failed with code $LASTEXITCODE" }
  } else {
    Write-Host "=== 1/2  Build skipped ===" -ForegroundColor DarkGray
  }

  Write-Host "`n=== dist contents ===" -ForegroundColor DarkGray
  Get-ChildItem $dist | Sort-Object Name | ForEach-Object {
    "  {0,-24} {1,9:N0} bytes" -f $_.Name, $_.Length
  }

  Write-Host "`n=== 2/2  Netlify deploy (production) ===" -ForegroundColor Cyan
  Write-Host "Site:   $Site ($SiteId)" -ForegroundColor DarkGray
  Write-Host "Folder: $dist" -ForegroundColor DarkGray

  $deployArgs = @(
    (Join-Path $root "tools\deploy.js"),
    "--site=$Site",
    "--site-id=$SiteId",
    "--dir=$dist"
  )
  if ($Title) { $deployArgs += "--title=$Title" }
  if ($Message) { $deployArgs += "--message=$Message" }
  if ($DryRun) { $deployArgs += "--dry-run" }

  node @deployArgs
  if ($LASTEXITCODE -ne 0) { throw "tools/deploy.js failed with code $LASTEXITCODE" }

  if (-not $DryRun) {
    Write-Host "`nProduction: https://$Site.netlify.app/" -ForegroundColor Green
  }
}
finally {
  Pop-Location
}
