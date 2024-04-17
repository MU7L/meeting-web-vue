<template>
    <a-layout>
        <a-layout-header>
            <a-menu
                v-model:selectedKeys="selectedKeys"
                theme="dark"
                mode="horizontal"
            >
            <a-submenu key="/profile">
                <a-menu-item key="/calendar">
                    <RouterLink to="/calendar">会议</RouterLink>
                </a-menu-item>
            </a-submenu>
                <a-menu-item key="/calendar">
                    <RouterLink to="/calendar">会议</RouterLink>
                </a-menu-item>
                <a-menu-item key="/team">
                    <RouterLink to="/team">项目组</RouterLink>
                </a-menu-item>
            </a-menu>
        </a-layout-header>
        <a-layout-content>
            <RouterView />
        </a-layout-content>
    </a-layout>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { RouterLink, RouterView, useRoute } from 'vue-router';

const route = useRoute();
const selectedKeys = ref<string[]>([route.fullPath]);
</script>

<style scoped lang="scss">
.ant-layout-header {
    position: fixed;
    z-index: 1;
    width: 100%;
    height: 64px;
}

.ant-layout-content {
    padding: 24px 50px;
    margin-top: 64px;
}
</style>
