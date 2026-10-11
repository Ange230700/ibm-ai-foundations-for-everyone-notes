param(
  [Parameter(Mandatory = $true)] [string] $RepoRoot,
  [Parameter(Mandatory = $true)] [string] $PlanPath,
  [Parameter(Mandatory = $true)] [ValidateSet('en', 'fr')] [string] $Language,
  [Parameter(Mandatory = $true)] [ValidateSet('s01', 's02', 's03')] [string] $SessionId,
  [Parameter(Mandatory = $true)] [ValidateRange(1, 100)] [int] $SlideCount,
  [Parameter(Mandatory = $true)] [double] $BadgeMinWidth
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

# Valeurs documentées par Microsoft pour l'automatisation PowerPoint.
$effectFade = 10
$triggerClick = 1
$triggerWithPrevious = 2
$trueState = -1
$falseState = 0

function Normalize-Text([string] $Value) {
  return [regex]::Replace($Value.Normalize([Text.NormalizationForm]::FormC), '[\s\u00a0]+', ' ').Trim()
}

function Shape-Text($Shape) {
  if ($Shape.HasTextFrame -eq $trueState -and $Shape.TextFrame.HasText -eq $trueState) {
    return Normalize-Text ([string] $Shape.TextFrame.TextRange.Text)
  }
  return ''
}

function Shapes-On($Slide) {
  $result = @()
  for ($index = 1; $index -le $Slide.Shapes.Count; $index++) {
    $result += $Slide.Shapes.Item($index)
  }
  return ,$result
}

function Unique-Text-Shape($Shapes, [string] $Expected, [string] $Context) {
  $matchingShapes = @($Shapes | Where-Object { (Shape-Text $_) -eq (Normalize-Text $Expected) })
  if ($matchingShapes.Count -ne 1) {
    throw "$Context : attendu une seule forme contenant '$Expected', trouve $($matchingShapes.Count). Source PPTX peut-etre perimee."
  }
  return $matchingShapes[0]
}

function Badge-Shapes($Shapes, $Body, [string] $ExpectedLabel, [string] $Context) {
  $left = [double] $Body.Left
  $top = [double] $Body.Top
  $candidates = @($Shapes | Where-Object {
    $gap = $left - ([double]$_.Left + [double]$_.Width)
    $gap -ge 6 -and $gap -le 30 -and
    [Math]::Abs([double]$_.Top - $top) -le 12 -and
    [double]$_.Width -ge $BadgeMinWidth -and [double]$_.Width -le 55
  })
  $label = @($candidates | Where-Object { (Shape-Text $_) -eq $ExpectedLabel })
  $background = @($candidates | Where-Object {
    (Shape-Text $_) -eq '' -and [double]$_.Height -gt 20
  })
  if ($label.Count -ne 1 -or $background.Count -ne 1) {
    throw "$Context : etiquette ou fond de ligne introuvable ($($label.Count), $($background.Count))."
  }
  return @($background[0], $label[0])
}

function Add-Fade($Sequence, $Shape, [int] $Trigger) {
  # Les arguments optionnels sont fournis explicitement pour PowerShell COM.
  $effect = $Sequence.AddEffect($Shape, $effectFade, 0, $Trigger, -1)
  $effect.Timing.Duration = 0.35
}

function Unique-Table-Shape($Shapes, $Entry, [string] $Context) {
  $tables = @($Shapes | Where-Object { $_.HasTable -eq $trueState })
  if ($tables.Count -ne 1) {
    throw "$Context : un seul tableau est attendu, $($tables.Count) trouve(s)."
  }
  $shape = $tables[0]
  $table = $shape.Table
  if ($table.Columns.Count -ne $Entry.headers.Count -or $table.Rows.Count -ne ($Entry.rows.Count + 1)) {
    throw "$Context : dimensions du tableau differentes du contenu pedagogique."
  }
  for ($row = 1; $row -le $table.Rows.Count; $row++) {
    for ($column = 1; $column -le $table.Columns.Count; $column++) {
      $expected = if ($row -eq 1) { $Entry.headers[$column - 1] } else { $Entry.rows[$row - 2][$column - 1] }
      $actual = Normalize-Text ([string] $table.Cell($row, $column).Shape.TextFrame.TextRange.Text)
      if ($actual -ne (Normalize-Text ([string]$expected))) {
        throw "$Context : cellule $row/$column differente de la source."
      }
    }
  }
  return $shape
}

function Get-AnimationDefinition($Shapes, $Entry, [string] $Context) {
  switch ($Entry.kind) {
    'cover' {
      $heading = Unique-Text-Shape $Shapes $Entry.title "$Context titre"
      $null = Unique-Text-Shape $Shapes $Entry.subtitle "$Context sous-titre"
      $body = Unique-Text-Shape $Shapes $Entry.context "$Context contexte"
      return @{
        ShapeIds = @([int]$heading.Id, [int]$body.Id)
        Triggers = @($triggerClick, $triggerWithPrevious)
      }
    }
    'table' {
      $table = Unique-Table-Shape $Shapes $Entry $Context
      return @{ ShapeIds = @([int]$table.Id); Triggers = @($triggerClick) }
    }
    'rows' {
      $shapeIds = @()
      $triggers = @()
      for ($rowIndex = 0; $rowIndex -lt $Entry.rows.Count; $rowIndex++) {
        $row = $Entry.rows[$rowIndex]
        $body = Unique-Text-Shape $Shapes $row.text "$Context contenu"
        $badge = Badge-Shapes $Shapes $body $row.label $Context
        if ($rowIndex -gt 0) {
          $shapeIds += @([int]$badge[0].Id, [int]$badge[1].Id, [int]$body.Id)
          $triggers += @($triggerClick, $triggerWithPrevious, $triggerWithPrevious)
        }
      }
      return @{ ShapeIds = $shapeIds; Triggers = $triggers }
    }
    default { throw "$Context : type d animation inconnu." }
  }
}

function Assert-AnimationSequence($Sequence, $Definition, [string] $Context) {
  for ($effectNumber = 1; $effectNumber -le $Sequence.Count; $effectNumber++) {
    $effect = $Sequence.Item($effectNumber)
    if ([int]$effect.Shape.Id -ne [int]$Definition.ShapeIds[$effectNumber - 1]) {
      throw "$Context : mauvais objet cible sur l'effet $effectNumber."
    }
    if ($effect.Timing.TriggerType -ne $Definition.Triggers[$effectNumber - 1]) {
      throw "$Context : declencheur incorrect sur l'effet $effectNumber."
    }
  }
}

function Check-Presentation($Presentation, $Plan, [bool] $Animated, [string] $LanguageCode) {
  if ($Presentation.Slides.Count -ne $SlideCount) {
    throw "$LanguageCode : $SlideCount diapositives attendues, $($Presentation.Slides.Count) trouvees."
  }
  foreach ($entry in $Plan.slides) {
    $context = "$LanguageCode/$($SessionId.ToUpper())-$($entry.number)"
    $slide = $Presentation.Slides.Item([int]$entry.number)
    $definition = Get-AnimationDefinition (Shapes-On $slide) $entry $context
    $expectedEffects = if ($Animated) { $definition.ShapeIds.Count } else { 0 }
    $sequence = $slide.TimeLine.MainSequence
    if ($sequence.Count -ne $expectedEffects) {
      throw "$context : $expectedEffects effets attendus, $($sequence.Count) trouves."
    }
    if ($Animated) {
      Assert-AnimationSequence $sequence $definition $context
    }
  }
}

function Add-EntryAnimation($Slide, $Entry, [string] $Context) {
  $shapes = Shapes-On $Slide
  $sequence = $Slide.TimeLine.MainSequence
  $definition = Get-AnimationDefinition $shapes $Entry $Context
  for ($index = 0; $index -lt $definition.ShapeIds.Count; $index++) {
    $shapeId = $definition.ShapeIds[$index]
    $shape = @($shapes | Where-Object { [int]$_.Id -eq [int]$shapeId })[0]
    Add-Fade $sequence $shape $definition.Triggers[$index]
  }
}

function Add-PresentationAnimations($Presentation, $Plan, [string] $LanguageCode) {
  foreach ($entry in $Plan.slides) {
    $slide = $Presentation.Slides.Item([int]$entry.number)
    Add-EntryAnimation $slide $entry "$LanguageCode/$($SessionId.ToUpper())-$($entry.number)"
  }
}

function Get-IOException($ErrorRecord) {
  $cause = $ErrorRecord.Exception
  while ($null -ne $cause -and $cause -isnot [IO.IOException]) {
    $cause = $cause.InnerException
  }
  return $cause
}

function Publish-Presentation([string] $TemporaryPath, [string] $OutputPath, [string] $BackupPath) {
  if (-not (Test-Path -LiteralPath $OutputPath)) {
    Move-Item -LiteralPath $TemporaryPath -Destination $OutputPath
    return $OutputPath
  }
  for ($attempt = 1; $attempt -le 4; $attempt++) {
    try {
      [IO.File]::Replace($TemporaryPath, $OutputPath, $BackupPath, $true)
      try { Remove-Item -LiteralPath $BackupPath -Force }
      catch { Write-Warning "Ancienne copie a nettoyer plus tard : $BackupPath" }
      return $OutputPath
    }
    catch {
      $cause = Get-IOException $_
      if ($null -eq $cause) { throw }
      if ($attempt -lt 4) { Start-Sleep -Milliseconds 500 }
    }
  }
  $reviewPath = Join-Path (Split-Path -Parent $OutputPath) (
    "session-animated-review-" + [guid]::NewGuid().ToString('N') + '.pptx'
  )
  Move-Item -LiteralPath $TemporaryPath -Destination $reviewPath
  Write-Warning "Copie canonique verrouillee : $OutputPath. Nouvelle copie verifiee : $reviewPath"
  return $reviewPath
}

function Get-AnimationStatistics($Plan) {
  $clicks = 0
  $effects = 0
  foreach ($entry in $Plan.slides) {
    $count = if ($entry.kind -eq 'rows') { $entry.rows.Count - 1 } else { 1 }
    $clicks += $count
    $effects += if ($entry.kind -eq 'rows') { 3 * $count } elseif ($entry.kind -eq 'cover') { 2 } else { 1 }
  }
  return @{ Clicks = $clicks; Effects = $effects }
}

function Assert-Plan($Plan) {
  $numbers = @($Plan.slides | ForEach-Object { [int]$_.number }) -join ','
  if ($Plan.schemaVersion -ne 2 -or $Plan.sessionId -ne $SessionId -or
      $Plan.language -ne $Language -or $Plan.slideCount -ne $SlideCount -or
      $Plan.slides.Count -ne $SlideCount -or $numbers -ne ((1..$SlideCount) -join ',')) {
    throw "Plan d animation $($SessionId.ToUpper()) incompatible avec ce script."
  }
}

$root = (Resolve-Path -LiteralPath $RepoRoot).Path
$plan = Get-Content -LiteralPath $PlanPath -Raw -Encoding UTF8 | ConvertFrom-Json
Assert-Plan $plan
$inputPath = Join-Path $root ".artifacts/teaching-sessions/$SessionId/$Language/session.pptx"
$outputPath = Join-Path $root ".artifacts/teaching-sessions/$SessionId/$Language/session-animated.pptx"
if (-not (Test-Path -LiteralPath $inputPath -PathType Leaf)) {
  throw "PPTX $($SessionId.ToUpper()) $Language absent : executer la construction avant l animation."
}
$temporaryPath = Join-Path (Split-Path -Parent $outputPath) ("session-animated-" + [guid]::NewGuid().ToString('N') + '.pptx')
$backupPath = Join-Path (Split-Path -Parent $outputPath) ("session-animated-backup-" + [guid]::NewGuid().ToString('N') + '.pptx')

$app = $null
$ownsApp = $false
try {
  try { $app = [Runtime.InteropServices.Marshal]::GetActiveObject('PowerPoint.Application') }
  catch { $app = New-Object -ComObject PowerPoint.Application; $ownsApp = $true }

  $presentation = $null
  $check = $null
  try {
    Copy-Item -LiteralPath $inputPath -Destination $temporaryPath
    $presentation = $app.Presentations.Open($temporaryPath, $falseState, $falseState, $falseState)
    Check-Presentation $presentation $plan $false $Language
    Add-PresentationAnimations $presentation $plan $Language
    Check-Presentation $presentation $plan $true $Language
    $presentation.Save()
    $presentation.Close()
    $presentation = $null

    $check = $app.Presentations.Open($temporaryPath, $trueState, $falseState, $falseState)
    Check-Presentation $check $plan $true $Language
    $check.Close()
    $check = $null

    $publishedPath = Publish-Presentation $temporaryPath $outputPath $backupPath
    $statistics = Get-AnimationStatistics $plan
    $status = if ($publishedPath -eq $outputPath) { 'PASS' } else { 'REVUE' }
    Write-Output "$status $Language diapositives_animees=$SlideCount clics=$($statistics.Clicks) effets=$($statistics.Effects) sortie=$publishedPath"
    Write-Output "ANIMATION_OUTPUT_FILE=$([IO.Path]::GetFileName($publishedPath))"
  }
  finally {
    if ($null -ne $check) { $check.Close() }
    if ($null -ne $presentation) { $presentation.Close() }
    if (Test-Path -LiteralPath $temporaryPath) {
      Remove-Item -LiteralPath $temporaryPath -Force
    }
  }
}
finally {
  if ($null -ne $app) {
    if ($ownsApp) { $app.Quit() }
    [void][Runtime.InteropServices.Marshal]::ReleaseComObject($app)
  }
}
