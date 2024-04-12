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
                <control-bar :disabled="false" />
            </a-layout-footer>
        </a-layout>
    </peer-provider>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import ControlBar from './components/ControlBar.vue';
import GridLayout from './components/GridLayout.vue';
import PeerProvider from './components/PeerProvider.vue';
import WhiteBoard from './components/WhiteBoard.vue';

type ActiveTabKey = 'layout' | 'whiteboard';
const activeTabKey = ref<ActiveTabKey>('layout');
</script>

<style scoped lang="scss">
.fixed {
    position: 'fixed';
    z-index: 1;
    width: '100%';
}
</style>
