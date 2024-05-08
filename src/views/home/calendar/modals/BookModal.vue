<template>
    <a-button
        type="primary"
        @click="open = true"
    >
        <template #icon>
            <PlusCircleOutlined />
        </template>
        预定会议
    </a-button>

    <a-modal
        v-model:open="open"
        title="预定会议"
    >
        <a-form
            :model="formState"
            name="addMeeting"
            :label-col="{ span: 6 }"
            :wrapper-col="{ span: 18 }"
            @finish="onFinish"
            @finishFailed="onFinishFailed"
        >
            <a-form-item
                label="会议主题"
                name="title"
            >
                <a-input v-model:value="formState.title" />
            </a-form-item>

            <a-form-item
                label="会议简介"
                name="description"
            >
                <a-textarea v-model:value="formState.description" />
            </a-form-item>

            <a-form-item
                label="会议时间"
                name="range"
            >
                <a-range-picker
                    v-model="formState.range"
                    :disabled-date="disabledDate"
                    :disabled-time="disabledTime"
                    :show-time="{
                        hideDisabledOptions: true,
                    }"
                    format="M月D日 HH:mm"
                    :placeholder="['开始时间', '结束时间']"
                />
            </a-form-item>

            <a-form-item
                label="关联课题组"
                name="teamId"
            >
                <a-select
                    v-model:value="formState.teamId"
                    mode="multiple"
                >
                    <a-select-option
                        v-for="team of teams"
                        :key="team.id"
                    >
                        {{ team.name }}
                    </a-select-option>
                </a-select>
            </a-form-item>
        </a-form>
    </a-modal>
</template>

<script setup lang="ts">
import { PlusCircleOutlined } from '@ant-design/icons-vue';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { storeToRefs } from 'pinia';
import { reactive, ref } from 'vue';

import useAuthStore from '@/stores/auth';

const open = ref<boolean>(false);

interface FormState {
    title: string;
    description: string;
    range: [Dayjs, Dayjs];
    teamId: string[];
}

const { id, profile } = storeToRefs(useAuthStore());
const formState = reactive<FormState>({
    title: profile.value.name + '预定的会议',
    description: '',
    range: [dayjs(), dayjs().add(1, 'hour')],
    teamId: [],
});

const teams = [
    { id: '1', name: 'team1' },
    { id: '2', name: 'team2' },
    { id: '3', name: 'team3' },
];
//  TODO: 表单验证提交
const onFinish = (values: any) => {
    console.log('Success:', values);
};

const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
};

// 不可选日期
const disabledDate = (current: Dayjs) => {
    return current && current.isBefore(undefined, 'day');
};

function range(from: number, to: number) {
    return Array.from({ length: to - from + 1 }, (_, i) => from + i);
}
// 不可选时间
const disabledTime = (current: Dayjs) => {
    const now = dayjs();
    return {
        disabledHours: () => range(0, now.hour() - 1),
        disabledMinutes: () =>
            current && current.hour() === now.hour()
                ? range(0, now.minute())
                : [],
    };
};
</script>
