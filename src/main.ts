import './assets/main.css'

import { createApp, ref } from 'vue'
import App from './App.vue'

export const app = ref({
  width: window.innerWidth,
  height: window.innerHeight,
  fps: 0
})

export const parameter = ref({
  simplexResolution: 0.005,
  simplexScale: 10.0,
  simplexTimeScale: 1.0,
  k: 1.1,
  opacity: 0.5,
  length: 100,
  diffusion: 200,
  gravity: -4.0
})

const resize = () => {
  app.value.width = window.innerWidth
  app.value.height = window.innerHeight
}
resize()
window.addEventListener('resize', resize)

createApp(App).mount('#app')
