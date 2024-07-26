<script setup lang="ts">
import { fps, parameter } from './main'
import { humanReadable } from './utils'
</script>

<template>
  <div id="base">
    <!-- {{ app.width }}, {{ app.height }} -->
    <!-- <br> -->
    FPS: {{ humanReadable(fps) }}<br />
    <label>
      simplexResolution: {{ humanReadable(parameter.simplexResolution) }}<br />
      <input
        type="range"
        v-model.number="parameter.simplexResolution"
        :step="0.0001"
        :min="0.0"
        :max="0.01"
      /><br />
    </label>
    <label>
      simplexTimeScale: {{ humanReadable(parameter.simplexTimeScale) }}<br />
      <input
        type="range"
        v-model.number="parameter.simplexTimeScale"
        :step="0.001"
        :min="0.0"
        :max="1"
      /><br />
    </label>
    <label>
      simplexScale: {{ humanReadable(parameter.simplexScale) }}<br />
      <input
        type="range"
        v-model.number="parameter.simplexScale"
        :step="0.01"
        :min="0.0"
        :max="20"
      /><br />
    </label>
    <label>
      k: {{ humanReadable(parameter.k) }}<br />
      <input type="range" v-model.number="parameter.k" :step="0.01" :min="0.0" :max="10" /><br />
    </label>
    <label>
      gravity: {{ humanReadable(parameter.gravity) }}<br />
      <input
        type="range"
        v-model.number="parameter.gravity"
        :step="0.01"
        :min="-10"
        :max="0"
      /><br />
    </label>
    <label>
      diffusion: {{ humanReadable(parameter.diffusion) }}<br />
      <input
        type="range"
        v-model.number="parameter.diffusion"
        :step="0.01"
        :min="0"
        :max="500"
      /><br />
    </label>
    <label>
      Opacity: {{ humanReadable(parameter.opacity) }}<br />
      <input
        type="range"
        v-model.number="parameter.opacity"
        :step="0.0001"
        :min="0"
        :max="1"
      /><br />
    </label>
    <label>
      density: {{ humanReadable(parameter.density) }}<br />
      <input
        type="range"
        v-model.number="parameter.density"
        :step="0.001"
        :min="0"
        :max="50"
      /><br />
    </label>
    <label>
      densityStd: {{ humanReadable(parameter.densityStd) }}<br />
      <input
        type="range"
        v-model.number="parameter.densityStd"
        :step="0.001"
        :min="0"
        :max="50"
      /><br />
    </label>
  </div>
</template>

<style scoped>
#base {
  background-color: #000;
  color: white;
}
</style>
