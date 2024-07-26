#version 300 es

precision highp float;
out vec4 outColor;

uniform float opacity;

in vec3 hoge;

void main() {
    float alpha = opacity * exp(hoge.z);
    // float alpha = opacity;
    outColor = vec4(1.0f, 1.0f, 1.0f, alpha);
    // outColor = vec4(alpha, alpha, alpha, 1.0f);
}
