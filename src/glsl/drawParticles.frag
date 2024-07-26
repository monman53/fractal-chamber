#version 300 es

precision highp float;
out vec4 outColor;

uniform float opacity;

void main() {
    outColor = vec4(1, 1, 1, opacity);
}
