#!/bin/bash

# AIGameOptimizer Shell
# Hooked directly to Nvidia MiniMax-M3 for max FPS and Hz.
# Usage: ./ai_game_optimizer.sh "How do I max out my FPS in CS2 with a 3060?"

API_KEY="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"

if [ -z "$1" ]; then
    echo "Usage: $0 \"<your optimization question>\""
    echo "Example: $0 \"How do I max out my FPS in CS2 with a 3060?\""
    exit 1
fi

USER_QUERY="$1"
stream=false

if [ "$stream" = true ]; then
    accept_header='Accept: text/event-stream'
else
    accept_header='Accept: application/json'
fi

cat > payload.json <<JSON
{
  "model": "minimaxai/minimax-m3",
  "messages": [
    {"role": "system", "content": "You are an elite PC and Mobile game performance optimizer. Help the user max out their FPS, Hz, and reduce input lag."},
    {"role": "user", "content": "${USER_QUERY}"}
  ],
  "max_tokens": 4096,
  "temperature": 1.00,
  "top_p": 0.95,
  "stream": $stream
}
JSON

echo ">>> Injecting query to MiniMax-M3..."
curl -s -X POST https://integrate.api.nvidia.com/v1/chat/completions \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -H "$accept_header" \
  -d @payload.json | grep -o '"content":"[^"]*"' | sed 's/"content":"//g' | sed 's/"//g' | sed 's/\\n/\n/g'

echo -e "\n\n>>> Optimization Complete."
rm payload.json
