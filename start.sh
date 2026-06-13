#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
PIDS_DIR="$ROOT/.pids"
mkdir -p "$PIDS_DIR"

# Backend
cd "$ROOT/backend"
uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
echo $! > "$PIDS_DIR/uvicorn.pid"

# Frontend
cd "$ROOT/frontend"
npm run dev &
echo $! > "$PIDS_DIR/vite.pid"

echo ""
echo "  Backend:  http://localhost:8000"
echo "  API docs: http://localhost:8000/docs"
echo "  Frontend: http://localhost:5173"
echo ""
echo "  Run ./stop.sh to stop both servers"
