<template>
    <a-space-compact block>
        <a-dropdown>
            <a-button
                :type="userMediaConstraints.audio ? 'primary' : 'default'"
                :disabled="$props.disabled"
                @click="handleAudioClick"
            >
                <audio-outlined />
                麦克风
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

        <a-dropdown>
            <a-button
                :type="userMediaConstraints.video ? 'primary' : 'default'"
                :disabled="$props.disabled"
                @click="handleVideoClick"
            >
                <video-camera-outlined />
                视频
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
            屏幕共享
        </a-button>

        <a-button>
            <fund-projection-screen-outlined />
            白板
        </a-button>

        <a-button danger>
            <poweroff-outlined />
            退出
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
import { ref, watch } from 'vue';

interface Props {
    disabled: boolean;
}
withDefaults(defineProps<Props>(), { disabled: false });

const emit = defineEmits<{
    change: [newStream?: MediaStream, oldStream?: MediaStream];
}>();

const { videoInputs, audioInputs } = useDevicesList({
    requestPermissions: true,
});

const userMediaConstraints = ref<MediaStreamConstraints>({
    video: false,
    audio: false,
});
const userMediaCtrl = useUserMedia({ constraints: userMediaConstraints });
watch(
    () => userMediaCtrl.stream.value,
    (newStream, oldStream) => {
        emit('change', newStream, oldStream);
    },
);

const displayMediaCtrl = useDisplayMedia({ video: true, audio: true });
watch(
    () => displayMediaCtrl.stream.value,
    (newStream, oldStream) => {
        emit('change', newStream, oldStream);
    },
);

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
