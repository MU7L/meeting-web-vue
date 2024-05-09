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
        @ok="handleOk"
    >
        <a-form
            ref="formRef"
            :model="formState"
            name="addMeeting"
            :rules="rules"
            :label-col="{ span: 6 }"
            :wrapper-col="{ span: 18 }"
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
                    v-model:value="formState.range"
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
                        :key="team._id"
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
import type { FormInstance } from 'ant-design-vue';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { storeToRefs } from 'pinia';
import { onMounted, reactive, ref } from 'vue';

import useAuthStore from '@/stores/auth';
import axiosInstance, { type ResponseData } from '@/utils/axios';

const emit = defineEmits<{
    refresh:[]
}>();

const open = ref<boolean>(false);

const formRef = ref<FormInstance>();

interface FormState {
    title: string;
    description: string;
    range: [Dayjs, Dayjs];
    teamId: string[];
}
const store = useAuthStore();
const { id, profile } = storeToRefs(store);
onMounted(async () => {
    await store.getProfile()
    formState.title = `${profile.value.name} 预定的会议`;
});

const formState = reactive<FormState>({
    title: '',
    description: '',
    // TODO: 取值赋值有问题
    range: [dayjs().add(1, 'hour'), dayjs().add(2, 'hour')],
    teamId: []
});

const rules = {
    title: [
        {
            required: true,
            message: '请输入会议主题',
            trigger: 'blur'
        }
    ],
    range: [
        {
            required: true,
            message: '请选择会议时间',
            trigger: 'change'
        }
    ],
    teamId: [
        {
            required: true,
            message: '请选择关联课题组',
            trigger: 'change'
        }
    ]
};

async function handleOk() {
    await formRef.value?.validate();
    const data = {
        title: formState.title,
        description: formState.description,
        start: formState.range[0].format(),
        end: formState.range[1].format(),
        teams: formState.teamId
    }
    await axiosInstance.post('/meetings', data);
    open.value = false;
    emit('refresh');
}

type Team = {
    _id: string;
    name: string;
}
const teams = ref<Team[]>([]);
onMounted(async () => {
    const res = await axiosInstance.get<ResponseData<Team[]>>(`/users/${id.value}/teams`);
    teams.value = res.data.data;
});

// 不可选日期
const disabledDate = (current: Dayjs) => {
    return current && current.isBefore(undefined, 'day');
};

// 不可选时间
const disabledTime = (current: Dayjs) => {
    function range(from: number, to: number) {
        return Array.from({ length: to - from + 1 }, (_, i) => from + i);
    }

    const now = dayjs();
    return {
        disabledHours: () => range(0, now.hour() - 1),
        disabledMinutes: () =>
            current && current.hour() === now.hour()
                ? range(0, now.minute())
                : []
    };
};
</script>
