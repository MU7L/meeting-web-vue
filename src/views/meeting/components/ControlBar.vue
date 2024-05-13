<template>
    <a-space-compact block>
        <a-dropdown placement="top">
            <a-button
                :type="constraints.audio ? 'primary' : 'default'"
                :disabled="$props.disabled || options.audio.length === 0"
                @click="switchAudio"
            >
                <AudioOutlined />
                <div>麦克风</div>
            </a-button>
            <template #overlay>
                <a-menu
                    selectable
                    :selectedKeys="[devices.audioDeviceId]"
                    :items="options.audio"
                    @select="selectAudio"
                />
            </template>
        </a-dropdown>

        <a-dropdown placement="top">
            <a-button
                :type="constraints.video ? 'primary' : 'default'"
                :disabled="$props.disabled || options.video.length === 0"
                @click="switchVideo"
            >
                <VideoCameraOutlined />
                <div>视频</div>
            </a-button>
            <template #overlay>
                <a-menu
                    selectable
                    :selectedKeys="[devices.videoDeviceId]"
                    :items="options.video"
                    @select="selectVideo"
                />
            </template>
        </a-dropdown>

        <a-button
            :type="displayMediaCtrl.enabled.value ? 'primary' : 'default'"
            @click="switchScreen"
        >
            <DesktopOutlined />
            <div>屏幕共享</div>
        </a-button>

        <a-button>
            <FundProjectionScreenOutlined />
            <div>白板</div>
        </a-button>

        <a-button danger @click="$emit('leave')">
            <PoweroffOutlined />
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
    VideoCameraOutlined
} from '@ant-design/icons-vue';
import { useDisplayMedia, useUserMedia } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import { onMounted, watch } from 'vue';

import useSettingStore from '@/stores/settings';

const props = withDefaults(defineProps<{
    disabled: boolean;
}>(), {
    disabled: true
});

const emit = defineEmits<{
    streamChange: [newStream?: MediaStream, oldStream?: MediaStream];
    leave: [];
}>();

const store = useSettingStore();
const { devices, constraints, options } = storeToRefs(store);
onMounted(store.getInputs)
console.log(options.value);

function selectAudio({ key }: { key: string }) {
    devices.value.audioDeviceId = key;
}

function selectVideo({ key }: { key: string }) {
    devices.value.videoDeviceId = key;
}

// 本地流控制
const { stream: userStream, ...userStreamCtrl } = useUserMedia({ constraints });
const { stream: displayStream, ...displayMediaCtrl } = useDisplayMedia({
    video: true,
    audio: true
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
    }
);

function streamChangeHandler(newStream?: MediaStream, oldStream?: MediaStream) {
    if (props.disabled) return;
    console.log('streamChangeHandler', newStream, oldStream);
    emit('streamChange', newStream, oldStream);
}

watch(userStream, streamChangeHandler);
watch(displayStream, streamChangeHandler);

function switchAudio() {
    if (devices.value.audioDeviceId) {
        devices.value.audioDeviceId = null;
        return;
    }
    if (devices.value.audioInputs.length === 0) return;
    devices.value.audioDeviceId = devices.value.audioInputs[0].deviceId;
}

function switchVideo() {
    if (devices.value.videoDeviceId) {
        devices.value.videoDeviceId = null;
        return;
    }
    if (devices.value.videoInputs.length === 0) return;
    devices.value.videoDeviceId = devices.value.videoInputs[0].deviceId;
}

function switchScreen() {
    displayStream.value ? displayMediaCtrl.stop() : displayMediaCtrl.start();
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
