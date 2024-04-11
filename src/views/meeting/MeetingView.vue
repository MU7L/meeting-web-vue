<template>
    <a-layout>
        <a-layout-header class="fixed">Header</a-layout-header>
        <a-layout-content>Content</a-layout-content>
        <a-layout-footer>Footer</a-layout-footer>
    </a-layout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import ControlBar from './components/ControlBar.vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import createSocket from '@/utils/socket';
import Peer from '@/utils/peer';
import PeerBox from './components/PeerBox.vue';

const route = useRoute();
const meetingId = route.params.meetingId as string;
const { id, token } = useAuthStore();

const peerMap = ref<Map<string, Peer>>(new Map());
onMounted(() => {
    peerMap.value.set(id, { id, streams: [] });
});

interface StreamInfo {
    i: string;
    id: string;
    stream?: MediaStream;
}
const streamInfoList = computed<StreamInfo[]>(() => {
    return Array.from(peerMap.value.values()).flatMap(({ id, streams }) => {
        if (streams.length === 0) {
            return {
                i: id,
                id: id
            };
        }
        return streams.map((stream) => {
            return {
                i: stream.id,
                id: id,
                stream
            };
        });
    });
});

const socket = createSocket(id, token);

/** 创建Peer */
function createPeer(id: string) {
    const peer = new Peer(id);
    peer.pc?.addEventListener('icecandidate', (e) => {
        if (e.candidate) socket.emit('candidate', e.candidate, id);
    });
    peer.pc?.addEventListener('negotiationneeded', () => negotiate(peer));
    peerMap.value.set(id, peer);
    return peer;
}

/** 协商 */
function negotiate({ id, pc }: Peer) {
    pc?.createOffer().then((offer) => {
        pc.setLocalDescription(offer);
        socket.emit('offer', offer, id);
    });
}

socket
    // 新用户加入房间 与老用户创建Peer
    .on('connect', () => {
        socket.emit('join', meetingId, (idList) => {
            idList.forEach((id) => {
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

const videoRef = ref<HTMLVideoElement>();
function handleUserMedia(stream?: MediaStream) {
    if (videoRef.value && stream) {
        videoRef.value.srcObject = stream;
        console.log('stream', stream);
    }
    peerMap.value.set(id, {
        id,
        streams: stream ? [stream] : []
    });
    console.log('handleUserMedia', peerMap.value.get(id));
    console.log('streamInfoList', streamInfoList.value);
}
</script>

<style scoped lang="scss">
.fixed {
    position: 'fixed';
    z-index: 1;
    width: '100%';
}
</style>
