<template>
    <peer-provider>
        <a-layout>
            <a-layout-header class="fixed">Header</a-layout-header>
            <a-layout-content>
                <a-tabs
                    v-model:activeKey="activeTabKey"
                    centered
                >
                    <a-tab-pane
                        key="layout"
                        tab="会议"
                        forceRender
                    >
                        <grid-layout />
                    </a-tab-pane>
                    <a-tab-pane
                        key="whiteboard"
                        tab="白板"
                        forceRender
                        closeable
                    >
                        <white-board />
                    </a-tab-pane>
                </a-tabs>
            </a-layout-content>
            <a-layout-footer>
                <control-bar
                    :disabled="false"
                    @change="streamChangeHandler"
                />
            </a-layout-footer>
        </a-layout>
    </peer-provider>
</template>

<script setup lang="ts">
import { inject, type Ref, ref } from 'vue';

import { useAuthStore } from '@/stores/auth';
import Peer from '@/utils/peer';

import ControlBar from './components/ControlBar.vue';
import GridLayout from './components/GridLayout.vue';
import PeerProvider from './components/PeerProvider.vue';
import WhiteBoard from './components/WhiteBoard.vue';

type ActiveTabKey = 'layout' | 'whiteboard';
const activeTabKey = ref<ActiveTabKey>('layout');

const { id } = useAuthStore();
const peerMap = inject<Ref<Map<string, Peer>>>('peerMap');

// TODO: 函数移入ctrlBar中
// 1. 推荐在供给方组件内声明并提供一个更改数据的方法函数
// 2. 考虑将peer存入pinia
function streamChangeHandler(newStream?: MediaStream, oldStream?: MediaStream) {
    if (!peerMap) return;
    const peer = peerMap.value.get(id);
    if (!peer) return;
    let localStreams = peer.streams;
    if (oldStream) {
        localStreams = localStreams.filter(
            stream => stream.id !== oldStream.id,
        );
    }
    if (newStream) {
        localStreams.push(newStream);
    }
    peerMap.value.set(id, { ...peer, streams: localStreams });
}
</script>

<style scoped lang="scss">
.fixed {
    position: 'fixed';
    z-index: 1;
    width: '100%';
}
</style>
