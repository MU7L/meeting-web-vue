<template>
    <div>
        <a-avatar :src="$props.avatar">{{ $props.name ?? '-' }}</a-avatar>
        <span>{{ $props.name ?? '-' }}</span>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    avatar?: string;
    name?: string;
}>();
</script>

<style scoped lang="scss">
span {
    margin-left: 8px;
}
</style>
