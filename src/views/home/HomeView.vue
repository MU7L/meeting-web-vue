<template>
    <a-layout>
        <a-layout-header>
            <a-menu
                v-model:selectedKeys="selectedKeys"
                theme="dark"
                mode="horizontal"
            >
                <a-menu-item key="calendar">会议</a-menu-item>
                <a-menu-item key="team">项目组</a-menu-item>
            </a-menu>
        </a-layout-header>
        <a-layout-content>
            <RouterView />
        </a-layout-content>
    </a-layout>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { RouterView } from 'vue-router';
// TODO: 路由

const selectedKeys = ref<string[]>(['calendar']);
</script>

<style scoped lang="scss">
.ant-layout-header {
    position: fixed;
    z-index: 1;
    width: 100%;
    height: 64px;

    .ant-menu-overflow {
        justify-content: center;
    }
}

.ant-layout-content {
    padding: 0 50px;
    margin-top: 64px;
}
</style>
