<script setup lang="ts">
import { fps, parameter, parameterProps } from './main'
import { humanReadable } from './utils'

const fractalMode = () => {
  parameter.value.densityStd = 0
  parameter.value.diffusion = 32
  parameter.value.density = 0.4
  parameter.value.opacity = 0.3
  parameter.value.gravity = -2
  parameter.value.length = 500
  parameter.value.lengthStd = 0
  parameter.value.frequency = 0.1
  parameter.value.nIter = 7
  parameter.value.noise = 16
}
</script>

<template>
  <div id="base">
    <!-- {{ app.width }}, {{ app.height }} -->
    <!-- <br> -->
    FPS: {{ humanReadable(fps) }}<br />
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
    <button @click="fractalMode">fractal mode</button>
  </div>
</template>

<style scoped>
#base {
  background-color: #000;
  color: white;
}
</style>
