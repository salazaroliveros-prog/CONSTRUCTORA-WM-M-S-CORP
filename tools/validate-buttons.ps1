<#
  Static UI handler audit (PowerShell):
  - For each HTML file, extracts onclick handlers and verifies the function exists
    in inline scripts or in local external scripts referenced by that HTML.
  - Also checks that IDs used by getElementById/querySelector("#id") exist in HTML.

  Usage:
    powershell -ExecutionPolicy Bypass -File tools\validate-buttons.ps1
#>

$ErrorActionPreference = 'Stop'

$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path

function Read-Text([string]$path) {
  return Get-Content -LiteralPath $path -Raw -Encoding UTF8
}

function Get-HtmlFiles {
  Get-ChildItem -LiteralPath $root -Filter '*.html' -File | Sort-Object FullName
}

function Get-OnclickHandlers([string]$html) {
  $handlers = @()
  $re = [regex]::new('\bonclick\s*=\s*("|\'')(?<code>[\s\S]*?)\1', 'IgnoreCase')
  foreach ($m in $re.Matches($html)) {
    $code = [string]$m.Groups['code'].Value
    $code = $code.Trim()
    if (-not $code) { continue }
    $m2 = [regex]::Match($code, '^(?:return\s+)?(?<fn>[A-Za-z_$][\w$]*)\s*(?:\(|;|$)')
    if ($m2.Success) {
      $handlers += [pscustomobject]@{ fn = $m2.Groups['fn'].Value; code = $code }
    }
  }
  return $handlers
}

function Get-InlineScripts([string]$html) {
  $blocks = @()
  $re = [regex]::new('<script\b(?![^>]*\bsrc=)[^>]*>(?<code>[\s\S]*?)<\/script>', 'IgnoreCase')
  foreach ($m in $re.Matches($html)) {
    $blocks += [string]$m.Groups['code'].Value
  }
  return $blocks
}

function Get-LocalScriptPaths([string]$html) {
  $paths = @()
  $re = [regex]::new('<script\b[^>]*\bsrc\s*=\s*("|\'')(?<src>[^"\'']+)\1[^>]*>\s*<\/script>', 'IgnoreCase')
  foreach ($m in $re.Matches($html)) {
    $src = [string]$m.Groups['src'].Value
    $src = $src.Trim()
    if (-not $src) { continue }
    if ($src -match '^(https?:)?\/\/') { continue }
    $src = $src -replace '^\./',''
    $p = Join-Path $root $src
    if (Test-Path -LiteralPath $p) { $paths += (Resolve-Path -LiteralPath $p).Path }
  }
  return $paths
}

function Get-LocalCssPaths([string]$html) {
  $paths = @()
  $re = [regex]::new('<link\b[^>]*\brel\s*=\s*("|\'')stylesheet\1[^>]*\bhref\s*=\s*("|\'')(?<href>[^"\'']+)\2[^>]*>', 'IgnoreCase')
  foreach ($m in $re.Matches($html)) {
    $href = [string]$m.Groups['href'].Value
    $href = $href.Trim()
    if (-not $href) { continue }
    if ($href -match '^(https?:)?\/\/') { continue }
    $href = $href -replace '^\./',''
    $p = Join-Path $root $href
    if (Test-Path -LiteralPath $p) { $paths += (Resolve-Path -LiteralPath $p).Path } else { $paths += $p }
  }
  return $paths
}

function Function-Exists([string]$fn, [string]$source) {
  if (-not $fn) { return $false }
  $patterns = @(
    "\bfunction\s+$fn\b",
    "\b$fn\s*=\s*function\b",
    "\bconst\s+$fn\s*=\s*\(",
    "\blet\s+$fn\s*=\s*\(",
    "\bvar\s+$fn\s*=\s*\(",
    "\bwindow\.$fn\s*=",
    "\b$fn\s*:\s*function\b"
  )
  foreach ($p in $patterns) {
    if ($source -match $p) { return $true }
  }
  return $false
}

function Get-Ids([string]$html) {
  $ids = New-Object 'System.Collections.Generic.HashSet[string]'
  $re = [regex]::new('\bid\s*=\s*("|\'')(?<id>[A-Za-z][\w\-:\.]*)\1', 'IgnoreCase')
  foreach ($m in $re.Matches($html)) {
    $null = $ids.Add($m.Groups['id'].Value)
  }
  return $ids
}

function Get-IdReferencesFromScripts([string[]]$sources) {
  $refs = New-Object 'System.Collections.Generic.HashSet[string]'
  foreach ($s in $sources) {
    # getElementById('foo') / getElementById("foo")
    foreach ($m in [regex]::Matches($s, 'getElementById\(\s*[\''"](?<id>[^\''"]+)[\''"]\s*\)', 'IgnoreCase')) {
      $null = $refs.Add($m.Groups['id'].Value)
    }
    # querySelector('#foo')
    foreach ($m in [regex]::Matches($s, 'querySelector\(\s*[\''"]#(?<id>[A-Za-z][\w\-:\.]*)[\''"]\s*\)', 'IgnoreCase')) {
      $null = $refs.Add($m.Groups['id'].Value)
    }
  }
  return $refs
}

$missingHandlers = @()
$missingIds = @()
$missingFiles = @()

foreach ($file in Get-HtmlFiles) {
  $html = Read-Text $file.FullName
  $onclicks = Get-OnclickHandlers $html
  $inline = Get-InlineScripts $html
  $scriptPaths = Get-LocalScriptPaths $html
  $cssPaths = Get-LocalCssPaths $html

  foreach ($p in $scriptPaths) {
    if (-not (Test-Path -LiteralPath $p)) {
      $missingFiles += [pscustomobject]@{ file = $file.Name; kind = 'script'; path = $p }
    }
  }
  foreach ($p in $cssPaths) {
    if (-not (Test-Path -LiteralPath $p)) {
      $missingFiles += [pscustomobject]@{ file = $file.Name; kind = 'css'; path = $p }
    }
  }

  $sources = @()
  $sources += $inline
  foreach ($p in $scriptPaths) {
    try { $sources += (Read-Text $p) } catch { }
  }

  foreach ($h in $onclicks) {
    $ok = $false
    foreach ($src in $sources) {
      if (Function-Exists $h.fn $src) { $ok = $true; break }
    }
    if (-not $ok) {
      $missingHandlers += [pscustomobject]@{
        file = $file.Name
        fn = $h.fn
        example = $h.code
      }
    }
  }

  # IDs: validar solo contra scripts inline del HTML para evitar falsos positivos
  $ids = Get-Ids $html
  $idRefs = Get-IdReferencesFromScripts $inline
  foreach ($id in $idRefs) {
    if ($id -match '\$\{') { continue }
    if (-not $ids.Contains($id)) {
      $missingIds += [pscustomobject]@{
        file = $file.Name
        id = $id
      }
    }
  }
}

if ($missingHandlers.Count -eq 0 -and $missingIds.Count -eq 0 -and $missingFiles.Count -eq 0) {
  Write-Output 'OK: No missing onclick handlers and no missing DOM ids found (static audit).'
  exit 0
}

if ($missingHandlers.Count -gt 0) {
  Write-Output "\nMissing onclick handlers:" 
  $missingHandlers | Sort-Object file, fn | Format-Table -AutoSize
}

if ($missingIds.Count -gt 0) {
  Write-Output "\nMissing DOM ids referenced by scripts:" 
  $missingIds | Sort-Object file, id | Select-Object -First 50 | Format-Table -AutoSize
  if ($missingIds.Count -gt 50) {
    Write-Output "(showing first 50 of $($missingIds.Count))"
  }
}

if ($missingFiles.Count -gt 0) {
  Write-Output "\nMissing referenced local files:" 
  $missingFiles | Sort-Object file, kind, path | Format-Table -AutoSize
}

exit 2
