#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"
NODE_BIN="$(command -v node)"

LOG_DIR="$ROOT_DIR/logs"
PID_FILE="$ROOT_DIR/run/backend.pid"
APP_LOG="$LOG_DIR/backend.log"
APP_PORT="$(node -e "console.log(require('@ptcg/server').config.backend.port)")"
APP_HOST="$(node -e "console.log(require('@ptcg/server').config.backend.address || '127.0.0.1')")"
SKIP_COMPILE="${SKIP_COMPILE:-0}"

mkdir -p "$LOG_DIR" "$ROOT_DIR/run"
: >"$APP_LOG"

if [ "$SKIP_COMPILE" != "1" ]; then
  echo "[restart-backend] 1/4 Compile common"
  npm --workspace @ptcg/common run compile

  echo "[restart-backend] 2/4 Compile sets"
  npm --workspace @ptcg/sets run compile

  echo "[restart-backend] 3/4 Compile server"
  npm --workspace @ptcg/server run compile
else
  echo "[restart-backend] skip compile (SKIP_COMPILE=1)"
fi

echo "[restart-backend] Stop existing start.js processes"
if [ -f "$PID_FILE" ]; then
  OLD_PID="$(cat "$PID_FILE" || true)"
  if [ -n "${OLD_PID:-}" ] && kill -0 "$OLD_PID" 2>/dev/null; then
    kill "$OLD_PID" || true
    sleep 1
    if kill -0 "$OLD_PID" 2>/dev/null; then
      kill -9 "$OLD_PID" || true
    fi
  fi
fi

pkill -f "node start.js" >/dev/null 2>&1 || true

echo "[restart-backend] 4/4 Start backend"
nohup "$NODE_BIN" start.js >>"$APP_LOG" 2>&1 &
NEW_PID="$!"
echo "$NEW_PID" >"$PID_FILE"
disown || true

READY=0
for _ in {1..60}; do
  if ! kill -0 "$NEW_PID" 2>/dev/null; then
    echo "[restart-backend] process exited unexpectedly"
    tail -n 30 "$APP_LOG" || true
    exit 1
  fi
  if curl -s "http://${APP_HOST}:${APP_PORT}" >/dev/null 2>&1; then
    READY=1
    break
  fi
  sleep 1
done

if [ "$READY" -ne 1 ]; then
  echo "[restart-backend] health check timeout for http://${APP_HOST}:${APP_PORT}"
  tail -n 50 "$APP_LOG" || true
  exit 1
fi

echo "[restart-backend] success, pid=$NEW_PID, http=http://${APP_HOST}:${APP_PORT}, log=$APP_LOG"
