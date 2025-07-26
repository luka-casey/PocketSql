#!/bin/bash

# Open a new iTerm2 tab for the .NET API
osascript <<EOF
tell application "iTerm2"
  tell current window
    create tab with default profile
    tell current session
      write text "cd ~/Desktop/PocketSql/PocketSqlApi/PocketSqlApi && dotnet run"
    end tell
  end tell
end tell
EOF

# Open another iTerm2 tab for the React frontend
osascript <<EOF
tell application "iTerm2"
  tell current window
    create tab with default profile
    tell current session
      write text "cd ~/Desktop/PocketSql/PocketSqlUI && npm run dev"
    end tell
  end tell
end tell
EOF
