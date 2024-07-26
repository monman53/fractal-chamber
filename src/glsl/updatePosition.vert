#version 300 es

#include ./utils.glsl
vec4 openSimplex2SDerivatives_ImproveXY(vec3);
float rand(vec2);

in vec3 oldPosition;
in vec3 oldVelocity;

uniform float time;
uniform float deltaTime;
uniform vec2 canvasDimensions;
uniform float simplexResolution;
uniform float simplexScale;
uniform float simplexTimeScale;
uniform float k;
uniform float diffusion;
uniform float gravity;

out vec3 newPosition;
out vec3 newVelocity;

vec2 euclideanModulo(vec2 n, vec2 m) {
    if(n.x > m.x * 0.5f) {
        n.x -= m.x;
    } else if(n.x < -m.x * 0.5f) {
        n.x += m.x;
    }
    if(n.y > m.y * 0.5f) {
        n.y -= m.y;
    } else if(n.y < -m.y * 0.5f) {
        n.y += m.y;
    }
    return n;
  	//return mod(mod(n, m) + m, m);
}

void main() {
    vec4 random = openSimplex2SDerivatives_ImproveXY(vec3(oldPosition.xy * simplexResolution, time * simplexTimeScale));
    newPosition.xy = euclideanModulo(oldPosition.xy + oldVelocity.xy * deltaTime, canvasDimensions);
    newPosition.z = oldPosition.z + oldVelocity.z * deltaTime;
    float m = 1.0f;
    vec3 accel;
    accel.xy = simplexScale * random.xy - k / m * oldVelocity.xy + vec2(rand(oldPosition.xy) - 0.5f, rand(oldPosition.xy + 0.1f) - 0.5f) * diffusion;
    accel.z = gravity;
    newVelocity = oldVelocity + accel * deltaTime;
}