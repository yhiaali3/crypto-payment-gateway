# Create a clean ZIP for sale: excludes node_modules, .git, .github, .vscode, .env* and lock files
$root = Get-Location
$excludePatterns = @('\\node_modules\\','\\.git\\','\\.github\\','\\.vscode\\','pnpm-lock.yaml','package-lock.json','\.env','\.env.*')

$files = Get-ChildItem -Recurse -File | Where-Object {
  $p = $_.FullName
  $ok = $true
  foreach ($ex in $excludePatterns) { if ($p -match $ex) { $ok = $false; break } }
  $ok
}

$dest = Join-Path $root 'crypto-payment-gateway-sale.zip'
if (Test-Path $dest) { Remove-Item $dest }

# Compress selected files
Compress-Archive -Path ($files | ForEach-Object { $_.FullName }) -DestinationPath $dest
Write-Host "Created sale ZIP: $dest"