import './assets/main.css'

import { createApp, ref } from 'vue'
import App from './App.vue'
import { resetParameter } from './utils'

export const app = ref({
  width: window.innerWidth,
  height: window.innerHeight,
  fps: 0
})

export const fps = ref(0)

export const parameter = ref({
  simplexResolution: 0.002,
  simplexScale: 10,
  simplexTimeScale: 0.001,
  k: 1.0,
  opacity: 0.5,
  length: 300,
  lengthStd: 100,
  diffusion: 500,
  gravity: -1.0,
  density: 2,
  densityStd: 2,
  frequency: 0.1,
  nIter: 0,
  folds: 3,
  thickness: 0.5,
  noise: 128
})

export const parameterProps = ref({
  simplexResolution: {
    type: 'range',
    default: 0.002,
    min: 0,
    max: 0.01,
    step: 0.00001
  },
  simplexTimeScale: {
    type: 'range',
    default: 0.001,
    min: 0,
    max: 1,
    step: 0.001
  },
  simplexScale: {
    type: 'range',
    default: 10,
    min: 0,
    max: 20,
    step: 0.001
  },
  k: {
    type: 'range',
    default: 1,
    min: 0,
    max: 10,
    step: 0.01
  },
  diffusion: {
    type: 'range',
    default: 500,
    min: 0,
    max: 1000,
    step: 0.01
  },
  density: {
    type: 'range',
    default: 2,
    min: 0,
    max: 5,
    step: 0.001
  },
  densityStd: {
    type: 'range',
    default: 1,
    min: 0,
    max: 5,
    step: 0.001
  },
  noise: {
    type: 'range',
    default: 128,
    min: 0,
    max: 1024,
    step: 1
  },
  length: {
    type: 'range',
    default: 300,
    min: 0,
    max: 500,
    step: 0.001
  },
  lengthStd: {
    type: 'range',
    default: 100,
    min: 0,
    max: 500,
    step: 0.001
  },
  gravity: {
    type: 'range',
    default: -1,
    min: -40,
    max: 0,
    step: 0.01
  },
  nIter: {
    type: 'range',
    default: 0,
    min: 0,
    max: 10,
    step: 1
  },
  folds: {
    type: 'range',
    default: 3,
    min: 0,
    max: 8,
    step: 1
  },
  thickness: {
    type: 'range',
    default: 0.5,
    min: 0,
    max: 1,
    step: 0.001
  },
  frequency: {
    type: 'range',
    default: 0.1,
    min: 0,
    max: 1,
    step: 0.001
  },
  opacity: {
    type: 'range',
    default: 0.5,
    min: 0,
    max: 1,
    step: 0.0001
  }
})

resetParameter()

const resize = () => {
  app.value.width = window.innerWidth
  app.value.height = window.innerHeight
}
resize()
window.addEventListener('resize', resize)

createApp(App).mount('#app')
