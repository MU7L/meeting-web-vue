<template>
    <a-tooltip>
        <template #title>{{ $props.title }}</template>
        <a-button
            type="text"
            @click="openModal"
            block
        >
            <div class="ellipsis-overflow">
                {{ `${$props.start.format('H:mm')} - ${$props.end.format('H:mm')}` }}
            </div>
            <div class="ellipsis-overflow">{{ $props.title }}</div>
        </a-button>
    </a-tooltip>

    <a-modal v-model:open="open">
        <a-descriptions :title="detail?.title ?? '会议详情'"
            layout="vertical">

            <template #extra>
                <a-button
                    type="link"
                    :disabled="detail?.status !== 'ongoing'"
                    @click="enterMeeting"
                >
                    {{ EnterButtonContent[detail?.status ?? 'pending'] }}
                </a-button>
            </template>

            <a-descriptions-item label="会议时间"
                :span="2">
                {{ `${detail?.start.format('M月d日 dddd H:mm')} - ${detail?.end.format('H:mm')}` }}
            </a-descriptions-item>
            <a-descriptions-item label="主持人">
                <AvatarName v-bind="detail?.sponsor" />
            </a-descriptions-item>
            <a-descriptions-item
                label="参会人员"
                :span="3"
                :content-style="{flexDirection: 'column'}"
            >
                <AttendeeSegmented :attendees="detail?.attendees" />
            </a-descriptions-item>
        </a-descriptions>

        <template #footer>
            <template v-if="detail?.status === 'pending'">
                <a-button
                    :type="response === 'accepted' ? 'primary' : 'default'"
                    @click="updateResponse('accepted')"
                >
                    <template #icon>
                        <CheckCircleOutlined />
                    </template>
                    接受
                </a-button>
                <a-button
                    :type="response === 'pending' ? 'primary' : 'default'"
                    @click="updateResponse('pending')"
                >
                    <template #icon>
                        <QuestionCircleOutlined />
                    </template>
                    暂定
                </a-button>
                <a-button
                    :type="response === 'rejected' ? 'primary' : 'default'"
                    @click="updateResponse('rejected')"
                    danger
                >
                    <template #icon>
                        <CloseCircleOutlined />
                    </template>
                    拒绝
                </a-button>
            </template>
        </template>
    </a-modal>
</template>

<script lang="ts" setup>
import { CheckCircleOutlined, CloseCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons-vue';
import dayjs, { type Dayjs } from 'dayjs';
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';

import AvatarName from '@/components/AvatarName.vue';
import useAuthStore from '@/stores/auth';
import axiosInstance, { type ResponseData } from '@/utils/axios';
import AttendeeSegmented from '@/views/home/calendar/components/AttendeeSegmented.vue';
import type { MeetingDetail, MeetingStatus, UserResponse } from '@/views/home/calendar/types';

const props = defineProps<{
    mid: string;
    title: string;
    start: Dayjs;
    end: Dayjs;
}>();

const { id } = storeToRefs(useAuthStore());

const detail = ref<MeetingDetail>();
const response = computed<UserResponse>(() =>
    detail.value?.attendees.find(attendee => attendee.user._id === id.value)?.response ?? 'pending'
);

async function getDetail() {
    const res = await axiosInstance.get<ResponseData<MeetingDetail<string>>>('/meetings/' + props.mid);
    const { start, end, createdAt, updatedAt, ...rest } = res.data.data;
    detail.value = {
        ...rest,
        start: dayjs(start),
        end: dayjs(end),
        createdAt: dayjs(createdAt),
        updatedAt: dayjs(updatedAt)
    };
}

const open = ref<boolean>(false);

async function openModal() {
    await getDetail();
    open.value = true;
}

const EnterButtonContent: Record<MeetingStatus, string> = {
    pending: '会议尚未开始',
    ongoing: '进入会议',
    finished: '会议已结束'
};

function enterMeeting() {
    window.open(`/meeting/${props.mid}`);
}

async function updateResponse(nextResponse: UserResponse) {
    if (nextResponse === response.value) return;
    await axiosInstance.put(`/meetings/${props.mid}/response`, { response: nextResponse });
    await getDetail();
}
</script>

<style scoped lang="scss">
.ant-btn {
    height: auto;
    text-align: start;

    .ellipsis-overflow {
        overflow: hidden;
        text-overflow: ellipsis;
    }
}

.attendee-wrapper {
    flex-direction: column;
}
</style>
