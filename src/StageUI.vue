<script setup lang="ts">
import { parameter, parameterProps } from './main'
import { humanReadable, randomParameter, resetParameter } from './utils'

const fractalMode = () => {
  resetParameter()
  parameter.value.simplexScale = 0.5
  parameter.value.densityStd = 0
  parameter.value.diffusion = 32
  parameter.value.density = 0.4
  parameter.value.opacity = 0.2
  parameter.value.gravity = -4
  parameter.value.length = 400
  parameter.value.lengthStd = 100
  parameter.value.frequency = 0.4
  parameter.value.nIter = 6
  parameter.value.noise = 16
  parameter.value.saturation = 0.9
  parameter.value.lightness = 0.5
}
</script>

<template>
  <div id="base">
    <details>
      <summary>parameters</summary>
      <!-- {{ app.width }}, {{ app.height }} -->
      <!-- <br> -->
      <!-- FPS: {{ humanReadable(fps) }}<br /> -->
      <template v-for="(prop, key) in parameterProps" :key="key">
        <template v-if="prop.type === 'range'">
          <label>
            {{ key }}: {{ humanReadable(parameter[key]) }}<br />
            <input
              type="range"
              v-model.number="parameter[key]"
              :step="prop.step"
              :min="prop.min"
              :max="prop.max"
            />
          </label>
          <br />
        </template>
      </template>
      <button @click="fractalMode">fractal mode</button><br />
      <button @click="resetParameter">reset all</button><br />
      <!-- <button @click="randomParameter">random</button><br /> -->
    </details>
  </div>
</template>

<style scoped>
#base {
  background-color: #000;
  color: white;
}
</style>
