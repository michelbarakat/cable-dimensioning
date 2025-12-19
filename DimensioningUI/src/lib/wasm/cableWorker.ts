// Web Worker for WASM cable dimensioning module
// This worker loads and executes WASM functions in a separate thread

// Type declaration for Web Worker global function
declare function importScripts(...urls: string[]): void;

type WorkerRequest = 
  | { type: 'init' }
  | { type: 'call'; id: number; functionName: string; args: any[] }
  | { type: 'voltageDropChain'; id: number; params: {
      currentA: number;
      resistivity: number;
      lengths: Float64Array;
      sections: Float64Array;
      count: number;
    }};

type WorkerResponse =
  | { type: 'init'; success: boolean; error?: string }
  | { type: 'result'; id: number; result: any }
  | { type: 'error'; id: number; error: string };

let moduleReady = false;
let initInProgress = false;
let initPromise: Promise<void> | null = null;

async function initModule(): Promise<void> {
  if (moduleReady) {
    return;
  }

  if (initInProgress && initPromise) {
    return initPromise;
  }

  initInProgress = true;
  initPromise = new Promise(async (resolve, reject) => {
    try {
      const wasmUrl = '/wasm/cable_dimensioning.wasm';
      
      // Pre-check if WASM file is accessible
      const response = await fetch(wasmUrl, { method: 'HEAD' });
      if (!response.ok) {
        reject(new Error(`WASM file not found: ${wasmUrl}`));
        return;
      }

      // Configure Module for worker environment
      (self as any).Module = (self as any).Module || {};
      
      // Set locateFile to provide absolute URL for WASM
      (self as any).Module.locateFile = (path: string, prefix: string) => {
        if (path.endsWith('.wasm')) {
          return `${self.location.origin}/wasm/cable_dimensioning.wasm`;
        }
        return prefix + path;
      };

      // Handle abort errors
      (self as any).Module.onAbort = (reason: string) => {
        reject(new Error(`WASM module aborted: ${reason}`));
      };

      // Handle runtime initialization
      const originalOnRuntimeInitialized = (self as any).Module.onRuntimeInitialized;
      (self as any).Module.onRuntimeInitialized = () => {
        originalOnRuntimeInitialized?.();
        moduleReady = true;
        initInProgress = false;
        resolve();
      };

      // Load WASM script
      (self as any).importScripts('/wasm/cable_dimensioning.js');

      // Check if module is already initialized
      if ((self as any).Module?.cwrap && (self as any).Module.calledRun) {
        moduleReady = true;
        initInProgress = false;
        resolve();
        return;
      }

      // Timeout fallback
      setTimeout(() => {
        if (!moduleReady) {
          initInProgress = false;
          reject(new Error('Timeout waiting for WASM module to initialize'));
        }
      }, 10000);
    } catch (error) {
      initInProgress = false;
      reject(error instanceof Error ? error : new Error(String(error)));
    }
  });

  return initPromise;
}

self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
  const request = e.data;

  try {
    if (request.type === 'init') {
      if (moduleReady) {
        self.postMessage({ type: 'init', success: true } as WorkerResponse);
        return;
      }
      await initModule();
      self.postMessage({ type: 'init', success: true } as WorkerResponse);
      return;
    }

    // Ensure module is initialized before handling requests
    if (!moduleReady) {
      await initModule();
    }

    if (request.type === 'call') {
      const Module = (self as any).Module;
      if (!Module || !Module.cwrap) {
        throw new Error('WASM module not initialized');
      }

      const func = Module.cwrap(request.functionName, 'number', ['number', 'number', 'number', 'number', 'number']);
      const result = func(...request.args);
      
      self.postMessage({
        type: 'result',
        id: request.id,
        result,
      } as WorkerResponse);
    } else if (request.type === 'voltageDropChain') {
      const Module = (self as any).Module;
      if (!Module || !Module._voltage_drop_chain) {
        throw new Error('WASM module not initialized');
      }
      
      // Ensure module has finished running (stack functions are available after calledRun)
      if (!Module.calledRun) {
        throw new Error('WASM module has not finished initialization (calledRun is false)');
      }

      const params = request.params;
      
      // Convert to regular arrays (Float64Array may be serialized as plain object via postMessage)
      let lengthsArray: number[];
      let sectionsArray: number[];
      
      if (Array.isArray(params.lengths)) {
        lengthsArray = params.lengths;
      } else if (params.lengths instanceof Float64Array) {
        lengthsArray = Array.from(params.lengths);
      } else {
        // Handle serialized Float64Array (plain object with numeric indices)
        lengthsArray = [];
        for (let i = 0; i < params.count; i++) {
          lengthsArray[i] = params.lengths[i];
        }
      }
      
      if (Array.isArray(params.sections)) {
        sectionsArray = params.sections;
      } else if (params.sections instanceof Float64Array) {
        sectionsArray = Array.from(params.sections);
      } else {
        // Handle serialized Float64Array (plain object with numeric indices)
        sectionsArray = [];
        for (let i = 0; i < params.count; i++) {
          sectionsArray[i] = params.sections[i];
        }
      }
      
      // Validate inputs
      if (lengthsArray.length !== params.count || sectionsArray.length !== params.count) {
        console.error('Array length mismatch:', {
          lengths: lengthsArray.length,
          sections: sectionsArray.length,
          count: params.count,
          lengthsArray,
          sectionsArray
        });
        throw new Error(`Array length mismatch: lengths=${lengthsArray.length}, sections=${sectionsArray.length}, count=${params.count}`);
      }
      
      // Check for invalid cross-section values
      for (let i = 0; i < sectionsArray.length; i++) {
        if (sectionsArray[i] <= 0 || !isFinite(sectionsArray[i])) {
          console.error('Invalid cross-section:', {
            index: i,
            value: sectionsArray[i],
            allSections: sectionsArray,
            allLengths: lengthsArray
          });
          throw new Error(`Invalid cross-section at index ${i}: ${sectionsArray[i]}`);
        }
      }
      
      // Use stack allocation (the solution we used before)
      // Stack functions are exposed on Module: __emscripten_stack_alloc, __emscripten_stack_restore, _emscripten_stack_get_current
      
      // Get HEAPF64 - it's a global variable in Emscripten code, not on Module
      // Try accessing it as a global first, then create from wasmMemory if needed
      let HEAPF64: Float64Array = (self as any).HEAPF64 || (globalThis as any).HEAPF64;
      
      if (!HEAPF64) {
        // Create HEAPF64 from wasmMemory if not available as global
        const wasmMemory = Module.wasmMemory || Module.memory;
        if (!wasmMemory) {
          throw new Error('HEAPF64 and wasmMemory not available');
        }
        HEAPF64 = new Float64Array(wasmMemory.buffer);
      }
      
      // Use ccall but manually allocate arrays with correct size
      // ccall's array converter allocates arr.length bytes, but we need arr.length * 8 bytes for Float64
      // So we'll use ccall's internal stack mechanism but allocate arrays ourselves
      if (!Module.ccall) {
        throw new Error('ccall not available');
      }
      
      // Access ccall's internal stack functions through closure or recreate the logic
      // Since we can't access them directly, we'll use ccall but pass arrays as 'number' pointers
      // by manually allocating and copying first
      
      // Try to access stack functions - they might be available after module initialization
      let stackAlloc: ((size: number) => number) | undefined;
      let stackRestore: ((ptr: number) => void) | undefined;
      let stackGetCurrent: (() => number) | undefined;
      
      // Try various access patterns
      stackAlloc = Module.__emscripten_stack_alloc || 
                   Module["__emscripten_stack_alloc"] ||
                   (Module as any).__emscripten_stack_alloc;
      stackRestore = Module.__emscripten_stack_restore || 
                     Module["__emscripten_stack_restore"] ||
                     (Module as any).__emscripten_stack_restore;
      stackGetCurrent = Module._emscripten_stack_get_current || 
                        Module["_emscripten_stack_get_current"] ||
                        (Module as any)._emscripten_stack_get_current;
      
      if (stackAlloc && stackRestore && stackGetCurrent) {
        // Use stack allocation directly
        const stackPtr = stackGetCurrent();
        try {
          const lengthsBytes = params.count * 8;
          const sectionsBytes = params.count * 8;
          const lengthsPtr = stackAlloc(lengthsBytes);
          const sectionsPtr = stackAlloc(sectionsBytes);
          
          if (!lengthsPtr || !sectionsPtr) {
            throw new Error('Failed to allocate stack memory');
          }
          
          const lengthsOffset = lengthsPtr / 8;
          const sectionsOffset = sectionsPtr / 8;
          HEAPF64.set(lengthsArray, lengthsOffset);
          HEAPF64.set(sectionsArray, sectionsOffset);
          
          const result = Module._voltage_drop_chain(
            params.currentA,
            params.resistivity,
            lengthsPtr,
            sectionsPtr,
            params.count
          );
          
          self.postMessage({
            type: 'result',
            id: request.id,
            result,
          } as WorkerResponse);
          return;
        } finally {
          stackRestore(stackPtr);
        }
      }
      
      // Fallback: Stack functions not directly accessible, use JavaScript loop
      // Call voltageDropSingle for each segment and sum the results
      // This is slower but guaranteed correct and doesn't require stack allocation
      if (!Module._voltage_drop_single) {
        throw new Error('voltage_drop_single function not available');
      }
      
      let total = 0.0;
      for (let i = 0; i < params.count; i++) {
        const segmentDrop = Module._voltage_drop_single(
          params.currentA,
          lengthsArray[i],
          params.resistivity,
          sectionsArray[i]
        );
        
        if (segmentDrop < 0) {
          throw new Error(`Invalid input for segment ${i}: length=${lengthsArray[i]}, section=${sectionsArray[i]}`);
        }
        
        total += segmentDrop;
      }
      
      self.postMessage({
        type: 'result',
        id: request.id,
        result: total,
      } as WorkerResponse);
    }
  } catch (error) {
    self.postMessage({
      type: 'error',
      id: request.type === 'init' ? 0 : request.id,
      error: error instanceof Error ? error.message : String(error),
    } as WorkerResponse);
  }
};
