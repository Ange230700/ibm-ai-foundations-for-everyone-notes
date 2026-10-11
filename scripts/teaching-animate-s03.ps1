param(
  [Parameter(Mandatory = $true)] [string] $RepoRoot,
  [Parameter(Mandatory = $true)] [string] $PlanPath,
  [Parameter(Mandatory = $true)] [ValidateSet('en', 'fr')] [string] $Language
)

& "$PSScriptRoot/teaching-animate.ps1" -RepoRoot $RepoRoot -PlanPath $PlanPath -Language $Language -SessionId s03 -SlideCount 25 -BadgeMinWidth 26
