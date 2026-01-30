# PowerShell script to convert SVG files to PNG and JPG in multiple sizes.
# Requires either ImageMagick (`magick`) or Inkscape CLI to be installed on the system.

$svgDir = Join-Path $PSScriptRoot "..\assets\screenshots"
$outputDir = Join-Path $PSScriptRoot "..\assets\screenshots\exported"
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

$sizes = @(
  @{ name = '1200x628'; w = 1200; h = 628 },
  @{ name = '1600x900'; w = 1600; h = 900 },
  @{ name = '800x600';  w = 800;  h = 600 }
)

$svgs = Get-ChildItem -Path $svgDir -Filter *.svg -File
if ($svgs.Count -eq 0) { Write-Host "No SVG files found in $svgDir"; exit 0 }

function Convert-WithMagick($svgPath, $outPath, $w, $h) {
  $cmd = "magick convert -background none -resize ${w}x${h} `"$svgPath`" `"$outPath`""
  Write-Host "Running: $cmd"
  & magick convert -background none -resize ${w}x${h} $svgPath $outPath
}

function Convert-WithInkscape($svgPath, $outPath, $w, $h) {
  # Newer Inkscape uses --export-type and --export-filename
  $cmd = "inkscape `"$svgPath`" --export-filename=`"$outPath`" --export-width=$w --export-height=$h"
  Write-Host "Running: $cmd"
  & inkscape $svgPath --export-filename=$outPath --export-width=$w --export-height=$h
}

foreach ($svg in $svgs) {
  foreach ($size in $sizes) {
    $base = [System.IO.Path]::GetFileNameWithoutExtension($svg.Name)
    $outPng = Join-Path $outputDir "${base}_${($size.name)}.png"
    $outJpg = Join-Path $outputDir "${base}_${($size.name)}.jpg"

    if (Get-Command magick -ErrorAction SilentlyContinue) {
      Convert-WithMagick $svg.FullName $outPng $size.w $size.h
      Convert-WithMagick $svg.FullName $outJpg $size.w $size.h
    }
    elseif (Get-Command inkscape -ErrorAction SilentlyContinue) {
      Convert-WithInkscape $svg.FullName $outPng $size.w $size.h
      Convert-WithInkscape $svg.FullName $outJpg $size.w $size.h
    }
    else {
      Write-Warning "Neither ImageMagick (magick) nor Inkscape CLI found. Install one of them to perform conversions."
      break
    }
  }
}

Write-Host "Conversion finished. Output: $outputDir"