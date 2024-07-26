#version 300 es

in vec2 oldPosition;
in vec2 oldVelocity;

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
    newPosition = euclideanModulo(oldPosition + oldVelocity * deltaTime, canvasDimensions);
    newVelocity = oldVelocity + vec2(0.01f);
}