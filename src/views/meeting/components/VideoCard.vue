<template>
    <a-card
        hoverable
        :bodyStyle="bodyStyle"
    >
        <template #title>
            <div class="vue-draggable-handle"></div>
        </template>
        <video
            ref="videoRef"
            autoplay
            :muted="$props.uid === localId"
        />
    </a-card>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, type CSSProperties, onMounted, ref } from 'vue';

import useAuthStore from '@/stores/auth';
import { type StreamInfo } from '@/stores/peer';

const props = defineProps<StreamInfo>()
const borderColor = computed(() => props.color)

const { id: localId } = storeToRefs(useAuthStore());

const bodyStyle: CSSProperties = {
    height: '100%',
    padding: 0,
};



const videoRef = ref<HTMLVideoElement>();

onMounted(() => {
    if (videoRef.value) {
        videoRef.value.srcObject = props.stream;
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
    }
}

.ant-card-hoverable {
    cursor: default;
}

.ant-card-bordered {
    border-color: v-bind(borderColor)
}
</style>
