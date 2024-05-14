<template>
    <ProfileLayout>
        <template #header>
            <div class="items-center">
                <a-popover placement="bottomLeft">
                    {{ detail?.title }}
                    <template #content>
                        <div class="popup-description">
                            <MeetingDescription v-bind="detail" />
                        </div>
                    </template>
                </a-popover>

                <a-avatar-group>
                    <template
                        v-for="[uid, {color, ...user}] in userMap"
                        :key="uid"
                    >
                        <a-tooltip :title="user.name">
                            <a-avatar
                                :src="user.avatar"
                                :style="{borderColor: color}"
                            >
                                {{ user.name }}
                            </a-avatar>
                        </a-tooltip>
                    </template>
                </a-avatar-group>
            </div>
        </template>

        <MyGridLayout />

        <div class="control-bar">
            <ControlBar
                :disabled="!active"
                @streamChange="updateLocalStream"
            />
        </div>
    </ProfileLayout>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import { storeToRefs } from 'pinia';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import MeetingDescription from '@/components/MeetingDescription.vue';
import ProfileLayout from '@/components/ProfileLayout.vue';
import usePeerStore from '@/stores/peer';
import useSettingStore from '@/stores/settings';
import type { MeetingDetail } from '@/types';
import axiosInstance, { type ResponseData } from '@/utils/axios';
import usePeers from '@/utils/peer';

import ControlBar from './components/ControlBar.vue';
import MyGridLayout from './components/MyGridLayout.vue';

const route = useRoute();
const mid = route.params.meetingId as string;

const detail = ref<MeetingDetail>();

async function getDetail() {
    const res = await axiosInstance.get<ResponseData<MeetingDetail<string>>>('/meetings/' + mid);
    const { start, end, createdAt, updatedAt, ...rest } = res.data.data;
    detail.value = {
        ...rest,
        start: dayjs(start),
        end: dayjs(end),
        createdAt: dayjs(createdAt),
        updatedAt: dayjs(updatedAt)
    };
}

onMounted(getDetail);

const { open } = storeToRefs(useSettingStore());
onMounted(() => open.value = true);

const { active, updateLocalStream } = usePeers(mid);
const { userMap } = storeToRefs(usePeerStore());

</script>

<style scoped lang="scss">
.items-center {
    display: flex;
    align-items: center;

    > *:not(:first-child) {
        margin-left: 50px;
    }
}

.popup-description {
    width: 520px;
}

.control-bar {
    position: fixed;
    bottom: 32px;
    left: 50%;
    transform: translateX(-50%);
}
</style>
