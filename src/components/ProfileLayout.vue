<template>
    <a-layout>
        <a-layout-header>
            <slot name="header" />
            <a-dropdown>
                <AvatarName v-bind="profile" class="avatar-name" />
                <template #overlay>
                    <a-menu @click="handleClick">
                        <a-menu-item key="settings">
                            <template #icon>
                                <SettingOutlined />
                            </template>
                            设置
                        </a-menu-item>
                        <a-menu-item key="logout">
                            <template #icon>
                                <LogoutOutlined />
                            </template>
                            退出
                        </a-menu-item>
                    </a-menu>
                </template>
            </a-dropdown>
        </a-layout-header>
        <a-layout-content>
            <slot />
        </a-layout-content>
    </a-layout>
</template>

<script lang="ts" setup>
import { LogoutOutlined, SettingOutlined } from '@ant-design/icons-vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';

import AvatarName from '@/components/AvatarName.vue';
import useAuthStore from '@/stores/auth';

const store = useAuthStore();
const { profile } = storeToRefs(store);

store.getProfile();

const router = useRouter();
function handleClick({key}:{key:string}) {
    switch (key) {
        case 'settings':
            break;
        case 'logout':
            store.$reset();
            router.push('/auth');
            break;
    }
}
</script>

<style scoped lang="scss">
.ant-layout-header {
    position: fixed;
    width: 100%;
    height: 64px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .avatar-name {
        height: auto;
        display: flex;
        align-items: center;
        color: rgba(255, 255, 255, 0.65);

        > *:not(:last-child) {
            margin-right: 8px;
        }
    }
}

.ant-layout-content {
    padding: 24px 50px;
    margin-top: 64px;
}
</style>
