#version 300 es

#include ./utils.glsl
vec4 openSimplex2SDerivatives_ImproveXY(vec3);
float rand(vec2);

in vec2 oldPosition;
in vec2 oldVelocity;

uniform float time;
uniform float deltaTime;
uniform vec2 canvasDimensions;
uniform float simplexResolution;
uniform float simplexScale;
uniform float simplexTimeScale;
uniform float k;

out vec2 newPosition;
out vec2 newVelocity;

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
    newPosition = euclideanModulo(oldPosition + oldVelocity * deltaTime, canvasDimensions);
    float m = 1.0f;
    vec2 accel = simplexScale * random.xy - k / m * oldVelocity + vec2(rand(oldPosition.xy) - 0.5f, rand(oldPosition.xy + 0.1f) - 0.5f) * 300.f;
    newVelocity = oldVelocity + accel * deltaTime;
}