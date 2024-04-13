<template>
    <grid-layout
        v-model:layout="layout"
        is-draggable
        is-resizable
        vertical-compact
        use-css-transforms
    >
        <grid-item
            v-for="(item, index) of layout"
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
                    :srcObject="$props.items?.[index].stream"
                    autoplay
                    :muted="$props.items?.[index].id === id"
                ></video>
            </a-card>
        </grid-item>
    </grid-layout>
</template>

<script setup lang="ts">
import { GridItem, GridLayout, type Layout } from 'grid-layout-plus';
import { storeToRefs } from 'pinia';
import { computed, type CSSProperties } from 'vue';

import useAuthStore from '@/stores/auth';

export interface StreamInfo {
    i: string;
    id: string;
    stream?: MediaStream;
}

interface Props {
    items: StreamInfo[];
}

const props = withDefaults(defineProps<Props>(), {
    items: () => [] as StreamInfo[],
});

const bodyStyle: CSSProperties = {
    height: '100%',
    padding: 0,
};

const { id } = storeToRefs(useAuthStore());

const layout = computed<Layout>(() => {
    const layout: Layout = [];
    props.items.forEach((_, i) => {
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
