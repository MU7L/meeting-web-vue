<template>
    <a-button @click="open=true">
        <template #icon>
            <PlusCircleOutlined />
        </template>
        创建课题组
    </a-button>

    <a-modal v-model:open="open" title="创建课题组" @ok="handleOk">
        <a-form
            ref="formRef"
            :model="formState"
            :label-col="{ span: 3 }"

        >
            <a-form-item
                label="组名"
                name="name"
                :rules="[{ required: true, message: '请输入组名' }]"
            >
                <a-input v-model:value="formState.name" />
            </a-form-item>

            <a-form-item
                label="简介"
                name="description"
            >
                <a-textarea v-model:value="formState.description" />
            </a-form-item>
        </a-form>
    </a-modal>
</template>

<script setup lang="ts">
import { PlusCircleOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import {type FormInstance} from 'ant-design-vue/es/form'
import { reactive, ref } from 'vue';

import axiosInstance, { type ResponseData } from '@/utils/axios';

const emit = defineEmits<{
    refresh:[]
}>();

const open = ref(false);
const formRef = ref<FormInstance>();

async function handleOk() {
    await formRef.value?.validate();
    const res = await axiosInstance.post<ResponseData>('/teams', formState);
    console.log(res.data);
    message.success(res.data.message);
    open.value = false;
    emit('refresh');
}

interface FormState {
    name: string;
    description: string;
}

const formState = reactive<FormState>({
    name: '',
    description: '',
});
</script>
