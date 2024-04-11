<template>
    <a-layout>
        <a-layout-header class="fixed">Header</a-layout-header>
        <a-layout-content>
            <a-tabs
                v-model:activeKey="activeTabKey"
                centered
            >
                <a-tab-pane
                    key="layout"
                    tab="会议"
                    forceRender
                >
                    <grid-layout />
                </a-tab-pane>
                <a-tab-pane
                    key="whiteboard"
                    tab="白板"
                    forceRender
                    closeable
                >
                    <white-board />
                </a-tab-pane>
            </a-tabs>
        </a-layout-content>
        <a-layout-footer>
            <control-bar
                :disabled="false"
                @change="streamChangeHandler"
            />
        </a-layout-footer>
    </a-layout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import ControlBar from './components/ControlBar.vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import createSocket from '@/utils/socket';
import Peer from '@/utils/peer';
import GridLayout from './components/GridLayout.vue';
import WhiteBoard from './components/WhiteBoard.vue';

type ActiveTabKey = 'layout' | 'whiteboard';
const activeTabKey = ref<ActiveTabKey>('layout');

const route = useRoute();
const meetingId = route.params.meetingId as string;
const { id, token } = useAuthStore();

const peerMap = ref<Map<string, Peer>>(new Map());
onMounted(() => {
    peerMap.value.set(id, { id, streams: [] });
});

const layout = computed<Layout>(() => {
    const res: Layout = [];
    peerMap.value.forEach(peer => {
        if (peer.streams.length === 0) {
            res.push({
                i: peer.id,
                x: 0,
                y: 0,
                w: 1,
                h: 1,
                minW: 1,
                minH: 1,
                maxW: 1,
                maxH: 1,
                isDraggable: false,
                isResizable: false,
            });
        }
    });
    return res;
});

const socket = createSocket(id, token);

/** 创建Peer */
function createPeer(id: string) {
    const peer = new Peer(id);
    peer.pc?.addEventListener('icecandidate', e => {
        if (e.candidate) socket.emit('candidate', e.candidate, id);
    });
    peer.pc?.addEventListener('negotiationneeded', () => negotiate(peer));
    peerMap.value.set(id, peer);
    return peer;
}

/** 协商 */
function negotiate({ id, pc }: Peer) {
    pc?.createOffer().then(offer => {
        pc.setLocalDescription(offer);
        socket.emit('offer', offer, id);
    });
}

socket
    // 新用户加入房间 与老用户创建Peer
    .on('connect', () => {
        socket.emit('join', meetingId, idList => {
            idList.forEach(id => {
                const peer = createPeer(id);
                negotiate(peer);
            });
        });
    })
    // 老用户接收到新用户加入房间
    .on('join', createPeer)
    // 接收到offer
    .on('offer', async (offer, id) => {
        const peer = peerMap.value.get(id);
        if (!peer) return;
        await peer.pc?.setRemoteDescription(offer);
        const answer = await peer.pc?.createAnswer();
        peer.pc?.setLocalDescription(answer);
        if (answer) socket.emit('answer', answer, id);
    })
    // 接收到answer
    .on('answer', (answer, id) => {
        const peer = peerMap.value.get(id);
        if (!peer) return;
        peer.pc?.setRemoteDescription(answer);
    })
    // candidate
    .on('candidate', (candidate, id) => {
        const peer = peerMap.value.get(id);
        if (!peer) return;
        peer.pc?.addIceCandidate(candidate);
    });

function streamChangeHandler(newStream?: MediaStream, oldStream?: MediaStream) {
    const peer = peerMap.value.get(id);
    if (!peer) return;
    let localStreams = peer.streams;
    if (oldStream) {
        localStreams = localStreams.filter(
            stream => stream.id !== oldStream.id,
        );
    }
    if (newStream) {
        localStreams.push(newStream);
    }
    peerMap.value.set(id, { ...peer, streams: localStreams });
}
</script>

<style scoped lang="scss">
.fixed {
    position: 'fixed';
    z-index: 1;
    width: '100%';
}
</style>
