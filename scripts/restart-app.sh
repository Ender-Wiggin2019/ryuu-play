#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

LOG_DIR="$ROOT_DIR/logs"
PID_FILE="$ROOT_DIR/run/app.pid"
APP_LOG="$LOG_DIR/app.log"
APP_PORT="$(node -e "console.log(require('@ptcg/server').config.backend.port)")"
APP_HOST="$(node -e "console.log(require('@ptcg/server').config.backend.address || '127.0.0.1')")"

mkdir -p "$LOG_DIR" "$ROOT_DIR/run"

echo "[restart-app] 1/5 Compile server"
npm --workspace @ptcg/server run compile

echo "[restart-app] 2/5 Build play"
npm --workspace @ptcg/play run build

echo "[restart-app] 3/5 Stop existing start.js processes"
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

echo "[restart-app] 4/5 Start app"
nohup bash -lc "exec node start.js" >>"$APP_LOG" 2>&1 &
NEW_PID="$!"
echo "$NEW_PID" >"$PID_FILE"
disown || true

echo "[restart-app] 5/5 Verify process"
READY=0
for _ in {1..20}; do
  if ! kill -0 "$NEW_PID" 2>/dev/null; then
    echo "[restart-app] process exited unexpectedly"
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
  echo "[restart-app] health check timeout for http://${APP_HOST}:${APP_PORT}"
  tail -n 50 "$APP_LOG" || true
  exit 1
fi

echo "[restart-app] success, pid=$NEW_PID, http=http://${APP_HOST}:${APP_PORT}, log=$APP_LOG"
