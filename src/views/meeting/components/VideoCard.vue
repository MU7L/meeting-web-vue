<template>
    <a-card
        hoverable
        :bodyStyle="bodyStyle"
    >
        <template #title>
            <div class="vue-draggable-handle"></div>
        </template>
        <video
            v-if="hasVideo"
            ref="videoRef"
            autoplay
            :muted="$props.uid === localId"
        />
        <div v-else class="audio-content">
            <audio
                ref="audioRef"
                autoplay
                :muted="$props.uid === localId"
            />
            <a-avatar size="large" :src="user?.avatar" :style="{ borderColor: borderColor }">{{user?.name}}</a-avatar>
            {{user?.name}}
        </div>
    </a-card>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, type CSSProperties, onMounted, ref } from 'vue';

import useAuthStore from '@/stores/auth';
import usePeerStore, { type StreamInfo } from '@/stores/peer';

const props = defineProps<StreamInfo>()
const borderColor = computed(() => props.color)

const { id: localId } = storeToRefs(useAuthStore());
const {userMap} = storeToRefs(usePeerStore());

const bodyStyle: CSSProperties = {
    height: '100%',
    padding: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
};

const hasVideo = computed(() => props.stream.getVideoTracks().length > 0)
const user = computed(() => userMap.value.get(props.uid))

const videoRef = ref<HTMLVideoElement>();
const audioRef = ref<HTMLAudioElement>();

onMounted(() => {
    if (hasVideo.value) {
        if (videoRef.value) {
            videoRef.value.srcObject = props.stream;
            videoRef.value?.addEventListener('loadedmetadata', () => {
                videoRef.value?.play();
            })
        }
    } else {
        if (audioRef.value) {
            audioRef.value.srcObject = props.stream;
        }
    }
})
</script>

<style scoped lang="scss">
.ant-card {
    height: 100%;
    overflow: hidden;

    :deep(.ant-card-head) {
        min-height: 0;
        border-bottom: none;
    }

    .ant-card-head {
        .vue-draggable-handle {
            z-index: 10;
            position: absolute;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            box-sizing: border-box;
            width: 30px;
            height: 5px;
            border-radius: 5px;
            background-color: black;
            cursor: grab;
            transition: background-color 300ms;

            &:hover {
                background-color: grey;
            }
        }
    }

    .ant-card-body {
        video {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }

        .audio-content {
            display: flex;
            flex-direction: column;
            align-items: center;

            > * {
                margin-bottom: 8px;
            }
        }
    }
}

.ant-card-hoverable {
    cursor: default;
}

.ant-card-bordered {
    border-color: v-bind(borderColor)
}
</style>
