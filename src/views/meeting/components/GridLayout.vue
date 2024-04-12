<template>
    <grid-layout
        v-model:layout="layout"
        is-draggable
        is-resizable
        vertical-compact
        use-css-transforms
    >
        <grid-item
            v-for="item of layout"
            :key="item.i"
            v-bind="item"
            drag-allow-from=".vue-draggable-handle"
        >
            <a-card
                hoverable
                :bodyStyle="bodyStyle"
            >
                <template #title>
                    <div class="vue-draggable-handle"></div>
                </template>
                <video
                    class="card-video"
                    :srcObject="infoMap.get(String(item.i))?.stream"
                    autoplay
                ></video>
            </a-card>
        </grid-item>
    </grid-layout>
</template>

<script setup lang="ts">
import { GridItem, GridLayout, type Layout } from 'grid-layout-plus';
import { computed, type CSSProperties, inject } from 'vue';

import PEER_MAP_CTRL from './peerProvider';

const bodyStyle: CSSProperties = {
    height: '100%',
    padding: 0,
};

const peerMapCtrl = inject(PEER_MAP_CTRL);

interface StreamInfo {
    id: string;
    stream?: MediaStream;
}

const infoMap = computed<Map<string, StreamInfo>>(() => {
    const map = new Map<string, StreamInfo>();
    peerMapCtrl?.peerMap.value.forEach((peer, id) => {
        if (peer.streams.length === 0) {
            map.set(id, { id });
        } else {
            peer.streams.forEach(stream => {
                map.set(stream.id, { id, stream });
            });
        }
    });
    return map;
});

const layout = computed<Layout>(() => {
    const layout: Layout = [];
    infoMap.value.forEach((_, i) => {
        const w = 3;
        const h = 2;
        layout.push({
            i,
            x: (layout.length * w) % 12,
            y: Math.floor((layout.length * w) / 12) * h,
            w,
            h,
        });
    });
    return layout;
});
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
        .card-video {
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
