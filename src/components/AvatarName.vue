<template>
    <div>
        <a-avatar :src="$props.avatar">{{ $props.name ?? '-' }}</a-avatar>
        <span>{{ $props.name ?? '-' }}</span>
    </div>
</template>

<script setup lang="ts">
import type { User } from '@/types';

defineProps<User>();
</script>

<style scoped lang="scss">
span {
    margin-left: 8px;
}
</style>
