<script setup lang="ts">
import { parameter } from './main'
import { fps } from './StageCanvas.vue'
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
        :min="0.001"
        :max="0.03"
      /><br />
    </label>
    <label>
      simplexTimeScale: {{ humanReadable(parameter.simplexTimeScale) }}<br />
      <input
        type="range"
        v-model.number="parameter.simplexTimeScale"
        :step="0.01"
        :min="0.0"
        :max="4"
      /><br />
    </label>
    <label>
      simplexScale: {{ humanReadable(parameter.simplexScale) }}<br />
      <input
        type="range"
        v-model.number="parameter.simplexScale"
        :step="0.01"
        :min="0.0"
        :max="100"
      /><br />
    </label>
    <label>
      k: {{ humanReadable(parameter.k) }}<br />
      <input type="range" v-model.number="parameter.k" :step="0.01" :min="0.0" :max="10" /><br />
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
  </div>
</template>

<style scoped>
#base {
  background-color: #000;
  color: white;
}
</style>
