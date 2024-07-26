#version 300 es

#include ./utils.glsl
vec4 openSimplex2SDerivatives_ImproveXY(vec3);

in vec2 oldPosition;
in vec2 oldVelocity;

uniform float time;
uniform float deltaTime;
uniform vec2 canvasDimensions;

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
    vec4 random = openSimplex2SDerivatives_ImproveXY(vec3(oldPosition.xy / 100.f, time));
    newPosition = euclideanModulo(oldPosition + oldVelocity * deltaTime, canvasDimensions);
    // newPosition = oldPosition + oldVelocity * deltaTime;
    float m = 1.0f;
    float k = 1.0f;
    vec2 accel = 100.f * random.xy - k / m * oldVelocity;
    newVelocity = oldVelocity + accel * deltaTime; 
    // newVelocity = oldVelocity + random.xy;
}