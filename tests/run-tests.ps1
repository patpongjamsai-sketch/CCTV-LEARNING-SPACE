param(
  [switch]$KeepContainer
)

$ErrorActionPreference = 'Stop'
$packageRoot = Split-Path -Parent $PSScriptRoot
$migrationRoot = Join-Path $packageRoot 'supabase\migrations'
$containerName = 'codex-supabase-test-' + [guid]::NewGuid().ToString('N').Substring(0, 10)
$containerStarted = $false

function Invoke-DockerCommand {
  param([string[]]$Arguments)
  & docker @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "Docker command failed: docker $($Arguments -join ' ')"
  }
}

function Invoke-SqlFile {
  param(
    [string]$DatabaseName,
    [string]$FilePath
  )

  Get-Content -Raw -LiteralPath $FilePath |
    docker exec -i $containerName psql -U postgres -d $DatabaseName -v ON_ERROR_STOP=1
  if ($LASTEXITCODE -ne 0) {
    throw "SQL test failed: $FilePath"
  }
}

function Invoke-Migrations {
  param([string]$DatabaseName)

  Get-ChildItem -LiteralPath $migrationRoot -Filter '*.sql' |
    Sort-Object Name |
    ForEach-Object { Invoke-SqlFile -DatabaseName $DatabaseName -FilePath $_.FullName }
}

function Invoke-ContractTests {
  param(
    [string]$DatabaseName,
    [switch]$IncludeLegacyUpgrade
  )

  if ($IncludeLegacyUpgrade) {
    Invoke-SqlFile $DatabaseName (Join-Path $PSScriptRoot '001_legacy_upgrade_test.sql')
  }

  @(
    '001_core_test.sql',
    '002_assessment_test.sql',
    '003_game_test.sql',
    '004_security_test.sql',
    '005_functions_triggers_test.sql',
    '006_security_catalog_test.sql',
    '007_foreign_key_index_test.sql'
  ) | ForEach-Object {
    Invoke-SqlFile $DatabaseName (Join-Path $PSScriptRoot $_)
  }
}

try {
  Invoke-DockerCommand @(
    'run', '--name', $containerName,
    '-e', 'POSTGRES_PASSWORD=local-test-only',
    '-d', 'postgres:17-alpine'
  )
  $containerStarted = $true

  $ready = $false
  for ($attempt = 0; $attempt -lt 45; $attempt++) {
    docker exec $containerName pg_isready -U postgres *> $null
    if ($LASTEXITCODE -eq 0) {
      $ready = $true
      break
    }
    Start-Sleep -Seconds 1
  }
  if (-not $ready) {
    throw 'PostgreSQL 17 test container did not become ready in time.'
  }

  foreach ($databaseName in @('fresh_install', 'legacy_upgrade')) {
    Invoke-DockerCommand @('exec', $containerName, 'createdb', '-U', 'postgres', $databaseName)
    Invoke-SqlFile $databaseName (Join-Path $PSScriptRoot '000_bootstrap.sql')

    if ($databaseName -eq 'legacy_upgrade') {
      Invoke-SqlFile $databaseName (Join-Path $PSScriptRoot '001_legacy_fixture.sql')
    }

    Invoke-Migrations $databaseName
    Invoke-ContractTests `
      -DatabaseName $databaseName `
      -IncludeLegacyUpgrade:($databaseName -eq 'legacy_upgrade')
  }

  Write-Host 'DATABASE_SECURITY_TESTS=PASS'
  Write-Host 'Fresh install: PASS'
  Write-Host 'Legacy bigint-to-UUID upgrade with preserved seed data: PASS'
}
finally {
  if ($containerStarted -and -not $KeepContainer) {
    docker rm -f $containerName *> $null
  }
  elseif ($containerStarted) {
    Write-Host "Kept test container: $containerName"
  }
}
