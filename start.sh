#!/bin/bash

# Always resolve relative to the script location
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Start .NET API in background
(cd "$ROOT_DIR/PocketSqlApi/PocketSqlApi" && dotnet run) &

# Start React frontend in background
(cd "$ROOT_DIR/PocketSqlUI" && npm run dev) &

# Wait until React dev server is listening on port 5173
until nc -z localhost 5173; do
  sleep 0.5
done

# Open the app in default browser
open "http://localhost:5173/"
