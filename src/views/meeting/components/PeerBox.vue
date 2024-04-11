<template>
    <el-card>
        <video ref="videoRef" autoplay muted></video>
    </el-card>
</template>

<script setup lang="ts">
import { ref, toRaw, watch } from 'vue';
interface Props {
    id: string;
    stream?: MediaStream;
}
const props = defineProps<Props>();
console.log(props);

const videoRef = ref<HTMLVideoElement>();
watch(
    () => props.stream,
    (newStream) => {
        console.log(newStream);
        if (videoRef.value && newStream) videoRef.value.srcObject = toRaw(newStream);
    }
);
</script>
