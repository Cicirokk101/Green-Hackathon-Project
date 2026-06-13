#!/usr/bin/env bash

ROOT="$(cd "$(dirname "$0")" && pwd)"
PIDS_DIR="$ROOT/.pids"

stop_proc() {
    local name=$1
    local pidfile="$PIDS_DIR/$2"
    if [ -f "$pidfile" ]; then
        kill "$(cat "$pidfile")" 2>/dev/null && echo "$name stopped" || echo "$name was not running"
        rm -f "$pidfile"
    else
        echo "$name: no PID file found"
    fi
}

stop_proc "Backend"  "uvicorn.pid"
stop_proc "Frontend" "vite.pid"
