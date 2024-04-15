<template>
    <a-form
        :model="formState"
        name="register"
        @finish="onFinish"
        @finishFailed="onFinishFailed"
        :label-col="{ span: 8 }"
    >
    <a-form-item
            label="姓名"
            name="name"
            :rules="[
                { required: true, message: '请输入姓名' },
            ]"
        >
            <a-input v-model:value="formState.name" />
        </a-form-item>

        <a-form-item
            label="邮箱"
            name="email"
            :rules="[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '邮箱格式错误', trigger: 'blur' },
            ]"
        >
            <a-input v-model:value="formState.email" />
        </a-form-item>

        <a-form-item
            label="密码"
            name="password"
            :rules="[{ required: true, message: '请输入密码' }]"
        >
            <a-input-password v-model:value="formState.password" />
        </a-form-item>

        <a-form-item
            label="重复密码"
            name="repeatPassword"
            :rules="[{ required: true, message: '请再次输入密码' }]"
        >
            <a-input-password v-model:value="formState.repeatPassword" />
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
import { storeToRefs } from 'pinia';
import { computed, reactive } from 'vue';
import { useRouter } from 'vue-router';

import useAuthStore from '@/stores/auth';

interface FormState {
    name: string;
    email: string;
    password: string;
    repeatPassword: string;
}

const formState = reactive<FormState>({
    name: '',
    email: '',
    password: '',
    repeatPassword: '',
});

const { id, token } = storeToRefs(useAuthStore());
const router = useRouter();
const onFinish = (values: FormState) => {
    console.log('Success:', values);
    id.value = String(Date.now());
    token.value = String(Date.now());
    router.push('/');
};

const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
};

const disabled = computed(() => {
    return !Object.values(formState).reduce((prev,curr) => prev && curr);
});
</script>

<style scoped lang="scss"></style>
