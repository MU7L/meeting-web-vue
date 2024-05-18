<template>
    <a-layout>
        <a-typography-title class="header-btn">
            今天是 {{ dayjs().format('YYYY年M月D日') }}
            <a-space>
                <BookModal @refresh="getMeetings" />
                <a-button
                    type="primary"
                    @click="handleQuickMeeting"
                >
                    <template #icon>
                        <VideoCameraOutlined />
                    </template>
                    快速会议
                </a-button>
            </a-space>
        </a-typography-title>

        <a-card>
            <a-calendar v-model:value="selectedDate">
                <template #dateCellRender="{ current }: { current: Dayjs }">
                    <a-timeline>
                        <a-timeline-item
                            v-for="m in meetings.filter(item =>
                                current.isSame(item.start, 'day'),
                            )"
                            :key="m._id"
                            :color="StatusColorMap[m.status]"
                        >
                            <template #dot>
                                <ClockCircleOutlined
                                    v-if="m.status === 'pending'"
                                />
                                <QuestionCircleOutlined
                                    v-else-if="m.status === 'ongoing'"
                                />
                                <CheckCircleOutlined
                                    v-else-if="m.status === 'finished'"
                                />
                            </template>
                            <DetailModal v-bind="m" />
                        </a-timeline-item>
                    </a-timeline>
                </template>
            </a-calendar>
        </a-card>
    </a-layout>
</template>

<script lang="ts" setup>
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    QuestionCircleOutlined,
    VideoCameraOutlined
} from '@ant-design/icons-vue';
import dayjs, { Dayjs } from 'dayjs';
import { storeToRefs } from 'pinia';
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import useAuthStore from '@/stores/auth';
import type { MeetingInfo, MeetingStatus } from '@/types';
import type { ResponseData } from '@/utils/axios';
import axiosInstance from '@/utils/axios';

import BookModal from './modals/BookModal.vue';
import DetailModal from './modals/DetailModal.vue';

const selectedDate = ref<Dayjs>(dayjs());
const selectedRange = computed<[Dayjs, Dayjs]>(() => {
    const from = selectedDate.value.startOf('month').startOf('week');
    const to = from.add(41, 'day');
    return [from, to];
});

const meetings = ref<MeetingInfo[]>([]);
const { id } = storeToRefs(useAuthStore());

async function getMeetings() {
    const [from, to] = selectedRange.value.map(d => d.format());
    const res = await axiosInstance.get<ResponseData<MeetingInfo<string>[]>>(`/users/${id.value}/meetings`, {
        params: { from, to }
    });
    meetings.value = res.data.data.map(item => ({
        ...item,
        start: dayjs(item.start),
        end: dayjs(item.end)
    }));
}

watch(selectedRange, getMeetings);
onMounted(getMeetings);

const StatusColorMap: Record<MeetingStatus, string> = {
    pending: 'gray',
    ongoing: 'blue',
    finished: 'green'
};

const router = useRouter();
async function handleQuickMeeting() {
    const res =
        await axiosInstance.post<ResponseData<{ mid: string }>>('/meetings');
    const url = router.resolve({
        name: 'meeting',
        params: { mid: res.data.data.mid }
    })
    window.open(url.href);
}

</script>

<style scoped lang="scss">
.header-btn {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
}

:deep(.ant-picker-calendar-mode-switch) {
    display: none;
}

:deep(tr) {
    vertical-align: top;

    .ant-picker-calendar-date-content {
        min-height: 86px;
        height: auto !important;
        padding: 8px;
    }
}


:deep(.ant-timeline-item-head-custom) {
    margin-top: 4px;
    background: transparent;
}
</style>
