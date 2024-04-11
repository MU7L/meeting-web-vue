<template>
    <test-video :stream="localStream" />
    <video ref="videoRef" autoplay muted></video>
</template>

<script setup lang="ts">
import { ref, shallowRef, watch } from 'vue';
import TestVideo from './components/TestVideo.vue';

const localStream = shallowRef<MediaStream>();
navigator.mediaDevices.getUserMedia({video:true}).then(stream => localStream.value = stream)

const videoRef = ref<HTMLVideoElement>();
watch(localStream, (newStream) => {
    if (videoRef.value && newStream) videoRef.value.srcObject = newStream;
})
</script>
