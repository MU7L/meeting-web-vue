<template>
    <a-layout>
        <a-space>
            <JoinModal />
            <CreateModal @refresh="queryTeams" />
        </a-space>

        <a-card>
            <a-layout>
                <a-layout-sider>
                    <a-menu
                        v-model:selectedKeys="selectedTidList"
                        theme="light"
                    >
                        <a-menu-item
                            v-for="team of teams"
                            :key="team._id"
                        >
                            {{ team.name }}
                        </a-menu-item>
                    </a-menu>
                </a-layout-sider>

                <a-layout-content class="container"
                    v-if="selectedTidList.length > 0">
                    <a-typography>
                        <a-typography-title>{{ selectedTeam?.name }}</a-typography-title>
                        <a-typography-paragraph>{{ selectedTeam?.description }}</a-typography-paragraph>
                    </a-typography>

                    <a-table :dataSource="selectedTeam?.members"
                        :columns="memberColumns">
                        <template #bodyCell="{ column, record }: { column: any, record: Member}">
                            <template v-if="column.key === 'type'">
                                {{ StatusMap[record.type] }}
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
                                    dayjs(record.type === 'new' ? record.createdAt : record.updatedAt).format('YYYY年M月D日')
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
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { message, Modal } from 'ant-design-vue';
import dayjs from 'dayjs';
import { storeToRefs } from 'pinia';
import { computed, createVNode, onMounted, ref } from 'vue';

import AvatarProfile from '@/components/AvatarName.vue';
import useAuthStore from '@/stores/auth';
import type { Member, MemberType, Team } from '@/types';
import axiosInstance, { type ResponseData } from '@/utils/axios';

import CreateModal from './modals/CreateModal.vue';
import JoinModal from './modals/JoinModal.vue';

const { id } = storeToRefs(useAuthStore());

const StatusMap: Record<MemberType, string> = {
    mentor: '导师',
    member: '成员',
    new: '新成员'
};

const teams = ref<Team[]>();

type Operation = {
    content: string;
    danger?: boolean;
    onClick: () => void;
}

function getOperation(record: Member): Operation[] {
    if (isMentor.value) {
        switch (record.type) {
            case 'mentor':
                return [{
                    danger: true,
                    content: '解散课题组',
                    onClick: dissolveTeam
                }];
            case 'member':
                return [{
                    danger: true,
                    content: '移除成员',
                    onClick: () => {
                        removeMember(record);
                    }
                }];
            case 'new':
                return [{
                    content: '同意加入',
                    onClick: () => {
                        acceptJoin(record);
                    }
                }];
        }
    } else if (record.user._id === id.value) {
        return [{
            danger: true,
            content: '退出课题组',
            onClick: quitTeam
        }];
    }
    return [];
}

async function queryTeams() {
    const res = await axiosInstance.get<ResponseData<Team[]>>(`/users/${id.value}/teams`);
    teams.value = res.data.data;
}

onMounted(async () => {
    await queryTeams();
    const firstTeam = teams.value?.[0];
    if (firstTeam) selectedTidList.value = [firstTeam._id];
});

const selectedTidList = ref<string[]>([]);
const selectedTeam = computed<Team | undefined>(() => {
    return teams.value?.find((team) => team._id === selectedTidList.value[0]);
});
const isMentor = computed<boolean>(() => {
    return selectedTeam.value?.mentor._id === id.value;
});

const memberColumns = [{
    title: '身份',
    key: 'type'
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

async function dissolveTeam() {
    const tid = selectedTeam.value?._id;
    Modal.confirm({
        title: '确定解散课题组？',
        icon: createVNode(ExclamationCircleOutlined),
        async onOk() {
            await axiosInstance.delete(`/teams/${tid}`);
            await queryTeams();
        },
        okType: 'danger',
    });
}

async function removeMember(record: Member) {
    const tid = selectedTeam.value?._id;
    const uid = record.user._id;
    Modal.confirm({
        title: '确定踢出该成员？',
        icon: createVNode(ExclamationCircleOutlined),
        async onOk() {
            await axiosInstance.delete(`/teams/${tid}/members/${uid}`);
            await queryTeams();
        },
        okType: 'danger',
    });
}

async function acceptJoin(record: Member) {
    const tid = selectedTeam.value?._id;
    const uid = record.user._id;
    if (tid) {
        await axiosInstance.post(`/teams/${tid}/members`, { uid });
        await queryTeams();
    }
}

async function quitTeam() {
    const tid = selectedTeam.value?._id;
    Modal.confirm({
        title: '确定退出该课题组？',
        icon: createVNode(ExclamationCircleOutlined),
        async onOk() {
            await axiosInstance.delete(`/teams/${tid}/members/${id.value}`);
            await queryTeams();
        },
        okType: 'danger',
    });
}

</script>

<style scoped
    lang="scss">
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
