<script setup lang="ts">
import { onMounted, ref, watch, type Ref } from 'vue';
import { app } from './main';

// Shaders
import updatePositionVS from './glsl/updatePosition.vert'
import updatePositionFS from './glsl/updatePosition.frag'
import drawParticlesVS from './glsl/drawParticles.vert'
import drawParticlesFS from './glsl/drawParticles.frag'

const canvas = ref()
onMounted(() => {

    let hoge = 0

    const gl = canvas.value.getContext('webgl2')

    function createShader(gl: any, type: any, src: any) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, src);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            throw new Error(gl.getShaderInfoLog(shader));
        }
        return shader;
    }

    function createProgram(gl: any, shaderSources: any, transformFeedbackVaryings: any) {
        const program = gl.createProgram();
        [gl.VERTEX_SHADER, gl.FRAGMENT_SHADER].forEach((type, ndx) => {
            const shader = createShader(gl, type, shaderSources[ndx]);
            gl.attachShader(program, shader);
        });
        if (transformFeedbackVaryings) {
            gl.transformFeedbackVaryings(
                program,
                transformFeedbackVaryings,
                gl.SEPARATE_ATTRIBS,
            );
        }
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            throw new Error(gl.getProgramParameter(program));
        }
        return program;
    }

    const updatePositionProgram = createProgram(
        gl, [updatePositionVS, updatePositionFS], ['newPosition']);
    const drawParticlesProgram = createProgram(
        gl, [drawParticlesVS, drawParticlesFS], []);

    const updatePositionPrgLocs = {
        oldPosition: gl.getAttribLocation(updatePositionProgram, 'oldPosition'),
        velocity: gl.getAttribLocation(updatePositionProgram, 'velocity'),
        canvasDimensions: gl.getUniformLocation(updatePositionProgram, 'canvasDimensions'),
        deltaTime: gl.getUniformLocation(updatePositionProgram, 'deltaTime'),
    };

    const drawParticlesProgLocs = {
        position: gl.getAttribLocation(drawParticlesProgram, 'position'),
        matrix: gl.getUniformLocation(drawParticlesProgram, 'matrix'),
    };

    // create random positions and velocities.
    const rand = (min: any, max: any) => {
        if (max === undefined) {
            max = min;
            min = 0;
        }
        return Math.random() * (max - min) + min;
    };
    const numParticles = 1024 * 128;
    const createPoints = (num: number, ranges: any[]) =>
        new Array(num).fill(0).map(_ => ranges.map(range => rand(range[0], range[1]))).flat();
    const positions = new Float32Array(createPoints(numParticles, [[0, canvas.value.width], [0, canvas.value.height]]));
    const velocities = new Float32Array(createPoints(numParticles, [[-30, 30], [-30, 30]]));

    function makeBuffer(gl: any, sizeOrData: any, usage: any) {
        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, sizeOrData, usage);
        return buf;
    }

    const position1Buffer = makeBuffer(gl, positions, gl.DYNAMIC_DRAW);
    const position2Buffer = makeBuffer(gl, positions, gl.DYNAMIC_DRAW);
    const velocityBuffer = makeBuffer(gl, velocities, gl.STATIC_DRAW);

    function makeVertexArray(gl: any, bufLocPairs: any) {
        const va = gl.createVertexArray();
        gl.bindVertexArray(va);
        for (const [buffer, loc] of bufLocPairs) {
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.enableVertexAttribArray(loc);
            gl.vertexAttribPointer(
                loc,      // attribute location
                2,        // number of elements
                gl.FLOAT, // type of data
                false,    // normalize
                0,        // stride (0 = auto)
                0,        // offset
            );
        }
        return va;
    }

    const updatePositionVA1 = makeVertexArray(gl, [
        [position1Buffer, updatePositionPrgLocs.oldPosition],
        [velocityBuffer, updatePositionPrgLocs.velocity],
    ]);
    const updatePositionVA2 = makeVertexArray(gl, [
        [position2Buffer, updatePositionPrgLocs.oldPosition],
        [velocityBuffer, updatePositionPrgLocs.velocity],
    ]);

    const drawVA1 = makeVertexArray(
        gl, [[position1Buffer, drawParticlesProgLocs.position]]);
    const drawVA2 = makeVertexArray(
        gl, [[position2Buffer, drawParticlesProgLocs.position]]);

    function makeTransformFeedback(gl: any, buffer: any) {
        const tf = gl.createTransformFeedback();
        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, tf);
        gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, buffer);
        return tf;
    }

    const tf1 = makeTransformFeedback(gl, position1Buffer);
    const tf2 = makeTransformFeedback(gl, position2Buffer);

    // unbind left over stuff
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, null);

    let current = {
        updateVA: updatePositionVA1,  // read from position1
        tf: tf2,                      // write to position2
        drawVA: drawVA2,              // draw with position2
        buffer: position1Buffer,
    };
    let next = {
        updateVA: updatePositionVA2,  // read from position2
        tf: tf1,                      // write to position1
        drawVA: drawVA1,              // draw with position1
        buffer: position2Buffer,
    };
    gl.clearColor(0, 0, 0, 1);

    let then = 0;
    function render(time: number) {
        // convert to seconds
        time *= 0.001;
        // Subtract the previous time from the current time
        const deltaTime = time - then;
        // Remember the current time for the next frame.
        then = time;

        // webglUtils.resizeCanvasToDisplaySize(gl.canvas);

        gl.clear(gl.COLOR_BUFFER_BIT);

        // compute the new positions
        gl.useProgram(updatePositionProgram);
        gl.bindVertexArray(current.updateVA);
        gl.uniform2f(updatePositionPrgLocs.canvasDimensions, gl.canvas.width, gl.canvas.height);
        gl.uniform1f(updatePositionPrgLocs.deltaTime, deltaTime);

        gl.enable(gl.RASTERIZER_DISCARD);

        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, current.tf);
        gl.beginTransformFeedback(gl.POINTS);
        gl.drawArrays(gl.POINTS, 0, numParticles);
        gl.endTransformFeedback();
        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);

        // turn on using fragment shaders again
        gl.disable(gl.RASTERIZER_DISCARD);

        // now draw the particles.
        gl.useProgram(drawParticlesProgram);

        gl.bindVertexArray(current.drawVA);
        if (Math.random() < 0.01) {
            gl.bindBuffer(gl.ARRAY_BUFFER, next.buffer);
            const n = numParticles / 16
            hoge = (hoge + n) % numParticles
            // const n = 1
            for (let i = 0; i < n * 2; i++) {
                positions[i] = 0
            }
            gl.bufferSubData(gl.ARRAY_BUFFER, hoge * 4 * 2, positions, 0, n * 2);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
        }

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.uniformMatrix4fv(
            drawParticlesProgLocs.matrix,
            false,
            [2 / canvas.value.width, 0, 0, 0,
                0, 2 / canvas.value.height, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1]);
        // m4.orthographic(0, gl.canvas.width, 0, gl.canvas.height, -1, 1));
        gl.drawArrays(gl.POINTS, 0, numParticles);

        // swap which buffer we will read from
        // and which one we will write to
        {
            const temp = current;
            current = next;
            next = temp;
        }

        requestAnimationFrame(render);
    }

    // const animationLoop = () => {
    //     render()
    //     window.requestAnimationFrame(animationLoop)
    // }

    // const draw = () => {
    // }

    window.requestAnimationFrame(render)
})

watch(
    [app],
    () => {
        // canvas.value.width = app.value.width
        // canvas.value.height = app.value.height
        // window.requestAnimationFrame(draw)
    },
    { deep: true }
)
</script>

<template>
    <div id="base">
        <canvas ref="canvas" :width="app.width" :height="app.height"></canvas>
    </div>
</template>

<style scoped>
#base {}
</style>