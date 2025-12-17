import { getWorkerManager } from "./wasm/workerManager";

/**
 * ⚠️ IMPORTANT: WASM Loading Strategy
 * 
 * WASM files are ONLY loaded in the Web Worker, NOT in the main bundle.
 * This prevents:
 * - Double download (main bundle + worker)
 * - Double compilation (main thread + worker thread)
 * - Double memory usage
 * 
 * The main thread only:
 * - Creates the worker
 * - Sends messages to the worker
 * - Receives results from the worker
 * 
 * WASM is loaded via `importScripts()` in cableWorker.ts ONLY.
 */

// Helper to create a wrapped function that calls the worker
function createWrappedFunction(functionName: string) {
  return async (...args: any[]) => {
    const workerManager = getWorkerManager();
    return workerManager.callFunction(functionName, ...args);
  };
}

// Helper to create voltage drop chain handler
function createVoltageDropChainHandler() {
  return async (params: {
    currentA: number;
    resistivity: number;
    lengths: Float64Array;
    sections: Float64Array;
    count: number;
  }) => {
    const workerManager = getWorkerManager();
    return workerManager.voltageDropChain(params);
  };
}

// Helper function to create the cable engine API
function createCableEngine() {
  return {
    // Material properties
    getResistivity: createWrappedFunction("get_resistivity"),

    // Voltage drop calculations
    voltageDropSingle: createWrappedFunction("voltage_drop_single"),
    voltageDropThree: createWrappedFunction("voltage_drop_three"),
    voltageDropChain: createVoltageDropChainHandler(),

    // Cross-section calculations
    crossSectionSingle: createWrappedFunction("cross_section_single"),
    crossSectionThree: createWrappedFunction("cross_section_three"),

    // Power and derating
    powerLoss: createWrappedFunction("power_loss"),
    applyDerating: createWrappedFunction("apply_derating"),

    // Utility functions
    roundToStandard: createWrappedFunction("round_to_standard"),
  };
}

// Load cable dimensioning module using Web Worker
// ⚠️ IMPORTANT: This does NOT initialize the worker eagerly.
// Worker and WASM are created lazily on first function call.
// This prevents blocking startup with worker spin-up and WASM compilation.
export async function loadCableDimensioning() {
  // Return engine immediately without initializing worker
  // Worker will be initialized lazily on first function call
  return createCableEngine();
}

// Export type for CableEngine
export type CableEngine = Awaited<ReturnType<typeof loadCableDimensioning>>;
