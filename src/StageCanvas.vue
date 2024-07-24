<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { app } from './main';

const canvas = ref()

const offscreenCanvas = new OffscreenCanvas(app.value.width, app.value.height)
const ctx = offscreenCanvas.getContext('2d', { alpha: false })
if (ctx === null) {
    throw new Error()
}

let mainCtx: any = null

const draw = () => {
    ctx.reset()
    const scale = 1
    ctx.transform(
        scale,
        0,
        0,
        scale,
        app.value.width * 0.5,
        app.value.height * 0.5,
    )
    ctx.globalCompositeOperation = 'lighten'
    ctx.strokeStyle = 'white'
    ctx.lineWidth = 10
    ctx.beginPath()
    ctx.moveTo(100, 100)
    ctx.lineTo(200, 200)
    ctx.stroke()

    //--------------------------------
    // Copy offscreen render result to main canvas
    //--------------------------------
    mainCtx.transferFromImageBitmap(offscreenCanvas.transferToImageBitmap())
}

onMounted(() => {
    mainCtx = canvas.value.getContext('bitmaprenderer')
    window.requestAnimationFrame(draw)
})

watch(
    [app],
    () => {
        canvas.value.width = app.value.width
        canvas.value.height = app.value.height
        offscreenCanvas.width = app.value.width
        offscreenCanvas.height = app.value.height
        window.requestAnimationFrame(draw)
    },
    { deep: true }
)
</script>

<template>
    <div id="base">
        <canvas ref="canvas" :width="app.width" :height="app.height"></canvas>
    </div>
</template>

<style scoped>
#base {}
</style>