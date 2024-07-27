import './assets/main.css'

import { createApp, ref, type Ref } from 'vue'
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
  noise: 128,
  hueMin: 0,
  hueMax: 0.2,
  saturation: 1.0,
  lightness: 0.5,
  // center: false,
  centerDistance: 100,
  centerDistanceStd: 50
})

export const options = ref({
  center: false
})

export const parameterProps = [
  {
    name: 'simplexResolution',
    type: 'range',
    default: 0.002,
    min: 0,
    max: 0.01,
    step: 0.00001
  },
  {
    name: 'simplexTimeScale',
    type: 'range',
    default: 0.001,
    min: 0,
    max: 1,
    step: 0.001
  },
  {
    name: 'simplexScale',
    type: 'range',
    default: 10,
    min: 0,
    max: 20,
    step: 0.001
  },
  {
    name: 'k',
    type: 'range',
    default: 1,
    min: 0,
    max: 10,
    step: 0.01
  },
  {
    name: 'diffusion',
    type: 'range',
    default: 500,
    min: 0,
    max: 1000,
    step: 0.01
  },
  {
    name: 'density',
    type: 'range',
    default: 2,
    min: 0,
    max: 5,
    step: 0.001
  },
  {
    name: 'densityStd',
    type: 'range',
    default: 1,
    min: 0,
    max: 5,
    step: 0.001
  },
  {
    name: 'noise',
    type: 'range',
    default: 128,
    min: 0,
    max: 1024,
    step: 1
  },
  {
    name: 'length',
    type: 'range',
    default: 300,
    min: 0,
    max: 1000,
    step: 0.001
  },
  {
    name: 'lengthStd',
    type: 'range',
    default: 100,
    min: 0,
    max: 500,
    step: 0.001
  },
  {
    name: 'gravity',
    type: 'range',
    default: -1,
    min: -40,
    max: 0,
    step: 0.01
  },
  {
    name: 'nIter',
    type: 'range',
    default: 0,
    min: 0,
    max: 10,
    step: 1
  },
  {
    name: 'folds',
    type: 'range',
    default: 3,
    min: 0,
    max: 8,
    step: 1
  },
  {
    name: 'thickness',
    type: 'range',
    default: 0.5,
    min: 0,
    max: 1,
    step: 0.001
  },
  {
    name: 'frequency',
    type: 'range',
    default: 0.1,
    min: 0,
    max: 1,
    step: 0.001
  },
  {
    name: 'hueMin',
    type: 'range',
    default: 0,
    min: 0,
    max: 1,
    step: 0.0001
  },
  {
    name: 'hueMax',
    type: 'range',
    default: 0.3,
    min: 0,
    max: 1,
    step: 0.0001
  },
  {
    name: 'saturation',
    type: 'range',
    default: 1.0,
    min: 0,
    max: 1,
    step: 0.0001
  },
  {
    name: 'lightness',
    type: 'range',
    default: 1.0,
    min: 0,
    max: 1,
    step: 0.0001
  },
  {
    name: 'opacity',
    type: 'range',
    default: 0.5,
    min: 0,
    max: 1,
    step: 0.0001
  },
  // {
  //   name: 'center',
  //   type: 'checkbox',
  //   default: false
  // },
  {
    name: 'centerDistance',
    type: 'range',
    default: 100,
    min: 0,
    max: 1000,
    step: 0.001
  },
  {
    name: 'centerDistanceStd',
    type: 'range',
    default: 20,
    min: 0,
    max: 100,
    step: 0.001
  }
]

resetParameter()

const resize = () => {
  app.value.width = window.innerWidth
  app.value.height = window.innerHeight
}
resize()
window.addEventListener('resize', resize)

createApp(App).mount('#app')
