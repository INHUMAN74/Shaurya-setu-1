# Run from repo root: Shaurya_Setu (folder that contains vros and mobile)
$mobile = Join-Path $PSScriptRoot "mobile"
if (-not (Test-Path $mobile)) { throw "Create the Expo app in 'mobile' first (npx create-expo-app)." }

$screen = @'
import { Text, View } from "react-native";

export default function Screen() {
  return (
    <View style={{ flex: 1, padding: 16, justifyContent: "center" }}>
      <Text>TODO: port from vros</Text>
    </View>
  );
}
'@

function Write-Route($relativePath) {
  $full = Join-Path -Path (Join-Path -Path $mobile -ChildPath "app") -ChildPath $relativePath
  $dir = Split-Path $full -Parent
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
  if (-not (Test-Path $full)) {
    Set-Content -Path $full -Value $screen -Encoding utf8
    Write-Host "Created $full"
  } else {
    Write-Host "Skip (exists): $full"
  }
}

New-Item -ItemType Directory -Force -Path (Join-Path $mobile "components"), (Join-Path $mobile "lib"), (Join-Path $mobile "constants") | Out-Null

# Mirror vros routes (Expo Router file names)
Write-Route "index.tsx"
Write-Route "resources.tsx"
Write-Route "(auth)\_layout.tsx"
Write-Route "(auth)\login.tsx"
Write-Route "(auth)\signup.tsx"
Write-Route "(dashboard)\_layout.tsx"
Write-Route "(dashboard)\dashboard\index.tsx"
Write-Route "(dashboard)\dashboard\admin\index.tsx"
Write-Route "(dashboard)\dashboard\admin\verification.tsx"
Write-Route "(dashboard)\dashboard\admin\users.tsx"
Write-Route "(dashboard)\dashboard\counsellor\index.tsx"
Write-Route "(dashboard)\dashboard\counsellor\cases\index.tsx"
Write-Route "(dashboard)\dashboard\counsellor\cases\[caseId].tsx"
Write-Route "(dashboard)\dashboard\counsellor\veterans\index.tsx"
Write-Route "(dashboard)\dashboard\counsellor\veterans\[veteranId].tsx"
Write-Route "(dashboard)\dashboard\employer\index.tsx"
Write-Route "(dashboard)\dashboard\veteran\index.tsx"
Write-Route "(dashboard)\dashboard\veteran\profile.tsx"
Write-Route "(dashboard)\dashboard\veteran\plan.tsx"

Write-Host "Done. Edit app/_layout.tsx and group _layout files to match your navigation."