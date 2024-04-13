<template>
    <a-layout>
        <a-layout-header>{{ meetingId }}</a-layout-header>
        <a-layout-content>
            <grid-layout :items="streamInfoList" />
        </a-layout-content>
        <a-layout-footer>
            <control-bar
                :disabled="!active"
                @streamChange="updateLocalStream"
            />
        </a-layout-footer>
    </a-layout>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import usePeers from '@/utils/peer';

import ControlBar from './components/ControlBar.vue';
import GridLayout, { type StreamInfo } from './components/GridLayout.vue';

const route = useRoute();
const meetingId = route.params.meetingId as string;

const { peerMap, active, updateLocalStream } = usePeers();

const streamInfoList = computed<StreamInfo[]>(() => {
    const list: StreamInfo[] = [];
    peerMap.value.forEach((peer, id) => {
        if (peer.streamMap.size === 0) {
            list.push({ i: id, id });
        } else {
            peer.streamMap.forEach((stream, streamId) => {
                list.push({
                    i: streamId,
                    id,
                    stream,
                });
            });
        }
    });
    return list;
});
</script>

<style scoped lang="scss">
.ant-layout-header {
    text-align: center;
    color: white;
}
.ant-layout-footer {
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    background: transparent;
}
</style>
