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
            :wrapper-col="{span: 18}"
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
                name="start"
            >
                <a-range-picker
                    :show-time="{ format: 'HH:mm' }"
                    format="YYYY-MM-DD HH:mm"
                    :placeholder="['开始时间', '结束时间']"
                    @ok="handleRangeOk"
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
    start: Dayjs;
    end: Dayjs;
    teamId: string[];
}

const { id, name } = storeToRefs(useAuthStore());
const formState = reactive<FormState>({
    title: name.value + '预定的会议',
    description: '',
    start: dayjs(),
    end: dayjs(),
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

function handleRangeOk(dates: [Dayjs, Dayjs] | [string, string]) {
    const [start, end] = dates.map(dayjs);
    formState.start = start;
    formState.end = end;
    console.log(formState);
}
</script>
