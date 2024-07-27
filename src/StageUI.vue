<script setup lang="ts">
import { options, parameter, parameterProps } from './main'
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
      <template v-for="prop of parameterProps" :key="prop.name">
        <label>
          {{ prop.name }}: {{ humanReadable(parameter[prop.name as keyof typeof parameter]) }}<br />
          <input
            type="range"
            v-model.number="parameter[prop.name as keyof typeof parameter]"
            :step="prop.step"
            :min="prop.min"
            :max="prop.max"
          />
        </label>
        <br />
      </template>
      <template v-for="(option, key) of options" :key="key">
        <label>
          <input type="checkbox" v-model="options[key]" />
          {{ key }}
        </label>
        <br />
      </template>
      <button @click="fractalMode">fractal mode</button><br />
      <button @click="resetParameter">reset all</button><br />
      <!-- <button @click="randomParameter">random</button><br /> -->
    </details>
  </div>
</template>

<style scoped>
#base {
  max-height: 90vh;
  overflow-y: scroll;
  background-color: #000;
  color: white;
}
</style>
