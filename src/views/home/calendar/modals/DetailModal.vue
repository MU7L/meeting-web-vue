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
        <MeetingDescription v-bind="detail">
            <template #extra>
                <a-button
                    type="link"
                    :disabled="detail?.status !== 'ongoing'"
                    @click="enterMeeting"
                >
                    {{ EnterButtonContent[detail?.status ?? 'pending'] }}
                </a-button>
            </template>
        </MeetingDescription>

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
import dayjs from 'dayjs';
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import MeetingDescription from '@/components/MeetingDescription.vue';
import useAuthStore from '@/stores/auth';
import type { MeetingDetail, MeetingInfo, MeetingStatus, UserResponse } from '@/types';
import axiosInstance, { type ResponseData } from '@/utils/axios';

const props = defineProps<MeetingInfo & { id: string }>();

const { id } = storeToRefs(useAuthStore());

const detail = ref<MeetingDetail>();
const response = computed<UserResponse>(() =>
    detail.value?.attendees.find(attendee => attendee.user._id === id.value)?.response ?? 'pending'
);

async function getDetail() {
    const res = await axiosInstance.get<ResponseData<MeetingDetail<string>>>('/meetings/' + props._id);
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

const router = useRouter();
function enterMeeting() {
    const url = router.resolve({
        name: 'meeting',
        params: { mid: props._id }
    })
    window.open(url.href);
}

async function updateResponse(nextResponse: UserResponse) {
    if (nextResponse === response.value) return;
    await axiosInstance.put(`/meetings/${props._id}/response`, { response: nextResponse });
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
