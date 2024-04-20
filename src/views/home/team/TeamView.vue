<template>
    <a-layout>
        <a-card>
            <a-layout>
                <a-layout-sider>
                    <a-menu mode="inline">
                        <a-sub-menu
                            v-for="team of teams"
                            :key="team.id"
                            :title="team.name"
                        >
                            <a-menu-item :key="'teams/' + team.id">
                                详情
                            </a-menu-item>
                            <a-menu-item
                                v-for="member of team.members"
                                :key="'/users' + member.id"
                            >
                                {{ member.name }}
                            </a-menu-item>
                        </a-sub-menu>
                    </a-menu>
                </a-layout-sider>
                <a-layout-content><RouterView /></a-layout-content>
            </a-layout>
        </a-card>
    </a-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { RouterView } from 'vue-router';

const teams = ref([
    {
        id: '1',
        name: '课题组1',
        avatar: '1',
        members: [
            {
                id: '1',
                name: '人1',
                avatar: '1',
            },
        ],
    },
]);
</script>
