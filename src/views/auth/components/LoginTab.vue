<template>
    <a-form
        :model="formState"
        name="login"
        @finish="onFinish"
        @finishFailed="onFinishFailed"

    >
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
    email: string;
    password: string;
}

const formState = reactive<FormState>({
    email: '',
    password: '',
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
