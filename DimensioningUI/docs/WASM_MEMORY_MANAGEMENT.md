# WebAssembly Memory Management for Array Passing

## Overview

This document explains the technical implementation of passing JavaScript arrays to C functions compiled with Emscripten. The `voltageDropChain` function in `cable_dimensioning.ts` demonstrates this pattern.

## The Challenge

JavaScript arrays cannot be passed directly to C functions. C functions expect pointers to contiguous memory, but JavaScript arrays are not directly accessible from WebAssembly (WASM) memory space.

## Solution: Stack Allocation with Manual Memory Management

### Memory Management Strategy

We use **stack allocation** as the primary method for passing arrays to C functions:

1. **Stack Allocation** (Primary Method):
   - Uses Emscripten's stack allocation functions
   - Faster than heap allocation
   - Automatically cleaned up when stack pointer is restored
   - Functions: `__emscripten_stack_alloc`, `__emscripten_stack_restore`, `_emscripten_stack_get_current`

2. **Memory Layout**:
   - WASM memory is a linear array of bytes
   - `HEAPF64` is a `Float64Array` view of this memory (8 bytes per double)
   - To write doubles: convert byte pointer to double index (divide by 8)
   - Example: byte pointer 16 → double index 2 (16 / 8 = 2)

3. **Data Copying**:
   - `Float64Array.set()` copies doubles correctly (not bytes)
   - Ensures proper endianness and alignment
   - C function receives valid pointers to double arrays

### Implementation Steps

1. **Access Stack Functions**:
   ```typescript
   const stackAlloc = Module.__emscripten_stack_alloc || 
                      Module["__emscripten_stack_alloc"] || 
                      window.__emscripten_stack_alloc;
   ```

2. **Get HEAPF64 View**:
   ```typescript
   let HEAPF64 = window.HEAPF64 || 
                 new Float64Array(wasmMemory.buffer);
   ```

3. **Save Stack Pointer**:
   ```typescript
   const stackPtr = stackGetCurrent();
   ```

4. **Allocate Memory**:
   ```typescript
   const lengthsBytes = count * 8;  // 8 bytes per double
   const lengthsPtr = stackAlloc(lengthsBytes);
   ```

5. **Copy Data**:
   ```typescript
   const lengthsOffset = lengthsPtr / 8;  // Convert byte pointer to double index
   HEAPF64.set(lengths, lengthsOffset);
   ```

6. **Call C Function**:
   ```typescript
   const result = voltageDropChainFunc(
     currentA, resistivity, lengthsPtr, sectionsPtr, count
   );
   ```

7. **Restore Stack** (in `finally` block):
   ```typescript
   stackRestore(stackPtr);  // Automatically frees all allocated memory
   ```

## Fallback Mechanisms

If stack functions aren't accessible (e.g., in some Emscripten versions), we use a three-tier fallback system:

### Fallback 1: ccall with Array Types

```typescript
const result = Module.ccall(
  "voltage_drop_chain",
  "number",
  ["number", "number", "array", "array", "number"],
  [currentA, resistivity, lengthsArray, sectionsArray, count]
);
```

**Warning**: `ccall`'s array converter writes bytes, not doubles, so results may be incorrect for double arrays.

### Fallback 2: JavaScript Loop

If `ccall` returns an error (-1), fall back to JavaScript:

```typescript
let total = 0;
for (let i = 0; i < count; i++) {
  total += voltageDropSingle(currentA, lengths[i], resistivity, sections[i]);
}
```

This is slower but guaranteed correct.

## Why Stack Allocation?

- **Performance**: Faster than heap allocation (`_malloc`/`_free`)
- **Safety**: Automatically cleaned up when stack pointer is restored
- **No Leaks**: No risk of memory leaks
- **Efficiency**: Better for temporary arrays used only during function call

## Performance Considerations

| Method | Speed | Correctness | Notes |
|--------|-------|-------------|-------|
| Stack allocation | Fastest | ✅ Correct | Runs entirely in WASM |
| ccall arrays | Medium | ⚠️ May be incorrect | Writes bytes, not doubles |
| JavaScript loop | Slowest | ✅ Correct | Non-blocking but slower |

## Technical Details

### Memory Access Patterns

Emscripten provides several typed array views of WASM memory:

- `HEAP8` / `HEAPU8`: Int8Array / Uint8Array (1 byte per element)
- `HEAP16` / `HEAPU16`: Int16Array / Uint16Array (2 bytes per element)
- `HEAP32` / `HEAPU32`: Int32Array / Uint32Array (4 bytes per element)
- `HEAPF32`: Float32Array (4 bytes per element)
- `HEAPF64`: Float64Array (8 bytes per element) ← **We use this**

### Pointer Arithmetic

When working with doubles:
- Byte pointer: `0, 8, 16, 24, ...`
- Double index: `0, 1, 2, 3, ...`
- Conversion: `doubleIndex = bytePointer / 8`

### Stack vs Heap

**Stack Allocation**:
- ✅ Faster
- ✅ Auto-cleanup
- ✅ No manual free needed
- ❌ Limited size
- ❌ Must restore stack pointer

**Heap Allocation**:
- ✅ Larger size available
- ✅ More flexible
- ❌ Slower
- ❌ Must manually free
- ❌ Risk of leaks if not freed

## Code Example

See `DimensioningUI/src/lib/cable_dimensioning.ts`, specifically the `voltageDropChain` function implementation.

## References

- [Emscripten Documentation](https://emscripten.org/docs/api_reference/emscripten.h.html)
- [WebAssembly Memory](https://developer.mozilla.org/en-US/docs/WebAssembly/Understanding_the_text_format#memory)
- [Emscripten Stack Functions](https://emscripten.org/docs/api_reference/emscripten.h.html#c.stack-allocation)

