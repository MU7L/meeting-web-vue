<template>
    <a-layout>
        <a-space>
            <JoinModal />
            <CreateModal @refresh="queryTeams" />
        </a-space>

        <a-card>
            <a-layout>
                <a-layout-sider>
                    <a-menu v-model:selectedKeys="selectedKeys"
                        theme="light">
                        <a-menu-item
                            v-for="team of teams"
                            :key="team._id"
                        >
                            {{ team.name }}
                        </a-menu-item>
                    </a-menu>
                </a-layout-sider>

                <a-layout-content class="container"
                    v-if="selectedKeys.length > 0">
                    <a-typography>
                        <a-typography-title>{{ selectedTeam?.name }}</a-typography-title>
                        <a-typography-paragraph>{{ selectedTeam?.description }}</a-typography-paragraph>
                    </a-typography>

                    <a-table :dataSource="selectedTeam?.members"
                        :columns="memberColumns">
                        <template #bodyCell="{ column, record }: { column: any, record: Member}">
                            <template v-if="column.key === 'role'">
                                {{ StatusMap[record.status] }}
                            </template>
                            <template v-else-if="column.key === 'name'">
                                <AvatarProfile class="adjust-table-cell"
                                    v-bind="record.user" />
                            </template>
                            <template v-else-if="column.key === 'email'">
                                <a-button type="link"
                                    class="adjust-table-cell"
                                    @click="copy(record.user.email)">
                                    {{ record.user.email }}
                                </a-button>
                            </template>
                            <template v-else-if="column.key === 'datetime'">
                                {{
                                    dayjs(record.status === 'new' ? record.createdAt : record.updatedAt).format('YYYY年M月D日')
                                }}
                            </template>
                            <template v-else-if="column.key === 'operation'">
                                <a-button
                                    v-for="(op, index) in getOperation(record)"
                                    :key="index"
                                    v-bind="op"
                                    class="adjust-table-cell"
                                    type="link"
                                >
                                    {{ op.content }}
                                </a-button>
                            </template>
                        </template>
                    </a-table>
                </a-layout-content>
            </a-layout>
        </a-card>
    </a-layout>
</template>

<script setup lang="ts">
import AvatarProfile from '@/components/AvatarName.vue';
import useAuthStore from '@/stores/auth';
import axiosInstance, { type ResponseData } from '@/utils/axios';
import { message } from 'ant-design-vue';
import dayjs from 'dayjs';
import { storeToRefs } from 'pinia';
import { computed, onMounted, ref } from 'vue';

import CreateModal from './modals/CreateModal.vue';
import JoinModal from './modals/JoinModal.vue';

const { id } = storeToRefs(useAuthStore());

const StatusMap: Record<string, string> = {
    mentor: '导师',
    member: '成员',
    new: '新成员'
};

type Member = {
    user: {
        _id: string;
        name: string;
        email: string;
        avatar?: string;
    };
    status: keyof typeof StatusMap;
    createdAt: string;
    updatedAt: string;
}

type Team = {
    _id: string;
    name: string;
    description?: string;
    mentor: User;
    members: Member[];
}

const teams = ref<Team[]>();

type Operation = {
    content: string;
    danger?: boolean;
    onClick: () => void;
}

function getOperation(record: Member): Operation[] {
    if (isMentor.value) {
        switch (record.status) {
            case 'mentor':
                return [{
                    danger: true,
                    content: '解散课题组',
                    onClick: () => {}
                }];
            case 'member':
                return [{
                    danger: true,
                    content: '移除成员',
                    onClick: () => {}
                }];
            case 'new':
                return [{
                    content: '同意加入',
                    onClick: () => {}
                }];
        }
    } else if (record.user._id === id.value) {
        return [{
            danger: true,
            content: '退出课题组',
            onClick: () => {}
        }];
    }
    return [];
}

async function queryTeams() {
    const res = await axiosInstance.get<ResponseData<(Team)[]>>(`/users/${id.value}/teams`);
    teams.value = res.data.data;
}

onMounted(async () => {
    await queryTeams();
    const firstTeam = teams.value?.[0];
    if (firstTeam) selectedKeys.value = [firstTeam._id];
});

const selectedKeys = ref<string[]>([]);
const selectedTeam = computed<Team | undefined>(() => {
    return teams.value?.find((team) => team._id === selectedKeys.value[0]);
});
const isMentor = computed<boolean>(() => {
    return selectedTeam.value?.mentor._id === id.value;
});

const memberColumns = [{
    title: '身份',
    key: 'role'
}, {
    title: '成员',
    key: 'name'
}, {
    title: '邮箱',
    dataIndex: 'email',
    key: 'email'
}, {
    title: '加入时间',
    key: 'datetime'
}, {
    title: '操作',
    key: 'operation'
}];

function copy(text: string) {
    navigator.clipboard.writeText(text);
    message.success('复制成功');
}

</script>

<style scoped lang="scss">
.ant-space {
    margin-bottom: 19px;
    justify-content: end;
}

.ant-menu {
    height: 100%;
}

.container {
    padding: 24px;
    border-radius: 8px;
}

.adjust-table-cell {
    margin-left: -16px;
}
</style>
