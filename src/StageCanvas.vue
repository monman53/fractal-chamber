<script lang="ts"></script>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { app, fps, parameter } from './main'

// Shaders
import updatePositionVS from './glsl/updatePosition.vert?raw'
import initializeVS from './glsl/initialize.vert?raw'
import dummyFS from './glsl/dummy.frag?raw'
import drawParticlesVS from './glsl/drawParticles.vert?raw'
import drawParticlesFS from './glsl/drawParticles.frag?raw'
import { normalDistribution, vec, vecRad } from './math'

//--------------------------------
// WebGL support functions
//--------------------------------
const dim = 4

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

function makeBuffer(gl: WebGL2RenderingContext, bytes: number, usage: GLenum) {
  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, bytes, usage)
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
      dim, // number of elements
      gl.FLOAT, // type of data
      false, // normalize
      0, // stride (0 = auto)
      0 // offset
    )
  }
  return va
}
const offscreenCanvas = new OffscreenCanvas(app.value.width, app.value.height)
const gl = offscreenCanvas.getContext('webgl2', { alpha: true, premultipliedAlpha: false })
const canvas = ref()
onMounted(() => {
  // const gl = canvas.value.getContext('webgl2')
  const mainCtx = canvas.value.getContext('bitmaprenderer')
  if (gl === null) {
    throw new Error()
  }

  //--------------------------------
  // Create programs
  //--------------------------------
  const initializationProgram = createProgram(
    gl,
    [initializeVS, dummyFS],
    ['newPosition', 'newVelocity']
  )
  const updatePositionProgram = createProgram(
    gl,
    [updatePositionVS, dummyFS],
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
    opacity: gl.getUniformLocation(drawParticlesProgram, 'opacity'),
    saturation: gl.getUniformLocation(drawParticlesProgram, 'saturation'),
    lightness: gl.getUniformLocation(drawParticlesProgram, 'lightness')
  }

  //--------------------------------
  // Create buffers
  //--------------------------------
  // CPU initial buffers
  const numParticles = 1024 * 1024 * 1
  const bytes = numParticles * dim * 4
  const positions = new Float32Array(numParticles * dim)
  const velocities = new Float32Array(numParticles * dim)

  // GPU buffers
  const position1Buffer = makeBuffer(gl, bytes, gl.DYNAMIC_DRAW)
  const position2Buffer = makeBuffer(gl, bytes, gl.DYNAMIC_DRAW)
  const velocity1Buffer = makeBuffer(gl, bytes, gl.DYNAMIC_DRAW)
  const velocity2Buffer = makeBuffer(gl, bytes, gl.DYNAMIC_DRAW)

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
  // Buffer initialization
  //================================

  gl.useProgram(initializationProgram)
  // gl.bindVertexArray(current.updateVA)

  gl.enable(gl.RASTERIZER_DISCARD)

  gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, next.tf)
  gl.beginTransformFeedback(gl.POINTS)
  gl.drawArrays(gl.POINTS, 0, numParticles)
  gl.endTransformFeedback()
  gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null)

  // turn on using fragment shaders again
  gl.disable(gl.RASTERIZER_DISCARD)

  //================================
  // Frame render function
  //================================
  let hoge = 0
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
    // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    gl.blendFunc(gl.SRC_ALPHA, gl.DST_ALPHA)

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

    if (Math.random() < parameter.value.frequency) {
      // Base segment
      const s = vec(
        (Math.random() - 0.5) * 2 * canvas.value.width,
        (Math.random() - 0.5) * 2 * canvas.value.height
      )
      const v = vecRad(Math.random() * 2 * Math.PI)
      const length = Math.max(
        0,
        parameter.value.length + normalDistribution() * parameter.value.lengthStd
      )
      const density = Math.max(
        0,
        parameter.value.density + normalDistribution() * parameter.value.densityStd
      )
      // Color
      const hue =
        parameter.value.hueMin +
        Math.random() * Math.max(0, parameter.value.hueMax - parameter.value.hueMin)

      //--------------------------------
      // L-system
      //--------------------------------
      // Rule
      const m = Math.floor(parameter.value.folds)
      const rules: any[] = []
      for (let i = 0; i < m; i++) {
        rules.push({
          angle: (Math.random() - 0.5) * parameter.value.thickness,
          // angle: Math.random() * 2 * Math.PI,
          thickness: Math.random() * parameter.value.thickness,
          ratio: Math.random()
        })
      }
      // rules.sort((a, b) => a.ratio - b.ratio)
      // Iteration
      let edges = [{ s: s, v: v.mul(length) }]
      for (let i = 0; i < parameter.value.nIter; i++) {
        edges = edges
          .map((edge) => {
            // const edgeLength = edge.v.length()
            let ts = [edge.s]
            rules.forEach((rule) => {
              const t = edge.s.add(
                edge.v.mul(rule.ratio).add(edge.v.rotate(Math.PI / 2).mul(rule.angle))
              )
              // const t = edge.s.add(
              //   edge.v.mul(rule.ratio).add(edge.v.rotate(rule.angle).mul(rule.thickness))
              // )
              ts.push(t)
            })
            ts.push(edge.s.add(edge.v))

            const res = []
            for (let j = 1; j < ts.length; j++) {
              const s = ts[j - 1]
              const t = ts[j]
              res.push({ s: s, v: t.sub(s) })
            }
            return res
          })
          .flat()
      }

      let n = 0
      edges.forEach((edge) => {
        const length = edge.v.length()
        const m = Math.floor(edge.v.length() * density)
        for (let i = 0; i < m; i += 1) {
          if (n >= numParticles) {
            return
          }
          const t = edge.s.add(edge.v.mul(Math.random()))
          // const t = edge.s.add(edge.v.mul(i / m))
          positions[dim * n] = t.x
          positions[dim * n + 1] = t.y
          positions[dim * n + 2] = 0
          positions[dim * n + 3] = hue
          n += 1
        }
      })

      if (hoge + n >= numParticles) {
        const m = numParticles - hoge
        const rest = n - m
        gl.bindBuffer(gl.ARRAY_BUFFER, current.buffer)
        gl.bufferSubData(gl.ARRAY_BUFFER, hoge * 4 * dim, positions, 0, m * dim)
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, positions, m * dim, rest * dim)
        gl.bindBuffer(gl.ARRAY_BUFFER, current.velocityBuffer)
        gl.bufferSubData(gl.ARRAY_BUFFER, hoge * 4 * dim, velocities, 0, m * dim)
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, velocities, m * dim, rest * dim)
      } else if (n > 0) {
        gl.bindBuffer(gl.ARRAY_BUFFER, current.buffer)
        gl.bufferSubData(gl.ARRAY_BUFFER, hoge * 4 * dim, positions, 0, n * dim)
        gl.bindBuffer(gl.ARRAY_BUFFER, current.velocityBuffer)
        gl.bufferSubData(gl.ARRAY_BUFFER, hoge * 4 * dim, velocities, 0, n * dim)
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, null)
      hoge = (hoge + n) % numParticles
    }

    {
      const n = parameter.value.noise
      for (let i = 0; i < n * dim; i += dim) {
        // Color
        const hue =
          parameter.value.hueMin +
          Math.random() * Math.max(0, parameter.value.hueMax - parameter.value.hueMin)

        positions[i] = (Math.random() - 0.5) * 2 * canvas.value.width
        positions[i + 1] = (Math.random() - 0.5) * 2 * canvas.value.height
        positions[i + 2] = 0
        positions[i + 3] = hue
      }
      if (hoge + n >= numParticles) {
        const m = numParticles - hoge
        const rest = n - m
        gl.bindBuffer(gl.ARRAY_BUFFER, current.buffer)
        gl.bufferSubData(gl.ARRAY_BUFFER, hoge * 4 * dim, positions, 0, m * dim)
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, positions, m * dim, rest * dim)
        gl.bindBuffer(gl.ARRAY_BUFFER, current.velocityBuffer)
        gl.bufferSubData(gl.ARRAY_BUFFER, hoge * 4 * dim, velocities, 0, m * dim)
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, velocities, m * dim, rest * dim)
      } else {
        gl.bindBuffer(gl.ARRAY_BUFFER, current.buffer)
        gl.bufferSubData(gl.ARRAY_BUFFER, hoge * 4 * dim, positions, 0, n * dim)
        gl.bindBuffer(gl.ARRAY_BUFFER, current.velocityBuffer)
        gl.bufferSubData(gl.ARRAY_BUFFER, hoge * 4 * dim, velocities, 0, n * dim)
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, null)
      hoge = (hoge + n) % numParticles
    }

    gl.bindVertexArray(current.drawVA)

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

    const matrix = [
      [1 / canvas.value.width, 0, 0, 0],
      [0, 1 / canvas.value.height, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1]
    ].flat()
    gl.uniformMatrix4fv(drawParticlesProgLocs.matrix, false, matrix)
    gl.uniform1f(drawParticlesProgLocs.opacity, parameter.value.opacity)
    gl.uniform1f(drawParticlesProgLocs.saturation, parameter.value.saturation)
    gl.uniform1f(drawParticlesProgLocs.lightness, parameter.value.lightness)
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
      //   window.requestAnimationFrame(render)
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
