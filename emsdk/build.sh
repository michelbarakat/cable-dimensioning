#!/bin/bash
# Build script for cable_dimensioning.c to WebAssembly
# 
# Usage:
#   ./build.sh
#
# Prerequisites:
#   - Emscripten must be installed (via Homebrew: brew install emscripten)
#     OR activated via emsdk: source ./emsdk_env.sh

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Building cable_dimensioning.c to WebAssembly...${NC}"

# Check if emcc is available
if ! command -v emcc &> /dev/null; then
    echo -e "${YELLOW}Error: emcc not found.${NC}"
    echo "Please install Emscripten:"
    echo "  brew install emscripten"
    echo ""
    echo "OR activate emsdk:"
    echo "  source ./emsdk_env.sh"
    exit 1
fi

# Output directory
OUTPUT_DIR="../DimensioningUI/public/wasm"
mkdir -p "$OUTPUT_DIR"

# Compile the C file
# Using legacy Module API (not ES6) to match the TypeScript code
emcc cable_dimensioning.c \
  -o "$OUTPUT_DIR/cable_dimensioning.js" \
  -s EXPORTED_RUNTIME_METHODS="['cwrap','ccall']" \
  -s ALLOW_MEMORY_GROWTH=1 \
  -O3 \
  --no-entry

echo -e "${GREEN}✓ Build complete!${NC}"
echo -e "Output files:"
echo "  - $OUTPUT_DIR/cable_dimensioning.js"
echo "  - $OUTPUT_DIR/cable_dimensioning.wasm"

