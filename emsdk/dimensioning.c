#include <emscripten/emscripten.h>

EMSCRIPTEN_KEEPALIVE
double calculate_cable_diameter(double current, double length, double material_constant) {
    return (current * length) / material_constant;
}

EMSCRIPTEN_KEEPALIVE
double calculate_pipe_diameter(double flow_rate, double pressure_drop) {
    return flow_rate / pressure_drop;
}

