import './assets/main.css'

import { createApp, ref } from 'vue'
import App from './App.vue'

export const app = ref({
  width: window.innerWidth,
  height: window.innerHeight,
  fps: 0
})

export const fps = ref(0)

export const parameter = ref({
  simplexResolution: 0.005,
  simplexScale: 5.0,
  simplexTimeScale: 0.001,
  k: 1.1,
  opacity: 0.5,
  length: 150,
  lengthStd: 50,
  diffusion: 250,
  gravity: -1.0,
  density: 10,
  densityStd: 2,
  frequency: 0.1
})

export const parameterProps = ref({
  simplexResolution: {
    type: 'range',
    min: 0,
    max: 0.01,
    step: 0.001
  },
  simplexTimeScale: {
    type: 'range',
    min: 0,
    max: 1,
    step: 0.001
  },
  simplexScale: {
    type: 'range',
    min: 0,
    max: 20,
    step: 0.01
  },
  k: {
    type: 'range',
    min: 0,
    max: 10,
    step: 0.01
  },
  gravity: {
    type: 'range',
    min: -10,
    max: 0,
    step: 0.01
  },
  diffusion: {
    type: 'range',
    min: 0,
    max: 500,
    step: 0.01
  },
  opacity: {
    type: 'range',
    min: 0,
    max: 1,
    step: 0.0001
  },
  density: {
    type: 'range',
    min: 0,
    max: 50,
    step: 0.001
  },
  densityStd: {
    type: 'range',
    min: 0,
    max: 50,
    step: 0.001
  },
  length: {
    type: 'range',
    min: 0,
    max: 500,
    step: 0.001
  },
  lengthStd: {
    type: 'range',
    min: 0,
    max: 500,
    step: 0.001
  },
  frequency: {
    type: 'range',
    min: 0,
    max: 1,
    step: 0.001
  }
})

const resize = () => {
  app.value.width = window.innerWidth
  app.value.height = window.innerHeight
}
resize()
window.addEventListener('resize', resize)

createApp(App).mount('#app')
