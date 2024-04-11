<template>
    <a-card><video :srcObject="$props.stream" autoplay></video></a-card>
</template>

<script setup lang="ts">
interface Props {
    id: string;
    stream?: MediaStream;
}
withDefaults(defineProps<Props>(), { stream: undefined });
</script>
