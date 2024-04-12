<template>
    <a-space-compact block>
        <a-dropdown placement="top">
            <a-button
                :type="constraints.audio ? 'primary' : 'default'"
                :disabled="disabled || audioInputs.length === 0"
                @click="handleAudioClick"
            >
                <audio-outlined />
                <div>麦克风</div>
            </a-button>
            <template #overlay>
                <a-menu
                    selectable
                    v-model:selectedKeys="currentAudioInputs"
                >
                    <a-menu-item
                        v-for="input of audioInputs"
                        :key="input.deviceId"
                    >
                        {{ input.label }}
                    </a-menu-item>
                </a-menu>
            </template>
        </a-dropdown>

        <a-dropdown placement="top">
            <a-button
                :type="constraints.video ? 'primary' : 'default'"
                :disabled="disabled || videoInputs.length === 0"
                @click="handleVideoClick"
            >
                <video-camera-outlined />
                <div>视频</div>
            </a-button>
            <template #overlay>
                <a-menu
                    selectable
                    v-model:selectedKeys="currentVideoInputs"
                >
                    <a-menu-item
                        v-for="input of videoInputs"
                        :key="input.deviceId"
                    >
                        {{ input.label }}
                    </a-menu-item>
                </a-menu>
            </template>
        </a-dropdown>

        <a-button
            :type="displayMediaCtrl.enabled.value ? 'primary' : 'default'"
            @click="handleScreenClick"
        >
            <desktop-outlined />
            <div>屏幕共享</div>
        </a-button>

        <a-button>
            <fund-projection-screen-outlined />
            <div>白板</div>
        </a-button>

        <a-button danger>
            <poweroff-outlined />
            <div>退出</div>
        </a-button>
    </a-space-compact>
</template>

<script setup lang="ts">
import {
    AudioOutlined,
    DesktopOutlined,
    FundProjectionScreenOutlined,
    PoweroffOutlined,
    VideoCameraOutlined,
} from '@ant-design/icons-vue';
import { useDevicesList, useDisplayMedia, useUserMedia } from '@vueuse/core';
import { computed, inject, ref, watch } from 'vue';

import PEER_MAP_CTRL from './peerProvider';

const peerMapCtrl = inject(PEER_MAP_CTRL);
const disabled = computed<boolean>(
    () => !(peerMapCtrl && peerMapCtrl.enabled.value),
);

// 设备列表
const { videoInputs, audioInputs } = useDevicesList({
    requestPermissions: true,
});
const currentAudioInputs = ref<string[]>([]);
const currentVideoInputs = ref<string[]>([]);

// 本地流控制
const constraints = computed<MediaStreamConstraints>(() => ({
    audio:
        currentAudioInputs.value.length > 0
            ? { advanced: [{ deviceId: currentAudioInputs.value[0] }] }
            : false,
    video:
        currentVideoInputs.value.length > 0
            ? { advanced: [{ deviceId: currentVideoInputs.value[0] }] }
            : false,
}));
const { stream: userStream, ...userStreamCtrl } = useUserMedia({ constraints });
const { stream: displayStream, ...displayMediaCtrl } = useDisplayMedia({
    video: true,
    audio: true,
});

// 更新本地流
watch(
    constraints,
    (newConstraints, oldConstraints) => {
        if (!oldConstraints.audio && !oldConstraints.video) {
            userStreamCtrl.start();
        } else if (!newConstraints.audio && !newConstraints.video) {
            userStreamCtrl.stop();
        } else {
            userStreamCtrl.restart();
        }
    },
    { deep: true },
);
function streamChangeHandler(newStream?: MediaStream, oldStream?: MediaStream) {
    if (!peerMapCtrl) return;
    peerMapCtrl.changeStream(newStream, oldStream);
}
watch(userStream, streamChangeHandler);
watch(displayStream, streamChangeHandler);

function handleAudioClick() {
    if (currentAudioInputs.value.length === 0 && audioInputs.value.length > 0) {
        currentAudioInputs.value = [audioInputs.value[0].deviceId];
    } else {
        currentAudioInputs.value = [];
    }
}

function handleVideoClick() {
    if (currentVideoInputs.value.length === 0 && videoInputs.value.length > 0) {
        currentVideoInputs.value = [videoInputs.value[0].deviceId];
    } else {
        currentVideoInputs.value = [];
    }
}

function handleScreenClick() {
    if (displayStream.value) {
        displayMediaCtrl.stop();
    } else {
        displayMediaCtrl.start();
    }
}
</script>

<style scoped lang="scss">
.ant-space-compact-block {
    justify-content: center;
}
.ant-btn {
    height: auto;
}
</style>
