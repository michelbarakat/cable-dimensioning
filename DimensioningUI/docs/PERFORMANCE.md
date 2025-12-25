# Performance Guide

This document outlines performance optimizations, benchmarks, and best practices for the SmartCraft Sparkline application.

## Architecture Optimizations

### Web Worker Architecture

**Why**: Keeps UI responsive during heavy calculations.

**Implementation**:
- All WASM calculations run in a separate Web Worker thread
- Main thread handles only UI rendering and user interactions
- Message-based communication between threads

**Performance Impact**:
- ✅ UI remains responsive during calculations
- ✅ No blocking of main thread
- ✅ Better user experience

### Lazy WASM Initialization

**Why**: Avoids blocking app startup.

**Implementation**:
- Worker and WASM are created on first function call, not at startup
- `loadCableDimensioning()` returns immediately without initializing worker
- First calculation triggers worker creation and WASM compilation

**Performance Impact**:
- ✅ Faster initial page load
- ✅ Reduced memory usage until needed
- ✅ Better perceived performance

### WASM Loading Strategy

**Why**: Prevents double download and compilation.

**Implementation**:
- WASM files loaded ONLY in Web Worker via `importScripts()`
- NOT included in main bundle
- Single download and compilation

**Performance Impact**:
- ✅ Reduced bundle size (~50% smaller main bundle)
- ✅ Single WASM compilation (not in main thread + worker)
- ✅ Lower memory usage

## Memory Management

### Stack Allocation for Arrays

**Why**: Faster than heap allocation for temporary arrays.

**Implementation**:
- Uses Emscripten stack allocation functions
- Automatically cleaned up when stack pointer restored
- Used for `voltageDropChain` array parameters

**Performance Impact**:
- ✅ Faster than `malloc`/`free`
- ✅ No memory leaks
- ✅ Automatic cleanup

**See**: [WASM Memory Management](./WASM_MEMORY_MANAGEMENT.md) for details.

### Typed Arrays

**Why**: Efficient data transfer to WASM.

**Implementation**:
- Uses `Float64Array` for array parameters
- Direct memory access via `HEAPF64` view
- Efficient copying with `Float64Array.set()`

**Performance Impact**:
- ✅ Fast data transfer
- ✅ Proper alignment and endianness
- ✅ No conversion overhead

## React Optimizations

### Memoization

**When to Use**:
- Expensive calculations: `useMemo`
- Callback functions passed to children: `useCallback`
- Complex component rendering: `React.memo`

**Examples**:
```typescript
// Expensive calculation
const sortedIndices = useMemo(
  () => getSortedSegmentIndices(segments, selectedSegmentIndices),
  [segments, selectedSegmentIndices]
);

// Callback passed to child
const handleClick = useCallback(() => {
  // handler logic
}, [dependencies]);
```

### Component Splitting

**Why**: Reduce re-render scope.

**Implementation**:
- Split large components into smaller ones
- Extract complex logic into custom hooks
- Use composition over large monolithic components

**Example**: `CanvasRenderer` split into `FloorplanLayer`, `DrawingLayer`, `SegmentLine`, etc.

### State Management

**Best Practices**:
- Keep state as local as possible
- Use context only when necessary
- Avoid unnecessary state updates
- Batch related updates

## Canvas Performance

### Konva Optimizations

**Rendering**:
- Use `listening={false}` for non-interactive elements (grid, labels)
- Minimize number of Konva nodes
- Use `Layer` separation for better performance

**Updates**:
- Update only changed elements
- Use `scaleFactor` for coordinate transformations
- Avoid creating new objects in render loops

### Grid Rendering

**Optimization**:
- Grid lines calculated once per viewport change
- Cached in `useGrid` hook
- Only re-rendered when scale or position changes

**Performance Impact**:
- ✅ Smooth scrolling and zooming
- ✅ No lag when panning
- ✅ Efficient memory usage

### Segment Rendering

**Optimization**:
- Segments sorted by selection state for z-index
- Only visible segments rendered
- Labels rendered separately from segments

**Performance Impact**:
- ✅ Handles hundreds of segments smoothly
- ✅ Correct visual layering
- ✅ Efficient updates

## PWA Performance

### Caching Strategy

**WASM Files**:
- CacheFirst strategy
- 1-year expiration
- Critical for offline functionality

**JavaScript Files**:
- CacheFirst strategy
- 30-day expiration
- Auto-updated via service worker

**Static Assets**:
- Automatically cached
- Versioned for cache invalidation

**Performance Impact**:
- ✅ Instant load after first visit
- ✅ Works offline
- ✅ Reduced server load

### Service Worker

**Optimization**:
- Auto-update strategy
- Background updates
- No user interruption

**Performance Impact**:
- ✅ Always up-to-date
- ✅ Seamless updates
- ✅ Better user experience

## Bundle Size Optimization

### Code Splitting

**Current State**:
- Route-based code splitting via TanStack Router
- Lazy loading of routes
- WASM excluded from main bundle

**Potential Improvements**:
- Component-level code splitting
- Dynamic imports for heavy components
- Tree shaking unused code

### Asset Optimization

**Current**:
- Vite handles asset optimization
- WASM files served as static assets
- Images optimized during build

**Bundle Sizes** (approximate):
- Main bundle: ~500KB (gzipped)
- WASM files: ~50KB (gzipped)
- Total initial load: ~550KB

## Calculation Performance

### Benchmark Results

**Single Calculation** (typical):
- Voltage drop single: <1ms
- Cross-section calculation: <1ms
- Power loss: <1ms
- Chain calculation (10 segments): <5ms

**Canvas Operations**:
- Drawing segment: <16ms (60 FPS)
- Panning: <16ms (60 FPS)
- Zooming: <16ms (60 FPS)
- Selection: <16ms (60 FPS)

### Optimization Tips

1. **Batch Calculations**: Group multiple calculations together
2. **Debounce Updates**: Debounce rapid state changes
3. **Lazy Evaluation**: Calculate only when needed
4. **Cache Results**: Cache expensive calculations

## Browser Performance

### Supported Browsers

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support (iOS 14.5+)
- Opera: ✅ Full support

### Performance Considerations

**Memory**:
- WASM memory: ~10MB initial
- Worker memory: ~5MB
- Total: ~15MB typical usage

**CPU**:
- Calculations run in worker (non-blocking)
- Main thread stays responsive
- Efficient WASM execution

## Monitoring Performance

### DevTools

**Performance Tab**:
- Record performance profiles
- Identify bottlenecks
- Monitor frame rates

**Memory Tab**:
- Check for memory leaks
- Monitor WASM memory usage
- Track worker memory

**Network Tab**:
- Monitor asset loading
- Check service worker caching
- Verify offline functionality

### Metrics to Monitor

1. **Time to Interactive (TTI)**: <3 seconds
2. **First Contentful Paint (FCP)**: <1.5 seconds
3. **Largest Contentful Paint (LCP)**: <2.5 seconds
4. **Cumulative Layout Shift (CLS)**: <0.1

## Performance Best Practices

### DO ✅

- Use `useMemo` for expensive calculations
- Use `useCallback` for callbacks passed to children
- Split large components into smaller ones
- Cache calculation results when possible
- Use `listening={false}` for non-interactive Konva elements
- Debounce rapid state updates
- Optimize images and assets

### DON'T ❌

- Don't create new objects in render loops
- Don't update state unnecessarily
- Don't block the main thread
- Don't load WASM in main bundle
- Don't re-render entire canvas on small changes
- Don't ignore memoization opportunities
- Don't create unnecessary worker instances

## Future Optimizations

### Potential Improvements

1. **WebAssembly SIMD**: Use SIMD instructions for vectorized calculations
2. **Web Workers Pool**: Multiple workers for parallel calculations
3. **Virtual Scrolling**: For large numbers of segments
4. **Canvas Offscreen**: Use OffscreenCanvas API
5. **WebGL Rendering**: For complex visualizations
6. **IndexedDB Caching**: Cache calculation results
7. **WebAssembly Threads**: Multi-threaded WASM execution

### Measurement

Before implementing optimizations:
1. Measure current performance
2. Identify bottlenecks
3. Set performance goals
4. Measure after optimization
5. Verify improvement

## Related Documentation

- [API Documentation](./API.md) - Function performance notes
- [WASM Memory Management](./WASM_MEMORY_MANAGEMENT.md) - Memory optimization details
- [README.md](../README.md) - Architecture overview
