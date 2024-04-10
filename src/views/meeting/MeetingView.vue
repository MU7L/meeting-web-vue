<template>
    <el-container>
        <el-header>Header</el-header>
        <el-main>
            <PeerBox
                v-for="streamInfo in streamInfoList"
                :key="streamInfo.i"
                :id="streamInfo.id"
                :srcObject="streamInfo.stream"
                autoplay
            />
        </el-main>
    </el-container>
    <el-affix position="bottom">
        <ControlBar @user-media="handleUserMedia" />
    </el-affix>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
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

function handleUserMedia(stream?: MediaStream) {
    peerMap.value.set(id, {
        id,
        streams: stream ? [stream] : []
    });
}
</script>
