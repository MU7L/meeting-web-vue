<template>
    <a-button
        type="text"
        @click="open = true"
        block
    >
        {{ $props.start.format('H:mm') }}<br />
        {{ $props.title }}
    </a-button>

    <a-modal
        v-model:open="open"
        title="会议详情"
    >
        <a-descriptions :title="$props.title">
            <template #extra>
                <a-button type="link" :disabled="$props.status !== 'ongoing'">
                    {{ enterButtonContent[$props.status] }}
                </a-button>
            </template>
            <a-descriptions-item label="开始时间">
                {{ $props.start.format('M月d日 dddd H:mm') }}
            </a-descriptions-item>
            <a-descriptions-item label="主持人">
                Zhou Maomao
            </a-descriptions-item>
            <a-descriptions-item label="课题组">
                Zhou Maomao
            </a-descriptions-item>
            <a-descriptions-item label="参会人员">
                Zhou Maomao
            </a-descriptions-item>
        </a-descriptions>
        <template #footer>
            <a-button :type="$props.response === 'accepted' ? 'primary' : 'default'">
                <template #icon>
                    <CheckCircleOutlined />
                </template>
                接受
            </a-button>
            <a-button :type="$props.response === 'pending' ? 'primary' : 'default'">
                <template #icon>
                    <QuestionCircleOutlined />
                </template>
                暂定
            </a-button>
            <a-button :type="$props.response === 'rejected' ? 'primary' : 'default'">
                <template #icon>
                    <CloseCircleOutlined />
                </template>
                拒绝
            </a-button>
        </template>
    </a-modal>
</template>

<script lang="ts" setup>
import { CheckCircleOutlined, CloseCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons-vue';
import type { Dayjs } from 'dayjs';
import { ref } from 'vue';

export interface Props {
    id: string;
    title: string;
    start: Dayjs;
    status: 'scheduled' | 'ongoing' | 'completed';
    response: 'pending' | 'accepted' | 'rejected';
}

const props = defineProps<Props>();

const open = ref<boolean>(false);

const enterButtonContent: Record<Props['status'], string> = {
    completed: '会议已结束',
    ongoing: '进入会议',
    scheduled: '会议未开始'
};
</script>

<style scoped lang="scss">
.ant-btn {
    height: auto;
    text-align: start;
}
</style>
