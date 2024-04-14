<template>
    <a-layout>
        <a-layout-header>{{ meetingId }}</a-layout-header>
        <a-layout-content>
            <grid-layout />
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
import { useRoute } from 'vue-router';

import usePeers from '@/utils/peer';

import ControlBar from './components/ControlBar.vue';
import GridLayout from './components/GridLayout.vue';

const route = useRoute();
const meetingId = route.params.meetingId as string;

const { active, updateLocalStream } = usePeers();
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
