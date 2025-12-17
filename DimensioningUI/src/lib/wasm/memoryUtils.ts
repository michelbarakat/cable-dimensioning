// Memory management utilities for Emscripten WASM

// Helper to get stack allocation functions
export function getStackFunctions(Module: any) {
  return {
    stackAlloc:
      Module.__emscripten_stack_alloc ||
      Module["__emscripten_stack_alloc"] ||
      (window as any).__emscripten_stack_alloc,
    stackRestore:
      Module.__emscripten_stack_restore ||
      Module["__emscripten_stack_restore"] ||
      (window as any).__emscripten_stack_restore,
    stackGetCurrent:
      Module._emscripten_stack_get_current ||
      Module["_emscripten_stack_get_current"] ||
      (window as any)._emscripten_stack_get_current,
  };
}

// Helper to check if all stack functions are available
export function hasStackFunctions(
  stackFuncs: ReturnType<typeof getStackFunctions>
): boolean {
  return (
    !!stackFuncs.stackAlloc &&
    !!stackFuncs.stackRestore &&
    !!stackFuncs.stackGetCurrent
  );
}

// Helper to get HEAPF64 view of WASM memory
export function getHEAPF64(Module: any): Float64Array {
  // @ts-ignore - HEAPF64 is a global created by Emscripten
  let HEAPF64: Float64Array = (window as any).HEAPF64 || (globalThis as any).HEAPF64;

  if (!HEAPF64) {
    const wasmMemory = Module.wasmMemory || Module.memory;
    if (!wasmMemory) {
      throw new Error("HEAPF64 not available");
    }
    HEAPF64 = new Float64Array(wasmMemory.buffer);
  }

  return HEAPF64;
}

