#!/bin/bash
# Start both Vite and API server

npx concurrently -k \
  "npm run dev" \
  "npx tsx server/index.ts"
