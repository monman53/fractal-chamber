#version 300 es

out vec4 newPosition;
out vec4 newVelocity;

void main() {
    newPosition = vec4(0, 0, -100, 1);
    newVelocity = vec4(0.f);
}