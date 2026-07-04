$ErrorActionPreference = 'Stop'

$taskName = 'ApoPharma PM2 Resurrect'
$scriptPath = Join-Path $PSScriptRoot 'pm2-resurrect.ps1'

if (-not (Test-Path -LiteralPath $scriptPath)) {
  throw "Script not found: $scriptPath"
}

$action = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`""
$trigger = New-ScheduledTaskTrigger -AtStartup
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited

try {
  Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Principal $principal -Force | Out-Null
  Write-Host "Scheduled task '$taskName' registered."
} catch {
  throw
}
