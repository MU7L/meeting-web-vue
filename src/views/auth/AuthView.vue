<template>
    <a-layout>
        <a-card
            :tab-list="tabList"
            :active-tab-key="activeTabKey"
            @tabChange="(key: Tabs) => (activeTabKey = key)"
        >
            <Transition
                :name="activeTabKey"
                mode="out-in"
            >
                <KeepAlive>
                    <component :is="contentList[activeTabKey]" />
                </KeepAlive>
            </Transition>
        </a-card>
    </a-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import RegisterTab from '@/views/auth/components/RegisterTab.vue';

import LoginTab from './components/LoginTab.vue';

type Tabs = 'login' | 'register';
const tabList: Array<{ key: Tabs; tab: string }> = [
    {
        key: 'login',
        tab: '登录',
    },
    {
        key: 'register',
        tab: '注册',
    },
];
const contentList: Record<Tabs, any> = {
    login: LoginTab,
    register: RegisterTab,
};
const activeTabKey = ref<Tabs>('login');
</script>

<style scoped lang="scss">
.ant-layout {
    justify-content: center;
    align-items: center;

    .ant-card {
        overflow: hidden;
        :deep(.ant-tabs-nav-wrap) {
            justify-content: center;
        }
    }
}

.login-enter-active,
.login-leave-active,
.register-enter-active,
.register-leave-active {
    transition: all 0.15s ease-out;
}

.login-enter-from,
.register-leave-to {
    opacity: 0;
    transform: translateX(-50%);
}

.login-leave-to,
.register-enter-from {
    opacity: 0;
    transform: translateX(50%);
}
</style>
