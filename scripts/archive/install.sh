#!/bin/bash

# Ledger Alert Network - System Vault Installer
# This script configures your environment in under 1 minute.

set -e

echo "==================================================="
echo "   Ledger Alert Network - System Vault Setup     "
echo "==================================================="

echo "Checking prerequisites..."
if ! command -v node &> /dev/null
then
    echo "[!] Node.js is not installed. Please install Node v18+ first."
    exit 1
fi

if ! command -v git &> /dev/null
then
    echo "[!] Git is not installed."
    exit 1
fi

echo "[1/4] Cloning the repository (if not already present)..."
if [ ! -d "humanityledger" ]; then
    git clone https://github.com/humanityledger/humanityledger.git
    cd humanityledger
else
    echo "Directory exists. Ensuring we are in the right place."
    if [ ! -f "package.json" ]; then
        if [ -d "humanityledger" ]; then
            cd humanityledger
        else
            echo "[!] Error: package.json not found."
            exit 1
        fi
    fi
fi

echo "[2/4] Installing dependencies via npm ci..."
npm ci

echo "[3/4] Configuring Environment Variables..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "Created .env from .env.example. Please review keys if required."
else
    echo ".env already exists."
fi

echo "[4/4] Setup Complete!"
echo "You can now start the System Vault with:"
echo "npm run dev"
echo "==================================================="
