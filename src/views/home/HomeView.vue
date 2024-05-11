<template>
    <ProfileLayout>
        <template #header>
            <a-menu
                v-model:selectedKeys="selectedKeys"
                theme="dark"
                mode="horizontal"
            >
                <a-menu-item key="/calendar">
                    <RouterLink to="/calendar">会议</RouterLink>
                </a-menu-item>
                <a-menu-item key="/team">
                    <RouterLink to="/team">课题组</RouterLink>
                </a-menu-item>
            </a-menu>
        </template>
        <RouterView />
    </ProfileLayout>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { RouterLink, RouterView, useRoute } from 'vue-router';

import ProfileLayout from '@/components/ProfileLayout.vue';

const route = useRoute();
const selectedKeys = ref<string[]>([route.fullPath]);
</script>
