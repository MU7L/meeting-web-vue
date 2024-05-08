<template>
    <a-form
        ref="formRef"
        :model="formState"
        name="register"
        :rules="rules"
        @finish="onFinish"
        @finish-failed="onFinishFailed"
        :label-col="{ span: 8 }"
    >
        <a-form-item
            label="头像"
            name="avatar"
        >
            <a-upload
                name="avatar"
                list-type="picture-card"
                :show-upload-list="false"
                accept="image/*"
                :maxCount="1"
                :custom-request="customRequest"
            >
                <PlusOutlined v-if="!formState.avatar" />
                <img
                    v-else
                    class="avatar-img"
                    :src="formState.avatar"
                    alt="avatar"
                />
            </a-upload>
        </a-form-item>

        <a-form-item
            label="姓名"
            name="name"
        >
            <a-input v-model:value="formState.name" />
        </a-form-item>

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

        <a-form-item
            label="重复密码"
            name="repeatPassword"
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
                注册
            </a-button>
        </a-form-item>
    </a-form>
</template>

<script lang="ts" setup>
import { PlusOutlined } from '@ant-design/icons-vue';
import type { FormInstance, UploadProps } from 'ant-design-vue';
import type { Rule } from 'ant-design-vue/es/form';
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import useAuthStore from '@/stores/auth';
import axiosInstance, { type ResponseData } from '@/utils/axios';

const formRef = ref<FormInstance>();

interface FormState {
    avatar?: string;
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

const validatePassword = async (_rule: Rule, value: string) => {
    if (value === '') {
        return Promise.reject('请输入密码');
    } else {
        if (formState.repeatPassword !== '') {
            formRef.value?.validateFields('checkPass');
        }
        return Promise.resolve();
    }
};
const validatePassword2 = async (_rule: Rule, value: string) => {
    if (value === '') {
        return Promise.reject('请再次输入密码');
    } else if (value !== formState.password) {
        return Promise.reject('两次密码不一致');
    } else {
        return Promise.resolve();
    }
};

const rules: Record<string, Rule[]> = {
    name: [{ required: true, message: '请输入姓名' }],
    email: [
        { required: true, message: '请输入邮箱' },
        { type: 'email', message: '邮箱格式错误', trigger: 'blur' },
    ],
    password: [{ required: true, validator: validatePassword }],
    repeatPassword: [{ required: true, validator: validatePassword2 }],
};

const customRequest: UploadProps['customRequest'] = async ({ file }) => {
    const res = await axiosInstance.postForm<
        ResponseData<{
            avatar: string;
        }>
    >('/avatars', { avatar: file });
    formState.avatar = res.data.data.avatar;
};

const store = useAuthStore();
const router = useRouter();

const onFinish = async (values: FormState) => {
    const res = await axiosInstance.post<
        ResponseData<{
            id: string;
            token: string;
        }>
    >('/users', values);
    store.$patch({
        id: res.data.data.id,
        token: res.data.data.token,
    });
    router.push('/');
};

const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
};

const disabled = computed(() => {
    return !Object.values(formState).reduce((prev, curr) => prev && curr);
});
</script>

<style scoped lang="scss">
.avatar-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}
</style>
