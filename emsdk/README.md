# Cable Dimensioning WebAssembly Module

This repository contains the C source code for cable dimensioning calculations, which can be compiled into a WebAssembly (Wasm) module.

The project is set up within the Emscripten SDK (emsdk) directory itself. Before compiling, you must ensure the SDK is installed and activated.

## Installation

If this is your first time setting up the project, you need to download and build the Emscripten toolchain.

1.  **Install the latest SDK tools:**
    ```bash
    ./emsdk install latest
    ```

2.  **Activate the latest SDK:**
    ```bash
    ./emsdk activate latest
    ```
    This command only needs to be run once. It sets the `latest` SDK as the active one for your system.

## Compiling the Module

To compile `cable_dimensioning.c`, you first need to source the environment script for your current terminal session.

### 1. Activate the Emscripten Environment

The method to activate the emsdk environment depends on your operating system and shell. This must be done for **each new terminal session**.

**For Bash/Zsh (Linux/macOS and Git Bash on Windows):**
```bash
source ./emsdk_env.sh
```

**For PowerShell (Windows):**
```powershell
./emsdk_env.ps1
```

**For Command Prompt (Windows):**
This command opens a new Command Prompt window with the Emscripten environment already activated.
```cmd
emcmdprompt.bat
```

### 2. Compile the C Code

Once your Emscripten environment is active, run the following command to compile the module:

```bash
emcc cable_dimensioning.c -o cable_dimensioning.js -s EXPORT_ES6 -s MODULARIZE
```

This command will:
*   Compile `cable_dimensioning.c`.
*   Output `cable_dimensioning.js` (the JavaScript wrapper) and `cable_dimensioning.wasm` (the WebAssembly module).
*   `-s EXPORT_ES6`: Ensures the JavaScript output is an ES6 module, suitable for modern JavaScript environments.
*   `-s MODULARIZE`: Makes the generated JavaScript code a module, preventing global pollution and allowing for easier integration.

### Output Files

After successful compilation, you will find two new files in your project directory:
*   `cable_dimensioning.js`: The JavaScript module that loads and interacts with the WebAssembly code.
*   `cable_dimensioning.wasm`: The compiled WebAssembly binary.