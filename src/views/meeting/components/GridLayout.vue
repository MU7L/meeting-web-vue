<template>
    <grid-layout
        v-model:layout="layout"
        :col-num="12"
        :row-height="30"
        is-draggable
        is-resizable
        vertical-compact
        use-css-transforms
    >
        <template #item="{ item }">
            {{ item.i }}
        </template>
    </grid-layout>
</template>

<script setup lang="ts">
import { GridLayout } from 'grid-layout-plus';
import { reactive } from 'vue';

const layout = reactive([
    { x: 0, y: 0, w: 2, h: 2, i: '0' },
    { x: 2, y: 0, w: 2, h: 4, i: '1' }
]);
</script>
