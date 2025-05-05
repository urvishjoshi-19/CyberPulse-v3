#!/bin/bash

# Build the frontend
vite build

# Build the server
tsc

# Bundle the server
esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
