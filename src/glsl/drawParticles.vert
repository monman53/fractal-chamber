#version 300 es

in vec4 position;
uniform mat4 matrix;

void main() {
    gl_Position = matrix * position + vec4(-0.f, -0.f, 0.f, 0.f);
    gl_PointSize = 1.0f;
}