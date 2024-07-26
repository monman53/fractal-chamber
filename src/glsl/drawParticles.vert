#version 300 es

in vec4 position;
uniform mat4 matrix;

out vec3 hoge;

void main() {
    vec4 pos = matrix * position;
    hoge = pos.xyz;
    // gl_Position = vec4(pos.xy, -pos.z / 100.f, 1);
    gl_Position = vec4(pos.xy, 0, 1);
    gl_PointSize = 1.0f;
}