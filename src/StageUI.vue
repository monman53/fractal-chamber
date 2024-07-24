<script setup lang="ts">
import { app } from './main';
</script>

<template>
    <div id="base">
        {{ app.width }}, {{ app.height }}
    </div>
</template>

<style scoped>
#base {
    background-color: #000;
    color: white;
}
</style>