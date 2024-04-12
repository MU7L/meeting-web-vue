<template>
    <peer-provider>
        <a-layout>
            <a-layout-header>{{ meetingId }}</a-layout-header>
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
                <control-bar :disabled="false" />
            </a-layout-footer>
        </a-layout>
    </peer-provider>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';

import ControlBar from './components/ControlBar.vue';
import GridLayout from './components/GridLayout.vue';
import PeerProvider from './components/PeerProvider.vue';
import WhiteBoard from './components/WhiteBoard.vue';

const route = useRoute();
const meetingId = route.params.meetingId as string;

type ActiveTabKey = 'layout' | 'whiteboard';
const activeTabKey = ref<ActiveTabKey>('layout');
</script>

<style scoped lang="scss">
.ant-layout-header {
    text-align: center;
    color: white;
}
.ant-layout-footer {
    position: fixed;
    bottom: 0;
    width: 100%;
    background: transparent;
}
</style>
