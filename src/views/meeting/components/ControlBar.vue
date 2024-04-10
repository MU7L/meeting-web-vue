<template>
    <el-button-group>
        <el-dropdown @command="handleMicrophoneCmd">
            <el-button
                @click="handleMicrophoneClick"
                :type="constraints.audio ? 'primary' : 'default'"
            >
                <el-icon><Microphone /></el-icon>
                麦克风
            </el-button>
            <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item
                        v-for="device in audioDevices"
                        :key="device.deviceId"
                        :command="device.deviceId"
                    >
                        {{ device.label }}
                    </el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown>

        <el-dropdown @command="handleCameraCmd">
            <el-button @click="handleCameraClick" :type="constraints.video ? 'primary' : 'default'">
                <el-icon><VideoCamera /></el-icon>
                视频
            </el-button>
            <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item
                        v-for="device in videoDevices"
                        :key="device.deviceId"
                        :command="device.deviceId"
                    >
                        {{ device.label }}
                    </el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown>

        <el-button @click="getDisplayMedia">
            <el-icon><VideoCamera /></el-icon>
            共享屏幕
        </el-button>

        <el-button @click="getUserMedia">
            <el-icon><VideoCamera /></el-icon>
            白板
        </el-button>

        <el-button @click="getUserMedia" type="danger">
            <el-icon><VideoCamera /></el-icon>
            退出
        </el-button>
    </el-button-group>
</template>

<script setup lang="ts">
import { ref, onBeforeMount } from 'vue';

const emit = defineEmits<{
    userMedia: [stream?: MediaStream];
    displayMedia: [stream?: MediaStream];
}>();

const audioDevices = ref<MediaDeviceInfo[]>([]);
const videoDevices = ref<MediaDeviceInfo[]>([]);
onBeforeMount(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    stream.getTracks().forEach((track) => track.stop());
    const devices = await navigator.mediaDevices.enumerateDevices();
    audioDevices.value = devices.filter((device) => device.kind === 'audioinput');
    videoDevices.value = devices.filter((device) => device.kind === 'videoinput');
});

const constraints = ref<MediaStreamConstraints>({
    audio: false,
    video: false
});

function handleMicrophoneCmd(deviceId: string) {
    constraints.value.audio = { deviceId };
    getUserMedia();
}

function handleMicrophoneClick() {
    constraints.value.audio = !constraints.value.audio;
    getUserMedia();
}

function handleCameraCmd(deviceId: string) {
    constraints.value.video = { deviceId };
    getUserMedia();
}

function handleCameraClick() {
    constraints.value.video = !constraints.value.video;
    getUserMedia();
}

const userMediaStream = ref<MediaStream>();
function getUserMedia() {
    if (constraints.value.audio || constraints.value.video) {
        navigator.mediaDevices
            .getUserMedia(constraints.value)
            .then((stream) => {
                userMediaStream.value = stream;
                emit('userMedia', stream);
            })
            .catch((err) => {
                console.log(err);
            });
    } else {
        userMediaStream.value?.getTracks().forEach((track) => track.stop());
    }
}

const displayMediaStream = ref<MediaStream>();
function getDisplayMedia() {
    if (!displayMediaStream.value) {
        navigator.mediaDevices
            .getDisplayMedia({ audio: true, video: true })
            .then((stream) => {
                displayMediaStream.value = stream;
                emit('displayMedia', stream);
            })
            .catch((err) => {
                console.log(err);
            });
    } else {
        displayMediaStream.value.getTracks().forEach((track) => track.stop());
    }
}
</script>
