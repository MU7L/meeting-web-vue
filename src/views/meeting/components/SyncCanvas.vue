<template>
    <canvas ref="canvasRef" :width="$props.width" :height="$props.height"></canvas>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import type { CanvasCmd } from '@/stores/peer';

const props = defineProps<{
    channel: RTCDataChannel
    width: number
    height: number
}>()

const canvasRef = ref<HTMLCanvasElement>();

props.channel.addEventListener('message', e => {
    const data = JSON.parse(e.data) as CanvasCmd
    const ctx = canvasRef.value?.getContext('2d');
    ctx?.[data.fn].apply(ctx, data.args);
})
</script>
