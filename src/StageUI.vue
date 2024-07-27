<script setup lang="ts">
import { fileURLToPath } from 'url'
import { fps, parameter, parameterProps } from './main'
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
      <fieldset>
        <legend>Info</legend>
        FPS: {{ humanReadable(fps) }}<br />
      </fieldset>
      <template v-for="category of parameterProps" :key="category.name">
        <fieldset>
          <legend>{{ category.name }}</legend>
          <template v-for="prop of category.props" :key="prop.name">
            <label>
              {{ prop.name }}
              <br />
              <input
                type="range"
                v-model.number="parameter[prop.name as keyof typeof parameter]"
                :step="prop.step"
                :min="prop.min"
                :max="prop.max"
              />
            </label>
            <i
              class="bi bi-arrow-counterclockwise"
              @click="parameter[prop.name as keyof typeof parameter] = prop.default"
            ></i>
            <span style="float: right">
              {{ humanReadable(parameter[prop.name as keyof typeof parameter]) }}
            </span>
            <br />
          </template>
        </fieldset>
      </template>
      <fieldset>
        <legend>Templates</legend>
        <button @click="fractalMode">fractal mode</button><br />
        <button @click="resetParameter">reset all</button><br />
        <!-- <button @click="randomParameter">random</button><br /> -->
      </fieldset>
    </details>
  </div>
</template>

<style scoped>
#base {
  max-height: 90vh;
  overflow-y: auto;
  background-color: #000;
  color: white;
}

p {
  margin: 0;
}

legend {
  font-weight: bold;
}
</style>
