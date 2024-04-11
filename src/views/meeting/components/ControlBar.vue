<template>
    <a-space-compact block>
        <a-dropdown>
            <a-button>
                <LikeOutlined />
                麦克风
            </a-button>
            <template #overlay>
                <a-menu>
                    <a-menu-item v-for="input of audioInputs" :key="input.deviceId">
                        {{ input.label }}
                    </a-menu-item>
                </a-menu>
            </template>
        </a-dropdown>

        <a-dropdown>
            <a-button>
                <LikeOutlined />
                视频
            </a-button>
            <template #overlay>
                <a-menu>
                    <a-menu-item v-for="input of videoInputs" :key="input.deviceId">
                        {{ input.label }}
                    </a-menu-item>
                </a-menu>
            </template>
        </a-dropdown>

        <a-button>
            <LikeOutlined />
            屏幕共享
        </a-button>

        <a-button>
            <LikeOutlined />
            白板
        </a-button>

        <a-button>
            <LikeOutlined />
            退出
        </a-button>
    </a-space-compact>
</template>

<script setup lang="ts">
import { useDevicesList, useDisplayMedia, useUserMedia } from '@vueuse/core';
import { ref } from 'vue';

const { videoInputs, audioInputs } = useDevicesList({
    requestPermissions: true
});
const userMediaConstraints = ref<MediaStreamConstraints>({
    video: false,
    audio: false
});
const userMedia = useUserMedia({ constraints: userMediaConstraints });
const displayMedia = useDisplayMedia();
</script>
