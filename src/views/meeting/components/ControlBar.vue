<template>
    <a-space-compact block>
        <a-dropdown placement="top">
            <a-button
                :type="userMediaConstraints.audio ? 'primary' : 'default'"
                :disabled="disabled || audioInputs.length === 0"
                @click="handleAudioClick"
            >
                <audio-outlined />
                <div>麦克风</div>
            </a-button>
            <template #overlay>
                <a-menu @click="handleAudioSelect">
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
                :type="userMediaConstraints.video ? 'primary' : 'default'"
                :disabled="disabled || videoInputs.length === 0"
                @click="handleVideoClick"
            >
                <video-camera-outlined />
                <div>视频</div>
            </a-button>
            <template #overlay>
                <a-menu @click="handleVideoSelect">
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
import type { MenuProps } from 'ant-design-vue';
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

// 本地流控制
const userMediaConstraints = ref<MediaStreamConstraints>({
    video: false,
    audio: false,
});
const userMediaCtrl = useUserMedia({ constraints: userMediaConstraints });
const displayMediaCtrl = useDisplayMedia({ video: true, audio: true });

// 更新本地流
function streamChangeHandler(newStream?: MediaStream, oldStream?: MediaStream) {
    if (!peerMapCtrl) return;
    peerMapCtrl.changeStream(newStream, oldStream);
}
watch(() => userMediaCtrl.stream.value, streamChangeHandler);
watch(() => displayMediaCtrl.stream.value, streamChangeHandler);

function handleAudioClick() {
    const audio = userMediaConstraints.value.audio;
    userMediaConstraints.value.audio = !audio;
    if (userMediaCtrl.stream.value) {
        if (audio) {
            userMediaCtrl.stop();
        } else {
            userMediaCtrl.restart();
        }
    } else {
        userMediaCtrl.start();
    }
}

const handleAudioSelect: MenuProps['onClick'] = ({ key }) => {
    userMediaConstraints.value.audio = {
        advanced: [{ deviceId: key as string }],
    };
    if (userMediaCtrl.stream.value) {
        userMediaCtrl.restart();
    } else {
        userMediaCtrl.start();
    }
};

function handleVideoClick() {
    const video = userMediaConstraints.value.video;
    userMediaConstraints.value.video = !video;
    if (userMediaCtrl.stream.value) {
        if (video) {
            userMediaCtrl.stop();
        } else {
            userMediaCtrl.restart();
        }
    } else {
        userMediaCtrl.start();
    }
}

const handleVideoSelect: MenuProps['onClick'] = ({ key }) => {
    userMediaConstraints.value.video = {
        advanced: [{ deviceId: key as string }],
    };
    if (userMediaCtrl.stream.value) {
        userMediaCtrl.restart();
    } else {
        userMediaCtrl.start();
    }
};

function handleScreenClick() {
    if (displayMediaCtrl.stream.value) {
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
