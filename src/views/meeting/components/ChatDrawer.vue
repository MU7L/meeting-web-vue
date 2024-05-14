<template>
    <a-button
        :type="open ? 'primary' : 'default'"
        @click="openModal"
        class="enter-btn"
    >
        <a-badge :dot="hasNewMsg">
            <MessageOutlined />
        </a-badge>
        <div>聊天</div>
    </a-button>

    <a-drawer
        v-model:open="open"
        title="聊天"
    >
        <a-layout class="layout">
            <a-layout-content class="content">
                <a-list item-layout="horizontal" :data-source="sortedMessages">
                    <template #renderItem="{ item }: {item: SortedMessage}">
                        <a-list-item class="item">
                            <a-list-item-meta :description="item.content">
                                <template #title>
                                    <span>{{item.user.name}}</span>
                                    <span class="time">{{item.time.format('HH:mm')}}</span>
                                </template>
                                <template #avatar>
                                    <a-avatar :src="item.user.avatar" />
                                </template>
                            </a-list-item-meta>
                        </a-list-item>
                    </template>
                </a-list>
            </a-layout-content>
            <a-layout-footer class="footer">
                <a-space-compact block>
                    <a-input v-model:value="tmpMsg" placeholder="请输入消息" @keydown.enter="handleSend" />
                    <a-button type="primary" @click="handleSend">发送</a-button>
                </a-space-compact>
            </a-layout-footer>
        </a-layout>
    </a-drawer>
</template>

<script setup lang="ts">
import { MessageOutlined } from '@ant-design/icons-vue';
import { storeToRefs } from 'pinia';
import { ref } from 'vue';

import usePeerStore, { type SortedMessage } from '@/stores/peer';

const open = ref<boolean>(false);
const store = usePeerStore();
const {hasNewMsg ,sortedMessages} = storeToRefs(store);

function openModal() {
    open.value = true;
    store.hasNewMsg = false;
}

const tmpMsg = ref<string>('');
function handleSend() {
    store.sendMessage(tmpMsg.value);
    tmpMsg.value = '';
    console.log(sortedMessages.value);
}
</script>

<style scoped lang="scss">
.enter-btn {
    height: auto;
}

.layout {
    height: 100%;
    background-color: white;

    .content{
        overflow-y: auto;
    }

    .footer {
        padding: 0;
        margin-top: 24px;
    }
}

.item {
    padding-left: 0;
    padding-right: 0;

    .time {
        margin-left: 8px;
        color: rgba(0, 0, 0, 0.45);
    }
}
</style>
