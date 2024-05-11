<template>
    <a-layout>
        <a-layout-header>
            <!-- 神奇，为什么float元素放前面就不会自动换行 -->
            <a-dropdown class="float-right">
                <AvatarName v-bind="profile" />
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
            <slot name="header" />
        </a-layout-header>
        <a-layout-content>
            <slot />
        </a-layout-content>
    </a-layout>
</template>

<script lang="ts" setup>
import { LogoutOutlined, SettingOutlined } from '@ant-design/icons-vue';
import { storeToRefs } from 'pinia';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

import AvatarName from '@/components/AvatarName.vue';
import useAuthStore from '@/stores/auth';

const store = useAuthStore();
const { profile } = storeToRefs(store);

onMounted(store.getProfile);

const router = useRouter();

function handleClick({ key }: { key: string }) {
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
.ant-layout {
    height: 100%;

    .ant-layout-header {
        color: rgba(255, 255, 255, 0.65);

        .float-right {
            float: right;
        }
    }

    .ant-layout-content {
        padding: 24px 50px;
        overflow-y: auto;
    }
}


</style>
