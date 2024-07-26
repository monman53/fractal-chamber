<script setup lang="ts">
import { fps, parameter, parameterProps } from './main'
import { humanReadable } from './utils'
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
  </div>
</template>

<style scoped>
#base {
  background-color: #000;
  color: white;
}
</style>
