# Building cable_dimensioning.c for WebAssembly

## Prerequisites

You need to have Emscripten SDK installed and activated. There are two ways to do this:

### Option 1: Use the included emsdk (Recommended)

1. **Install Emscripten SDK:**
   ```bash
   cd emsdk
   ./emsdk install latest
   ```

2. **Activate the SDK:**
   ```bash
   # For bash/zsh:
   source ./emsdk_env.sh
   
   # For fish shell:
   source ./emsdk_env.fish
   ```

3. **Build the WebAssembly module:**
   ```bash
   ./build.sh
   ```

### Option 2: Use system-installed Emscripten

If you have Emscripten installed system-wide (e.g., via Homebrew), you can build directly:

```bash
cd emsdk
emcc cable_dimensioning.c \
  -o ../DimensioningUI/public/wasm/cable_dimensioning.js \
  -s EXPORTED_RUNTIME_METHODS="['cwrap','ccall']" \
  -s ALLOW_MEMORY_GROWTH=1 \
  -O3 \
  --no-entry
```

### Option 3: Use Docker

If you have Docker installed, you can use the provided Docker setup:

```bash
cd emsdk/docker
# Follow the Docker instructions in the docker/README.md
```

## Output

After successful compilation, you'll find:
- `DimensioningUI/public/wasm/cable_dimensioning.js` - JavaScript wrapper
- `DimensioningUI/public/wasm/cable_dimensioning.wasm` - WebAssembly binary

These files are expected by the TypeScript code in `DimensioningUI/src/lib/cable_dimensioning.ts`.

## Troubleshooting

- **"emcc not found"**: Make sure you've activated the Emscripten environment in your current terminal session
- **Missing files**: If emsdk seems incomplete, try cloning the official emsdk repository or installing it fresh
- **Build errors**: Ensure all required functions are marked with `EMSCRIPTEN_KEEPALIVE` (they already are in the source file)

