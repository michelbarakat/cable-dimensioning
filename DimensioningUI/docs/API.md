# Cable Engine API Documentation

This document describes the Cable Engine API, which provides electrical engineering calculations through WebAssembly.

## Overview

The Cable Engine is a WebAssembly module that runs in a Web Worker, providing high-performance calculations for cable dimensioning. All functions are asynchronous and execute off the main thread to keep the UI responsive.

## Initialization

```typescript
import { loadCableDimensioning, type CableEngine } from './lib/cable_dimensioning';

const cableEngine: CableEngine = await loadCableDimensioning();
```

**Note**: The engine is lazily initialized. The worker and WASM are created on the first function call, not during `loadCableDimensioning()`.

## API Reference

### Material Properties

#### `getResistivity(isCopper: boolean, temperatureC: number): Promise<number>`

Calculates the resistivity of a material at a given temperature.

**Parameters:**
- `isCopper` (boolean): `true` for copper, `false` for aluminum
- `temperatureC` (number): Temperature in Celsius

**Returns:** `Promise<number>` - Resistivity in Ω·mm²/m

**Example:**
```typescript
const resistivity = await cableEngine.getResistivity(true, 20); // Copper at 20°C
// Returns: ~0.017241 Ω·mm²/m
```

**Default Values:**
- Copper at 20°C: 0.017241 Ω·mm²/m
- Aluminum at 20°C: 0.028265 Ω·mm²/m

---

### Voltage Drop Calculations

#### `voltageDropSingle(currentA: number, lengthM: number, resistivity: number, crossSection: number): Promise<number>`

Calculates voltage drop for a single-phase circuit.

**Formula:** `ΔV = (2 × L × ρ × I) / S`

**Parameters:**
- `currentA` (number): Current in Amperes
- `lengthM` (number): Cable length in meters
- `resistivity` (number): Material resistivity in Ω·mm²/m
- `crossSection` (number): Cross-section area in mm²

**Returns:** `Promise<number>` - Voltage drop in Volts

**Example:**
```typescript
const voltageDrop = await cableEngine.voltageDropSingle(16, 25, 0.0175, 2.5);
// Returns voltage drop in volts
```

---

#### `voltageDropThree(currentA: number, lengthM: number, resistivity: number, crossSection: number): Promise<number>`

Calculates voltage drop for a three-phase circuit.

**Formula:** `ΔV = (√3 × L × ρ × I) / S`

**Parameters:**
- `currentA` (number): Current in Amperes
- `lengthM` (number): Cable length in meters
- `resistivity` (number): Material resistivity in Ω·mm²/m
- `crossSection` (number): Cross-section area in mm²

**Returns:** `Promise<number>` - Voltage drop in Volts

**Example:**
```typescript
const voltageDrop = await cableEngine.voltageDropThree(16, 25, 0.0175, 2.5);
// Returns voltage drop in volts
```

---

#### `voltageDropChain(params: VoltageDropChainParams): Promise<number>`

Calculates total voltage drop for a chain of cable segments.

**Parameters:**
```typescript
type VoltageDropChainParams = {
  currentA: number;           // Current in Amperes
  resistivity: number;        // Material resistivity in Ω·mm²/m
  lengths: Float64Array;      // Array of segment lengths in meters
  sections: Float64Array;    // Array of cross-section areas in mm²
  count: number;             // Number of segments
};
```

**Returns:** `Promise<number>` - Total voltage drop in Volts

**Example:**
```typescript
const lengths = new Float64Array([10, 15, 20]); // meters
const sections = new Float64Array([2.5, 4, 6]); // mm²

const totalVoltageDrop = await cableEngine.voltageDropChain({
  currentA: 16,
  resistivity: 0.0175,
  lengths,
  sections,
  count: 3
});
```

**Note**: This function uses stack allocation for memory management. See [WASM Memory Management](./WASM_MEMORY_MANAGEMENT.md) for details.

---

### Cross-Section Calculations

#### `crossSectionSingle(currentA: number, lengthM: number, resistivity: number, maxDropV: number): Promise<number>`

Calculates required cross-section for single-phase circuit to meet maximum voltage drop.

**Formula:** `S = (2 × L × ρ × I) / ΔV`

**Parameters:**
- `currentA` (number): Current in Amperes
- `lengthM` (number): Cable length in meters
- `resistivity` (number): Material resistivity in Ω·mm²/m
- `maxDropV` (number): Maximum allowed voltage drop in Volts

**Returns:** `Promise<number>` - Required cross-section in mm²

**Returns:** `-1` if `maxDropV <= 0` (invalid input)

**Example:**
```typescript
const crossSection = await cableEngine.crossSectionSingle(16, 25, 0.0175, 3);
// Returns required cross-section in mm²
```

---

#### `crossSectionThree(currentA: number, lengthM: number, resistivity: number, maxDropV: number): Promise<number>`

Calculates required cross-section for three-phase circuit to meet maximum voltage drop.

**Formula:** `S = (√3 × L × ρ × I) / ΔV`

**Parameters:**
- `currentA` (number): Current in Amperes
- `lengthM` (number): Cable length in meters
- `resistivity` (number): Material resistivity in Ω·mm²/m
- `maxDropV` (number): Maximum allowed voltage drop in Volts

**Returns:** `Promise<number>` - Required cross-section in mm²

**Returns:** `-1` if `maxDropV <= 0` (invalid input)

**Example:**
```typescript
const crossSection = await cableEngine.crossSectionThree(16, 25, 0.0175, 3);
// Returns required cross-section in mm²
```

---

### Power Loss

#### `powerLoss(currentA: number, lengthM: number, resistivity: number, crossSection: number): Promise<number>`

Calculates power loss in a cable.

**Formula:** `P = I² × R`, where `R = (2 × L × ρ) / S`

**Parameters:**
- `currentA` (number): Current in Amperes
- `lengthM` (number): Cable length in meters
- `resistivity` (number): Material resistivity in Ω·mm²/m
- `crossSection` (number): Cross-section area in mm²

**Returns:** `Promise<number>` - Power loss in Watts

**Returns:** `-1` if `crossSection <= 0` (invalid input)

**Example:**
```typescript
const powerLoss = await cableEngine.powerLoss(16, 25, 0.0175, 2.5);
// Returns power loss in watts
```

---

### Derating

#### `applyDerating(baseCurrent: number, kTemp: number, kGroup: number): Promise<number>`

Applies derating factors to base current based on temperature and grouping.

**Formula:** `I_derated = I_base × kTemp × kGroup`

**Parameters:**
- `baseCurrent` (number): Base current rating in Amperes
- `kTemp` (number): Temperature derating factor (default: 1.0 if <= 0)
- `kGroup` (number): Grouping derating factor (default: 1.0 if <= 0)

**Returns:** `Promise<number>` - Derated current in Amperes

**Example:**
```typescript
const deratedCurrent = await cableEngine.applyDerating(20, 0.91, 1.0);
// Applies temperature derating factor of 0.91 (Warm Space)
```

**Common Derating Factors:**
- Normal Indoor (20°C): 1.08
- Warm Space (40°C): 0.91
- Hot Area (50°C): 0.82

---

### Utility Functions

#### `roundToStandard(requested: number): Promise<number>`

Rounds a cross-section value to the nearest standard cable size.

**Parameters:**
- `requested` (number): Requested cross-section in mm²

**Returns:** `Promise<number>` - Standard cross-section size in mm²

**Standard Sizes:** The function rounds up to the nearest standard size from a predefined list.

**Example:**
```typescript
const standardSize = await cableEngine.roundToStandard(3.2);
// Returns: 4 (next standard size)
```

---

## Error Handling

All functions return promises that may reject on errors:

```typescript
try {
  const result = await cableEngine.voltageDropSingle(16, 25, 0.0175, 2.5);
} catch (error) {
  console.error('Calculation error:', error);
  // Handle error
}
```

**Common Error Scenarios:**
- Worker initialization failure
- WASM module not loaded
- Invalid input parameters (some functions return -1 instead of throwing)
- Network errors (only during initial WASM load)

---

## Input Validation

The application includes input validation ranges:

```typescript
// From src/lib/ranges.ts
RANGES = {
  CROSS_SECTION: { MIN: 1.5, MAX: 35 },      // mm²
  CURRENT: { MIN: 0.1, MAX: 1000 },         // A
  RESISTIVITY: { MIN: 0.001, MAX: 1.0 },     // Ω·mm²/m
  LENGTH: { MIN: 0.01, MAX: 10000 },        // m
  VOLTAGE_DROP: { MIN: 0.001, MAX: 1000 },   // V
}
```

**Note**: The WASM functions themselves don't validate inputs. Validation should be performed in the application layer before calling these functions.

---

## Performance Considerations

- **Lazy Initialization**: Worker and WASM are created on first function call
- **Web Worker**: All calculations run off the main thread
- **Async API**: All functions return promises to avoid blocking
- **Memory Management**: Stack allocation used for array parameters (see [WASM Memory Management](./WASM_MEMORY_MANAGEMENT.md))

---

## Type Definitions

```typescript
export type CableEngine = {
  // Material properties
  getResistivity: (isCopper: boolean, temperatureC: number) => Promise<number>;
  
  // Voltage drop calculations
  voltageDropSingle: (currentA: number, lengthM: number, resistivity: number, crossSection: number) => Promise<number>;
  voltageDropThree: (currentA: number, lengthM: number, resistivity: number, crossSection: number) => Promise<number>;
  voltageDropChain: (params: VoltageDropChainParams) => Promise<number>;
  
  // Cross-section calculations
  crossSectionSingle: (currentA: number, lengthM: number, resistivity: number, maxDropV: number) => Promise<number>;
  crossSectionThree: (currentA: number, lengthM: number, resistivity: number, maxDropV: number) => Promise<number>;
  
  // Power and derating
  powerLoss: (currentA: number, lengthM: number, resistivity: number, crossSection: number) => Promise<number>;
  applyDerating: (baseCurrent: number, kTemp: number, kGroup: number) => Promise<number>;
  
  // Utility functions
  roundToStandard: (requested: number) => Promise<number>;
};
```

---

## Related Documentation

- [WASM Memory Management](./WASM_MEMORY_MANAGEMENT.md) - Details on array passing and memory management
- [Performance Guide](./PERFORMANCE.md) - Performance optimizations and benchmarks
- [README.md](../README.md) - Project overview and architecture
