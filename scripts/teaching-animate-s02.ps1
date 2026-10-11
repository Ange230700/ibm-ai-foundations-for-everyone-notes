param(
  [Parameter(Mandatory = $true)] [string] $RepoRoot,
  [Parameter(Mandatory = $true)] [string] $PlanPath,
  [Parameter(Mandatory = $true)] [ValidateSet('en', 'fr')] [string] $Language
)

& "$PSScriptRoot/teaching-animate.ps1" -RepoRoot $RepoRoot -PlanPath $PlanPath -Language $Language -SessionId s02 -SlideCount 26 -BadgeMinWidth 26
