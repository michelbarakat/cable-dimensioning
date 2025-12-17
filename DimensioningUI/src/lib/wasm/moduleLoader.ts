// Module loading utilities for Emscripten WASM

// Helper to check if Module is ready
export function isModuleReady(): boolean {
  return !!(window.Module?.cwrap && window.Module.calledRun);
}

// Helper to set up runtime initialization callback
export function setupRuntimeCallback(resolve: () => void) {
  const originalOnRuntimeInitialized = window.Module?.onRuntimeInitialized;
  if (window.Module) {
    window.Module.onRuntimeInitialized = () => {
      originalOnRuntimeInitialized?.();
      resolve();
    };
  }
}

// Helper to handle Module initialization when available
function handleModuleAvailable(resolve: () => void) {
  if (window.Module?.calledRun) {
    resolve();
  } else {
    setupRuntimeCallback(resolve);
  }
}

// Helper function to wait for Module initialization
export function waitForModuleInitialization(
  resolve: () => void,
  reject: (error: Error) => void
) {
  if (isModuleReady()) {
    resolve();
    return;
  }

  if (window.Module?.cwrap) {
    setupRuntimeCallback(resolve);
    return;
  }

  // Poll for Module availability
  const checkInterval = setInterval(() => {
    if (window.Module?.cwrap) {
      clearInterval(checkInterval);
      handleModuleAvailable(resolve);
    }
  }, 10);

  // Timeout after 5 seconds
  setTimeout(() => {
    clearInterval(checkInterval);
    reject(new Error("Timeout waiting for Module to initialize"));
  }, 5000);
}

// Helper function to load the script
export function loadScript(resolve: () => void, reject: (error: Error) => void) {
  const script = document.createElement("script");
  script.src = "/wasm/cable_dimensioning.js";
  script.onload = () => {
    if (window.Module?.cwrap) {
      if (window.Module.calledRun) {
        resolve();
      } else {
        window.Module.onRuntimeInitialized = () => resolve();
      }
    } else {
      reject(new Error("Module not found after script load"));
    }
  };
  script.onerror = () => {
    reject(new Error("Failed to load cable_dimensioning.js script"));
  };
  document.body.appendChild(script);
}

