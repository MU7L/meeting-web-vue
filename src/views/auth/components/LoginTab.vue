<template>
    <a-form
        :model="formState"
        name="login"
        :rules="rules"
        @finish="onFinish"
    >
        <a-form-item
            label="邮箱"
            name="email"
        >
            <a-input v-model:value="formState.email" />
        </a-form-item>

        <a-form-item
            label="密码"
            name="password"
        >
            <a-input-password v-model:value="formState.password" />
        </a-form-item>

        <a-form-item>
            <a-button
                :disabled="disabled"
                type="primary"
                html-type="submit"
                block
            >
                登录
            </a-button>
        </a-form-item>
    </a-form>
</template>

<script lang="ts" setup>
import type { Rule } from 'ant-design-vue/es/form';
import { computed, reactive } from 'vue';
import { useRouter } from 'vue-router';

import useAuthStore from '@/stores/auth';
import axiosInstance, { type ResponseData } from '@/utils/axios';

interface FormState {
    email: string;
    password: string;
}

const formState = reactive<FormState>({
    email: '',
    password: '',
});

const rules: Record<string, Rule[]> = {
    email: [
        { required: true, message: '请输入邮箱' },
        { type: 'email', message: '邮箱格式错误', trigger: 'blur' },
    ],
    password: [{ required: true, message: '请输入密码' }],
};

const store = useAuthStore();
const router = useRouter();

const onFinish = async (values: FormState) => {
    const res = await axiosInstance.post<
        ResponseData<{
            id: string;
            token: string;
        }>
    >('/users/login', values);
    store.$patch({
        id: res.data.data.id,
        token: res.data.data.token,
    });
    router.push('/');
};

const disabled = computed(() => {
    return !Object.values(formState).reduce((prev, curr) => prev && curr);
});
</script>
