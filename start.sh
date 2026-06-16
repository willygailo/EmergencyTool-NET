#!/bin/bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="${ROOT_DIR}/.logs"
MOBILE_ENV_FILE="${ROOT_DIR}/mobile/.env"
BACKEND_ENV_FILE="${ROOT_DIR}/backend/.env"
ADMIN_ENV_FILE="${ROOT_DIR}/admin-dashboard/.env"
NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
AUTO_START_MOBILE="${AUTO_START_MOBILE:-1}"
AUTO_START_DOCKER="${AUTO_START_DOCKER:-1}"
AUTO_INSTALL_SYSTEM_DEPS="${AUTO_INSTALL_SYSTEM_DEPS:-1}"
AUTO_BOOTSTRAP_NVM="${AUTO_BOOTSTRAP_NVM:-1}"
AUTO_FIX_EXPO_DEPS="${AUTO_FIX_EXPO_DEPS:-1}"
PACKAGE_INDEX_REFRESHED="${PACKAGE_INDEX_REFRESHED:-0}"

fail_with_help() {
  local cmd="$1"
  local help_msg="$2"
  echo "❌ missing required command: ${cmd}"
  echo "  ${help_msg}"
  exit 1
}

command_exists() {
  local cmd="$1"
  command -v "${cmd}" >/dev/null 2>&1
}

run_with_privilege() {
  if [ "$(id -u)" -eq 0 ]; then
    "$@"
    return $?
  fi

  if command_exists sudo; then
    sudo -n "$@"
    return $?
  fi

  return 1
}

detect_package_manager() {
  local package_manager

  for package_manager in apt-get dnf pacman brew; do
    if command_exists "${package_manager}"; then
      echo "${package_manager}"
      return 0
    fi
  done

  return 1
}

refresh_package_index() {
  local package_manager="$1"

  if [ "${PACKAGE_INDEX_REFRESHED}" = "1" ]; then
    return 0
  fi

  case "${package_manager}" in
    apt-get)
      run_with_privilege apt-get update
      ;;
    dnf)
      run_with_privilege dnf makecache
      ;;
    pacman)
      run_with_privilege pacman -Sy --noconfirm
      ;;
    brew)
      return 0
      ;;
    *)
      return 1
      ;;
  esac

  PACKAGE_INDEX_REFRESHED="1"
}

package_name_for_command() {
  local package_manager="$1"
  local cmd="$2"

  case "${package_manager}:${cmd}" in
    apt-get:curl) echo "curl" ;;
    apt-get:docker) echo "docker.io" ;;
    apt-get:ffmpeg) echo "ffmpeg" ;;
    apt-get:lsof) echo "lsof" ;;
    dnf:curl) echo "curl" ;;
    dnf:docker) echo "docker" ;;
    dnf:ffmpeg) echo "ffmpeg" ;;
    dnf:lsof) echo "lsof" ;;
    pacman:curl) echo "curl" ;;
    pacman:docker) echo "docker" ;;
    pacman:ffmpeg) echo "ffmpeg" ;;
    pacman:lsof) echo "lsof" ;;
    brew:curl) echo "curl" ;;
    brew:docker) echo "docker" ;;
    brew:ffmpeg) echo "ffmpeg" ;;
    brew:lsof) echo "lsof" ;;
    *)
      return 1
      ;;
  esac
}

install_system_package_for_command() {
  local cmd="$1"
  local package_manager
  local package_name

  if [ "${AUTO_INSTALL_SYSTEM_DEPS}" != "1" ]; then
    return 1
  fi

  if ! package_manager="$(detect_package_manager)"; then
    return 1
  fi

  if ! package_name="$(package_name_for_command "${package_manager}" "${cmd}")"; then
    return 1
  fi

  echo "⚠ ${cmd} is missing. Attempting automatic install via ${package_manager}..."

  if ! refresh_package_index "${package_manager}"; then
    return 1
  fi

  case "${package_manager}" in
    apt-get)
      run_with_privilege apt-get install -y "${package_name}"
      ;;
    dnf)
      run_with_privilege dnf install -y "${package_name}"
      ;;
    pacman)
      run_with_privilege pacman -S --noconfirm "${package_name}"
      ;;
    brew)
      brew install "${package_name}"
      ;;
    *)
      return 1
      ;;
  esac
}

ensure_system_command() {
  local cmd="$1"
  local help_msg="$2"

  if command_exists "${cmd}"; then
    return 0
  fi

  if install_system_package_for_command "${cmd}"; then
    hash -r
    if command_exists "${cmd}"; then
      echo "✓ installed ${cmd}"
      return 0
    fi
  fi

  fail_with_help "${cmd}" "${help_msg}"
}

desired_node_version() {
  if [ -f "${ROOT_DIR}/.nvmrc" ]; then
    tr -d '[:space:]' < "${ROOT_DIR}/.nvmrc"
    return 0
  fi

  echo "20.19.4"
}

current_node_version() {
  if command_exists node; then
    node -v 2>/dev/null | sed 's/^v//'
  fi
}

node_versions_match() {
  local current="${1#v}"
  local desired="${2#v}"

  if [ "${current}" = "${desired}" ]; then
    return 0
  fi

  case "${current}" in
    "${desired}".*)
      return 0
      ;;
  esac

  return 1
}

load_nvm() {
  if [ -s "${NVM_DIR}/nvm.sh" ]; then
    # shellcheck disable=SC1090
    . "${NVM_DIR}/nvm.sh"
    return 0
  fi

  return 1
}

bootstrap_nvm() {
  local installer_url="https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh"
  local installer_path

  if [ "${AUTO_BOOTSTRAP_NVM}" != "1" ]; then
    return 1
  fi

  ensure_system_command curl "Install curl or set AUTO_BOOTSTRAP_NVM=0 to manage Node.js manually."

  installer_path="$(mktemp)"
  if ! curl -fsSL "${installer_url}" -o "${installer_path}"; then
    rm -f "${installer_path}"
    return 1
  fi

  echo "⚠ nvm is missing. Attempting automatic install..."
  if ! bash "${installer_path}"; then
    rm -f "${installer_path}"
    return 1
  fi

  rm -f "${installer_path}"
  load_nvm
}

ensure_node_runtime() {
  local desired_version
  local current_version

  desired_version="$(desired_node_version)"
  current_version="$(current_node_version || true)"

  if [ -n "${current_version}" ] && node_versions_match "${current_version}" "${desired_version}" && command_exists npm; then
    echo "✓ using Node.js ${current_version}"
    return 0
  fi

  if ! load_nvm; then
    if ! bootstrap_nvm; then
      echo "❌ Node.js ${current_version:-not installed} does not match required ${desired_version}"
      echo "  Install nvm or set up Node.js ${desired_version} manually, then rerun ./start.sh."
      exit 1
    fi
  fi

  echo "⚠ switching Node.js to ${desired_version} via nvm..."
  nvm install "${desired_version}"
  nvm use "${desired_version}"
  hash -r

  current_version="$(current_node_version || true)"
  if ! node_versions_match "${current_version}" "${desired_version}" || ! command_exists npm; then
    echo "❌ failed to activate Node.js ${desired_version}"
    echo "  Current Node.js: ${current_version:-not installed}"
    exit 1
  fi

  echo "✓ using Node.js ${current_version}"
}

docker_daemon_is_ready() {
  docker info >/dev/null 2>&1
}

wait_for_docker_daemon() {
  local attempts="${1:-10}"
  local delay_seconds="${2:-1}"

  for ((i = 1; i <= attempts; i++)); do
    if docker_daemon_is_ready; then
      return 0
    fi
    sleep "${delay_seconds}"
  done

  return 1
}

run_docker_start_command() {
  local command_label="$1"
  shift

  if "$@" >/dev/null 2>&1; then
    echo "⏳ ${command_label}"
    return 0
  fi

  return 1
}

attempt_start_docker_daemon() {
  if [ "${AUTO_START_DOCKER}" != "1" ]; then
    return 1
  fi

  echo "⚠ Docker daemon is not running. Attempting to start it..."

  if command -v systemctl >/dev/null 2>&1; then
    if run_docker_start_command "starting Docker via systemctl..." systemctl start docker; then
      return 0
    fi

    if command -v sudo >/dev/null 2>&1 && run_docker_start_command "starting Docker via sudo systemctl..." sudo -n systemctl start docker; then
      return 0
    fi
  fi

  if command -v service >/dev/null 2>&1; then
    if run_docker_start_command "starting Docker via service..." service docker start; then
      return 0
    fi

    if command -v sudo >/dev/null 2>&1 && run_docker_start_command "starting Docker via sudo service..." sudo -n service docker start; then
      return 0
    fi
  fi

  return 1
}

check_prerequisites() {
  ensure_system_command curl "Install curl for health checks."
  ensure_system_command docker "Install Docker and make sure it is running."
  ensure_system_command lsof "Install lsof for port checks."
  ensure_system_command ffmpeg "Install ffmpeg so Expo video uploads can be converted to browser-friendly H.264."
  ensure_node_runtime

  if docker_daemon_is_ready; then
    return 0
  fi

  if attempt_start_docker_daemon && wait_for_docker_daemon 15 1; then
    echo "✓ Docker daemon is running"
    return 0
  fi

  if ! docker_daemon_is_ready; then
    echo "❌ Docker daemon is not running."
    echo "  Tried to auto-start it but the daemon is still unavailable."
    echo "  Start Docker Desktop/service manually, or rerun with sufficient privileges."
    exit 1
  fi
}

is_port_in_use() {
  local port="$1"
  lsof -nP -iTCP:"${port}" -sTCP:LISTEN >/dev/null 2>&1
}

print_port_owner() {
  local port="$1"

  if lsof_output="$(lsof -nP -iTCP:"${port}" -sTCP:LISTEN 2>/dev/null)"; then
    echo "${lsof_output}"
  else
    echo "  no listening process details available for port ${port}"
  fi
}

wait_for_http() {
  local url="$1"
  local attempts="${2:-20}"
  local delay_seconds="${3:-1}"

  for ((i = 1; i <= attempts; i++)); do
    if curl -fsS "${url}" >/dev/null 2>&1; then
      return 0
    fi
    sleep "${delay_seconds}"
  done

  return 1
}

backend_is_healthy() {
  wait_for_http "http://localhost:3000/health" 1 0
}

admin_is_healthy() {
  wait_for_http "http://localhost:5173" 1 0
}

ensure_env_file() {
  local file_path="$1"
  local example_path="$2"
  local label="$3"

  if [ -f "${file_path}" ]; then
    echo "✓ ${label} env already configured"
    return
  fi

  if [ -f "${example_path}" ]; then
    cp "${example_path}" "${file_path}"
    echo "✓ created ${label} env from example"
  else
    touch "${file_path}"
    echo "⚠ ${label} example env not found, created empty ${file_path}"
  fi
}

detect_lan_ip() {
  if command -v ip >/dev/null 2>&1; then
    local route_ip
    route_ip="$(ip route get 1.1.1.1 2>/dev/null | awk '/src/ { for (i = 1; i <= NF; i++) if ($i == "src") { print $(i + 1); exit } }')"
    if [ -n "${route_ip}" ]; then
      echo "${route_ip}"
      return 0
    fi
  fi

  if command -v hostname >/dev/null 2>&1; then
    local host_ip
    host_ip="$(hostname -I 2>/dev/null | awk '{ for (i = 1; i <= NF; i++) if ($i !~ /^127\./) { print $i; exit } }')"
    if [ -n "${host_ip}" ]; then
      echo "${host_ip}"
      return 0
    fi
  fi

  return 1
}

sync_mobile_env() {
  if [ ! -f "${MOBILE_ENV_FILE}" ]; then
    touch "${MOBILE_ENV_FILE}"
  fi

  local lan_ip
  if ! lan_ip="$(detect_lan_ip)"; then
    echo "⚠ could not detect LAN IP for Expo Go; mobile/.env unchanged"
    return
  fi

  local desired_url="http://${lan_ip}:3000"
  local desired_line="EXPO_PUBLIC_API_URL=${desired_url}"

  if [ ! -f "${MOBILE_ENV_FILE}" ]; then
    printf '%s\n' "${desired_line}" > "${MOBILE_ENV_FILE}"
    echo "✓ created mobile/.env with ${desired_url}"
    return
  fi

  local current_line
  current_line="$(grep -E '^EXPO_PUBLIC_API_URL=' "${MOBILE_ENV_FILE}" || true)"

  if [ -z "${current_line}" ] || echo "${current_line}" | grep -Eq 'localhost|127\.0\.0\.1'; then
    if grep -qE '^EXPO_PUBLIC_API_URL=' "${MOBILE_ENV_FILE}"; then
      sed -i "s|^EXPO_PUBLIC_API_URL=.*|${desired_line}|" "${MOBILE_ENV_FILE}"
    else
      printf '\n%s\n' "${desired_line}" >> "${MOBILE_ENV_FILE}"
    fi
    echo "✓ updated mobile/.env to ${desired_url}"
    return
  fi

  echo "✓ keeping existing mobile/.env (${current_line#EXPO_PUBLIC_API_URL=})"
}

ensure_dependencies() {
  local app_dir="$1"
  local app_name="$2"
  local lockfile="${app_dir}/package-lock.json"
  local modules_dir="${app_dir}/node_modules"
  local modules_lock="${modules_dir}/.package-lock.json"

  local should_install="no"
  local reason=""

  if [ "${FORCE_INSTALL_DEPS:-0}" = "1" ]; then
    should_install="yes"
    reason="FORCE_INSTALL_DEPS=1"
  elif [ ! -d "${modules_dir}" ]; then
    should_install="yes"
    reason="node_modules missing"
  elif [ -f "${lockfile}" ] && [ ! -f "${modules_lock}" ]; then
    should_install="yes"
    reason="node_modules lock metadata missing"
  elif [ -f "${lockfile}" ] && [ "${lockfile}" -nt "${modules_lock}" ]; then
    should_install="yes"
    reason="package-lock.json changed"
  fi

  if [ "${should_install}" = "yes" ]; then
    echo "⏳ installing ${app_name} dependencies (${reason})..."
    npm install --prefix "${app_dir}"
    echo "✓ ${app_name} dependencies ready"
  else
    echo "✓ ${app_name} dependencies already installed"
  fi
}

ensure_mobile_sdk_dependencies() {
  if [ "${AUTO_FIX_EXPO_DEPS}" != "1" ]; then
    echo "✓ Expo SDK dependency auto-fix disabled"
    return 0
  fi

  if (cd "${ROOT_DIR}/mobile" && npx expo install --check >/dev/null 2>&1); then
    echo "✓ Expo SDK dependencies already aligned"
    return 0
  fi

  echo "⚠ Expo SDK dependency mismatch detected. Attempting automatic fix..."
  (cd "${ROOT_DIR}/mobile" && npx expo install --fix --npm)
  echo "✓ Expo SDK dependencies ready"
}

start_container() {
  local name="$1"
  shift

  if docker ps --format '{{.Names}}' | grep -Fxq "${name}"; then
    echo "✓ ${name} already running"
    return
  fi

  if docker ps -a --format '{{.Names}}' | grep -Fxq "${name}"; then
    docker start "${name}" >/dev/null
    echo "✓ started existing ${name}"
    return
  fi

  if ! docker run --name "${name}" "$@" >/dev/null; then
    return 1
  fi

  echo "✓ created and started ${name}"
}

cleanup() {
  echo ""
  echo "🛑 Shutting down services..."
  docker stop emergency-postgres emergency-redis >/dev/null 2>&1 || true

  for pid_var in backend_pid admin_pid metro_pid; do
    pid_value="${!pid_var:-}"
    if [ -n "${pid_value}" ]; then
      kill "${pid_value}" 2>/dev/null || true
    fi
  done

  pkill -P $$ 2>/dev/null || true

  for port in 3000 5173 8081; do
    lsof -ti:"${port}" 2>/dev/null | xargs -r kill 2>/dev/null || true
  done

  wait 2>/dev/null || true
  echo "✓ All services stopped"
}

trap cleanup EXIT INT TERM HUP

echo "Starting EmergencyTool NET..."
mkdir -p "${LOG_DIR}"
check_prerequisites

ensure_env_file "${BACKEND_ENV_FILE}" "${ROOT_DIR}/backend/.env.example" "backend"
ensure_env_file "${ADMIN_ENV_FILE}" "${ROOT_DIR}/admin-dashboard/.env.example" "admin-dashboard"
ensure_env_file "${MOBILE_ENV_FILE}" "${ROOT_DIR}/mobile/.env.example" "mobile"

ensure_dependencies "${ROOT_DIR}/backend" "backend"
ensure_dependencies "${ROOT_DIR}/admin-dashboard" "admin-dashboard"
ensure_dependencies "${ROOT_DIR}/mobile" "mobile"
ensure_mobile_sdk_dependencies

if ! start_container emergency-postgres \
  -e POSTGRES_PASSWORD=willygailo29 \
  -e POSTGRES_DB=emergencytool \
  -p 5432:5432 \
  -d postgres:15-alpine; then
  echo "❌ failed to start PostgreSQL container emergency-postgres"
  exit 1
fi

if ! start_container emergency-redis \
  -p 6379:6379 \
  -d redis:7-alpine; then
  echo "⚠ failed to start Redis container emergency-redis"
  echo "  continuing without Redis cache support"
fi

sync_mobile_env

backend_started="no"
backend_pid=""
if backend_is_healthy; then
  echo "✓ backend already healthy on http://localhost:3000"
elif is_port_in_use 3000; then
  echo "❌ port 3000 is occupied but EmergencyTool backend is not responding"
  print_port_owner 3000
else
  (cd "${ROOT_DIR}/backend" && npm run seed && npm run dev > "${LOG_DIR}/backend.log" 2>&1) &
  backend_pid=$!
  backend_started="yes"
fi

admin_started="no"
admin_pid=""
if admin_is_healthy; then
  echo "✓ admin already healthy on http://localhost:5173"
elif is_port_in_use 5173; then
  echo "❌ port 5173 is occupied but admin dashboard is not responding"
  print_port_owner 5173
else
  (cd "${ROOT_DIR}/admin-dashboard" && npm run dev -- --port 5173 --strictPort > "${LOG_DIR}/admin.log" 2>&1) &
  admin_pid=$!
  admin_started="yes"
fi

if [ "${backend_started}" = "yes" ]; then
  if backend_is_healthy || wait_for_http "http://localhost:3000/health" 20 1; then
    echo "✓ backend started on http://localhost:3000"
  else
    echo "❌ backend failed to become healthy"
    echo "  tail -n 50 ${LOG_DIR}/backend.log"
  fi
fi

if [ "${admin_started}" = "yes" ]; then
  if admin_is_healthy || wait_for_http "http://localhost:5173" 20 1; then
    echo "✓ admin started on http://localhost:5173"
  else
    echo "❌ admin failed to become healthy"
    echo "  tail -n 50 ${LOG_DIR}/admin.log"
  fi
fi

echo ""
echo "Service Status"
if backend_is_healthy; then
  echo "  Backend API: http://localhost:3000"
  echo "  Health:      http://localhost:3000/health"
  echo "  Uploads:     http://localhost:3000/uploads"
  echo "  Media:       image evidence served directly, video evidence auto-converted for browser playback"
else
  echo "  Backend: unavailable"
  echo "           log: ${LOG_DIR}/backend.log"
fi

if admin_is_healthy; then
  echo "  Admin:   http://localhost:5173"
else
  echo "  Admin:   unavailable"
  echo "           log: ${LOG_DIR}/admin.log"
fi

echo ""
if [ -f "${MOBILE_ENV_FILE}" ]; then
  mobile_api_url="$(grep -E '^EXPO_PUBLIC_API_URL=' "${MOBILE_ENV_FILE}" | cut -d= -f2- || true)"
  if [ -n "${mobile_api_url}" ]; then
    echo "Mobile API: ${mobile_api_url}"
  else
    echo "Mobile API: not set in mobile/.env"
  fi
fi
echo "Login: admin@emergencytool.com / admin123"

if [ "${AUTO_START_MOBILE}" != "1" ]; then
  echo ""
  echo "AUTO_START_MOBILE=${AUTO_START_MOBILE} so Expo start is skipped."
  echo "Run manually: npm run start:online --prefix mobile"
  exit 0
fi

if is_port_in_use 8081; then
  echo ""
  echo "⚠ port 8081 is already in use; Expo Metro may already be running."
  print_port_owner 8081
  echo "If needed, stop old Metro process then run: npm run start:online --prefix mobile"
  exit 0
fi

echo ""
echo "Starting Expo Metro..."
echo "Press Ctrl+C to stop all services."
cd "${ROOT_DIR}/mobile"
npm run start:online &
metro_pid=$!
wait "${metro_pid}" 2>/dev/null || true
