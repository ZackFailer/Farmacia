$ErrorActionPreference = 'Stop'

$pm2Command = 'pm2'

try {
  & $pm2Command resurrect
  & $pm2Command save
} catch {
  exit 1
}
