<template>
    <a-form>
        <a-form-item
            label="预览"
            name="foresee"
        >
            <video
                ref="videoRef"
                autoplay
                controls
            />
        </a-form-item>

        <a-form-item
            label="音频输入"
            name="audio"
        >
            <a-select
                v-model:value="formState.audioDeviceId"
                :options="getOptions('audio')"
                placeholder="请选择音频输入设备"
            />
        </a-form-item>

        <a-form-item
            label="视频输入"
            name="video"
        >
            <a-select
                v-model:value="formState.videoDeviceId"
                :options="getOptions('video')"
                placeholder="请选择视频输入设备"
            />
        </a-form-item>
    </a-form>
</template>

<script setup lang="ts">
import { useUserMedia } from '@vueuse/core';
import type { SelectProps } from 'ant-design-vue';
import { storeToRefs } from 'pinia';
import { computed, onMounted, reactive, ref, watch } from 'vue';

import useSettingStore from '@/stores/settings';
import { type DeviceIdParams, getMediaConstraints } from '@/utils';

const store = useSettingStore();
const { devices, options } = storeToRefs(store);
onMounted(store.getInputs);

const formState = reactive<DeviceIdParams>({ ...devices.value });

function getOptions(type: 'audio'|'video'): SelectProps['options'] {
    return [{ label: '不开启', value: null }, ...options.value[type]];
}

const videoRef = ref<HTMLVideoElement>();
const constraints = computed<MediaStreamConstraints>(() => getMediaConstraints(formState));
const { stream, restart } = useUserMedia({ constraints });
watch(constraints, ({audio, video}) => {
    if (audio || video) {
        restart();
    }
})
watch(stream, s => {
    if (videoRef.value && s) {
        videoRef.value.srcObject = s;
    }
});

defineExpose<{
    save: () => void
}>({
    save: () => {
        store.$patch({
            open: false,
            devices: {
                audioDeviceId: formState.audioDeviceId,
                videoDeviceId: formState.videoDeviceId
            }
        });
    }
});
</script>

<style scoped lang="scss">
video {
    width: 100%;
}
</style>
