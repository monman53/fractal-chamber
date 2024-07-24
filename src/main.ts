import './assets/main.css'

import { createApp, ref } from 'vue'
import App from './App.vue'

export const app = ref({
  width: window.innerWidth,
  height: window.innerHeight
})

const resize = () => {
  app.value.width = window.innerWidth
  app.value.height = window.innerHeight
}
resize()
window.addEventListener('resize', resize)

createApp(App).mount('#app')
