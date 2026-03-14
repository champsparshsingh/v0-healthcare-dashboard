import { execFileSync, spawn } from "node:child_process"
import { existsSync, rmSync } from "node:fs"
import path from "node:path"
import process from "node:process"

function runCommand(command, args) {
  try {
    return execFileSync(command, args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim()
  } catch (error) {
    if (error.status === 1 && !error.stdout && !error.stderr) {
      return ""
    }

    throw error
  }
}

function getProjectDevPids(projectRoot) {
  if (process.platform === "win32") {
    const escapedProjectRoot = projectRoot.replace(/'/g, "''")
    const script = `
$projectRoot = '${escapedProjectRoot}'
Get-CimInstance Win32_Process |
Where-Object {
  $_.Name -eq 'node.exe' -and
  $_.CommandLine -like '*next dev*' -and
  $_.CommandLine -like "*$projectRoot*"
} |
Select-Object -ExpandProperty ProcessId
`

    return runCommand("powershell", [
      "-NoProfile",
      "-NonInteractive",
      "-ExecutionPolicy",
      "Bypass",
      "-Command",
      script,
    ])
      .split(/\r?\n/)
      .map((value) => Number.parseInt(value, 10))
      .filter(Number.isInteger)
  }

  return runCommand("pgrep", ["-f", `${projectRoot}.*next.*dev|next.*dev.*${projectRoot}`])
    .split(/\r?\n/)
    .map((value) => Number.parseInt(value, 10))
    .filter(Number.isInteger)
}

function killProcess(pid) {
  try {
    process.kill(pid, "SIGTERM")
  } catch (error) {
    if (error.code !== "ESRCH") {
      throw error
    }
  }
}

function removeStaleLock(projectRoot) {
  const lockPath = path.join(projectRoot, ".next", "dev", "lock")

  if (existsSync(lockPath)) {
    rmSync(lockPath, { force: true })
  }
}

function startNextDev(projectRoot, args) {
  const nextEntrypoint = path.join(projectRoot, "node_modules", "next", "dist", "bin", "next")

  const child = spawn(process.execPath, [nextEntrypoint, "dev", ...args], {
    cwd: projectRoot,
    stdio: "inherit",
    shell: false,
  })

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal)
      return
    }

    process.exit(code ?? 0)
  })
}

const projectRoot = process.cwd()
const extraArgs = process.argv.slice(2)
const existingPids = getProjectDevPids(projectRoot)

for (const pid of existingPids) {
  killProcess(pid)
}

removeStaleLock(projectRoot)
startNextDev(projectRoot, extraArgs)