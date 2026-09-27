param(
  [Parameter(Mandatory = $true)] [string] $RepoRoot,
  [Parameter(Mandatory = $true)] [string] $PlanPath,
  [Parameter(Mandatory = $true)] [ValidateSet('en', 'fr')] [string] $Language
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
  $matches = @($Shapes | Where-Object { (Shape-Text $_) -eq (Normalize-Text $Expected) })
  if ($matches.Count -ne 1) {
    throw "$Context : attendu une seule forme contenant '$Expected', trouve $($matches.Count). Source PPTX peut-etre perimee."
  }
  return $matches[0]
}

function Badge-Shapes($Shapes, $Body, [string] $ExpectedLabel, [string] $Context) {
  $left = [double] $Body.Left
  $top = [double] $Body.Top
  $candidates = @($Shapes | Where-Object {
    [double]$_.Left -lt ($left - 8) -and
    [Math]::Abs([double]$_.Top - $top) -le 12 -and
    [double]$_.Width -ge 30 -and [double]$_.Width -le 55
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
  if ($tables.Count -ne 1) { throw "$Context : un seul tableau est attendu, $($tables.Count) trouve(s)." }
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

function Check-Presentation($Presentation, $Plan, [bool] $Animated, [string] $LanguageCode) {
  if ($Presentation.Slides.Count -ne 30) {
    throw "$LanguageCode : 30 diapositives attendues, $($Presentation.Slides.Count) trouvees."
  }
  foreach ($entry in $Plan.slides) {
    $slide = $Presentation.Slides.Item([int]$entry.number)
    $shapes = Shapes-On $slide
    $heading = Unique-Text-Shape $shapes $entry.title "$LanguageCode/S01-$($entry.number) titre"
    $shapeIds = @()
    $triggers = @()
    if ($entry.kind -eq 'cover') {
      $null = Unique-Text-Shape $shapes $entry.subtitle "$LanguageCode/S01-01 sous-titre"
      $context = Unique-Text-Shape $shapes $entry.context "$LanguageCode/S01-01 contexte"
      $shapeIds = @([int]$heading.Id, [int]$context.Id)
      $triggers = @($triggerClick, $triggerWithPrevious)
    } elseif ($entry.kind -eq 'table') {
      $table = Unique-Table-Shape $shapes $entry "$LanguageCode/S01-$($entry.number)"
      $shapeIds = @([int]$table.Id)
      $triggers = @($triggerClick)
    } elseif ($entry.kind -eq 'rows') {
      for ($rowIndex = 0; $rowIndex -lt $entry.rows.Count; $rowIndex++) {
        $row = $entry.rows[$rowIndex]
        $body = Unique-Text-Shape $shapes $row.text "$LanguageCode/S01-$($entry.number) contenu"
        $badge = Badge-Shapes $shapes $body $row.label "$LanguageCode/S01-$($entry.number)"
        if ($rowIndex -gt 0) {
          $shapeIds += @([int]$badge[0].Id, [int]$badge[1].Id, [int]$body.Id)
          $triggers += @($triggerClick, $triggerWithPrevious, $triggerWithPrevious)
        }
      }
    } else {
      throw "$LanguageCode/S01-$($entry.number) : type d animation inconnu."
    }
    $expectedEffects = if ($Animated) { $shapeIds.Count } else { 0 }
    $sequence = $slide.TimeLine.MainSequence
    if ($sequence.Count -ne $expectedEffects) {
      throw "$LanguageCode/S01-$($entry.number) : $expectedEffects effets attendus, $($sequence.Count) trouves."
    }
    if ($Animated) {
      for ($effectNumber = 1; $effectNumber -le $sequence.Count; $effectNumber++) {
        $effect = $sequence.Item($effectNumber)
        if ([int]$effect.Shape.Id -ne [int]$shapeIds[$effectNumber - 1]) {
          throw "$LanguageCode/S01-$($entry.number) : mauvais objet cible sur l'effet $effectNumber."
        }
        if ($effect.Timing.TriggerType -ne $triggers[$effectNumber - 1]) {
          throw "$LanguageCode/S01-$($entry.number) : declencheur incorrect sur l'effet $effectNumber."
        }
      }
    }
  }
}

$root = (Resolve-Path -LiteralPath $RepoRoot).Path
$plan = Get-Content -LiteralPath $PlanPath -Raw -Encoding UTF8 | ConvertFrom-Json
if ($plan.schemaVersion -ne 2 -or $plan.sessionId -ne 's01' -or
    $plan.language -ne $Language -or $plan.slideCount -ne 30 -or
    $plan.slides.Count -ne 30 -or
    ((@($plan.slides | ForEach-Object { [int]$_.number }) -join ',') -ne ((1..30) -join ','))) {
  throw 'Plan d animation S01 incompatible avec ce script.'
}
$inputPath = Join-Path $root ".artifacts/teaching-sessions/s01/$Language/session.pptx"
$outputPath = Join-Path $root ".artifacts/teaching-sessions/s01/$Language/session-animated.pptx"
if (-not (Test-Path -LiteralPath $inputPath -PathType Leaf)) {
  throw "PPTX S01 $Language absent : executer la construction avant l animation."
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
      # Seule la copie provisoire est ouverte ; le support canonique reste intact.
      $presentation = $app.Presentations.Open($temporaryPath, $falseState, $falseState, $falseState)
      Check-Presentation $presentation $plan $false $Language
      foreach ($entry in $plan.slides) {
        $slide = $presentation.Slides.Item([int]$entry.number)
        $shapes = Shapes-On $slide
        $sequence = $slide.TimeLine.MainSequence
        if ($entry.kind -eq 'cover') {
          $heading = Unique-Text-Shape $shapes $entry.title "$Language/S01-01"
          $null = Unique-Text-Shape $shapes $entry.subtitle "$Language/S01-01"
          $context = Unique-Text-Shape $shapes $entry.context "$Language/S01-01"
          Add-Fade $sequence $heading $triggerClick
          Add-Fade $sequence $context $triggerWithPrevious
        } elseif ($entry.kind -eq 'table') {
          $table = Unique-Table-Shape $shapes $entry "$Language/S01-$($entry.number)"
          Add-Fade $sequence $table $triggerClick
        } else {
          for ($rowIndex = 1; $rowIndex -lt $entry.rows.Count; $rowIndex++) {
            $row = $entry.rows[$rowIndex]
            $body = Unique-Text-Shape $shapes $row.text "$Language/S01-$($entry.number)"
            $badge = Badge-Shapes $shapes $body $row.label "$Language/S01-$($entry.number)"
            Add-Fade $sequence $badge[0] $triggerClick
            Add-Fade $sequence $badge[1] $triggerWithPrevious
            Add-Fade $sequence $body $triggerWithPrevious
          }
        }
      }
      Check-Presentation $presentation $plan $true $Language
      $presentation.Save()
      $presentation.Close()
      $presentation = $null

      # Contrôle de la copie après sauvegarde, y compris l'ordre des clics.
      $check = $app.Presentations.Open($temporaryPath, $trueState, $falseState, $falseState)
      Check-Presentation $check $plan $true $Language
      $check.Close()
      $check = $null

      if (Test-Path -LiteralPath $outputPath) {
        # La copie précédente reste disponible si le remplacement échoue.
        [IO.File]::Replace($temporaryPath, $outputPath, $backupPath, $true)
        Remove-Item -LiteralPath $backupPath -Force
      } else {
        Move-Item -LiteralPath $temporaryPath -Destination $outputPath
      }
      $clicks = 0
      $effects = 0
      foreach ($entry in $plan.slides) {
        $count = if ($entry.kind -eq 'rows') { $entry.rows.Count - 1 } else { 1 }
        $clicks += $count
        $effects += $(if ($entry.kind -eq 'rows') { 3 * $count } elseif ($entry.kind -eq 'cover') { 2 } else { 1 })
      }
      Write-Output "PASS $Language diapositives_animees=30 clics=$clicks effets=$effects sortie=$outputPath"
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
