#!/bin/bash
set -e

echo '--- Installing Python dependencies ---'
cd /workspaces/Sync-Stream/backend
pip install -r requirements.txt --quiet

echo '--- Installing Node dependencies ---'
cd /workspaces/Sync-Stream/frontend
npm install --silent

echo '--- Copying environment files ---'
if [ ! -f /workspaces/Sync-Stream/fronend/.env]; then
    cp /workspaces/Sync-Stream/frontend/.env.example \ 
       /workspaces/Sync-Stream/frontend/.env
    echo 'Created frontend/.env from template'
fi

echo ' ' 
echo '.. SyncStream dev environment ready'
echo ' Backend: cd backend && uvicorn app.main:app --reload --port 8000'
echo ' Frontend: cd frontend && npm run dev'