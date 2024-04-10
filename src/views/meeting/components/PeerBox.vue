<template>
    <el-card>
        <video :srcObject="stream" autoplay />
    </el-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
interface Props {
    id: string;
    stream?: MediaStream;
}
const props = defineProps<Props>();

const stream = ref(props.stream);
</script>
