<template>
    <a-layout>
        <a-typography-title>
            今天是 {{ dayjs().format('YYYY年M月D日') }}
            <a-space>
                <BookModal />
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
                            v-for="d of data.data.filter(d =>
                                current.isSame(d.start, 'day'),
                            )"
                            :key="d.id"
                            :color="statusColorMap[d.status]"
                        >
                            <template #dot>
                                <CheckCircleOutlined
                                    v-if="d.response === 'accepted'"
                                />
                                <QuestionCircleOutlined
                                    v-else-if="d.response === 'pending'"
                                />
                                <CloseCircleOutlined
                                    v-else-if="d.response === 'rejected'"
                                />
                            </template>
                            <DetailModal v-bind="d" />
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
    CloseCircleOutlined,
    QuestionCircleOutlined,
    VideoCameraOutlined,
} from '@ant-design/icons-vue';
import dayjs, { Dayjs } from 'dayjs';
import { computed, ref } from 'vue';

import type { ResponseData } from '@/utils/axios';
import axiosInstance from '@/utils/axios';

import BookModal from './modals/BookModal.vue';
import DetailModal, {
    type Props as CalendarDetailProps,
} from './modals/DetailModal.vue';

const selectedDate = ref<Dayjs>(dayjs());
const queryRange = computed<{ from: Dayjs; to: Dayjs }>(() => {
    const from = selectedDate.value.startOf('month').startOf('week');
    const to = from.add(41, 'day');
    return { from, to };
});

const statusColorMap: Record<CalendarDetailProps['status'], string> = {
    scheduled: 'gray',
    ongoing: 'blue',
    completed: 'green',
};

const data = ref<ResponseData<CalendarDetailProps[]>>({
    success: true,
    data: [
        {
            id: '1',
            title: 'title',
            start: dayjs(),
            status: 'ongoing',
            response: 'accepted',
        },
    ],
});

async function handleQuickMeeting() {
    const res =
        await axiosInstance.post<ResponseData<{ mid: string }>>('/meetings');
    window.open(`/meetings/${res.data.data.mid}`);
}
</script>

<style scoped lang="scss">
.ant-typography {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
}

:deep(.ant-picker-calendar-mode-switch) {
    display: none;
}

:deep(
        .ant-picker-calendar.ant-picker-calendar-full
            .ant-picker-calendar-date-content
    ) {
    padding: 8px;
    min-height: 86px;
    height: auto;
}

:deep(.ant-timeline-item-head-custom) {
    background: transparent;
}
</style>
