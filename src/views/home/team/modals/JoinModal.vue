<template>
    <a-button type="primary" @click="open=true">
        <template #icon>
            <UsergroupAddOutlined />
        </template>
        加入课题组
    </a-button>
    <a-modal v-model:open="open" title="加入课题组" :footer="null">
        <a-space-compact block>
            <a-select class="query-key" v-model:value="query.key" :options="options" />
            <a-input-search
                v-model:value="query.value"
                enter-button
                @search="onSearch"
                :loading="loading"
            />
        </a-space-compact>

        <a-list
            item-layout="horizontal"
            :data-source="list"
        >
            <template #renderItem="{ item }:{item:Team}">
                <a-list-item>
                    <a-list-item-meta
                        :description="item.description"
                    >
                        <template #title>
                            {{item.name}}
                            <AvatarName v-bind="item.mentor" />
                        </template>
                    </a-list-item-meta>

                    <template #actions>
                        <a-button type="link" @click="join(item._id)">申请加入</a-button>
                    </template>
                </a-list-item>
            </template>
        </a-list>
    </a-modal>
</template>

<script setup lang="ts">
import AvatarName from '@/components/AvatarName.vue';
import axiosInstance, { type ResponseData } from '@/utils/axios';
import { UsergroupAddOutlined } from '@ant-design/icons-vue';
import { message, type SelectProps } from 'ant-design-vue';
import { reactive, ref } from 'vue';

const open = ref(false);
const loading = ref(false);

const options = ref<SelectProps['options']>([
    {
        value: 'tid',
        label: '课题组id'
    },
    {
        value: 'name',
        label: '课题组名'
    },
    {
        value: 'mentorName',
        label: '课题组导师姓名'
    },
    {
        value: 'mentorEmail',
        label: '课题组导师邮箱'
    }
]);

const query = reactive<{
    key: string,
    value: string
}>({
    key: 'tid',
    value: ''
});

type Team = {
    _id: string;
    name: string,
    description: string,
    mentor: {
        _id: string;
        name: string;
        email: string;
        avatar: string;
    }
}

const list = ref<Team[]>([]);

async function onSearch() {
    const res = await axiosInstance.get<ResponseData<Team[]>>(
        '/teams',
        { params: { [query.key]: query.value } }
    );
    list.value = res.data.data;
}

async function join(tid: string) {
    const res = await axiosInstance.post<ResponseData>(`/teams/${tid}/join`);
}

</script>

<style lang="scss" scoped>
.query-key {
    width: 180px;
}

.ant-list {
    overflow-y: auto;
}

:deep(.ant-list-item-meta-title) {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
</style>
