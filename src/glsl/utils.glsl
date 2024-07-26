// #version 300 es
/////////////// K.jpg's Re-oriented 8-Point BCC Noise (OpenSimplex2S) ////////////////
////////////////////// Output: vec4(dF/dx, dF/dy, dF/dz, value) //////////////////////

// Borrowed from Stefan Gustavson's noise code
vec4 permute(vec4 t) {
    return t * (t * 34.0 + 133.0);
}

// Gradient set is a normalized expanded rhombic dodecahedron
vec3 grad(float hash) {

    // Random vertex of a cube, +/- 1 each
    vec3 cube = mod(floor(hash / vec3(1.0, 2.0, 4.0)), 2.0) * 2.0 - 1.0;

    // Random edge of the three edges connected to that vertex
    // Also a cuboctahedral vertex
    // And corresponds to the face of its dual, the rhombic dodecahedron
    vec3 cuboct = cube;
    cuboct[int(hash / 16.0)] = 0.0;

    // In a funky way, pick one of the four points on the rhombic face
    float type = mod(floor(hash / 8.0), 2.0);
    vec3 rhomb = (1.0 - type) * cube + type * (cuboct + cross(cube, cuboct));

    // Expand it so that the new edges are the same length
    // as the existing ones
    vec3 grad = cuboct * 1.22474487139 + rhomb;

    // To make all gradients the same length, we only need to shorten the
    // second type of vector. We also put in the whole noise scale constant.
    // The compiler should reduce it into the existing floats. I think.
    grad *= (1.0 - 0.042942436724648037 * type) * 3.5946317686139184;

    return grad;
}

// BCC lattice split up into 2 cube lattices
vec4 openSimplex2SDerivativesPart(vec3 X) {
    vec3 b = floor(X);
    vec4 i4 = vec4(X - b, 2.5);

    // Pick between each pair of oppposite corners in the cube.
    vec3 v1 = b + floor(dot(i4, vec4(.25)));
    vec3 v2 = b + vec3(1, 0, 0) + vec3(-1, 1, 1) * floor(dot(i4, vec4(-.25, .25, .25, .35)));
    vec3 v3 = b + vec3(0, 1, 0) + vec3(1, -1, 1) * floor(dot(i4, vec4(.25, -.25, .25, .35)));
    vec3 v4 = b + vec3(0, 0, 1) + vec3(1, 1, -1) * floor(dot(i4, vec4(.25, .25, -.25, .35)));

    // Gradient hashes for the four vertices in this half-lattice.
    vec4 hashes = permute(mod(vec4(v1.x, v2.x, v3.x, v4.x), 289.0));
    hashes = permute(mod(hashes + vec4(v1.y, v2.y, v3.y, v4.y), 289.0));
    hashes = mod(permute(mod(hashes + vec4(v1.z, v2.z, v3.z, v4.z), 289.0)), 48.0);

    // Gradient extrapolations & kernel function
    vec3 d1 = X - v1;
    vec3 d2 = X - v2;
    vec3 d3 = X - v3;
    vec3 d4 = X - v4;
    vec4 a = max(0.75 - vec4(dot(d1, d1), dot(d2, d2), dot(d3, d3), dot(d4, d4)), 0.0);
    vec4 aa = a * a;
    vec4 aaaa = aa * aa;
    vec3 g1 = grad(hashes.x);
    vec3 g2 = grad(hashes.y);
    vec3 g3 = grad(hashes.z);
    vec3 g4 = grad(hashes.w);
    vec4 extrapolations = vec4(dot(d1, g1), dot(d2, g2), dot(d3, g3), dot(d4, g4));

    // Derivatives of the noise
    vec3 derivative = -8.0 * mat4x3(d1, d2, d3, d4) * (aa * a * extrapolations) + mat4x3(g1, g2, g3, g4) * aaaa;

    // Return it all as a vec4
    return vec4(derivative, dot(aaaa, extrapolations));
}

// Use this if you don't want Z to look different from X and Y
vec4 openSimplex2SDerivatives_Conventional(vec3 X) {
    X = dot(X, vec3(2.0 / 3.0)) - X;

    vec4 result = openSimplex2SDerivativesPart(X) + openSimplex2SDerivativesPart(X + 144.5);

    return vec4(dot(result.xyz, vec3(2.0 / 3.0)) - result.xyz, result.w);
}

// Use this if you want to show X and Y in a plane, then use Z for time, vertical, etc.
vec4 openSimplex2SDerivatives_ImproveXY(vec3 X) {

    // Not a skew transform.
    mat3 orthonormalMap = mat3(0.788675134594813, -0.211324865405187, -0.577350269189626, -0.211324865405187, 0.788675134594813, -0.577350269189626, 0.577350269189626, 0.577350269189626, 0.577350269189626);

    X = orthonormalMap * X;
    vec4 result = openSimplex2SDerivativesPart(X) + openSimplex2SDerivativesPart(X + 144.5);

    return vec4(result.xyz * orthonormalMap, result.w);
}

//////////////////////////////// End noise code ////////////////////////////////

float noise(vec2 co) {
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}
// float rand(float n) {
//     return fract(sin(n) * 43758.5453123f);
// }

// float noise(float p) {
//     float fl = floor(p);
//     float fc = fract(p);
//     return mix(rand(fl), rand(fl + 1.0f), fc);
// }
// float noise(vec2 n) {
//     const vec2 d = vec2(0.0f, 1.0f);
//     vec2 b = floor(n), f = smoothstep(vec2(0.0f), vec2(1.0f), fract(n));
//     return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);
// }

//	<https://www.shadertoy.com/view/4dS3Wd>
//	By Morgan McGuire @morgan3d, http://graphicscodex.com
//
// float hash(float n) {
//     return fract(sin(n) * 1e4);
// }
// float hash(vec2 p) {
//     return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x))));
// }

// float noise(float x) {
//     float i = floor(x);
//     float f = fract(x);
//     float u = f * f * (3.0 - 2.0 * f);
//     return mix(hash(i), hash(i + 1.0), u);
// }

// float noise(vec2 x) {
//     vec2 i = floor(x);
//     vec2 f = fract(x);

// 	// Four corners in 2D of a tile
//     float a = hash(i);
//     float b = hash(i + vec2(1.0, 0.0));
//     float c = hash(i + vec2(0.0, 1.0));
//     float d = hash(i + vec2(1.0, 1.0));

// 	// Simple 2D lerp using smoothstep envelope between the values.
// 	// return vec3(mix(mix(a, b, smoothstep(0.0, 1.0, f.x)),
// 	//			mix(c, d, smoothstep(0.0, 1.0, f.x)),
// 	//			smoothstep(0.0, 1.0, f.y)));

// 	// Same code, with the clamps in smoothstep and common subexpressions
// 	// optimized away.
//     vec2 u = f * f * (3.0 - 2.0 * f);
//     return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
// }