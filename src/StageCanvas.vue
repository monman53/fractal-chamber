<script lang="ts">
export const fps = ref(0)
</script>

<script setup lang="ts">
import { onMounted, ref, watch, type Ref } from 'vue'
import { app, parameter } from './main'

// Shaders
import updatePositionVS from './glsl/updatePosition.vert'
import updatePositionFS from './glsl/updatePosition.frag'
import drawParticlesVS from './glsl/drawParticles.vert'
import drawParticlesFS from './glsl/drawParticles.frag'
import { vec, Vec, vecRad } from './math'

//--------------------------------
// WebGL support functions
//--------------------------------
const createShader = (gl: WebGL2RenderingContext, type: GLenum, src: string) => {
  const shader = gl.createShader(type)
  if (!shader) {
    throw new Error()
  }
  gl.shaderSource(shader, src)
  gl.compileShader(shader)
  // if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
  //     throw new Error(gl.getShaderInfoLog(shader));
  // }
  return shader
}

function createProgram(
  gl: WebGL2RenderingContext,
  shaderSources: string[],
  transformFeedbackVaryings: any
) {
  const program = gl.createProgram()
  if (!program) {
    throw new Error()
  }
  ;[gl.VERTEX_SHADER, gl.FRAGMENT_SHADER].forEach((type, ndx) => {
    const shader = createShader(gl, type, shaderSources[ndx])
    if (!shader) {
      throw new Error()
    }
    gl.attachShader(program, shader)
  })
  if (transformFeedbackVaryings) {
    gl.transformFeedbackVaryings(program, transformFeedbackVaryings, gl.SEPARATE_ATTRIBS)
  }
  gl.linkProgram(program)
  // if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
  //     throw new Error(gl.getProgramParameter(program));
  // }
  return program
}

function makeBuffer(gl: WebGL2RenderingContext, sizeOrData: any, usage: GLenum) {
  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, sizeOrData, usage)
  return buf
}

function makeTransformFeedback(gl: any, buffers: any[]) {
  const tf = gl.createTransformFeedback()
  gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, tf)
  buffers.forEach((buffer, idx) => {
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, idx, buffer)
  })
  return tf
}

function makeVertexArray(gl: WebGL2RenderingContext, bufLocPairs: any) {
  const va = gl.createVertexArray()
  gl.bindVertexArray(va)
  for (const [buffer, loc] of bufLocPairs) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(
      loc, // attribute location
      3, // number of elements
      gl.FLOAT, // type of data
      false, // normalize
      0, // stride (0 = auto)
      0 // offset
    )
  }
  return va
}
const offscreenCanvas = new OffscreenCanvas(app.value.width, app.value.height)
const gl = offscreenCanvas.getContext('webgl2', { alpha: true })
const canvas = ref()
onMounted(() => {
  let hoge = 0
  // const gl = canvas.value.getContext('webgl2')
  const mainCtx = canvas.value.getContext('bitmaprenderer')
  if (gl === null) {
    throw new Error()
  }

  //--------------------------------
  // Create programs
  //--------------------------------
  const updatePositionProgram = createProgram(
    gl,
    [updatePositionVS, updatePositionFS],
    ['newPosition', 'newVelocity']
  )
  const drawParticlesProgram = createProgram(gl, [drawParticlesVS, drawParticlesFS], [])

  const updatePositionPrgLocs = {
    oldPosition: gl.getAttribLocation(updatePositionProgram, 'oldPosition'),
    oldVelocity: gl.getAttribLocation(updatePositionProgram, 'oldVelocity'),
    canvasDimensions: gl.getUniformLocation(updatePositionProgram, 'canvasDimensions'),
    time: gl.getUniformLocation(updatePositionProgram, 'time'),
    deltaTime: gl.getUniformLocation(updatePositionProgram, 'deltaTime'),
    simplexResolution: gl.getUniformLocation(updatePositionProgram, 'simplexResolution'),
    simplexScale: gl.getUniformLocation(updatePositionProgram, 'simplexScale'),
    simplexTimeScale: gl.getUniformLocation(updatePositionProgram, 'simplexTimeScale'),
    k: gl.getUniformLocation(updatePositionProgram, 'k'),
    diffusion: gl.getUniformLocation(updatePositionProgram, 'diffusion'),
    gravity: gl.getUniformLocation(updatePositionProgram, 'gravity')
  }

  const drawParticlesProgLocs = {
    position: gl.getAttribLocation(drawParticlesProgram, 'position'),
    matrix: gl.getUniformLocation(drawParticlesProgram, 'matrix'),
    opacity: gl.getUniformLocation(drawParticlesProgram, 'opacity')
  }

  //--------------------------------
  // Create buffers
  //--------------------------------
  // CPU initial buffers
  const rand = (min: any, max: any) => {
    if (max === undefined) {
      max = min
      min = 0
    }
    return Math.random() * (max - min) + min
  }
  const numParticles = 1024 * 64 * 3
  const createPoints = (num: number, ranges: any[]) =>
    new Array(num)
      .fill(0)
      .map((_) => ranges.map((range) => rand(range[0], range[1])))
      .flat()
  const positions = new Float32Array(
    createPoints(numParticles, [
      [-0.5 * canvas.value.width, 0.5 * canvas.value.width],
      [-0.5 * canvas.value.height, 0.5 * canvas.value.height],
      [-1000, -1000]
    ])
  )
  const velocities = new Float32Array(
    createPoints(numParticles, [
      [0, 0],
      [0, 0],
      [0, 0]
    ])
  )

  // GPU buffers
  const position1Buffer = makeBuffer(gl, positions, gl.DYNAMIC_DRAW)
  const position2Buffer = makeBuffer(gl, positions, gl.DYNAMIC_DRAW)
  const velocity1Buffer = makeBuffer(gl, velocities, gl.DYNAMIC_DRAW)
  const velocity2Buffer = makeBuffer(gl, velocities, gl.DYNAMIC_DRAW)

  // Vertex arrays for updater
  const updatePositionVA1 = makeVertexArray(gl, [
    [position1Buffer, updatePositionPrgLocs.oldPosition],
    [velocity1Buffer, updatePositionPrgLocs.oldVelocity]
  ])
  const updatePositionVA2 = makeVertexArray(gl, [
    [position2Buffer, updatePositionPrgLocs.oldPosition],
    [velocity2Buffer, updatePositionPrgLocs.oldVelocity]
  ])

  // Vertex arrays for drawer
  const drawVA1 = makeVertexArray(gl, [[position1Buffer, drawParticlesProgLocs.position]])
  const drawVA2 = makeVertexArray(gl, [[position2Buffer, drawParticlesProgLocs.position]])

  const tf1 = makeTransformFeedback(gl, [position1Buffer, velocity1Buffer])
  const tf2 = makeTransformFeedback(gl, [position2Buffer, velocity2Buffer])

  // For ping-pong buffering
  let current = {
    updateVA: updatePositionVA1, // read from position1
    tf: tf2, // write to position2
    drawVA: drawVA2, // draw with position2
    buffer: position2Buffer,
    velocityBuffer: velocity2Buffer
  }
  let next = {
    updateVA: updatePositionVA2, // read from position2
    tf: tf1, // write to position1
    drawVA: drawVA1, // draw with position1
    buffer: position1Buffer,
    velocityBuffer: velocity1Buffer
  }

  // unbind left over stuff
  gl.bindBuffer(gl.ARRAY_BUFFER, null)
  gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, null)

  //================================
  // Frame render function
  //================================
  let then = 0
  function render(time: number) {
    if (gl === null) {
      throw new Error()
    }

    // convert to seconds
    time *= 0.001
    // Subtract the previous time from the current time
    const deltaTime = time - then
    fps.value = 1.0 / deltaTime
    // Remember the current time for the next frame.
    then = time

    gl.clearColor(0, 0, 0, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    //--------------------------------
    // Update positions using transform feedback
    //--------------------------------
    // compute the new positions
    gl.useProgram(updatePositionProgram)
    gl.bindVertexArray(current.updateVA)
    gl.uniform2f(updatePositionPrgLocs.canvasDimensions, gl.canvas.width, gl.canvas.height)
    gl.uniform1f(updatePositionPrgLocs.time, time)
    gl.uniform1f(updatePositionPrgLocs.deltaTime, deltaTime)
    gl.uniform1f(updatePositionPrgLocs.simplexResolution, parameter.value.simplexResolution)
    gl.uniform1f(updatePositionPrgLocs.simplexScale, parameter.value.simplexScale)
    gl.uniform1f(updatePositionPrgLocs.simplexTimeScale, parameter.value.simplexTimeScale)
    gl.uniform1f(updatePositionPrgLocs.k, parameter.value.k)
    gl.uniform1f(updatePositionPrgLocs.diffusion, parameter.value.diffusion)
    gl.uniform1f(updatePositionPrgLocs.gravity, parameter.value.gravity)

    gl.enable(gl.RASTERIZER_DISCARD)

    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, current.tf)
    gl.beginTransformFeedback(gl.POINTS)
    gl.drawArrays(gl.POINTS, 0, numParticles)
    gl.endTransformFeedback()
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null)

    // turn on using fragment shaders again
    gl.disable(gl.RASTERIZER_DISCARD)

    //--------------------------------
    // Draw particles
    //--------------------------------
    gl.enable(gl.BLEND)
    gl.useProgram(drawParticlesProgram)

    if (Math.random() < 0.2) {
      const s = vec(Math.random() * canvas.value.width, Math.random() * canvas.value.height)
      const v = vecRad(Math.random() * 2 * Math.PI)

      const n = 1024 * 2
      hoge = (hoge + n) % numParticles
      for (let i = 0; i < n * 3; i += 3) {
        const t = s.add(v.mul(Math.random() * parameter.value.length))
        positions[i] = t.x
        positions[i + 1] = t.y
        positions[i + 2] = 0
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, current.buffer)
      gl.bufferSubData(gl.ARRAY_BUFFER, hoge * 4 * 3, positions, 0, n * 3)
      gl.bindBuffer(gl.ARRAY_BUFFER, current.velocityBuffer)
      gl.bufferSubData(gl.ARRAY_BUFFER, hoge * 4 * 3, velocities, 0, n * 3)
      gl.bindBuffer(gl.ARRAY_BUFFER, null)
    }

    if (true) {
      const n = 128
      hoge = (hoge + n) % numParticles
      for (let i = 0; i < n * 3; i += 3) {
        positions[i] = Math.random() * canvas.value.width
        positions[i + 1] = Math.random() * canvas.value.height
        positions[i + 2] = 0
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, current.buffer)
      gl.bufferSubData(gl.ARRAY_BUFFER, hoge * 4 * 3, positions, 0, n * 3)
      gl.bindBuffer(gl.ARRAY_BUFFER, current.velocityBuffer)
      gl.bufferSubData(gl.ARRAY_BUFFER, hoge * 4 * 3, velocities, 0, n * 3)
      gl.bindBuffer(gl.ARRAY_BUFFER, null)
      //   hoge = 1
    }

    gl.bindVertexArray(current.drawVA)

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

    const matrix = [
      [2 / canvas.value.width, 0, 0, 0],
      [0, 2 / canvas.value.height, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    ].flat()
    gl.uniformMatrix4fv(drawParticlesProgLocs.matrix, false, matrix)
    gl.uniform1f(drawParticlesProgLocs.opacity, parameter.value.opacity)
    gl.drawArrays(gl.POINTS, 0, numParticles)

    //--------------------------------
    // Copy offscreen render result to main canvas
    //--------------------------------
    mainCtx.transferFromImageBitmap(offscreenCanvas.transferToImageBitmap())

    //--------------------------------
    // Swap buffers
    //--------------------------------
    // swap which buffer we will read from
    // and which one we will write to
    {
      const temp = current
      current = next
      next = temp
    }

    window.requestAnimationFrame(render)
  }

  // const animationLoop = () => {
  //     render()
  //     window.requestAnimationFrame(animationLoop)
  // }

  // const draw = () => {
  // }

  window.requestAnimationFrame(render)

  watch(
    [app],
    () => {
      canvas.value.width = app.value.width
      canvas.value.height = app.value.height
      offscreenCanvas.width = app.value.width
      offscreenCanvas.height = app.value.height
      window.requestAnimationFrame(render)
    },
    { deep: true }
  )
})
</script>

<template>
  <div id="base">
    <canvas ref="canvas" :width="app.width" :height="app.height"></canvas>
  </div>
</template>

<style scoped>
#base {
}
</style>
