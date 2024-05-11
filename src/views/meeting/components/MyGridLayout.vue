<template>
    <GridLayout
        v-model:layout="layout"
        is-draggable
        is-resizable
        vertical-compact
        use-css-transforms
    >
        <GridItem
            v-for="item of layout"
            :key="item.i"
            v-bind="item"
            drag-allow-from=".vue-draggable-handle"
        >
            <VideoCard v-bind="streamInfoMap.get(String(item.i))!"/>
        </GridItem>
    </GridLayout>
</template>

<script setup lang="ts">
import { GridItem, GridLayout, type Layout } from 'grid-layout-plus';
import { storeToRefs } from 'pinia';
import { ref, watch } from 'vue';

import usePeerStore from '@/stores/peer';
import VideoCard from '@/views/meeting/components/VideoCard.vue';

const { streamInfoMap } = storeToRefs(usePeerStore());

const layout = ref<Layout>([]);
watch(streamInfoMap, () => {
    const tmp: Layout = [];
    streamInfoMap.value.forEach((_, sid) => {
        const w = 3;
        const h = 2;
        tmp.push({
            i: sid,
            x: (tmp.length * w) % 12,
            y: Math.floor((tmp.length * w) / 12) * h,
            w,
            h,
        });
    });
    layout.value = tmp;
})
</script>

<style scoped lang="scss">
:deep(.vgl-item) {
    border-radius: 8px;
}

.ant-card {
    height: 100%;
    overflow: hidden;

    :deep(.ant-card-head) {
        min-height: 0;
        border-bottom: none;
    }

    .ant-card-head {
        .vue-draggable-handle {
            z-index: 10;
            position: absolute;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            box-sizing: border-box;
            width: 30px;
            height: 5px;
            border-radius: 5px;
            background-color: black;
            cursor: grab;
            transition: background-color 300ms;

            &:hover {
                background-color: grey;
            }
        }
    }

    .ant-card-body {
        video {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }
    }
}

.ant-card-hoverable {
    cursor: default;
}
</style>
