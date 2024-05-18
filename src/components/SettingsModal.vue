<template>
    <a-modal
        v-model:open="open"
        title="设置"
        destroyOnClose
        @ok="handleOk"
    >
        <a-tabs
            v-model:activeKey="activeKey"
            tab-position="left"
            class="pop-tabs"
        >
            <a-tab-pane key="profile" tab="个人信息">
                修改个人信息
            </a-tab-pane>
            <a-tab-pane key="devices" tab="通话设备">
                <SettingDeviceTab ref="devicesTabRef" />
            </a-tab-pane>
        </a-tabs>
    </a-modal>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref } from 'vue';

import useSettingStore from '@/stores/settings';

import SettingDeviceTab from './SettingDeviceTab.vue';

const { open } = storeToRefs(useSettingStore());
const activeKey = ref('devices');

const devicesTabRef = ref<InstanceType<typeof SettingDeviceTab>>();

function handleOk() {
    switch (activeKey.value) {
        case 'devices':
            devicesTabRef.value?.save();
            break;
    }
}
</script>

<style scoped lang="scss">
.pop-tabs {
    height: 360px;
}

:deep(.ant-tabs-content-holder) {
    overflow-y: auto;
}
</style>
