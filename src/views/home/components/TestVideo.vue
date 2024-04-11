<template>
    <video ref="videoRef" autoplay muted></video>
</template>

<script setup lang="ts">
import { onMounted, ref, toRaw, watch } from 'vue';

const props = defineProps<{stream: MediaStream}>();
const videoRef = ref<HTMLVideoElement>();
watch(() => props.stream, (newStream) => {
    if (videoRef.value) videoRef.value.srcObject = toRaw(newStream);
})
</script>