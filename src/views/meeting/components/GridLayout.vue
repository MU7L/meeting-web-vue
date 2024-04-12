<template>
    <grid-layout
        v-model:layout="layout"
        is-draggable
        is-resizable
        vertical-compact
        use-css-transforms
    >
        <template #item="{ item }">
            <peer-box v-bind="propMap.get(item.i)!" />
        </template>
    </grid-layout>
</template>

<script setup lang="ts">
import { GridLayout, type Layout } from 'grid-layout-plus';
import { computed, inject } from 'vue';

import PeerBox, { type Props as PeerBoxProps } from './PeerBox.vue';
import PEER_MAP_CTRL from './peerProvider';

const peerMapCtrl = inject(PEER_MAP_CTRL);

const propMap = computed<Map<string, PeerBoxProps>>(() => {
    const map = new Map<string, PeerBoxProps>();
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
    propMap.value.forEach((_, i) => {
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
