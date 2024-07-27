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
  center: 1.0,
  centerDistance: 100,
  centerDistanceStd: 50
})

export const parameterProps = ref([
  {
    name: 'Physics',
    visible: false,
    props: [
      {
        name: 'frequency',
        default: 0.1,
        min: 0,
        max: 1,
        step: 0.001
      },
      {
        name: 'density',
        default: 2,
        min: 0,
        max: 5,
        step: 0.001
      },
      {
        name: 'densityStd',
        default: 1,
        min: 0,
        max: 5,
        step: 0.001
      },
      {
        name: 'diffusion',
        default: 500,
        min: 0,
        max: 1000,
        step: 0.01
      },
      {
        name: 'k',
        default: 1,
        min: 0,
        max: 10,
        step: 0.01
      },
      {
        name: 'gravity',
        default: -1,
        min: -40,
        max: 0,
        step: 0.01
      }
    ]
  },
  {
    name: 'Background',
    visible: false,
    props: [
      {
        name: 'simplexResolution',
        default: 0.002,
        min: 0,
        max: 0.01,
        step: 0.00001
      },
      {
        name: 'simplexTimeScale',
        default: 0.001,
        min: 0,
        max: 1,
        step: 0.001
      },
      {
        name: 'simplexScale',
        default: 10,
        min: 0,
        max: 20,
        step: 0.001
      },
      {
        name: 'noise',
        default: 128,
        min: 0,
        max: 1024,
        step: 1
      }
    ]
  },
  {
    name: 'Shape',
    visible: false,
    props: [
      {
        name: 'center',
        default: 1.0,
        min: 0,
        max: 1,
        step: 0.001
      },
      {
        name: 'centerDistance',
        default: 100,
        min: 0,
        max: 1000,
        step: 0.001
      },
      {
        name: 'centerDistanceStd',
        default: 20,
        min: 0,
        max: 100,
        step: 0.001
      },
      {
        name: 'length',
        default: 300,
        min: 0,
        max: 1000,
        step: 0.001
      },
      {
        name: 'lengthStd',
        default: 100,
        min: 0,
        max: 500,
        step: 0.001
      },
      {
        name: 'nIter',
        default: 0,
        min: 0,
        max: 10,
        step: 1
      },
      {
        name: 'folds',
        default: 3,
        min: 0,
        max: 8,
        step: 1
      },
      {
        name: 'thickness',
        default: 0.5,
        min: 0,
        max: 1,
        step: 0.001
      }
    ]
  },
  {
    name: 'Color',
    visible: false,
    props: [
      {
        name: 'hueMin',
        default: 0,
        min: 0,
        max: 1,
        step: 0.0001
      },
      {
        name: 'hueMax',
        default: 0.3,
        min: 0,
        max: 1,
        step: 0.0001
      },
      {
        name: 'saturation',
        default: 1.0,
        min: 0,
        max: 1,
        step: 0.0001
      },
      {
        name: 'lightness',
        default: 1.0,
        min: 0,
        max: 1,
        step: 0.0001
      },
      {
        name: 'opacity',
        default: 0.5,
        min: 0,
        max: 1,
        step: 0.0001
      }
    ]
  }
])

resetParameter()

const resize = () => {
  app.value.width = window.innerWidth
  app.value.height = window.innerHeight
}
resize()
window.addEventListener('resize', resize)

createApp(App).mount('#app')
