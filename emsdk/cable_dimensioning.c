#include <emscripten/emscripten.h>
#include <math.h>
#include <stdlib.h>

// ---- MATERIAL CONSTANTS ----
#define TEMP_COEFF_CU 0.00393
#define TEMP_COEFF_AL 0.00403
#define RHO_CU_20C 0.017241  // ohm·mm²/m
#define RHO_AL_20C 0.028265  // ohm·mm²/m

// ---- STANDARD CONDUCTOR SIZES (mm²) ----
static const double STANDARD_SIZES[] = {
  1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240
};
static const int STANDARD_COUNT = sizeof(STANDARD_SIZES) / sizeof(STANDARD_SIZES[0]);

// ---- MATERIAL PROPERTIES ----
EMSCRIPTEN_KEEPALIVE
double get_resistivity(int isCopper, double temperatureC) {
  double rho = isCopper ? RHO_CU_20C : RHO_AL_20C;
  double alpha = isCopper ? TEMP_COEFF_CU : TEMP_COEFF_AL;
  return rho * (1.0 + alpha * (temperatureC - 20.0));
}

// ---- VOLTAGE DROP ----

// Single-phase: ΔU = I × 2 × L × ρ / S
EMSCRIPTEN_KEEPALIVE
double voltage_drop_single(double currentA, double lengthM, double resistivity, double crossSection) {
  if (crossSection <= 0.0) return -1;
  return currentA * 2.0 * lengthM * resistivity / crossSection;
}

// Three-phase: ΔU = √3 × I × L × ρ / S
EMSCRIPTEN_KEEPALIVE
double voltage_drop_three(double currentA, double lengthM, double resistivity, double crossSection) {
  if (crossSection <= 0.0) return -1;
  return sqrt(3.0) * currentA * lengthM * resistivity / crossSection;
}

// Chain voltage drop for multiple segments (single-phase)
EMSCRIPTEN_KEEPALIVE
double voltage_drop_chain(double currentA, double resistivity, double* lengths, double* sections, int count) {
  if (!lengths || !sections || count <= 0) return -1;
  double total = 0.0;
  for (int i = 0; i < count; ++i) {
    total += voltage_drop_single(currentA, lengths[i], resistivity, sections[i]);
  }
  return total;
}

// ---- SIZING ----

// Required cross-section (single-phase): S = (2 × L × ρ × I) / ΔU
EMSCRIPTEN_KEEPALIVE
double cross_section_single(double currentA, double lengthM, double resistivity, double maxDropV) {
  if (maxDropV <= 0) return -1;
  return (2.0 * lengthM * resistivity * currentA) / maxDropV;
}

// Three-phase version: S = (√3 × L × ρ × I) / ΔU
EMSCRIPTEN_KEEPALIVE
double cross_section_three(double currentA, double lengthM, double resistivity, double maxDropV) {
  if (maxDropV <= 0) return -1;
  return (sqrt(3.0) * lengthM * resistivity * currentA) / maxDropV;
}

// ---- POWER LOSS ----

// Power loss (single-phase): P = I² × R,  R = 2Lρ/S
EMSCRIPTEN_KEEPALIVE
double power_loss(double currentA, double lengthM, double resistivity, double crossSection) {
  if (crossSection <= 0) return -1;
  double R = (2.0 * lengthM * resistivity) / crossSection;
  return currentA * currentA * R;
}

// ---- DERATING ----
EMSCRIPTEN_KEEPALIVE
double apply_derating(double baseCurrent, double kTemp, double kGroup) {
  if (kTemp <= 0) kTemp = 1;
  if (kGroup <= 0) kGroup = 1;
  return baseCurrent * kTemp * kGroup;
}

// ---- STANDARD SIZE ROUNDING ----
EMSCRIPTEN_KEEPALIVE
double round_to_standard(double requested) {
  for (int i = 0; i < STANDARD_COUNT; ++i)
    if (STANDARD_SIZES[i] >= requested) return STANDARD_SIZES[i];
  return requested;
}

